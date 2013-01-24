// ==UserScript==
// @name           patchForBug832641.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 832641 - Menu items slow to paint/respond after peeking their sub-menu popups
// @author         Alice0775
// @include        main
// @compatibility  18+
// @version        2013/01/2w 12:00 Fixed Ctrl(Shift)+Click
// @version        2013/01/2w 10:30 Fixed unable to open popup and Personal Menu
// @version        2013/01/21 23:30 Ensure restore scroll
// @version        2013/01/20 19:30 Fixed garbage rectangle
// @version        2013/01/20 19:00
// ==/UserScript==
"use strict";
var bug832641 = {
  sspi: null,

  init: function(){
    window.addEventListener('unload', this, false);
    
    // popup scroll position forget after the style applied,
    // so save/restore the scroll position by manual
    window.addEventListener('popupshowing', this, true);
    window.addEventListener('popuphiding', this, true);
    
    /*
    // xxx Bug 633260 bookmark menu does not open 
    if (document.getElementById('bookmarksMenuPopup'))
      document.getElementById('bookmarksMenuPopup').addEventListener('command', this, false);
    if (document.getElementById('BMB_bookmarksPopup'))
      document.getElementById('BMB_bookmarksPopup').addEventListener('command', this, false);
    */
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    
    window.removeEventListener('popupshowing', this, true);
    window.removeEventListener('popuphiding', this, true);
    /*
    if (document.getElementById('bookmarksMenuPopup'))
      document.getElementById('bookmarksMenuPopup').removeEventListener('command', this, false);
    if (document.getElementById('BMB_bookmarksPopup'))
      document.getElementById('BMB_bookmarksPopup').removeEventListener('command', this, false);
    */
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'popuphiding':
        this.popuphiding(event);
        break;
      case 'scroll':
        this.scroll(event);
        break;
      /*
      case 'command': 
        if (document.getElementById('bookmarksMenuPopup'))
          document.getElementById('bookmarksMenuPopup').hidePopup();
        if (document.getElementById('BMB_bookmarksPopup'))
          document.getElementById('BMB_bookmarksPopup').hidePopup();
        break;
      */
      case 'unload':
        this.uninit();
    }
  },

  popupshowing: function(event) {
    if (event.target == event.originalTarget) {
      if (!event.target.hasAttribute("placespopup"))
        return;
      this.removeStyle(event.target);
      event.target.addEventListener('scroll', this, false);
      setTimeout((function(){this.restoreScrollPosition(event.target)}).bind(this), 0);
    }
  },

  popuphiding: function(event) {
    if (event.target == event.originalTarget) {
      if (!event.target.hasAttribute("placespopup"))
        return;
      event.target.removeEventListener('scroll', this, false);
      setTimeout((function(){this.setStyle(event.target)}).bind(this), 0);
    }
  },

  scrollbox: function(popup) {
   return popup._scrollbox ||
          document.getAnonymousElementByAttribute(popup, "class", "popup-internal-box");
  },

  setStyle: function(popup) {
    var scrollbox = this.scrollbox(popup);
    if (!scrollbox)
      return;
    scrollbox.style.setProperty("display", "none", "");
  },

  removeStyle: function(popup) {
    var scrollbox = this.scrollbox(popup);
    if (!scrollbox)
      return;
    scrollbox.style.removeProperty("display");
  },

  scroll: function(event) {
    this.saveScrollPosition(event.target);
  },

  restoreScrollPosition: function(popup) {
    var scrollbox = this.scrollbox(popup);
    if (!scrollbox)
      return;
    scrollbox.scrollPosition = popup.getAttribute("scrollPosition");
  },

  saveScrollPosition: function(popup) {
    var scrollbox = this.scrollbox(popup);
    if (!scrollbox)
      return;
      
    popup.setAttribute("scrollPosition", scrollbox.scrollPosition);
  }
}

bug832641.init();
