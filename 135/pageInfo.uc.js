// ==UserScript==
// @name          pageInfo.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   add pageInfo menu in Context Menu
// @include       main
// @async          true
// @compatibility Firefox 89
// @author        alice0775
// @version       2021/05/09 23:00
// ==/UserScript==
function pageInfoContextMenu() {
  let menu = document.getElementById("menu_pageInfo");
  if (!menu)
    return;

  let ref = document.getElementById("context-inspect-a11y");
  menu = menu.cloneNode(true);
  menu.id = "context-" + menu.id;
  ref.parentNode.insertBefore(menu, ref);
}
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  pageInfoContextMenu();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      pageInfoContextMenu();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
