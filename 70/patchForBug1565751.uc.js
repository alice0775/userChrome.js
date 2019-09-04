// ==UserScript==
// @name           patchForBug1565751.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround for Selection of Address Bar is collapsed randomly when switching tab
// @include        main
// @compatibility  Firefox 68+
// @author         Alice0775
// @version        2019/07/31 15:00
// ==/UserScript==

var patchForBug1565751 = {
  init: function() {
    gBrowser.tabContainer.addEventListener("TabSelect", this, false);
  },

  handleEvent(event) {
    switch(event.type) {
      case "TabSelect":
        setTimeout(() => {this.workaround();}, 0);
        break;
    }
  },

  workaround(event) {
    if (!gURLBar.focused)
      return;
    if (!gURLBar.editor.selection.isCollapsed)
      return;
    if (gURLBar.selectionStart == 0 && (gURLBar.selectionStart == gURLBar.selectionEnd)) {
       gURLBar.editor.selectAll();
    }
  }
}


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBug1565751.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      patchForBug1565751.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
