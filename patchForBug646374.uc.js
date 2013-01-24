// ==UserScript==
// @name           patchForBug646374.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 646374 - Windows taskbar button order is altered when transitioning into full-screen mode
// @include        main
// @compatibility  Firefox 4.0+
// @author         Alice0775
// @version        2013/01/25 05:00:00
// @version        2011/05/27 00:00:00
// ==/UserScript==
var bug646374 = {

  init: function(){
    window.BrowserFullScreen_org = window.BrowserFullScreen;
    window.BrowserFullScreen = function() {
      if (!window.fullScreen) {
        if (window.windowState == 3) {
          window.backupSizemode = "normal"
          window.maximize(); 
          setTimeout(function(){BrowserFullScreen_org();}, 0);
        } else {
          BrowserFullScreen_org();
          window.backupSizemode = ""
        }
      } else {
        BrowserFullScreen_org();
        if (typeof window.backupSizemode != 'undefined' &&
            window.backupSizemode == "normal") {
          setTimeout(function(){
            window.restore();
            window.backupSizemode = ""
          }, 0);
        }
      }
    }
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);

    window.BrowserFullScreen = window.BrowserFullScreen_org;
    delete window.BrowserFullScreen_org;
    if (typeof window.backupSizemode != "undefined")
      delete window.backupSizemode;
  },

  handleEvent: function(event) {
    switch (event,type) {
      case "unload":
        this.uninit();
    }
  }
}

bug646374.init();
