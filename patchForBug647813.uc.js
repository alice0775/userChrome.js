// ==UserScript==
// @name           patchForBug647813.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 647813 - HTML5 Form Validation tooltips are truncated with select elements and Bug 661761 - Validation bubble appears in the corner of the browser window if input field has display: none
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0 7.0
// @author         Alice0775
// @version        2011/04/05
// @Note
// ==/UserScript==
var bug647813 = {
  handleEvent: function(event) {
    switch (event.type) {
      case "popupshowing":
        this.movePosition(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", this, false);
    this.patch();
  },

  uninit: function() {
    this.popup.removeEventListener("popupshowing", this, false);
    window.removeEventListener("unload", this, false);
  },

  patch: function() {
    let popup = this.popup = document.getElementById("invalid-form-popup");
    popup.removeAttribute("type");
    popup.setAttribute("level", "top");
    popup.addEventListener("popupshowing", this, false);
  },

  movePosition: function(event) {
    let popup = this.popup;
    let xx = popup.boxObject.screenX;
    let yy = popup.boxObject.screenY;
    let w = popup.boxObject.width;
    let h = popup.boxObject.height;
    let wx = content.screenX;
    let wy = content.screenY;
    let wh = content.outerHeight;
    let ww = content.outerWidth;
    if (yy + h + 5 >= wy + wh )
      popup.moveTo(wx + ww / 2 - w / 2, wy + wh / 2 - h / 2);
    if (xx <= wx)
      popup.moveTo(wx, yy);
    if (xx + w >= wx + ww)
      popup.moveTo(wx + ww - w, yy);
  }
}
bug647813.init();
