// ==UserScript==
// @name           patchForBug1952741.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 1952741 - The tab audio button (<moz-button tabindex=-1>) moves keyboard focus to it when clicked
// @author         Alice0775
// @include        main
// @async          false
// @sandbox        false
// @compatibility  140
// @version        2025/11/22
// ==/UserScript==

window.patchForBug1952741 = {
  focusedElement: null,
  init: function() {
    window.addEventListener('mousedown', this, true);
    window.addEventListener('mouseup', this, true);
  },
  handleEvent: function(event){
//window.userChrome_js.debug(event.type);
    switch (event.type) {
      case 'mousedown':
        this.focusedElement = Services.focus.focusedElement;
        break;
      case 'mouseup':
        let target = event.target;
        try {
          let audioButton = target.closest(".tab-audio-button");
          if (audioButton && this.focusedElement) {
            this.focusedElement.focus();
          }
        } catch(ex) {}
        break;
    }
  },
};

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBug1952741.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      patchForBug1952741.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
