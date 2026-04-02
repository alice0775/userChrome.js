// ==UserScript==
// @name         sort_Result_SearchBar_History.uc.js
// @description  履歴表示件を変更する
// @charset      UTF-8
// @include      main
// @async          true
// @compatibility  Firefox 149
// @version        2026/04/02 12:00 Remove deactivation for new search widget
// @version        2026/01/13 00:00 compatibility 149 from 148
// @version      2025/12/20 00:00 0,1 only works when new search widget is enabled
// @version      2018-07-20
// ==/UserScript==
  
const sort_Result_SearchBar_History = {
  /*
    0: デフォルト(多分、新しいものが上)
    1: 最新入力順(新しいものが上)
    2: 入力順(古いものが上)
    3: 文字コード昇順(日本語辞書順)
  */
  SORT_ORDER: 1,

  init: function() {
    if (/*false &&*/ Services.prefs.getBoolPref("browser.search.widget.new", false)) {
      document.getElementById("searchbar-new").view.onQueryResults_org = 
        document.getElementById("searchbar-new").view.onQueryResults;
      document.getElementById("searchbar-new").view.onQueryResults = function (queryContext) {
        queryContext.results = this.sortContext(queryContext.results, sort_Result_SearchBar_History.SORT_ORDER);
        this.onQueryResults_org(queryContext);
      }
      document.getElementById("searchbar-new").view.sortContext =
      function (results, sort_order) {
        switch(sort_order) {
          case 1:
          break;
          case 2:
            return results.reverse();
            break;
          case 3:
            // xxx
            if (results.length > 10000) {
                results.splice(10000);
            }
            return results.sort((a, b) => {
              return a.toString().localeCompare(b.toString(), 'ja');
            });
            break;
          default:
        }
        return results;
      }
    } else {
      Services.prefs.clearUserPref('browser.formfill.agedWeight');
      Services.prefs.clearUserPref('browser.formfill.boundaryWeight');
      Services.prefs.clearUserPref('browser.formfill.bucketSize');
      Services.prefs.clearUserPref('browser.formfill.maxTimeGroupings');
      Services.prefs.clearUserPref('browser.formfill.timeGroupingSize');
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
