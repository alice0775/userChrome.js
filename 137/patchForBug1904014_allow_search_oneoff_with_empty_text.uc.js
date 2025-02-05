// ==UserScript==
// @name           patchForBug1904014_allow_search_oneoff_with_empty_text.uc.js
// @description    undoing Bug 1904014 - Remove function to do an empty search using the search bar one-off buttons.
// @include        chrome://browser/content/browser.xhtml
// @async          true
// @compatibility  Firefox 137
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version        2024/07/14 fix add search engene button
// @version        2024/07/8
// ==/UserScript==
(function() {
  let func = SearchOneOffs.prototype._on_click.toString();

  func = func.replace(
  'if (!this.textbox.value) {',
  'if (false) {'
  );
  SearchOneOffs.prototype._on_click = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );
})();
(function() {
  let func = SearchOneOffs.prototype._on_command.toString();
  func = func.replace(
  'if (!this.textbox.value) {',
  'if (false) {'
  );
  func = func.replace(
  'lazy.SearchUIUtils',
  `this.window.SearchUIUtils`
  );
  func = func.replace(
  'lazy.PrivateBrowsingUtils',
  `this.window.PrivateBrowsingUtils`
  );  
  let AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  SearchOneOffs.prototype._on_command = new AsyncFunction(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );
})();
(function() {
  let PSAC = document.getElementById("PopupSearchAutoComplete");
  //PSAC.addEventListener("popupShowing", event => { 
    PSAC.addEventListener("click", event => { 
      if (event.button == 2) {
        // Ignore right clicks.
        return;
      }
      let button = event.originalTarget.closest("[class~='searchbar-engine-one-off-add-engine]");
      if (button) {
        return;
      }
      button = event.originalTarget.closest(".search-panel-header");
      if (!button) {
        return;
      }
      if (!this.searchbar.value) {
        this.searchbar.handleSearchCommand(event, Services.search.defaultEngine);
      }
    });

    PSAC.addEventListener("keydown", event => { 
      if (event.keyCode !== KeyEvent.DOM_VK_RETURN) {
        // Ignore right clicks.
        return;
      }
      let button = event.originalTarget.closest(".search-panel-header");
      if (!button) {
        return;
      }
      if (!this.searchbar.value) {
        this.searchbar.handleSearchCommand(event, Services.search.defaultEngine);
      }
    });

  //}, {once: true});
})();
//      this._searchbarEngine = this.querySelector(".search-panel-header");