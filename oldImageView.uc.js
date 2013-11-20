// ==UserScript==
// @name           oldImageView.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    oldImageView
// @include        main
// @compatibility  Firefox 11-
// @author         Alice0775
// @version        2012/03/16
// ==/UserScript==
var oldImageView = {
  init: function(){
    window.addEventListener('unload', this, false);
  	gBrowser.addProgressListener(this, Ci.nsIWebProgress.NOTIFY_LOCATION);
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
  	gBrowser.removeProgressListener(this);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
     }
  },

  QueryInterface: function(aIID) {
    if (aIID.equals(Ci.nsIWebProgressListener) ||
        aIID.equals(Ci.nsISupportsWeakReference) ||
        aIID.equals(Ci.nsISupports))
      return this;
    throw Components.results.NS_NOINTERFACE;
  },

  onLocationChange: function(aProgress, aRequest, aURI) {
    var doc = aProgress.DOMWindow.document;
    if (doc instanceof Ci.nsIImageDocument) {
      var linknode = doc.querySelector('link[href="resource://gre/res/TopLevelImageDocument.css"]');
      if (linknode) {
        linknode.parentNode.removeChild(linknode);
      }
    }
  },

  onStateChange: function(a, b, c, d) {},
  onProgressChange: function(a, b, c, d, e, f) {},
  onStatusChange: function(a, b, c, d) {},
  onSecurityChange: function(a, b, c) {}
}

oldImageView.init();
