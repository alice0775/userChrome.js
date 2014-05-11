// ==UserScript==
// @name           showLastModified.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    文書の最終更新日を表示
// @include        main
// @compatibility  Firefox 24+
// @author         Alice0775
// @version        2014/05/11 14:30 use progress Listener instead of dom events
// @version        2014/05/11 12:30 removed unnecessary codes
// @version        2014/05/11 11:30
// @note           For Firefox29+, required CTR or S4E extention to display add-on bar
// ==/UserScript==
var showLastModified = {
  init: function(){
    var toolbarBtn = document.createElement("toolbarbutton");
    toolbarBtn.setAttribute("id", "showLastModifiedLabel");
    toolbarBtn.setAttribute("label", "showLastModified");
    toolbarBtn.setAttribute("class", "toolbarbutton-1");
    toolbarBtn.setAttribute("removable", "false");
    var refItem= document.getElementById("ctraddon_addon-bar") ||
                 document.getElementById("status4evar-status-bar") ||
                 document.getElementById("addon-bar");
    refItem.insertBefore(toolbarBtn, refItem.lastChild);

    gBrowser.addProgressListener(this);
    window.addEventListener("unload", this, false);

    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        #showLastModifiedLabel .toolbarbutton-icon { \
          display:none !important; \
        } \
        \
        #showLastModifiedLabel .toolbarbutton-text { \
          display:-moz-box !important; \
        } \
    ';
    style = style.replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };
  },

  uninit: function() {
    gBrowser.removeProgressListener(this);
    window.removeEventListener("unload", this, false);
  },

  // nsIWebProgressListener
  QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
                                         "nsISupportsWeakReference"]),

  onLocationChange: function(aProgress, aRequest, aURI) {
    var domWin = aProgress.DOMWindow;
    var doc = domWin.document;  
    if (doc instanceof Components.interfaces.nsIDOMHTMLDocument) {
      var nLastModified = new Date(doc.lastModified);
      this.showLabel(nLastModified);
      return;
    }
    this.showLabel(undefined);
  },

  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
    
  handleEvent: function(event) {
    switch(event.type) {
      case 'DOMContentLoaded':
        this.onDOMContentLoaded(event);
        break;
      case 'TabSelect':
        this.onTabSelect(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  showLabel: function(lastModified) {
    var value = "";
    if (lastModified != undefined)
      value = lastModified.toLocaleString();
    document.getElementById("showLastModifiedLabel").setAttribute("label", value);
  }
};


showLastModified.init();
