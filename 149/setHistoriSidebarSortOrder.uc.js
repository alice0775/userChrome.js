// ==UserScript==
// @name           setHistoriSidebarSortOrder.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Set Histori Sidebar SortOrder (patch for Bug 2008425)
// @include        chrome://browser/content/sidebar/sidebar-history.html
// @compatibility  Firefox 149
// @author         Alice0775
// @version        2026/03/09
// ==/UserScript==
(function () {
  const win = window.top;
  let sortOrder = Services.prefs.getStringPref('ucjs.HistoriSidebarSortOrder', "date");
  switch(sortOrder) {
    case "date":
      win.document.getElementById("sidebar-history-sort-by-date").doCommand();
      break;
    case "site":
      win.document.getElementById("sidebar-history-sort-by-site").doCommand();
      break;
    case "datesite":
      win.document.getElementById("sidebar-history-sort-by-date-and-site").doCommand();
      break;
    case "lastvisited":
      win.document.getElementById("sidebar-history-sort-by-last-visited").doCommand();
      break;
    default:
      win.document.getElementById("sidebar-history-sort-by-last-visited").doCommand();
  }

  window.addEventListener("unload", (e) => {
    const item = win.document.getElementById("sidebar-history-menu").querySelector("menuitem[checked]")
    switch(item.id) {
      case "sidebar-history-sort-by-date":
        sortOrder = "date";
        break;
      case "sidebar-history-sort-by-site":
        sortOrder = "site";
        break;
      case "sidebar-history-sort-by-date-and-site":
        sortOrder = "datesite";
        break;
      case "sidebar-history-sort-by-last-visited":
        sortOrder = "lastvisited";
        break;
      default:
        sortOrder = "date";
    }
    Services.prefs.setStringPref('ucjs.HistoriSidebarSortOrder', sortOrder);
  }, false);
})();
