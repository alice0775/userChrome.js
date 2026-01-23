// ==UserScript==
// @name           replaceAndGoSearch.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    replace selection with clipboard text and go/search
// @include        main
// @async          true
// @author         Alice0775
// @compatibility  Firefox 149
// @version        2026/01/23 00:00 Bug 2000685 - Replace the search service instance with a singleton
// @version        2026/01/15 13:00 fix bug
// @version        2026/01/13 00:00 compatibility 149 from 148
// @version        2026/01/07 Bug 2008041 - Make XUL disabled / checked attributes html-style boolean attributes.
// @version        2025/12/20 00:00 new search widget
// @version        2025/11/15 23:00 Nightly 147
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version        2024/12/31 23:00
// @version        2021/09/04 0700
// @version        2021/08/21 12:00
// ==/UserScript==
var replaceAndGoSearch = {

  init: async function() {
    this.urlBarMenu();
    const lazy = {};
    ChromeUtils.defineESModuleGetters(lazy, {
      SearchService: "moz-src:///toolkit/components/search/SearchService.sys.mjs",
    });
    if (!lazy.SearchService.isInitialized) {
      await lazy.SearchService.init();
    }
    this.urlBarMenu();
    this.searchBarMenu();
    window.addEventListener('aftercustomization', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    window.removeEventListener('aftercustomization', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
    window.removeEventListener('unload', this, false);
  },
  
  urlBarMenu: function() {
    let inputBox = gURLBar.querySelector("moz-input-box");
    let contextMenu = inputBox.menupopup;
    let insertLocation = contextMenu.querySelector('[cmd="cmd_paste"]');

    let replaceAndGo = document.createXULElement("menuitem");
    replaceAndGo.id = "replace-and-go";
    replaceAndGo.setAttribute("label", "Replace and Go");
    replaceAndGo.setAttribute("anonid", "replace-and-go");
    replaceAndGo.setAttribute("accesskey", "r");
    replaceAndGo.addEventListener("command", (event) => {
      gURLBar._suppressStartQuery = true;

      window.goDoCommand("cmd_paste");
      gURLBar.setResultForCurrentValue(null);
      gURLBar.handleCommand(event);

      gURLBar._suppressStartQuery = false;
    });

    if (!contextMenu.querySelector("#replace-and-go")) {
      insertLocation.insertAdjacentElement("afterend", replaceAndGo);
    }

    contextMenu.addEventListener("popupshowing", () => {
      // Close the results pane when the input field contextual menu is open,
      // because paste and go doesn't want a result selection.
      gURLBar.view.close();


      let controller = document.commandDispatcher.getControllerForCommand(
        "cmd_paste"
      );
      let enabled = controller.isCommandEnabled("cmd_paste");
      replaceAndGo.toggleAttribute("disabled", !enabled);
    });
  },


  searchBarMenu: function() {
    let replaceAndSearch = document.createXULElement("menuitem");
    replaceAndSearch.id = "replace-and-search";
    replaceAndSearch.setAttribute("label", "Replace & Search");
    replaceAndSearch.setAttribute("anonid", "replace-and-search");
    replaceAndSearch.setAttribute("accesskey", "r");
    replaceAndSearch.addEventListener("command", (event) => {

      goDoCommand("cmd_paste");
      if (Services.prefs.getBoolPref("browser.search.widget.new", false)) {
        document.getElementById('searchbar-new').handleCommand(event);
      } else {
        document.getElementById('searchbar').handleSearchCommand(event);
      }
    });

    let contextMenu = Services.prefs.getBoolPref("browser.search.widget.new", false) ?
        document.getElementById('searchbar-new').querySelector(".textbox-contextmenu") :
        document.querySelector("#searchbar .textbox-contextmenu");
    if (!contextMenu)
      return;

    contextMenu.addEventListener("popupshowing", () => {
      if (!contextMenu.querySelector("#replace-and-search")) {
        let insert = contextMenu.querySelector(".searchbar-paste-and-search") ||
                    contextMenu.querySelector("#paste-and-go");
        insert.insertAdjacentElement("afterend", replaceAndSearch);
      }
      // Close the results pane when the input field contextual menu is open,
      // because paste and go doesn't want a result selection.

      let controller = document.commandDispatcher.getControllerForCommand(
        "cmd_paste"
      );
      let enabled = controller.isCommandEnabled("cmd_paste");
      replaceAndSearch.toggleAttribute("disabled", !enabled);
    });
  },

  observe(aSubject, aTopic, aPrefstring) {
    if (aTopic == 'nsPref:changed') {
      // 設定が変更された時の処理
      setTimeout(() => {this.searchBarMenu();}, 0);
    }
  },

  handleEvent: function(event){
    switch (event.type) {
      case "aftercustomization":
        this.urlBarMenu();
        this.searchBarMenu();
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }
}


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  replaceAndGoSearch.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      replaceAndGoSearch.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
