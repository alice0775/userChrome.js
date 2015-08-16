// ==UserScript==
// @name           test_http-on-modify-request_with_e10s.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    http-on-modify-requestのe10sテスト なにもしない
// @include        main
// @version        2015/03/15 11:00 e10s 
// ==/UserScript==
function test() {
  Components.utils.import("resource://gre/modules/Services.jsm");

  function testObserver(subject, topic, data) {
    if(topic != 'http-on-modify-request')
      return;
    var http = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
    Services.console.logStringMessage("============================= " + http.originalURI.spec);
  }

  var observerService = Components.classes["@mozilla.org/observer-service;1"]
        .getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(testObserver, "http-on-modify-request", false);

}
window.messageManager.loadFrameScript("data:,(" + test.toString() + ")();", true);



