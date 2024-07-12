// ==UserScript==
// @name           patchForBug1894910_allow_search_with_empty_text.uc.js
// @description    undoing Bug 1894910 - Remove function to open search page from search bar with an empty search
// @include        chrome://browser/content/browser.xhtml
// @compatibility  128
// @version        2024/06/4
// ==/UserScript==
(function() {
  let searchbar = document.getElementById('searchbar');
  let func = searchbar.textbox.handleEnter.toString();

  func = func.replace(
  'if (!this.textbox.value) {',
  'if (false) {'
  );
  func = func.replace(
  '!this.textbox.value &&',
  'false &&'
  );
  searchbar.textbox.handleEnter = (new Function(
         'event',
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  )).bind(searchbar);
})();
