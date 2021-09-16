// ==UserScript==
// @name           openLibraryContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ブックマーク(検索結果含む)のコンテキストメニューからLibraryを開く, goParentFolderもどき
// @include        main
// @include        chrome://browser/content/places/places.xhtml
// @include        chrome://browser/content/places/bookmarksSidebar.xhtml
// @compatibility  Firefox 91
// @author         Alice0775
// @version        2021/09/16 Allow library from contentarea
// @version        2021/06/22 remove document.popupNode
// @version        2020/09/14 fix posiotion of menu
// @version        2020/08/17
// ==/UserScript==


var openLibraryContextMenu = {
  node: null,
  organizer:null,
  get ios() {
    return Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
  },

  get bmsvc() {
    return PlacesUtils.bookmarks;
  },

  init: function () {
    var placesContext = document.getElementById("placesContext");
    if (!placesContext) return;
      var menuitem = document.createXULElement("menuitem");
      menuitem.id = "placesContext_manageFolder2";
      menuitem.setAttribute("label", "Organize Bookmark");
      menuitem.setAttribute("accesskey", "k");
      menuitem.setAttribute("selectiontype", "single");
      menuitem.setAttribute("selection", "bookmark|folder|query|livemark/feedURI");
      menuitem.setAttribute("oncommand", "openLibraryContextMenu.showOrganizer(this.parentNode.triggerNode);");
      var afterNode = placesContext.firstChild; //document.getElementById("placesContext_openLinks:tabs");
      placesContext.insertBefore(menuitem, afterNode);
  },

  showOrganizer : function (atriggerNode) {
    var view = PlacesUIUtils.getViewForNode(atriggerNode);
    this.node = view.selectedNode;
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    this.organizer = wm.getMostRecentWindow("Places:Organizer");

    if (!this.organizer) {
      try {
       let win = wm.getMostRecentWindow("navigator:browser");
       this.organizer = win.openDialog("chrome://browser/content/places/places.xhtml",
                             "", "chrome,toolbar=yes,dialog=no,resizable");
      } catch(ex) {
      }
      this.organizer.addEventListener("load", this, false);
    } else {
      this.selectNode(this.node);
    }
  },

  getParentFolderByItemId: function(aNode){
    var parentFolderId = null;
    var itemType = PlacesUtils.nodeIsFolder(aNode) ||
                   PlacesUtils.nodeIsTagQuery(aNode) ? "folder" : "bookmark";
    var concreteId = PlacesUtils.getConcreteItemId(aNode);
    var isRootItem = PlacesUtils.isRootItem(concreteId);
    var itemId = aNode.itemId;
    if (isRootItem || PlacesUtils.nodeIsTagQuery(aNode)) {
      // If this is a root or the Tags query we use the concrete itemId to catch
      // the correct title for the node.
      itemId = concreteId;
    }

    //if (PlacesUtils.nodeIsBookmark(aNode)) {
      parentFolderId = this.bmsvc.getFolderIdForItem(itemId);
    //}

    return parentFolderId;
  },

  selectNode: function(aNode) {
    var itemType = PlacesUtils.nodeIsFolder(aNode) ||
                   PlacesUtils.nodeIsTagQuery(aNode) ? "folder" : "bookmark";
    var concreteId = PlacesUtils.getConcreteItemId(aNode);
    var isRootItem = PlacesUtils.isRootItem(concreteId);
    var itemId = aNode.itemId;
    if (isRootItem || PlacesUtils.nodeIsTagQuery(aNode)) {
      // If this is a root or the Tags query we use the concrete itemId to catch
      // the correct title for the node.
      itemId = concreteId;
    }
    var isFolder = PlacesUtils.nodeIsFolder(aNode);
    if (isFolder) {
      this.selectLeftPane([itemId]);
    } else if (PlacesUtils.nodeIsQuery(aNode)) {
      //userChrome_js.debug("query");
      var folderId = aNode.parent.itemId;
      if (folderId){
        this.selectLeftPane([folderId]);
        setTimeout(function(){this.selectRightPane([itemId]);}.bind(this), 250);
      }
    } else {
      //userChrome_js.debug("....");
      var folderId = this.getParentFolderByItemId(aNode);
      if (folderId){
        this.selectLeftPane([folderId]);
        setTimeout(function(){this.selectRightPane([itemId]);}.bind(this), 250);
      }
    }

    setTimeout(function(self){
      self.organizer.window.focus();
    }, 1, this);
  },

  selectItems2: function(view, aIDs) {
    var ids = aIDs; // don't manipulate the caller's array

    // Array of nodes found by findNodes which are to be selected
    var nodes = [];

    // Array of nodes found by findNodes which should be opened
    var nodesToOpen = [];

    // A set of URIs of container-nodes that were previously searched,
    // and thus shouldn't be searched again. This is empty at the initial
    // start of the recursion and gets filled in as the recursion
    // progresses.
    var nodesURIChecked = [];

    /**
     * Recursively search through a node's children for items
     * with the given IDs. When a matching item is found, remove its ID
     * from the IDs array, and add the found node to the nodes dictionary.
     *
     * NOTE: This method will leave open any node that had matching items
     * in its subtree.
     */
    function findNodes(node) {
      var foundOne = false;
      // See if node matches an ID we wanted; add to results.
      // For simple folder queries, check both itemId and the concrete
      // item id.
      var index = ids.indexOf(node.itemId);
      if (index == -1 /*&&
          node.type == Components.interfaces.nsINavHistoryResultNode.RESULT_TYPE_FOLDER_SHORTCUT*/) {
        index = ids.indexOf(PlacesUtils.asQuery(node).folderItemId); //xxx Bug 556739 3.7a5pre
      }

      if (index != -1) {
        nodes.push(node);
        foundOne = true;
        ids.splice(index, 1);
      }

      if (ids.length == 0 || !PlacesUtils.nodeIsContainer(node) ||
          nodesURIChecked.indexOf(node.uri) != -1)
        return foundOne;

      nodesURIChecked.push(node.uri);
      PlacesUtils.asContainer(node); //xxx Bug 556739 3.7a6pre

      // Remember the beginning state so that we can re-close
      // this node if we don't find any additional results here.
      var previousOpenness = node.containerOpen;
      node.containerOpen = true;
      for (var child = 0;  child < node.childCount && ids.length > 0;
           child++) {
        var childNode = node.getChild(child);
        var found = findNodes(childNode);
        if (!foundOne)
          foundOne = found;
      }

      // If we didn't find any additional matches in this node's
      // subtree, revert the node to its previous openness.
      if (foundOne)
        nodesToOpen.unshift(node);
      node.containerOpen = previousOpenness;
      return foundOne;
    } //findNodes

/*
    // Null the viewer while looking for nodes
    var result = this.result;
    var oldViewer = result.viewer;
    result.viewer = null;
    findNodes(this.result.root);
    result.viewer = oldViewer;
*/
    // Disable notifications while looking for nodes.
    let result = view.result;
    let didSuppressNotifications = result.suppressNotifications;
    if (!didSuppressNotifications)
      result.suppressNotifications = true
    try {
      findNodes(view.result.root);
    }
    finally {
      if (!didSuppressNotifications)
        result.suppressNotifications = false;
    }

    // For all the nodes we've found, highlight the corresponding
    // index in the tree.
    var resultview = view.view;
    //var resultview = this.getResultView();
    var selection = resultview.selection;
    selection.selectEventsSuppressed = true;
    selection.clearSelection();
    // Open nodes containing found items
    for (var i = 0; i < nodesToOpen.length; i++) {
      nodesToOpen[i].containerOpen = true;
    }
    for (var i = 0; i < nodes.length; i++) {
      var index = resultview.treeIndexForNode(nodes[i]);
      if (index == -1 /*Ci.nsINavHistoryResultTreeViewer.INDEX_INVISIBLE*/)
        continue;
      selection.rangedSelect(index, index, true);
    }
    selection.selectEventsSuppressed = false;

  },
		
  selectLeftPane: function(leftPaneItemIds) {
    //userChrome_js.debug("selectLeftPane");
    this.organizer.document.getElementById("searchFilter").value = "";
    var places = this.organizer.document.getElementById("placesList");
    this.selectItems2(places, leftPaneItemIds);
    //places.selectItems(leftPaneItemIds, true);
    setTimeout(() => {
      var tbo = places/*.treeBoxObject*/;
      if (places.currentIndex)
        tbo.ensureRowIsVisible(places.currentIndex);
    }, 0);
  },

  selectRightPane: function(rightPaneItemIds) {
    //userChrome_js.debug("selectRightPane" + rightPaneItemIds);
    var places = this.organizer.document.getElementById("placeContent");

		var target = this.findNode(places.view.result.root, rightPaneItemIds[0]);
		if (target) {
			places.selectNode(target);
      setTimeout(() => {
        var tbo = places/*.treeBoxObject*/;
        if (places.currentIndex)
          tbo.ensureRowIsVisible(places.currentIndex);
      }, 0);
		}
  },

	findNode: function(node, id) {
		for (let i = 0;  i < node.childCount; i++) {
			let childNode = node.getChild(i);
      //userChrome_js.debug("childNode" + childNode.itemId);
			if (childNode.itemId == id) {
  			return childNode;
			}
		}
		return null;
	},

  selectOnLoad: function() {
    setTimeout(function(self){
      self.selectNode(self.node);
    }, 1, this);
    this.organizer.removeEventListener("load", this, false);
  },

  handleEvent: function(event){
    switch (event.type){
      case 'load':
        this.selectOnLoad(event);
        break;
    }
  }
}
openLibraryContextMenu.init();
