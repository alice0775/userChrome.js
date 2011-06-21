// ==UserScript==
// @name           patchForBug515979.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description     Bug 515979 -  The menu of the upper hierarchy is scrolled by a mouse wheel on sub-menu, and The select position of the menu slips off を回避
// @include        *
// @compatibility  Firefox 3.0 3.5 3.6 3.7a1pre
// @author         Alice0775
// @version        2011/06/12 menupopupの親がmenuでないときは何もしない2
// @version        2011/06/12 menupopupの親がmenuでないときは何もしない
// @version        2010/02/21 Bug 530504 -  Mouse wheel scrolling interferes with action popup in applications tab of preferences
// @version        2010/02/09
// @Note
// ==/UserScript==
var bug515979 = {

  init: function() {
    if ("patchForBug515979" in window)
      return;
    window.addEventListener("popupshowing", this, true);
    window.addEventListener("popuphiding", this, true);
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    window.removeEventListener("popupshowing", this, true);
    window.removeEventListener("popuphiding", this, true);
    window.removeEventListener("unload", this, false);
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case "popupshowing":
        this.popupshowing(aEvent);
        break;
      case "popuphiding":
        this.popuphiding(aEvent);
        break;
      case "DOMMouseScroll":
        this.DOMMouseScroll(aEvent);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  popupshowing: function(aEvent) {
    var target = aEvent.originalTarget;
    target.addEventListener("DOMMouseScroll", this, true);
  },

  popuphiding: function(aEvent) {
    var target = aEvent.originalTarget;
    target.removeEventListener("DOMMouseScroll", this, true);
  },

  DOMMouseScroll: function(aEvent) {
    var target = aEvent.originalTarget;
    //userChrome_js.debug("1 " + target.localName);
    while (target && !/^(?:menupopup|richlistbox|listbox)$/.test(target.localName)) {
      target = target.parentNode;
      //userChrome_js.debug("2 " + target.localName);
    }
    //userChrome_js.debug("3 " + target.parentNode.localName);
    if (target &&
        target != aEvent.target &&
        /^(?:menu)$/.test(target.parentNode.localName)) {
      aEvent.preventDefault();
      return;
    }
  }
}
bug515979.init();
