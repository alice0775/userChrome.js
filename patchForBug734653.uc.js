// ==UserScript==
// @name           patchForBug734653.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Cannot scroll by mouse wheel if hidden elements exist in menumopup (workaround Bug734653)
// @include        main
// @compatibility  Firefox 4-12 (maybe fixed in 13)
// @author         Alice0775
// @version        2012/03/11 00:00
// ==/UserScript==
var patchForBug734653 = {
  init: function() {
    window.addEventListener("popupshowing", this, true);
  },

  uninit: function() {
    window.removeEventListener("popupshowing", this, true);
    window.removeEventListener("unload", this, false);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "popupshowing":
        this.popupshowing(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  popupshowing: function(event) {
    var target = event.target;
    if (!/menupopup/.test(target.localName))
      return;
    var arrowscrollbox = document.getAnonymousElementByAttribute(target, "class", "popup-internal-box");
    //var scrollbox = document.getAnonymousElementByAttribute(arrowscrollbox, "class", "arrowscrollbox-scrollbox");
    if (/return !element.hidden;/.test(arrowscrollbox._canScrollToElement.toString()))
      return;
    arrowscrollbox._canScrollToElement = function(element) {
      return !element.hidden;
    }
  }
}

patchForBug734653.init();
