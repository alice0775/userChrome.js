// ==UserScript==
// @name           forgetHisoryForThisSite.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ブックマークやタブからも指定ホストの履歴(クッキー,パスワードも)を消去出来るようにする, "Forget about this site" with Bookmarks and/or Tab.
// @include        main
// @include        chrome://browser/content/places/places.xul
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include        chrome://browser/content/history/history-panel.xul
// @compatibility  Firefox 3.5, 3.6a1pre
// @author         Alice0775
// @Note           Require userChrome.js (download from http://mozilla.zeniko.ch/userchrome.js.xpi)
// @Note           Require Sub-Script/Overlay Loader v3.0.24mod (download from http://space.geocities.jp/alice0775/STORE/userChrome.js)
// @version        2010/03/26 13:00  Minefield/3.7a4pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/15 00:00  Minefield/3.7a4pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2009/08/06 22:00 PlacesUtils._uriの例外
// @version        2009/07/08 14:40
// ==/UserScript==



var forgetHisoryForThisSite = {
  tabContext : null,
  deleteHost : null,
  menuitem : null,

  handleEvent : function(event) {
    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
      case 'popupshowing':
        this.onPopupShowing();
        break;
    }
  },

  init: function() {
    window.addEventListener('unload', this, false);

    // Eneble Bookmarks & Live Bookmarks
    this.deleteHost = document.getElementById("placesContext_deleteHost");
    this.deleteHost.removeAttribute("forcehideselection");

    // Enable for Live Bookmarks
    var func =   PlacesController.prototype.isCommandEnabled.toString();
    func = func.replace(
    'switch (aCommand) {',
    <><![CDATA[
    $&
    case "placesCmd_deleteDataHost":
        var selectedNode = this._view.selectedNode;
        return selectedNode && PlacesUtils.nodeIsURI(selectedNode) &&
               !PlacesUIUtils.privateBrowsing.privateBrowsingEnabled
    ]]></>
    );
    eval("PlacesController.prototype.isCommandEnabled = " + func);


   // It decides whether to display "Delete Host."
   // When "host" is not in history entry, "Delete Host" should be hidden.
   func = PlacesController.prototype.buildContextMenu.toString();
    func = func.replace(
    'if (!item.hidden) {',
    <><![CDATA[
    if (!item.hidden && item.getAttribute("id") == "placesContext_deleteHost") {
      var selectedNode = this._view.selectedNode;
      if (PlacesUIUtils.privateBrowsing.privateBrowsingEnabled)
        item.hidden = true;
      if (selectedNode && PlacesUtils.nodeIsURI(selectedNode)) {
        try {
          var host = PlacesUtils._uri(selectedNode.uri).host;
          item.hidden = !forgetHisoryForThisSite.isExistHostInHistory(host);
        } catch(e) {
          item.hidden = true;
        }
      }
    }
    $&
    ]]></>
    );
    eval("PlacesController.prototype.buildContextMenu = " + func);

    // Preparation for tab context menu
    if (location.href != "chrome://browser/content/browser.xul")
      return;
    // For tab Context Menu
    this.tabContext = document.getAnonymousElementByAttribute(
                          gBrowser, "anonid", "tabContextMenu") ||
                      gBrowser.tabContainer.contextMenu;
    this.tabContext.addEventListener("popupshowing", this, false);
  },

  uninit: function() {
    if (this.tabContext)
      this.tabContext.removeEventListener("popupshowing", this, false);
    window.removeEventListener('unload', this, false);
  },

  // for tab context menu
  onPopupShowing: function(event){
    if (!this.menuitem) {
      this.menuitem = document.createElement("menuitem");
      this.menuitem.setAttribute("id", "forgetHisoryForThisSiteMenu");
      this.menuitem.setAttribute("label", this.deleteHost.getAttribute('label'));
      this.menuitem.setAttribute("accesskey", this.deleteHost.getAttribute('accesskey'));
      this.menuitem.setAttribute("oncommand", "forgetHisoryForThisSite.doforgetHisoryForTab(gBrowser.mContextTab);");
      this.menuitem.setAttribute("hidden", "true");
      var ref = document.getElementById("context_closeTab");
      this.tabContext.insertBefore(this.menuitem, ref.nextSibling);
    }
    var ishidden;
    try {
      var uri = gBrowser.getBrowserForTab(gBrowser.mContextTab).currentURI.spec;
      var host = PlacesUtils._uri(uri).host;
      ishidden = /*!this.isExistHostInHistory(host) ||*/
                  PlacesUIUtils.privateBrowsing.privateBrowsingEnabled;
    } catch (e) {
      ishidden = true;
    }

    this.menuitem.setAttribute("hidden", ishidden);
  },

  doforgetHisoryForTab: function(aTab){
    var browser = gBrowser.getBrowserForTab(aTab);
    var uri = browser.currentURI.spec
    try {
      var host = PlacesUtils._uri(uri).host;
      PlacesUIUtils.privateBrowsing.removeDataFromDomain(host);
    } catch (e) {
    }
  },

  // Is "host" in history entry or not?
  isExistHostInHistory: function(host) {
    try {
      var historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
                                     .getService(Components.interfaces.nsINavHistoryService);

      // No query options set will get all history, sorted in database order,
      // which is nsINavHistoryQueryOptions.SORT_BY_NONE.
      var options = historyService.getNewQueryOptions();
      options.queryType = options.QUERY_TYPE_HISTORY;
      options.maxResults = 1;

      // No query parameters will return everything
      var query1 = historyService.getNewQuery();
      query1.domain = host;

      // execute the query
      var result = historyService.executeQuery(query1, options);
      var cont = result.root;
      cont.containerOpen = true;
      var isExist = cont.childCount > 0;
      cont.containerOpen = false;
      return isExist;
    } catch(e) {
      return false;
    }

  }

}

forgetHisoryForThisSite.init();
