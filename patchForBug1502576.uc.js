// ==UserScript==
// @name           patchForBug1502576.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Search suggestion panel disturbs context menu
// @include        main
// @compatibility  Firefox 57+
// @author         Alice0775
// @version        2018/10/27 10:00
// @Note
// ==/UserScript==
document.getElementById("searchbar").addEventListener("popupshowing", 
function patchForBug1502576(event) {
  if (event.originalTarget.className == "textbox-contextmenu") {
    document.getElementById("searchbar").removeEventListener("popupshowing", patchForBug1502576, false);
    event.originalTarget.setAttribute("onmousedown", "if (event.button == 0) event.stopPropagation()");
  }
}, false);
