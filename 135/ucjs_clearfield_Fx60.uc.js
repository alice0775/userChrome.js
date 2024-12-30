// ==UserScript==
// @name           ucjs_clearfield_Fx60.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    テキストエリア等,Findbar, Serachbarコンテキストメニューにクリアを追加
// @include        *
// @compatibility  Firefox 135
// @author         Alice0775
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2022/03/25 08:30 remove ns IScriptableUnicodeConverter
// @version        2021/06/03 01:00 simplified
// @version        2021/06/03 00:00 Fix incorrect menu state due to Bug 1588773
// @version        2020/09/24 00:00 Fix context menu
// @version        2019/11/14 00:00 Fix undefined error
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/10/27 10:30 fix findbar
// @version        2018/10/24 23:30 typo
// @version        2018/10/24 21:30 Firefox60 e10s
// @Note
// ==/UserScript==
var ucjs_clearfield = {
  init: function() {
    window.addEventListener("unload", this, false);
    window.addEventListener("popupshowing", this, false);
    window.addEventListener("popupshown", this, false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    window.removeEventListener("popupshowing", this, false);
    window.removeEventListener("popupshown", this, false);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case 'popupshowing':
        this.popupContextMenu(event);
        break;
      case 'popupshown':
        this.popupContextMenuVisibility(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  popupContextMenu: function(event) {
    let popup = event.originalTarget;
    let ref = popup.querySelector('[cmd="cmd_cut"]') || popup.querySelector('[command="cmd_cut"]');
    if (ref) {
      let menuitem = popup.querySelector('[anonid="ucjs_clearfield_menu"]');
      if (!menuitem) {
        menuitem = document.createXULElement("menuitem");
        menuitem.setAttribute("anonid", "ucjs_clearfield_menu");
        let l = "クリア";
        menuitem.setAttribute("label", l);
        menuitem.setAttribute("accesskey","X");
        menuitem.addEventListener("command", (event) => event.target.ownerGlobal.ucjs_clearfield.doClear());
        //menuitem.setAttribute("oncommand", "ucjs_clearfield.doClear(this);");
        ref.parentNode.insertBefore(menuitem, ref);
      }
      this.popupContextMenuVisibility(event);
    }
  },
  
  popupContextMenuVisibility: function(event) {
    let popup = event.originalTarget;
    let menuitem = popup.querySelector('[anonid="ucjs_clearfield_menu"]');
    if (menuitem) {
      let ref = popup.querySelector('[cmd="cmd_cut"]') || popup.querySelector('[command="cmd_cut"]');
      menuitem.hidden = ref ? ref.hidden : ture;
      ref = popup.querySelector('[cmd="cmd_selectAll"]') || popup.querySelector('[command="cmd_selectAll"]');
      menuitem.disabled = ref?.disabled;
    }
  },

  doClear: function() {
    goDoCommand('cmd_selectAll');
    setTimeout(() => {
      goDoCommand('cmd_delete');
    }, 50);
  }
}

ucjs_clearfield.init();
