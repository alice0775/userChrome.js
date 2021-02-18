// ==UserScript==
// @name           patchForBug1261327.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Fix places contextmenu highlight, workaround Bug1261327
// @include        main
// @compatibility  Firefox 78+
// @author         Alice0775
// @version        2021/02/18 16:00 Force download toolbutton, ucjsDownloadsStatusModoki and SidebarModoki to be hidden while the places context menu is popping up.
// @version        2020/10/10 00:00
// @Note
// ==/UserScript==
var patchForBug1675935 = {
  init: function() {
    document.getElementById("placesContext").addEventListener("popupshowing", this, false);
    document.getElementById("placesContext").addEventListener("popuphidden", this, false);
  },
  handleEvent: function(event) {
    let DSMbar = document.getElementById("downloadsStatusModokiBar");
    let SM_toolbox = document.getElementById("SM_toolbox");
    switch(event.type) {
      case "popupshowing":
        document.getElementById("statuspanel").style.setProperty("display", "none", "important");
        if (DSMbar) {
          let browser = document.getElementById("ucjsDownloadsStatusModoki");
          browser?.setAttribute("src", "");
        }
        if (SM_toolbox) {
          let browser = document.getElementById("SM_tab2-browser");
          browser?.setAttribute("src", "");
        }
        document.getElementById("downloads-button")?.style.setProperty("display", "none", "important");
        break;       
      case "popuphidden":
        document.getElementById("statuspanel").style.removeProperty("display");
        if (DSMbar) {
          let browser = document.getElementById("ucjsDownloadsStatusModoki");
          browser?.setAttribute("src", "chrome://browser/content/downloads/contentAreaDownloadsView.xhtml?StatusModoki");
        }
        if (SM_toolbox) {
          let browser = document.getElementById("SM_tab2-browser");
          browser?.setAttribute("src", "chrome://browser/content/downloads/contentAreaDownloadsView.xhtml?SM");
        }
        document.getElementById("downloads-button")?.style.removeProperty("display");
    }
  }
  
}
patchForBug1675935.init();
