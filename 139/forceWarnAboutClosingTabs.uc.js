// ==UserScript==
// @name           forceWarnAboutClosingTabs.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    複数タブクローズ時のワーニング強制表示
// @include        main
// @async          true
// @author         Alice0775
// @compatibility  91
// @version        2021/11/04 23:00 for 91
// ==/UserScript==
  function forceWarnAboutClosingTabs() {
    var func = gBrowser.warnAboutClosingTabs.toString();
/*
    func = func.replace(
      `tabsToClose <= 1`,
      `false`
    );
 */
    func = func.replace(
      `tabsToClose <= maxTabsUndo`,
      `false`
    );
    gBrowser.warnAboutClosingTabs = new Function(
       func.match(/\(([^)]*)/)[1],
       func.replace(func.match(/[^)]*/)+")","").replace(/[^{]*\{/,"")
           .replace(/}$/, '')
    );
  }
  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    forceWarnAboutClosingTabs();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        forceWarnAboutClosingTabs();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
