// ==UserScript==
// @name           patchForBug685470.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 685470 - Bookmarks tooltip should not pop up when I click the bookmark.( not only bookmarks but also links in contents )
// @include        main
// @compatibility  Firefox 7.0+
// @author         Alice0775
// @version        2012/08/12 22:30 Bug 761723 implement toString of function objects by saving source
// ==/UserScript==
// @version        2011/10/30 formfox?
// @version        2011/10/30 due to Bug 658001 - need to clear mouse capture if the capturing frame is inside a hidden deck panel or hidden tab
// @version        2011/09/17
// @version        2011/09/09
// @version        2011/08/30
// @Note
var bug685470 = {
  
  noTooltip : false,

  get tipNode() {
    delete this.tipNode;
    return this.tipNode = document.getElementById("aHTMLTooltip");
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "mousedown":
        this.browserOnMousedown(event);
        break;
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
    window.addEventListener("mousedown", this, true);
    window.addEventListener("click", this, true);
    setTimeout(function(self) {self.delayedStartup();}, 1000, this);
  },

  uninit: function() {
    window.removeEventListener("click", this, true);
    window.removeEventListener("mousedown", this, true);
    window.removeEventListener("unload", this, false);
    
  },

  delayedStartup: function() {
    if ("__linkformfox__FillInHTMLTooltip" in window &&
        !/bug685470/.test(window.__linkformfox__FillInHTMLTooltip.toString())) {
      var func = window.__linkformfox__FillInHTMLTooltip.toString();
        func = func.replace(
        /{/,
        <><![CDATA[
        $&
        if ("bug685470" in window && bug685470.noTooltip) {
          return false;
        }
        ]]></>
      );
      window.__linkformfox__FillInHTMLTooltip = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*/, '').replace(/^{/, '').replace(/}$/, '')
      );
    }
    if ("FillInHTMLTooltip" in window && !/bug685470/.test(window.FillInHTMLTooltip.toString())) {
      var func = window.FillInHTMLTooltip.toString();
        func = func.replace(
        /{/,
        <><![CDATA[
        $&
        if ("bug685470" in window && bug685470.noTooltip) {
          return false;
        }
        ]]></>
      );
      window.FillInHTMLTooltip = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*/, '').replace(/^{/, '').replace(/}$/, '')
      );
    }
  },

  browserOnMousedown: function(event) {
    this.noTooltip = true;
    setTimeout(function(self) {
      self.noTooltip = false;
    }, 500, this);

    this.browserOnClick(event);
  },

  browserOnClick: function(event) {
    var elm = event.originalTarget;
    var doc = elm.ownerDocument;
    if (!doc)
      return;
    //userChrome_js.debug(doc instanceof HTMLDocument)
    if (doc instanceof HTMLDocument)
      return;
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
