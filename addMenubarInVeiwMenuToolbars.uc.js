// ==UserScript==
// @name           addMenubarInVeiwMenuToolbars.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Veiw > ToolbarsにMenubarを表示
// @include        main
// @compatibility  Firefox 3.5 only
// @author         Alice0775
// @version        2009/07/30
// ==/UserScript==
(function(){
  // バージョンが3.5でないなら何もしない
  if (Components.classes["@mozilla.org/xre/app-info;1"].
      getService(Components.interfaces.nsIXULAppInfo).version.substr(0,3) != "3.5")
    return;

  gNavToolbox.childNodes[0].setAttribute("toolbarname", "Menubar");

  var func = onViewToolbarsPopupShowing.toString();
  func = func.replace(
  'type != "menubar"',
  'true'
  );
  eval("window.onViewToolbarsPopupShowing = " + func);
})();