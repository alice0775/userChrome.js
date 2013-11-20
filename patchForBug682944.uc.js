// ==UserScript==
// @name           patchForBug682944.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 682944 - "Restore Previous Session" button on default homepage does nothing
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0 7.0 14
// @author         Alice0775
// @version        2012/08/12 22:30 Bug 761723 implement toString of function objects by saving source
// ==/UserScript==
// @version        2012/04/18
// @version        2011/08/30
// @Note
var bug682944 = {
  oldfunc: null,
  handleEvent: function(event) {
    switch (event.type) {
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", this, false);
    var func = window.TabsProgressListener.onStateChange.toString();
    if (!/bug682944/.test(func)) {
      this.oldfunc = window.TabsProgressListener.onStateChange;
      func = func.replace(
        'aBrowser.addEventListener("pagehide", function () {',
        <><![CDATA[
        aBrowser.addEventListener("pagehide", function (event) {
        bug682944;
        if (event.originalTarget.defaultView.frameElement)
          return;
        ]]></>
      );
      func = func.replace(
        'aBrowser.addEventListener("pagehide", function onPageHide() {',
        <><![CDATA[
        aBrowser.addEventListener("pagehide", function onPageHide(event) {
        bug682944;
        if (event.originalTarget.defaultView.frameElement)
          return;
        ]]></>
      );
      window.TabsProgressListener.onStateChange = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*/, '').replace(/^{/, '').replace(/}$/, '')
      );
    }
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    if (!!this.oldfunc)
      window.TabsProgressListener.onStateChange =  this.oldfunc;
  }
}
bug682944.init();
