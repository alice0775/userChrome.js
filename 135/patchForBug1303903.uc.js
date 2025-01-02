// ==UserScript==
// @name          patchForBug1303903.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1303903 menupopup should rollup onmouse when mouse wheel
// @include       main
// @async          true
// @compatibility Firefox 78+
// @author        alice0775
// @version       2020/12/21 00:00
// ==/UserScript==
"use strict";
var bug1303903 = {
  init: function(){
    //window.addEventListener('wheel', this, true);
    //window.addEventListener('DOMMouseScroll', this, true);
    //window.addEventListener('MozMousePixelScroll', this, true);
    //window.addEventListener('wheelevent', this, true);
    window.addEventListener('unload', this, false);
    window.addEventListener('popupshowing', this, true);
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.removeEventListener('popupshowing', this, true);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'wheel':
      case 'DOMMouseScroll':
      case 'MozMousePixelScroll':
      case 'wheelevent':
        //Services.console.logStringMessage(event.type);
        break;
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  popupshowing: function(event) {
    if (event.target.localName != "menupopup")
      return;
    event.target.setAttribute("rolluponmousewheel", "true");
  }
}


bug1303903.init();
