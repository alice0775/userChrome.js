// ==UserScript==
// @name           ZZZ_tabContextMenu_combining_tabProtect_and_tabLock.uc.js
// @description    Tab context menu combining tabProtect and tabLock
// @include        main
// @version        2018/09/25 22:30 reduce cpu
// @version        2018/09/25 21:30 working with tab multi selection, add config hide individual menu
// @version        2018/07/23
// @note           require tabLock_mod2.uc.js and tabProtect_mod2.uc.js
// ==/UserScript==
const tabLockProtect = {
  // =config==
  HIDEINDIVIDUALMENU : false,  //個々のメニューを隠すかどうか
  
  init: function(){
    if ("tabProtect" in window && "tabLock" in window) {
      let tabContext = gBrowser.tabContainer.contextMenu;
      let menuitem = document.createElement("menuitem");
      menuitem.id = "tabLockProtect";
      menuitem.setAttribute("type", "checkbox");
      menuitem.setAttribute("label", "Tab Lock & Protect");
      menuitem.setAttribute("accesskey", "&");
      menuitem.setAttribute("oncommand","tabLockProtect.toggle(event);");
      this.menuitem = tabContext.insertBefore(menuitem, document.getElementById("tabLock"));
      tabContext.addEventListener('popupshowing', this, false);

      // hide individual menu
      if (this.HIDEINDIVIDUALMENU) {
        document.getElementById("tabLock").style.setProperty("display", "none", "important");
        document.getElementById("tabProtect").style.setProperty("display", "none", "important");
      }
    }
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "popupshowing":
        this.popupshowing(event);
        break;
    }
  },

  popupshowing: function(event) {
    var menuitem = this.menuitem;
    var aTab = TabContextMenu.contextTab;
    if( !aTab || aTab.localName !='tab'){
      menuitem.setAttribute('hidden',true);
      return;
    }
    menuitem.setAttribute('hidden',false);
    if(aTab.getAttribute('tabLock') && aTab.getAttribute('tabProtect')){
      menuitem.setAttribute('checked', true);
    }else{
      menuitem.setAttribute('checked', false);
    }
  },

  toggle: function(event) {
    let aTab = TabContextMenu.contextTab;
    if( gBrowser.isProtectTab(aTab) == gBrowser.isLockTab(aTab)) {
      tabLock.toggle(aTab);
      tabProtect.toggle(aTab);
    } else if(gBrowser.isProtectTab(aTab)) {
      gBrowser.protectTab(aTab, false);
      //fallback
      tabLock.toggle(aTab);
      tabProtect.toggle(aTab);
    } else {
      gBrowser.lockTab(aTab, false);
      //fallback
      tabLock.toggle(aTab);
      tabProtect.toggle(aTab);
    }
  }
}
tabLockProtect.init();
