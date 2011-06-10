// ==UserScript==
// @name           patchForBug615866.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description     Bug 615866 -  Add preference to disable "External links from within app tabs should always open in new tabs" feature  を修正
// @include        main
// @compatibility  Firefox 4.0b7
// @author         Alice0775
// @version        2010/12/02 00:00
// ==/UserScript==
XULBrowserWindow.onBeforeLinkTraversal = function(originalTarget, linkURI, linkNode, isAppTab){
  return originalTarget;
}
