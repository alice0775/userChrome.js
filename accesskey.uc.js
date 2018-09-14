// ==UserScript==
// @name          accesskey.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   add accesskey(alt+s) for sidebar search box, change accesskey(alt+o) History menu
// @include       chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include       chrome://browser/content/places/bookmarksSidebar.xul
// @include       chrome://browser/content/history/history-panel.xul
// @include       chrome://browser/content/places/historySidebar.xul
// @include       main
// @compatibility Firefox 56+
// @version       2018/09/14
// ==/UserScript==

switch(location.href) {
  case "chrome://browser/content/browser.xul":
    document.getElementById("history-menu").setAttribute("accesskey", "o");
    break;
  case "chrome://browser/content/bookmarks/bookmarksPanel.xul":
  case "chrome://browser/content/places/bookmarksSidebar.xul":
  case "chrome://browser/content/history/history-panel.xul":
  case "chrome://browser/content/places/historySidebar.xul":
    document.getElementById("search-box").setAttribute("accesskey", "S");
    break;
}
