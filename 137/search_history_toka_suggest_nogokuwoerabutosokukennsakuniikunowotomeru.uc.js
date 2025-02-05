// ==UserScript==
// @name           search historyとかsuggestの語句選ぶと即検索にいくのを止める.uc.js
// @namespace      http://pc11.2ch.net/test/read.cgi/software/1168635399/
// @description    search historyとかsuggestの語句選ぶと即検索にいくのを止める
// @include        main
// @async          true
// @compatibility  Firefox 137
// @author         2ch
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version        2019/03/20 00:00 fix66
// @version        2018/10/23 12:00
// @modified       by Alice0775
// ==/UserScript==

var search_history_toka_suggest_nogokuwoerabutosokukennsakuniikunowotomeru = {
  init: async function() {
    if (!Services.search.isInitialized) {
      await Services.search.init();
    }
    this.initpatch();
    window.addEventListener("aftercustomization", this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    window.addEventListener('unload', this, false);
  },

  uninit: function() {
    window.removeEventListener("aftercustomization", this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
    window.removeEventListener('unload', this, false);
  },

  handleEvent: function(event){
    switch (event.type) {
      case "aftercustomization":
        this.initpatch();
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  observe(aSubject, aTopic, aPrefstring) {
    if (aTopic == 'nsPref:changed') {
      setTimeout(() => {this.initpatch();}, 0);
    }
  },

  initpatch: function() {
    var popup = document.getElementById("PopupSearchAutoComplete");
    if (typeof popup.onPopupClick_org == "undefined") {
      popup.onPopupClick_org = popup.onPopupClick;
      popup.onPopupClick = function(aEvent) {
        if (aEvent.button == 0 && !aEvent.shiftKey && !aEvent.ctrlKey &&
            !aEvent.altKey && !aEvent.metaKey) {
          var searchBar = document.getElementById("searchbar");
          searchBar.value = this.input.controller.getValueAt(this.selectedIndex);
          if(typeof searchBar.updateGoButtonVisibility == "function")
            searchBar.updateGoButtonVisibility();
          // this.closePopup();
          return;
        }
        this.onPopupClick_org.apply(this, arguments);
      }
    }
  }
}
search_history_toka_suggest_nogokuwoerabutosokukennsakuniikunowotomeru.init();