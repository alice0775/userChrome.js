// ==UserScript==
// @name           searchEngineIcon.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    replace the magnifying glass with the search engine's icon
// @include        main
// @compatibility  Firefox 38
// @author         Alice0775
// @version        2017/11/17 02:00 Fx57
// @version        2015/09/08 02:00 Bug 827546
// ==/UserScript==
var searchengineicon = {

  init: function() {
    this.toggleImage();

    Services.obs.addObserver(this, "browser-search-engine-modified");
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    Services.obs.removeObserver(this, "browser-search-engine-modified");
    window.removeEventListener('unload', this, false);
  },
  
  toggleImage: function() {
      var searchbar = window.document.getElementById("searchbar");
      var searchbutton = window.document.getAnonymousElementByAttribute(searchbar, "class", "searchbar-search-icon");
      var uri = Services.search.currentEngine.iconURI.spec;
      //var icon = PlacesUtils.getImageURLForResolution(window, uri);
      searchbutton.setAttribute("style", "list-style-image: url('"+ uri +"') !important; -moz-image-region: auto !important; width: 16px !important; padding: 2px 0 !important;");
  },

  observe(aEngine, aTopic, aVerb) {
    if (aTopic == "browser-search-engine-modified") {
      aEngine.QueryInterface(Components.interfaces.nsISearchEngine);
      switch (aVerb) {
      case "engine-current":
        this.toggleImage();
      case "engine-default":
        // Not relevant
        break;
      }
    }
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
    }
  }
}

searchengineicon.init();
