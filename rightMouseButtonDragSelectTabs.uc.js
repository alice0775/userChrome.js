// ==UserScript==
// @name           rightMouseButtonDragSelectTabs.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Right Mouse Button Drag To Select Tabs
// @include        main
// @author         Alice0775
// @compatibility  63+
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
    let tab = event.target;
    if (event.button == 2 && !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)) {
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
    let tab = document.evaluate(
                'ancestor-or-self::*[local-name()="tab"]',
                event.originalTarget,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
    if (!tab) {
      // scrollbutton
      let scrollbutton = document.evaluate(
                  'ancestor-or-self::*[contains(@class,"scrollbutton-up")]',
                  event.originalTarget,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE,
                  null
                ).singleNodeValue;
      if (scrollbutton) {
        if (scrollbutton != this.lastHoveredTab) {
          this.lastHoveredTab = scrollbutton;
          gBrowser.tabContainer.arrowScrollbox._startScroll(-1);
        }
        return;
      } else {
        scrollbutton = document.evaluate(
                          'ancestor-or-self::*[contains(@class,"scrollbutton-down")]',
                          event.originalTarget,
                          null,
                          XPathResult.FIRST_ORDERED_NODE_TYPE,
                          null
                        ).singleNodeValue;
        if (scrollbutton) {
          if (scrollbutton != this.lastHoveredTab) {
            this.lastHoveredTab = scrollbutton;
            gBrowser.tabContainer.arrowScrollbox._startScroll(1);
          }
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
    if (event.target.localName != "tab") {
      event.preventDefault();
    }
    return;
  },

}
rightMouseButtonDragSelectTabs.init();
