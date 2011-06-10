// ==UserScript==
// @name           OpenSearchNotification.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Open Search Notification
// @include        main
// @compatibility  Firefox 4.0
// @author         Alice0775
// @Note
// @version        2011/01/31 13:00  Minefield/3.7a4pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// ==/UserScript==
var osglow = {
  init: function() {
    var style = <![CDATA[
    .searchbar-engine-button[addengines='true'] .searchbar-dropmarker-image {
       background-image: -moz-radial-gradient(center 45deg, highlight 0%, rgba(255,255,255,0) 100%) !important;
    }
    ]]>.toString();
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

  	gBrowser.addEventListener("pageshow", this, false);
  	gBrowser.mTabContainer.addEventListener("select", this, false);
  	window.addEventListener("unload", this, false);
  },

  uninit: function() {
  	window.removeEventListener("unload", this, false);
  	gBrowser.removeEventListener("pageshow", this, false);
  	gBrowser.mTabContainer.removeEventListener("select", this, false);
  },

  timer: null,

  handleEvent: function(event) {
    switch (event.type) {
      case 'pageshow':
      case 'select':
        if (this.timer)
          clearTimeout(this.timer);
        this.timer = setTimeout(function(self){self.osupdate();}, 0, this);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  osupdate: function() {
		var engines = gBrowser.selectedBrowser.engines;
		var search = document.getElementById("searchbar");
		if (engines && engines.length > 0)
			search.searchButton.setAttribute("addengines", "true");
		else
			search.searchButton.removeAttribute("addengines");
	}
}

osglow.init();

