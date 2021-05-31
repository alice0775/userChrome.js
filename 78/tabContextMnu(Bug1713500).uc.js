// ==UserScript==
// @name           tabContextMnu(Bug1713500).uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug1713500
// @include        main
// @author         Alice0775
// @Note           タブのコンテキストメニューのラベル
// @compatibility  78
// @version        2021/05/30 20:00 fix Bug1713500
// ==/UserScript==

var Bug1713500 = {
  init: function(){
    let lazies = document
        .getElementById("tabContextMenu")
        .querySelectorAll("[data-lazy-l10n-id]");
    if (lazies) {
      MozXULElement.insertFTLIfNeeded("browser/tabContextMenu.ftl");
      // Un-lazify the l10n-ids now that the FTL file has been inserted.
      lazies.forEach((el) => {
            el.setAttribute("data-l10n-id", el.getAttribute("data-lazy-l10n-id"));
            el.removeAttribute("data-lazy-l10n-id");
          });
    }
  }
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  Bug1713500.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      Bug1713500.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
