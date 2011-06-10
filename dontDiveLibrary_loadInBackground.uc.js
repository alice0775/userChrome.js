// ==UserScript==
// @name           dontDiveLibrary_loadInBackground.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    中クリックでライブラリが背面にならないように
// @include        chrome://browser/content/places/places.xul
// @compatibility  Firefox 3.0 3.1
// @author         Alice0775
// @version        2009/01/07
// @Note           browser.tabs.loadDivertedInBackground
// ==/UserScript==

(function(){
  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    // このコードを実行しているアプリケーションの名前を取得する
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }
  if (getVer() < 4) {
    try {
      var func = openUILinkIn.toString();
      func = func.replace(
      'focusElement(w.content);',
      'if(!getBoolPref("browser.tabs.loadDivertedInBackground", false)) focusElement(w.content);'
      )
      eval('openUILinkIn = '+ func);
    } catch(e){}
  } else {
  //4.0
    try {
      var func = openLinkIn.toString();
      func = func.replace(
      'w.gBrowser.selectedBrowser.focus();',
      'if(!getBoolPref("browser.tabs.loadDivertedInBackground", false)) w.gBrowser.selectedBrowser.focus();'
      )
      eval('openLinkIn = '+ func);
    } catch(e){}
  }
})();