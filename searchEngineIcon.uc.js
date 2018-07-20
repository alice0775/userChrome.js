// ==UserScript==
// @name           searchEngineIcon.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    replace the magnifying glass with the search engine's icon
// @include        main
// @compatibility  Firefox 38
// @author         Alice0775
// @version        2018/07*20 23:00 Fix change option > search
// @version        2017/11/17 02:00 Fx57
// @version        2015/09/08 02:00 Bug 827546
// ==/UserScript==
var searchengineicon = {

  init: function() {
    this.toggleImage();

    window.addEventListener('aftercustomization', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    Services.obs.addObserver(this, "browser-search-engine-modified");
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    window.removeEventListener('aftercustomization', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
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

  observe(aSubject, aTopic, aPrefstring) {
    if (aTopic == "browser-search-engine-modified") {
      aSubject.QueryInterface(Components.interfaces.nsISearchEngine);
      switch (aPrefstring) {
      case "engine-current":
        this.toggleImage();
      case "engine-default":
        // Not relevant
        break;
      }
    }
    if (aTopic == 'nsPref:changed') {
      // 設定が変更された時の処理
      setTimeout(function(){searchengineicon.toggleImage();}, 0);
    }
  },

  handleEvent: function(event){
    switch (event.type) {
      case "aftercustomization":
        this.toggleImage();
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }
}

searchengineicon.init();
