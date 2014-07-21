// ==UserScript==
// @name           enableKeywordsSearchInSearchBar_Fx31.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Enable Keywords Search In SearchBar
// @include        main
// @compatibility  Firefox 31+
// @author         Alice0775
// @Note           Keywords Searchを検索バーから行えるようにする
// @Note           conqueryModoki2がある場合は, 親フォルダにKeywordsを付加していれば, Keywords 串刺し検索が出来る
// @Note           サーチバーを表示していないとダメ
// @version        2014/07/21 23:00 Fix working with Tree Style Tab etc.
// @version        2014/07/04 09:00 Bug 989984, Firefox31+
// @version        2014/03/31 00:00 add fail safe setTimeout
// @version        2013/11/21 12:30 Firefox25 分離
// @version        2013/07/18 18:30 Bug 846635 - Use asynchronous getCharsetForURI in getShortcutOrURI in Firefox25
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2009/08/02 Tab Mix Plusはもはや対応しない
// @version        2009/06/13 Tab Mix Plus0.3.7.4pre.090516
// @version        2009/05/08 00:30 キワードサーチのurlがjavascriptの場合はカレントタブに開くように
// @version        2009/02/18 14:30 Full Screen でも動作するように
// @version        2008/09/26 11:00 For checked in Bug 337345
// @version        2008/07/26 15:30 NoScript 1.7.7をインストールしている場合に対応
// @version        2008/07/26 conqueryModoki2がある場合はKeywords 串刺し検索を追加
// @version        2008/07/04 Tab Mix Plusにも
// @version        2008/07/02

(function(){

  window.kusizasi = function(name, param) {
    const nsIBSS = Components.interfaces.nsIBrowserSearchService;
    const searchService =Components.classes["@mozilla.org/browser/search-service;1"].getService(nsIBSS);

    var popup = document.getElementById("context-conqueryModoki-popup");
    if (!conqueryModoki || !popup)
      return;
    var walker = document.createTreeWalker(popup, NodeFilter.SHOW_ELEMENT, null, true);
    var target;
    while ((target = walker.nextNode())) {
      if (target.localName.toLowerCase() != "menu" )
    continue;
      if (target.getAttribute("label") == name.replace(/^{/,'')){

        var result = document.evaluate("*/*[@class = 'menuitem-iconic searchbar-engine-menuitem']",target,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
        //alert(result.snapshotLength);
        var searchBar = conqueryModoki.searchBar();
        if (searchBar)
          searchBar.value = param;

        var anewTab = true;
        for(var i=0; i<result.snapshotLength; i++){
          try{
            setTimeout(function(self, aEngine,selected,anewTab){
              self.loadSearch(aEngine, selected, anewTab, false, false)  //検索実行
              setTimeout(function(){conqueryModoki._dispatchEvent();},0);
            },100, conqueryModoki, result.snapshotItem(i).engine, param, anewTab);
          }catch(e){}
        }

        conqueryModoki.clearSearchBar();
      }
    }
  };

  window.getShortcutOrURIAndPostData__keyworks = window.getShortcutOrURIAndPostData;
  window.getShortcutOrURIAndPostData = function getShortcutOrURIAndPostData(aURL, aCallback) {
    let keyword = aURL;
    let param = "";

    let offset = aURL.indexOf(" ");
    if (offset > 0) {
      keyword = aURL.substr(0, offset);
      param = aURL.substr(offset + 1);
    }
    let engine = Services.search.getEngineByAlias(keyword);
    if (engine && "conqueryModoki" in window && engine.name.match(/^{/) && !engine.name.match(/}/)) {
      if (param && !PrivateBrowsingUtils.isWindowPrivate(window)) {
        conqueryModoki.searchBar().FormHistory.update(
          { op : "bump",
            fieldname : "searchbar-history",
            value : param },
          { handleError : function(aError) {
              Components.utils.reportError("Saving search to form history failed: " + aError.message);
          }});
      }
      if (/_canonizeURL/.test(arguments.callee.caller.name))
        gURLBar.handleRevert();
      kusizasi(engine.name, param);
      return;
    }
    getShortcutOrURIAndPostData__keyworks(aURL, aCallback);
  }

  var searchBar = document.getElementById("searchbar");
  if (!searchBar)
    return

  searchBar.doSearch__keyworks = searchBar.doSearch;
  searchBar.doSearch = function doSearch(aData, aWhere) {
    var textBox = this._textbox;
    let offset = aData.indexOf(" ");
    getShortcutOrURIAndPostData(aData, data => {
      if (data.url && data.url != aData) {
        //remove keyword
        textBox.value = aData.substr(offset + 1);
        //do keyword search
        if (/^javascript:/.test(data.url))
          aWhere = "current";
        openUILinkIn(data.url, aWhere, null, null);
      } else {
        this.doSearch__keyworks(aData, aWhere);
      }
    });
  };
})();