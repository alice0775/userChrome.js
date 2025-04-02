// ==UserScript==
// @name           patchForBug1955816.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 1955816, 	履歴もbrowser.tabs.loadBookmarksInTabsに倣う
// @author         Alice0775
// @include        main
// @async          false
// @sandbox        false
// @compatibility  139
// @version        2025/04/02 add meta sabdbox
// @version        2021/08/30
// ==/UserScript==

  PlacesUIUtils.openNodeWithEvent = function PUIU_openNodeWithEvent(aNode, aEvent) {
    const lazy = {};
    ChromeUtils.defineESModuleGetters(lazy, {
       BrowserUtils: "resource://gre/modules/BrowserUtils.sys.mjs",
       BrowserWindowTracker: "resource:///modules/BrowserWindowTracker.sys.mjs",
       PlacesUtils: "resource://gre/modules/PlacesUtils.sys.mjs",
    });
    function getBrowserWindow(aWindow) {
      // Prefer the caller window if it's a browser window, otherwise use
      // the top browser window.
      return aWindow &&
        aWindow.document.documentElement.getAttribute("windowtype") ==
          "navigator:browser"
        ? aWindow
        : lazy.BrowserWindowTracker.getTopWindow();
    }


    let window = aEvent.target.ownerGlobal;

    let where = lazy.BrowserUtils.whereToOpenLink(aEvent, false, true);
    if (this.loadBookmarksInTabs &&
         (lazy.PlacesUtils.nodeIsBookmark(aNode) ||
          lazy.PlacesUtils.nodeIsURI(aNode))
    ) {
      if (where == "current" && !aNode.uri.startsWith("javascript:")) {
        where = "tab";
      }
      let browserWindow = getBrowserWindow(window);
      if (where == "tab" && browserWindow?.gBrowser.selectedTab.isEmpty) {
        where = "current";
      }
    }

    this._openNodeIn(aNode, where, window);
  }

  document
      .getElementById("historyMenuPopup")
      .addEventListener("popupshown", event => {
      HistoryMenu.prototype._onCommand = function _onCommand(aEvent) {
        aEvent = BrowserUtils.getRootEvent(aEvent);
        let placesNode = aEvent.target._placesNode;
        if (!PrivateBrowsingUtils.isWindowPrivate(window)) {
           PlacesUIUtils.markPageAsTyped(placesNode.uri);
        }
        PlacesUIUtils.openNodeWithEvent(placesNode, aEvent)
      }
  }, {once:true});


