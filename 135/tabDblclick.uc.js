// ==UserScript==
// @name           tabDblclick.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    adds functions according to the double click position of the tab
// @include        main
// @async          true
// @compatibility  Firefox 102
// @author         Alice0775
// @version        2021/09/25 20:00 cleanup
// ==/UserScript==

let tabDblclick = function(){
  var reloadFlags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
  var reloadFlagsNoCache = Ci.nsIWebNavigation.LOAD_FLAGS_BYPASS_PROXY | Ci.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE;
  function dclick(aEvent) {
    if (aEvent.button != 0 || aEvent.detail != 2 ) return;
    if (aEvent.originalTarget.classList.contains('tab-close-button') ||
        aEvent.originalTarget.classList.contains('toolbarbutton-icon'))
    return;
    var tab = aEvent.originalTarget.closest("tab");
    if (!tab)
      return;

    aEvent.stopPropagation();
    //aEvent.preventDefault();

    var icon =  tab.iconImage;
//console.log(icon.getClientRects())
    let rect = icon.getBoundingClientRect();
    var iconX = tab.screenX + rect.left;
    var iconW = 24; //rect.width;

    var x = aEvent.screenX;
    var y = aEvent.screenY;
    var tabx = tab.screenX;
    var taby = tab.screenY;
    var tabw = tab.clientWidth;
    var tabh = tab.clientHeight;

    if (x < tabx) {
      return;
    } else if (x < iconW + tabx && y <= taby + tabh / 2) {
      if (typeof gBrowser.lockTab != 'undefined') {
        //タブをロック
        gBrowser.lockTab(tab);
      }else {
        return;
      }
    } else if (x < tabx + iconW && taby + tabh / 2 < y && y <= taby + tabh) {
      if (typeof gBrowser.protectTab != 'undefined') {
        //タブを保護
        gBrowser.protectTab(tab);
      } else {
        return;
      }
    } else if (x <= tabx + tabw) {
      //fabicon右端～タブ幅の範囲
      //タブを再読み込み
      if (tab.selected && !tab.hasAttribute("busy")) {
        if (!aEvent.altKey) {
          document.getElementById("Browser:Reload").doCommand();
        } else {
          document.getElementById("Browser:ReloadSkipCache").doCommand();
        }
      } else {
          /*gBrowser.reloadTab(tab);*/
      }
    }
  }
  gBrowser.tabContainer.addEventListener("dblclick", dclick, true);

};


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  tabDblclick();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      tabDblclick();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}


