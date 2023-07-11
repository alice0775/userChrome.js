// skip 1st line
/*
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

    //let { Services } = Cu.import('resource://gre/modules/Services.jsm');
    //Cu.import('resource://gre/modules/osfile.jsm');

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
        const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
        const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);

          let file = ds.get("UChrm", Ci.nsIFile);
          file.append('userChrome.js');
          let fileURL = fph
                        .getURLSpecFromActualFile(file) + "?" + file.lastModifiedTime;
          Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
                       .loadSubScript(fileURL, document.defaultView, 'UTF-8');
        }
      },
    };

    if (!Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULRuntime).inSafeMode)
      new UserChrome_js();

} catch(ex) {};

try {
    pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
} catch(e) {}

