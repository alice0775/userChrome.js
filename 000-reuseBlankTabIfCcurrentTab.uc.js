// ==UserScript==
// @name           000-reuseBlankTabIfCcurrentTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Reuse Blank Tab If CcurrentTab is Blank Tab and NewTab
// @include        *
// @exclude        about:*
// @exclude        chrome://mozapps/content/downloads/unknownContentType.xul
// @compatibility  60
// @version        2018/09/23 23:30 fix variable name
// @version        2018/09/23 23:00 check tab busy flag
// @version        2018/09/23 16:00 
// ==/UserScript==
if (window.openLinkIn && !/reuseBlankTabIfCcurrentTab_org/.test(window.openLinkIn.toString())) {
  window.openLinkIn_reuseBlankTabIfCcurrentTab_org = window.openLinkIn;
  window.openLinkIn = function(url, where, params) {
    var mainWindow = (typeof BrowserWindowTracker != "undefined") ? BrowserWindowTracker.getTopWindow(): Services.wm.getMostRecentWindow("navigator:browser");
    let url_000 = mainWindow.gBrowser.webNavigation.currentURI.spec;
    if ((url_000 == "about:blank" /*|| url_000 == "about:home"*/ || url_000 == "about:newtab")
      && !mainWindow.gBrowser.selectedTab.hasAttribute("busy")
      && (where == "tab" || where == "tabshifted")) {
      where  = "current";
    }
    window.openLinkIn_reuseBlankTabIfCcurrentTab_org(url, where, params);
  }
}
if (window.gBrowser && !/reuseBlankTabIfCcurrentTab_org/.test(window.gBrowser.loadTabs.toString())) {
  window.gBrowser.loadTabs_reuseBlankTabIfCcurrentTab_org = window.gBrowser.loadTabs;
  gBrowser.loadTabs = function (aURIs, {
      allowThirdPartyFixup,
      inBackground,
      newIndex,
      postDatas,
      replace,
      targetTab,
      triggeringPrincipal,
      userContextId,
    }){
    var mainWindow = (typeof BrowserWindowTracker != "undefined") ? BrowserWindowTracker.getTopWindow(): Services.wm.getMostRecentWindow("navigator:browser");
    let url_000 = mainWindow.gBrowser.webNavigation.currentURI.spec;
    if ((url_000 == "about:blank" /*|| url_000 == "about:home"*/ ||  url_000 == "about:newtab")
       && !mainWindow.gBrowser.selectedTab.hasAttribute("busy")) {
      replace  = true;
    }
    gBrowser.loadTabs_reuseBlankTabIfCcurrentTab_org(aURIs, {
      allowThirdPartyFixup,
      inBackground,
      newIndex,
      postDatas,
      replace,
      targetTab,
      triggeringPrincipal,
      userContextId,
    })
  }
}