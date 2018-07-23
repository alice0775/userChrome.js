// ==UserScript==
// @name           ZZZ_tabContextMenu_combining_tabProtect_and_tabLock.uc.js
// @description    Tab context menu combining tabProtect and tabLock
// @include        main
// @version        2018/07/23
// @note           require tabLock_mod2.uc.js and tabProtect_mod2.uc.js
// ==/UserScript==
const tabLockProtect = {
  init: function(){
    if ("tabProtect" in window && "tabLock" in window) {
      let tabContext = gBrowser.tabContainer.contextMenu;
      let menuitem = document.createElement("menuitem");
      menuitem.id = "tabLockProtect";
      menuitem.setAttribute("label", "Tab Lock & Protect");
      menuitem.setAttribute("accesskey", "&");
      menuitem.setAttribute("oncommand","tabLockProtect.toggle(event);");
      tabContext.insertBefore(menuitem, document.getElementById("tabLock"));

      // hide individual menu
      document.getElementById("tabLock").style.setProperty("display", "none", "important");
      document.getElementById("tabProtect").style.setProperty("display", "none", "important");
    }
  },

  toggle: function(event) {
    let aTab = TabContextMenu.contextTab;
    if( gBrowser.isProtectTab(aTab) == gBrowser.isLockTab(aTab)) {
      gBrowser.lockTab(aTab);
      gBrowser.protectTab(aTab);
    } else if(gBrowser.isProtectTab(aTab)) {
      gBrowser.protectTab(aTab);
    } else {
      gBrowser.lockTab(aTab);
    }
  }
}
tabLockProtect.init();
