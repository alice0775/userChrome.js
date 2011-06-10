// ==UserScript==
// @name           patchForBug541844.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 541844 - Clicking add-on icons which are next to the menubar (on autohide) hides menubar without opening the clicked add-onを修正
// @include        main
// @compatibility  Firefox 3.6 3.7a5pre
// @author         Alice0775
// @version        2010/04/09 22:00
// ==/UserScript==

var bug541844 = {

  get menutoolbar () {
    delete this.menutoolbar;
    return this.menutoolbar = document.getElementById("toolbar-menubar");
  },

  get menubar () {
    delete this.menubar;
    return this.menubar = document.getElementById("main-menubar");
  },

  init: function() {
    window.addEventListener('unload', this, false);
    this.menutoolbar.addEventListener('DOMMenuBarActive', this, true);
    this.menutoolbar.addEventListener('DOMMenuBarInactive', this, true);
    this.menutoolbar.mousemoved = false;
  },

  uninit: function() {
    window.removeEventListener('unload', this, false);
    this.menutoolbar.removeEventListener('DOMMenuBarActive', this, true);
    this.menutoolbar.removeEventListener('DOMMenuBarInactive', this, true);
    this.menutoolbar.removeEventListener('mousemove', this, true);
    window.removeEventListener('mousemove', this, true);
  },

  handleEvent: function(event) {
    if (!(this.menutoolbar.getAttribute("autohide") == "true")) {
      this.menutoolbar.removeEventListener('mousemove', this, true);
      window.removeEventListener('mousemove', this, true);
      return;
    }
    switch (event.type) {
      case 'mousemove':
        this.onmousemove(event);
        break;
      case 'DOMMenuBarActive':
        this.menutoolbar.mousemoved = false;
        this.menutoolbar.addEventListener('mousemove', this, true);
        break;
      case 'DOMMenuBarInactive':
        this.menutoolbar.removeEventListener('mousemove', this, true);
        if (this.menutoolbar.mousemoved) {
          event.stopPropagation();
          this.menutoolbar.mousemoved = false;
          window.addEventListener('mousemove', this, true);
        }
        break;
    }
  },

  onmousemove: function(event) {
    var elem = event.target;
    while (elem) {
      //window.userChrome_js.debug(elem.localName);
      if (elem == this.menubar) {
        return;
      };
      if (elem == this.menutoolbar.parentNode) {
        this.menutoolbar.mousemoved = true;
        return;
      }
      elem = elem.parentNode;
    }
    if (this.menutoolbar.mousemoved) {
      this.menutoolbar._setInactiveAsync();
      this.menutoolbar.mousemoved = false;
      window.removeEventListener('mousemove', this, true);
    }
  }
}


bug541844.init();
