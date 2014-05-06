// ==UserScript==
// @name           patch_SecondSearch_for_conqueryModoki.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    patch_SecondSearch_for_conqueryModoki.uc.js
// @include        main
// @compatibility  Firefox 2.0 3.0 29
// @author         Alice0775
// @version        2014/04/02 22:00 for SecondSearch commit a4a913ffa3
// @version        2008/09/13 22:00 for SecondSearch ver 0.5.2008090201
// @version        2008/02/13 22:00 for SecondSearch ver 0.4.2008021201
// @version        2007/07/01 02:00 for SecondSearch ver 0.3.2007061801
// @Note
// ==/UserScript==
if(typeof  SecondSearchBrowser != 'undefined'){
  SecondSearchBrowser.prototype.__defineGetter__("searchEngines",
    function(){
      return this.SearchService.getVisibleEngines({}).filter(
        function(aEngine){
          return !(/^--|^\u2015\u2015/.test(aEngine.name) || /[}{]/.test(aEngine.name) );
        }
      );
    }
  );
} else if ("SecondSearch" in window && "searchEngines" in SecondSearch) {

  window.SecondSearch.__defineGetter__("searchEngines",
    function(){
      return this.SearchService.getVisibleEngines({}).filter(
        function(aEngine){
          return !(/^--|^\u2015\u2015/.test(aEngine.name) || /[}{]/.test(aEngine.name) );
        }
      );
    }
  );
}