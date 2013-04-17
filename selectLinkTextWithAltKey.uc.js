// ==UserScript==
// @name           selectLinkTextWithAltKey.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    select Link Text With AltKey
// @include        main
// @compatibility  Firefox 2.0 ,3.0a7pre WinXP
// @author         Alice0775
// @version        2013/04/14 21:00 checking element using Ci.nsIImageLoadingContent instead of HTMLImageElement
// @version        2008/06/25 23:00 onclick属性のアンカーの場合にも対応
// @Note           altキーを用いてリンクテキストを選択した際に, 保存ダイアログが開くのを抑止する
// ==/UserScript==
// @version        2007/08/03 15:00
var selectLinkTextWithAltKey = {
  init: function(){
    gBrowser.mPanelContainer.addEventListener('click', this, true);
  },
  handleEvent: function(event){
   switch (event.type) {
      case "unload":
        gBrowser.mPanelContainer.removeEventListener('click', this, true);
        break;
      case "click":
        if (event.button == 0 && event.altKey && this.__getSelection()){
          if (!this.isAnchorElement(event))
            break;
          event.stopPropagation();
          event.preventDefault();
          break;
        }
    }
  },
  isAnchorElement: function(event){
    var target = event.originalTarget;
    while(target){
      if (target instanceof HTMLAnchorElement ||
             target instanceof Ci.nsIImageLoadingContent ||
             target instanceof HTMLAreaElement ||
             target instanceof HTMLLinkElement) {
         return target;
      }
      target = target.parentNode;
    }
    return target;
  },
  __getFocusedWindow: function(){
      var focusedWindow = document.commandDispatcher.focusedWindow;
      if (!focusedWindow || focusedWindow == window)
        return window._content;
      else
        return focusedWindow;
  },
  __getSelection: function(){
      var targetWindow = this.__getFocusedWindow();
      var sel = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow);
      return (sel && sel.toString() != '') ? sel : null;
  }

}
selectLinkTextWithAltKey.init();
window.addEventListener('unload', selectLinkTextWithAltKey, false);
