// ==UserScript==
// @name           addTiltle2DownloadsWindow.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Add tiltle to downloads window
// @include        chrome://mozapps/content/downloads/downloads.xul
// @compatibility  Firefox 20
// @author         Alice0775
// @version        2013/01/11 22:00 title
// ==/UserScript==
var addTiltle2DownloadsWindow = {
  statictitle: "Downloads",
  
  init: function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var win = wm.getMostRecentWindow("navigator:browser");
    if (win.document.getElementById("appmenu_downloads"))
      this.statictitle = win.document.getElementById("appmenu_downloads").getAttribute("label");
    
    this.setTitle();
  },

  setTitle: function() {
    document.documentElement.setAttribute("statictitle", this.statictitle);
    if (!document.title)
      document.title = this.statictitle;
  }
}
addTiltle2DownloadsWindow.init();
