// ==UserScript==
// @name           patchForBug1811793.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround Bug 1811793
// @include        main
// @compatibility  Firefox 104+
// @author         Alice0775
// @version        2023/01/07 19:00 workaround Bug 1811793
// ==/UserScript==

var patchForBug1811793 = {
  init: function() {
    gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
      setTimeout(() => {patchForBug1811793.patch();}, 100);
    });
  },

  patch: function() {
    /*
    if (!gFindBar._findField.value) {
      gFindBar this._foundMatches.dataset.l10nId;
      gFindBar._foundMatches.hidden = true;
      gFindBar._foundMatches.setAttribute("value", "");
    }
    */
    
    //xxx Bug 1811793 - Findbar status is invalid if activated too quickly
    gFindBar.onMatchesCountResult =
      function onMatchesCountResult(result) {
          if (!this._findField.value || this._findField.value != this.browser.finder.searchString) {
            delete this._foundMatches.dataset.l10nId;
            this._foundMatches.hidden = true;
            this._foundMatches.setAttribute("value", "");
          } else if (!result.total) {
            delete this._foundMatches.dataset.l10nId;
            //this._foundMatches.hidden = true;
            //this._foundMatches.setAttribute("value", "");
          } else {
            const l10nId =
              result.total === -1
                ? "findbar-found-matches-count-limit"
                : "findbar-found-matches";
            this._foundMatches.hidden = false;
            document.l10n.setAttributes(this._foundMatches, l10nId, result);
          }
        }
  }
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBug1811793.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      patchForBug1811793.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
