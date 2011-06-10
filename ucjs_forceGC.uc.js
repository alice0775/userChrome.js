// ==UserScript==
// @name           ucjs_forceGC.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    強制GC
// @include        main
// @compatibility  Firefox 3.0 more
// @author         Alice0775
// @version        LastMod 2010/04/12 03:00
// ==/UserScript==
var ucjs_forceGC = {
  handleEvent: function(event) {
    switch(event.type) {
      case 'scroll':
        window.removeEventListener("scroll", this, false);
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        break;
      case 'TabClose':
        this.onTabClose();
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", this, false);
    gBrowser.tabContainer.addEventListener("TabClose", this, false);
  },

  uninit: function() {
    if (this.timer)
      clearTimeout(this.timer);
    window.removeEventListener("unload", this, false);
    gBrowser.tabContainer.addEventListener("TabClose", this, false);
    window.removeEventListener("scroll", this, false);
  },

  timer: false,

  onTabClose: function() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    window.addEventListener("scroll", this, false);
    this.timer = setTimeout(function(self){
      userChrome_js.debug("forceGC");
      window.removeEventListener("scroll", self, false);
      Components.utils.forceGC();
/*
      window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindowUtils)
            .garbageCollect(Components.classes["@mozilla.org/cycle-collector-logger;1"]
            .createInstance(Components.interfaces.nsICycleCollectorListener))
*/
      window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindowUtils).garbageCollect();
    }, 5000, this);
  }
}

ucjs_forceGC.init();
