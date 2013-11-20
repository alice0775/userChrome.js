// ==UserScript==
// @name           LockUIWithMasterPassword.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Lock UI if master password is enabled
// @author         Alice0775
// @include        main
// @version        2009/06/22
// @compatibility  17+
// ==/UserScript==
(function() {
  var ONCE = true;
  window.addEventListener("mousedown", hage, true);
  window.addEventListener("mouseup", hage, true);
  window.addEventListener("drop", hage, true);
  window.addEventListener("keypress", hage, true);
  function hage(event) {
    var success = false;
    var pk11db = Components.classes["@mozilla.org/security/pk11tokendb;1"].
                  getService(Components.interfaces.nsIPK11TokenDB)
    var token = pk11db.findTokenByName("");
    try {
      token.login(true);
      success = true;
      if (ONCE) {
        window.removeEventListener("mousedown", hage, true);
        window.removeEventListener("mouseup", hage, true);
        window.removeEventListener("drop", hage, true);
        window.removeEventListener("keypress", hage, true);
      }
      logoutMasterPassword();
    } catch (e) {
      event.preventDefault();
      event.stopPropagation();
      success = false;
    }
  }
  function logoutMasterPassword() {
      var sdr = Components.classes["@mozilla.org/security/sdr;1"].
              getService(Components.interfaces.nsISecretDecoderRing);
      sdr.logoutAndTeardown();
  }
})();