// ==UserScript==
// @name           patchForBug1894910_allow_search_with_empty_text.uc.js
// @description    undoing Bug 1894910 - Remove function to open search page from search bar with an empty search
// @include        chrome://browser/content/browser.xhtml
// @async          true
// @compatibility  148
// @version        2025/12/20 00:00 new search widget
// @version        2025/06/17 use openSearchForm instead of search with empty string
// @version        2025/06/16 Bug 1968479 - Only allow eval (with system principal / in the parent) when an explicit pref is set
// @version        2025/02/02  add @sandbox
// @version        2024/06/4
// ==/UserScript==
(function() {
  let sb = window.userChrome_js?.sb;
  if (!sb) {
    sb = Cu.Sandbox(window, {
        sandboxPrototype: window,
        sameZoneAs: window,
    });

    /* toSource() is not available in sandbox */
    Cu.evalInSandbox(`
        Function.prototype.toSource = window.Function.prototype.toSource;
        Object.defineProperty(Function.prototype, "toSource", {enumerable : false})
        Object.prototype.toSource = window.Object.prototype.toSource;
        Object.defineProperty(Object.prototype, "toSource", {enumerable : false})
        Array.prototype.toSource = window.Array.prototype.toSource;
        Object.defineProperty(Array.prototype, "toSource", {enumerable : false})
    `, sb);
    window.addEventListener("unload", () => {
        setTimeout(() => {
            Cu.nukeSandbox(sb);
        }, 0);
    }, {once: true});
  }

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
      engine = await Services.search.getDefault();
    } else {
      label = searchMode.engineName;
      engine = await Services.search.getEngineByName(label);
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
  let func = searchbar.textbox.handleEnter.toString();

  func = func.replace(
  'event.shiftKey',
  'true'
  );
/*
  searchbar.textbox.handleEnter = (new Function(
         'event',
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  )).bind(searchbar);
*/
  func = func.replace(
  'event =>',
  '(event)'
  );
  Cu.evalInSandbox("searchbar.textbox.handleEnter = function " + func.replace(/^function/, '') + ".bind(searchbar)", sb);
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
