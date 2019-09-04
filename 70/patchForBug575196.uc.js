// ==UserScript==
// @name           patchForBug575196.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 575196 - Long scrolled Bookmarks menu scroll-up a line immediately when mouse move from menu to menu popup after open the menu popup
// @author         Alice0775
// @include        main
// @compatibility  60+
// @version        2019/09/01 23:00 70+
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
    if (popup.localName != "menupopup" && !popup.hasAttribute("placespopup"))
      return;
    var scrollbox = popup.shadowRoot.querySelector(".popup-internal-box");
    if (!scrollbox)
      return;

     bug575196.scrollbox = scrollbox;
     if(typeof scrollbox._scrollButtonUp != "undefined") {
       scrollbox._scrollButtonUp.addEventListener("mouseover", this.onmouseover_scrollButtonUp, true);       scrollbox._scrollButtonUp.setAttribute("onmouseout", "if(bug575196.timer){clearTimeout(bug575196.timer);} bug575196.scrollbox._stopScroll();");

     }
     if(typeof scrollbox._scrollButtonDown != "undefined") {
       scrollbox._scrollButtonDown.addEventListener("mouseover", this.onmouseover_scrollButtonDown, true);
       scrollbox._scrollButtonDown.setAttribute("onmouseout", "if(bug575196.timer) {clearTimeout(bug575196.timer);} bug575196.scrollbox._stopScroll();");
     }
  },

  onmouseover_scrollButtonUp: function(event) {
    event.preventDefault();
    event.stopPropagation();
    bug575196.timer = setTimeout(() => {bug575196.scrollbox._startScroll(-1);}, bug575196.DELAY);
  },
  onmouseover_scrollButtonDown: function(event) {
    event.preventDefault();
    event.stopPropagation();
    bug575196.timer = setTimeout(() => {bug575196.scrollbox._startScroll(1);}, bug575196.DELAY);
  },
}
  bug575196.init();
