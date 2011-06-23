// ==UserScript==
// @name           pattchForSuggestJPPlus_2.5.xpi.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    IMEの候補ウインドウを前面に
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0 7.0
// @author         Alice0775
// @version        2011/06/23
// @Note
// ==/UserScript==
if ("ucSuggestJP" in window)
  setTimeout(function() {
      var panel = document.getElementById("PopupAutoComplete");
      if (panel)
        panel.setAttribute("level","parent");
  }, 500);
