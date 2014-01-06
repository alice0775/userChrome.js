// ==UserScript==
// @name           warnOnCloseProtectTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Warning dialog pops up when close window if protext tab exists
// @include        main
// @compatibility  Firefox 26.0
// @author         Alice0775
// @version        2014/01/01 08:00 ex
// @note           ketsuron: irane
// @note           Should set a preference(boolean) browser.tabs.warnOnCloseProtectTab to false or [true]
// @note           combination with tabProtect_mod1.uc.js
// ==/UserScript==
var warnAboutClosingTabs = {
  init: function() {
    let os = Services.obs;
    os.addObserver(this, "quit-application-requested", false);
    window.addEventListener("unload", this, false);

    window.closeWindow = function closeWindow(aClose, aPromptFunction) {
    //@line 9 "c:\builds\moz2_slave\m-cen-w32-ntly-000000000000000\build\toolkit\content\globalOverlay.js"
      var windowCount = 0;
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
      var e = wm.getEnumerator(null);
      
      while (e.hasMoreElements()) {
        var w = e.getNext();
        if (w.closed) {
          continue;
        }
        if (++windowCount == 2) 
          break;
      }
      
      // If we're down to the last window and someone tries to shut down, check to make sure we can!
      if (windowCount == 1 && !canQuitApplication("lastwindow"))
        return false;
      else if (windowCount != 1) {
    //@line 28 "c:\builds\moz2_slave\m-cen-w32-ntly-000000000000000\build\toolkit\content\globalOverlay.js"
        if (Array.some(gBrowser.tabs, tab => tab.hasAttribute("tabProtect"))) {
          if (!warnAboutClosingTabs.confirm(""))
            return false;
        }
        if (typeof(aPromptFunction) == "function" && !aPromptFunction())
          return false;
      }

      if (aClose)    
        window.close();
      
      return true;
    };
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    let os = Services.obs;
    os.removeObserver(this, "quit-application-requested");
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
    }
  },

  observe: function BG_observe(subject, topic, data) {
    switch (topic) {
      case "quit-application-requested":
        this._onQuitRequest(subject, data);
        break;
    }
  },

  _onQuitRequest: function(aCancelQuit, aQuitType) {
    // If user has already dismissed quit request, then do nothing
    if ((aCancelQuit instanceof Ci.nsISupportsPRBool) && aCancelQuit.data)
      return;
    // If restart from addon manager, then do nothing
    if (aQuitType == "restart")
      return;

    var pagecount = false;
    var browserEnum = Services.wm.getEnumerator("navigator:browser");
    while (browserEnum.hasMoreElements()) {
      var browser = browserEnum.getNext();
      var tabbrowser = browser.document.getElementById("content");
      if (tabbrowser)
        pagecount |= Array.some(tabbrowser.tabs, tab => tab.hasAttribute("tabProtect"));
    }

    // If there is no protect tab, then do nothing
    if (!pagecount)
      return;

    if (!aQuitType)
       aQuitType = "quit";

    if (aQuitType == "lastwindow" && 
         (gBrowser.tabs.length < 2 && Services.prefs.getBoolPref("browser.tabs.warnOnClose") ||
          !Services.prefs.getBoolPref("browser.tabs.warnOnClose")) ) {
      var result = this.confirm(aQuitType);
      // cancel to quit
      if (!result) {
        aCancelQuit.QueryInterface(Ci.nsISupportsPRBool);
        aCancelQuit.data = true;
      }
      return;
    }
    if (aQuitType == "quit") {
      var mostRecentBrowserWindow = Services.wm.getMostRecentWindow("navigator:browser");
      if (window == mostRecentBrowserWindow) {
        var result = this.confirm(aQuitType);
        // cancel to quit
        if (!result) {
          aCancelQuit.QueryInterface(Ci.nsISupportsPRBool);
          aCancelQuit.data = true;
        }
      }
    }
  },

  confirm: function(c) {
    var wornOnProtectTab = true;
    try {
      wornOnProtectTab = Services.prefs.getBoolPref("browser.tabs.warnOnCloseProtectTab");
    } catch(e) {}
    if (!wornOnProtectTab)
      return false;

    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
    return promptService.confirm(null, "Confirm close", "You are about to close protected tab(s). Are you sure you want to continue?");
  }
};

warnAboutClosingTabs.init();