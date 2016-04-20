// ==UserScript==
// @name           patchForBug1218162.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 1218162 - Caret no longer displays after drag & drop text to textbox (locationbar/searchbar)
// @include        main
// @compatibility  Firefox45
// @author         Alice0775
// @version        2016/03/19 00:30
// ==/UserScript==

(function patchForBug1218162() {
  var searchbar =  BrowserSearch.searchBar.textbox;
  searchbar.addEventListener("drop", function() {
    setTimeout(function() {
      searchbar.blur();
      searchbar.focus();
    }, 0);
  }, true);
  gURLBar.addEventListener("drop", function(event) {
    var dt = event.dataTransfer;
    //console.log(dt.types.contains(["text/plain"]));
    if (!dt.types.contains(["text/plain"]))
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
