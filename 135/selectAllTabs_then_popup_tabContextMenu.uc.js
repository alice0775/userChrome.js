// ==UserScript==
// @name          selectAllTabs_then_popup_tabContextMenu.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Right(middle)-clicking on the "Select all tabs" menu will show the context menu of the related tabs after selecting them.
// @include       main
// @compatibility Firefox 135
// @author        alice0775
// @version       2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version       2021/10/18 00:00
// ==/UserScript==

  window.selectAllTabs_tabContextMenu = function(event, menuitem) {
    gBrowser.selectAllTabs();
    if (event.button != 0) {
      setTimeout((x, y)=>{
        let popup = menuitem.parentNode;
        let rect = popup.getBoundingClientRect();
        document.getElementById('tabContextMenu').openPopup(null, "", rect.x, rect.y, true, false);
      },0, event, menuitem);
    }
  }
  document.getElementById("context_selectAllTabs")
           .addEventListener("command", (event) => selectAllTabs_tabContextMenu(event, document.getElementById("context_selectAllTabs")));
/*  document.getElementById("context_selectAllTabs")
           .setAttribute("oncommand", "selectAllTabs_tabContextMenu(event, this);");
*/