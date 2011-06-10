// ==UserScript==
// @name           patchSidebarUtils.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    SidebarUtilsエラー回避
// @include        main
// @include        chrome://browser/content/history/history-panel.xul
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @compatibility  Firefox 3.0
// @author         Alice0775
// @Note
// ==/UserScript==
setTimeout(function(){
  if ("SidebarUtils" in window)
  SidebarUtils.clearURLFromStatusBar = function SU_clearURLFromStatusBar() {
    if (!!window.top.XULBrowserWindow)
      window.top.XULBrowserWindow.setOverLink("", null);
  }
}, 1000);
