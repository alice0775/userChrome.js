// ==UserScript==
// @name           SearchOnEngineChangeForFx38.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        main
// @compatibility  Firefox 38.0+
// @author         Alice0775
// @version        2015/12/20 10:00 Fix nsIPrefBranch Service
// @version        2015/12/20 10:00 Fix Firefox 38.0+
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
  ClearWordAfterSearch: true,      //検索後検索ワードをクリア 
  // -- config --
  searchBar: null,
  popup: null,

  get xPref() {
    delete this.xPref;
    return this.xPref = Components.classes["@mozilla.org/preferences;1"]
            .getService(Components.interfaces.nsIPrefBranch);
  },

  init: function(){
    this.searchBar = document.getElementById("searchbar");
    if(!this.searchBar)return;
    if (!/ClearWordAfterSearch/.test(this.searchBar.doSearch.toString())) {
      this.searchBar.doSearch_org = this.searchBar.doSearch;
      this.searchBar.doSearch = function(aData, aWhere, aEngine){
        this.doSearch_org(aData, aWhere, aEngine);

        if (searchOnEngineChange.ClearWordAfterSearch){
          searchOnEngineChange.clearWord();
        } 
        if (searchOnEngineChange.KeepDefaultEngine){
          let defaultEngine = Services.search.getVisibleEngines({ })[0];
          setTimeout(function(){Services.search.currentEngine = defaultEngine;},0);
        }
      }
    }
    this.popup = document.getAnonymousElementByAttribute(this.searchBar, "anonid", "searchbar-popup");
    if (this.popup) {
      this.popup.addEventListener("command", this, false);
      this.popup.addEventListener("click", this, false);
    }

    window.addEventListener("aftercustomization", this, false);
  },

  handleEvent: function(event){
   switch (event.type) {
      case "unload":
        if (this.popup) {
          this.popup.removeEventListener("command", this, true);
          this.popup.removeEventListener("click", this, true);
        }
        window.removeEventListener("aftercustomization", this, false);
        break;
      case "aftercustomization":
        this.init();
        break;
      case "click":
        if (event.button != 0)
          this.doSearch(event);
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
    if (aEvent.button == 2)
      return;
    where = whereToOpenLink(aEvent, false, true);
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

    this.searchBar.doSearch(aData, aWhere, aEngine);
  }

};
searchOnEngineChange.init();
window.addEventListener('unload', searchOnEngineChange, false);
