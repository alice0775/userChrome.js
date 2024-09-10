// ==UserScript==
// @name           rightMouseButtonDragSelectTabs.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Right Mouse Button Drag To Select Tabs
// @include        main
// @author         Alice0775
// @compatibility  128+
// @version        2024/08/14 16:00 Bug 1625622 - Use id and element selectors in arrowscrollbox shadow DOM
// @version        2020/09/24 18:00 fix selectedtab
// @version        2019/06/24 23:00 fux 69+ wait for gBrowser initialized
// @version        2019/02/01 23:30 fix right click on tabbar is missing for 65+
// @version        2018/10/26 00:30 fix for 65+ Bug 1499227 - Tab multiselect is triggered on mouse-up intead of mouse-down
// @version        2018/10/10 22:30 fix, scroll when mouse pointer over scrollbuttons
// @version        2018/10/10 12:30 fix, right click on inactive tab should not multiselect
// @version        2018/10/10 10:30
// @note           To enable multiselection tabs, set browser.tabs.multiselect = true in about:config
// ==/UserScript==

var rightMouseButtonDragSelectTabs = {

  startSelection: false,
  lastHoveredTab: false,
  lastX:null,
  lastY:null,

  init: function() {
    gBrowser.tabContainer.addEventListener('mousedown', this, true);
    window.addEventListener('unload', this, false)
  },

  uninit: function() {
    gBrowser.tabContainer.removeEventListener('mousedown', this, true);
    window.removeEventListener('mousemove', this, true);
    window.removeEventListener('mouseup', this, true);

    window.removeEventListener('unload', this, false)
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit(event);
        break;
      case "mousedown":
        this.mousedown(event);
        break;
      case "mousemove":
        this.mousemove(event);
        break;
      case "mouseup":
        this.mouseup(event);
        break;
    }
  },
  c:0,
  mousedown: function(event) {
    let tab = event.target.closest('tab');
    if (!tab)
      return;
    if (event.button == 2 && !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)) {
      if (Services.appinfo.version.split(".")[0] >= 65 && event.target.closest('tab')) {
        event.preventDefault();
      }
      this.startSelection = true;
      this.lastHoveredTab = null;
      this.lastX = event.screenX;
      this.lastY = event.screenY;
      window.addEventListener('mousemove', this, true);
      window.addEventListener('mouseup', this, true);
    }
  },

  mousemove: function(event) {
    if (!this.startSelection)
      return;
    if (Math.abs(this.lastX - event.screenX) < 15 && Math.abs(this.lastY - event.screenY) < 3)
      return;
    this.lastX = event.screenX;
    this.lastY = event.screenY;

    if (event.originalTarget.ownerDocument != document) {
      this.lastHoveredTab = null;
      return
    }
    let tab = event.originalTarget.closest('tab');
    if (!tab) {
      let arrowScrollbox = gBrowser.tabContainer.arrowScrollbox;
      if (arrowScrollbox.getAttribute("orient") == "hrizontal") {
        // scrollbutton
        //Services.console.logStringMessage(event.originalTarget.closest('[id="scrollbutton-up"]'))
        let scrollbutton = event.originalTarget.closest('[id="scrollbutton-up"]');
        if (scrollbutton) {
          if (scrollbutton != this.lastHoveredTab) {
            this.lastHoveredTab = scrollbutton;
            gBrowser.tabContainer.arrowScrollbox._startScroll(-1);
          }
          return;
        } else {
          scrollbutton = event.originalTarget.closest('[id="scrollbutton-down"]');
          if (scrollbutton) {
            if (scrollbutton != this.lastHoveredTab) {
              this.lastHoveredTab = scrollbutton;
              gBrowser.tabContainer.arrowScrollbox._startScroll(1);
            }
            return
          }
        }
      } else {
        // vertical
        let tolerance = 10; // in pixel
        let tabContainer = gBrowser.tabContainer;
        if ( event.screenY - tolerance >
               tabContainer.screenY + tabContainer.getBoundingClientRect().height ) {
          this.lastHoveredTab = null;
          gBrowser.tabContainer.arrowScrollbox._startScroll(1);
          return
        } else if ( event.screenY + tolerance < tabContainer.screenY) {
          this.lastHoveredTab = null;
          gBrowser.tabContainer.arrowScrollbox._startScroll(-1);
          return
        }
      }
      this.lastHoveredTab = null;
    }
    gBrowser.tabContainer.arrowScrollbox._stopScroll();
    if (tab == this.lastHoveredTab)
      return;



    this.lastHoveredTab = tab;
    if (tab == gBrowser.selectedTab)
      return;
    if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
      return;

    if (tab.multiselected) {
      gBrowser.removeFromMultiSelectedTabs(tab, true);
    } else {
      gBrowser.addToMultiSelectedTabs(tab, false);
      gBrowser.lastMultiSelectedTab = tab;
    }
  },

  mouseup: function(event) {
    window.removeEventListener('mousemove', this, true);
    window.removeEventListener('mouseup', this, true);

    this.startSelection = false;
    gBrowser.tabContainer.arrowScrollbox._stopScroll();

    // Suppressing contextmenu if mouse is not on tab
    if (event.button == 2 && !event.originalTarget.closest('tab')) {
      event.preventDefault();
    }
    let tabs = gBrowser.visibleTabs;
    for(let i = 0; i < tabs.length; i++) {
      if (tabs[i].multiselected) {
        gBrowser.addToMultiSelectedTabs(gBrowser.selectedTab, false);
        break;
      }
    }
    return;
  },

}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  rightMouseButtonDragSelectTabs.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      rightMouseButtonDragSelectTabs.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
