// ==UserScript==
// @name           copyToFindbar
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ページ内検索バーの次を検索矢印を右クリックで, 選択文字/Web検索ボックスの文字列をコピーする
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2009/05/14 00:00 isempty
// @version        2009/02/24 00:00 Fx3
// @Note
// ==/UserScript==
// @description    ページ内検索バーの次を検索矢印を右クリックで, 選択文字/Web検索ボックスの文字列をコピーする
//                 ページ内検索バーのラベル検索を左クリックで,  選択文字/Web検索ボックスの文字列をコピーする
//                 ページ内検索バーのラベル検索を右クリックで, ページ内検索インプットボックスをクリアする
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


//right click on findbar's label or next to copy findText from SearchBar

(function(){
  if(!document.getElementById("searchbar"))return;
  if( 'gFindBar' in window && typeof gFindBar.onFindAgainCommand !='undefined') { // 3.0a3
  document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-next").addEventListener("click", function(event){
      if ( event.button != 2 ) return;
      event.preventDefault();
      event.stopPropagation();
      if(!!copyToandClearFindbar._getselection()){
        document.getElementById("cmd_find").doCommand();
        //gFindBar._findField.value = copyToandClearFindbar._getselection();
        //var evt = document.createEvent("UIEvents");
        //evt.initUIEvent("input", true, false, window, 0);
        //gFindBar._findField.dispatchEvent(evt);
        return;
      }
      if(!(document.getElementById("searchbar").textbox.hasAttribute('empty')||
           document.getElementById("searchbar").textbox.hasAttribute('isempty'))){
        var findtext= document.getElementById("searchbar")._textbox.value;
        gFindBar._findField.value = findtext;
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        gFindBar._findField.dispatchEvent(evt);
      }
      return;
    }, true);
  }else if(typeof gFindBar == "object") { //Bon Echo 2.0a3
    document.getElementById('find-next').addEventListener("click", function(event){
      if ( event.button != 2 ) return;
      event.preventDefault();
      event.stopPropagation();
      var textbox = document.getElementById("find-field");
      if(copyToandClearFindbar._getselection()){
        textbox.value = copyToandClearFindbar._getselection();
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        textbox.dispatchEvent(evt);
        return;
      }
      if(!document.getElementById("searchbar").hasAttribute('empty')){
        var findtext= document.getElementById("searchbar")._textbox.value;
        textbox.value = findtext;
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        textbox.dispatchEvent(evt);
      }
      return;
    }, true);
  }
})();

//left click on findbar's label to past findText clipbord
(function(){
  if( 'gFindBar' in window && typeof gFindBar.onFindAgainCommand !='undefined') { // 3.0a3
    document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-label").addEventListener("click", function(event){
      if ( event.button != 0 ) return;
      event.preventDefault();
      event.stopPropagation();
      if(copyToandClearFindbar._getselection()){
        gFindBar._findField.value = copyToandClearFindbar._getselection();
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        gFindBar._findField.dispatchEvent(evt);
        return;
      }
      if(!(document.getElementById("searchbar").textbox.hasAttribute('empty')||
           document.getElementById("searchbar").textbox.hasAttribute('isempty'))){
        var findtext= document.getElementById("searchbar")._textbox.value;
        gFindBar._findField.value = findtext;
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        gFindBar._findField.dispatchEvent(evt);
      }
      return;
    }, true);
  }else if(typeof gFindBar == "object") { //Bon Echo 2.0a3
    document.getElementById('find-label').addEventListener("click", function(event){
      if ( event.button != 0 ) return;
      event.preventDefault();
      event.stopPropagation();
      var textbox = document.getElementById("find-field");
      if(copyToandClearFindbar._getselection()){
        textbox.value = copyToandClearFindbar._getselection();
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        textbox.dispatchEvent(evt);
        return;
      }
      if(!document.getElementById("searchbar").hasAttribute('empty')){
        var findtext= document.getElementById("searchbar")._textbox.value;
        textbox.value = findtext;
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, false, window, 0);
        textbox.dispatchEvent(evt);
      }
      return;
    }, true);
  }
})();

//right click on findbar's label to clear findText

(function(){
  if( 'gFindBar' in window && typeof gFindBar.onFindAgainCommand !='undefined') { // 3.0a3
    document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-label").addEventListener("click", function(event){
      if ( event.button != 2 ) return;
      event.preventDefault();
      event.stopPropagation();
      gFindBar._findField.value = '';
      var evt = document.createEvent("UIEvents");
      evt.initUIEvent("input", true, false, window, 0);
      gFindBar._findField.dispatchEvent(evt);
      //window.userChrome_js.debug("event.button == 2  " + gFindBar._findField.value);
      return;
    }, true);
  }else if(typeof gFindBar == "object") { //Bon Echo 2.0a3
    document.getElementById('find-label').addEventListener("click", function(event){
      if ( event.button != 2 ) return;
      event.preventDefault();
      event.stopPropagation();
      var textbox = document.getElementById("find-field");
      textbox.value = '';
      var evt = document.createEvent("UIEvents");
      evt.initUIEvent("input", true, false, window, 0);
      textbox.dispatchEvent(evt);
      return;
    }, true);
  }
})();

var copyToandClearFindbar = {
    activeBrowser: function() {
      return ('SplitBrowser' in window ? SplitBrowser.activeBrowser : null )
              ||  gBrowser;
    },

    _getFocusedWindow: function(){ //現在のウインドウを得る
        var focusedWindow = document.commandDispatcher.focusedWindow;
        if (!focusedWindow || focusedWindow == window)
            return window._content;
        else
            return focusedWindow;
    },

    _getselection: function() {  //選択されている文字列を得る
        var sel = "";
        var targetWindow = this._getSelectionFrameFocused(getBrowser().contentDocument.defaultView);
        if (targetWindow)
          sel = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow);
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
    },

    _getSelectionFrameFocused: function(frame) {
      //this.debug('選択文字列を含む frame を返却
      var doc = frame.document;
      var frames = doc.getElementsByTagName("iframe");
      for (var i= 0; i < frames.length; i++){
        var result = this._getSelectionFrameFocused(frames[i].contentWindow);
        if (result)
          return result;
      }
      var frames = doc.getElementsByTagName("frame");
      for (var i= 0; i < frames.length; i++){
        var result = this._getSelectionFrameFocused(frames[i].contentWindow);
        if (result)
          return result;
      }
      if( frame ) {
        var selection = frame.getSelection( );
        if( selection && !!selection.toString( ) ) {
          return frame;
        }
      }
      return false;
  }
}
