// ==UserScript==
// @name          bookmarksmenu_scrollbar.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   add scrollbar and hide scroll button for bookmarks menu
// @include       main
// @compatibility Firefox 95
// @author        alice0775
// @version       2021/10/25 95 Bug 1737033 Remove workaround for bug 420033. Bug 1671000 - When activating items in menu popups, stay clear of overlapping scroll buttons
// @version       2018/10/04 88
// ==/UserScript==
"use strict";
var bookmarksmenu_scrollbar = {

  menupopup: ["historyMenuPopup",
              "bookmarksMenuPopup",
              'PlacesToolbar',
              'BMB_bookmarksPopup'],
  timer:[],
  count:[],
  
  init: function() {
    window.removeEventListener("load", this, false);
    window.addEventListener('unload', this, false);
    window.addEventListener("aftercustomization", this, false);
    this.delayedStartup();
  },

  delayedStartup: function() {
    //wait till construction of bookmarksBarContent is completed.
    for (var i = 0; i < this.menupopup.length; i++) {
      this.count[i] = 0;
      this.timer[i] = setInterval(function(self, i){
        if(++self.count[i] > 50 || document.getElementById(self.menupopup[i])){
          clearInterval(self.timer[i]);
          var menupopup = document.getElementById(self.menupopup[i]);
          if (menupopup) {
            menupopup.addEventListener('popupshowing', self, false);
          }
        }
      }, 250, this, i);
    }
  },

  uninit: function() {
    window.removeEventListener('unload', this, false);
    window.removeEventListener("aftercustomization", this, false);
  },

  handleEvent: function(event) {
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case "aftercustomization":
        setTimeout(function(self){self.delayedStartup(self);}, 0, this);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  popupshowing: function(event) {
    let scrollBox = event.originalTarget.scrollBox;
    scrollBox.scrollbox.style.setProperty("overflow-y", "auto", "important");

    scrollBox.scrollbox.style.setProperty("margin-top", "0", "important");
    scrollBox.scrollbox.style.setProperty("margin-bottom", "0", "important");
    // 上下のスクロールボタン
    event.originalTarget.on_DOMMenuItemActive = function(event) {};
    scrollBox._scrollButtonUp.style.display = "none";
    scrollBox._scrollButtonDown.style.display = "none";
  }
}


bookmarksmenu_scrollbar.init();
