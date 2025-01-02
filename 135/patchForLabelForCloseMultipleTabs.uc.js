// ==UserScript==
// @name           patchForLabelForCloseMultipleTabs.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    change label for close multiple tabs
// @include        main
// @async          true
// @compatibility  Firefox 128+
// @author         Alice0775
// @version        2024/09/04 00:00
// ==/UserScript==

function patchForLabelForCloseMultipleTabs() {
  document.getElementById("closeTabOptions").addEventListener("popupshowing",(e) => {
    e.target.querySelector("#context_closeTabsToTheStart").setAttribute("label", "Close Tabs to Start");
    e.target.querySelector("#context_closeTabsToTheEnd").setAttribute("label", "Close Tabs to End");
  }, {once:true});
}

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    patchForLabelForCloseMultipleTabs();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        patchForLabelForCloseMultipleTabs();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }