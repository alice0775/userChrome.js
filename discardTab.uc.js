// ==UserScript==
// @name           discardTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    discard tab
// @include        main
// @author         Alice0775
// @compatibility  67
// @version        2019/02/22 00:00 67 Bug 675539 - Make tab discard functionality work on tab object directly
// @version        2018/09/27 10:30
// ==/UserScript==

var discardTab = {

  init: function(){
    this.tabContextMenu();
    gBrowser.tabContainer.contextMenu.addEventListener('popupshowing', this, false);
    window.addEventListener('unload', this, false)
  },

  uninit: function(){
    gBrowser.tabContainer.contextMenu.removeEventListener('popupshowing', this, false);
    window.removeEventListener('unload', this, false)
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit(event);
        break;
      case "popupshowing":
        this.popupshowing(event);
        break;
    }
  },

  tabContextMenu: function(){
    //tab context menu
    var tabContext = gBrowser.tabContainer.contextMenu;
    var menuitem = this.discardTabMenu
                 = tabContext.appendChild(
                        document.createElement("menuitem"));
    menuitem.id = "discardTab";
    if (Services.appinfo.version.split(".")[0] >= 63)
      menuitem.setAttribute("label", "Discard Tab(s)");
    else
      menuitem.setAttribute("label", "Discard Tab");
    menuitem.setAttribute("accesskey", "D");
    menuitem.setAttribute("oncommand","discardTab.discardTab(TabContextMenu.contextTab);");
    tabContext.addEventListener('popupshowing', this, false);
  },

  popupshowing: function(event) {
    if (typeof gBrowser.selectedTabs != "undefined") {
      let tabs = this.getSelectedTabs(TabContextMenu.contextTab);
      if (tabs.length == 1) {
        this.discardTabMenu.disabled = tabs[0].selected;
      } else {
        this.discardTabMenu.disabled = this.getSelectedTabs(TabContextMenu.contextTab) < 1;
      }
    } else {
      this.discardTabMenu.disabled = TabContextMenu.contextTab.selected;
    }
  },

  discardTab: function(aTab){
    if (typeof gBrowser.selectedTabs != "undefined") {
      this.discardSelectedTabs(this.getSelectedTabs(aTab));
    } else {
      this.discardSelectedTab(aTab);
    }
  },

  discardSelectedTab(aTab) {
    if (!aTab.hasAttribute("pending") &&
        !aTab.hasAttribute("busy") &&
        !aTab.closing &&
        !aTab.selectedTab)
      gBrowser.discardBrowser(aTab);
  },

  discardSelectedTabs: function(tabs) {
    if (tabs.length < 1)
      return;
    for (let tab of tabs) {
        this.discardSelectedTab(tab);
    }
  },

  getSelectedTabs: function(aTab){
    let contextTab = aTab;
    let selectedTabs = [contextTab];
    if (gBrowser.selectedTabs.indexOf(contextTab) < 0)
      return selectedTabs;

    for (let tab of gBrowser.selectedTabs) {
      if (contextTab != tab)
        selectedTabs.push(tab);
    }
    return selectedTabs;
  }
}


discardTab.init();
