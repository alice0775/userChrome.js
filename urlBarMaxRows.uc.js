// ==UserScript==
// @name           urlBarMaxRows.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    urlBarのドロップダウン行数
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 3.0 3.5 3.6a1pre
// @author         Alice0775
// @version        2009/02/04
// ==/UserScript==
if ("gURLBar" in window) {
  gURLBar.maxRows = 12;
  gURLBar.timeout = 1000;
}
