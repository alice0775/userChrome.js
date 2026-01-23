// ==UserScript==
// @name           patchForBug1904014_allow_search_oneoff_with_empty_text.uc.js
// @description    undoing Bug 1904014 - Remove function to do an empty search using the search bar one-off buttons.
// @include        chrome://browser/content/browser.xhtml
// @async          true
// @compatibility  148
// @version        2026/01/07  Bug 2008745 - Stop leaking globals into the global scope from imports in autocomplete-popup.js
// @version        2025/06/17 use openSearchForm instead of search with empty string
// @version        2025/06/16 Bug 1968479 - Only allow eval (with system principal / in the parent) when an explicit pref is set
// @version        2025/02/02 add @sandbox
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version        2024/07/14 fix add search engene button
// @version        2024/07/8
// ==/UserScript==
(function() {
  const lazy = {};
  ChromeUtils.defineESModuleGetters(lazy, {
     SearchOneOffs: "moz-src:///browser/components/search/SearchOneOffs.sys.mjs",
  });

  lazy.SearchOneOffs.prototype._on_click = function _on_click(event) {
    if (event.button == 2) {
      return; // ignore right clicks.
    }

    let button = event.originalTarget;
    let engine = button.engine;

    if (!engine) {
      return;
    }

    if (!this.textbox.value) {
      if (true) {
        // @ts-expect-error - MozSearchAutocompleteRichlistboxPopup is defined in JS and lacks type declarations.
        this.popup.openSearchForm(event, engine);
      }
      return;
    }
    // Select the clicked button so that consumers can easily tell which
    // button was acted on.
    this.selectedButton = button;
    this.handleSearchCommand(event, engine);
  }

})();
(function() {
  const lazy = {};
  ChromeUtils.defineESModuleGetters(lazy, {
     SearchOneOffs: "moz-src:///browser/components/search/SearchOneOffs.sys.mjs",
  });

  lazy.SearchOneOffs.prototype._on_command = async function _on_command(event) {
    let target = event.target;

    if (target == this.settingsButton) {
      this.window.openPreferences("paneSearch");

      // If the preference tab was already selected, the panel doesn't
      // close itself automatically.
      this.closeView();
      return;
    }

    if (target.classList.contains("searchbar-engine-one-off-add-engine")) {
      // On success, hide the panel and tell event listeners to reshow it to
      // show the new engine.
      this.window.SearchUIUtils.addOpenSearchEngine(
        target.getAttribute("uri"),
        target.getAttribute("image"),
        this.window.gBrowser.selectedBrowser.browsingContext
      )
        .then(result => {
          if (result) {
            this._rebuild();
          }
        })
        .catch(console.error);
      return;
    }

    if (target.classList.contains("search-one-offs-context-open-in-new-tab")) {
      // Select the context-clicked button so that consumers can easily
      // tell which button was acted on.
      this.selectedButton = target.closest("menupopup")._triggerButton;
      if (this.textbox.value) {
        this.handleSearchCommand(event, this.selectedButton.engine, true);
      } else {
        // @ts-expect-error - MozSearchAutocompleteRichlistboxPopup is defined in JS and lacks type declarations.
        this.handleSearchCommand(event, this.selectedButton.engine, true);
      }
    }

    const isPrivateButton = target.classList.contains(
      "search-one-offs-context-set-default-private"
    );
    if (
      target.classList.contains("search-one-offs-context-set-default") ||
      isPrivateButton
    ) {
      const engineType = isPrivateButton
        ? "defaultPrivateEngine"
        : "defaultEngine";
      let currentEngine = Services.search[engineType];

      const isPrivateWin = this.window.PrivateBrowsingUtils.isWindowPrivate(
        this.window
      );
      let button = target.closest("menupopup")._triggerButton;
      // We're about to replace this, so it must be stored now.
      let newDefaultEngine = button.engine;
      if (
        !this.getAttribute("includecurrentengine") &&
        isPrivateButton == isPrivateWin
      ) {
        // Make the target button of the context menu reflect the current
        // search engine first. Doing this as opposed to rebuilding all the
        // one-off buttons avoids flicker.
        let iconURL =
          (await currentEngine.getIconURL()) ||
          "chrome://browser/skin/search-engine-placeholder.png";
        button.setAttribute("image", iconURL);
        button.setAttribute("tooltiptext", currentEngine.name);
        button.engine = currentEngine;
      }

      if (isPrivateButton) {
        Services.search.setDefaultPrivate(
          newDefaultEngine,
          Ci.nsISearchService.CHANGE_REASON_USER_SEARCHBAR_CONTEXT
        );
      } else {
        Services.search.setDefault(
          newDefaultEngine,
          Ci.nsISearchService.CHANGE_REASON_USER_SEARCHBAR_CONTEXT
        );
      }
    }
  }
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