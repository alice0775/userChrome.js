// ==UserScript==
// @name           places_addBookmarks.uc.js
// @description    履歴のコンテクストメニューに「このリンクをブックマーク」を追加(Bug 248963)。
// @include        chrome://browser/content/browser.xhtml
// @compatibility  115
// @version        2023/08/15 12:30 Fixed this did not work after customization
// @version        2021/10/26 00:30 Bug 1737033 Remove workaround for bug 420033 
// @version        2021/06/22 remove unused code
// @version        2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2009/06/13
// ==/UserScript==
  var UC_PlacesAddBookmark = {
    init: function() {
      window.addEventListener('aftercustomization', this, false);
      this.patch();
    },
    handleEvent: function(event) {
      let go = document.getElementById("historyMenuPopup");
      switch (event.type) {
        case "aftercustomization":
          if (go) {
            new HistoryMenu({type: "popupshowing", target: go, originalTarget: go});
            go.parentNode.parentNode._placesView = null;
          }
          break;
      }
    },

    patch: function() {
      let go = document.getElementById("historyMenuPopup");
      if (go) {
        go.setAttribute("context" , "placesContext");
      }
    }
  }
  UC_PlacesAddBookmark.init();
