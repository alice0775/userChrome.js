// ==UserScript==
// @name           patchForBug641090.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug641090 context/right-click menu "Search Google for" broken in popup windows, displays assertion failed dialog, And Firefox should open the new tab in a full browser window 
// @include        main
// @compatibility  Firefox 4.0
// @author         Alice0775
// @version        2011/03/12
// @Note
// ==/UserScript==
var bug641090 = {
  handleEvent: function(event) {
    switch (event.type) {
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", this, false);
    this.patch();
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    this.unPatch();
  },

  patch: function() {
    this.BrowserSearch_loadSearch = BrowserSearch.loadSearch;
    var func = BrowserSearch.loadSearch.toString();
    func = func.replace(
      'if (useNewTab) {',
       <><![CDATA[
       openLinkIn(submission.uri.spec,
               useNewTab ? "tab" : "current",
               { postData: submission.postData,
                 relatedToCurrent: true });
       return;
       $&
       ]]></>
    );
    BrowserSearch.loadSearch = new Function(
       func.match(/\((.*)\)\s*\{/)[1],
       func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
    );
  },

  unPatch: function() {
    BrowserSearch.loadSearch = this.BrowserSearch_loadSearch;
  }
}
bug641090.init();
