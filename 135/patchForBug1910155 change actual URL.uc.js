// ==UserScript==
// @name           patchForBug1910155.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround Bug 1910155 Clicking a link on a web page should always change the URL in the address bar, Bug 1754954 - Page url in address bar doesn't change when navigating to another page with history api
// @include        main
// @async          true
// @compatibility  Firefox 115+
// @author         Alice0775
// @version        2024/07/29 00:00  Bug 1199934 
// @version        2024/07/27 00:00 
// ==/UserScript==

var patchForBug1910155 = {
  init: async function() {
    // Listeners
    window.addEventListener("unload", this, false);
    gBrowser.addTabsProgressListener(this);

  },
  uninit: function() {
    window.removeEventListener("unload", this, false);
    gBrowser.removeTabsProgressListener(this);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit();
      break;
    }
  },

  onLocationChange: function(aBrowser, aWebProgress, aRequest, aLocationURI, aFlags) {
    // Filter out location changes in sub documents.
    if (!aWebProgress.isTopLevel)
      return;

    if (aBrowser != gBrowser.selectedBrowser)
      return;

    /*
    let isSameDocument = !!(aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT);
    if (false && isSameDocument)
      return;
    */

    if (document.activeElement.closest("#urlbar"))
      return
    
    if(gURLBar.getAttribute("pageproxystate") == "invalid"
       && gURLBar.hasAttribute("usertyping")) {
      gURLBar._setValue(aLocationURI.displaySpec, //gBrowser.selectedTab.linkedBrowser.currentURI.spec,
                        { allowTrim: true });
      gBrowser.userTypedValue = null;
      gURLBar.setPageProxyState("valid");
    }
  }
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBug1910155.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      patchForBug1910155.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
