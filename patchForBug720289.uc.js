// ==UserScript==
// @name           patchForBug720289.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug720289 Leaving a File picker dialog open triggers an unresponsive script dialog
// @include        main
// @compatibility  Firefox 11-
// @author         Alice0775
// @version        2012/01/23 15:00 event check
// ==/UserScript==
window.xxxBug720289timer = null;
window.pageShowEventHandlers = function (event) {
  // Filter out events that are not about the document load we are interested in
  if (event.originalTarget == content.document) {
    if (xxxBug720289timer)
      clearTimeout(xxxBug720289timer);
    xxxBug720289timer = setTimeout(function(event){
                  charsetLoadListener(event);
                  XULBrowserWindow.asyncUpdateUI();
               }, 250, event);
  }
}

if (!gPrefService.getBoolPref("browser.taskbar.previews.enable"))
  XPCOMUtils.defineLazyGetter(this, "Win7Features", function () {
    return null;
  });