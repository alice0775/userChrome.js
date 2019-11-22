// ==UserScript==
// @name           searchEngineIcon.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    replace the magnifying glass with the search engine's icon
// @include        main
// @compatibility  Firefox 72
// @author         Alice0775
// @version        2019/11/22 00:00 workaround delayed initialize using gBrowserInit.delayedStartupFinished instead async Services.search.init()
// @version        2019/11/14 00:00 Fix 72+ Bug 1591145 Remove Document.GetAnonymousElementByAttribute
// @version        2019/06/24 11:00 Fix 68+ Bug 1518545 - Merge engine-current/ default notifications
// @version        2019/05/24 11:00 Fix overflowed/underflowed
// @version        2019/03/30 19:00 Fix 67.0a1 Bug 1492475 The search service init() method should simply return a Promise
// @version        2019/03/20 00:00 Fix 67.0a1
// @version        2018/11/29 00:00 Fix 67.0a1 Bug 1524593 - nsISearchService (aka nsIBrowserSearchService, previously) refactor to be mostly an asynchronouse
// @version        2018/11/29 00:00 Fix 65.0a1 Bug 1453264
// @version        2018/09/29 23:00 Fix 64.0a1
// @version        2018/09/24 23:00 Fix warning from nsIBrowserSearchService
// @version        2018/07*20 23:00 Fix change option > search
// @version        2017/11/17 02:00 Fx57
// @version        2015/09/08 02:00 Bug 827546
// ==/UserScript==
var searchengineicon = {

  init: function() {
    this.toggleImage("init");
    window.addEventListener('aftercustomization', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    Services.obs.addObserver(this, "browser-search-engine-modified");
    window.addEventListener("resize", this, false);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    window.removeEventListener('aftercustomization', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
    Services.obs.removeObserver(this, "browser-search-engine-modified");
    window.removeEventListener("resize", this, false);
    window.removeEventListener('unload', this, false);
  },
  
  toggleImage: async function(topic) {
      Services.console.logStringMessage("toggleImage "+topic);
      var searchbar = window.document.getElementById("searchbar");
      if (!searchbar)
        return;
      let  searchbutton = searchbar.querySelector(".searchbar-search-icon");
      if (!searchbutton)
        return;
      Services.console.logStringMessage("toggleImage "+topic +" done");
      let defaultEngine = await Services.search.getDefault();
      var uri = defaultEngine.iconURI.spec;
      //var icon = PlacesUtils.getImageURLForResolution(window, uri);
      searchbutton.setAttribute("style", "list-style-image: url('"+ uri +"') !important; -moz-image-region: auto !important; width: 16px !important; padding: 2px 0 !important;");
  },

  observe(aSubject, aTopic, aPrefstring) {
    if (aTopic == "browser-search-engine-modified") {
      aSubject.QueryInterface(Components.interfaces.nsISearchEngine);
      switch (aPrefstring) {
      case "engine-current":
      case "engine-default":
       this.toggleImage(aPrefstring);
        // Not relevant
        break;
      }
    }
    if (aTopic == 'nsPref:changed') {
      // 設定が変更された時の処理
      setTimeout(function(){searchengineicon.toggleImage(aTopic);}, 0);
    }
  },

  _timer: null,
  handleEvent: function(event){
    switch (event.type) {
      case "aftercustomization":
        this.toggleImage("aftercustomization");
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }
}


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  searchengineicon.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      searchengineicon.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
