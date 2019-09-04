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
if (Services.appinfo.version.substr(0,2) >= "61")
  bug575196.init();


var bug575196_fx60 = {
  DELAY: 400,

  init: function(){
    window.addEventListener('unload', this, false);
    window.addEventListener('popupshowing', this, true);
    window.addEventListener('popuphidden', this, true);
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.removeEventListener('popupshowing', this, true);
    window.removeEventListener('popuphidden', this, true);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'popuphidden':
        this.popuphide(event);
        break;
      case 'mouseover':
        this.mouseover(event);
        break;
      case 'mouseout':
        this.mouseout(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  timer: null,
  popupshowing: function(event) {
    this.over = null;
    this.setListener(event.target);
  },

  popuphide: function(event) {
    this.over = null;
    if (this.timer)
      clearTimeout(this.timer);
    if (this.rtime)
      clearInterval(this.rtime);
    this.removeListener(event.target);
  },

  setListener: function(popup) {
    var scrollbox = popup._scrollbox ||
                    document.getAnonymousElementByAttribute(popup, "class", "popup-internal-box");
    if (!scrollbox)
      return;
    if(typeof scrollbox._scrollButtonUp != "undefined") {
      scrollbox._scrollButtonUp.removeAttribute("oncommand");
      scrollbox._scrollButtonUp.addEventListener('mouseover', this, true);
      scrollbox._scrollButtonUp.addEventListener('mouseout', this, true);
    }
    
    if(typeof scrollbox._scrollButtonDown != "undefined") {
      scrollbox._scrollButtonDown.removeAttribute("oncommand");
      scrollbox._scrollButtonDown.addEventListener('mouseover', this, true);
      scrollbox._scrollButtonDown.addEventListener('mouseout', this, true);
    }
  },

  removeListener: function(popup) {
    var scrollbox = popup._scrollbox ||
                    document.getAnonymousElementByAttribute(popup, "class", "popup-internal-box");
    if (!scrollbox)
      return;
    if(typeof scrollbox._scrollButtonUp != "undefined")
      scrollbox._scrollButtonUp.setAttribute("repeat", "hover");
    if(typeof scrollbox._scrollButtonDown != "undefined")
      scrollbox._scrollButtonDown.setAttribute("repeat", "hover");

    if(typeof scrollbox._scrollButtonUp != "undefined") {
      scrollbox._scrollButtonUp.removeEventListener('mouseover', this, true);
      scrollbox._scrollButtonUp.removeEventListener('mouseout', this, true);
    }
    
    if(typeof scrollbox._scrollButtonDown != "undefined") {
      scrollbox._scrollButtonDown.removeEventListener('mouseover', this, true);
      scrollbox._scrollButtonDown.removeEventListener('mouseout', this, true);
    }
  },

  over: null,
  mouseover: function(event) {
    if (!this.over) {
      this.over = true;
      event.preventDefault();
      event.stopPropagation();
      event.target.removeAttribute("repeat");

      if (this.timer)
        clearTimeout(this.timer);
      this.timer = setTimeout(function(self, event, repeatbtn){
        self.reenable(event, repeatbtn);
      }, this.DELAY, this, event, event.target);
    }
  },

  mouseout: function(event) {
    if (this.timer)
      clearTimeout(this.timer);
    this.over = null;
    if (this.rtime)
      clearInterval(this.rtime);
  },

  rtimer: null,
  reenable: function(event, repeatbtn) {
    repeatbtn.setAttribute("repeat", "hover");
    if (this.rtime)
      clearInterval(this.rtime);
    this.rtime = setInterval(function(event, repeatbtn){repeatbtn._autorepeatbuttonScroll(event);}, 50, event, repeatbtn.parentNode);
  }
}
if (Services.appinfo.version.substr(0,2) == "60")
  bug575196_fx60.init();
