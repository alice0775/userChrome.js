// ==UserScript==
// @name           findNextPrevByMouseWheel.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ページ内検索の「次を検索」と「前を検索」をボタン上のマウスホイールの回転で
// @include        main
// @compatibility  Firefox 69
// @author         Alice0775
// @version        2019/06/24 23:00 wait for gBrowser initialized
// @version        2018/09/15 18:00 cleanup
// @version        2018/09/15 08:00 Bug 1411707 - Switch findbar and findbar-textbox from XBL bindings into a Custom Element
// @version        2018/09/08 08:00 event.preventDefault();
// @version        2014/10/25 12:00 Fix viewsource
// @version        2014/10/19 20:00 Fix sometime not initialized
// @version        2013/05/11 12:00 Bug537013, Bug 893349
// @version        2009/03/15 23:30 何でこうコロコロと意味のない変更するのかね > Dao  Gottwald (Bug 481397 -  Incorrect tab order of findbar buttons on Linux)
// @Note
// ==/UserScript==
// @version        2010/07/09 07:00
// @version        2009/03/15 07:30
// @version        2009/03/15 00:00

var findNextPrevByMouseWheel = {
  init: function() {
    gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
      setTimeout(() => {findNextPrevByMouseWheel.patch();}, 100);
    });
  },

  patch: function() {
    gFindBar.getElement("find-next")
    .addEventListener("DOMMouseScroll", function(event) {
      if (!gFindBar._findField.value)
        return;
      event.preventDefault();
      event.stopPropagation();
      var findBackwards = event.detail < 0 ? true : false;
      gFindBar.onFindAgainCommand(findBackwards);
    }, false);
    gFindBar.getElement("find-previous")
    .addEventListener("DOMMouseScroll", function(event) {
      if (!gFindBar._findField.value)
        return;
      event.preventDefault();
      event.stopPropagation();
      var findBackwards = event.detail < 0 ? true : false;
      gFindBar.onFindAgainCommand(findBackwards);
    }, false);
  }
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  findNextPrevByMouseWheel.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      findNextPrevByMouseWheel.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
