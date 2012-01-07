// ==UserScript==
// @name           patchForBug715838.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 715838 - Double-clicking title bar in small window sends click event to the maximized window on mouse position
// @include        main
// @compatibility  Firefox 4.0 - 12.0
// @author         Alice0775
// @version        2012/01/07
// @Note
// ==/UserScript==
var bug715838 = {
  timer: null,
  duration: 5000,

  handleEvent: function(event) {
    switch (event.type) {
      case "mousemove":
        this.onmousemove(event);
        break;
      case "resize":
        this.onresize(event);
        break;
      case "mouseup":
        this.onmouseup(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", this, false);
    window.addEventListener("resize", this, true);
  },

  uninit: function() {
    window.removeEventListener("resize", this, true);
    window.removeEventListener("unload", this, false);
  },

  onresize: function(event) {
    if(window.windowState  == window.STATE_MAXIMIZED) {
      window.addEventListener("mouseup", this, true);
      window.addEventListener("mousemove", this, true);
      if (this.timer)
        clearTimeout(this.timer);
      this.timer = setTimeout(function(self) {
        window.removeEventListener("mouseup", self, true);
        window.removeEventListener("mousemove", self, true);
      }, this.duration, this);
    }
  },

  onmouseup: function(event) {
    event.stopPropagation();
    window.removeEventListener("mouseup", this, true);
    window.removeEventListener("mousemove", this, true);
    if (this.timer)
      clearTimeout(this.timer);
  },

  onmousemove: function(event) {
    window.removeEventListener("mouseup", this, true);
    window.removeEventListener("mousemove", this, true);
    if (this.timer)
      clearTimeout(this.timer);
  }
}
bug715838.init();
