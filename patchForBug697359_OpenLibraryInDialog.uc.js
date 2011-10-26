// ==UserScript==
// @name           patchForBug697359_OpenLibraryInDialog.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Open Library In Dialog, cancel Bug697359 
// @include        *
// @compatibility  Firefox 10-
// @author         Alice0775
// @version        2011/10/26
// ==/UserScript==
if ("PlacesCommandHook" in window &&
    "showPlacesOrganizer" in window.PlacesCommandHook) {
  PlacesCommandHook.showPlacesOrganizer = function PCH_showPlacesOrganizer(aLeftPaneRoot) {
    var organizer = Services.wm.getMostRecentWindow("Places:Organizer");
    if (!organizer) {
      // No currently open places window, so open one with the specified mode.
      openDialog("chrome://browser/content/places/places.xul", 
                 "", "chrome,toolbar=yes,dialog=no,resizable", aLeftPaneRoot);
    }
    else {
      organizer.PlacesOrganizer.selectLeftPaneQuery(aLeftPaneRoot);
      organizer.focus();
    }
  }
}
