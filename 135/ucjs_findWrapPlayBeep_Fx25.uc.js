// ==UserScript==
// @name           ucjs_findWrapPlayBeep.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Findbarページ内検索において検索が折り返す時にビープ音を鳴らす (見つからない場合は何もしない)
// @include        main
// @compatibility  Firefox 115+
// @author         Alice0775
// @version        2025/01/10 remove @async
// @version        2023/01/11 18:30 pecify sound file
// @version        2019/11/19 11:00 fix 72 Bug 1554761 Small refactor, made possible because the findbar is now a custom element, implemented as a JS module
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
          case Ci.nsITypeAheadFind.FIND_WRAPPED:
            findWrapPlayBeep.playBeep();
            break;
        }
      this._updateStatusUI_org.apply(this, arguments);
    }
  },

  playBeep: function() {
    try {
      aFilePath = "file:///C:/WINDOWS/Media/Windows Ding.wav";
                   //"file:///C:/WINDOWS/Media/chimes.wav";
      if (!aFilePath)
        throw new Error("No sound file is specified");

      var ios = Components.classes["@mozilla.org/network/io-service;1"]
                .createInstance(Components.interfaces["nsIIOService"]);
      try {
        var uri = ios.newURI(aFilePath, "UTF-8", null);
      } catch(e) {
        throw new Error("Sound file path is invalid");
      }
      var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
      if (!file.exists())
        throw new Error("No sound file is found");

      Components.classes["@mozilla.org/sound;1"]
                .createInstance(Components.interfaces["nsISound"])
                .play(uri);
    } catch(x) {
      Components.classes["@mozilla.org/sound;1"]
            .createInstance(Components.interfaces.nsISound)
            .beep();
    }
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
