// ==UserScript==
// @name           replaceAndGoSearch.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    replace selection with clipboard text and go/search
// @include        main
// @compatibility  Firefox 91
// @author         Alice0775
// @version        2021/09/04 0700
// @version        2021/08/21 12:00
// ==/UserScript==
var replaceAndGoSearch = {

  init: async function() {
    this.urlBarMenu();
    if (!Services.search.isInitialized) {
      await Services.search.init();
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
    let insertLocation = document.getElementById("paste-and-go");;

    let replaceAndGo = document.createXULElement("menuitem");
    replaceAndGo.id = "replace-and-go";
    replaceAndGo.setAttribute("label", "Replace and Go");
    replaceAndGo.setAttribute("anonid", "replace-and-go");
    replaceAndGo.addEventListener("command", (event) => {
      gURLBar._suppressStartQuery = true;

      window.goDoCommand("cmd_paste");
      gURLBar.setResultForCurrentValue(null);
      gURLBar.handleCommand(event);

      gURLBar._suppressStartQuery = false;
    });


    contextMenu.addEventListener("popupshowing", () => {
      // Close the results pane when the input field contextual menu is open,
      // because paste and go doesn't want a result selection.
      gURLBar.view.close();

      if (!contextMenu.querySelector("#replace-and-go")) {
        insertLocation.insertAdjacentElement("afterend", replaceAndGo);
      }

      let controller = document.commandDispatcher.getControllerForCommand(
        "cmd_paste"
      );
      let enabled = controller.isCommandEnabled("cmd_paste");
      if (enabled) {
        replaceAndGo.removeAttribute("disabled");
      } else {
        replaceAndGo.setAttribute("disabled", "true");
      }
    });
  },


  searchBarMenu: function() {
    let replaceAndSearch = document.createXULElement("menuitem");
    replaceAndSearch.id = "replace-and-search";
    replaceAndSearch.setAttribute("label", "Replace & Search");
    replaceAndSearch.setAttribute("anonid", "replace-and-search");
    replaceAndSearch.addEventListener("command", (event) => {

      goDoCommand("cmd_paste");
      BrowserSearch.searchBar.handleSearchCommand(event);

    });

    let contextMenu = searchbar.querySelector(".textbox-contextmenu");
    if (!contextMenu)
      return;

    contextMenu.addEventListener("popupshowing", () => {
      if (!contextMenu.querySelector("#replace-and-search")) {
        let insert = contextMenu.querySelector(".searchbar-paste-and-search");
        insert.insertAdjacentElement("afterend", replaceAndSearch);
      }
      // Close the results pane when the input field contextual menu is open,
      // because paste and go doesn't want a result selection.

      let controller = document.commandDispatcher.getControllerForCommand(
        "cmd_paste"
      );
      let enabled = controller.isCommandEnabled("cmd_paste");
      if (enabled) {
        replaceAndSearch.removeAttribute("disabled");
      } else {
        replaceAndSearch.setAttribute("disabled", "true");
      }
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
