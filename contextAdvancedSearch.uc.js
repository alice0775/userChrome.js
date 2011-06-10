// ==UserScript==
// @name           contextAdvancedSearch.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    右クリックの検索メニューを, 中クリックでNOT検索, 右クリックで AND検索を行う
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2009/05/14 00:00 isempty
// ==/UserScript==
// @version        2008/04/21 12:00 文字数を制限した
// @version        2008/04/15 23:10
// @Note
var contextAdvancedSearch = {
  //エンジン名の一部と可能な機能
  mFunc: {'Google'       : {AND:'+%%S',  OR:' OR %%S', NOT:' -%%S',   SL:' site:%%S'},
          'Yahoo'        : {AND:'+"%%S', OR:' OR %%S', NOT:' -%%S',   SL:' site:%%S'},
          'goo '         : {AND:' %%S',  OR:' OR %%S', NOT:' -%%S',   SL:''         },
          'Live Search'  : {AND:'+%%S',  OR:' OR %%S', NOT:' -(%%S)', SL:''         },
          'Wikipedia-JP' : {AND:' %%S' , OR:' OR %%S', NOT:''       , SL:''         }
  },

  menuitem:document.getElementById("context-searchselect"),
  init: function(){
    this.menuitem.setAttribute("onclick","contextAdvancedSearch.handleEvent(event);");
    //コンテキストメニューポップアップ時のイベント登録
    document.getElementById('contentAreaContextMenu').
               addEventListener('popupshowing', this, false);
  },

  uninit: function(){
    document.getElementById('contentAreaContextMenu').
               removeEventListener('popupshowing', this, false);
  },

  //現在のウインドウを得る
  _getFocusedWindow: function(){
    var focusedWindow = document.commandDispatcher.focusedWindow;
    if (!focusedWindow || focusedWindow == window)
      return window._content;
    else
      return focusedWindow;
  },

  //選択文字列を得る
  _getselection: function() {
    var targetWindow = this._getFocusedWindow();
    var sel = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow);
    if (sel && !sel.toString()) {
      var node = document.commandDispatcher.focusedElement;
      if (node &&
          (node.type == "text" || node.type == "textarea") &&
          'selectionStart' in node &&
          node.selectionStart != node.selectionEnd) {
        var offsetStart = Math.min(node.selectionStart, node.selectionEnd);
        var offsetEnd  = Math.max(node.selectionStart, node.selectionEnd);
        return node.value.substr(offsetStart, offsetEnd-offsetStart);
      }
    }
    return sel ?
      sel.toString() : "";
  },

  handleEvent: function(event){
    switch (event.type) {
      case "click":
        var searchBar = document.getElementById("searchbar");
        if (!searchBar)
          return;
        var str = searchBar.textbox.textValue;
        if (event.button ==0 || str== '' || searchBar._textbox.hasAttribute("isempty")||searchBar.hasAttribute("empty")) return;

        document.getElementById("contentAreaContextMenu").hidePopup();
        event.stopPropagation();
        event.preventDefault();

        var aEngine = document.getElementById("searchbar").currentEngine;
        var prop = this.checkEngine(aEngine)
        if (!prop) return;

        var sel = this._getselection();
        switch (event.button)
        {
          case 1:  // not
            if (event.shiftKey)
            {
              var func = this.mFunc[prop].SL;
              if (func == '') return;
              var site = makeURI(this._getFocusedWindow().location.href).host;
              this.addWord(func.replace('%%S', site));
            }
            else {
              if (sel == "") return;
              var func = this.mFunc[prop].NOT;
              if (func == '') return;
              this.addWord(func.replace('%%S', sel));
            }
            break;
          case 2:  // and (shift+ site:
            if (sel == "") return;
            var func = this.mFunc[prop].AND;
            if (func == '') return;
            this.addWord(func.replace('%%S', sel));
            break;
        }
        this.goSearch()
        break;
      case "popupshowing":
        this.popup();
        break;
    }
  },

  addWord: function(str){
    var searchBar = document.getElementById("searchbar");
    if (!searchBar)
      return;
    str = searchBar.textbox.textValue + str.substring(0,1024);
    searchBar.textbox.textValue = str;
    searchBar.removeAttribute("empty");
    searchBar._textbox.removeAttribute("isempty")
  },

  goSearch: function(){
    var searchBar = document.getElementById("searchbar");
    if (!searchBar)
      return;
    var str = searchBar.textbox.textValue ;
    if (this.getVer() > 2){ //Fx3
      var where = "current";
    }else{
      var where = false;
    }
    searchBar.doSearch(str, where);
  },

  checkEngine: function(aEngine){
    var aEnginename = aEngine.name
    for (var prop in this.mFunc) {
       if (aEnginename.indexOf(prop) != -1){
          return prop;
       }
     }
     return null;
  },

  popup: function(){
    var searchBar = document.getElementById("searchbar");
    if (!searchBar)
      return;
    var aEngine = searchBar.currentEngine;
    var prop = this.checkEngine(aEngine)
    this.setTooltip(prop);
  },

  setTooltip: function(prop){
    var func, text = '';
    if (!prop){
      this.menuitem.removeAttribute("tooltiptext");
    } else {
      func = this.mFunc[prop].NOT;
      if (func != '') text = "M:not "
      func = this.mFunc[prop].AND;
      if (func != '') text = text + "R:and "
      func = this.mFunc[prop].SL;
      if (func != '') text = text + "Shift+M:site"
      this.menuitem.setAttribute("tooltiptext",text);
    }
  },

  getVer: function(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }

}
contextAdvancedSearch.init();
window.addEventListener("unload", function(){ contextAdvancedSearch.uninit();}, false);
