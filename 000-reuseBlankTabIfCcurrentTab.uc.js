// ==UserScript==
// @name           000-reuseBlankTabIfCcurrentTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Reuse Blank Tab If CcurrentTab is Blank Tab and NewTab
// @include        *
// @exclude        about:*
// @exclude        chrome://mozapps/content/downloads/unknownContentType.xul
// @compatibility  60
// @version        2018/09/24 22:30 fix conflict with other eval, use isTabEmpty()
// @version        2018/09/23 23:30 fix variable name
// @version        2018/09/23 23:00 check tab busy flag
// @version        2018/09/23 16:00 
// ==/UserScript==
if (window.openLinkIn && !/reuseBlankTabIfCcurrentTab_org/.test(window.openLinkIn.toString())) {
  window.openLinkIn_reuseBlankTabIfCcurrentTab_org = window.openLinkIn;
  window.openLinkIn = function(url, where, params) {
    var mainWindow = (typeof BrowserWindowTracker != "undefined") ? BrowserWindowTracker.getTopWindow(): Services.wm.getMostRecentWindow("navigator:browser");
    if (mainWindow.isTabEmpty(mainWindow.gBrowser.selectedTab)
      && (where == "tab" || where == "tabshifted")
      && !mainWindow.isBlankPageURL(url)) {
      where  = "current";
      Services.console.logStringMessage("======REUSE EMPTY TAB======");
    }
    openLinkIn_reuseBlankTabIfCcurrentTab_org(url, where, params);
  }
}

if (location.href == "chrome://browser/content/browser.xul") {
  let func;
  if (gBrowser && !/reuseBlankTabIfCcurrentTab/.test(gBrowser.loadTabs.toString())) {
    func =  gBrowser.loadTabs.toString();
    if (!/justCreated/.test(func)) {
      func = func.replace('if (!aURIs.length) {',
                          `if (isTabEmpty(gBrowser.selectedTab)) {
                             /*reuseBlankTabIfCcurrentTab*/
                             replace  = true;
                           }
                           $&`
                         );
      eval("gBrowser.loadTabs = function " + func.replace(/^function/, ''));
    }
  }
}
