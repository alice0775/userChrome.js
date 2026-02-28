// ==UserScript==
// @name           restore_warnOnClose66.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    restore_warnOnClose66
// @include        main
// @async          true
// @author         Alice0775
// @compatibility  150
// @version        2026/03/01 Bug 2017957 - Add freezeBuiltins option to Cu.Sandbox
// @version        2025/06/16 Bug 1968479 - Only allow eval (with system principal / in the parent) when an explicit pref is set
// @version        2025/02/02  add @sandbox
// @version        2019/11/02 06:00 revert Bug 1135303

// ==/UserScript==

var restore_warnOnClose66 = {
  init: function(){
    let sb = window.userChrome_js?.sb;
    if (!sb) {
      sb = Cu.Sandbox(window, {
          sandboxPrototype: window,
          sameZoneAs: window,
          freezeBuiltins: false,
      });

      /* toSource() is not available in sandbox */
      Cu.evalInSandbox(`
          Function.prototype.toSource = window.Function.prototype.toSource;
          Object.defineProperty(Function.prototype, "toSource", {enumerable : false})
          Object.prototype.toSource = window.Object.prototype.toSource;
          Object.defineProperty(Object.prototype, "toSource", {enumerable : false})
          Array.prototype.toSource = window.Array.prototype.toSource;
          Object.defineProperty(Array.prototype, "toSource", {enumerable : false})
      `, sb);
      window.addEventListener("unload", () => {
          setTimeout(() => {
              Cu.nukeSandbox(sb);
          }, 0);
      }, {once: true});
    }

    let func =  gBrowser.warnAboutClosingTabs.toString();
    if (gBrowser && /tabsToClose <= maxTabsUndo/.test(func)) {
      func = func.replace(
        'tabsToClose <= maxTabsUndo',
        'false'
       );
      Cu.evalInSandbox("gBrowser.warnAboutClosingTabs = function " + func.replace(/^function/, ''), sb);
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
