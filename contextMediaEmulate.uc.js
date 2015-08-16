// ==UserScript==
// @name           contextMediaEmulate.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Media Emulate
// @include        main
// @compatibility  Firefox 39+
// @author         Alice0775
// @version        2015/07/07
// @Note           Required Sub-Script/Overlay Loader v3.0.38mod( https://github.com/alice0775/userChrome.js/blob/master/userChrome.js )
// ==/UserScript==
var contextMediaEmulate = {
  init: function() {
    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <menupopup id="contentAreaContextMenu"> \
          <menu id="contextMediaEmulateMenu" \
                insertbefore="context-sep-copyimage" \
                label="Media Emulate" \
                onclick="if(event.button != 0) {contextMediaEmulate.doEmulate(\'\');this.parentNode.hidePopup();}"> \
            <menupopup  id="contextMediaEmulatePopup" \
                        oncommand="contextMediaEmulate.onCommand(event);" \
                        onclick="if(event.button != 0) {contextMediaEmulate.doEmulate(\'\');this.parentNode.hidePopup();}"> \
              <menuitem label="Screen" value="screen" /> \
              <menuitem label="Print"  value="print" /> \
              <menuitem label="Braille" value="braille" /> \
              <menuitem label="Embossed" value="embossed" /> \
              <menuitem label="Handheld" value="handheld" /> \
              <menuitem label="Projection" value="projection" /> \
              <menuitem label="Speech" value="speech" /> \
              <menuitem label="tty" value="tty" /> \
              <menuitem label="tv" value="tv" /> \
              <menuseparator /> \
              <menuitem label="Reset" value="" /> \
            </menupopup> \
          </menu> \
        </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, contextMediaEmulate);
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
    this.doEmulate(event.target.value);
  },

  doEmulate: function(value) {
   let markupDocumentViewer = gBrowser.markupDocumentViewer;
    if (value !="") {
      markupDocumentViewer.emulateMedium(value);
    } else {
      markupDocumentViewer.stopEmulatingMedium();
    }
  },

  onPopupshowing: function(event) {
    var menu = document.getElementById("contextMediaEmulateMenu");
    menu.hidden = (gContextMenu.isContentSelected ||
                   gContextMenu.onImage || gContextMenu.onCanvas ||
                   gContextMenu.onVideo || gContextMenu.onAudio ||
                   gContextMenu.onLink  || gContextMenu.onTextInput);
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


contextMediaEmulate.init();
