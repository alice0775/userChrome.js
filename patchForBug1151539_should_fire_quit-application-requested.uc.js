// ==UserScript==
// @name           patchForBug1151539_should_fire_quit-application-requested.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Fixed Bug 1151539 - BrowserUtils restartApplication should fire quit-application-requested
// @include        main
// @compatibility  Firefox 40+
// @author         Alice0775
// @version        2015/05/28
// ==/UserScript==

BrowserUtils.restartApplication = function() {
  let appStartup = Cc["@mozilla.org/toolkit/app-startup;1"]
                     .getService(Ci.nsIAppStartup);
  let cancelQuit = Cc["@mozilla.org/supports-PRBool;1"]
                     .createInstance(Ci.nsISupportsPRBool);
  Services.obs.notifyObservers(cancelQuit, "quit-application-requested", "restart");
  if(cancelQuit.data) { // The quit request has been canceled.
    return false;
  };
  //if already in safe mode restart in safe mode
  if (Services.appinfo.inSafeMode) {
    appStartup.restartInSafeMode(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart);
    return true;
  }
  appStartup.quit(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart);
  return true;
}
