// ==UserScript==
// @name           places_addBookmarks.uc.js
// @description    Places Organizerの履歴のコンテクストメニューに「このリンクをブックマーク」を追加。
// @include        chrome://browser/content/browser.xhtml
// @include        chrome://browser/content/places/places.xul
// @compatibility  3.0 3.5 3.6a1pre
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2009/06/13
// ==/UserScript==
  var UC_PlacesAddBookmark = {
    init: function() {
      if ((("bookmarksHistoryPanel" in window) &&
          location.href == "chrome://browser/content/browser.xhtml") ||
          this.getVer() > 3.5) {
        this.observe();
        // Insert "Bookmark This Link" right before the copy item
        if (document.getElementById("addBookmarkContextItem"))
          document.getElementById("placesContext")
                  .insertBefore(document.getElementById("addBookmarkContextItem"),
                                document.getElementById("placesContext_copy"));

        return;
      }
      var menuitem = document.getElementById("UC_placesContext_addBookmarks");
      if (menuitem) {
        return;
      }
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
      var mainWindow = wm.getMostRecentWindow("navigator:browser");
      var ref = mainWindow.document.getElementById("context-bookmarklink");
      var label = ref.getAttribute('label') + "...";
      var accesskey = ref.getAttribute('accesskey');
      var overlay = ' \
        <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                 xmlns:html="http://www.w3.org/1999/xhtml"> \
          <popup id="placesContext"> \
            <menuitem id="UC_placesContext_addBookmarks" \
                  label={label} \
                  accesskey={accesskey} \
                  selection="link" \
                  selectiontype="single" \
                  oncommand="UC_PlacesAddBookmark.historyAddBookmarks();" \
                  forcehideselection="bookmark|tagChild|folder|query|dynamiccontainer|separator|host" \
                  insertbefore="placesContext_copy"/> \
          </popup> \
        </overlay>';
      overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
      window.userChrome_js.loadOverlay(overlay, this);
    },

    observe: function(){
      var go = document.getElementById("goPopup");
      if (go) {
        go.setAttribute("context" , "placesContext");
        var pa = go.parentNode;
        pa.removeChild(go);
        pa.appendChild(go);
      }
    },

    // chrome://browser/skin/places/history-panel.jsから拝借。一部変更。
    historyAddBookmarks: function historyAddBookmarks(){
      // no need to check gHistoryTree.view.selection.count
      // node will be null if there is a multiple selection
      // or if the selected item is not a URI node

      var node = PlacesUIUtils.getViewForNode(document.popupNode).selectedNode;
      if (node && PlacesUtils.nodeIsURI(node)){
        PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(node.uri), node.title);
      }
    },

    //Fxのバージョン
    getVer: function(){
      var info = Components.classes["@mozilla.org/xre/app-info;1"]
                 .getService(Components.interfaces.nsIXULAppInfo);
      var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
      return ver;
    }
  }
  UC_PlacesAddBookmark.init();
