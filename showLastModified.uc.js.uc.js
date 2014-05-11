// ==UserScript==
// @name           showLastModified.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    文書の最終更新日を表示
// @include        main
// @compatibility  Firefox 24+
// @author         Alice0775
// @version        2014/05/12 06:40 make movable toolbarbutton
// @version        2014/05/11 14:40 clean up
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
    toolbarBtn.setAttribute("tooltiptext", "Last Modified");
    toolbarBtn.setAttribute("class", "toolbarbutton-1");
    toolbarBtn.setAttribute("removable", "true");
    var refItem= document.getElementById("ctraddon_addon-bar") ||
                 document.getElementById("status4evar-status-bar") ||
                 document.getElementById("addon-bar");
    this.initToolbar(toolbarBtn, toolbarBtn.id,  refItem.lastChild);

    this.onLocationChange(null, null, null);
    gBrowser.addProgressListener(this);
    window.addEventListener("unload", this, false);

    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        #showLastModifiedLabel { \
          list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAH0lEQVQokWNgZGT8Ty5mYGRk/E8OGNU8qnnYayYXAwA2tdnr9ZQgYgAAAABJRU5ErkJggg=="); \
        } \
        #main-window:not([customizing]) #showLastModifiedLabel .toolbarbutton-icon { \
          display:none !important; \
        } \
        \
        #showLastModifiedLabel:not([cui-areatype="menu-panel"]) .toolbarbutton-text { \
          display:-moz-box !important; \
        } \
        #showLastModifiedLabel[cui-areatype="menu-panel"] .toolbarbutton-text { \
          display:none !important; \
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

  initToolbar: function(elm, id, ref) {
    var toolbars = document.querySelectorAll("toolbar");
    Array.slice(toolbars).forEach(function(toolbar) {
      var currentset = toolbar.getAttribute("currentset").split(",");
      var i = currentset.indexOf(id);
      if (i < 0) 
        ref.parentNode.insertBefore(elm, ref);
      else if (i > currentset.length || !currentset[i + 1])
        ref.parentNode.appendChild(elm);
      else {
        ref = document.getElementById(currentset[i + 1]);
        ref.parentNode.insertBefore(elm, ref);
      }
    });
  },
    
  uninit: function() {
    gBrowser.removeProgressListener(this);
    window.removeEventListener("unload", this, false);
  },

  // nsIWebProgressListener
  QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
                                         "nsISupportsWeakReference"]),

  onLocationChange: function(aProgress, aRequest, aURI) {
    if (!!aProgress) {
      var domWin = aProgress.DOMWindow;
      var doc = domWin.document;
      if (domWin.location == "about:customizing") {
        this.showLabel("showLastModified");
        return;
      } else if (doc instanceof Components.interfaces.nsIDOMHTMLDocument &&
                 domWin.location.protocol != "about:") {
        var nLastModified = new Date(doc.lastModified);
        this.showLabel(nLastModified);
        return;
      }
    }
    this.showLabel(undefined);
  },

  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
    
  handleEvent: function(event) {
    switch(event.type) {
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
