// ==UserScript==
// @name           openSidebarContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ブックマーク(検索結果含む)のコンテキストメニューからSidebarを開く, goParentFolderもどき(openLibraryContextMenu.uc.jsのSidebar版)
// @include        main
// @include        chrome://browser/content/places/places.xhtml
// @include        chrome://browser/content/places/bookmarksSidebar.xhtml
// @compatibility  Firefox 91
// @author         Alice0775
// @version        2021/06/22 remove document.popupNode
// @version        2020/12/14 fix ucjs_expand_sidebar hack
// @version        2020/12/14 simplify & ucjs_expand_sidebar hack
// @version        2020/12/13 simplify
// @version        2020/12/13 save folder state
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
      menuitem.setAttribute("oncommand", "openSidebarContextMenu.showSidebar(this.parentNode.triggerNode);");
      var afterNode = placesContext.firstChild;
      placesContext.insertBefore(menuitem, afterNode);
  },

  showSidebar: function(atriggerNode) {
    let view = PlacesUIUtils.getViewForNode(atriggerNode);
    let node = view.selectedNode;
    let win = Services.wm.getMostRecentWindow("navigator:browser");
    win.SidebarUI._show("viewBookmarksSidebar").then(() => {
      let sidebarWin = win.SidebarUI.browser.contentWindow;
      sidebarWin.openSidebarContextMenu.show(node);

      // xxx ucjs_expand_sidebar hack
      if (typeof win.ucjs_expand_sidebar != "undefined" ) {
        win.SidebarUI._box.collapsed = false;
	      win.SidebarUI._splitter.hidden = false;
        win.ucjs_expand_sidebar._opend = true;
        win.ucjs_expand_sidebar._loadKeepItSizes("viewBookmarksSidebar");
        if (win.ucjs_expand_sidebar._FLOATING_SIDEBAR) {
          let x = win.document.getElementById("appcontent").getBoundingClientRect().x;
          win.ucjs_expand_sidebar._sidebar_box.style.setProperty("left", x + "px", "");
        }
      }
      /// xxx
    });
  },

  show: function(node) {
    let delay = 0;
    let tree = document.getElementById("bookmarks-view");
    if (document.getElementById("search-box").value) {
      document.getElementById("search-box").value = "";
      tree.place = tree.place;
      delay = 250;
    }
    let guid = node.bookmarkGuid
    setTimeout(() => {
      let aFolderItemId = PlacesUtils.bookmarks.getFolderIdForItem(node.itemId);
      if (aFolderItemId) {
        tree.selectItems([guid]);
      } else {
        return;
      }

      // xxx
      this.xulStore(tree);

      let index = tree.currentIndex;
      if (tree.view.isContainer(index)) {
        if (!tree.view.isContainerOpen(index)) {
          tree.view.toggleOpenState(index);
        }
        let e = tree.view.selection.currentIndex
        tree.scrollToRow(e)
      } else {
        tree.ensureRowIsVisible(index);
      }
      tree.focus();
    }, delay);
  },

  xulStore: function(tree) {
    let docURI = tree.ownerDocument.documentURI;
    let view = tree.view;
    let node = view.nodeForTreeIndex(tree.currentIndex);


    var parent = node.parent;
    if (parent) {
      // Build a list of all of the nodes that are the parent of this one
      // in the result.
      var parents = [];
      var root = tree.result.root;
      while (parent && parent != root) {
        parents.push(parent);
        parent = parent.parent;
      }

      // Walk the list backwards (opening from the root of the hierarchy)
      // opening each folder as we go.
      for (var i = parents.length - 1; i >= 0; --i) {
        let index = view.treeIndexForNode(parents[i]);
        if (index != -1 && view.isContainer(index)) {
          let node = view._rows[index];
          let uri = node.uri;
          if (node.containerOpen) {
            Services.xulStore.setValue(docURI, uri, "open", "true");
          } else {
            Services.xulStore.removeValue(docURI, uri, "open");
          }
        }
      }
    }
  }
}
openSidebarContextMenu.init();
