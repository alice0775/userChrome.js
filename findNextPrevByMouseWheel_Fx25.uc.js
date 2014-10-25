// ==UserScript==
// @name           findNextPrevByMouseWheel.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ページ内検索の「次を検索」と「前を検索」をボタン上のマウスホイールの回転で
// @include        main
// @include        chrome://global/content/viewPartialSource.xul
// @include        chrome://global/content/viewSource.xul
// @compatibility  Firefox 25
// @author         Alice0775
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

    //fx25 for existing findbar
    if (document.getElementById("FindToolbar"))
      setTimeout(function(){findNextPrevByMouseWheel.patch(document.getElementById("FindToolbar"))}, 100);
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar) {
        setTimeout(function(){findNextPrevByMouseWheel.patch(gBrowser.selectedTab._findBar);}, 100);
      }
    }
    //fx25 for newly created findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
        setTimeout(function(event){findNextPrevByMouseWheel.patch(event.target._findBar);}, 100, event);
      });
    }
  },

  patch: function(aFindBar) {
    document.getAnonymousElementByAttribute(aFindBar, "anonid", "find-next")
    .addEventListener("DOMMouseScroll", function(event) {
      if (!aFindBar._findField.value)
        return;
      var findBackwards = event.detail < 0 ? true : false;
      aFindBar.onFindAgainCommand(findBackwards);
    }, false);
    document.getAnonymousElementByAttribute(aFindBar, "anonid", "find-previous")
    .addEventListener("DOMMouseScroll", function(event) {
      if (!aFindBar._findField.value)
        return;
      var findBackwards = event.detail < 0 ? true : false;
      aFindBar.onFindAgainCommand(findBackwards);
    }, false);
  }
}
findNextPrevByMouseWheel.init();
