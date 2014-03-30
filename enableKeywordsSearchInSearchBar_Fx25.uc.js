// ==UserScript==
// @name           enableKeywordsSearchInSearchBar_Fx25.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Enable Keywords Search In SearchBar
// @include        main
// @compatibility  Firefox 25+
// @author         Alice0775
// @Note           Keywords Searchを検索バーから行えるようにする
// @Note           conqueryModoki2がある場合は, 親フォルダにKeywordsを付加していれば, Keywords 串刺し検索が出来る
// @Note           サーチバーを表示していないとダメ
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
  var searchBar = document.getElementById("searchbar");
  if (!searchBar)
    return

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

  if (gURLBar && "_canonizeURL" in gURLBar){
    var func = gURLBar._canonizeURL.toString();
     //Hack Noscript [noscriptBM.js]
      func = func.replace(
      ' let data = yield getShortcutOrURIAndPostData(url);',
      'let data = yield window.kusizasi.getShortcutOrURIAndPostData(url); \
        if (!data.url){ \
          this.handleRevert(); \
          return; \
        }'
      );
    eval("gURLBar._canonizeURL = " + func);
  }

  window.kusizasi.getShortcutOrURIAndPostData = function(aURL) {
    return Task.spawn(function() {
      let mayInheritPrincipal = false;
      let postData = null;
      let shortcutURL = null;
      let keyword = aURL;
      let param = "";

      let offset = aURL.indexOf(" ");
      if (offset > 0) {
        keyword = aURL.substr(0, offset);
        param = aURL.substr(offset + 1);
      }
      let engine = Services.search.getEngineByAlias(keyword);
      if (engine && !!param.trim()) {
        if("conqueryModoki" in window && engine.name.match(/^{/) && !engine.name.match(/}/)){
          if (param && !PrivateBrowsingUtils.isWindowPrivate(window)) {
            conqueryModoki.searchBar().FormHistory.update(
              { op : "bump",
                fieldname : "searchbar-history",
                value : param },
              { handleError : function(aError) {
                  Components.utils.reportError("Saving search to form history failed: " + aError.message);
              }});
          }
          kusizasi(engine.name, param);
          throw new Task.Result({ postData: null,
                                  url: null,
                                  mayInheritPrincipal: mayInheritPrincipal });
        }
        let submission = engine.getSubmission(param);
        postData = submission.postData;
        throw new Task.Result({ postData: submission.postData,
                                url: submission.uri.spec,
                                mayInheritPrincipal: mayInheritPrincipal });
      }

      [shortcutURL, postData] =
        PlacesUtils.getURLAndPostDataForKeyword(keyword);

      if (!shortcutURL)
        throw new Task.Result({ postData: postData, url: aURL,
                                mayInheritPrincipal: mayInheritPrincipal });

      let escapedPostData = "";
      if (postData)
        escapedPostData = unescape(postData);

      if (/%s/i.test(shortcutURL) || /%s/i.test(escapedPostData)) {
        let charset = "";
        const re = /^(.*)\&mozcharset=([a-zA-Z][_\-a-zA-Z0-9]+)\s*$/;
        let matches = shortcutURL.match(re);
        if (matches)
          [, shortcutURL, charset] = matches;
        else {
          // Try to get the saved character-set.
          try {
            // makeURI throws if URI is invalid.
            // Will return an empty string if character-set is not found.
            charset = yield PlacesUtils.getCharsetForURI(makeURI(shortcutURL));
          } catch (e) {}
        }

        // encodeURIComponent produces UTF-8, and cannot be used for other charsets.
        // escape() works in those cases, but it doesn't uri-encode +, @, and /.
        // Therefore we need to manually replace these ASCII characters by their
        // encodeURIComponent result, to match the behavior of nsEscape() with
        // url_XPAlphas
        let encodedParam = "";
        if (charset && charset != "UTF-8")
          encodedParam = escape(convertFromUnicode(charset, param)).
                         replace(/[+@\/]+/g, encodeURIComponent);
        else // Default charset is UTF-8
          encodedParam = encodeURIComponent(param);

        shortcutURL = shortcutURL.replace(/%s/g, encodedParam).replace(/%S/g, param);

        if (/%s/i.test(escapedPostData)) // POST keyword
          postData = getPostDataStream(escapedPostData, param, encodedParam,
                                                 "application/x-www-form-urlencoded");
      }
      else if (param) {
        // This keyword doesn't take a parameter, but one was provided. Just return
        // the original URL.
        postData = null;

        throw new Task.Result({ postData: postData, url: aURL,
                                mayInheritPrincipal: mayInheritPrincipal });
      }

      // This URL came from a bookmark, so it's safe to let it inherit the current
      // document's principal.
      mayInheritPrincipal = true;

      throw new Task.Result({ postData: postData, url: shortcutURL,
                              mayInheritPrincipal: mayInheritPrincipal });
    });
  };


  window.kusizasi.getShortcutOrURI = function(aURI) {
    // Firefox 25 and later
    var getShortcutOrURIAndPostData = kusizasi.getShortcutOrURIAndPostData;
    var done = false;
    Task.spawn(function() {
      var data = yield getShortcutOrURIAndPostData(aURI);
      aURI = data.url;
      done = true;
    });

    // this should be rewritten in asynchronous style...
    setTimeout(function(){done = true;}, 1000);
    var thread = Cc['@mozilla.org/thread-manager;1'].getService().mainThread;
    while (!done)
    {
      thread.processNextEvent(true);
    }

    return aURI;
  };

  searchBar.doSearch__keyworks = searchBar.doSearch;
  searchBar.doSearch = function doSearch(aData, aWhere) {

    var textBox = this._textbox;
    var shortcutURL = null;
    var aPostDataRef = {};
    var offset = aData.indexOf(" ");
    if (offset > 0) {
      shortcutURL = kusizasi.getShortcutOrURI(aData, aPostDataRef);
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
      searchBar.doSearch__keyworks(aData, aWhere);
    }
  };
})();