// ==UserScript==
// @name           patchForBug1894910_allow_search_with_empty_text.uc.js
// @description    undoing Bug 1894910 - Remove function to open search page from search bar with an empty search
// @include        chrome://browser/content/browser.xhtml
// @async          true
// @compatibility  149
// @version        2026/01/23 00:00 Bug 2000685 - Replace the search service instance with a singleton
// @version        2025/12/20 00:00 new search widget
// @version        2025/06/17 use openSearchForm instead of search with empty string
// @version        2025/06/16 Bug 1968479 - Only allow eval (with system principal / in the parent) when an explicit pref is set
// @version        2025/02/02  add @sandbox
// @version        2024/06/4
// ==/UserScript==
(function() {
    const lazy = {};
    ChromeUtils.defineESModuleGetters(lazy, {
      SearchService: "moz-src:///toolkit/components/search/SearchService.sys.mjs",
    });

if (Services.prefs.getBoolPref("browser.search.widget.new", false)) {

  let style = `
    #searchbar-new {
      .urlbar-go-button {
        display: flex !important;

        &:not(:hover) {
          opacity: 0.8;
        }
      }
    }
    `;
  let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  let uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style));
  if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
    sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);

  let searchbar = window.document.getElementById("searchbar-new");
  searchbar.inputField.addEventListener("keydown", 
       (event) => patchForBug1894910_allow_search_with_empty_text(event), false);
  searchbar.goButton.addEventListener("click", 
       (event) => patchForBug1894910_allow_search_with_empty_text(event), false);
       
  async function patchForBug1894910_allow_search_with_empty_text(event) {
    if (KeyboardEvent.isInstance(event) && event.keyCode !== KeyEvent.DOM_VK_RETURN)
      return

    let searchbar = window.document.getElementById("searchbar-new");
    if (searchbar.value != "")
      return;

    if (!event.originalTarget.classList.contains("urlbar-input") &&
        !event.originalTarget.classList.contains("urlbar-go-button"))
      return;
   
    let searchMode = searchbar.searchMode;
    let engine, label;
    if (!searchMode) {
      engine = await lazy.SearchService.getDefault();
    } else {
      label = searchMode.engineName;
      engine = await lazy.SearchService.getEngineByName(label);
    }
    let where = patchForBug1894910_whereToOpen(event);
    let url = engine.searchForm;
    window.openTrustedLinkIn(url, where);
  }
  function patchForBug1894910_whereToOpen(aEvent, aForceNewTab = false) {
      let where = "current";
      const newTabPref = Services.prefs.getBoolPref("browser.search.openintab");

      // Open ctrl/cmd clicks on one-off buttons in a new background tab.
      if (aEvent?.originalTarget.classList.contains("search-go-button")) {
        where = BrowserUtils.whereToOpenLink(aEvent, false, true);
        if (
          newTabPref &&
          !aEvent.altKey &&
          !aEvent.getModifierState("AltGraph") &&
          where == "current" &&
          !gBrowser.selectedTab.isEmpty
        ) {
          where = "tab";
          if (KeyboardEvent.isInstance(aEvent) && aEvent.ctrlKey ||
              MouseEvent.isInstance(aEvent) && aEvent.button == 1)
            where = "tabshifted";
        }
      } else if (aForceNewTab) {
        where = "tab";
        if (Services.prefs.getBoolPref("browser.tabs.loadInBackground")) {
          params = {
            inBackground: true,
          };
        }
      } else {
        if (
          (KeyboardEvent.isInstance(aEvent) &&
            (aEvent.altKey || aEvent.getModifierState("AltGraph"))) ^
            newTabPref &&
          !gBrowser.selectedTab.isEmpty
        ) {
          where = "tab";
          if (aEvent.ctrlKey)
            where = "tabshifted";
        }
      }

      return where;
    }
} else {
  let searchbar = document.getElementById('searchbar');
  searchbar.textbox.handleEnter  = function(event) {
      // Toggle the open state of the add-engine menu button if it's
      // selected.  We're using handleEnter for this instead of listening
      // for the command event because a command event isn't fired.
      if (
        this.textbox.selectedButton &&
        this.textbox.selectedButton.getAttribute("anonid") ==
          "addengine-menu-button"
      ) {
        this.textbox.selectedButton.open = !this.textbox.selectedButton.open;
        return true;
      }
      // Ignore blank search unless add search engine or
      // settings button is selected, see bugs 1894910 and 1903608.
      if (
        !this.textbox.value &&
        !(
          this.textbox.selectedButton?.getAttribute("id") ==
            "searchbar-anon-search-settings" ||
          this.textbox.selectedButton?.classList.contains(
            "searchbar-engine-one-off-add-engine"
          )
        )
      ) {
        if (true) {
          let engine = this.textbox.selectedButton?.engine;
          let { where, params } = this._whereToOpen(event);
          this.openSearchFormWhere(event, engine, where, params);
        }
        return true;
      }
      // Otherwise, "call super": do what the autocomplete binding's
      // handleEnter implementation does.
      return this.textbox.mController.handleEnter(false, event || null);
    }.bind(searchbar);
}
})();

/*
(function() {
  const lazy = {};
  ChromeUtils.defineESModuleGetters(lazy, {
   UrlbarSearchUtils: "moz-src:///browser/components/urlbar/UrlbarSearchUtils.sys.mjs",
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
