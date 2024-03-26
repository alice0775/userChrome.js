// ==UserScript==
// @name           patchForBug1887736.uc.js
// @description    Bug 1887736 no longer possible to delete more than one bookmark separator
// @include        chrome://browser/content/browser.xhtml
// @include        chrome://browser/content/places/places.xhtml
// @include        chrome://browser/content/places/bookmarksSidebar.xhtml
// @compatibility  124
// @version        2024/03/26
// ==/UserScript==
PlacesController.prototype._isRepeatedRemoveOperation=function(){return false;}