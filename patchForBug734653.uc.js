// ==UserScript==
// @name           patchForBug734653.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Force scroll menupopup (workaround Bug734653)
// @include        *
// @compatibility  Firefox 4-12 (fixed in 13)
// @author         Alice0775
// @version        2012/03/13 20:00
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
    var arrowscrollbox = target.ownerDocument.getAnonymousElementByAttribute(target, "class", "popup-internal-box");
    //var scrollbox = document.getAnonymousElementByAttribute(arrowscrollbox, "class", "arrowscrollbox-scrollbox");   
    if (target.ownerDocument.defaultView.top != window)
      arrowscrollbox = arrowscrollbox.wrappedJSObject;
    
    if (!arrowscrollbox || /return !element.hidden;/.test(arrowscrollbox._canScrollToElement.toString()))
      return;
    arrowscrollbox._canScrollToElement = function(element) {
      return !element.hidden;
    }
  }
}

patchForBug734653.init();
