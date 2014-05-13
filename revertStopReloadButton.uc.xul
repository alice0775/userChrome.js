// ==UserScript==
// @name           revertStopReloadButton.uc.js
// @namespace      http://blogs.yahoo.co.jp/alice0775 
// @description    Revert Stop Reload Button
// @include        main
// @compatibility  Firefox 29+
// @author         Alice0775
// @version        2015/05/13 07:35 fix darktheme
// @version        2015/05/13 07:30 darktheme
// @version        2015/05/12 23:30 Remove unnecessary listener
// @version        2015/05/12 08:30 Working on Firefox29+
// @note           not support combined Stop Reload Button / large icons
// ==/UserScript==
var revertStopReloadButton = {
  // -- config --
  HIDE_URLBAR_STOP_RELOAD_BUTTON: true,
  REDUCE_PADDING: true,
  // -- config --

  init: function() {
    Components.utils.import("resource:///modules/CustomizableUI.jsm");
    CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
      id: 'reload-button',
      type: 'custom',
      defaultArea: CustomizableUI.AREA_NAVBAR,
      onBuild: function(aDocument) {
        var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
        var props = {
          id: "reload-button",
          class: "toolbarbutton-1 chromeclass-toolbar-additional",
          label: "Reload",
          removable: "true",
          command: "Browser:ReloadOrDuplicate",
          onclick: "checkForMiddleClick(this, event);",
          tooltiptext: "Reload current page",
          oncommand: "BrowserReloadOrDuplicate(event)"
        };
        for (var p in props) {
          toolbaritem.setAttribute(p, props[p]);
        }
        
        return toolbaritem;
      }
    });
    CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
      id: 'stop-button',
      type: 'custom',
      defaultArea: CustomizableUI.AREA_NAVBAR,
      onBuild: function(aDocument) {
        var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
        var props = {
          id: "stop-button",
          class: "toolbarbutton-1 chromeclass-toolbar-additional",
          label: "Stop",
          removable: "true",
          command: "Browser:Stop",
          tooltiptext: "Stop loading this page",
          oncommand: "BrowserStop();"
        };
        for (var p in props) {
          toolbaritem.setAttribute(p, props[p]);
        }
        
        return toolbaritem;
      }
    });

    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        #reload-button { \
          list-style-image: url("chrome://browser/skin/Toolbar.png"); \
          -moz-image-region: rect(0px, 90px, 18px, 72px); \
        } \
         \
        #reload-button:not(:-moz-any(:not([cui-areatype="toolbar"]), [overflowedItem=true])):-moz-lwtheme-brighttext { \
          list-style-image: url("chrome://browser/skin/Toolbar-inverted.png"); \
          -moz-image-region: rect(0px, 90px, 18px, 72px); \
        } \
         \
        #stop-button { \
          list-style-image: url("chrome://browser/skin/Toolbar.png"); \
          -moz-image-region: rect(0px, 108px, 18px, 90px); \
        } \
         \
        #stop-button:not(:-moz-any(:not([cui-areatype="toolbar"]), [overflowedItem=true])):-moz-lwtheme-brighttext { \
          list-style-image: url("chrome://browser/skin/Toolbar-inverted.png"); \
          -moz-image-region: rect(0px, 108px, 18px, 90px); \
        } \
         \
        #nav-bar #reload-button[reduce_padding] .toolbarbutton-icon, \
        #nav-bar #stop-button[reduce_padding] .toolbarbutton-icon { \
          padding-left:  3px; \
          padding-right: 3px; \
        } \
         \
        #urlbar[hide_urlbar_stop_reload_button] #urlbar-reload-button, \
        #urlbar[hide_urlbar_stop_reload_button] #urlbar-stop-button { \
          display: none; \
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

    if (this.HIDE_URLBAR_STOP_RELOAD_BUTTON) {
      document.getElementById("urlbar").setAttribute("hide_urlbar_stop_reload_button", true);
    }

    if (this.REDUCE_PADDING) {
      document.getElementById("reload-button").setAttribute("reduce_padding", true);
      document.getElementById("stop-button").setAttribute("reduce_padding", true);
    }
  }
};

revertStopReloadButton.init();
