// ==UserScript==
// @name           patchForBug575196.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 575196 - Long scrolled Bookmarks menu scroll-up a line immediately when mouse move from menu to menu popup after open the menu popup
// @author         Alice0775
// @include        main
// @compatibility  60+
// @version        2018/10/04 23:00 60+
// @version        2018/09/27 10:30 fix  tab detach
// @version        2018/09/27 01:00 
// ==/UserScript==
"use strict";
var bug575196 = {
  DELAY: 400,

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

  timer: null,
  popupshowing: function(event) {
    this.setListener(event.target);
  },

  setListener: function(popup) {
    var scrollbox = document.getAnonymousElementByAttribute(popup, "class", "popup-internal-box");
    if (!scrollbox)
      return;

     if(typeof scrollbox._scrollButtonUp != "undefined") {
       scrollbox._scrollButtonUp.setAttribute("onmouseover", "timer = setTimeout(() => {_startScroll(-1);}, "+this.DELAY+")");
       scrollbox._scrollButtonUp.setAttribute("onmouseout", "if(timer){clearTimeout(timer);} _stopScroll();");
     }
     if(typeof scrollbox._scrollButtonDown != "undefined") {
       scrollbox._scrollButtonDown.setAttribute("onmouseover", "timer = setTimeout(() => {_startScroll(1);}, "+this.DELAY+")");
       scrollbox._scrollButtonDown.setAttribute("onmouseout", "if(timer) {clearTimeout(timer);} _stopScroll();");
     }
  },
}

bug575196.init();
