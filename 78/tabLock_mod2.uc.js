// ==UserScript==
// @name           tabLock_mod2.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    tabLock
// @include        *
// @exclude        about:*
// @exclude        chrome://mozapps/content/downloads/unknownContentType.xul
// @compatibility  78-83
// @version        2020/12/23 20:30 Fix if targetBrowser is specified
// @version        2020/11/23 20:20 If exist download attribute
// @version        2020/11/18 06:20 Bug 1671983 - Remove E10SUtils.shouldLoadURI
// @version        2020/11/09 06:20 Bug 1590538 - Copying a link and using "Paste & Go" results in error when HTTPS Everywhere add-on is installed
// @version        2020/07/16 20:20 Bug 1635094 - Cleanup the referrerinfo code
// @version        2020/05/12 00:00 Removed unused pref
// @version        2020/02/12 16:30 fix revert url when open from ul bar
// @version        2019/11/14 00:00 Fix 72+ Bug 1591145 Remove Document.GetAnonymousElementByAttribute
// @version        2019/06/06 07:00 Bug 1534681 Use ReferrerInfo class in document
// @version        2019/05/29 16:00 Bug 1519514 - Convert tab bindings
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1534407 - Enable browser.xhtml by default
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/09/27 10:30 fix  tab detach
// @version        2018/09/26 07:30 support tab detach
// @version        2018/09/25 21:30 working with tab multi selection
// @version        2018/09/23 12:30 use BrowserWindowTracker
// @version        2018/08/02 12:30 exclude about:*
// @version        2018/06/21 19:50 workaround regression
// @version        2018/06/21 19:40 fix restore session if *.restore_on_demand is enabled
// @version        2018/06/10 00:00 workaround restore session
// @version        2018/05/23 00:00 Fixed typo(status is undeled when unlock)
// @version        2018/05/12 15:30 workaround restore session for all window
// @version        2018/05/05 23:00 cleanup (fix ancestor click event)
// @version        2018/05/04 22:00 Make link handling of locked tab more safer
// @version        2018/05/04 21:00 xxxx for <a href = ""> something
// @version        2018/05/04 12:00 cleanup for 60
// @version        2018/05/04 00:00 for 60
// ==/UserScript==
// @Note           about:configの設定
//  userChrome.tabLock.ignoreBrowserBack_Forward タブをロックしている状態で, BrowserBack/Forwardを [0]:通常動作, 1:新規タブに開く, 2:機能しなくする

//  browser.tabs.loadInBackground           リンクを背面で開くかどうか [true]/false
//  browser.tabs.loadBookmarksInBackground  ブックマークを背面で開くかどうか true/[false]
//  browser.tabs.loadUrlInBackground        ロケーションバーを背面で開くかどうか true/[false]

