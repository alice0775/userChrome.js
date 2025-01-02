// ==UserScript==
// @name          patchForBug892485.LibraryScroll.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Prevent scroll History sidebar to top when a history entry added 
// @include       chrome://browser/content/places/places.xhtml
// @include       chrome://browser/content/places/places.xul
// @async          true
// @compatibility Firefox 78
// @author        alice0775
// @version       2021/07/16 Bug 1482389 - Convert TreeBoxObject to XULTreeElement
// @version       2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser
// @version       2018/10/04 60+
// @version       2014/03/01 Fix scroll position
// @version       2013/11/20 Fix selected index is 0 if scroll = 0
// @version       2013/07/29 Fix middle click
// @version       2013/07/16 Fix sortorder == ascending
// @version       2013/07/16
// @note          this workaround fails sometimes :( especially double click to open it
// ==/UserScript==

var patchForBug892485LibraryScroll = {
  lastScrollPosition: null,
  lastCurrentIndex: null,

  get _BTree() {
    return document.getElementById("placeContent");
  },
  
  get viewType() {
    if (document.getElementById("placesContentDate").hasAttribute('sortDirection'))
      return document.getElementById("placesContentDate").getAttribute('sortDirection');
    else
      return null;
  },

  init: function(){
    if (!this._BTree)
      return;
    
    window.addEventListener('command', this, false);
    this._BTree.addEventListener('click', this, true);
    this._BTree.addEventListener('dblclick', this, true);
    this._BTree.addEventListener('keypress', this, true);
    this._BTree.addEventListener('scroll', this, true);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    if (!this._BTree)
      return;

    window.removeEventListener('command', this, false);
    this._BTree.removeEventListener('click', this, true);
    this._BTree.removeEventListener('dblclick', this, true);
    this._BTree.removeEventListener('keypress', this, true);
    this._BTree.removeEventListener('scroll', this, true);
    window.removeEventListener('unload', this, false);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "scroll":
        if (this.viewType)
          this.lastScrollPosition = this.getScrollPosition();
          this.lastCurrentIndex = this.getCurrentIndex();
        break;
      case "command":
        if (this.viewType)
          this.onCommand(event);
        break;
      case "click":
        if (this.viewType && event.button == 1)
          this.onClick(event);
        break;
      case "dblclick":
        if (this.viewType)
          this.onClick(event);
        break;
      case "keypress":
        if (this.viewType)
          this.onKeypress(event);
        break;
      case "select":
        if (this.viewType)
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
      if (this.viewType == "descending" && index == 0 ||
          this.viewType == "ascending" && index == this._BTree.view.rowCount - 1)
        return;
      this._BTree.scrollToRow(pos);
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
        if (this.viewType == "descending" &&
            (this.getScrollPosition() == 0 || this.getCurrentIndex() == 0))
          return;
        if (this.viewType == "ascending" &&
            (this.getLastVisibleRow() >= this._BTree.view.rowCount - 1 ||
             this.getCurrentIndex() == this._BTree.view.rowCount - 1))
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
      if (this.viewType == "descending" &&
          (this.getScrollPosition() == 0 && this.getCurrentIndex() == 0))
        return;
      if (this.viewType == "ascending" &&
          (this.getLastVisibleRow() >= this._BTree.view.rowCount - 1 ||
           this.getCurrentIndex() == this._BTree.view.rowCount - 1))
        return;
      this.lastScrollPosition = this.getScrollPosition();
      this.lastCurrentIndex = this.getCurrentIndex();
      this._BTree.addEventListener('select', this, true);
    }
  }
}

patchForBug892485LibraryScroll.init();
