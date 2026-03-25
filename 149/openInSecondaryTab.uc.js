// ==UserScript==
// @name         openInSecondaryTab.uc.js
// @description  split tab内のリンクや検索語句をSplitタブの右または左の表示領域で開く
// @charset      utf-8
// @include      main
// @async          true
// @sandbox        false
// @compatibility  Firefox 149
// @version        2026/03/25 00:00
// ==/UserScript==

openInSecondaryTab = {

  lazy: {},
  init: function() {
    ChromeUtils.defineESModuleGetters(this.lazy, {
      SearchService: "moz-src:///toolkit/components/search/SearchService.sys.mjs",
      FormHistory: "resource://gre/modules/FormHistory.sys.mjs",
    });

    this.createMenu();

		const contextMenu = document.getElementById("contentAreaContextMenu");
    contextMenu.addEventListener("popupshowing", this, false);
  },

  menuitem1: null,
  menuitem2: null,
  menuitem3: null,
	createMenu: function() {
    this.menuitem1 = document.createXULElement("menuitem");
    this.menuitem1.setAttribute("id", "context-open-link-in-secondary-tab");
    this.menuitem1.setAttribute("labeltemp", "Open Link in %t Panel");
    this.menuitem1.setAttribute("accesskey", "M");
    this.menuitem1.toggleAttribute("hidden", true);
    document.getElementById("context-openlinkinsplitview").after(this.menuitem1);

    this.menuitem2 = document.createXULElement("menuitem");
    this.menuitem2.setAttribute("id", "context-search-in-secondary-tab");
    this.menuitem2.setAttribute("labeltemp", `Search %e for "%s" in %t Panel`);
    this.menuitem2.setAttribute("accesskey", "S");
    this.menuitem2.toggleAttribute("hidden", true);
    document.getElementById("context-searchselect").after(this.menuitem2);

    this.menuitem3 = document.createXULElement("menuitem");
    this.menuitem3.setAttribute("id", "context-viewimage-in-secondary-tab");
    this.menuitem3.setAttribute("labeltemp", "Open Image in %t Panel");
    this.menuitem3.setAttribute("accesskey", "I");
    this.menuitem3.toggleAttribute("hidden", true);
    document.getElementById("context-viewimage").after(this.menuitem3);

    this.menuitem1.addEventListener("command", this, false);
    this.menuitem2.addEventListener("command", this, false);
    this.menuitem3.addEventListener("command", this, false);
	},

	handleEvent: function(event) {
    switch(event.type) {
      case "popupshowing":
        this.popupshowing(event);
        break;
      case "command":
        this.command(event);
        break;
    }
  },

  popupshowing: function(event) {
    const { activeSplitView, selectedTab } = gBrowser;
    const activeIndex = activeSplitView?.tabs.indexOf(selectedTab);

    const itemHidden = selectedTab.pinned || !activeSplitView; 
    const linkItemHidden = document.getElementById("context-openlinkintab").hidden || itemHidden;
    const searchItemHidden = document.getElementById("context-searchselect").hidden || itemHidden;
    const ImageItemHidden = document.getElementById("context-viewimage").hidden || itemHidden;

    this.menuitem1.toggleAttribute("hidden", linkItemHidden);
    this.menuitem2.toggleAttribute("hidden", searchItemHidden);
    this.menuitem3.toggleAttribute("hidden", ImageItemHidden);

    if (!linkItemHidden) {
      let label = this.menuitem1.getAttribute("labeltemp");
      this.menuitem1.setAttribute("label", label.replace("%t", activeIndex ? "Left" : "Right"));
    }
    
    if (!searchItemHidden) {
      let selectedText = (gContextMenu.isTextSelected
                      ? gContextMenu.selectionInfo.fullText
                      : undefined)
                    || gContextMenu.linkTextStr;
      if (selectedText.length > 15) {
        let truncLength = 15;
        let truncChar = selectedText[15].charCodeAt(0);
        if (truncChar >= 0xdc00 && truncChar <= 0xdfff) {
          truncLength++;
        }
        selectedText =
          selectedText.substr(0, truncLength) + Services.locale.ellipsis;
      }
      label = this.menuitem2.getAttribute("labeltemp");
      label = label.replace("%t", activeIndex ? "Left" : "Right");
      label = label.replace('%e', document.getElementById("context-searchselect").engine.name);
      this.menuitem2.setAttribute("label", label.replace('%s', selectedText));
    }

    if (!ImageItemHidden) {
      label = this.menuitem3.getAttribute("labeltemp");
      this.menuitem3.setAttribute("label", label.replace("%t", activeIndex ? "Left" : "Right"));
    }
  },

  command: function(event) {
    switch(event.target.id) {
      case "context-open-link-in-secondary-tab":
        this.openLinkIn(event);
        break;
      case "context-search-in-secondary-tab":
        this.openSearchIn(event);
        break;
      case "context-viewimage-in-secondary-tab":
        this.openImageIn(event);
        break;
    }
  },
  
  _openLinkInParameters: function(extra) {
    let params = {
      charset: gContextMenu.contentData.charSet,
      originPrincipal: gContextMenu.principal,
      originStoragePrincipal: gContextMenu.storagePrincipal,
      triggeringPrincipal: gContextMenu.principal,
      triggeringRemoteType: gContextMenu.remoteType,
      policyContainer: gContextMenu.policyContainer,
      frameID: gContextMenu.contentData.frameID,
      hasValidUserGestureActivation: true,
      textDirectiveUserActivation: true,
    };
    for (let p in extra) {
      params[p] = extra[p];
    }

    let referrerInfo = gContextMenu.onLink
      ? gContextMenu.contentData.linkReferrerInfo
      : gContextMenu.contentData.referrerInfo;
    // If we want to change userContextId, we must be sure that we don't
    // propagate the referrer.
    if (
      ("userContextId" in params &&
        params.userContextId != gContextMenu.contentData.userContextId) ||
      gContextMenu.onPlainTextLink
    ) {
      referrerInfo = new ReferrerInfo(
        referrerInfo.referrerPolicy,
        false,
        referrerInfo.originalReferrer
      );
    }

    params.referrerInfo = referrerInfo;
    return params;
  },

  openLinkIn: function(event) {
    const url = gContextMenu.linkURL || gContextMenu.linkText; 

    // urlSecurityCheck
    try {
        Services.scriptSecurityManager.checkLoadURIStrWithPrincipal(event.target.ownerDocument.nodePrincipal, url, Ci.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);
    } catch (e) {
        event.stopPropagation();
        return false;
    }
    const { activeSplitView, selectedTab } = gBrowser;
    const activeIndex = activeSplitView.tabs.indexOf(selectedTab);

    const userContextId = gContextMenu.contentData.userContextId;
    const targetTab = activeSplitView.tabs[activeIndex ? 0 : 1];
    gBrowser.selectedTab = targetTab;

    // xxxx
    if (targetTab.linkedBrowser.documentURI.spec != "about:opentabs") {
	    targetTab.linkedBrowser.messageManager.sendAsyncMessage("openInSecondaryTab_historypush", {url: "about:blank"});
	  }

    let params = this._openLinkInParameters(
                      {
                        targetBrowser: targetTab.linkedBrowser,
                      });
    setTimeout(() => {
      openLinkIn(url, "current", params);
    }, 100);
  },

  openSearchIn: function(event) {
    const text = (gContextMenu.isTextSelected
                    ? gContextMenu.selectionInfo.fullText
                    : undefined)
                  || gContextMenu.linkTextStr;

		let engine = document.getElementById("context-searchselect").engine;
		if (!engine)
			return;
		let submission = engine.getSubmission(text, null);
		if (!submission)
			return;


    const { activeSplitView, selectedTab } = gBrowser;
    const activeIndex = activeSplitView.tabs.indexOf(selectedTab);
    const targetTab = activeSplitView.tabs[activeIndex ? 0 : 1];
    gBrowser.selectedTab = targetTab;

    // xxxx
    if (targetTab.linkedBrowser.documentURI.spec != "about:opentabs") {
	    targetTab.linkedBrowser.messageManager.sendAsyncMessage("openInSecondaryTab_historypush", {url: "about:blank"});
	  }

    let params = this._openLinkInParameters(
                      {
                        postData: submission.postData,
                        referrerInfo: null,
                        targetBrowser: targetTab.linkedBrowser,
                      });
    setTimeout(() => {
      openLinkIn(submission.uri.spec, "current", params);
    }, 100);

		this.SyncHistory(text, engine.name);
  },

  SyncHistory: function (val, engineName) {
    if (!val)
      return;
    if (PrivateBrowsingUtils.isWindowPrivate(window)) 
      return;
		this.lazy.FormHistory.update({
		  op: "bump",
		  fieldname: "searchbar-history",
		  value: val,
		  source: engineName
		});
  },

  openImageIn: function(event) {
    const { activeSplitView, selectedTab } = gBrowser;
    const activeIndex = activeSplitView.tabs.indexOf(selectedTab);
    const targetTab = activeSplitView.tabs[activeIndex ? 0 : 1];

    let referrerInfo = gContextMenu.contentData.referrerInfo;
    let systemPrincipal = Services.scriptSecurityManager.getSystemPrincipal();

    // xxxx
    if (targetTab.linkedBrowser.documentURI.spec != "about:opentabs") {
	    targetTab.linkedBrowser.messageManager.sendAsyncMessage("openInSecondaryTab_historypush", {url: "about:blank"});
	  }
    if (this.onCanvas) {
      gContextMenu._canvasToBlobURL(gContextMenu.targetIdentifier).then(blobURL => {
        openLinkIn(blobURL, "current", {
          referrerInfo,
          triggeringPrincipal: systemPrincipal,
          targetBrowser: targetTab.linkedBrowser,
        });
      }, console.error);
    } else {
      const ALLOWED_CHROME_IMAGE_URLS = new Set([
        "chrome://global/skin/illustrations/security-error.svg",
        "chrome://global/skin/illustrations/no-connection.svg",
      ]);
      const isAllowedChromeImage = ALLOWED_CHROME_IMAGE_URLS.has(gContextMenu.mediaURL);
      const principal = isAllowedChromeImage ? systemPrincipal : gContextMenu.principal;

      urlSecurityCheck(
        gContextMenu.mediaURL,
        principal,
        Ci.nsIScriptSecurityManager.DISALLOW_SCRIPT
      );

      openLinkIn(gContextMenu.mediaURL, "current", {
        referrerInfo,
        forceAllowDataURI: true,
        triggeringPrincipal: principal,
        triggeringRemoteType: gContextMenu.remoteType,
        policyContainer: gContextMenu.policyContainer,
        targetBrowser: targetTab.linkedBrowser,
      });
    }
  },
}




let openInSecondaryTab_framescript = {
  init: function() {
    let framescript = {
      init: function() {
        addMessageListener("openInSecondaryTab_historypush", this);
      },

      receiveMessage: function(message) {
        switch(message.name) {
          case "openInSecondaryTab_historypush":
            content.location.assign(message.data.url)
        }
        return {};
      },


    }; // end framescript
    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource() +
        ".init();")
      , true); // Set the second parameter, allowDelayedLoad, to true, to automatically load the desired frame script in newly created browsers/tabs (of possibly newly created windows) as well. the third parameter, allow global access.
    delete framescript; 
  }
}



  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    openInSecondaryTab.init();
    openInSecondaryTab_framescript.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        openInSecondaryTab.init();
        openInSecondaryTab_framescript.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }

