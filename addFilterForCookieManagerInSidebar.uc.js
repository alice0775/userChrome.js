// ==UserScript==
// @name           addFilterForCookieManagerInSidebar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    クッキーの管理をサイドバーに開いたときは, カレントドキュメントのドメインをfilterの初期値とする
// @include        chrome://browser/content/preferences/cookies.xul
// @compatibility  Firefox 3.0
// @author         Alice0775
// @version        LastMod 2009/03/14 20:00
// @Note
// ==/UserScript==
(function(){
  if (window.opener)
    return;

  var sidebarWin;
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var mainWindow = wm.getMostRecentWindow("navigator:browser");

  var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"].
                    getService(Components.interfaces.nsIEffectiveTLDService);
  var eTLD;
  var uri = mainWindow.getBrowser().contentWindow.document.documentURIObject;
  try {
    eTLD = eTLDService.getBaseDomain(uri);
  }
  catch (e) {
    // getBaseDomain will fail if the host is an IP address or is empty
    eTLD = uri.asciiHost;
  }

  var win = mainWindow.document.getElementById('sidebar').contentWindow;
  if (win &&
      win.location.href == "chrome://browser/content/preferences/cookies.xul") {
    sidebarWin = win;
  } else if (win &&
             win.location.href == "chrome://browser/content/web-panels.xul") {
    sidebarWin = win.document.getElementById('web-panels-browser').contentWindow;
  } else {
    return;
  }

  if (eTLD &&
      sidebarWin &&
      sidebarWin.location.href == "chrome://browser/content/preferences/cookies.xul") {
    var filter = document.getElementById('filter');
    setTimeout(function(){filter.value = eTLD; gCookiesWindow.filter();}, 0);
  }
})();
