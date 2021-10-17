// ==UserScript==
// @name          selectAllTabs_then_popup_tabContextMenu.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Right(middle)-clicking on the "Select all tabs" menu will show the context menu of the related tabs after selecting them.
// @include       main
// @compatibility Firefox 78+
// @author        alice0775
// @version       2021/10/18 00:00
// ==/UserScript==

  window.selectAllTabs_tabContextMenu = function(event, menuitem, aTab) {
    gBrowser.selectAllTabs();
    if (event.button != 0) {
      setTimeout((x, y)=>{
        let popup = menuitem.parentNode;
        let rect = popup.getBoundingClientRect();
        document.getElementById('tabContextMenu').openPopup(null, "", rect.x, rect.y, true, false);
      },0, event, menuitem, aTab);
    }
  }
  document.getElementById("context_selectAllTabs")
           .setAttribute("oncommand", "selectAllTabs_tabContextMenu(event, this, TabContextMenu.contextTab);");
