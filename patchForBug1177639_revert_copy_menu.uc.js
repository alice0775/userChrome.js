// ==UserScript==
// @name           patchForBug1177639_revert_copy_menu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Fixed Bug1177639 "Copy" context menu is missing on bookmarks
// @include        main
// @compatibility  Firefox 33+
// @author         Alice0775
// @version        2015/06/26
// ==/UserScript==
Object.defineProperty(PlacesViewBase.prototype, 'selectedNode', {
  get: function() {
     if (this._contextMenuShown) {
      let popup = document.popupNode;
      return popup._placesNode || popup.parentNode._placesNode || null;
     }
     return null;
  }
});