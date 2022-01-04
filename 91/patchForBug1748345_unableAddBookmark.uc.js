// ==UserScript==
// @name           patchForBug1748345_unableAddBookmark.uc.js
// @description    Bug 1748345 - Deleting latest used bookmark folder disables adding new bookmarks
// @include        chrome://browser/content/browser.xhtml
// @compatibility  91
// @version        2022/01/04
// ==/UserScript==
(function() {
  let func = PlacesCommandHook.bookmarkPage.toString().replace(/^async /, '').replace(/}\s*$/, '');
  func = func.replace(
    'let parentGuid = await PlacesUIUtils.defaultParentGuid;',
    `let parentGuid = await PlacesUIUtils.defaultParentGuid;
     if (!(await PlacesUtils.bookmarks.fetch({ guid: parentGuid })))
       parentGuid = PlacesUtils.bookmarks.toolbarGuid;`
    );
  let AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
  PlacesCommandHook.bookmarkPage = new AsyncFunction(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );
})();
