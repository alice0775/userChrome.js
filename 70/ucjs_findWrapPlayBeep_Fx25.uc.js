// ==UserScript==
// @name           ucjs_findWrapPlayBeep.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Findbarページ内検索において検索が折り返す時にビープ音を鳴らす (見つからない場合は何もしない)
// @include        main
// @compatibility  Firefox 56+
// @author         Alice0775
// @version        2019/06/24 23:00 fix 69 wait for gBrowser initialized
// @version        2018/09/15 18:00 cleanup
// @version        2018/09/15 15:00 fix too much recursion
// @version        2018/09/15 14:00 fix for newly created findbar
// @version        2018/09/15 10:00 56+
// ==/UserScript==

var findWrapPlayBeep = {
  init: function() {
    gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
      setTimeout(() => {
        findWrapPlayBeep.patch(event.target._findBar);
      }, 100);
    });
  },

  patch: function(aFindBar) {
    if (/updateStatusUI_org/.test(aFindBar._updateStatusUI.toString()))
      return;
    aFindBar._updateStatusUI_org =  aFindBar._updateStatusUI;
    aFindBar._updateStatusUI = function(res, aFindPrevious) {
       switch (res) {
          case this.nsITypeAheadFind.FIND_WRAPPED:
            findWrapPlayBeep.playBeep();
            break;
        }
      this._updateStatusUI_org(res, aFindPrevious);
    }
  },

  playBeep: function() {
    Components.classes["@mozilla.org/sound;1"]
              .createInstance(Components.interfaces.nsISound)
              .beep();
  }
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  findWrapPlayBeep.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      findWrapPlayBeep.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
