// ==UserScript==
// @name           patchForBug972259.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 972259 - User is forced to press back button twice to go back to previous page on some websites
// @include        main
// @compatibility  Firefox 91
// @author         Alice0775
// @version        2022/01/06 compare uri using decodeURIComponent(Bug 1748669) and null check
// @version        2021/07/23 add fall back
// @version        2021/06/30 hide entry if sane url
// @version        2021/06/30 ignore abput:xxx
// @version        2021/06/29
// ==/UserScript==

{
  function patchForBug972259_init() {
    gBrowser.goBack = function(requireUserInteraction) {
Services.console.logStringMessage("gBrowser.goBack");
      document.querySelector("#back-button menupopup")
              .style.setProperty("display", "none","");
      FillHistoryMenu(document.querySelector("#back-button menupopup"))
Services.console.logStringMessage("FillHistoryMenu");
      setTimeout(()=>{
        document.querySelector("#back-button menupopup").hidePopup();
        document.querySelector("#back-button menupopup")
                .style.removeProperty("display");
      },1000);

      let index = parseInt(document.querySelector("#back-button menupopup menuitem[checked='true']").getAttribute("index"));
Services.console.logStringMessage("index " + index);
    	let uri = decodeURIComponent(gBrowser.selectedBrowser.currentURI.spec);
Services.console.logStringMessage("entry.url " + uri);
    	if (uri && /^about:/.test(uri)) {
    	  this.selectedBrowser.goBack(requireUserInteraction);
    	  return;
    	}
    	for (let i = index - 1; i >= 0; i--) {
        let uri2 = decodeURIComponent(document.querySelector("#back-button menupopup menuitem[index='"+i+"']")?.getAttribute("uri"));
Services.console.logStringMessage("i " + i + " " + uri2);
        if (uri2 != "undefined" && uri != uri2) {
          gBrowser.gotoIndex(i);
          return;
        }
      }
      // fall back
Services.console.logStringMessage("fall backed ");
      if (index - 1 >= 0)
        this.selectedBrowser.goBack(requireUserInteraction);
    };

    window.addEventListener("popupshown", remeveDuplicate, true);
    function remeveDuplicate(event) {
      let popup = event.target;
      if (popup.getAttribute("onpopupshowing") != "return FillHistoryMenu(event.target);")
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