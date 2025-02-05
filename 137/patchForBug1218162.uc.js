// ==UserScript==
// @name           patchForBug1218162.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 1218162 - Caret no longer displays after drag & drop text to textbox (locationbar/searchbar)
// @include        main
// @async          true
// @compatibility  Firefox 137
// @author         Alice0775
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version        2024/11/24 00:30
// @version        2021/04/05 00:30
// @version        2016/03/19 00:30
// ==/UserScript==

(function patchForBug1218162() {
  var searchbar =  document.getElementById("searchbar").textbox;
  document.addEventListener("drop", (e) => {
    if(!e.target.closest('#searchbar')) return;
    setTimeout(function() {
      searchbar.blur();
      searchbar.focus();
    }, 0);
  }, true);
  gURLBar.addEventListener("drop", (event) => {
    var dt = event.dataTransfer;
    //console.log(dt.types);
    if (!dt.types.includes("text/plain"))
      return;
    var url = dt.getData(["text/plain"]);
    //console.log(url);
    if (/^(https?|ftp|file):\/\//.test(url))
      return;
    if (/[^.]\.[^.]/.test(url))
      return;
    setTimeout(function() {
      gURLBar.blur();
      gURLBar.focus();
    }, 0);
  }, true);
})();
