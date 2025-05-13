// skip 1st line
/*
 2025/04/16 loadSubScript chrome:// instead of file://
 2023/07/11 Removed Services.jsm, per Bug 1780695
 2022/06/07 remove osfile.jsm
 2021/08/05 fix for 92+ port Bug 1723723 - Switch JS consumers from getURLSpecFromFile to either getURLSpecFromActualFile or getURLSpecFromDir
 2019/12/11 01:30 fix 72 use "load" in config.js, working with Sub-Script/Overlay Loader v3.0.60mod
 2019-10-22 23:00
*/

try {

    let {
      classes: Cc,
      interfaces: Ci,
      utils: Cu
    } = Components;

    try {
      const cmanifest = Services.dirsvc.get('UChrm', Ci.nsIFile);
      cmanifest.append('chrome.manifest');
      Components.manager.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(cmanifest);
    } catch (ex) {
      /* empty */
    }
    function UserChrome_js() {
      Services.obs.addObserver(this, 'domwindowopened', false);
    };

    UserChrome_js.prototype = {
      observe: function (aSubject, aTopic, aData) {
          aSubject.addEventListener('load', this, true);
      },

      handleEvent: function (aEvent) {
        let document = aEvent.originalTarget;
        if (document.location && document.location.protocol == 'chrome:') {

        let file = Services.dirsvc.get('UChrm', Ci.nsIFile);
        file.append('userChrome.js');
        Services.scriptloader.loadSubScript('chrome://userchromejs/content/userChrome.js?' +
                              file.lastModifiedTime, document.defaultView);
        }
      },
    };

    if (!Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULRuntime).inSafeMode)
      new UserChrome_js();

} catch(ex) {};

try {
    pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
    //revert uBlock Origin settings
    //lockPref("network.dns.disablePrefetch", false);
    //lockPref("network.dns.disablePrefetchFromHTTPS", false);
    //lockPref("network.predictor.enable-prefetch", true);
    //lockPref("network.predictor.enabled", true);
    //lockPref("network.prefetch-next", true);
    //lockPref("network.http.speculative-parallel-limit", 20);

     //lockPref("security.browser_xhtml_csp.enabled", false);
} catch(e) {}
