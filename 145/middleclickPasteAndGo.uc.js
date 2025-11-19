// ==UserScript==
// @name           middleclickPasteAndGo.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    middle click Paste & Go(Search) to open in new tab
// @include        main
// @async          true
// @author         Alice0775
// @compatibility  Firefox 145
// @version        2025/11/20 10:00 Fix Bug
// @version        2025/11/15 10:00 Bug 1986130 etc
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version        2024/12/31 13:00 
// @version        2024/01/05 00:00 
// @version        2020/12/21 00:00 Apply to textbox of Addres Bar/Search Bar as well as menuitems
// @version        2020/12/15 00:00
// @version        2020/12/14 00:00
// ==/UserScript==

var middleclickPasteAndGo = {
  init: function() {
    this.aftercustomization();
    //window.addEventListener('aftercustomization', () => {middleclickPasteAndGo.aftercustomization()}, false);

  },

  popupshown: function(event) {
    document.querySelector(".searchbar-paste-and-search").addEventListener("click", (event) => {middleclickPasteAndGo.pasteAndSearch(event)}, false);
  },

  aftercustomization: function() {
    if (!document.getElementById("paste-and-go"))
      return;
    document.getElementById("paste-and-go").addEventListener("click", (event) => {middleclickPasteAndGo.pasteAndGo(event)}, false);
    document.querySelector("#searchbar .textbox-contextmenu").addEventListener("popupshown", () => {middleclickPasteAndGo.popupshown(event)}, {once: true}, );

gURLBar.inputField.addEventListener("auxclick", (event) => {middleclickPasteAndGo.pasteAndGo2(event)}, true);
document.getElementById("searchbar").addEventListener("click", (event) => {middleclickPasteAndGo.pasteAndSearch2(event)}, true);
  },

  pasteAndGo: function(event) {
    if (event.button != 1)
      return;

    event.target.closest("menupopup")?.hidePopup();

    gURLBar._suppressStartQuery = true;

    gURLBar.select();
    gURLBar.window.goDoCommand("cmd_paste");
    gURLBar.setResultForCurrentValue(null);
    gURLBar.handleCommand(event);

    gURLBar._suppressStartQuery = false;
  },

  pasteAndSearch: function(event) {
    if (event.button != 1)
      return;

    event.target.closest("menupopup")?.hidePopup();

    document.getElementById("searchbar").select();
    goDoCommand("cmd_paste");
    document.getElementById("searchbar").handleSearchCommandWhere(event, null, "tab", {inBackground: false,});
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
    gURLBar.setResultForCurrentValue(null);
    gURLBar.handleCommand(event);

    gURLBar._suppressStartQuery = false;
  },

  pasteAndSearch2: function(event) {
    if (event.target != document.getElementById("searchbar")._textbox)
      return;
    if (event.button != 1)
      return;

    document.getElementById("searchbar").select();
    goDoCommand("cmd_paste");
    document.getElementById("searchbar").handleSearchCommandWhere(event, null, "tab", {inBackground: false,});
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
