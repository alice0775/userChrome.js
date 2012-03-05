// ==UserScript==
// @name           tabDblclick.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    adds functions according to the double click position of the tab
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0 7.0
// @author         Alice0775
// @version        2012/02/25 23:00 幅
// @version        2012/02/10 10:00 tab-icon-imageも見るように
// @version        2012/01/31 11:00 by Alice0775  12.0a1 about:newtab
// @version        2011/08/29 11:50 tree_style_tab
// @version        2011/06/08 11:50 tree_style_tab-0.12.2011060202
// @version        2010/08/12 Bug 574217 - Land TabCandy on trunk
// @version        2010/03/29 02:30 tree_style_tab-0.10.2010032802
// @version        2010/02/09 18:30 tab-icon-imageも見るように
// @version        2010/02/08 19:00 Tree Style Tab のtwistyの処理が変わったようなので修正
// @version        2010/01/01 00:40 タブが１枚だけの時 double click を拾えない(thanks 音吉)
// @version        2009/09/10 22:40 mmm e.detailを使うようにした
// ==/UserScript==
// @Note
// @version        2009/03/03 22:40 about:blankならhome表示
// @version        2008/11/26 selectPrevTabOnClickSelectedTab.uc.jsとの整合
// @version        2008/01/30 23:00
(function(){
  function dclick(aEvent) {
   var  reloadFlags;
    if (!(aEvent.button == 0 && aEvent.detail == 2)) return;
    if (aEvent.originalTarget.className == 'tab-close-button' ||
        aEvent.originalTarget.className == 'toolbarbutton-icon')
      return ;
    var tab = document.evaluate(
                'ancestor-or-self::*[local-name()="tab"]',
                aEvent.originalTarget,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
    if (!tab)
      return;

    aEvent.stopPropagation();
    //aEvent.preventDefault();

    //load home if blank
    if (!tab.linkedBrowser.docShell.busyFlags
        && !tab.linkedBrowser.docShell.restoringDocument
        && ("isBlankPageURL" in window ? isBlankPageURL(tab.linkedBrowser.contentDocument.URL) : tab.linkedBrowser.contentDocument.URL == "about:blank")){
      document.getElementById("Browser:Home").doCommand();
      return;
    }

    var icon = document.getAnonymousElementByAttribute(
                 tab, 'class', 'tab-icon') ||
               document.getAnonymousElementByAttribute(
                 tab, 'class', 'tab-icon-image');
    var iconX = icon.boxObject.screenX;
    var iconW = icon.boxObject.width;

    var x = aEvent.screenX;
    var y = aEvent.screenY;
    var tabx = iconX;
    var taby = tab.boxObject.screenY;
    var tabw = tab.boxObject.width - (tab.boxObject.screenX - iconX + iconW);
    var tabh = tab.boxObject.height;

    if (x < tabx) {
      return;
    } else if (x < iconW + tabx && y < taby + tabh / 2) {
      if (typeof gBrowser.lockTab != 'undefined') {
        //タブをロック
        gBrowser.lockTab(tab);
      }else {
        return;
      }
    } else if (x < iconW + tabx && taby + tabh / 2 < y && y < taby + tabh) {
      if (typeof gBrowser.protectTab != 'undefined') {
        //タブを保護
        gBrowser.protectTab(tab);
      } else {
        return;
      }
    } else if (x < iconW + tabx + tabw * 0.3) {
      //fabicon右端～タブ幅の0.3倍の範囲
      //タブを再読み込み
      if (aEvent.altKey) {
        // Bypass proxy and cache.
        tab.linkedBrowser.reloadWithFlags(nsIWebNavigation.LOAD_FLAGS_BYPASS_PROXY | nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE);
      } else {
        gBrowser.reloadTab(tab);
      }
    } else if (x <= tab.boxObject.screenX + tab.boxObject.width - 18) {
      //タブ幅の0.3倍～右端から18pxの範囲
      //タブを再読み込み
      if (aEvent.altKey) {
        // Bypass proxy and cache.
        tab.linkedBrowser.reloadWithFlags(nsIWebNavigation.LOAD_FLAGS_BYPASS_PROXY | nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE);
      } else {
        gBrowser.reloadTab(tab);
      }
    } else if (x > tab.boxObject.screenX + tab.boxObject.width - 18) {
      //右端から18pxの範囲
      //すべてのタブを再読み込み
      if (aEvent.altKey) {
        // Bypass proxy and cache.
        var l = gBrowser.mPanelContainer.childNodes.length;
        for (var i = 0; i < l; i++) {
          if (gBrowser.mPanelContainer.childNodes[i].getAttribute("hidden"))
            continue;
          try {
            gBrowser.getBrowserAtIndex(i).reloadWithFlags(nsIWebNavigation.LOAD_FLAGS_BYPASS_PROXY | nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE);
          } catch (e) {
            // ignore failure to reload so others will be reloaded
          }
        }
      } else {
        gBrowser.reloadAllTabs();
      }
    }
  }
  gBrowser.tabContainer.addEventListener("click", dclick, true);

  // xxx Tree Style Tab
  window.tabDblclickTimeWait = 800;
  window.tabDblclickmousedownTime = 0;
  window.addEventListener("mousedown", mousedown, true);
  function mousedown(aEvent) {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser");
    mainWindow.tabDblclickmousedownTime = new Date().getTime();
  }

  window.tabDblclickisIcon = function isIcon(aEvent) {
    var tab = aEvent.originalTarget.ownerDocument.evaluate(
                'ancestor-or-self::*[local-name()="tab"]',
                aEvent.originalTarget,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
    if (!tab)
      return false;

    var icon = aEvent.originalTarget.ownerDocument.getAnonymousElementByAttribute(
                 tab, 'class', 'tab-icon') ||
               aEvent.originalTarget.ownerDocument.getAnonymousElementByAttribute(
                 tab, 'class', 'tab-icon-image');
    var iconX = icon.boxObject.screenX;
    var iconW = icon.boxObject.width;
    var x = aEvent.screenX;
    return ( iconX < x && x < iconX + iconW);
  }
  if ("TreeStyleTabBrowser" in window) {
    var func = TreeStyleTabBrowser.prototype.onClick.toString();
    if(!/mainWindow\.tabDblclickisIcon/.test(func)) {

      func = func.replace(
        /{/,
        <><![CDATA[
        {
          var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
          var mainWindow = wm.getMostRecentWindow("navigator:browser");
          if(!mainWindow.tabDblclickisIcon(aEvent) || new Date().getTime() - mainWindow.tabDblclickmousedownTime > mainWindow.tabDblclickTimeWait){
          } else {
            return;
          }
       ]]></>
      );
      eval("TreeStyleTabBrowser.prototype.onClick = " + func);
    }
  }
  
})();
