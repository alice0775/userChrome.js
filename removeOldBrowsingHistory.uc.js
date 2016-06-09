// ==UserScript==
// @name           removeOldBrowsingHistory.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    remove Old Browsing History
// @include        main
// @compatibility  Firefox 17+
// @author         Alice0775
// @version        2016/06/03 17:00 nop
// @version        2013/03/03 00:00 
// ==/UserScript==
// Browsing History
(function() {
  // Period leaving Browsing History
  var dMax = 7; //days
  // in microseconds
  var aBeginTime = Date.now()*1000 - 10 * 365 * 24 * 3600000000; //10 years
  var aEndTime = Date.now()*1000 - dMax * 24 * 3600000000;
  PlacesUtils.history.QueryInterface(Components.interfaces.nsIBrowserHistory).
              removeVisitsByTimeframe(aBeginTime, aEndTime);
})();
