// ==UserScript==
// @name          acHistoryFolder_Fx37
// @namespace     http://www.sephiroth-j.de/mozilla/
// @description   Autoclose History Folders
// @include       chrome://browser/content/history/history-panel.xul
// @compatibility Firefox 3.7
// @author        original Ronny Perinke
// @version       original Autoclose Bookmark History Folders 0.5.5
// @modiffied     Alice0775
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
  _Prefs: {
    ScrollToRow : true, //次回サイドバーオープン時に現在開いているフォルダをトップにもってくる
    SelectLast  : true  //次回サイドバーオープン時に現在開いているフォルダを開いてフォーカスする
  },

  get _BTree() {
    return document.getElementById("historyTree");
  },

  init: function(){
    if (!this._BTree)
      return;

    this._BTree.addEventListener('click', function(event){acHistoryFolder.onClick(event);},false);

    this.loadPrefs();
    this.addToolbar();

    var viewtype = document.getElementById("viewButton").getAttribute('selectedsort');
    if (this._BTree.result && this._Prefs.SelectLast){
      setTimeout(function(self){
        var lastRowToSelect = self.getPref("ac-HistoryTreeFolder.lastBookmarkFolder."+viewtype,"int",0);
        var tbo = self._BTree.treeBoxObject;
        if (tbo && tbo.view.rowCount >= lastRowToSelect){
          if(viewtype == "byday" || viewtype == "bydayandsite")
            tbo.scrollToRow(lastRowToSelect);
          tbo.view.selection.select(lastRowToSelect);
          tbo.ensureRowIsVisible(lastRowToSelect);
        }
      }, 100, this);
    }
  },

  uninit: function(){
    this._BTree.removeEventListener('click', function(event){acHistoryFolder.onClick(event);},false);
  },

  loadPrefs: function(){
    this._Prefs.SelectLast  = this.getPref("ac-HistoryTreeFolder.ReselectLastFolder","bool",this._Prefs.SelectLast);
    this._Prefs.ScrollToRow = this.getPref("ac-HistoryTreeFolder.ScrollToLastFolder","bool",this._Prefs.ScrollToRow);
  },

  addToolbar: function(){
    const kXULNS =
           "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var toolbar = document.getElementById("acHistoryFolder-toolbar");
    if (toolbar){
      return;
    }
    var toolbox = document.createElementNS(kXULNS, "toolbox");
    toolbar = document.createElementNS(kXULNS, "toolbar");
    toolbar.setAttribute("id", "acHistoryFolder-toolbar");
    var closeAllButton = document.createElementNS(kXULNS, "toolbarbutton");
    closeAllButton.setAttribute("label", "\u6298\u7573");//折畳
    closeAllButton.setAttribute("oncommand", "acHistoryFolder.closeAll();");
    var openAllButton = document.createElementNS(kXULNS, "toolbarbutton");
    openAllButton.setAttribute("label", "\u5c55\u958b");//展開
    openAllButton.setAttribute("oncommand", "acHistoryFolder.openAll();");

    toolbar.appendChild(closeAllButton);
    toolbar.appendChild(openAllButton);
    toolbox.appendChild(toolbar);
    this._BTree.parentNode.insertBefore(toolbox, this._BTree);
    var viewbutton = document.getElementById("viewButton");
    if (viewbutton){
      viewbutton.addEventListener("command", acHistoryFolder.updateTBButtons, false);
      var enabled = (viewbutton.getAttribute("selectedsort") == "day" || viewbutton.getAttribute("selectedsort") == "dayandsite");
      closeAllButton.disabled = !enabled;
      openAllButton.disabled = !enabled;
    }
  },

  updateTBButtons: function(aEvent){
    var enabled = (aEvent.target.id == "byday" || aEvent.target.id == "bydayandsite");
    var toolbar = document.getElementById("acHistoryFolder-toolbar");
    toolbar.firstChild.disabled = !enabled;
    toolbar.lastChild.disabled = !enabled;
  },

  onClick: function(aEvent){
    var parents   = new Array();
    var tbo = this._BTree.treeBoxObject;
    var aView = tbo.view;
    if (aEvent.button != 0){
      return;
    }

    var row = {}, col = {}, obj = {};
    tbo.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);
    if (row.value == -1)
      return;
    if(!aView.isContainer(row.value))
      return;
    if (this._BTree.currentIndex != row.value){
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
    tbo.ensureRowIsVisible(this._BTree.currentIndex);

    var viewtype = document.getElementById("viewButton").getAttribute('selectedsort');
    if (this._Prefs.SelectLast)
      this.setPref("ac-HistoryTreeFolder.lastBookmarkFolder."+viewtype ,"int",this._BTree.currentIndex);
    aEvent.preventDefault();
  },

  closeAll: function(){
    var aView = this._BTree.treeBoxObject.view;
    try{
      var viewtype = document.getElementById("viewButton").getAttribute('selectedsort');
      this._PrefsIFace.clearUserPref("ac-HistoryTreeFolder.lastBookmarkFolder."+viewtype);
    }catch(e){}
    if (aView){
      for (var i = aView.rowCount-1; i>=0; i--){
        if (aView.isContainer(i) && aView.isContainerOpen(i)) aView.toggleOpenState(i);
      }
    }
  },

  openAll: function(){
    var aView = this._BTree.treeBoxObject.view;
      try{
        var viewtype = document.getElementById("viewButton").getAttribute('selectedsort');
        this._PrefsIFace.clearUserPref("ac-HistoryTreeFolder.lastBookmarkFolder."+viewtype);
      }catch(e){}
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
  },

  clearPref: function(aPrefString){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    xpPref.clearUserPref(aPrefString);
  },

  getPref: function(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
        case 'str':
          return xpPref.getCharPref(aPrefString).toString(); break;
        case 'int':
          return xpPref.getIntPref(aPrefString); break;
        case 'bool':
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  },

  setPref: function(aPrefString, aPrefType, aValue){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.setComplexValue(aPrefString, Components.interfaces.nsILocalFile, aValue); break;
        case 'str':
          return xpPref.setCharPref(aPrefString, aValue); break;
        case 'int':
          aValue = parseInt(aValue);
          return xpPref.setIntPref(aPrefString, aValue);  break;
        case 'bool':
        default:
          return xpPref.setBoolPref(aPrefString, aValue); break;
      }
    }catch(e){
    }
    return null;
  }
}

acHistoryFolder.init();
document.addEventListener('unload', acHistoryFolder.uninit, false);
