// ==UserScript==
// @name           clearSeachBar.uc.js
// @namespace      http://amb.vis.ne.jp/mozilla/
// @description    Right click on magnify glass to clear SeachBar
// @include        main
// @compatibility  Firefox 60.0
// @author         Alice0775
// @version        2011/03/11 10:00 ellips and update in fullscreen and fix Bug641090 by alice0775
// ==/UserScript==

var clearSeachBar = {
  get searchbar(){
    return document.getElementById('searchbar');
  },
  
  init: function() {
    this.initSearchbar();
    window.addEventListener('aftercustomization', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    window.removeEventListener('aftercustomization', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
    window.removeEventListener('unload', this, false);
    if (this.searchbar)
      this.searchbar.removeEventListener('click', this, true);
  },

  initSearchbar: function() {
      if (!this.searchbar)
        return;

      this.searchbar.addEventListener('click', this, true);
  },

  handleEvent: function(event){
    switch (event.type) {
      case "aftercustomization":
        this.initSearchbar();
        break;
      case 'click':
        this.click(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  observe(aSubject, aTopic, aPrefstring) {
    if (aTopic == 'nsPref:changed') {
      // 設定が変更された時の処理
      setTimeout(function(){this.initSearchbar();}.bind(this), 0);
    }
  },

  click: function(event) {
    let target = event.originalTarget;
    if (event.button == 2 && target.className == "searchbar-search-button") {
      if (this.searchbar.value != "") {
        target.setAttribute('contextmenu', '');
        this.searchbar.value = "";
        setTimeout(() => {target.removeAttribute('contextmenu');}, 0);
      }
    }
  }
}
clearSeachBar.init();
