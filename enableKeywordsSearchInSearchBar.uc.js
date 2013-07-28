// ==UserScript==
// @name           enableKeywordsSearchInSearchBar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Enable Keywords Search In SearchBar
// @include        main
// @compatibility  Firefox 17-24, 25+
// @author         Alice0775
// @Note           Keywords Searchを検索バーから行えるようにする
// @Note           サーチバーを表示していないとダメ
// @Note           kusizasi for conquerymodoki may be broken
// @version        2013/07/18 18:30 Bug 846635 - Use asynchronous getCharsetForURI in getShortcutOrURI in Firefox25 and later
// ==/UserScript==

(function(){
  var searchBar = document.getElementById("searchbar");
  if (!searchBar)
    return

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

  if ("getShortcutOrURIAndPostData" in window) {
    
    var func = getShortcutOrURIAndPostData.toString();
      func = func.replace(
      'throw new Task.Result({ postData: submission.postData,',
      'throw new Task.Result({ engine: engine, param: param, postData: submission.postData,'
      );
    eval("getShortcutOrURIAndPostData = " + func);

    
    //Fx25+
    searchBar.doSearch__keyworks = searchBar.doSearch;
    searchBar.doSearch = function(aData, aWhere){
      var shortcutURL = null;
      var aPostDataRef = {};
      var offset = aData.indexOf(" ");
      if (offset > 0) {
        var self = this;
        Task.spawn(function() {
          let data = yield getShortcutOrURIAndPostData(aData);
          if (data.engine && data.engine.name.match(/^{/) && !engine.name.match(/}/)) {
            kusizasi(engine.name, param);
          return;
          }

          if (data.url && data.url != aData) {
            // allow third-party services to fixup this URL
            if (data.url && data.url != aData) {
              //remove keyword
              self._textbox.value = aData.substr(offset + 1);
              try {
                var textBox = self._textbox;
                // Save the current value in the form history
                if (textBox.value && !PrivateBrowsingUtils.isWindowPrivate(window)) {
                  self.FormHistory.update(
                    { op : "bump",
                      fieldname : textBox.getAttribute("autocompletesearchparam"),
                      value : textBox.value },
                    { handleError : function(aError) {
                        Components.utils.reportError("Saving search to form history failed: " + aError.message);
                    }});
                }
              } catch(ee) {}
              //do keyword search
              if (/^javascript:/.test(data.url))
                aWhere = "current";
              openUILinkIn(data.url, aWhere, null, data.postData);
            }
          } else {
            self.doSearch__keyworks(aData, aWhere)
          }
        });
      } else {
        //do normal search
        this.doSearch__keyworks(aData, aWhere)
      }
    }
  } else {

  // Fx24 and earlier
    if (gURLBar && "handleCommand" in gURLBar){
      var func = gURLBar.handleCommand.toString();
       //Hack Noscript [noscriptBM.js]
        func = func.replace(
        'var url = getShortcutOrURI(shortcut, {});',
        '$& \
          if (!url){ \
            this.handleRevert(); \
            return; \
          }'
        );
      eval("gURLBar.handleCommand = " + func);
    }

    var func = getShortcutOrURI.toString();
      func = func.replace(
      'if (engine) {',
      'if (engine && !!param.replace(/^\s+/,\'\').replace(/\s+$/,\'\')) { \
        if(engine.name.match(/^{/) && !engine.name.match(/}/)){ \
          if ("conqueryModoki" in window) \
            kusizasi(engine.name, param); \
          return ""; \
        }'
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
          shortcutURL = getShortcutOrURI(aData, aPostDataRef);
          if (!shortcutURL)
            return;
        }
        if (shortcutURL && shortcutURL != aData){
          //remove keyword
          this._textbox.value = aData.substr(offset + 1);
          //do keyword search
          if (/^javascript:/.test(shortcutURL))
            aWhere = "current";
          openUILinkIn(shortcutURL, aWhere, null, aPostDataRef.value, null);
        } else {
          //do normal search
          this.doSearch__keyworks(aData, aWhere)
        }
      }
    }

  }
})();