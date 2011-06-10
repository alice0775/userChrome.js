// ==UserScript==
// @name           closeBlankTabOnCloseGreasemonkeyInstall.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ダウンロードをした際に、空白のタブを自動で閉じる
// @include        chrome://greasemonkey/content/install.xul
// @author         Alice0775
// @compatibility  4.0b8pre
// @version        2010/10/12 11:00 by Alice0775  4.0b8pre
// @version        2009/04/29 00:00 空白タブを削除する前にもう一度チェック
// ==/UserScript==
// @Note
// @version        2007/07/26 03:00
(function() {
  //ブラウザ
  const WINMAN = Components.classes['@mozilla.org/appshell/window-mediator;1']
  .getService(Components.interfaces.nsIWindowMediator);
  if('tablib' in WINMAN.getMostRecentWindow(null)) return;
  function closeBlankTabOnCloseGreasemonkeyInstall(event){
    //ブラウザ
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    var tab = browserWindow.getBrowser().mTabs;
    var max = tab.length;
    if(max <= 1) return;
    for(var i = max -1 ;i > -1 ; i--) {
      var aTab = tab[i];
     if ( aTab.hasAttribute('busy')
          || aTab.linkedBrowser.docShell.busyFlags
          || aTab.linkedBrowser.docShell.restoringDocument
          || !aTab.linkedBrowser.webNavigation.currentURI
          || aTab.linkedBrowser.currentURI.spec != 'about:blank'
          || aTab.getAttribute('ontap') == 'true') {
        continue;
      }
       aTab.ownerDocument.defaultView.gBrowser.removeTab(aTab);
      return;
    }
    window.removeEventListener('unload',function(event){closeBlankTabOnCloseGreasemonkeyInstall(event);},false);
  }
  window.addEventListener('unload',function(event){closeBlankTabOnCloseGreasemonkeyInstall(event);},false);
})();
