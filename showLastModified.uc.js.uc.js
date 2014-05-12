// ==UserScript==
// @name           showLastModified.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    文書の最終更新日を表示
// @include        main
// @compatibility  Firefox 24+
// @author         Alice0775
// @version        2014/05/12 15:00 error?
// @version        2014/05/12 09:30 use CustomizableUI to create toolbarbutton
// @version        2014/05/12 06:50 make working without CTR/S4E
// @version        2014/05/12 06:40 make movable toolbarbutton
// @version        2014/05/11 14:40 clean up
// @version        2014/05/11 14:30 use progress Listener instead of dom events
// @version        2014/05/11 12:30 removed unnecessary codes
// @version        2014/05/11 11:30
// @note           For Firefox29+, required CTR or S4E extention to display add-on bar
// ==/UserScript==
var showLastModified = {
  init: function(){
      try {
        CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
        id: 'showLastModifiedLabel',
        type: 'custom',
        defaultArea: CustomizableUI.AREA_NAVBAR,
        onBuild: function(aDocument) {
          var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
          var props = {
            id: 'showLastModifiedLabel',
            removable: 'true',
            overflows: true,
            class: "toolbarbutton-1 chromeclass-toolbar-additional",
            label: "",
            tooltiptext: "showLastModified",
          };
          for (var p in props) {
            toolbaritem.setAttribute(p, props[p]);
          }
          setTimeout(function(){this.onLocationChange({DOMWindow:content}, null, null);}.bind(showLastModified), 0);
          return toolbaritem;
        }
      });
    }catch(ee) {
    }

    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        #showLastModifiedLabel { \
          list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAH0lEQVQokWNgZGT8Ty5mYGRk/E8OGNU8qnnYayYXAwA2tdnr9ZQgYgAAAABJRU5ErkJggg=="); \
        } \
        #main-window:not([customizing]) #showLastModifiedLabel:not([cui-areatype="menu-panel"]) .toolbarbutton-icon { \
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

    gBrowser.addProgressListener(this);
    window.addEventListener("unload", this, false);
    setTimeout(function(){this.onLocationChange({DOMWindow:content}, null, null);}.bind(showLastModified), 250);
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
    if (document.getElementById("showLastModifiedLabel"))
      document.getElementById("showLastModifiedLabel").setAttribute("label", value);
  }
};

showLastModified.init();

