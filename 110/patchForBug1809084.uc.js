// ==UserScript==
// @name          patchForBug1809084.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1809084 - bookmarks menus intermittently reset their scrollbox position to the top
// @include       main
// @compatibility Firefox 110
// @author        alice0775
// @version       2023/02/17 15:00 Remove redundancy
// @version       2023/02/17 00:00
// ==/UserScript==
"use strict";
var bug1809084 = {

  init: function(){
    window.addEventListener('popupshowing', this, true);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'popuphiding':
        this.popuphiding(event);
        break;
    }
  },

  popuphiding: function(event) {
    let menupopup = event.originalTarget;
    let y = menupopup.scrollBox.scrollbox.scrollTop;
    menupopup.bug1809084 = y;
  },

  popupshowing: function(event) {
    let menupopup = event.target;
    if (menupopup.localName != "menupopup" || !menupopup.hasAttribute("placespopup")) {
      return;
    }

    menupopup.addEventListener('popuphiding', this, {capture: false, once: true});
    let y = menupopup.bug1809084;
    setTimeout(() => {menupopup.scrollBox.scrollbox.scrollTop = y;},0);
  }
}


bug1809084.init();
