// ==UserScript==
// @name           selectPrevTabOnClickSelectedTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TMPをインストールしていない場合, アクティブをクリックした際, 直前に選択していたタブを前面に
// @include        main
// @compatibility  Firefox 3.0 3.1
// @author         Alice0775
// @version        2008/11/19 19:00
// @Note           ucjsNavigation.uc.jsが必要
// ==/UserScript==
var selectPrevTabOnClickSelectedTab = {
  //--config--
  THRESHOLD: 500, //ダブルクリックに反応しないようにする ミリ秒
  //--config--

  timer: null,

  init: function(){
    gBrowser.mTabContainer.addEventListener("mousedown", this, true);
    gBrowser.mTabContainer.addEventListener("click", this, true);
  },

  handleEvent: function(event){
   switch (event.type) {
      case "unload":
        gBrowser.mTabContainer.removeEventListener("mousedown", this, true);
        gBrowser.mTabContainer.removeEventListener("click", this, true);
        break;

      case "click":
        if (event.button != 0) return;
        var tab = this.getTab(event);
        if (tab){
          if (tab == this.mouseDownTab){
            if ((new Date()).getTime() - this.timer > this.THRESHOLD)
              ucjsNavigation.tabFocusManager.focusLastSelectedTab();
          }
        }
        break;

      case "mousedown":
        if (event.button != 0) return;
        this.timer = (new Date()).getTime();
        var tab = this.getTab(event);
        if (tab &&  gBrowser.selectedTab == tab){
          this.mouseDownTab = tab;
        } else {
          this.mouseDownTab = null;
        }
        break;

    }
  },

  getTab: function(event){
    var tab = aEvent.originalTarget;
    while(tab) {
      if (tab.localName == "tab")
        break;
      tab = tab.parentNode;
    }
    return tab;
  }
}

selectPrevTabOnClickSelectedTab.init();
window.addEventListener('unload', selectPrevTabOnClickSelectedTab, false);
