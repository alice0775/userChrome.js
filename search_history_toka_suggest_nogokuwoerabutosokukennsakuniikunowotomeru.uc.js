// ==UserScript==
// @name           search historyとかsuggestの語句選ぶと即検索にいくのを止める.uc.js
// @namespace      http://pc11.2ch.net/test/read.cgi/software/1168635399/
// @description    search historyとかsuggestの語句選ぶと即検索にいくのを止める
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         2ch
// @version        2009/05/14 00:00 isempty
// @modified       by Alice0775
// ==/UserScript==
// @version        2008/10/21 20:00 Fx3.1b2pre D&D new APIに対応 suggest jp plusに対応
// @version        2008/02/11 23:00 Fx3b4pre D&Dのときempty属性削除
// @version        2008/01/19 01:00
// @changlog       1.ツールバーカスタマイズ後も有効となるようにした
// @changlog       2.Fx2ではドロップダウンリストをマウス選択だけでなしにEnterによる選択の場合にも対応
// @changlog       3.D&Dの場合にも対応 STOP_DND [true]:D&Dで即検索しない false:D&Dで即検索する
//search historyとかsuggestの語句選ぶと即検索にいくのを止める
//enterキーまたはsearch-go-buttonで検索開始
//fxの元のコードにif (!this.popupOpen) のとこ足しただけ

(function() {

  function stopSearchByDropdownListOnClicked() {
    //-- config --
    const STOP_DND = true;
    //-- config --
    var searchBar = document.getElementById("searchbar");
    if(!searchBar)return;
    var textBox = document.getAnonymousElementByAttribute(searchBar, "anonid", "searchbar-textbox");
    var old_onTextEntered = textBox.onTextEntered;
    textBox.onTextEntered = function(aEvent) {
      var evt = aEvent || this.mEnterEvent;
      //if (evt && evt.keyCode == KeyEvent.DOM_VK_RETURN) {
      if (STOP_DND && aEvent && (aEvent.type == "dragdrop"||aEvent.type == "drop")){
        textBox.removeAttribute("isempty");
        searchBar.removeAttribute('empty');
        textBox.focus();
        var evt = document.createEvent("UIEvents");
        evt.initUIEvent("input", true, true, window, 0);
        searchBar.dispatchEvent(evt);
        return;
      }
      if (!evt) return;
      if (!this.popupOpen) {                         //Fx3上手くかないなぜにいつもfalse?
        searchBar.handleSearchCommand(evt);
      }
      this.mEnterEvent = null;
    }
  }

  //suggest jp plus
  var panel = document.getElementById("PopupAutoComplete");
  var func = panel.onPopupClick.toString();
  func = func.replace(
              'searchBar.doSearch(searchBar.value, where);',
              'if (where != "current") $& else controller.handleEnter(true);'
              );
  func = func.replace(
              'searchBar.doSearch(search, where);',
              'if (where != "current") $& else controller.handleEnter(true);'
              );
  eval("panel.onPopupClick = " + func);

/*
var searchBar = BrowserSearch.searchBar;
  var panel = document.getElementById("PopupAutoComplete");
  var listbox = document.getAnonymousNodes(panel)[0];
  searchBar.addEventListener("keydown", function(aEvent) {
      var panel = document.getElementById("PopupAutoComplete");
      var textBox = document.getAnonymousElementByAttribute(searchBar, "anonid", "searchbar-textbox");
      var search = panel.view.getValueAt(panel.view.selection.currentindex);
      searchBar.value = search;
  }, true);
*/

  stopSearchByDropdownListOnClicked();
  document.getElementById("cmd_CustomizeToolbars").addEventListener("DOMAttrModified", function(e) {
      if (e.attrName == "disabled" && !e.newValue)
        stopSearchByDropdownListOnClicked();
  }, false);
})();