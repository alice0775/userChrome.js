// ==UserScript==
// @name           tabContextHistoryMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    タブのコンテキストメニューにそのタブの履歴を表示, クリックで履歴を遷移, 中クリックで新規タブに選択履歴をオープン
// @include        main
// @compatibility  Firefox 115
// @author         Alice0775
// @version        2024/03/21 Firefox 115
// @version        2013/04/21 Bug 713642 asyncFaviconCallers
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
    this.tabContext = document.getElementById("tabContextMenu");

    var menu = document.createXULElement("menu");
    menu.setAttribute("id", "tabContextHistoryMenu");
    menu.setAttribute("label", "Tab History");
    menu.setAttribute("accesskey", "H");
    this.menu = this.tabContext.insertBefore(menu, this.tabContext.firstChild);

    var popup = document.createXULElement("menupopup");
    this.popup = this.menu.appendChild(popup);

    popup.id = "tabContextHistoryMenupopup";
    popup.setAttribute("oncommand", "tabContextHistoryMenu.gotoHistoryIndex(event); event.stopPropagation();");
    popup.setAttribute("onclick", "checkForMiddleClick(this, event); this.parentNode.parentNode.hidePopup();");

    // event
    window.addEventListener("unload", this, false);
    this.tabContext.addEventListener("popupshowing", this, false);
    popup.setAttribute("onpopupshowing",
                  "tabContextHistoryMenu.populateTabContextHistoryMenu(TabContextMenu.contextTab);");
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
    var aTab = TabContextMenu.contextTab;
    if (aTab) {
      var sessionHistory = aTab.linkedBrowser.browsingContext.sessionHistory;

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

    var sessionHistory = aTab.linkedBrowser.browsingContext.sessionHistory;

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
    var tooltipCurrent = gNavigatorBundle.getString("tabHistory.reloadCurrent");
    var tooltipForward = gNavigatorBundle.getString("tabHistory.goForward");

    for (var j = end - 1; j >= start; j--) {
      let item = document.createXULElement("menuitem");
      let entry = sessionHistory.getEntryAtIndex(j, false);
      let uri = entry.URI.spec;

      item.setAttribute("uri", uri);
      item.setAttribute("label", entry.title || uri);
      item.setAttribute("index", j);
      item.setAttribute("historyindex", j - index);
    
      if (j != index) {
        this.getFavicon(uri, (function(uri){this.style.listStyleImage = "url(" + uri.spec + ")";}).bind(item));
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

  getFavicon: function(URL, callback) {
    var faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"].getService(Components.interfaces.nsIFaviconService);
    var IOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var URI = IOService.newURI(URL, null, null);
    if (typeof faviconService.getFaviconImageForPage == "undefined") {
      faviconService.getFaviconURLForPage(URI, callback);
    } else {
      callback(faviconService.getFaviconImageForPage(URI));
    }
  },

  gotoHistoryIndex: function gotoHistoryIndex(aEvent) {
    var index = Number(aEvent.target.getAttribute("index"));

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

      let historyindex = aEvent.target.getAttribute("historyindex");
      duplicateTabIn(this.aTab, where, Number(historyindex));
      return true;
    }
  }
}

tabContextHistoryMenu.init();
