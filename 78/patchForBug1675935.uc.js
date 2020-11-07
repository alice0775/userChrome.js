// ==UserScript==
// @name           patchForBug1675935.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Fix places contextmenu highlight
// @include        main
// @compatibility  Firefox 78+
// @author         Alice0775
// @version        2020/10/10 00:00
// @Note
// ==/UserScript==
var patchForBug1675935 = {
  init: function() {
    document.getElementById("placesContext").addEventListener("popupshowing", this, false);
    document.getElementById("placesContext").addEventListener("popuphidden", this, false);
  },
  handleEvent: function(event) {
    switch(event.type) {
      case "popupshowing":
        document.getElementById("statuspanel").style.setProperty("display", "none", "important");
        break;       
      case "popuphidden":
        document.getElementById("statuspanel").style.removeProperty("display");
    }
  }
  
}
patchForBug1675935.init();
