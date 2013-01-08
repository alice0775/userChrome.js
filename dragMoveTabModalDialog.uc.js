// ==UserScript==
// @name           dragMoveTabModalDialog
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    タブモーダルダイアログをマウスドラッグで移動できるようにする
// @include        main
// @compatibility  Firefox 4.0b9pre
// @author         Alice0775
// @version        2013/01/08 02:00 Bug 827546
// ==/UserScript==
// @version        2010/12/23 19:00 label, description 上は無視
// @version        2010/12/23 15:00
// @Note
var dragMoveTabModalDialog = {
  elem: null,
  x0: 0,
  y0: 0,
  mx0: 0,
  my0: 0,
  xspacer: null,
  yspacer: null,

  init : function() {
    window.addEventListener("unload", this, false);
    window.addEventListener("mousedown", this, true);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "resize":
        if (this.elem && this.xspacer && this.yspacer) {
          this.xspacer.style.maxWidth = "";
          this.xspacer.style.minWidth = "";
          this.yspacer.style.maxHeight = "";
          this.yspacer.style.minHeight = "";
          window.removeEventListener("resize", this, true);
        }
        break;
      case "mousemove":
        if (!this.elem) {
          this.removeEvent();
          break;
        }
        var dx = event.screenX - this.mx0;
        var dy = event.screenY - this.my0;
        var x = Math.min(Math.max(0, dx + this.x0), gBrowser.mPanelContainer.clientWidth - this.elem.boxObject.width-3);
        var y = Math.min(Math.max(0, dy + this.y0), gBrowser.mPanelContainer.clientHeight - this.elem.boxObject.height-3);
        this.xspacer.style.maxWidth = x + "px";
        this.xspacer.style.minWidth = x + "px";
        this.yspacer.style.maxHeight = y + "px";
        this.yspacer.style.minHeight = y + "px";
        window.addEventListener("resize", this, true);
        break;
      case "mousedown":
        if (event.button !=0)
          break;
        var elem = event.originalTarget;
        if (this.isParentEditableNode(elem))
          return;
        while(elem) {
          if (/label|description/.test(elem.localName))
            return;
          if (elem.className == "mainContainer")
            break;
          elem = elem.parentNode;
        }
        if (!elem) {
          this.removeEvent();
          break;
        }
        this.elem = elem;
        this.xspacer = this.elem.previousSibling;
        this.yspacer = this.elem.parentNode.previousSibling;
        this.x0 = elem.boxObject.x - gBrowser.mPanelContainer.boxObject.x;
        this.y0 = elem.boxObject.y - gBrowser.mPanelContainer.boxObject.y;
        this.mx0 = event.screenX;
        this.my0 = event.screenY;
        window.addEventListener("mousemove", this, true);
        window.addEventListener("click", this, true);
        window.addEventListener("mouseup", this, true);
        break;
      case "click":
      case "mouseup":
        this.removeEvent();
        break;
      case 'unload':
        window.removeEventListener("resize", this, true);
        window.removeEventListener("unload", this, false);
        window.removeEventListener("mousedown", this, true);
        this.removeEvent();
    }
  },

  removeEvent: function() {
    window.removeEventListener("mousemove", this, true);
    window.removeEventListener("click", this, true);
    window.removeEventListener("mouseup", this, true);
  },

  isParentEditableNode : function(node){
    try {
      if (Components.lookupMethod(node.ownerDocument, 'designMode').call(node.ownerDocument) == 'on')
        return node;
    } catch(e) {}
    while (node && node.parentNode) {
      try {
        if (!(node instanceof Ci.nsIDOMNSEditableElement))
          throw 0;
        node.QueryInterface(Ci.nsIDOMNSEditableElement);
        return node;
      }
      catch(e) {
      }
      node = node.parentNode;
    }
    return null;
  }
}
dragMoveTabModalDialog.init();
