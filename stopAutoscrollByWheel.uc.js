// ==UserScript==
// @name           stopAutoscrollByWheel.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    オートスクロールをホイールの回転でも止まるようにBug 643770 - Auto scroll does not stop when mouse wheel is turned 
// @author         Alice0775
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 3.0, 3.1b3pre, 3.2a1pre 4.0
// @version        2009/04/22 24:00 viewSource, viewPartialSourceでも
// @version        2009/01/23 24:00 一回もautoscroll実行していない場合にエラーが出ていたのを修正
// @version        2009/01/23
// ==/UserScript==

var stopAutoscrollByWheel = {
  init: function(){
    window.addEventListener("unload", this, false);
    window.addEventListener("DOMMouseScroll", this, true);
  },
  uninit: function(){
    window.removeEventListener("unload", this, false);
    window.removeEventListener("DOMMouseScroll", this, true);
  },
  handleEvent: function(event){
    switch (event.type){
      case 'unload':
        this.uninit();
        break;
      case 'DOMMouseScroll':
        this.stop(event);
        break;
    }
  },
  stop : function(event){
    if (gBrowser &&
        "getBrowserForTab" in gBrowser &&
        !!gBrowser.getBrowserForTab(gBrowser.mCurrentTab)._autoScrollPopup &&
        gBrowser.getBrowserForTab(gBrowser.mCurrentTab)._autoScrollPopup.state == 'open'){
      event.stopPropagation();
      event.preventDefault();
      gBrowser.getBrowserForTab(gBrowser.mCurrentTab)._autoScrollPopup.hidePopup();
    } else if (document.getElementById("content") &&
               document.getElementById("content")._autoScrollPopup &&
               document.getElementById("content")._autoScrollPopup.state == 'open'){
      event.stopPropagation();
      event.preventDefault();
      document.getElementById("content")._autoScrollPopup.hidePopup();
    }
  }
}
stopAutoscrollByWheel.init();
