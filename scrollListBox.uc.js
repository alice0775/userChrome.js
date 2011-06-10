// ==UserScript==
// @name           scrollListBox.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    リストボックスをその場でホイールスクロール
// @note            (shift, alt, ctrl押下でonchangeイベント抑制)
// @include        main
// @compatibility  Firefox 2.0 WinXP
// @version        LastMod 2009/09/08 12:30 Select要素にフォーカスが無いときは何もしない
// @version        LastMod 2007/07/22 18:30
// ==/UserScript==
({
  // -- config --
  FOCUSEDONLY: true, //Select要素にフォーカスが [true]:ある時のみ,  false:マウスが乗っているとき
  // -- config --
  timer: null,
  init: function(){
    gBrowser.mPanelContainer.addEventListener('DOMMouseScroll', this, true);
  },

  uninit: function(){
    gBrowser.mPanelContainer.removeEventListener('DOMMouseScroll', this, true);
  },

  scrollListBox: function(event){
    if (!event.originalTarget.nodeName.match(/select/i))return;
    if (this.FOCUSEDONLY && document.commandDispatcher.focusedElement != event.originalTarget) return;
    event.preventDefault();
    event.stopPropagation();
    var elem = event.originalTarget;
    var index= elem.selectedIndex;
    if(event.detail>0){
      if(index < elem.length-1)
        elem.selectedIndex = index + 1;
    }else{
      if(index > 0)
        elem.selectedIndex = index - 1;
    }
    if (elem.selectedIndex == index)
      return;
    if(event.shiftKey || event.altKey || event.ctrlKey) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(function(){
      var HTMLEvents = document.createEvent("HTMLEvents");
      HTMLEvents.initEvent("change", true, true);
      elem.dispatchEvent(HTMLEvents);
    },800);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "DOMMouseScroll":
        this.scrollListBox(event);
      break;
      case "unload":
        this.uninit();
        break;
    }
  }
}).init();