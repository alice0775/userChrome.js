// ==UserScript==
// @name           zzzz-scrollSelectedTabInVisible.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Tree Style Tabにおいて選択タブが見えるようにスクロール
// @include        main
// @compatibility  Firefox 2.0.0.* ,3.0.*, 3.1.*, 3.1.* dao's build
// @author         Alice0775
// @version        2008/11/21 22:00
// ==/UserScript==
(function(){
  if('TM_init' in window) return;

//ここからは, 現在のタブがいつも見えるようにスクロールさせる
  window.addEventListener("resize", ensureVisible, false);
  gBrowser.tabContainer.addEventListener('TabSelect', ensureVisible, false);

  function ensureVisible(){
    var aTab = gBrowser.selectedTab;
    ensureVisibleElement(aTab);
  }
  function ensureVisibleElement(aTab){
    try{
      var mShell = Components.classes["@mozilla.org/inspector/flasher;1"]
               .createInstance(Components.interfaces.inIFlasher);
      mShell.scrollElementIntoView(aTab);
    }catch(e){}
  }
})();