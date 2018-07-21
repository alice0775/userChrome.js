// ==UserScript==
// @name         no_Limit_Result_SearchBar_History.uc.js
// @description  履歴表示件数を上限なしにする
// @charset      UTF-8
// @include      main
// @version      2018-07-21 fix at startup
// @version      2018-07-20
// ==/UserScript==
const no_Limit_Result_SearchBar_History = {
  init: function() {
    window.addEventListener('unload', this, false);
    window.addEventListener('aftercustomization', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    this.patch();
  },

  uninit: function() {
    window.removeEventListener('unload', this, false);
    window.removeEventListener('aftercustomization', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
  },

  patch: function() {
    const bar = BrowserSearch.searchBar;
    const box = bar._textbox;
    box.popup.setAttribute('nomaxresults', 'true');
  },

  observe(aSubject, aTopic, aPrefstring) {
      if (aTopic == 'nsPref:changed') {
        // 設定が変更された時の処理
        setTimeout(function(){no_Limit_Result_SearchBar_History.patch();}, 0);
      }
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "aftercustomization":
        this.patch();
        break;
      case "unload":
        this.uninit();
        break;
    }
  }
}

no_Limit_Result_SearchBar_History.init();
