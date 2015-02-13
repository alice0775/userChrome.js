// ==UserScript==
// @name           SearchOnEngineChangeForFx3.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        main
// @compatibility  Firefox 17.0+
// @author         Alice0775
// @version        2015/01/26 10:00 Fix Focus the content area
// @version        2014/10/21 19:00 デフォルトの検索エンジンは一番最初の奴にするようにした
// @version        2013/05/19 00:00 Bug 831008 Disable Mutation Events in chrome/XUL
// @version        2013/05/18 23:20 Bug 738818
// @version        2008/06/24 19:20 修正した
// @Note
// ==/UserScript==
// @version        2008/06/24 18:50 browser.search.openintabがtrueの時2重にタブが開くbug
// @version        2008/06/23 02:00 キーボード選択時も
// @version        2008/06/23 01:50 なんか非互換まくりだったので, 作り直し
// @version        2008/06/22 22:00
var searchOnEngineChange = {
  // -- config --
  KeepDefaultEngine: true,         //デフォルトの検索エンジンに戻す
  ClearWordAfterSearch: true,      //検索後検索ワードをクリア --- 旧ポップアップの検索エンジンを選んだときだけ有効
  // -- config --
  searchBar: null,
  popup: null,

  init: function(){
    this.searchBar = document.getElementById("searchbar");
    if(!this.searchBar)return;
    this.popup = document.getAnonymousElementByAttribute(this.searchBar, "anonid", "searchbar-popup");
    this.popup.addEventListener("command", this, false);

    window.addEventListener("aftercustomization", this, false);
  },

  handleEvent: function(event){
   switch (event.type) {
      case "unload":
        this.popup.removeEventListener("command", this, true);
        window.removeEventListener("aftercustomization", this, false);
        break;
      case "aftercustomization":
        this.init();
        break;
      case "command":
        this.doSearch(event);
        break;
    }
  },

  clearWord: function(){
    this.searchBar.value = "";
    this.searchBar.updateDisplay();
  },

  where: function(aEvent){
    var where = "current";
    if (aEvent && aEvent.originalTarget.getAttribute("anonid") == "search-go-button") {
      if (aEvent.button == 2)
        return;
      where = whereToOpenLink(aEvent, false, true);
    }
    else {
      var newTabPref = this.searchBar._textbox._prefBranch.getBoolPref("browser.search.openintab");
      if ((aEvent && aEvent.altKey) ^ newTabPref)
        where = "tab";
    }
    return where;
  },

  doSearch: function(event){
    var target = event.target;
    var aEngine = target.engine;
    if (!aEngine)
      return;
    var aData = this.searchBar._textbox.value;
    if (!aData)
      return;
    var aWhere = this.where(event);

	  setTimeout(function(){
	    var submission = aEngine.getSubmission(aData, null);
	    openUILinkIn(submission.uri.spec, aWhere, null, submission.postData);
	  },0);

    if (this.ClearWordAfterSearch){
      this.clearWord();
    } 
    if (this.KeepDefaultEngine){
      let defaultEngine = Services.search.getVisibleEngines({ })[0];
      setTimeout(function(){Services.search.currentEngine = defaultEngine;},0);
    }
  }
};
searchOnEngineChange.init();
window.addEventListener('unload', searchOnEngineChange, false);
