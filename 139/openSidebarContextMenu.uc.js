// ==UserScript==
// @name           openSidebarContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ブックマーク(検索結果含む)のコンテキストメニューからSidebarを開く, goParentFolderもどき(openLibraryContextMenu.uc.jsのSidebar版)
// @include        main
// @async          true
// @include        chrome://browser/content/places/places.xhtml
// @include        chrome://browser/content/places/bookmarksSidebar.xhtml
// @author         Alice0775
// @compatibility  135
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2024/09/02 Bug 1916098 - Remove appcontent box.
// @version        2024/05/05 Bug 1892965 - Rename Sidebar launcher and SidebarUI
// @version        2023/01/10 Bug 1382992 - Remove the synchronous getFolderIdForItem()
// @version        2021/12/24 remove menu in sidebar due to Bug 469441
// @version        2021/06/22 remove document.popupNode
// @version        2020/12/14 fix ucjs_expand_sidebar hack
// @version        2020/12/14 simplify & ucjs_expand_sidebar hack
// @version        2020/12/13 simplify
// @version        2020/12/13 save folder state
// @version        2020/12/12
// ==/UserScript==


var openSidebarContextMenu = {
  init: function () {
    this.db = this.openDB();
    var placesContext = document.getElementById("placesContext");
    if (!placesContext) return;
    if (location.href == "chrome://browser/content/places/bookmarksSidebar.xhtml") return;
      var menuitem = document.createXULElement("menuitem");
      menuitem.id = "placesContext_manageFolder3";
      menuitem.setAttribute("label", "Organize Bookmark in Sidebar");
      menuitem.setAttribute("accesskey", "k");
      menuitem.setAttribute("selectiontype", "single");
      menuitem.setAttribute("selection", "bookmark|folder|query|livemark/feedURI");
      menuitem.addEventListener("command", (event) => event.target.ownerGlobal.openSidebarContextMenu.showSidebar(menuitem.parentNode.triggerNode));
      //menuitem.setAttribute("oncommand", "openSidebarContextMenu.showSidebar(this.parentNode.triggerNode));
      var afterNode = placesContext.firstChild;
      placesContext.insertBefore(menuitem, afterNode);
  },

  showSidebar: function(atriggerNode) {
    let view = PlacesUIUtils.getViewForNode(atriggerNode);
    let node = view.selectedNode;
    let win = Services.wm.getMostRecentWindow("navigator:browser");
    win.SidebarController._show("viewBookmarksSidebar").then(() => {
      let sidebarWin = win.SidebarController.browser.contentWindow;
      sidebarWin.openSidebarContextMenu.show(node);

      // xxx ucjs_expand_sidebar hack
      if (typeof win.ucjs_expand_sidebar != "undefined" ) {
        win.SidebarController._box.collapsed = false;
	      win.SidebarController._splitter.hidden = false;
        win.ucjs_expand_sidebar._opend = true;
        win.ucjs_expand_sidebar._loadKeepItSizes("viewBookmarksSidebar");
        if (win.ucjs_expand_sidebar._FLOATING_SIDEBAR) {
          let x = win.document.getElementById("tabbrowser-tabbox").getBoundingClientRect().x;
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
      let aFolderItemId = openSidebarContextMenu.getFolderIdForItem(node.itemId);
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
  },

  getFolderIdForItem: function(aItemId) {
    let sql = `SELECT b.id, h.url, b.title, b.position, b.fk, b.parent AS folderId, b.type, 
               b.dateAdded, b.lastModified, b.guid, t.guid, t.parent, 
               b.syncStatus 
               FROM moz_bookmarks b 
               LEFT JOIN moz_bookmarks t ON t.id = b.parent 
               LEFT JOIN moz_places h ON h.id = b.fk 
               WHERE b.id = :item_id`;
    let stmt = this.db.createStatement(sql);
    stmt.params['item_id'] = aItemId;
    let FolderId = null;
    try {
      while (stmt.executeStep()) {
        FolderId = stmt.row.folderId;
      }
    } finally {
      stmt.finalize();
    }
    return FolderId;
  },

  openDB: function() {
    /*
    let targetPath = PathUtils.join(
      PathUtils.profileDir,
      "places.sqlite"
    );
    let file = new FileUtils.File(targetPath);
    return Services.storage.openDatabase(file);
    */
    return PlacesUtils.history.DBConnection;
  }
}
openSidebarContextMenu.init();
