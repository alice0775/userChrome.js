// ==UserScript==
// @name           patchForBug1894910_allow_search_with_empty_text.uc.js
// @description    undoing Bug 1894910 - Remove function to open search page from search bar with an empty search
// @include        chrome://browser/content/browser.xhtml
// @async          true
// @sandbox        true
// @compatibility  139
// @version        2025/06/17 use openSearchForm instead of search with empty string
// @version        2025/02/02  add @sandbox
// @version        2024/06/4
// ==/UserScript==
(function() {
  let searchbar = document.getElementById('searchbar');
  let func = searchbar.textbox.handleEnter.toString();

  func = func.replace(
  'event.shiftKey',
  'true'
  );
  searchbar.textbox.handleEnter = (new Function(
         'event',
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  )).bind(searchbar);
})();

/*
(function() {
  const lazy = {};
  ChromeUtils.defineESModuleGetters(lazy, {
   UrlbarSearchUtils: "resource:///modules/UrlbarSearchUtils.sys.mjs",
  });

  gURLBar.textbox.addEventListener("keydown", function(event) {
    if (event.keyCode != KeyEvent.DOM_VK_RETURN || gURLBar.inputField.value != "")
      return;
      
    let engine = lazy.UrlbarSearchUtils.getDefaultEngine(PrivateBrowsingUtils.isWindowPrivate(window));
    let where = BrowserUtils.whereToOpenLink(event, false, false);
    let searchForm = engine.searchForm;

    openTrustedLinkIn(searchForm, where, {});
  });
})();
*/