// ==UserScript==
// @name           enableKeywordsSearchInSearchBar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Enable Keywords Search In SearchBar
// @include        main
// @compatibility  Firefox 2.0 3.0 3.1
// @author         Alice0775
// @Note           Keywords Searchを検索バーから行えるようにする
// @Note           conqueryModoki2がある場合は, 親フォルダにKeywordsを付加していれば, Keywords 串刺し検索が出来る
// @Note           サーチバーを表示していないとダメ
// @version        2009/08/02 Tab Mix Plusはもはや対応しない
// ==/UserScript==
// @version        2009/06/13 Tab Mix Plus0.3.7.4pre.090516
// @version        2009/05/08 00:30 キワードサーチのurlがjavascriptの場合はカレントタブに開くように
// @version        2009/02/18 14:30 Full Screen でも動作するように
// @version        2008/09/26 11:00 For checked in Bug 337345
// @version        2008/07/26 15:30 NoScript 1.7.7をインストールしている場合に対応
// @version        2008/07/26 conqueryModoki2がある場合はKeywords 串刺し検索を追加
// @version        2008/07/04 Tab Mix Plusにも
// @version        2008/07/02

(function(){

  window.kusizasi = function(name, param){
    const nsIBSS = Components.interfaces.nsIBrowserSearchService;
    const searchService =Components.classes["@mozilla.org/browser/search-service;1"].getService(nsIBSS);

    var popup = document.getElementById("context-conqueryModoki-popup");
    if (!conqueryModoki || !popup)
      return;
    var walker = document.createTreeWalker(popup, NodeFilter.SHOW_ELEMENT, null, true);
    var target;
    while ((target = walker.nextNode())){
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
  }
  if (gURLBar && "handleCommand" in gURLBar){
    var func = gURLBar.handleCommand.toString();
     //Hack Noscript [noscriptBM.js]
      func = func.replace(
      'var url = getShortcutOrURI(shortcut, {});',
      <><![CDATA[
        $&
        if (!url){
          this.handleRevert();
          return;
        }
      ]]></>
      );
    eval("gURLBar.handleCommand = " + func);
  } else {
    var func = handleURLBarCommand.toString();
      func = func.replace(
      'canonizeUrl(aTriggeringEvent, postData);',
      <><![CDATA[
        $&
        if(!gURLBar.value){
          // Revert the contents of the location bar
          handleURLBarRevert();
          return;
        }
      ]]></>
      );
     //Hack Noscript
      func = func.replace(
      'var url = getShortcutOrURI(shortcut, {});',
      <><![CDATA[
        $&
        if (!url){
          handleURLBarRevert();
          return;
        }
      ]]></>
      );
    eval("handleURLBarCommand = " + func);
  }

  var func = getShortcutOrURI.toString();
    func = func.replace(
    'if (engine) {',
    <><![CDATA[
    if (engine && !!param.replace(/^\s+/,'').replace(/\s+$/,'')) {
      if(engine.name.match(/^{/) && !engine.name.match(/}/)){
        if ("conqueryModoki" in window)
          kusizasi(engine.name, param);
        return "";
      }
    ]]></>
    );
  eval("getShortcutOrURI = " + func);

  var searchBar = document.getElementById("searchbar");
  if (!searchBar)
    return

  { //素Fx
    searchBar.doSearch__keyworks = searchBar.doSearch;
    searchBar.doSearch = function(aData, aWhere){
      var shortcutURL = null;
      var aPostDataRef = {};
      var offset = aData.indexOf(" ");
      if (offset > 0) {
        shortcutURL = getShortcutOrURI(aData, aPostDataRef)
        if (!shortcutURL)
          return;
      }
      if (shortcutURL && shortcutURL != aData){
        //remove keyword
        this._textbox.value = aData.substr(offset + 1);
        //do keyword search
        if (/^javascript:/.test(shortcutURL))
          aWhere = "current";
        openUILinkIn(shortcutURL, aWhere, null, aPostDataRef.value);
      } else {
        //do normal search
        this.doSearch__keyworks(aData, aWhere)
      }
    }
  }
})();