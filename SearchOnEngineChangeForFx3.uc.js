// ==UserScript==
// @name           SearchOnEngineChangeForFx3.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        main
// @compatibility  Firefox 17.0+
// @author         Alice0775
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

  init: function(){
    this.searchBar = document.getElementById("searchbar");
    if(!this.searchBar)return;
    this.popup = document.getAnonymousElementByAttribute(this.searchBar, "anonid", "searchbar-popup");
    this.popup.addEventListener("command", this, false);

    document.getElementById("cmd_CustomizeToolbars").addEventListener("DOMAttrModified", this, false);
  },

  handleEvent: function(event){
   switch (event.type) {
      case "unload":
        this.popup.removeEventListener("click", this, true);
        this.popup.removeEventListener("command", this, true);
        document.getElementById("cmd_CustomizeToolbars").removeEventListener("DOMAttrModified", this, false);
        break;
      case "DOMAttrModified":
        if (event.attrName == "disabled" && !event.newValue){
          this.init();
        }
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
    var ss = Cc['@mozilla.org/browser/search-service;1'].getService(Ci.nsIBrowserSearchService);
    var aWhere = this.where(event);


    var submission = aEngine.getSubmission(aData, null);
    openUILinkIn(submission.uri.spec, aWhere, null, submission.postData);
    if (this.ClearWordAfterSearch){
      this.clearWord();
    }
    if (this.KeepDefaultEngine){
      let defaultPrefB = Services.prefs.getDefaultBranch("browser.search.");
      let nsIPLS = Ci.nsIPrefLocalizedString;
      let defaultEngine =ss.defaultEngine;
      try {
        defaultEngineName = defaultPrefB.getComplexValue("defaultenginename", nsIPLS).data;
        defaultEngine = ss.getEngineByName(defaultEngineName);
      } catch (ex) {}
      setTimeout(function(){ss.currentEngine = defaultEngine;},100);
    }
  }
};
searchOnEngineChange.init();
window.addEventListener('unload', searchOnEngineChange, false);
