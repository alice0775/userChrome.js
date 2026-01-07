// ==UserScript==
// @name         sort_Result_SearchBar_History.uc.js
// @description  履歴表示件を変更する
// @charset      UTF-8
// @include      main
// @async          true
// @compatibility  148
// @version      2025/12/20 00:00 0,1 only works when new search widget is enabled
// @version      2018-07-20
// ==/UserScript==
  
const sort_Result_SearchBar_History = {
  /*
    0: デフォルト
    1: 最新入力順
    2: 入力順
    3: 文字コード昇順
  */
  SORT_ORDER: 1,

  init: function() {
    Services.prefs.clearUserPref('browser.formfill.agedWeight');
    Services.prefs.clearUserPref('browser.formfill.boundaryWeight');
    Services.prefs.clearUserPref('browser.formfill.bucketSize');
    Services.prefs.clearUserPref('browser.formfill.maxTimeGroupings');
    Services.prefs.clearUserPref('browser.formfill.timeGroupingSize');
    if (false && Services.prefs.getBoolPref("browser.search.widget.new", false)) {
      switch(this.SORT_ORDER) {
        case 1:
          break;
        case 2:
          break;
        case 3:
          break;
        default:
      }
    } else {
      switch(this.SORT_ORDER) {
        case 1:
          Services.prefs.setIntPref('browser.formfill.agedWeight', 0);
          Services.prefs.setIntPref('browser.formfill.boundaryWeight', 0);
          Services.prefs.setIntPref('browser.formfill.bucketSize', -1);
          Services.prefs.setIntPref('browser.formfill.maxTimeGroupings', -1);
          Services.prefs.setIntPref('browser.formfill.timeGroupingSize', -1);
          break;
        case 2:
          Services.prefs.setIntPref('browser.formfill.agedWeight', 0);
          Services.prefs.setIntPref('browser.formfill.boundaryWeight', 0);
          Services.prefs.setIntPref('browser.formfill.bucketSize', 1);
          Services.prefs.setIntPref('browser.formfill.maxTimeGroupings', -1);
          Services.prefs.setIntPref('browser.formfill.timeGroupingSize', -1);
          break;
        case 3:
          Services.prefs.setIntPref('browser.formfill.agedWeight', 0);
          Services.prefs.setIntPref('browser.formfill.boundaryWeight', 0);
          Services.prefs.setIntPref("browser.formfill.bucketSize", 99999999);
          Services.prefs.setIntPref('browser.formfill.maxTimeGroupings', -1);
          Services.prefs.setIntPref('browser.formfill.timeGroupingSize', -1);
          break;
        default:
      }
    }
  }
}

sort_Result_SearchBar_History.init();
