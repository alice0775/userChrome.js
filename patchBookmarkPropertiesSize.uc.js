// ==UserScript==
// @name           patchBookmarkPropertiesSize.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        chrome://browser/content/places/bookmarkProperties.xul
// @compatibility  Firefox 3.0
// @author         Alice0775
// @version        2008/03/16 13:00
// @Note
// ==/UserScript==
(function() {
  window.resizeTo(600, document.getElementById("bookmarkproperties").boxObject.height+40);
})();