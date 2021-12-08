// ==UserScript==
// @name           selectPrevTabOnClickSelectedTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    アクティブを長クリックした際, 直前に選択していたタブを選択
// @include        main
// @compatibility  Firefox 91
// @author         Alice0775
// @version        2021/12/05 18:00
// @version        2008/11/19 19:00
// @Note           ucjsNavigation.uc.jsが必要
// ==/UserScript==
var selectPrevTabOnClickSelectedTab = {
  //--config--
  THRESHOLD: 500, //ダブルクリックに反応しないようにする ミリ秒
  //--config--

  timer: null,

  init: function(){
    gBrowser.tabContainer.addEventListener("mousedown", this, true);
    gBrowser.tabContainer.addEventListener("click", this, true);
  },

  handleEvent: function(event){
   switch (event.type) {
      case "unload":
        gBrowser.tabContainer.removeEventListener("mousedown", this, true);
        gBrowser.tabContainer.removeEventListener("click", this, true);
        break;

      case "click":
        var tab = this.getTab(event);
        if (tab){
          if (tab == this.mouseDownTab){
            if ((new Date()).getTime() - this.timer > this.THRESHOLD)
              ucjsNavigation_tabFocusManager.focusPrevSelectedTab();
          }
        }
        break;

      case "mousedown":
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
    if (event.button != 0) return null;
    if (event.originalTarget.className == 'tab-close-button' ||
        event.originalTarget.className == 'tab-icon-overlay' ||
        event.originalTarget.className == 'tab-icon-protect' ||
        event.originalTarget.className == 'tab-icon-lock' ||
        event.originalTarget.className == 'tab-sharing-icon-overlay')
      return null;

    var tab = event.originalTarget;
    return tab.closest("tab");
  }
}

window.addEventListener('unload', selectPrevTabOnClickSelectedTab, false);
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  selectPrevTabOnClickSelectedTab.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      selectPrevTabOnClickSelectedTab.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
