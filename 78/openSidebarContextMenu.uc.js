// ==UserScript==
// @name           openSidebarContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ブックマーク(検索結果含む)のコンテキストメニューからSidebarを開く, goParentFolderもどき(openLibraryContextMenu.uc.jsのSidebar版)
// @include        main
// @include        chrome://browser/content/places/places.xhtml
// @include        chrome://browser/content/places/bookmarksSidebar.xhtml
// @compatibility  Firefox 78
// @author         Alice0775
// @version        2020/12/12
// ==/UserScript==


var openSidebarContextMenu = {
  init: function () {
    var placesContext = document.getElementById("placesContext");
    if (!placesContext) return;
      var menuitem = document.createXULElement("menuitem");
      menuitem.id = "placesContext_manageFolder3";
      menuitem.setAttribute("label", "Organize Bookmark in Sidebar");
      menuitem.setAttribute("accesskey", "k");
      menuitem.setAttribute("selectiontype", "single");
      menuitem.setAttribute("selection", "bookmark|folder|query|livemark/feedURI");
      menuitem.setAttribute("oncommand", "openSidebarContextMenu.showSidebar();");
      var afterNode = placesContext.firstChild; //document.getElementById("placesContext_openLinks:tabs");
      placesContext.insertBefore(menuitem, afterNode);
  },

  showSidebar : function () {
    let view = PlacesUIUtils.getViewForNode(document.popupNode);
    let node = view.selectedNode;

    let win = Services.wm.getMostRecentWindow("navigator:browser");
    let delay = 0;
    win.SidebarUI._show("viewBookmarksSidebar").then(() => {
      let tree = win.SidebarUI.browser.contentDocument.getElementById("bookmarks-view");
      if (win.SidebarUI.browser
             .contentDocument.getElementById("search-box").value) {
        win.SidebarUI.browser
           .contentDocument.getElementById("search-box").value = "";
        tree.place = tree.place;
        delay = 250;
      }
      setTimeout(() => {
        tree.selectPlaceURI(node.uri);
        let index = tree.currentIndex;
        if (tree.view.isContainer(index)){
          if (!tree.view.isContainerOpen(index)) {
            tree.view.toggleOpenState(index);
          }
          // let s = tree.getFirstVisibleRow();
          let e = tree.view.selection.currentIndex
          tree.scrollToRow(e)
        }
        tree.focus();
      }, delay);
    });
  }

}
openSidebarContextMenu.init();
