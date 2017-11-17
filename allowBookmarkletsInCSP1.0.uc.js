// ==UserScript==
// @name           allowBookmarkletsInCSP1.0.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Allow bookmarklets in CSP 1.0
// @include        main
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include        chrome://browser/content/places/places.xul
// @compatibility  Firefox 17+
// @author         Alice0775
// @version        2017/01/29 00:00 fix syntax error
// @version        2013/04/29 09:10 Workaround Bug 866522
// ==/UserScript==

(function (){
  if (/evalInSandbox/.test(PlacesUIUtils._openNodeIn.toString()))
    return;
  PlacesUIUtils._openNodeIn_allowBookmarkletsInCSP = PlacesUIUtils._openNodeIn;
  PlacesUIUtils._openNodeIn = function PUIU_openNodeIn(aNode, aWhere, aWindow, aPrivate=false) {
      try {
        if (/^javascript:/.test(aNode.uri)) {
          let url = decodeURIComponent(aNode.uri.replace(/\\+/g, '%2b'));
          let context = content;
          let sandbox =  Components.utils.Sandbox(context, {
              'sandboxName': 'allowBookmarkletsInCSP',
              'sandboxPrototype': context,
              'wantXrays': false,
          });
          Components.utils.evalInSandbox(url, sandbox, '1.8');
          return;
        }
      } catch(ex){}
      PlacesUIUtils._openNodeIn_allowBookmarkletsInCSP(aNode, aWhere, aWindow, aPrivate);
  }
})();



