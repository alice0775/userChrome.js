// ==UserScript==
// @name           patchForBug1666095.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Fix alt+wheel mouse skips session history
// @include        main
// @compatibility  Firefox 79+
// @author         Alice0775
// @version        2020/10/10 00:00
// @Note
// ==/UserScript==
var patchForBug1666095 = {
  init: function() {
    gBrowser.addEventListener('wheel', this, true);
  },
  handleEvent: function(event) {
    switch (event.type) {
      case "wheel":
        if (Services.prefs.getIntPref("mousewheel.with_alt.action", 2) == 2 &&
            event.altKey) {
          this.navigation(event);
        } else if (Services.prefs.getIntPref("mousewheel.with_control.action", 3) == 2 &&
            event.ctrlKey) {
          this.navigation(event);
        } else if (Services.prefs.getIntPref("mousewheel.with_meta.action", 1) == 2 &&
            event.metaKey) {
          this.navigation(event);
        } else if (Services.prefs.getIntPref("mousewheel.with_shift.action", 4) == 2 &&
            event.shiftKey) {
          this.navigation(event);
        } else if (Services.prefs.getIntPref("mousewheel.with_win.action", 1) == 2 &&
            event.metaKey) {
          this.navigation(event);
        }
    }
  },
  navigation: function(event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.deltaY > 0) {
      document.getElementById("Browser:Back").doCommand();
    } else {
      document.getElementById("Browser:Forward").doCommand();
    }
  }
}

patchForBug1666095 .init();