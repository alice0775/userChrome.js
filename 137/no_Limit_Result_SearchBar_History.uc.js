// ==UserScript==
// @name         no_Limit_Result_SearchBar_History.uc.js
// @description  履歴表示件数を上限なしにする
// @charset      UTF-8
// @include      main
// @async          true
// @compatibility  Firefox 137
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version      2022/10*18 10:00 fix Bug 1790616
// @version      2019/06/24 23:00 fix 69 wait for gBrowser initialized
// @version      2018-07-21 fix at startup
// @version      2018-07-20
// ==/UserScript==
const no_Limit_Result_SearchBar_History = {
  init: function() {
    window.addEventListener('unload', this, false);
    window.addEventListener('aftercustomization', this, false);
    document.querySelector("#PopupSearchAutoComplete").addEventListener('popupshowing', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    this.patch();
  },

  uninit: function() {
    window.removeEventListener('unload', this, false);
    window.removeEventListener('aftercustomization', this, false);
    document.querySelector("#PopupSearchAutoComplete").removeEventListener('popupshowing', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
  },

  patch: function() {
    const bar = document.getElementById("searchbar");
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
      case "popupshowing":
        document.querySelector(".search-panel-tree").style.setProperty("max-height", "20em", "");
        break;
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
