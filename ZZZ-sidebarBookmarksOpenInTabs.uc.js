// ==UserScript==
// @name          ZZZ-sidebarBookmarksOpenInTabs.uc.js
// @namespace     http://www.sephiroth-j.de/mozilla/
// @description   サイドバーのブックマークにおいて, →をクリックすると新規タブに開くようにする
// @include       main
// @include       chrome://browser/content/bookmarks/bookmarksPanel.xul
// @compatibility Firefox 3.0 3.1
// @author        Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version       2012/06/28 00:00 Firefox14-
// @version       2009/09/11 00:00 Minefield 3.7a1pre
// @version       2009/08/14 19:00 面倒だから中クリックに置き換え
// @version       2009/01/04 16:00 bookmarksHistoryPanel.uc.xulに対応
// @version       2008/11/03
// @Note          http://space.geocities.yahoo.co.jp/gl/alice0775

var sidebarBookmarksOpenInTabs = {
  _BTree: null,

  init: function(){
    this._BTree = document.getElementById("bookmarks-view");
    this._BTree.addEventListener('click',function(event){sidebarBookmarksOpenInTabs.onClick(event);},true);

    var style = " \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
      #bookmarks-view .sidebar-placesTreechildren::-moz-tree-cell(container, hover), \
      #bookmarks-view .sidebar-placesTreechildren::-moz-tree-cell(leaf, hover) \
      { \
        background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABa0lEQVQ4ja2TSS9DcRTF3zfpB7CUiKcWhg0LaxILbHQlQjQSukHFFGxYiFASMccQhEYi1PhMMRMxtEFiaEnb19d/3+ZnJTG0lRdOcpbnl3tP7pWk/xZgEkLwYcOAUDjMxK2PvBU3l76gcYAvqFG16iZp6ISsiXOeA9qtIYCqhenbvsfcuYfcsUfRyBkPPtURN6TresHnvYUQNDqvSGlVSG1VaHJe4Vc1ANOP8EdpDpebssFjKkdPaZi5xNJ3iLl+Hdm+TkbTJqNbd6ha+GcngGlKuUO2Lcd1eo0Lz5M/BmDDg2xdjOv06iU8jzEAQggcCxdYuxSqe3ZoHj7A0r6GuXQOuWSWzIp5Jl3XhKKtEK3EoKpR16sgF49htozTMrBLIFaJ36WGNPqn90nO7yYxt4tC2yTe1wC6rhf8GpYkSfK++imvHyMhu5a0/DaeXt6IRCLx7+DrBCGGplbIKbRzdHaDEMLYJf75mYzqHeqLWDxx3b5cAAAAAElFTkSuQmCC')  no-repeat; \
        background-position: center right !important; \
      } \
      #bookmarks-view .sidebar-placesTreechildren::-moz-tree-cell(separator, hover) \
      { \
        background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEklEQVQ4jWNgGAWjYBSMAggAAAQQAAF/TXiOAAAAAElFTkSuQmCC')  no-repeat !important; \
        background-position: center right !important; \
      }".replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

  },

  uninit: function(){
    this._BTree.removeEventListener('click',function(event){sidebarBookmarksOpenInTabs.onClick(event);},true);
  },

  onClick: function(aEvent){
     if (aEvent.button == 0){
      var tbo = this._BTree.treeBoxObject;
      var row = {}, col = {}, obj = {};
      tbo.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
      if (row.value == -1) return;
      var row1 = {}, col1 = {}, obj1 = {};
      tbo.getCellAt(aEvent.clientX + 16, aEvent.clientY, row1, col1, obj1);

      if (!col1.value){
        try {
          var node = tbo.view.nodeForTreeIndex(row.value);
        } catch(e) {
          node = this._BTree.view.nodeForTreeIndex(row.value);
        }
        try {
          var isContainer = tbo.view.isContainer(row.value);
        } catch(e) {
          isContainer = this._BTree.view.isContainer(row.value);
        }
        if (isContainer || !/^javascript:/.test((node.uri))) {
          aEvent.preventDefault();
          aEvent.stopPropagation();
          this.handleTreeClick(this._BTree, aEvent);
          return;
        }
      }
    }
  },

  handleTreeClick: function SU_handleTreeClick(aTree, aEvent) {
    var tbo = aTree.treeBoxObject;
    var row = { }, col = { }, obj = { };
    tbo.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);

    try {
      var isContainer = tbo.view.isContainer(row.value);
    } catch(e) {
      isContainer = this._BTree.view.isContainer(row.value);
    }
    try {
      var index = tbo.view.nodeForTreeIndex(row.value)
    } catch(e) {
      index = this._BTree.view.nodeForTreeIndex(row.value)
    }
    var openInTabs = isContainer &&
                     PlacesUtils.hasChildURIs(index);

    if (openInTabs &&
        isContainer &&
        aEvent.originalTarget.localName == "treechildren") {
      tbo.view.selection.select(row.value);
      this.middleClick(aEvent.target, aEvent);
      //this.openContainerNodeInTabs(aTree.selectedNode, aEvent);
    }
    else if (!isContainer &&
             aEvent.originalTarget.localName == "treechildren") {
      // Clear all other selection since we're loading a link now. We must
      // do this *before* attempting to load the link since openURL uses
      // selection as an indication of which link to load.
      tbo.view.selection.select(row.value);
      this.middleClick(aEvent.target, aEvent);
      //this.openNodeWithEvent(aTree.selectedNode, aEvent);
    }
  },

  middleClick: function(elem, event){
          var MouseEvents = document.createEvent("MouseEvents");
          /*initMouseEvent(type, canBubble, cancelable, view,
                         detail, screenX, screenY, clientX, clientY,
                         ctrlKey, altKey, shiftKey, metaKey,
                         button, relatedTarget);
          */
          MouseEvents.initMouseEvent("click", true, true, null,
                         event.detail, event.screenX, event.screenY, event.clientX, event.clientY,
                         event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
                         1, event.relatedTarget);
          elem.dispatchEvent(MouseEvents);
  }/*,

  openContainerNodeInTabs: function PU_openContainerInTabs(aNode, aEvent) {
    var urlsToOpen = PlacesUtils.getURLsForContainerNode(aNode);
    if (!PlacesUIUtils._confirmOpenInTabs(urlsToOpen.length))
      return;

    this._openTabset(urlsToOpen, aEvent);
  },

  openURINodesInTabs: function PU_openURINodesInTabs(aNodes, aEvent) {
    var urlsToOpen = [];
    for (var i=0; i < aNodes.length; i++) {
      // skip over separators and folders
      if (PlacesUtils.nodeIsURI(aNodes[i]))
        urlsToOpen.push({uri: aNodes[i].uri, isBookmark: PlacesUtils.nodeIsBookmark(aNodes[i])});
    }
    this._openTabset(urlsToOpen, aEvent);
  },

  _openTabset: function PU__openTabset(aItemsToOpen, aEvent) {
    var urls = [];
    for (var i = 0; i < aItemsToOpen.length; i++) {
      var item = aItemsToOpen[i];
      if (item.isBookmark)
        PlacesUIUtils.markPageAsFollowedBookmark(item.uri);
      else
        PlacesUIUtils.markPageAsTyped(item.uri);

      urls.push(item.uri);
    }

    var where = aEvent.shiftKey ? "tabshifted" : "tab";
    var browserWindow = getTopWin();
    var loadInBackground = where == "tabshifted" ? true : false;
    var replaceCurrentTab = where == "tab" ? false : true;
    browserWindow.getBrowser().loadTabs(urls, loadInBackground,
                                        replaceCurrentTab);
  },

  openNodeWithEvent: function PU_openNodeWithEvent(aNode, aEvent) {
    PlacesUIUtils.openNodeIn(aNode, aEvent.shiftKey ? "tabshifted" : "tab");
  }
*/
}

if (location.href == 'chrome://browser/content/bookmarks/bookmarksPanel.xul')
  sidebarBookmarksOpenInTabs.init();
document.addEventListener('unload', sidebarBookmarksOpenInTabs.uninit, false);
