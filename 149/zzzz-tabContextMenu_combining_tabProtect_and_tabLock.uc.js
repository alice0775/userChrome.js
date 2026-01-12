// ==UserScript==
// @name           ZZZ_tabContextMenu_combining_tabProtect_and_tabLock.uc.js
// @description    Tab context menu combining tabProtect and tabLock
// @include        main
// @async          true
// @compatibility  Firefox 149
// @version        2026/01/13 00:00 compatibility 149 from 148
// @version        2026/01/07 Bug 2008041 - Make XUL disabled / checked attributes html-style boolean attributes.
// @version        2025/06/10 Workaround: retry initialization once after one second.
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2021/02/09 20:00 Rewrite `X.setAttribute("hidden", Y)` to `X.hidden = Y`
// @version        2019/09/11 16:00 workaround HIDEINDIVIDUALMENU: true
// @version        2019/05/29 16:00 Bug 1519514 - Convert tab bindings
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/09/25 22:30 reduce cpu
// @version        2018/09/25 21:30 working with tab multi selection, add config hide individual menu
// @version        2018/07/23
// @note           require tabLock_mod2.uc.js and tabProtect_mod2.uc.js
// ==/UserScript==
const tabLockProtect = {
  // =config==
  HIDEINDIVIDUALMENU : false,  //個々のメニューを隠すかどうか
  
  init: function(n){
    if ("tabProtect" in window && "tabLock" in window) {
      let tabContext = document.getElementById("tabContextMenu");
      let menuitem = document.createXULElement("menuitem");
      menuitem.id = "tabLockProtect";
      menuitem.setAttribute("type", "checkbox");
      menuitem.setAttribute("label", "Tab Lock & Protect");
      menuitem.setAttribute("accesskey", "&");
      menuitem.addEventListener("command", (event) => tabLockProtect.toggle(event));
      //menuitem.setAttribute("oncommand","tabLockProtect.toggle(event);");
      this.menuitem = tabContext.insertBefore(menuitem, document.getElementById("tabProtect"));
      tabContext.addEventListener('popupshowing', this, false);
    } else if (n > 0) {
      Services.console.logStringMessage("remaining retries for tabLockProtect: "+n)
      //Retry in 1 second
      setTimeout(function(){n--; tabLockProtect.init(n)}, 1000);
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
    // hide individual menu
    if (this.HIDEINDIVIDUALMENU) {
      document.getElementById("tabLock").style.setProperty("display", "none", "important");
      document.getElementById("tabProtect").style.setProperty("display", "none", "important");
    }
    var menuitem = this.menuitem;
    var aTab = TabContextMenu.contextTab;
    if( !aTab || aTab.localName !='tab'){
      menuitem.hidden = true;
      return;
    }
    menuitem.hidden = false;
    if(aTab.getAttribute('tabLock') && aTab.getAttribute('tabProtect')){
      menuitem.toggleAttribute('checked', true);
    }else{
      menuitem.removeAttribute('checked');
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

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  tabLockProtect.init(1);
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      tabLockProtect.init(1);
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
