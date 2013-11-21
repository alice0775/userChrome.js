// ==UserScript==
// @name           LockUIWithMasterPassword.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Lock UI if master password is enabled
// @author         Alice0775
// @include        main
// @version        2013/11/21 add UI
// @version        2009/06/22
// @compatibility  17+
// ==/UserScript==
var LockUI = {
  init: function() {
    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
          <menupopup id="menu_ToolsPopup" idxxxx="contentAreaContextMenu"> \
                <menuitem id="LockUI" \
                          label="Lock UI" \
                          accesskey="L" \
                          oncommand="LockUI.doLockUI();"/> \
          </menupopup> \
          <menupopup id="taskPopup"> \
                <menuitem id="LockUI" \
                          label="Lock UI" \
                          accesskey="L" \
                          oncommand="LockUI.doLockUI();"/> \
          </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, null);
  },

  handleEvent: function(event){
    event.preventDefault();
    event.stopPropagation();
    window.removeEventListener("mousedown", this, true);
    window.removeEventListener("mouseup", this, true);
    window.removeEventListener("click", this, true);
    window.removeEventListener("dragstart", this, true);
    window.removeEventListener("keypress", this, true);
    setTimeout(function(){
      var pk11db = Components.classes["@mozilla.org/security/pk11tokendb;1"].
                    getService(Components.interfaces.nsIPK11TokenDB)
      var token = pk11db.findTokenByName("");
      try {
        token.login(true);
        this.logoutMasterPassword();
      } catch (e) {
        this.doLockUI();
      }
    }.bind(this), 0);
  },

  doLockUI: function() {
    window.addEventListener("mousedown", this, true);
    window.addEventListener("mouseup", this, true);
    window.addEventListener("click", this, true);
    window.addEventListener("dragstart", this, true);
    window.addEventListener("keypress", this, true);
  },

  logoutMasterPassword: function() {
      var sdr = Components.classes["@mozilla.org/security/sdr;1"].
              getService(Components.interfaces.nsISecretDecoderRing);
      sdr.logoutAndTeardown();
  }
}

LockUI.init();