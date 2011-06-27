// ==UserScript==
// @name           patchForBug610761RemoveSwitchToTabInURLBar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @charset        UTF-8
// @description    ロケーションバーにSwitch To Tabが残ってしまうのを修正
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0 7.0
// @author         Alice0775
// @version        2011/06/28 00:00
// ==/UserScript==

var removeSwitchToTabInURLBar = {
  init: function() {
    this.popup = document.getElementById("PopupAutoCompleteRichResult");
    this.popup.addEventListener("popuphidden", this, false);
    window.addEventListener("unload", this, false);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "popuphidden":
        this.onpopuphidden();
        break;
      case "unload":
        this.popup.removeEventListener("popuphidden", this, false);
        window.removeEventListener("unload", this, false);
        break;
    }
  },

	onpopuphidden: function() {
    if (gURLBar.getAttribute("actiontype") == "switchtab") {
	    setTimeout(function(self) {self.handleRevert();}, 250, this);
	  }
	},

	handleRevert: function() {
    if (gURLBar.getAttribute("actiontype") == "switchtab") {
	    gURLBar.handleRevert();
	  }
  }
}
removeSwitchToTabInURLBar.init();