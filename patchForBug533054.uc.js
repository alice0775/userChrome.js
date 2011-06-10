// ==UserScript==
// @name           patchForBug533054.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 533054 - Shift+Page Up and Shift+Page Down don't select in the view source window   Bug 309009 -  Shift+pageUp does not select a page of text prior to the cursor and shift+page down does not select page of text after the cursor
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 3.0 3.5 3.6 3.7
// @author         Alice0775
// @version        2009/12/05
// ==/UserScript==
var bug533054 = {

  NUMLINE: 10,

  init: function(){
    window.addEventListener('unload', this, false);
    window.addEventListener('keydown', this, false);
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.removeEventListener('keydown', this, false);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
      case 'keydown':
        if (!event.shiftKey || event.ctrlKey || event.altKey || event.metaKey)
          return;
        if (this.isParentEditableNode(event.originalTarget))
          return;
        //this.debug(event.keyCode);
        if (event.keyCode == KeyEvent.DOM_VK_PAGE_UP)
          this.key(event, KeyEvent.DOM_VK_UP);
        else if (event.keyCode == KeyEvent.DOM_VK_PAGE_DOWN)
          this.key(event, KeyEvent.DOM_VK_DOWN);
        break;
    }
  },

  key: function(event, code) {
    window.removeEventListener('keydown', this, false);
    for (var i = 0;i < this.NUMLINE; i++) {
      var e = document.createEvent("KeyboardEvent");
      e.initKeyEvent ("keypress", true, true, null,
                        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
                        code, 0)
      event.originalTarget.dispatchEvent(e);
    }
    window.addEventListener('keydown', this, false);
  },

  isParentEditableNode: function(node){
    //if (Components.lookupMethod(node.ownerDocument, 'designMode').call(node.ownerDocument) == 'on')
    //  return node;
    while (node && node.parentNode) {
      try {
        node.QueryInterface(Ci.nsIDOMNSEditableElement);
        return node;
      }
      catch(e) {
      }
      node = node.parentNode;
    }
    return null;
  },

  debug: function(aMsg){
    Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService)
      .logStringMessage(aMsg);
  }
}


bug533054.init();
