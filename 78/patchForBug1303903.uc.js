// ==UserScript==
// @name          patchForBug1303903.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1303903
// @include       main
// @compatibility Firefox 78+
// @author        alice0775
// @version       2020/12/21 00:00
// ==/UserScript==
"use strict";
var bug1303903 = {
  init: function(){
    window.addEventListener('unload', this, false);
    window.addEventListener('popupshowing', this, true);
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.removeEventListener('popupshowing', this, true);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  popupshowing: function(event) {
Services.console.logStringMessage("event.target.localName " + event.target.localName);
    if (event.target.localName != "menupopup")
      return;
    event.target.setAttribute("rolluponmousewheel", "true");
  }
}


bug1303903.init();
