// ==UserScript==
// @name           patchForBug685470.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 685470 - Bookmarks tooltip should not pop up when I click the bookmark.( not only bookmarks but also links in contents )
// @include        main
// @compatibility  Firefox 7.0+
// @author         Alice0775
// @version        2011/09/09
// @version        2011/08/30
// @Note
// ==/UserScript==
var bug685470 = {

  handleEvent: function(event) {
    switch (event.type) {
      case "click":
        this.browserOnClick(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", this, false);
    window.addEventListener("click", this, false);
  },

  uninit: function() {
    window.removeEventListener("click", this, false);
    window.removeEventListener("unload", this, false);
  },

  browserOnClick: function(event) {
    var elm = event.originalTarget;
    var doc = elm.ownerDocument;
    var win = doc.defaultView;

    var tip = doc.evaluate(
                'ancestor-or-self::*[@tooltip or @tooltiptext or @title or @alt]',
                elm,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
    if (!tip)
      return;

    var evt = doc.createEvent("MouseEvents");
    evt.initMouseEvent("mouseout", true, true, win,
      0, 0, 0, 0, 0,
      false, false, false, false, 0, null);
    elm.dispatchEvent(evt);
  }
}
bug685470.init();
