// ==UserScript==
// @name           patchForBug972259.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 972259 - User is forced to press back button twice to go back to previous page on some websites
// @include        main
// @compatibility  Firefox 78
// @author         Alice0775
// @version        2021/06/29
// ==/UserScript==

{
  function patchForBug972259_init() {
    gBrowser.goBack = function(requireUserInteraction) {
      let sessionHistory = SessionStore.getSessionHistory(gBrowser.selectedTab);
      let index = sessionHistory.index;
    	let entry = sessionHistory.entries[index];
    	let uri = entry.url;
      for (let i = index - 1; i >= 0; i--) {
        let entry1  = sessionHistory.entries[i];
        if (uri != entry1.url) {
          gBrowser.webNavigation.gotoIndex(i);
          break;
        }
      }
    };

    gBrowser.goForward = function(requireUserInteraction) {
      let sessionHistory = SessionStore.getSessionHistory(gBrowser.selectedTab);
      let index = sessionHistory.index;
      let length = sessionHistory.entries.length;
    	let entry = sessionHistory.entries[index];
    	let uri = entry.url;
      for (let i = index + 1; i < length; i++) {
        let entry1  = sessionHistory.entries[i];
        if (uri != entry1.url) {
          gBrowser.webNavigation.gotoIndex(i);
          break;
        }
      }
    };
  }

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    patchForBug972259_init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
       patchForBug972259_init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
}