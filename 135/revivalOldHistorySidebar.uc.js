// ==UserScript==
// @name           revivalOldHistorySidebar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Restoration of the old history sidebar
// @include        main
// @compatibility  Firefox 135
// @author         Alice0775
// @version        2024/12/22
// ==/UserScript==
function revivalOldHistorySidebar() {
  SidebarController._sidebars.set("viewHistorySidebar", {
    elementId: "sidebar-switcher-history",
    url: "chrome://browser/content/places/historySidebar.xhtml",
    menuId: "menu_historySidebar",
    triggerButtonId: "appMenuViewHistorySidebar",
    keyId: "key_gotoHistory",
    menuL10nId: "menu-view-history-button",
    revampL10nId: "sidebar-menu-history-label",
    iconUrl: "chrome://browser/skin/history.svg",
    contextMenuId: undefined,
    gleanEvent: Glean.history.sidebarToggle,
    gleanClickEvent: Glean.sidebar.historyIconClick,
  });
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  revivalOldHistorySidebar();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      revivalOldHistorySidebar();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
