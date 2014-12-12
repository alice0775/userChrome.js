// ==UserScript==
// @name           Close All Child Windows ver.2.0.0
// @namespace      http://s2works.homeunix.net/
// @description    Close All Child Windows
// @include        main
// @compatibility  Firefox
// @author         modified by Alice0775, for Nightly.
// @version        2014/11/11 06:00 Bug 1069300 - Implement privacy button and subview 
// @version        2011/04/22 13:00 Bug 648368 - Add Aurora branding, switch default branding from "Minefield" to "Nightly"
// @version        LastMod2007/02/20
// @Note           http://space.geocities.yahoo.co.jp/gl/alice0775
// ==/UserScript==

(function() {

var closeAllChildWindows = {
  onUnload : function() {
    let windowType = document.documentElement.getAttribute("windowtype");
    let enumerator = Services.wm.getEnumerator(null);
		while (enumerator.hasMoreElements()) { 
      let browserWin = enumerator.getNext();
      if (browserWin.document.documentElement.getAttribute("windowtype") == null ||
          browserWin.document.documentElement.getAttribute("windowtype") == windowType)
        return;
    }
    goQuitApplication();
  }
};

window.addEventListener("unload", function() { closeAllChildWindows.onUnload(); }, false);

})();
