// ==UserScript==
// @name           patchForBug888567_StarUI_update.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 888567 	Bookmark star icon doesn't work properly on link-opened tab
// @include        main
// @compatibility  Firefox 13.0
// @author         Alice0775
// @version        2013/06/29
// @Note
// ==/UserScript==
function Bug888567_StarUI_onclick(event) {
  var StarUI = document.getElementById("star-button");
  if (typeof PlacesStarButton != 'undefined') {
    // Firefox 13-22
    if (StarUI.getAttribute('starred') != 'true') {
      PlacesCommandHook.bookmarkCurrentPage(false, PlacesUtils.unfiledBookmarksFolderId);
      PlacesStarButton._uri = null;
      PlacesStarButton.updateState();
    } else {
      PlacesStarButton.onClick(event);
    }
  } else {
    // Firefox 23-
    if (StarUI.getAttribute('starred') != 'true') {
      PlacesCommandHook.bookmarkCurrentPage(false, PlacesUtils.unfiledBookmarksFolderId);
      BookmarkingUI._uri = null;
      BookmarkingUI.updateStarState();
    } else {
      BookmarkingUI.onCommand(event);
    }
  }
}

document.getElementById("star-button").setAttribute("onclick", "Bug888567_StarUI_onclick(event)")
