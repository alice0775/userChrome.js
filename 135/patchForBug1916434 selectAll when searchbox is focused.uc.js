// ==UserScript==
// @name           patchForBug1916434 selectAll when searchbox is focused.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround Bug 1916434 - Strings that have already been filled in should be selected when the search box in Library window is focused again
// @include       chrome://browser/content/places/places.xhtml
// @async          true
// @compatibility  Firefox 128+
// @author         Alice0775
// @version        2024/09/04 00:00
// ==/UserScript==

PlacesSearchBox.findAll_org = PlacesSearchBox.findAll;
PlacesSearchBox.findAll = function() {
  this.findAll_org.apply(this, arguments);
  this.searchFilter.select()
}