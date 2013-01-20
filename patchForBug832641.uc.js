// ==UserScript==
// @name           patchForBug832641.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 832641 - Menu items slow to paint/respond after peeking their sub-menu popups
// @author         Alice0775
// @include        main
// @compatibility  18+
// @version        2013/01/20 19:00
// ==/UserScript==
"use strict";
var bug832641 = {

  init: function(){
    // this style privent slowness
    var style = " \
      menu:not([_moz-menuactive]) menupopup .popup-internal-box\
      {\
        display:none;\
      }";
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

    window.addEventListener('unload', this, false);
    // popup scroll position forget after the style applied,
    // so save/restore the scroll position by manual
    window.addEventListener('popupshowing', this, true);
    window.addEventListener('popuphiding', this, true);
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.removeEventListener('popupshowing', this, true);
    window.removeEventListener('popuphiding', this, true);
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
      case 'unload':
        this.uninit();
        break;
    }
  },

  timer: null,
  popupshowing: function(event) {
    if (event.target == event.originalTarget) {
      
      event.target.addEventListener('scroll', this, false);
      this.restoreScrollPosition(event.target);
    }
  },

  popuphiding: function(event) {
    if (event.target == event.originalTarget) {
      event.target.removeEventListener('scroll', this, false);
    }
  },

  scroll: function(event) {
    this.saveScrollPosition(event.target);
  },

  restoreScrollPosition: function(popup) {
    var scrollbox = popup._scrollbox ||
                    document.getAnonymousElementByAttribute(popup, "class", "popup-internal-box");
    if (!scrollbox)
      return;

    scrollbox.scrollPosition = popup.getAttribute("scrollPosition");
  },

  saveScrollPosition: function(popup) {
    var scrollbox = popup._scrollbox ||
                    document.getAnonymousElementByAttribute(popup, "class", "popup-internal-box");
    if (!scrollbox)
      return;
      
    popup.setAttribute("scrollPosition", scrollbox.scrollPosition);
  }
}

bug832641.init();
