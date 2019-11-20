// ==UserScript==
// @name           discardTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    discard tab
// @include        main
// @author         Alice0775
// @compatibility  69
// @version        2019/06/24 23:00 fix 69 wait for gBrowser initialized
// @version        2019/05/29 16:00 Bug 1519514 - Convert tab bindings
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2019/02/22 00:00 fix 67 Bug 675539 - Make tab discard functionality work on tab object directly
// @version        2018/12/03 10:30 workaround Bug 1511756
// @version        2018/09/27 10:30
// ==/UserScript==

var discardTab = {

  get tabContext() {
    return document.getElementById("tabContextMenu");
  },

  init: function(){
    this.tabContextMenu();
    this.tabContext.addEventListener('popupshowing', this, false);
    gBrowser.tabContainer.addEventListener('SSTabRestored', this, false);
    window.addEventListener('unload', this, false)
  },

  uninit: function(){
    this.tabContext.removeEventListener('popupshowing', this, false);
    gBrowser.tabContainer.removeEventListener('SSTabRestored', this, false);
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
      case "SSTabRestored":
        this.SSTabRestored(event);
        break;
    }
  },

  tabContextMenu: function(){
    //tab context menu
    var tabContext = this.tabContext;
    var menuitem = this.discardTabMenu
                 = tabContext.appendChild(
                        document.createXULElement("menuitem"));
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

  SSTabRestored: function(event) {
    let tab = event.target;
    if (this.aTabLabels[tab.linkedBrowser.currentURI.spec]) {
      tab.label = this.aTabLabels[tab.linkedBrowser.currentURI.spec];
      if (typeof this.aTabcount[tab.linkedBrowser.currentURI.spec] != "undefined") {
        this.aTabcount[tab.linkedBrowser.currentURI.spec]--;
        if (this.aTabcount[tab.linkedBrowser.currentURI.spec] == 0)
          delete this.aTabLabels[tab.linkedBrowser.currentURI.spec];
          delete this.aTabcount[tab.linkedBrowser.currentURI.spec];
      }
    }
  },

  discardTab: function(aTab) {
    if (typeof gBrowser.selectedTabs != "undefined") {
      this.discardSelectedTabs(this.getSelectedTabs(aTab));
    } else {
      this.discardSelectedTab(aTab);
    }
  },

  aTabLabels: [],
  aTabcount: [],
  discardSelectedTab(aTab) {
    if (!aTab.hasAttribute("pending") &&
        !aTab.hasAttribute("busy") &&
        !aTab.closing &&
        !aTab.selected) {
      this.aTabLabels[aTab.linkedBrowser.currentURI.spec] = aTab.label;
      if (typeof this.aTabcount[aTab.linkedBrowser.currentURI.spec] == "undefined") {
        this.aTabcount[aTab.linkedBrowser.currentURI.spec] = 0;
      }
      this.aTabcount[aTab.linkedBrowser.currentURI.spec]++;
      gBrowser.discardBrowser(aTab);
    }
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

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  discardTab.init();

} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      discardTab.init();

    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}

