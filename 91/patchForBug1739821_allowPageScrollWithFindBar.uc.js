// ==UserScript==
// @name           patchForBug1739821_allowPageScrollWithFindBar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround for Bug 1739821 - Page would not scroll with keyboard after using prev, next, or any other buttons in the FindBar.
// @include        main
// @compatibility  Firefox 91
// @author         Alice0775
// @version        2021/11/12 00:00 stop surplus navigation
// @version        2021/11/11 00:00 working w/ addHistoryFindbarFx78.uc.js
// @version        2021/11/07 00:00
// @note           HOME/END key does not support
// ==/UserScript==
const ucjs_allowPageScrollWithFindBar = {
  init: function() {
    gBrowser.tabContainer.addEventListener('TabFindInitialized', this, true);
  },

  initFindBar: function() {
    if (/pending/.test(gBrowser.getFindBar.toString()) &&
        typeof gFindBar == "undefined") {
      setTimeout(() => {
        gBrowser.getFindBar().then(findbar => {
          this.patch(findbar);
        });
      }, 1000); /// xxx workarroundfor Bug 1411707
      return;
    } else {
        gBrowser.getFindBar().then(findbar => {
          this.patch(findbar);
        });
    }
  },

  patch: function(findbar) {
    findbar.addEventListener("keypress", ucjs_page_scroll, true);
    findbar.addEventListener("keypress", ucjs_page_scroll2, true);

    function ucjs_page_scroll(event) {
      ["find-next", "find-previous", "highlight",
       "find-case-sensitive", "find-match-diacritics", "find-entire-word", "historydropmarker"]
       .forEach(element => {
        if (event.originalTarget == findbar.getElement(element)) {
          let data = {
              keyCode: event.keyCode,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              altKey: event.altKey,
              shiftKey: event.shiftKey,
          }
          switch (event.keyCode) {
            /*case KeyEvent.DOM_VK_END:
            case KeyEvent.DOM_VK_HOME:*/
            case KeyEvent.DOM_VK_PAGE_UP:
            case KeyEvent.DOM_VK_PAGE_DOWN:
              if (
                !event.altKey &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey
              ) {
                let aEvent = new KeyboardEvent("keypress", data);
                findbar.getElement("findbar-textbox").dispatchEvent(aEvent)
                event.preventDefault();
              }
              break;
            case KeyEvent.DOM_VK_UP:
            case KeyEvent.DOM_VK_DOWN:
              let aEvent = new KeyboardEvent("keypress", data);
              findbar.getElement("findbar-textbox").dispatchEvent(aEvent)
              event.stopPropagation();
              event.preventDefault();
              break;
          }
        }
      });
    }
    function ucjs_page_scroll2(event) {
      ["highlight",
     "find-case-sensitive", "find-match-diacritics", "find-entire-word", "historydropmarker"]
     .forEach(element => {
        if (event.originalTarget == findbar.getElement(element)) {
          let data = {
              keyCode: event.keyCode,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              altKey: event.altKey,
              shiftKey: event.shiftKey,
          }
          switch (event.keyCode) {
            case KeyEvent.DOM_VK_RETURN:
              if (
                !event.altKey &&
                !event.ctrlKey &&
                !event.metaKey
              ) {
                let aEvent = new KeyboardEvent("keypress", data);
                findbar.getElement("findbar-textbox").dispatchEvent(aEvent)
                event.preventDefault();
              }
              break;
          }
        }
      });
    }
  },

  handleEvent: function(event){
    //Services.console.logStringMessage(event.type);
    switch (event.type) {
      case 'TabFindInitialized':
        this.initFindBar();
        break;
    }
  }
}
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  ucjs_allowPageScrollWithFindBar.init();

} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      ucjs_allowPageScrollWithFindBar.init();

    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}


