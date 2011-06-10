// ==UserScript==
// @name           closeBlankTabOnCloseDownloadDialog.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ダウンロードをした際に、空白のタブを自動で閉じる
// @include        main
// @author         Alice0775
// @compatibility  4.0b8pre
// @version        2010/10/12 11:00 by Alice0775  4.0b8pre
// @version        2009/04/29 00:00 空白タブを削除する前にもう一度チェック
// @Note           need 000-windowhook.uc.js
// ==/UserScript==
// @version        2008/04/15 12:00 メインウインドウが複数合った場合に動作しないのを修正
// @version        2008/03/29 12:00 trunkで保存できない場合があったのでWindowHookにした

if(!('TM_init' in window))
WindowHook.register("chrome://mozapps/content/downloads/unknownContentType.xul",
  function(aWindow) {
    aWindow.addEventListener('unload',closeBlankTabOnCloseDownloadDialog,false);
    function closeBlankTabOnCloseDownloadDialog(event) {
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
      var browserWindow = wm.getMostRecentWindow("navigator:browser");
      //ブラウザ
      var tab = browserWindow.gBrowser.mTabs;
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
    }
  }
);
