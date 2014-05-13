// ==UserScript==
// @name           000-addToolbarInsideLocationBar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add a Toolbar inside LocationBar
// @include        main
// @compatibility  Firefox 29+
// @author         Alice0775
// @version        2014/05/13 23:30 fix style of |type=menu-button|
// @version        2014/05/13 21:30 add to view menu
// @version        2014/05/13 13:30 see note below
// @version        2014/05/13 10:30 cosmetic
// @version        2014/05/13 09:30 fix second window
// @version        2014/05/13
// @note           USAGE: View > Toolbars > Cutomize..., then, the "Toolbar Inside LocationBara"(red dotted) appeas at lefy side of nav bar. and you can drag and drop toolbarbutton on to the toolbar. The toolbarbutton will display inside locatonbar after exit customize mode. If you want to drag an item to the other toolbar, you should place the item on palette once, then move it to the other toolbar. i.e, this toolbar > palette > other toolbar
// @note           使い方: ツールバーのカスタマイズに入ると, "Toolbar Inside LocationBara"(赤点線)がナビゲーションバーの左端に表示されるので, そこにツールボタンをドラッグ&ドロップする。カスタマイズ終了後，ツールボタンがロケーションバーのに表示される。このツールバーから別のツールバーにボタンを移動する場合は，一旦パレット領域に置いてください。すなわち このツールバー > パレット > 別のツールバー
// ==/UserScript==
var addToolbarInsideLocationBar = {
  init: function() {
    const kNSXUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    Components.utils.import("resource:///modules/CustomizableUI.jsm");

    //create toolbar
    let toolbar = document.createElementNS(kNSXUL, "toolbar");
    toolbar.setAttribute("id", "ucjs-Locationbar-toolbar");
    toolbar.setAttribute("customizable", "true");
    toolbar.setAttribute("mode", "icons");
    toolbar.setAttribute("iconsize", "small");
    toolbar.setAttribute("hide", "true");
    toolbar.setAttribute("context", "toolbar-context-menu");
    toolbar.setAttribute("class", "toolbar-primary chromeclass-toolbar customization-target");
    toolbar.setAttribute("toolbarname", "UCJS Toolbar Inside LocationBar");
    toolbar.setAttribute("toolboxid", "navigator-toolbox");

    //register toolbar.id
    try {
      CustomizableUI.registerArea("ucjs-Locationbar-toolbar", {
        type: CustomizableUI.TYPE_TOOLBAR,
        defaultPlacements: ["feed-button"]
      });
    } catch(e) {}

    let ref = document.getElementById("urlbar-icons");
    ref.appendChild(toolbar);

    let style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
      #ucjs-Locationbar-toolbar { \
        -moz-appearance: none; \
        background-color: transparent; \
        background-image: none; \
        padding: 0px 2px; \
        border: none; \
      } \
      #ucjs-Locationbar-toolbar[hide] > toolbarbutton { \
        -moz-appearance: none; \
        padding: 0 0 !important; \
        visibility: collapsed; \
      } \
 \
      #main-window[customizing] #ucjs-Locationbar-toolbar { \
        min-width :30px; \
        border: 1px dotted rgba(255,0,0,0.6) ; \
      } \
 \
      /*default theme*/ \
      #ucjs-Locationbar-toolbar > toolbarbutton .toolbarbutton-icon{ \
        padding: 0 !important; \
      } \
 \
      #ucjs-Locationbar-toolbar .toolbarbutton-1:not([type=menu-button]), \
      #ucjs-Locationbar-toolbar .toolbarbutton-1 > .toolbarbutton-menubutton-button, \
      #ucjs-Locationbar-toolbar .toolbarbutton-1 > .toolbarbutton-menubutton-dropmarker { \
        padding: 0 !important; \
      } \
 \
      #ucjs-Locationbar-toolbar .toolbarbutton-1 > .toolbarbutton-menubutton-dropmarker > .dropmarker-icon { \
        padding: 5px 2px 4px 2px !important; \
      } \
      '.replace(/\s+/g, " ");

    let sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    window.addEventListener("beforecustomization", this, true);
    toolbar.removeAttribute("hide");
  },

  handleEvent: function(event) {
    let toolbar = document.getElementById("ucjs-Locationbar-toolbar");
    switch(event.type) {
      case "beforecustomization":
        window.addEventListener("aftercustomization", this, false);

        let ref = document.getElementById("nav-bar-customization-target");
        toolbar.setAttribute("tooltiptext", "Toolbar inside LocationBar");
        ref.parentNode.insertBefore(toolbar, ref);
        break;
      case "aftercustomization":
        window.removeEventListener("aftercustomization", this, false);

        ref = document.getElementById("urlbar-icons");
        ref.appendChild(toolbar);
        toolbar.removeAttribute("tooltiptext");
        toolbar.removeAttribute("hide");
        break;
    }
  },
};
addToolbarInsideLocationBar.init();
