// ==UserScript==
// @name           removeOldFormHistory.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    remove Old Form Histroty
// @include        main
// @compatibility  Firefox 17+
// @author         Alice0775
// @version        2017/16/30 20:00 Form typo
// @version        2016/06/03 17:00 Form Histroty
// ==/UserScript==
// Form History
(function() {
  // Period leaving Form History
  var dMax = 2; //days
  // in microseconds
  var aBeginTime = Date.now()*1000 - 10 * 365 * 24 * 3600000000; //10 years
  var aEndTime = Date.now()*1000 - dMax * 24 * 3600000000;
  var removeOldFormHistory = {};

  XPCOMUtils.defineLazyModuleGetter(removeOldFormHistory, "FormHistory",
                                   "resource://gre/modules/FormHistory.jsm");
  try {
    var change = { op: "remove" };
    change.firstUsedStart = aBeginTime;
    change.firstUsedEnd = aEndTime;
    removeOldFormHistory.FormHistory.update(change, null);
  } catch(e) {
  }
})();
