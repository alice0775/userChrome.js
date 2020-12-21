// ==UserScript==
// @name           patchForBug575196.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 575196 - Long scrolled Bookmarks menu scroll-up a line immediately when mouse move from menu to menu popup after open the menu popup
// @author         Alice0775
// @include        main
// @compatibility  76+
// @compatibility  60+
// @version        2020/12/22 00:00 fix scroll
// @version        2020/04/27 00:00 fix Bug 1625630 - Rename popup-internal-box to menupopup-arrowscrollbox
// @version        2020/03/02 00:00 fix type
// @version        2019/10/22 13:00 fix undefined shadowRoot
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
    if (popup.localName != "menupopup" || !popup.hasAttribute("placespopup"))
      return;
    if (popup.shadowRoot == null)
      return;
    var scrollbox = popup.scrollBox; // popup.shadowRoot.querySelector(".popup-internal-box");

    if (!scrollbox)
      return;

     bug575196.timer = null;
     if(typeof scrollbox._scrollButtonUp != "undefined") {
       scrollbox._scrollButtonUp.setAttribute("onmouseover", "event.preventDefault();event.stopPropagation();bug575196.timer = setTimeout(() => {this.getRootNode().host._startScroll(-1);}, bug575196.DELAY);");
       scrollbox._scrollButtonUp.setAttribute("onmouseout", "if(bug575196.timer){clearTimeout(bug575196.timer);} this.getRootNode().host._stopScroll();");
     }

     if(typeof scrollbox._scrollButtonDown != "undefined") {
       scrollbox._scrollButtonDown.setAttribute("onmouseover", "event.preventDefault();event.stopPropagation();bug575196.timer = setTimeout(() => {this.getRootNode().host._startScroll(1);}, bug575196.DELAY);");
       scrollbox._scrollButtonDown.setAttribute("onmouseout", ";if(bug575196.timer){clearTimeout(bug575196.timer);} this.getRootNode().host._stopScroll();");
     }
  }
}
  bug575196.init();
