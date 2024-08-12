// ==UserScript==
// @name           patchForBug972259.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 972259 - User is forced to press back button twice to go back to previous page on some websites
// @include        main
// @compatibility  Firefox 129
// @author         Alice0775
// @version        2024/08/13 fix undefined error
// @version        2024/08/08 Bug 1900381 - Remove inline event handlers from mainPopupSet
// @version        2022/01/11 hide unnecessary popup
// @version        2022/01/06 compare uri using decodeURIComponent(Bug 1748669) and null check
// @version        2021/07/23 add fall back
// @version        2021/06/30 hide entry if sane url
// @version        2021/06/30 ignore abput:xxx
// @version        2021/06/29
// ==/UserScript==

{
  function patchForBug972259_init() {
    gBrowser.goBack = function(requireUserInteraction) {
      if(requireUserInteraction) {
        this.selectedBrowser.goBack(requireUserInteraction);
        return;
      }
      let sessionHistory = gBrowser.selectedBrowser.browsingContext.sessionHistory;
      if (sessionHistory?.count) {
        let index = sessionHistory.index;
      	let entry = sessionHistory.getEntryAtIndex(index);
      	let uri = decodeURIComponent(gBrowser.selectedBrowser.currentURI.spec);
      	if (uri && /^about:/.test(uri)) {
      	  this.selectedBrowser.goBack(requireUserInteraction);
      	  return;
      	}
      	for (let i = index - 1; i >= 0; i--) {
          let entry2 = sessionHistory.getEntryAtIndex(i);
          let uri2 = decodeURIComponent(entry2.URI.spec);
          if (uri2 != "undefined" && uri != uri2) {
            gBrowser.gotoIndex(i);
            return;
          }
        }
        // fall back
        if (index - 1 >= 0) {
          this.selectedBrowser.goBack(requireUserInteraction);
          return;
        }
      } else {
        sessionHistory = SessionStore.getSessionHistory(
          gBrowser.selectedTab
        );
        let index = sessionHistory.index;
      	let entry = sessionHistory.entries[index];
      	let uri = decodeURIComponent(gBrowser.selectedBrowser.currentURI.spec);
      	if (uri && /^about:/.test(uri)) {
      	  this.selectedBrowser.goBack(requireUserInteraction);
      	  return;
      	}
      	for (let i = index - 1; i >= 0; i--) {
          let entry2 = sessionHistory.entries[i];
          let uri2 = decodeURIComponent(entry2.url);
          if (uri2 != "undefined" && uri != uri2) {
            gBrowser.gotoIndex(i);
            return;
          }
        }
        // fall back
        if (index - 1 >= 0) {
          this.selectedBrowser.goBack(requireUserInteraction);
          return;
        }
      }
    };

    window.addEventListener("popupshown", remeveDuplicate, true);
    function remeveDuplicate(event) {
      let popup = event.target;
      if (!(popup.id == "backForwardMenu" ||
         popup.parentNode?.id == "back-button" ||
         popup.parentNode?.id == "forward-button" ||
         popup.getAttribute("oncommand") == "gotoHistoryIndex(event); event.stopPropagation();"))
        return;
      for (let i = 0; i < popup.children.length - 2; i++) {
        if (!popup.children[i].hasAttribute("index") ||
            !popup.children[i + 1].hasAttribute("index"))
          continue;
      	let uri2 = decodeURIComponent(popup.children[i].getAttribute("uri"));
      	if (/^about:/.test(uri2))
      	 continue;
      	let uri1 = decodeURIComponent(popup.children[i + 1].getAttribute("uri"));
      	if (/^about:/.test(uri1))
      	 continue;
      	if (uri2 == "undefined" || uri2 == uri1) {
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