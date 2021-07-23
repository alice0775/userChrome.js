// ==UserScript==
// @name           patchForBug972259.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 972259 - User is forced to press back button twice to go back to previous page on some websites
// @include        main
// @compatibility  Firefox 78
// @author         Alice0775
// @version        2021/07/23 add fall back
// @version        2021/06/30 hide entry if sane url
// @version        2021/06/30 ignore abput:xxx
// @version        2021/06/29
// ==/UserScript==

{
  function patchForBug972259_init() {
    gBrowser.goBack = function(requireUserInteraction) {
      let sessionHistory = SessionStore.getSessionHistory(gBrowser.selectedTab);
      let index = sessionHistory.index;
    	let entry = sessionHistory.entries[index];
    	let uri = entry.url;
    	if (/^about:/.test(uri)) {
    	  this.selectedBrowser.goBack(requireUserInteraction);
    	  return;
    	}
    	for (let i = index - 1; i >= 0; i--) {
        let entry1  = sessionHistory.entries[i];
        if (uri != entry1.url) {
          gBrowser.webNavigation.gotoIndex(i);
          return;
        }
      }
      // fall back
      if (index - 1 >= 0)
        this.selectedBrowser.goBack(requireUserInteraction);
    };

    window.addEventListener("popupshown", remeveDuplicate, true);
    function remeveDuplicate(event) {
      let popup = event.target;
      if (popup.getAttribute("onpopupshowing") != "return FillHistoryMenu(event.target);")
        return;
      let sessionHistory = SessionStore.getSessionHistory(gBrowser.selectedTab);
      for (let i = 0; i < popup.children.length - 2; i++) {
        if (!popup.children[i].hasAttribute("index") ||
            !popup.children[i + 1].hasAttribute("index"))
          continue;
        let index2 = popup.children[i].getAttribute("index");
      	let entry2 = sessionHistory.entries[index2];
      	let uri2 = entry2.url;
      	if (/^about:/.test(uri2))
      	 continue;
        let index1 = popup.children[i + 1].getAttribute("index");
      	let entry1 = sessionHistory.entries[index1];
      	let uri1 = entry1.url;
      	if (/^about:/.test(uri1))
      	 continue;
      	if (uri2 == uri1) {
          popup.children[i + 1].style.setProperty("display", "none", "important");
        }
      }
    }
  }

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    patchForBug972259_init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
       patchForBug972259_init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
}