patch: {
  if ("openLinkIn" in window) {
    if (!window.hasOwnProperty("openLinkIn_lockorg")) {
      window.openLinkIn_lockorg = window.openLinkIn;
      window.openLinkIn = function(url, where, params) {
        let w, targetBrowser, targetTab;
        if (where == "current") {
          if (params.targetBrowser) {
            w = params.targetBrowser.ownerGlobal;
            targetBrowser = params.targetBrowser;
            targetTab = w.gBrowser.getTabForBrowser(targetBrowser);
          } else {
            w = getTopWin();
            targetBrowser = w.gBrowser.selectedBrowser;
            targetTab = w.gBrowser.selectedTab;
          }
          if (url && "isLockTab" in w.gBrowser &&
              w.gBrowser.isLockTab(targetTab) &&
              !/^\s*(javascript:|data:|moz-extension:)/.test(url) &&
              !w.gBrowser.isHashLink(url, targetBrowser.currentURI.spec)) {
            where  = "tab";
          }
        }
        window.openLinkIn_lockorg(url, where, params);
      }
    }
  }

  if (location.href != "chrome://browser/content/browser.xhtml")
    break patch;

  gURLBar._loadURL_org = gURLBar._loadURL;
  gURLBar._loadURL = function _loadURL(
    url,
    openUILinkWhere,
    params,
    resultDetails = null,
    browser = this.window.gBrowser.selectedBrowser
  ) {
    if (url && openUILinkWhere  == "current" && "isLockTab" in gBrowser &&
        gBrowser.isLockTab(gBrowser.selectedTab) &&
        !/^\s*(javascript:|data:|moz-extension:)/.test(url) &&
        !gBrowser.isHashLink(url, gBrowser.currentURI.spec)) {
      openUILinkWhere  = "tab";
    }
    gURLBar._loadURL_org(
      url,
      openUILinkWhere,
      params,
      resultDetails = null,
      browser = this.window.gBrowser.selectedBrowser
    );
  }

  window.tabLock = {
    ignoreNextPrevLink: true, //タブをロックしている状態で, 次のページ, 前のページ などは ロックを無視するかどうかデフォルト値
    ignoreHashLink: true, //タブをロックしている状態で,  href ="#xxx" などは ロックを無視するかどうかデフォルト値
    ignoreBrowserBackForward: 0, //タブをロックしている状態で, BrowserBack/Forwardを [0]:通常動作, 1:新規タブに開く, 2:機能しなくする
    sessionStore: {
      get ss() {
        try { 
          return Components.classes["@mozilla.org/browser/sessionstore;1"].
                                 getService(Components.interfaces.nsISessionStore)
        } catch(e) {
          return;
        }
      },
      
      getTabValue : function(aTab, aKey) {
        if (typeof SessionStore.getCustomTabValue == "function")
          return SessionStore.getCustomTabValue(aTab, aKey);
        else
          return this.ss.getTabValue(aTab, aKey);
      },

      setTabValue : function(aTab, aKey, aValue) {
        if (typeof SessionStore.setCustomTabValue == "function")
          return SessionStore.setCustomTabValue(aTab, aKey, aValue);
        else
          return this.ss.setTabValue(aTab, aKey, aValue);

      },
      deleteTabValue : function(aTab, aKey) {
        if (typeof SessionStore.deleteCustomTabValue == "function")
          return SessionStore.deleteCustomTabValue(aTab, aKey);
        else
          return this.ss.deleteTabValue(aTab, aKey);
      }
    },

    get tabContext() {
      return document.getElementById("tabContextMenu");
    },

    init: function(){

      // detach tab
      let func =  gBrowser.swapBrowsersAndCloseOther.toString();
      if (gBrowser && !/copytabLock/.test(func)) {
        func = func.replace(
          'let otherFindBar = aOtherTab._findBar;',
          `if (aOtherTab.hasAttribute("tabLock")) {
              aOurTab.ownerGlobal.gBrowser.lockTab(aOurTab, true);
            /*copytabLock*/
          }
          $&`
         );
        eval("gBrowser.swapBrowsersAndCloseOther = function " + func.replace(/^function/, ''));
      }

      gBrowser.isLockTab = function (aTab){
        //var x = gBrowser.isLockTab.caller;
         return aTab.hasAttribute("tabLock");
      }

      gBrowser.lockTab = function (aTab, state){
        let isLocked;
        if (typeof state == "undefined") {
          if ( aTab.hasAttribute("tabLock") ){
            state = false;
          }else{
            state = true;
          }
        }
        if (state) {
          aTab.setAttribute("tabLock", "true");
          tabLock.sessionStore.setTabValue(aTab, "tabLock", "true");
          isLocked = true;
        } else {
          aTab.removeAttribute("tabLock");
          try {
            tabLock.sessionStore.deleteTabValue(aTab, "tabLock");
          } catch(e) {}
          isLocked = false;
        }
        this.lockTabIcon(aTab);
        return isLocked;
      }

      gBrowser.lockTabIcon = function (aTab){
        const kXULNS =
                 "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
        var image = aTab.querySelector(".tab-icon-lock");
        if ( aTab.hasAttribute("tabLock") ){
          if(!image){
            var stack = aTab.querySelector(".tab-stack");
            var image = document.createElementNS(kXULNS,'image');
            image.setAttribute('class','tab-icon-lock');
            image.setAttribute('left',0);
            image.setAttribute('top',0);
            if(stack) stack.appendChild(image);
          }
        }
      }


      gBrowser.isHashLink = function (aUrl, aDocumentUrl){
        if(!tabLock.getPref('userChrome.tabLock.ignoreHashLink','bool', tabLock.ignoreHashLink))
          return false;
        let aURI = new URL(aUrl);
        let aDocumentURI = new URL(aDocumentUrl);
        if (aURI.hash || aDocumentURI.hash) {
          if(aURI.href.replace(aURI.hash, "") == aDocumentURI.href.replace(aDocumentURI.hash, "")) {
            return true;
          }
        }
        return false;
      }

      this.tabContextMenu();

      // CSSを適用
        var style = `
        tab[tabLock] .tab-icon-lock{
          margin-top: 0px; /*要調整*/
          margin-left: 0px; /*要調整*/
          list-style-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAjElEQVQ4je3RsQ7CMAyE4S9pURl5/6csGxKJw1AKFBARK+IkD3Fyv86OQouHOhNBqzQcdJSPzCKIEMgkKFTMXcDmMI6LGzuGnvkFoBRQiWtn/x1g5dwBpx4gnalDxAZUcm4jad3HxwTpzaNxmtZef4RMkrNbDQPTtN53AanSniM0S6y8/ES82v76MV0AlREpDobXTpUAAAAASUVORK5CYII=');
          width: 16px;
          height: 16px;
        }
        tab:not([tabLock]) .tab-icon-lock {
          display: none !important;
        }`.replace(/\s+/g, " ");

      var sspi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
      );
      document.insertBefore(sspi, document.documentElement);
      sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
      };

      this.restoreAll(0);
      gBrowser.tabContainer.addEventListener('TabMove', this, false);
      gBrowser.tabContainer.addEventListener('SSTabRestoring', this,false);
      window.addEventListener('unload', this, false)
    },

    restoreAll: function(delay = 0) {
      var that = this;
      setTimeout(init, delay, 0);
      function init(i){
        if(i < gBrowser.tabs.length){
          var aTab = gBrowser.tabs[i];
          that.restoreForTab(aTab);
          i++;
          arguments.callee(i);
        }else{
        }
      }
    },

    uninit: function(){
      window.removeEventListener('unload', this, false)
      gBrowser.tabContainer.removeEventListener('TabMove', this, false);
      gBrowser.tabContainer.removeEventListener('SSTabRestoring', this,false);
      this.tabContext.removeEventListener('popupshowing', this, false);
    },

    handleEvent: function(event) {
      switch(event.type) {
        case "unload":
          this.uninit(event);
          break;
        case "SSTabRestoring":
          this.restore(event);
          break;
        case "TabMove":
          this.TabMove(event);
          break;
        case "popupshowing":
          this.popupshowing(event);
          break;
      }
    },

    TabMove: function (aEvent){
      var aTab = aEvent.target;
      gBrowser.lockTabIcon(aTab);
    },

    tabContextMenu: function(){
      //tab context menu
      var tabContext = this.tabContext;
      var menuitem = this.tabLockMenu
                   = tabContext.appendChild(
                          document.createXULElement("menuitem"));
      menuitem.id = "tabLock";
      menuitem.setAttribute("type", "checkbox");
      if (Services.appinfo.version.split(".")[0] >= 63)
        menuitem.setAttribute("label", "Lock This Tab(s)");
      else
        menuitem.setAttribute("label", "Lock This Tab");
      menuitem.setAttribute("accesskey", "L");
      menuitem.setAttribute("oncommand","tabLock.toggle(TabContextMenu.contextTab);");
      tabContext.addEventListener('popupshowing', this, false);
    },

    popupshowing: function(event) {
      this.setCheckbox(event);
    },

    restore: function(event){
      tabLock.restoreAll(0);
    },

    restoreForTab: function(aTab){
      var retrievedData = this.sessionStore.getTabValue(aTab, "tabLock") == "true";
      if(retrievedData)
        aTab.setAttribute('tabLock',true);
      else
        if ( aTab.hasAttribute("tabLock") ) aTab.removeAttribute("tabLock");
      gBrowser.lockTabIcon(aTab);
    },

    toggle: function(aTab){
      if (typeof gBrowser.selectedTabs != "undefined") {
        this.toggleLockSelectedTabs(this.getSelectedTabs(aTab));
      } else {
        gBrowser.lockTab(aTab);
      }
    },

    toggleLockSelectedTabs: function(tabs){
      if (tabs.length < 1)
        return;
      let isLock = gBrowser.isLockTab(tabs[0]);
      for (let tab of tabs) {
          gBrowser.lockTab(tab, !isLock);
      }
    },

    getSelectedTabs: function(aTab){
      let contextTab = aTab;
      let selectedTabs = [contextTab];
      if (gBrowser.selectedTabs.indexOf(contextTab) < 0)
        return selectedTabs;

      for (let tab of gBrowser.selectedTabs) {
        if (contextTab != tab)
          selectedTabs.push(tab);
      }
      return selectedTabs;
    },

    setCheckbox: function(event){
      var menuitem = this.tabLockMenu;
      var aTab =  TabContextMenu.contextTab;
      if (!aTab)
        aTab = event.target;
      while( aTab && aTab instanceof XULElement && aTab.localName !='tab'){
        aTab = aTab.parentNode;
      }
      if( !aTab || aTab.localName !='tab'){
        menuitem.setAttribute('hidden',true);
        return;
      }
      menuitem.setAttribute('hidden',false);
      if(aTab.hasAttribute('tabLock') && aTab.getAttribute('tabLock')){
        menuitem.setAttribute('checked', true);
      }else{
        menuitem.setAttribute('checked', false);
      }
    },

    getIndexForTab: function(aTab){
      var mTabChilds = gBrowser.tabs;
      for (var i = 0,len = mTabChilds.length; i < len; i++)
        if (mTabChilds[i] == aTab)
           var index = i;
      return index;
    },

    getPref: function(aPrefString, aPrefType, aDefault){
      var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefBranch);
      try{
        switch (aPrefType){
          case 'complex':
            return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
          case 'str':
            return xpPref.getCharPref(aPrefString).toString(); break;
          case 'int':
            return xpPref.getIntPref(aPrefString); break;
          case 'bool':
          default:
            return xpPref.getBoolPref(aPrefString); break;
        }
      }catch(e){
      }
      return aDefault;
    },

    setPref: function(aPrefString, aPrefType, aValue){
      var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefBranch);
      try{
        switch (aPrefType){
          case 'complex':
            return xpPref.setComplexValue(aPrefString, Components.interfaces.nsIFile, aValue); break;
          case 'str':
            return xpPref.setCharPref(aPrefString, aValue); break;
          case 'int':
            aValue = parseInt(aValue);
            return xpPref.setIntPref(aPrefString, aValue);  break;
          case 'bool':
          default:
            return xpPref.setBoolPref(aPrefString, aValue); break;
        }
      }catch(e){
      }
      return null;
    },

    debug: function(aMsg){
            Cc["@mozilla.org/consoleservice;1"]
              .getService(Ci.nsIConsoleService)
              .logStringMessage(aMsg.toString());
    }
  }


  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    tabLock.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        tabLock.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }


