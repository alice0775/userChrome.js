// ==UserScript==
// @name           patchForImageDocument.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    keep aspect ratio as much as possible
// @include        main
// @compatibility  Firefox 17+
// @author         Alice0775
// @version        2013/04/25
// @Note
// ==/UserScript==
var patchForImageDocument = {
  timer: null,

  handleEvent: function(event) {
    switch (event.type) {
      case "resize":
        this.onResize();
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", this, false);
    gBrowser.addTabsProgressListener(this.tabProgressListener);
    window.addEventListener("resize", this, true);
    
    var doc = content.document;
    if (!doc.mozSyntheticDocument)
      return;

    // xxx uc.js initial load
    if (this.timer)
      clearTimeout(this.timer);
    this.timer = setTimeout(function(doc){patchForImageDocument.adjustImageSize(doc);}, 0, doc);
  },

  uninit: function() {
    if (this.timer)
      clearTimeout(this.timer);
    window.removeEventListener("resize", this, true);
    gBrowser.removeTabsProgressListener(this.tabProgressListener);
    window.removeEventListener("unload", this, false);
  },

  tabProgressListener: {
    onLocationChange: function (aBrowser, aWebProgress, aRequest, aLocationURI, aFlags) {
      // Filter out location changes caused by anchor navigation
      // or history.push/pop/replaceState.
      if (aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT)
        return;
      // Filter out location changes in sub documents.
      if (aBrowser.contentWindow != aWebProgress.DOMWindow)
        return;

      var browser = aBrowser || gBrowser.selectedBrowser;
      var doc = browser.contentDocument;
      if (!doc.mozSyntheticDocument)
        return;

      // xxx wait completion of auto resize
      var that = patchForImageDocument;
      if (that.timer)
        clearTimeout(that.timer);
      that.timer = setTimeout(function(doc){that.adjustImageSize(doc);}, 0, doc);
    }
  },

  onResize: function(event) {
    var doc = content.document;
    if (!doc.mozSyntheticDocument)
      return;

    // xxx prevent surplus change
    if (this.timer)
      clearTimeout(this.timer);
    this.timer = setTimeout((function(doc){this.adjustImageSize(doc);}).bind(this), 250, doc);
  },

  adjustImageSize: function(doc) {
    if (!doc.imageIsResized)
      return;

    var win = doc.defaultView;
    var img = doc.body.firstChild;
    if (!img || !img.hasAttribute("width") || !img.hasAttribute("height"))
      return;

    var width = win.innerWidth;
    var height = win.innerHeight;
    var w = img.getAttribute("width");
    var h = img.getAttribute("height");

    //userChrome_js.debug("adjustImageSize: " + (width == w) + " " + (height == h));
    if (width == w) {
      img.removeAttribute("height");
      return;
    }
    if (height == h) {
      img.removeAttribute("width");
      return;
    }
  }

}
patchForImageDocument.init();
