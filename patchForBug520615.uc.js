// ==UserScript==
// @name           patchForBug520615.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 520615 - Bookmark items are shifted when I drag over a link on Bookmarks Toolbar at the first time.
// @include        main
// @compatibility  Firefox 3.6 4.0 5.0 6.0
// @author         Alice0775
// @version        2009/10/05
// ==/UserScript==
document.getElementById("PlacesToolbarDropIndicator").style.setProperty("-moz-margin-start", "-9px", "");
