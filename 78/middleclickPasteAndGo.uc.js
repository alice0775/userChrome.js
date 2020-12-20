// ==UserScript==
// @name           middleclickPasteAndGo.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    middle click Paste & Go(Search) to open in new tab
// @include        main
// @author         Alice0775
// @compatibility  78
// @version        2020/12/21 00:00 Apply to textbox of Addres Bar/Search Bar as well as menuitems
// @version        2020/12/15 00:00
// @version        2020/12/14 00:00
// ==/UserScript==

var middleclickPasteAndGo = {
  init: function() {
    this.aftercustomization();
    window.addEventListener('aftercustomization', () => {middleclickPasteAndGo.aftercustomization()}, false);

  },

  popupshown: function(event) {
    document.querySelector(".searchbar-paste-and-search").addEventListener("click", (event) => {middleclickPasteAndGo.pasteAndSearch(event)}, false);
  },

  aftercustomization: function() {
    document.getElementById("paste-and-go").addEventListener("click", (event) => {middleclickPasteAndGo.pasteAndGo(event)}, false);
    document.querySelector("#searchbar .textbox-contextmenu").addEventListener("popupshown", () => {middleclickPasteAndGo.popupshown(event)}, {once: true}, );

gURLBar.textbox.addEventListener("click", (event) => {middleclickPasteAndGo.pasteAndGo2(event)}, true);
BrowserSearch.searchBar.addEventListener("click", (event) => {middleclickPasteAndGo.pasteAndSearch2(event)}, true);
  },

  pasteAndGo: function(event) {
    if (event.button != 1)
      return;

    event.target.closest("menupopup")?.hidePopup();

    gURLBar._suppressStartQuery = true;

    gURLBar.select();
    gURLBar.window.goDoCommand("cmd_paste");
    gURLBar.handleCommand(event);

    gURLBar._suppressStartQuery = false;
  },

  pasteAndSearch: function(event) {
    if (event.button != 1)
      return;

    event.target.closest("menupopup")?.hidePopup();

    BrowserSearch.searchBar.select();
    goDoCommand("cmd_paste");
    BrowserSearch.searchBar.handleSearchCommandWhere(event, null, "tab", {inBackground: false,});
  },

  pasteAndGo2: function(event) {
    if (event.originalTarget.parentNode != gURLBar.inputField)
      return;
    if (event.button != 1)
      return;
    if (gURLBar.getAttribute("pageproxystate") != "valid") {
      gURLBar.view.close();
    }

    gURLBar._suppressStartQuery = true;

    gURLBar.select();
    gURLBar.window.goDoCommand("cmd_paste");
    gURLBar.handleCommand(event);

    gURLBar._suppressStartQuery = false;
  },

  pasteAndSearch2: function(event) {
    if (event.target != BrowserSearch.searchBar._textbox)
      return;
    if (event.button != 1)
      return;

    BrowserSearch.searchBar.select();
    goDoCommand("cmd_paste");
    BrowserSearch.searchBar.handleSearchCommandWhere(event, null, "tab", {inBackground: false,});
  },
  
}

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    middleclickPasteAndGo.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        middleclickPasteAndGo.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
