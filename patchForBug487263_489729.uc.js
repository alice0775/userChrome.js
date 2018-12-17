// ==UserScript==
// @name           patchForBug487263_489729.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround for Bug 487263 - dragging a tab up or over the tab bar then out of the window does not detach & Bug 489729 - Clicking a tab once and then moving your mouse in a downward motion causes a new window to open.
// @include        main
// @compatibility  Firefox 60+
// @author         Alice0775
// @version        2018/12/17 01:00 check shiftKey etc
// @version        2016/02/07 01:00 stop tab detach
// @version        2009/05/02 19:00 ブラウザの外へのタブ分離と, センシビリティの改善
// ==/UserScript==

gBrowser.tabContainer.addEventListener("dragend", function(event) {
  var dt = event.dataTransfer;
  if (dt.mozTypesAt(0)[0] == TAB_DROP_TYPE) { // tab copy or move
    if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey)
      return;
    var draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
    // our drop then
    if (draggedTab) {
      delete draggedTab._dragData;
    }
  }
}, true);
