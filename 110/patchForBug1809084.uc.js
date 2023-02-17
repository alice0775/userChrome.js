// ==UserScript==
// @name          patchForBug1809084.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1809084 - bookmarks menus intermittently reset their scrollbox position to the top
// @include       main
// @compatibility Firefox 110
// @author        alice0775
// @version       2023/02/17 00:00
// ==/UserScript==
"use strict";
var bug1809084 = {

  menupopup: ["bookmarksMenuPopup",
              'PlacesToolbar',
              'BMB_bookmarksPopup'],
  timer:[],
  count:[],

  init: function(){
    window.addEventListener("aftercustomization", this, false);
    this.delayedStartup();
  },

  //delayed startup
  delayedStartup: function(){
    //wait till construction of bookmarksBarContent is completed.
    for (var i = 0; i < this.menupopup.length; i++){
      this.count[i] = 0;
      this.timer[i] = setInterval(function(self, i){
        if(++self.count[i] > 50 || document.getElementById(self.menupopup[i])){
          clearInterval(self.timer[i]);
          var menupopup = document.getElementById(self.menupopup[i]);
          if (menupopup) {
            menupopup.addEventListener('popupshowing', self, false);
            menupopup.addEventListener('popuphiding', self, false);
          }
        }
      }, 250, this, i);
    }
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'popuphiding':
        this.popuphiding(event);
        break;
      case "aftercustomization":
        setTimeout(() => {this.delayedStartup();}, 0);
        break;
    }
  },

  popuphiding: function(event) {
    let menupopup = event.originalTarget;
    let y = menupopup.scrollBox.scrollbox.scrollTop;
    menupopup.bug1809084 = y;
  },

  popupshowing: function(event) {
    let menupopup = event.originalTarget;
    let y = menupopup.bug1809084;
    setTimeout(() => {menupopup.scrollBox.scrollbox.scrollTop = y;},0);
  }
}


bug1809084.init();
