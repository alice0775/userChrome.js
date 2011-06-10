// ==UserScript==
// @name           patchForBug493658.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 493658 -  Highlight all of the Findbar does not work in a certain page
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 3.0 3.5 3.6a1pre
// @author         Alice0775
// @version        2009/05/19 10:00
// ==/UserScript==
document.getElementById("FindToolbar")
._getSelectionController =function _getSelectionController(aWindow) {
  // Yuck. See bug 138068.
  var Ci = Components.interfaces;
  var docShell = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                        .getInterface(Ci.nsIWebNavigation)
                        .QueryInterface(Ci.nsIDocShell);

  // Bug 493658 -  Highlight all of the Findbar does not work in a certain page
  try {
    var controller = docShell.QueryInterface(Ci.nsIInterfaceRequestor)
                           .getInterface(Ci.nsISelectionDisplay)
                           .QueryInterface(Ci.nsISelectionController);
  } catch (e) {
    return null;
  }
  return controller;
}