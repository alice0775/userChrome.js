// ==UserScript==
// @name           loadInSidebarMix.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        chrome://sidebarmix/content/sidebarmix.xul
// @compatibility  Firefox 3.0
// @author         Alice0775
// @version        2008/03/26 06:00
// @Note
// ==/UserScript==

var loadInSidebarMix = {
  sidebarWindow: null,
  init: function(sidebarWindow){
    this.sidebarWindow = sidebarWindow;
    this.sidebarWindow.document.addEventListener("load", this, true)
    this.sidebarWindow.addEventListener("unload", this, false)
  },
  handleEvent: function(event){
    switch (event.type) {
      case "unload":
        this.uninit(event);
        break;
      case "load":
        this.load(event);
        break;
    }
  },
  uninit: function(event){
    this.sidebarWindow.document.removeEventListener("load", this, true)
    this.sidebarWindow.removeEventListener("unload", this, false)
  },
  getMainWindow:function(){
      var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
      var enumerator = mediator.getEnumerator("navigator:browser");
      return enumerator.getNext();
  },
  load: function(event){
    var mainWindow = this.getMainWindow();
    var that = mainWindow.userChrome_js;
    var doc = event.originalTarget;
    var href = doc.location.href;
      if( !/^chrome:/.test(href) )return;
      that.debug("load SidebarMix " +  href);
      setTimeout(function(){that.runScripts(doc);
        setTimeout(function(){that.runOverlays(doc);},0);
      },0);
  }
}
loadInSidebarMix.init(window);
