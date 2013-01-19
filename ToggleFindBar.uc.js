// ==UserScript==
// @name           ToggleFindBar
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ステータスバーおよび検索エンジンの虫めがねアイコンの右クリックでページ内検索バーをON/OFFを切り替える
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 4.0b7pre
// @author         Alice0775
// @version        2013/01/16 12:00 Bug 831008 Disable Mutation Events in chrome/XUL
// @version        2011/06/09 00:00 search-go-label due to Bug 592909 - Streamline the visual appearance of the search field
// @version        2010/02/01 00:00 toggleで語句を削除しない
// @version        2010/01/29 00:00 Bug 628654 - Show connecting / waiting / loading status messages in small overlay on top of content at bottom of screen.
// @version        2010/11/14 00:00 statusbar4ever
// @version        2010/09/14 00:00 addon bar
// ==/UserScript==
// @Note
/* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* Alternatively, the contents of this file may be used under the
* terms of the GNU General Public License Version 2 or later (the
* "GPL"), in which case the provisions of the GPL are applicable
* instead of those above.
*
*
* The Original Code
* It works Firefox 2 only.
* Alice0775
* http://space.geocities.yahoo.co.jp/gl/alice0775
* (2007/02/25)
*
* ***** END LICENSE BLOCK ***** */

var ucjs_toggleFindBar = {
  //-- config --
  OPENFINDBAR_RCLICK_STATUSBAR        : true,
  OPENFINDBAR_DARGOVER_STATUSBAR      : false,
  OPENFINDBAR_RCLICK_SEARCHGOBUTTON   : true,
  //-- config --

  searchBar: null,
  goButton : null,
  addonbar :null,
  statusbarDisplay :null,
  isInit: false,

  init: function(){

    var dummy = gFindBar;
    if (!document.getElementById("FindToolbar") &&
        typeof gFindBarInitialized != 'undefined' &&
        !gFindBarInitialized) {
      //window.watch('gFindBarInitialized', function() { ucjs_toggleFindBar.init(); });
      gFindBar;
      return;
    }

    if (typeof gFindBar == 'undefined') {
      gFindBar = document.getElementById("FindToolbar");
    }

    if ('BrowserSearch' in window)
      try{
        this.searchBar = BrowserSearch.getSearchBar();
      }catch(e){
        this.searchBar = BrowserSearch.searchBar;  //fx3
      }

    if (!this.isInit && this.searchBar){
      this.isInit = true;
      var func = this.searchBar.handleSearchCommand.toString();
      if('gFindBar' in window && 'onFindAgainCommand' in gFindBar ){ // Fx3
        if( /\(aEvent\)/.test(func)){
          eval('this.searchBar.handleSearchCommand = ' + func.replace(
            '{',
            '{if(aEvent && aEvent.button==2) return;'
          ));
        }else if( /\(event\)/.test(func)){ // BHNewTab
          eval('this.searchBar.handleSearchCommand = ' + func.replace(
            '{',
            '{if(event && event.button==2) return;'
          ));
        }
      }
   }

    window.addEventListener("aftercustomization", this, false);
    window.addEventListener("unload", this, false);

    this.addonbar = document.getElementById("addon-bar") ||
                            document.getElementById("statusbar-line-col") ||
                            document.getElementById("viewSource-main-menubar");
    this.statusbarDisplay = document.getElementById("statusbar-display");
    if (this.OPENFINDBAR_RCLICK_STATUSBAR && this.addonbar)
      this.addonbar.addEventListener("click", this, false);
    if (this.OPENFINDBAR_RCLICK_STATUSBAR && this.statusbarDisplay)
      this.statusbarDisplay.addEventListener("click", this, false);


    if(this.OPENFINDBAR_DARGOVER_STATUSBAR && this.statusbarDisplay)
      this.statusbarDisplay.addEventListener("dragover", this, false);
    if(this.searchBar)
      this.goButton = document.getAnonymousElementByAttribute(this.searchBar, "anonid", "search-go-button") || 
      document.getAnonymousElementByAttribute(this.searchBar, "anonid", "search-go-label");
    if(this.OPENFINDBAR_RCLICK_SEARCHGOBUTTON && this.goButton)
      this.goButton.addEventListener("click", this, true);
  },

  uninit: function(){
    window.removeEventListener("aftercustomization", this, false);
    if(this.OPENFINDBAR_RCLICK_SEARCHGOBUTTON && this.goButton)
      this.goButton.removeEventListener("click", this, true);
    if(this.OPENFINDBAR_RCLICK_STATUSBAR && this.addonbar)
      this.addonbar.removeEventListener("click", this, false);
    if(this.OPENFINDBAR_RCLICK_STATUSBAR && this.statusbarDisplay)
      this.statusbarDisplay.removeEventListener("click", this, false);
    if(this.OPENFINDBAR_DARGOVER_STATUSBAR && this.statusbarDisplay)
      this.statusbarDisplay.removeEventListener("dragover", this, false);
  },

  handleEvent: function(event){
    switch(event.type){
      case "unload":
        this.uninit();
        break;
      case "aftercustomization":
        this.init();
        break;
      case "click":
        var elem = event.target;
        switch(elem){
          case this.goButton:
            this.goButtonClick(event);
            break;
          case document.getElementById("status4evar-status-text"):
          case this.statusbarDisplay:
            event.stopPropagation();
          case this.addonbar:
            this.statusbarDisplayClick(event);
            break;
        }
        if (elem.localName =="toolbarspring") {
          while(elem) {
            if (elem == this.addonbar) {
              this.statusbarDisplayClick(event);
              break;
            }
            elem = elem.parentNode;
          }
        }
        break;
      case "dragover":
        this.statusbarDragOver(event);
        break;
    }
  },

  goButtonClick: function(event){
    if ( event.button != 2 ) return;
    event.preventDefault();
    event.stopPropagation();
    var word;
    if ( this.getVer() > 2 ? !(this.searchBar.textbox.hasAttribute("isempty") ||
                               this.searchBar.textbox.hasAttribute("empty")):
                             !this.searchBar.hasAttribute("empty")) {
      word = this.searchBar.value;
    } else
      word = this._getselection();
    this.toggleFindbar(word);
  },

  statusbarDisplayClick: function(event){
    if ( event.button != 2 ) return;
    event.preventDefault();
    event.stopPropagation();
    this.toggleFindbar(this._getselection());
  },

  statusbarDragOver: function(event){
    if (this.getVer() >=3.1){
      if (event.dataTransfer.types.contains("text/plain")){
      var data = event.dataTransfer.getData("text/plain");
      if (!data)
      return;
      }
    }
    if ('gFindBar' in window && 'onFindAgainCommand' in gFindBar ){ // Fx3
      if(gFindBar.hidden){
        gFindBar.onFindCommand();
      }
    } else if(typeof gFindBar == "object") { //Bon Echo 2.0a3
      if(findToolbar.hidden){
        gFindBar.onFindCmd();
      }
    } else {
      if (findToolbar.hidden){
        onFindCmd();
      }
    }
  },

  toggleFindbar: function(aValue){
    var findToolbar = document.getElementById("FindToolbar");
    if ('gFindBar' in window && 'onFindAgainCommand' in gFindBar ){ // Fx3
      if (gFindBar.hidden){
        content.focus();
        if(aValue)
          gFindBar._findField.value = aValue;
//window.userChrome_js.debug("cmd_find " + gFindBar._findField.value);
        document.getElementById("cmd_find").doCommand();
        if (gFindBar._findField.value)
          gFindBar._enableFindButtons(true);
        //gFindBar.onFindCommand();
        //gFindBar._findField.value = aValue;
        //var evt = document.createEvent("UIEvents");
        //evt.initUIEvent("input", true, false, window, 0);
        //gFindBar._findField.dispatchEvent(evt);
      } else
        gFindBar.close();
    } else if (typeof gFindBar == "object") { //Bon Echo 2.0a3
      textbox = document.getElementById("find-field");
      if(findToolbar.hidden){
        gFindBar.onFindCmd();
        if(aValue)
          textbox.value = aValue;
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        textbox.dispatchEvent(evt);
      }
      else gFindBar.closeFindBar();
    } else {
      if (findToolbar.hidden) onFindCmd();
      else closeFindBar();
    }
    return;
  },

  _getFocusedWindow: function(){
    var focusedWindow = document.commandDispatcher.focusedWindow;
    if (!focusedWindow || focusedWindow == window)
      return window._content;
    else
      return focusedWindow;
  },

  _getselection: function() {
    try{
      var targetWindow = this._getFocusedWindow();
      var sel = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow);
      // for textfields
      if (sel && !sel.toString()) {
        var node = document.commandDispatcher.focusedElement;
        if (node &&
            (node.type == "text" || node.type == "textarea") &&
            'selectionStart' in node &&
            node.selectionStart != node.selectionEnd) {
          var offsetStart = Math.min(node.selectionStart, node.selectionEnd);
          var offsetEnd   = Math.max(node.selectionStart, node.selectionEnd);
          return node.value.substr(offsetStart, offsetEnd-offsetStart);
        }
      }
      return sel ? sel.toString().replace(/\s/g,' ').replace(/^[\ ]+|[\ ]+$/g,'').replace(/[\ ]+/g,' ') : "";
    }catch(e){
      return '';
    }
  },

  getVer: function(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }

};
ucjs_toggleFindBar.init();
