// ==UserScript==
// @name           contextMenuImageRotate.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    imageを回転
// @include        main
// @compatibility  Firefox 9+
// @author         Alice0775
// @version        2012/12/08
// ==/UserScript==
var contextMenuImageRotate = {
  init: function() {
    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <menupopup id="contentAreaContextMenu"> \
          <menu id="contextMenuImageRotateMenu" \
                insertbefore="context-sep-copyimage" \
                label="Rotate Image" \
                onclick="if(event.button != 0) {contextMenuImageRotate.doRotate(gContextMenu.target, \'\');this.parentNode.hidePopup();}"> \
            <menupopup  id="contextMenuImageRotatePopup" \
                        oncommand="contextMenuImageRotate.onCommand(event);" \
                        onclick="if(event.button != 0) {contextMenuImageRotate.doRotate(gContextMenu.target, \'\');this.parentNode.hidePopup();}"> \
              <menuitem label="  0°" value="rotate(0deg)" /> \
              <menuitem label=" 90°" value="rotate(90deg)" /> \
              <menuitem label="180°" value="rotate(180deg)" /> \
              <menuitem label="270°" value="rotate(270deg)" /> \
              <menuitem label="Reset" value="" /> \
            </menupopup> \
          </menu> \
        </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, contextMenuImageRotate);
  },

  observe: function(){
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this, false);
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
    window.removeEventListener("unload", this, false);
  },

  onCommand: function(event) {
    this.doRotate(gContextMenu.target, event.target.value);
  },

  doRotate: function(target, value) {
    if (value !="") {
      target.style.setProperty("-moz-transform", value, "important");
      target.style.setProperty("transform", value, "important");
    } else {
      target.style.removeProperty("-moz-transform");
      target.style.removeProperty("transform");
    }
  },

  onPopupshowing: function(event) {
    var menu = document.getElementById("contextMenuImageRotateMenu");
    menu.hidden = !gContextMenu.onImage;
  },

  handleEvent: function(event) {
    switch(event.type) {
      case 'popupshowing':
        this.onPopupshowing(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }

};


contextMenuImageRotate.init();
