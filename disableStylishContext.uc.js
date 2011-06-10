// ==UserScript==
// @name           disableStylishContext.uc.js
// @description    stylishのボタンのコンテキストをなくす
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @include        chrome://browser/content/browser.xul
// @copatibility   Firefox 2.0 3.0
// @author         Alice0775
// @version        2009/04/13
// ==/UserScript==
(function(){
  var sp = document.getElementById("stylish-panel")
  if (sp)
    sp.contextMenu = null
})();