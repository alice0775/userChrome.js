// ==UserScript==
// @name	closetableftactive.uc.js
// @async          true
// @version	0.5a 
// @compatibility 150
// @include	chrome://browser/content/browser.xhtml
// @version 2026/03/01 Bug 2017957 - Add freezeBuiltins option to Cu.Sandbox
// @version 2026/01/27 fix bug 
// @version 2025/12/30 Bug 1986948 - Implement dragging behavior of the two tabs contained in a splitview
// @version 2025/11/30 Bug 1998199 - Replace use of ariaFocusableItems with a new array in drag and drop modules
// @version 2025/10/30 Bug 1984105 - Disable LNA checks for Captive Portals
// @version 2025/07/23 Bug 1968607 - Prototype policy container and replace it with CSP
// @version 2025/06/16 Bug 1968479 - Only allow eval (with system principal / in the parent) when an explicit pref is set
// @version 2025/05/23 sandbox and modify gBrowser.loadTabs
// @version 2025/05/20 Bug 1966912 - Remove addTab's `index` alias for the `tabIndex` parameter
// @version 2025/03/26 Bug 1950904
// @version 2025/02/27ects by default, rather than strings, to help avoid unnecessary parsing / fixup / allocations
// ==/UserScript==
function closetableftactive_init() {
  let sb = window.userChrome_js?.sb;
  if (!sb) {
    sb = Cu.Sandbox(window, {
        sandboxPrototype: window,
        sameZoneAs: window,
        freezeBuiltins: false,
    });

    /* toSource() is not available in sandbox */
    Cu.evalInSandbox(`
        Function.prototype.toSource = window.Function.prototype.toSource;
        Object.defineProperty(Function.prototype, "toSource", {enumerable : false})
        Object.prototype.toSource = window.Object.prototype.toSource;
        Object.defineProperty(Object.prototype, "toSource", {enumerable : false})
        Array.prototype.toSource = window.Array.prototype.toSource;
        Object.defineProperty(Array.prototype, "toSource", {enumerable : false})
    `, sb);
    window.addEventListener("unload", () => {
        setTimeout(() => {
            Cu.nukeSandbox(sb);
        }, 0);
    }, {once: true});
  }

  gBrowser._findTabToBlurTo_closetableftactive = gBrowser._findTabToBlurTo;
  gBrowser._findTabToBlurTo = function _findTabToBlurTo(aTab, aExcludeTabs = []) {
      let time1, time2;
      if (this.selectedTab.hasAttribute("customizemode")) {
        return this._findTabToBlurTo_closetableftactive(aTab, aExcludeTabs);
      }
      if (!aTab.selected) {
        return null;
      }
      if (FirefoxViewHandler.tab) {
        aExcludeTabs.push(FirefoxViewHandler.tab);
      }

      let excludeTabs = new Set(aExcludeTabs);

      // If this tab has a successor, it should be selectable, since
      // hiding or closing a tab removes that tab as a successor.
      if (aTab.successor && !excludeTabs.has(aTab.successor)) {
        return aTab.successor;
      }

      let remainingTabs = Array.prototype.filter.call(
        this.visibleTabs,
        tab => !excludeTabs.has(tab)
      );
      let openerTab = aTab.openerTab;
      if (openerTab && !openerTab.hasAttribute("collapsed")) {
        let tab = this.tabContainer.findNextTab(aTab, {
          direction: 1,
          filter: _tab => remainingTabs.includes(_tab),
        });
        if (tab?.openerTab == openerTab) {
          time1 = parseInt(tab.getAttribute("createdTime")) | 0;
          time2 = parseInt(aTab.getAttribute("createdTime")) | 0;
          if (Math.abs(time1 - time2) < 60000) {
            //Services.console.logStringMessage("find right(next) that has same openerTab");
            return tab;
          }
        }
        tab = this.tabContainer.findNextTab(aTab, {
          direction: -1,
          filter: _tab => remainingTabs.includes(_tab),
        });
        if (tab?.openerTab == openerTab) {
          time1 = parseInt(tab.getAttribute("createdTime")) | 0;
          time2 = parseInt(aTab.getAttribute("createdTime")) | 0;
          if (Math.abs(time1 - time2) < 60000) {
            //Services.console.logStringMessage("find left(previous) that has same openerTab");
            return tab;
          }
        }
        tab = remainingTabs.find(element => element == openerTab);
        if (tab) {
  //Services.console.logStringMessage("find openerTab");
          return tab;
        }
      }

      // find prev. selected tab if no opener
      if (typeof ucjsNavigation_tabFocusManager != "undefined") {
        let uFM = ucjsNavigation_tabFocusManager;
        let currentPanel = aTab.getAttribute("linkedpanel");
        for (let i = uFM._tabHistory.length - 1; i > -1; i--) {
          let panel = uFM._tabHistory[i];
          if (panel == currentPanel) {
            continue;
          }
          let tab = uFM.getTabFromPanel(panel);
          if (!tab || tab.getAttribute('hidden'))
            continue;
          if (remainingTabs.includes(tab) && !tab.closing) {
  //Services.console.logStringMessage("5 find prev. selected tab if no opener");
            return tab;
          }
        }
      }

      let tab = this.tabContainer.findNextTab(aTab, {
        direction: -1,
        filter: _tab => remainingTabs.includes(_tab),
      });
      if (tab) {
  //Services.console.logStringMessage("Left tab");
        return tab;
      }
      // fall back
  //Services.console.logStringMessage("fall back");
      return this._findTabToBlurTo_closetableftactive(aTab, aExcludeTabs);
    }

  var func = gBrowser.loadTabs.toString();
  func = func.replace(
  'this.addTab(aURIs[i], params);',
  'this.addTab(aURIs[i], params); tab.openerTab = firstTabAdded;'
  );
  func = func.replace(
  '#elementIndexToTabIndex',
  'elementIndexToTabIndex'
  );
  func = func.replace(
  'if (!aURIs.length) {',
  `this.elementIndexToTabIndex = function elementIndexToTabIndex(elementIndex) {
      if (elementIndex < 0) {
        return -1;
      }
      if (elementIndex >= this.tabContainer.dragAndDropElements.length) {
        return this.tabs.length;
      }
      let element = this.tabContainer.dragAndDropElements[elementIndex];
      if (this.isTabGroupLabel(element)) {
        element = element.group.tabs[0];
      }
      if (this.isSplitViewWrapper(element)) {
        element = element.tabs[0];
      }
      return element._tPos;
    }
    if (!aURIs.length) {`
  );
  func = func.replace(
  /LOAD_FLAGS_/g,
  'Ci.nsIWebNavigation.LOAD_FLAGS_'
  );
  Cu.evalInSandbox("window.gBrowser.loadTabs = function loadTabs("+func.match(/\(([^)]*)/)[1]+"){"+func.replace(func.match(/[^)]*/)+")","").replace(/[^{]*\{/,"").replace(/}$/, '')+"};", sb);


    gBrowser.addTab_org_closetableftactive = gBrowser.addTab;
    gBrowser.addTab = function(
      uriString,
      {
        allowInheritPrincipal,
        allowThirdPartyFixup,
        bulkOrderedOpen,
        charset,
        createLazyBrowser,
        /*disableTRR,*/ /*Bug 1984105 - Disable LNA checks for Captive Portals*/
        eventDetail,
        focusUrlBar,
        forceNotRemote,
        forceAllowDataURI,
        fromExternal,
        inBackground = true,
        isCaptivePortalTab, /*Bug 1984105 - Disable LNA checks for Captive Portals*/
        elementIndex,
        tabIndex,
        lazyTabTitle,
        name,
        noInitialLabel,
        openWindowInfo,
        openerBrowser,
        originPrincipal,
        originStoragePrincipal,
        ownerTab,
        pinned,
        postData,
        preferredRemoteType,
        referrerInfo,
        relatedToCurrent,
        initialBrowsingContextGroupId,
        skipAnimation,
        skipBackgroundNotify,
        tabGroup,
        triggeringPrincipal,
        userContextId,
        policyContainer,
        skipLoad = createLazyBrowser,
        insertTab = true,
        globalHistoryOptions,
        triggeringRemoteType,
        schemelessInput,
        hasValidUserGestureActivation = false,
        textDirectiveUserActivation = false,
      } = {}
    ) {
      if (relatedToCurrent == null) {
        relatedToCurrent = !!(referrerInfo && referrerInfo.originalReferrer);
      }
      let openerTab =
        (openerBrowser && this.getTabForBrowser(openerBrowser)) ||
        (relatedToCurrent && this.selectedTab) ||
        null;

      let tab = this.addTab_org_closetableftactive.apply(this, arguments);

      if (tab) {
        tab.openerTab = openerTab || this.selectedTab;
        tab.setAttribute("createdTime", Date.now())
      }
      return tab;
    };
        
}
  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    closetableftactive_init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        closetableftactive_init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
