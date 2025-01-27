// ==UserScript==
// @name           revivalOldHistorySidebar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Restoration of the old history sidebar
// @include        main
// @include        chrome://browser/content/places/historySidebar.xhtml?revamped
// @compatibility  Firefox 136
// @author         Alice0775
// @version        2025/01/27 Fix startup and color
// @version        2024/12/22
// ==/UserScript==
if (location.href == "chrome://browser/content/places/historySidebar.xhtml?revamped") {
  let mwin = window.browsingContext.embedderWindowGlobal.browsingContext.window;
  let color = mwin.getComputedStyle(mwin.document.body).getPropertyValue("--sidebar-text-color");


  let ref = document.getElementById("sidebar-search-container");
  let box = ref.parentNode.insertBefore(document.createXULElement("hbox"), ref);
  let label = document.createXULElement("label");
  label.textContent = "History";
  label.style.setProperty("margin", "6px", "");
  label.style.setProperty("color", color, "");
  box.appendChild(label);

  box.appendChild(document.createXULElement("toolbarspring"));
  
  let btn = document.createXULElement("toolbarbutton");
  btn.setAttribute("tooltiptext", "Close Sidebar");
  btn.setAttribute("class", "tabbable close-icon");
  btn.style.setProperty("margin", "6px", "");
  btn.style.setProperty("color", color, "");

  let img = document.createXULElement("image");
  img.setAttribute("class", "toolbarbutton-icon");
  btn.appendChild(img);

  box.appendChild(btn);

  btn.addEventListener("command", (e) => {e.preventDefault();let view = e.target.getAttribute('view');mwin.SidebarController.toggle(view);});

  document.getElementById("sidebar-search-container").style.setProperty("color", color, "");
  document.getElementById("historyTree").style.setProperty("color", color, "important");

} else {

  function revivalOldHistorySidebar() {
    SidebarController._sidebars.set("viewHistorySidebar", {
      elementId: "sidebar-switcher-history",
      url: "chrome://browser/content/places/historySidebar.xhtml?revamped",
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
    let sidebar = document.getElementById("sidebar");
    if (sidebar.getAttribute("src") == "chrome://browser/content/sidebar/sidebar-history.html") {
      sidebar.setAttribute("src", "chrome://browser/content/places/historySidebar.xhtml?revamped");
    }
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
}