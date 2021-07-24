// ==UserScript==
// @name          acBookMarkTreeFolder_Fx37
// @namespace     http://www.sephiroth-j.de/mozilla/
// @description   Autoclose BookMark Folders
// @include       chrome://browser/content/places/bookmarksSidebar.xhtml
// @include       chrome://browser/content/places/bookmarksSidebar.xul
// @compatibility Firefox 80
// @author        original Ronny Perinke
// @version       original Autoclose Bookmark History Folders 0.5.5
// @modiffied     Alice0775
// @version       2021/07/24 remove setTimeout
// @version       2021/07/23 restore scroll position more aggressively
// @version       2021/04/26 Bug 1620467 - Support standard 'appearance' CSS property unprefixed
// @version       2021/03/20 fix right click on folder should not toggle
// @version       2020/12/13 fix scroll position
// @version       2020/12/12 remove prefs and simplify
// @version       2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser
// @version       2019/01/18 fix for 66(Bug 1482389 - Convert TreeBoxObject to XULTreeElement)
// @version       2019/01/18 fix dark theme
// @version       2018/08/10 fix target scroll listener
// @version       2018/08/13 61+
// @version       2012/12/07 //aEvent.preventDefault();
// @Note          http://space.geocities.yahoo.co.jp/gl/alice0775
// @Note          I got permission to open this script to the public from Mr.Sephiroth on July 28,2007.
// ==/UserScript==
// @version       2008/11/28 Firefox3.1b3pre tboの初期化に時間が掛かるようでsetTimeoutするようにした
// @version       2007/12/09 21:00
/* ***** BEGIN LICENSE BLOCK *****
* Author: Ronny Perinke http://www.sephiroth-j.de
*
* License:  This extension is subject to MPL 1.1/GPL 2.0/LGPL 2.1
* You may obtain a copy of the License at http://www.mozilla.org/MPL/ and http://www.gnu.org/copyleft/gpl.html
* other rules:
* 1)  If you use any of this code please include references or credit in your code to myself, and include my homepage URL
* 2)  You MUST contact me, the author before you use this code (I like to know that it's been usefull).
* 3)  I would greatly appreciate a link back to me or credit somewhere on your site (makes me feel good, not required).
* 4)  If improvments are made to the code, please inform me so that I can use it (if applicable, not required).
* 5)  Translators: please contact me and send me a copy of the language files and/or the new xpi with the new language.
* I'd like to include them in the official xpi on my server. You will list you in the contributors list.
*
* ***** END LICENSE BLOCK ***** */

var acBookMarkTreeFolder = {

  kPrefROWPOSITION: "ac-BookMarkTreeFolder.lastBookmarkFolder",

  get _BTree() {
    return document.getElementById("bookmarks-view");
  },

  get _searchbox() {
    return document.getElementById("search-box");
  },

  init: function(){
    if (!this._BTree)
      return;

    document.addEventListener('unload', this, false);
    this._BTree.addEventListener('click', this, false);
    document.querySelector(".sidebar-placesTreechildren")
            .addEventListener("scroll", this, false);

    this.addToolbar();

    searchBookmarks_org = searchBookmarks; 
    searchBookmarks = function(aSearchString) {
      searchBookmarks_org(aSearchString);
      acBookMarkTreeFolder.restoreScrollPosition();
    }

    this.restoreScrollPosition();

  },

  uninit: function(){
    this._BTree.removeEventListener('click', this, false);
    document.querySelector(".sidebar-placesTreechildren")
            .removeEventListener("scroll", this, false);
  },

  handleEvent: function(aEvent){
    switch(aEvent.type) {
      case 'scroll':
        this.onScroll();
        break;
      case 'click':
        this.onClick(aEvent);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  _stimer: null,
  onScroll: function(){
    if (this._searchbox.value)
      return;

    if (this._stimer)
      clearTimeout(this._stimer);
    this._stimer = setTimeout(() => {
      var getRow = this._BTree.getFirstVisibleRow();
      Services.prefs.setIntPref(this.kPrefROWPOSITION, getRow);
    }, 50);
  },

  addToolbar: function(){
    const kXULNS =
           "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var toolbar = document.getElementById("acBookMarkTreeFolder-toolbar");
    if (toolbar){
      return;
    }
    var toolbox = document.createElementNS(kXULNS, "toolbox");
    toolbox.setAttribute("style", "appearance: none;");
    toolbar = document.createElementNS(kXULNS, "toolbar");
    toolbar.setAttribute("id", "acBookMarkTreeFolder-toolbar");
   var closeAllButton = document.createElementNS(kXULNS, "toolbarbutton");
    closeAllButton.setAttribute("label", "\u6298\u7573");//折畳
    closeAllButton.setAttribute("oncommand", "acBookMarkTreeFolder.closeAll();");
    var openAllButton = document.createElementNS(kXULNS, "toolbarbutton");
    openAllButton.setAttribute("label", "\u5c55\u958b");//展開
    openAllButton.setAttribute("oncommand", "acBookMarkTreeFolder.openAll();");

    toolbar.appendChild(closeAllButton);
    toolbar.appendChild(openAllButton);
    toolbox.appendChild(toolbar);
    this._BTree.parentNode.insertBefore(toolbox, this._BTree);
    return;
  },

  restoreScrollPosition() {
    if (this._searchbox.value)
      return;

    if (this._BTree.result) {
      var pos = Services.prefs.getIntPref(this.kPrefROWPOSITION, 0);
      this._BTree.scrollToRow(pos);
    }
  },

  onClick: function(aEvent){
    var parents   = new Array();
    var aView = this._BTree.view;
    if (aEvent.button != 0){
      return;
    }

    let cell = this._BTree.getCellAt(aEvent.clientX, aEvent.clientY);
    if (cell.row == -1)
      return;
//alert(this._BTree.selectedNode.itemId);

    if(!aView.isContainer(cell.row))
      return;
    if (this._BTree.currentIndex != cell.row){
      return;
    }

    aView.selection.select(this._BTree.currentIndex);
    for (var i = this._BTree.currentIndex; i != -1; i = aView.getParentIndex(i)){
      parents.push(i);
    }
    parents.reverse();
    for (var i = aView.rowCount - 1; i >= 0; i--){
      if (i == parents[parents.length - 1]){
        parents.pop();
      }else{
        if (aView.isContainer(i) && aView.isContainerOpen(i)){
          aView.toggleOpenState(i);
        }
      }
    }
    this._BTree.ensureRowIsVisible(this._BTree.currentIndex);
    //aEvent.preventDefault();
  },

  closeAll: function(){
    var aView = this._BTree.view;
    if (aView){
      for (var i = aView.rowCount-1; i>=0; i--){
        if (aView.isContainer(i) && aView.isContainerOpen(i)) aView.toggleOpenState(i);
      }
    }
  },

  openAll: function(){
    var aView = this._BTree.view;
    if (aView){
      var oldrows = -1;
      var rows = aView.rowCount;
      do{
        for (var i = rows-1; i>=0; i--){
          if (aView.isContainer(i) && !aView.isContainerOpen(i)) aView.toggleOpenState(i);
        }
        oldrows = rows;
        rows = aView.rowCount;
      }
      while(rows != oldrows);
    }
  }
}

acBookMarkTreeFolder.init();
