// ==UserScript==
// @name           patchForBugBugSearch.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    patch For Bug Bug Search
// @include        main
// @compatibility  Firefox 33
// @author         Alice0775
// @version        2014/11/20 19:30 temporary fix for e10s
// @version        2014/10/28 07:30 Use gBrowser instead window
// @version        2014/10/28 01:30 typo
// @version        2014/10/28 00:30
// @version        2014/10/25 12:30
// ==/UserScript==
var bugbugSearch = {
  init: function() {
    window.addEventListener('unload', this, false);
    gBrowser.addEventListener("mousedown", this, true);
  },

  uninit: function() {
    window.removeEventListener('unload', this, false);
    gBrowser.removeEventListener('mousedown', this, true);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "mousedown":
        this.onMousedown(event);
        break;
      case "unload":
        this.uninit(event);
        break;
    }
  },

  onMousedown: function(event) {
    if (event.button !=0 )
      return;
    if (gBrowser.currentURI.spec != "about:home" &&
        gBrowser.currentURI.spec != "about:newtab")
      return;

    let listitem = event.target;
    let timer = gBrowser.selectedBrowser.getAttribute("remote") != "true" ? 0: 500;
    if (!timer) {
      this.doSearch(event);
    } else {
		  setTimeout(function() {
		    this.doSearch(event);
		  }.bnd(this), timer);
    }
  },

  doSearch: function(event) {
    let listitem = event.target;
    let term = listitem.textContent;
    if (!term)
      return;

    while(listitem) {
      if ('searchSuggestionEntry' == listitem.className) {
        event.preventDefault();
        event.stopPropagation();
        BrowserSearch._loadSearch(term, false);
        break;
      }
      listitem = listitem.parentNode;
    }
  }
}
bugbugSearch.init();
