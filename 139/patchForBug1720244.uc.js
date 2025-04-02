// ==UserScript==
// @name           patchForBug1720244.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 1720244 - Toggling the whole words checkbox causes find bar to reappear in all tabs
// @include        main
// @compatibility  Firefox 78+
// @author         Alice0775
// @version        2025/01/10 remove @async
// @version        2021/07/13 00:00
// ==/UserScript==
var patchForBug1720244 = {
  init: function() {
    gBrowser.tabContainer.addEventListener("TabFindInitialized", (event) => {
      setTimeout((event) => {this.patch(event.target);}, 100, event);
    });
  },

  patch: function(tab) {
    let func = tab._findBar.open.toString();
    let func1 = func.replace(
    'if (this.hidden) {',
    'if (this.hidden && this.browser == gBrowser.selectedBrowser) {'
    );
    if (func != func1)
      tab._findBar.open = new Function(
             func1.match(/\(([^)]*)/)[1],
             func1.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
      );
  }
}
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBug1720244.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      patchForBug1720244.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
