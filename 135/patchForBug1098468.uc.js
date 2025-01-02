// ==UserScript==
// @name           patchForBug1098468.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    revert Bug 1098468
// @include        main
// @async          true
// @compatibility  Firefox129
// @author         Alice0775
// @version        2024/07/17 23:00 Bug 1904302 - Remove inline event handlers from placesCommands
// @version        2016/03/19 00:30
// ==/UserScript==
//'AllBookmarks'
//'BookmarksToolbar'
//'BookmarksMenu'
//'UnfiledBookmarks'

document.getElementById("placesCommands").addEventListener("command", event => {
  Services.console.logStringMessage(event.originalTarget);
  const cmd = event.originalTarget.closest("command")?.id;
  switch (cmd) {
    case "Browser:ShowAllBookmarks":
      event.stopPropagation();
      PlacesCommandHook.showPlacesOrganizer('BookmarksMenu');
      break;
  }
}, true);
  