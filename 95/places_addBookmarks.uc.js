// ==UserScript==
// @name           places_addBookmarks.uc.js
// @description    履歴のコンテクストメニューに「このリンクをブックマーク」を追加(Bug 248963)。
// @include        chrome://browser/content/browser.xhtml
// @compatibility  95
// @version        2021/10/26 00:30 Bug 1737033 Remove workaround for bug 420033 
// @version        2021/06/22 remove unused code
// @version        2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2009/06/13
// ==/UserScript==
  var UC_PlacesAddBookmark = {
    init: function() {
      var go = document.getElementById("historyMenuPopup");
      if (go) {
        go.setAttribute("context" , "placesContext");
        var pa = go.parentNode;
        pa.removeChild(go);
        pa.appendChild(go);
      }
    }
  }
  UC_PlacesAddBookmark.init();
  