// ==UserScript==
// @name           autoCopyToClipboard.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @include        main
// @author         Alice0775
// @version        2013/01/08 02:00 Bug 827546
// ==/UserScript==
// @version        2013/09/13 00:00 Bug 856437 Remove Components.lookupMethod
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2008/02/19 18:00
// @note           Ctrl+Shift+C または about:config の clipboard.autocopy を [false]で無効 true で 有効 トグル
// @note           designModeやtextarea等編集可能要素なら何もしない

var autoCopy = {
  // --config--
  YOURKEYINSPEED: 100,
  YOURCLICKSPEED: 500,
  // --config--
  PREF: "clipboard.autocopy",
  timer: null,
  menuitem: null,

  init: function() {

    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <keyset id="mainKeyset"> \
          <key id="key_toggleAutoCopy" \
               oncommand="autoCopy.toggle();" \
               key="C" \
               modifiers="accel, shift"/> \
        </keyset> \
        <menupopup id="menu_ToolsPopup"> \
              <menuitem insertbefore="menu_preferences" \
                        id="autoCopy" \
                        label="Auto Copy toggle" \
                        type="checkbox" \
                        checked="false" \
                        accesskey="A;" \
                        oncommand="autoCopy.toggle();"/> \
        </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, autoCopy);
  },

  observe: function(){
    window.addEventListener("unload", this, false);
    document.getElementById("menu_ToolsPopup").addEventListener("popupshowing", this, false);
    gBrowser.mPanelContainer.addEventListener('mouseup', this , true);
    gBrowser.mPanelContainer.addEventListener('keyup', this , true);
    this.menuitem = document.getElementById("autoCopy");
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    document.getElementById("menu_ToolsPopup").removeEventListener("popupshowing", this, false);
    gBrowser.mPanelContainer.removeEventListener('mouseup', this , true);
    gBrowser.mPanelContainer.removeEventListener('keyup', this , true);
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case 'unload':
        this.uninit();
        break;
      case 'popupshowing':
        this.popupshowing();
        break;
      case 'mouseup':
        this.mouseup(aEvent);
        break;
      case 'keyup':
        this.keyup(aEvent);
        break;
    }
  },

  popupshowing: function() {
    if (this.menuitem)
      this.menuitem.setAttribute('checked', gPrefService.getBoolPref(this.PREF));
  },

  toggle: function() {
    gPrefService.setBoolPref(this.PREF, !gPrefService.getBoolPref(this.PREF));
  },

  mouseup: function(aEvent) {
    if (this.timer)
      clearTimeout(this.timer);
    this.timer = setTimeout(function(aEvent, self) {
      self.copyToClipboard(aEvent);
    }, this.YOURCLICKSPEED, aEvent, this);
  },

  keyup: function(aEvent) {
    if (this.timer)
      clearTimeout(this.timer);
    this.timer = setTimeout(function(aEvent, self){
      self.copyToClipboard(aEvent);
    }, this.YOURKEYINSPEED, aEvent, this);
  },

  copyToClipboard: function(aEvent) {
  //ドキュメントとコンテントタイプ
    var doc = aEvent.target.ownerDocument;
    if(!doc
       || doc.contentType != 'text/plain'
       && doc.contentType != 'text/html'
       && doc.contentType != 'application/xml'
       && doc.contentType != 'application/xhtml+xml')
      return;
    // designModeなら何もしない
    if (doc.designMode == 'on')
      return;
    // textarea等編集可能要素なら何もしない
    if (this.isParentEditableNode(aEvent.target))
      return;
    // pref chrck
    if (!gPrefService.getBoolPref(this.PREF) )
      return;

    if (aEvent.type == "mouseup" && aEvent.button == 0) {
      goDoCommand('cmd_copy');
      return;
    }
    if (aEvent.type == "keyup" && aEvent.shiftKey) {
      switch (aEvent.keyCode) {
        case KeyEvent.DOM_VK_END:
        case KeyEvent.DOM_VK_HOME:
        case KeyEvent.DOM_VK_LEFT:
        case KeyEvent.DOM_VK_UP:
        case KeyEvent.DOM_VK_RIGHT:
        case KeyEvent.DOM_VK_DOWN:
          // do
          goDoCommand('cmd_copy');
      }
    }
  },

  isParentEditableNode: function(node) {
    while (node && node.parentNode) {
      try {
        if (!(node instanceof Ci.nsIDOMNSEditableElement))
          throw 0;
        node.QueryInterface(Ci.nsIDOMNSEditableElement);
        return node;
      }
      catch(e) {
      }
      if (node.isContentEditable || node.contentEditable == 'true')
        return node;
      node = node.parentNode;
    }
    return null;
  }
}
autoCopy.init();
