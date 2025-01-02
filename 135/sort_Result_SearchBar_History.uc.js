// ==UserScript==
// @name         sort_Result_SearchBar_History.uc.js
// @description  履歴表示件を変更する
// @charset      UTF-8
// @include      main
// @async          true
// @version      2018-07-20
// ==/UserScript==
const sort_Result_SearchBar_History = {
  /*
    0: デフォルト
    1: 最新入力順
    2: 入力順
    3: 文字コード降順
  */
  SORT_ORDER: 1,

  init: function() {
    switch(this.SORT_ORDER) {
      case 1:
        Services.prefs.setIntPref('browser.formfill.bucketSize', -1);
        Services.prefs.setIntPref('browser.formfill.maxTimeGroupings', -1);
        Services.prefs.setIntPref('browser.formfill.timeGroupingSize', -1);
        break;
      case 2:
        Services.prefs.setIntPref('browser.formfill.bucketSize', 1);
        Services.prefs.setIntPref('browser.formfill.maxTimeGroupings', -1);
        Services.prefs.setIntPref('browser.formfill.timeGroupingSize', -1);
        break;
      case 3:
        Services.prefs.setIntPref("browser.formfill.bucketSize", 99999999);
        Services.prefs.clearUserPref('browser.formfill.maxTimeGroupings');
        Services.prefs.clearUserPref('browser.formfill.timeGroupingSize');
        break;
      default:
        Services.prefs.clearUserPref('browser.formfill.bucketSize');
        Services.prefs.clearUserPref('browser.formfill.maxTimeGroupings');
        Services.prefs.clearUserPref('browser.formfill.timeGroupingSize');
    }
  }
}

sort_Result_SearchBar_History.init();
