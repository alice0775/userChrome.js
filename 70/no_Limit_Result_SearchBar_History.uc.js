// ==UserScript==
// @name         no_Limit_Result_SearchBar_History.uc.js
// @description  履歴表示件数を上限なしにする
// @charset      UTF-8
// @include      main
// @version      2019/06/24 23:00 fix 69 wait for gBrowser initialized
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
    if (!bar) 
      return;
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

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  no_Limit_Result_SearchBar_History.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      no_Limit_Result_SearchBar_History.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
