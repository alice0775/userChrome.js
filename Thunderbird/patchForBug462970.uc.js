// ==UserScript==
// @name           patchForBug462970.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 462970 textarea, input tag disappears (vanishes) when copy & pasted on the border.を修正
// @include        main
// @include        chrome://messenger/content/messengercompose/messengercompose.xul
// @include        chrome://editor/content/editor.xul
// @compatibility  Firefox 3.0 3.3 3.6
// @author         Alice0775
// @version        2009/04/07 23:00 SeaMonkey2.1b composerに対応
// @version        2009/03/22 22:00 Thunderbird 3の作成ウインドウに対応
// @version        2009/03/18 15:00
// ==/UserScript==

var bug462970 = {
  get win() {
    delete this.win;
    if (location.href == "chrome://messenger/content/messengercompose/messengercompose.xul")
      return this.win = document.getElementById("content-frame");
    if (location.href == "chrome://editor/content/editor.xul")
      return this.win = document.getElementById("content-frame");
    else if ("gBrowser" in window)
      return this.win = gBrowser.mPanelContainer;
    return null;
  },

  init: function() {
    window.addEventListener("unload", this, false);
    if (!this.win)
      return;
    this.win.addEventListener("keydown", this, true);
    this.win.addEventListener("mouseup", this, true);
    this.win.addEventListener("mousedown", this, true);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    if (!this.win)
      return;
    this.win.removeEventListener("keydown", this, true);
    this.win.removeEventListener("mouseup", this, true);
    this.win.removeEventListener("mousedown", this, true);
  },

  handleEvent: function(event) {
    switch (event.type) {
      case 'mousedown':
        //designMode
        try {
          var doc = event.originalTarget.ownerDocument;
          if (Components.lookupMethod(doc, 'designMode').call(doc) != 'on')
            break;
        } catch (e) {
          break;
        }
        if (event.button == 2 && !(event.ctrlKey || event.altKey|| event.shiftKey) )
            event.stopPropagation();
        break;
      case 'mouseup':
      case 'keydown':
        if (!event.ctrlKey)
          return;
        var editableNode = this.isParentEditableNode(event.originalTarget);
        if (editableNode) {
          if (editableNode.parentNode)
            editableNode.parentNode.blur();
          editableNode.blur();
          editableNode.focus();
        }
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  isParentEditableNode : function(node) {
    while (node && node.parentNode) {
      try {
        node.QueryInterface(Components.interfaces.nsIDOMNSEditableElement);
        return node;
      } catch(e) {
      }
      node = node.parentNode;
    }
    return null;
  }
}

bug462970.init();
