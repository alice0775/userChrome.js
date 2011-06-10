// ==UserScript==
// @name           doNotSelectTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TMPをインストールしていない場合, 非アクティブをドラッグ開始した際,そのタブが前面になるのを阻止する。
// @include        main
// @compatibility  Firefox 3.0
// @author         Alice0775
// @version        2008/06/28 16:00 focus ring でないようにした
// @version        2008/06/23 02:00
// @Note
// ==/UserScript==
var dontSelectTab = {
  init: function(){
    gBrowser.tabContainer.addEventListener("mouseup", this, true);
    gBrowser.tabContainer.addEventListener("mousedown", this, true);
  },
  handleEvent: function(event){
   switch (event.type) {
      case "mousedown":
        if (event.button != 0) return;
        var tab = this.getTab(event);
        if (!tab)
          return;
        tab.style.MozUserFocus = 'ignore'; //focus ring でないように
        tab.clientTop; // just using this to flush style updates //focus ring でないように
        event.stopPropagation();
        break;
      case "mouseup":
        if (event.button != 0) return;
        var tab = this.getTab(event);
        if (tab){
          if ('MultipleTabService' in window && MultipleTabService.hasSelection())
            return;
          tab.style.MozUserFocus = 'ignore'; //focus ring でないように
          tab.clientTop; // just using this to flush style updates //focus ring でないように
          gBrowser.selectedTab = tab;
          tab.style.MozUserFocus = '';
        }
        break;
      case "unload":
        gBrowser.tabContainer.removeEventListener("mouseup", this, true);
        gBrowser.tabContainer.removeEventListener("mousedown", this, true);
        break;
    }
  },
  getTab: function(event){
    var aTarget = event.target;
    while (aTarget) {
      if (aTarget.className == 'tab-close-button' ||
         aTarget.className == 'toolbarbutton-icon')
        return null;
      if (aTarget.localName == 'tab')
        return aTarget;
      aTarget = aTarget.parentNode;
    }
    return null;
  }
}
if (!('TM_init' in window)) {
  dontSelectTab.init();
  window.addEventListener('unload', dontSelectTab, false);
}