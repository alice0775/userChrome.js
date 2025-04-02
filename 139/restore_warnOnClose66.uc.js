// ==UserScript==
// @name           restore_warnOnClose66.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    restore_warnOnClose66
// @include        main
// @async          true
// @author         Alice0775
// @compatibility  68
// @version        2019/11/02 06:00 revert Bug 1135303

// ==/UserScript==

var restore_warnOnClose66 = {
  init: function(){
    let func =  gBrowser.warnAboutClosingTabs.toString();
    if (gBrowser && /tabsToClose <= maxTabsUndo/.test(func)) {
      func = func.replace(
        'tabsToClose <= maxTabsUndo',
        'false'
       );
      eval("gBrowser.warnAboutClosingTabs = function " + func.replace(/^function/, ''));
    }
  }
}

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    restore_warnOnClose66.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        restore_warnOnClose66.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
