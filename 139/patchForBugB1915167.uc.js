// ==UserScript==
// @name          patchForBugB1915167.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1915167 - Dragging text/links into vertical tabs does not show drop indicator and makes them move up and down
// @include       main
// @async         true
// @compatibility Firefox 139+
// @author        alice0775
// @version       2025/05/30 00:00
// ==/UserScript==
// 
window.patchForBugB1915167 = {
  init: function() {
    var css =`@-moz-document url-prefix("chrome://browser/content/browser.xhtml") {
    .tab-drop-indicator {
      display: none !important;
    }
    `;
    var sss = Cc['@mozilla.org/content/style-sheet-service;1']
              .getService(Ci.nsIStyleSheetService);
    var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(css));
    if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);

    gBrowser.tabContainer.addEventListener("dragleave", 
             (event) => {gBrowser.tabContainer.clearDropIndicator(event);},
             true);

    gBrowser.tabContainer.on_drop_org = gBrowser.tabContainer.on_drop;
    gBrowser.tabContainer.on_drop = function on_dragover(event) {
      this.on_drop_org(event)
      this.clearDropIndicator();
    };

    gBrowser.tabContainer.on_dragover_org = gBrowser.tabContainer.on_dragover;
    gBrowser.tabContainer.on_dragover = function on_dragover(event) {
      this.on_dragover_org(event);

      //do nothing if tab is dragged
      let draggedTab = event.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0);
      if (draggedTab && document == draggedTab.ownerDocument) {
        return;
      }

      this.clearDropIndicator();
      let { target } = event;
      while (target) {
        if (!!(target?.tagName == "tab") || !!(target?.tagName == "tab-group")) {
          break;
        }
        target = target.parentNode;
      }
      if (!target)
        return;

      let { width, height } = target.getBoundingClientRect();
      if (event.screenY < target.screenY + height * 0.25) {
        //insert dragged link before the target
      } else if (event.screenY > target.screenY + height * 0.75) {
        //insert dragged link after target (i.e., before the next of target)
        target = target.nextSibling;
        if (!this.visibleTabs.includes(target)) {
          // append dragged link to tab container
          target =  null
        }
      } else {
        return;
      }

      if (target) {
        // insert the link before target
        target.style
            .setProperty("box-shadow","0px 2px 0px 0px #f00 inset, 0px -2px 0px 0px #f00","important");
        target.setAttribute("dragover", true);
      } else {
        // insert the link after target
        target = this.visibleTabs.at(-1);
        if (target) {
          target.style
               .setProperty("box-shadow","0px -2px 0px 0px #f00 inset, 0px 2px 0px 0px #f00","important");
          target.setAttribute("dragover", true);
        }
      }      
    };

    gBrowser.tabContainer.clearDropIndicator = function() {
      let elems = this.querySelectorAll("[dragover]");
      for (let i = 0, len = elems.length; i < len; i++){
        elems[i].style.removeProperty("box-shadow");
        elems[i].removeAttribute("dragover");
      }
    };
  }
}
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBugB1915167.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      patchForBugB1915167.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
