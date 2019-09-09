// ==UserScript==
// @name           patchForBug1575485_wheelScrollOnScrollbarOfTree.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 1575485を回避する(水平スクロールは今のところ未対応)
// @include        *
// @compatibility  Firefox 67+
// @author         Alice0775
// @version        2019/09/09 22:20 fix event propagation and scrollbarbutton
// @version        2019/09/09 workaround Bug 1575485 - Unable scroll Sidebar/Library window with turning the mouse wheel on scrollbar
// ==/UserScript==
var patchForBug1575485 = {
  scrlW :20,
  e:null,

  init: function(){
    window.addEventListener("wheel", this, true);
    window.addEventListener("unload", this, false);
  },

  uninit: function(){
    window.removeEventListener("unload", this, false);
    window.removeEventListener("wheel", this, true);
  },

  get zoom(){
    if (!ZoomManager.useFullZoom)
      return 1;
    else
      return ZoomManager.zoom;
  },

  handleEvent: function (aEvent){
    switch (aEvent.type) {
      case "wheel":
        this.onMouseWheel(aEvent);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  onMouseWheel: function(event){
    if(/^(slider|thumb|scrollbarbutton)$/.test(event.originalTarget.localName)) {
      var scrollView = event.target;
      if (event.target.localName != "tree")
        return;
      event.stopPropagation();
      var target = event.originalTarget;
      if (target.localName == "scrollbarbutton")
        target = target.parentNode;
      if (target.orient == "vertical"){
        this._scrollBy(scrollView, 0, event.deltaY);
      } else if (target.orient == "horizontal"){
        this._scrollBy(scrollView, event.deltaY, 0);
      }
    }
  },

  _scrollBy: function(elm, x, y){
    //window.userChrome_js.debug(elm.getFirstVisibleRow());
    if (!!y) {
      elm.scrollToRow(elm.getFirstVisibleRow() + y);
    }
    if (!!x) {
      //window.userChrome_js.debug(elm.scrollLeft);
      if ("scrollBy" in elm) {
        elm.scrollBy(x, y);
      } else {
        elm.scrollLeft += x;
      }
    }

  }
}
patchForBug1575485.init();
