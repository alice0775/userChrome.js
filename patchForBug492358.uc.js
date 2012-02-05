// ==UserScript==
// @name           patchForBug492358.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 492358 - Loads triggered on unload incorrectly counted against next load's security state
// @author         Alice0775
// @include        main
// @compatibility  10-
// @version        2012/02/01
// ==/UserScript==
var patchForBug492358 = {
  init: function(){
    window.addEventListener('unload', this.uninit, false);
    gBrowser.addEventListener('unload', this.unload, true);
  },

  uninit: function(){
    window.removeEventListener('unload', this.uninit, false);
    gBrowser.removeEventListener('unload', this.unload, true);
  },

  unload: function(event){
    if (event.originalTarget instanceof HTMLDocument) {  
      var win = event.originalTarget.defaultView;
      if (win.frameElement) {
        // Frame within a tab was loaded. win should be the top window of
        // the frameset. If you don't want do anything when frames/iframes
        // are loaded in this web page, uncomment the following line:
        return;
        // Find the root document:
        win = win.top;
      }
      var aTab = gBrowser._getTabForContentWindow(win);
      if (!aTab )
        return;
      if (aTab.hasAttribute('busy') || 
          aTab.hasAttribute('progless') || 
          aTab.linkedBrowser.docShell.busyFlags) {
        event.stopPropagation();
      }
    }
  }
}
patchForBug492358.init();
