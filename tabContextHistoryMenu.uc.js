// ==UserScript==
// @name           tabContextHistoryMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    タブのコンテキストメニューにそのタブの履歴を表示, クリックで履歴を遷移, 中クリックで新規タブに選択履歴をオープン
// @include        main
// @compatibility  Firefox 3.0, 3.5 3.6a2pre 3.7a1pre
// @author         Alice0775
// @version        2010/03/26 13:00  Minefield/3.7a3pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/15 00:00  Minefield/3.7a3pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2009/08/22 09:00
// ==/UserScript==
var tabContextHistoryMenu = {
  menu: null,
  popup: null,
  tabContext: null,

  init: function() {
    //tab context popup
    this.tabContext = document.getAnonymousElementByAttribute(
                        gBrowser, "anonid", "tabContextMenu") ||
                      gBrowser.tabContainer.contextMenu;

    var menu = document.createElement("menu");
    menu.setAttribute("id", "tabContextHistoryMenu");
    menu.setAttribute("label", "Tab History");
    menu.setAttribute("accesskey", "H");
    this.menu = this.tabContext.insertBefore(menu, this.tabContext.firstChild);

    var popup = document.createElement("menupopup");
    this.popup = this.menu.appendChild(popup);

    popup.id = "tabContextHistoryMenupopup";
    popup.setAttribute("oncommand", "tabContextHistoryMenu.gotoHistoryIndex(event); event.stopPropagation();");
    popup.setAttribute("onclick", "checkForMiddleClick(this, event); this.parentNode.parentNode.hidePopup();");

    // event
    window.addEventListener("unload", this, false);
    this.tabContext.addEventListener("popupshowing", this, false);
    popup.setAttribute("onpopupshowing",
                  "tabContextHistoryMenu.populateTabContextHistoryMenu(gBrowser.mContextTab);");
    // Lazily add the hover listeners on first showing and never remove them
    // Show history item's uri in the status bar when hovering, and clear on exit
    popup.addEventListener("DOMMenuItemActive", this, false);
    popup.addEventListener("DOMMenuItemInactive", this, false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    this.tabContext.removeEventListener("popupshowing", this, false);
    this.popup.removeEventListener("DOMMenuItemActive", this, false);
    this.popup.removeEventListener("DOMMenuItemInactive", this, false);
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case 'DOMMenuItemActive':
        //// Only the current page should have the checked attribute, so skip it
        //if (!aEvent.target.hasAttribute("checked"))
          window.XULBrowserWindow.setOverLink(aEvent.target.getAttribute("uri"));
        break;
      case 'DOMMenuItemInactive':
        window.XULBrowserWindow.setOverLink("");
        break;
      case 'popupshowing':
        this.tabContextPopupshowing();
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  tabContextPopupshowing: function() {
    this.menu.setAttribute("disabled", true);
    var aTab = window.gBrowser.mContextTab;
    if (aTab) {
      var webNav = aTab.linkedBrowser.webNavigation;
      var sessionHistory = webNav.sessionHistory;

      var count = sessionHistory.count;
      if (count > 0)
        this.menu.setAttribute("disabled", false);
    }
  },

  aTab: null,
  populateTabContextHistoryMenu: function(aTab) {
    this.aTab = aTab;
    // Remove old entries if any
    var children = this.popup.childNodes;
    for (var i = children.length - 1; i >= 0; --i) {
      if (children[i].hasAttribute("index"))
        this.popup.removeChild(children[i]);
    }

    var webNav = aTab.linkedBrowser.webNavigation;
    var sessionHistory = webNav.sessionHistory;

    var count = sessionHistory.count;
    if (count <= 0) // don't display the popup for a single item
      return false;

    const MAX_HISTORY_MENU_ITEMS = 15;
    var index = sessionHistory.index;
    var half_length = Math.floor(MAX_HISTORY_MENU_ITEMS / 2);
    var start = Math.max(index - half_length, 0);
    var end = Math.min(start == 0 ? MAX_HISTORY_MENU_ITEMS : index + half_length + 1, count);
    if (end == count)
      start = Math.max(count - MAX_HISTORY_MENU_ITEMS, 0);

    var tooltipBack = gNavigatorBundle.getString("tabHistory.goBack");
    var tooltipCurrent = gNavigatorBundle.getString("tabHistory.current");
    var tooltipForward = gNavigatorBundle.getString("tabHistory.goForward");

    for (var j = end - 1; j >= start; j--) {
      let item = document.createElement("menuitem");
      let entry = sessionHistory.getEntryAtIndex(j, false);
      let uri = entry.URI.spec;

      item.setAttribute("uri", uri);
      item.setAttribute("label", entry.title || uri);
      item.setAttribute("index", j);

      if (j != index) {
        try {
          let iconURL = Cc["@mozilla.org/browser/favicon-service;1"]
                           .getService(Ci.nsIFaviconService)
                           .getFaviconForPage(entry.URI).spec;
          item.style.listStyleImage = "url(" + iconURL + ")";
        } catch (ex) {}
      }

      if (j < index) {
        item.className = "unified-nav-back menuitem-iconic";
        item.setAttribute("tooltiptext", tooltipBack);
      } else if (j == index) {
        item.setAttribute("type", "radio");
        item.setAttribute("checked", "true");
        item.className = "unified-nav-current";
        item.setAttribute("tooltiptext", tooltipCurrent);
      } else {
        item.className = "unified-nav-forward menuitem-iconic";
        item.setAttribute("tooltiptext", tooltipForward);
      }

      this.popup.appendChild(item);
    }
    return true;
  },

  gotoHistoryIndex: function gotoHistoryIndex(aEvent) {
    var index = aEvent.target.getAttribute("index");
    if (!index)
      return false;

    var where = whereToOpenLink(aEvent);

    if (where == "current") {
      // Normal click.  Go there in the current tab and update session history.
      gBrowser.selectedTab = this.aTab;
      try {
        gBrowser.gotoIndex(index);
      }
      catch(ex) {
        return false;
      }
      return true;
    }
    else {
      // Modified click.  Go there in a new tab/window.
      // This code doesn't copy history or work well with framed pages.

      var sessionHistory = this.aTab.linkedBrowser.webNavigation.sessionHistory;
      var entry = sessionHistory.getEntryAtIndex(index, false);
      var url = entry.URI.spec;
      openUILinkIn(url, where);
      return true;
    }
  }
}

tabContextHistoryMenu.init();
