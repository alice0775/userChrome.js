// ==UserScript==
// @name          acHistoryFolder_Fx37
// @namespace     http://www.sephiroth-j.de/mozilla/
// @description   Autoclose History Folders
// @include       chrome://browser/content/places/historySidebar.xhtml
// @include       chrome://browser/content/places/historySidebar.xhtml?revamped
// @compatibility Firefox 136
// @author        original Ronny Perinke
// @version       original Autoclose Bookmark History Folders 0.5.5
// @modiffied     Alice0775
// @version       2025/01/23 remove inline style
// @version       2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version       2024/05/27 css theme
// @version       2021/07/24 remove setTimeout
// @version       2021/07/23 restore scroll position more aggressively
// @version        2021/07/23 remove restriction scroll position
// @version        2021/04/26 Bug 1620467 - Support standard 'appearance' CSS property unprefixed
// @version       2020/12/12 remove prefs and simplify
// @version       2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser
// @version       2019/01/18 fix for 66(Bug 1482389 - Convert TreeBoxObject to XULTreeElement)
// @version       2019/01/18 fix dark theme
// @version       2018/08/13 61+
// @version       2017/11/18 nsIPrefBranch2 to nsIPrefBranch
// @version       2008/11/28 Firefox3.1b3pre tboの初期化に時間が掛かるようでsetTimeoutするようにした
// @Note          http://space.geocities.yahoo.co.jp/gl/alice0775
// @Note          I got permission to open this script to the public from Mr.Sephiroth on July 28,2007.
// ==/UserScript==
// @version       2007/07/16
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
var acHistoryFolder = {
  kPrefROWPOSITION: "ac-HistoryTreeFolder.lastHistory.",

  get _BTree() {
    return document.getElementById("historyTree");
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

    this._BTree.load_org = this._BTree.load;
    this._BTree.load = function(query, options) {
      this.load_org.apply(this, arguments);
      acHistoryFolder.restoreScrollPosition();
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
      var viewtype = document.getElementById("viewButton").getAttribute('selectedsort');
      var getRow = this._BTree.getFirstVisibleRow();
      Services.prefs.setIntPref(this.kPrefROWPOSITION + viewtype, getRow);
    }, 50);
  },

  restoreScrollPosition() {
    if (this._searchbox.value)
      return;

    var viewtype = document.getElementById("viewButton").getAttribute('selectedsort');
    var lastRowToSelect = Services.prefs.getIntPref(
                          this.kPrefROWPOSITION + viewtype, 0);
    if (this._BTree.result) {
      this._BTree.scrollToRow(lastRowToSelect);
    }
  },
  
  addToolbar: function(){
    const kXULNS =
           "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var toolbar = document.getElementById("acHistoryFolder-toolbar");
    if (toolbar){
      return;
    }
    var toolbox = document.createElementNS(kXULNS, "toolbox");
    //toolbox.setAttribute("style", "appearance: none;");
    toolbox.setAttribute("id", "acHistoryFolder-toolbox");
    toolbar = document.createElementNS(kXULNS, "toolbar");
    toolbar.setAttribute("id", "acHistoryFolder-toolbar");
    var closeAllButton = document.createElementNS(kXULNS, "toolbarbutton");
    closeAllButton.setAttribute("label", "\u6298\u7573");//折畳
    closeAllButton.addEventListener("command", () => acHistoryFolder.closeAll());
    //closeAllButton.setAttribute("oncommand", "acHistoryFolder.closeAll();");
    var openAllButton = document.createElementNS(kXULNS, "toolbarbutton");
    openAllButton.setAttribute("label", "\u5c55\u958b");//展開
    openAllButton.addEventListener("command", () => acHistoryFolder.openAll());
    //openAllButton.setAttribute("oncommand", "acHistoryFolder.openAll();");

    toolbar.appendChild(closeAllButton);
    toolbar.appendChild(openAllButton);
    toolbox.appendChild(toolbar);
    this._BTree.parentNode.insertBefore(toolbox, this._BTree);
    var viewbutton = document.getElementById("viewButton");
    if (viewbutton){
      viewbutton.addEventListener("command", acHistoryFolder.updateTBButtons, false);
      var enabled = (viewbutton.getAttribute("selectedsort") == "day" || viewbutton.getAttribute("selectedsort") == "site" || viewbutton.getAttribute("selectedsort") == "dayandsite");
      closeAllButton.disabled = !enabled;
      openAllButton.disabled = !enabled;
    }

    let mwin = window.browsingContext.embedderWindowGlobal.browsingContext.window;
    let color = mwin.getComputedStyle(mwin.document.body).getPropertyValue("--sidebar-text-color");
    closeAllButton.style.setProperty("color", color, "");
    openAllButton.style.setProperty("color", color, "");

    let style = `
        #acHistoryFolder-toolbox {
          appearance: none;
        }
        toolbar{
          background-color: transparent !important;
        }
        :root[lwtheme] toolbar:-moz-window-inactive {
          color: var(--lwt-sidebar-text-color) !important;
          background-color: var(--lwt-sidebar-background-color) !important;
        }
        :root[lwtheme] toolbar,
        :root[lwtheme] toolbar toolbarbutton {
          color: var(--lwt-sidebar-text-color) !important;
          background-color: var(--lwt-sidebar-background-color) !important;
        }
        :root[lwt-sidebar="dark"] toolbar,
        :root[lwt-sidebar="dark"] toolbar toolbarbutton {
          color-scheme: dark !important;
        } 

        `;
/*
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };
*/
    var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
    var uri = Services.io.newURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style));
    if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);

  },

  updateTBButtons: function(aEvent){
    var enabled = (aEvent.target.id == "byday" || aEvent.target.id == "bydayandsite" || aEvent.target.id == "bysite");
    var toolbar = document.getElementById("acHistoryFolder-toolbar");
    toolbar.firstChild.disabled = !enabled;
    toolbar.lastChild.disabled = !enabled;
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
    aEvent.preventDefault();
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

acHistoryFolder.init();