(function() {
  'use strict';

  let frameScript = function() {
    addEventListener("click", onClick, false);  /*先祖要素のclick eventListener 優先, trueの場合 無視されるので*/

    function onClick(event) {
      if (event.button !== 0) return;
      if (event.altKey || event.ctrlKey || event.shiftKey) return;

      if (!sendSyncMessage("linkclick_isLockedTab", {  })[0].isLockedTab)
        return;
      /*先祖要素のclick eventListener 優先*/
      if (event.defaultPrevented)
        return;

      let [url, node, principal] = _hrefAndLinkNodeForClickEvent(event);
      let ownerDoc = event.originalTarget.ownerDocument;

      if (!url || !node || node.getAttribute("href") == "" ||    /*xxxx fix ""*/
          node.hasAttribute("download") ||
           /^\s*(javascript:|data:|moz-extension:)/.test(url))
        return;

     if (sendSyncMessage("linkclickByLockTab_isHash", {url: url, documentURI: ownerDoc.documentURI})[0].isHash)
        return;

      if (node.hasAttribute("onclick"))
        return;

      if (node.getAttribute("rel") == "sidebar")
        return;

      let target = node.target;
      if (target)
        return;
  
      event.preventDefault();
      event.stopPropagation();


      let event2 = new MouseEvent('click', {
          view: event.originalTarget.ownerDocument.defaultView,
          bubbles: true,
          cancelable: true,
          ctrlKey: true
        });
      event.target.dispatchEvent(event2);
    }
  
    function _hrefAndLinkNodeForClickEvent(event) {
      function isHTMLLink(aNode) {
        return ((aNode instanceof content.HTMLAnchorElement && aNode.href) ||
                (aNode instanceof content.HTMLAreaElement && aNode.href) ||
                aNode instanceof content.HTMLLinkElement);
      }

      let node = event.originalTarget;
      while (node && !isHTMLLink(node)) {
        node = node.parentNode;
      }

      if (node)
        return [node.href, node, node.ownerDocument.nodePrincipal];

      let href, baseURI;
      node = event.target;
      while (node && !href) {
        if (node.nodeType == content.Node.ELEMENT_NODE &&
            (node.localName == "a" ||
             node.namespaceURI == "http://www.w3.org/1998/Math/MathML")) {
          href = node.getAttribute("href") ||
                 node.getAttributeNS("http://www.w3.org/1999/xlink", "href");
          if (href) {
            baseURI = node.ownerDocument.baseURIObject;
            break;
          }
        }
        node = node.parentNode;
      }

      return [href ? Services.io.newURI(href, null, baseURI).spec : null, null,
              node && node.ownerDocument.nodePrincipal];
    }
  };

  let frameScriptURI = 'data:,(' + frameScript.toString() + ')()';
  window.messageManager.loadFrameScript(frameScriptURI, true);
  window.messageManager.addMessageListener("linkclick_isLockedTab",
    function(message) {
        return { isLockedTab: gBrowser.selectedTab.hasAttribute('tabLock') };
    }
  );
  window.messageManager.addMessageListener("linkclickByLockTab_isHash",
    function(message) {
      return { isHash: gBrowser.isHashLink(message.data.url, message.data.documentURI) };
    }
  );
}());

}
