// ==UserScript==
// @name           patchForHideTabPreview.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    邪魔なタブグループプレビューパネル(Bug 2014211)とTabNote(Bug 2008657)をすぐに消す
// @include        main
// @author         Alice0775
// @compatibility  Firefox 147
// @version        2026/02/04 00:00 force it to hide on mouseover.
// @version        2026/02/04 00:00 In horizontal tab bar mode, hide sooner.
// @version        2026/02/04 00:00 0
// ==/UserScript==
let patchForHideTabGroupPreview = {
  init: function() {
    this.panel = document.getElementById("tabgroup-preview-panel");
    if (!this.panel)
      return;
    this.panel.addEventListener("mouseover", this);
  },

  timer: null,
  handleEvent: function(event) {
    switch(event.type) {
      case "mouseover":
        this.panel.hidePopup();
        break
    }
  }
}
let patchForHideTabPreview = {
  init: function() {
    this.panel = document.getElementById("tab-preview-panel");
    if (!this.panel)
      return;
    this.panel.addEventListener("mouseover", this);
  },

  timer: null,
  handleEvent: function(event) {
    switch(event.type) {
      case "mouseover":
        this.panel.hidePopup();
        break
    }
  }
}



  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    patchForHideTabGroupPreview.init();
    patchForHideTabPreview.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        patchForHideTabGroupPreview.init();
        patchForHideTabPreview.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
