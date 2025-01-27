// ==UserScript==
// @name           patchForBug1811793.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround Bug 1811793
// @include        main
// @async          true
// @compatibility  Firefox 135
// @author         Alice0775
// @version        2025/01/27 00:00 Fix an error
// @version        2023/03/16 00:00 Fixed unexpected selection of input text while typing. ( this may have side-effects) if serachWP_modoki if installed
// @version        2023/01/12 19:30 early return if already applied
// @version        2023/01/07 19:30 change init
// @version        2023/01/07 19:00 workaround Bug 1811793
// ==/UserScript==

var patchForBug1811793 = {
  init: function() {
    gBrowser.tabContainer.addEventListener("TabSelect",  function(event){
      patchForBug1811793.patch();
    });
  },

  patch: async function() {
    if (!gFindBar) {
      await gBrowser.getFindBar();
    }
    if (typeof gFindBar.patchForBug1811793 == "boolean") 
      return;
    gFindBar.patchForBug1811793 = true;
    /*
    if (!gFindBar._findField.value) {
      gFindBar this._foundMatches.dataset.l10nId;
      gFindBar._foundMatches.hidden = true;
      gFindBar._foundMatches.setAttribute("value", "");
    }
    */
    //xxx Bug 1811793 - Findbar status is invalid if activated too quickly
    if ("serachWP_modoki" in window)
    gFindBar.onFindResult = function onFindResult(data) {
      if (data.result == Ci.nsITypeAheadFind.FIND_NOTFOUND) {
        // If an explicit Find Again command fails, re-open the toolbar.
        if (data.storeResult/* && this.open()*/ && gFindBar.hidden) {
          this._findField.select();
          this._findField.focus();
        }
        this._findFailedString = data.searchString;
      } else {
        this._findFailedString = null;
      }

      this._updateStatusUI(data.result, data.findBackwards);
      this._updateStatusUIBar(data.linkURL);

      if (this.findMode != this.FIND_NORMAL) {
        this._setFindCloseTimeout();
      }
    }
    gFindBar.onMatchesCountResult = function onMatchesCountResult(result) {
      if (!this._findField.value) {
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
