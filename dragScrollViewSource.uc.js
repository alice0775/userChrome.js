// ==UserScript==
// @name           dragScrollViewSource.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ソース表示にスクロールバー
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @author         Alice0775
// @compatibility  4 5 6 7 8
// @version        2010/10/12 11:00 by Alice0775  4.0b8pre
// ==/UserScript==
(function(){
  var browser = document.getElementById('content');
  var doc = browser.contentDocument;
  doc.documentElement.style.setProperty("overflow", "scroll", "important");
  browser.addEventListener('load', changeStyle, false);

  function changeStyle(event) {
    var doc = browser.contentDocument;
    doc.documentElement.style.setProperty("overflow", "scroll", "important");
  }
})();
