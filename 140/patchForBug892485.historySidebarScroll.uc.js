// ==UserScript==
// @name          patchForBug892485.historySidebarScroll.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Prevent scroll History sidebar to top when a history entry added
// @include       main
// @include       chrome://browser/content/places/historySidebar.xhtml
// @include       chrome://browser/content/places/historySidebar.xhtml?SM
// @async          true
// @compatibility Firefox 102
// @author        alice0775
// @version       2025/09/27 fix working with SidebarModoki
// @version       2023/05/26 Working with "visited"
// @version       2021/07/16 Bug 1482389 - Convert TreeBoxObject to XULTreeElement
// @version       2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser
// @version       2018/10/04 60+
// @version       2014/03/01 Fix scroll position
// @version       2013/11/20 Fix selected index is 0 if scroll = 0
// @version       2013/07/30 Fix Working with "bookmarks history panel"
// @version       2013/07/30 Working with "bookmarks history panel"
// @version       2013/07/30 Working with any sorting mode if existing searchTerm
// @version       2013/07/14 Do nothing if currentIndex is 0.
// @version       2013/07/12
// @note          this workaround fails sometimes :(
// ==/UserScript==

var patchForBug892485 = {
  lastScrollPosition: null,
  lastCurrentIndex: null,

  get _BTree() {
    return document.getElementById("historyTree");
  },
  
  get viewType() {
    return document.getElementById("viewButton").getAttribute('selectedsort');
  },

  get serchValue() {
    var id = "PanelHistorysearch-box";
    if (!document.getElementById(id))
      return null
    return document.getElementById(id).value;
  },
  

  init: function(){
    if (!this._BTree)
      return;
    
    window.addEventListener('command', this, false);
    this._BTree.addEventListener('click', this, true);
    this._BTree.addEventListener('keypress', this, true);
    this._BTree.addEventListener('scroll', this, true);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    if (!this._BTree)
      return;

    window.removeEventListener('command', this, false);
    this._BTree.removeEventListener('click', this, true);
    this._BTree.removeEventListener('keypress', this, true);
    this._BTree.removeEventListener('scroll', this, true);
    window.removeEventListener('unload', this, false);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "scroll":
        if (this.viewType == "lastvisited" || this.viewType == "visited" || !!this.serchValue)
          this.lastScrollPosition = this.getScrollPosition();
          this.lastCurrentIndex = this.getCurrentIndex();
        break;
      case "command":
        if (this.viewType == "lastvisited" || this.viewType == "visited" || !!this.serchValue)
          this.onCommand(event);
        break;
      case "click":
        if (this.viewType == "lastvisited" || this.viewType == "visited" || !!this.serchValue)
          this.onClick(event);
        break;
      case "keypress":
        if (this.viewType == "lastvisited" || this.viewType == "visited" || !!this.serchValue)
          this.onKeypress(event);
        break;
      case "select":
        if (this.viewType == "lastvisited" || this.viewType == "visited" || !!this.serchValue)
          this.onSelected(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  getCurrentIndex: function() {
    return this._BTree.currentIndex;
  },

  getScrollPosition: function() {
    return this._BTree.getFirstVisibleRow();
  },

  onSelected: function(event) {
    this._BTree.removeEventListener('select', this, true);

    let pos = this.lastScrollPosition;
    //top.userChrome_js.debug("after " + this.lastCurrentIndex);
    if (this._BTree.view.rowCount >= pos) {
      let index = this.lastCurrentIndex
      if (index != 0 ) {
        this._BTree.scrollToRow(pos);
      }
      this._BTree.view.selection.select(index);
    }
  },

  onCommand: function(aEvent){
    let command = aEvent.target;
    if (/placesCmd_open|placesCmd_open:tab|placesCmd_open:window/.test(command.id)) {
      let tree = this._BTree;
      let node = tree.selectedNode;
      if (node) {
          this.lastScrollPosition = this.getScrollPosition();
          this.lastCurrentIndex = this.getCurrentIndex();
          this._BTree.addEventListener('select', this, true);
      }
    }
  },

  onKeypress: function(aEvent){
    let tree = aEvent.target;
    let node = tree.selectedNode;
    if (node) {
      if (aEvent.keyCode == KeyEvent.DOM_VK_RETURN) {
        if (this.getScrollPosition() == 0 || this.getCurrentIndex() == 0)
          return;
        this.lastScrollPosition = this.getScrollPosition();
        this.lastCurrentIndex = this.getCurrentIndex();
        this._BTree.addEventListener('select', this, true);
      }
    }
    
  },

  onClick: function(aEvent){
    let tbo = this._BTree;
    let aView = tbo.view;
    if (aEvent.button >= 2 ) {
      return;
    }

    let cell = tbo.getCellAt(aEvent.clientX, aEvent.clientY);

    if (cell.row == -1 || cell.childElt == "twisty")
      return;

    let isContainer = tbo.view.isContainer(cell.row);

    if (!isContainer &&
        aEvent.originalTarget.localName == "treechildren") {
      // Clear all other selection since we're loading a link now. We must
      // do this *before* attempting to load the link since openURL uses
      // selection as an indication of which link to load.
      if (this.getScrollPosition() == 0 && this.getCurrentIndex() == 0)
        return;
      this.lastScrollPosition = this.getScrollPosition();
      this.lastCurrentIndex = this.getCurrentIndex();
      this._BTree.addEventListener('select', this, true);
    }
  }
}

patchForBug892485.init();
