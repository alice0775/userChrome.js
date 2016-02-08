// ==UserScript==
// @name           patchForBug487263_489729.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround for Bug 487263 - dragging a tab up or over the tab bar then out of the window does not detach & Bug 489729 - Clicking a tab once and then moving your mouse in a downward motion causes a new window to open.
// @include        main
// @compatibility  Firefox 44
// @author         Alice0775
// @version        2016/02/07 23:00 fixed TMP
// @version        2016/02/07 22:00 fixed treeStyleTab
// @version        2016/02/07 20:00 fixed tab animation
// @version        2016/02/07 01:01 var
// @version        2016/02/07 01:00 stop tab detach
// ==/UserScript==
// @version        2009/06/03 00:00 TMPとの互換, Bug 493978再考
// @version        2009/05/19 19:00 For checking-in Bug 487263
// @version        2009/05/03 19:00 コンテンエリア判定
// @version        2009/05/02 19:00 ブラウザの外へのタブ分離と, センシビリティの改善
gBrowser.tabContainer.addEventListener("dragend", function(event) {
  var dt = event.dataTransfer;
  if (dt.mozTypesAt(0)[0] == TAB_DROP_TYPE) { // tab copy or move
    var draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
    // our drop then
    if (draggedTab) {
      this._finishAnimateTabMove();
      event.preventDefault();
      event.stopPropagation();
    }
  }
}, true);

if ('treeStyleTab' in gBrowser) {
  gBrowser.treeStyleTab.tabbarDNDObserver.onTabDragEnd = function TabbarDND_onTabDragEnd(aEvent) {
    this.clearDropPosition(true);
    this.collapseAutoExpandedTabs();
  }
}

if ('TMP_tabDNDObserver' in window) {
  TMP_tabDNDObserver.onDragEnd = function TMP_tabDNDObserver_onDragEnd(aEvent) {
    var tabBar = gBrowser.tabContainer;
    if (!tabBar.useTabmixDnD(aEvent))
      tabBar._finishAnimateTabMove();
    this.clearDragmark(aEvent);
  }
}
