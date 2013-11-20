// ==UserScript==
// @name           patchForBug859126.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug859126 Mouse scrolling of long menus breaks if the last item is hidden
// @include        main
// @compatibility  Firefox 17+
// @author         Alice0775
// @version        2013/04/15 17:00
// ==/UserScript==

"use strict";
var bug859126 = {
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
    this.setListener(event.target);
  },

  setListener: function(popup) {
    var scrollbox = popup._scrollbox ||
                    document.getAnonymousElementByAttribute(popup, "class", "popup-internal-box");
    if (!scrollbox)
      return;

    var func = scrollbox._canScrollToElement.toString();
    if (/getPropertyValue\("display"\) != "none";/.test(func))
      return

    // xxx bug859126
    scrollbox._canScrollToElement = function(element) {
      return !element.hidden &&
             window.getComputedStyle(element, null).getPropertyValue("display") != "none";
    }
  }

}

bug859126.init();
