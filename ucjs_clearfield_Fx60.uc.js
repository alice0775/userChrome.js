// ==UserScript==
// @name           ucjs_clearfield_Fx60.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    テキストエリア等,Findbar, Serachbarコンテキストメニューにクリアを追加
// @include        *
// @compatibility  Firefox 60
// @author         Alice0775
// @version        2018/10/24 21:30 Firefox60 e10s
// @Note
// ==/UserScript==
var ucjs_clearfield = {
  init: function() {
    let framescript = {
      init: function() {
        addMessageListener("ucjs_clearfield.isMenuEnable", this);
        addMessageListener("ucjs_clearfield.doClear", this);
      },
      receiveMessage: function(message) {
        switch(message.name) {
          case "ucjs_clearfield.isMenuEnable":
           this.isMenuEnable(message.data.targetSelectors)
           break;
          case "ucjs_clearfield.doClear":
           this.doClear(message.data.targetSelectors)
           break;
        }
      },
      isMenuEnable: function(selectors) {
        let hidden = true;
        let enable = false;
        let win = content;
        let doc = win.document;
        for (let i = 0; i < selectors.length; i++) {
          let elem = doc.querySelector(selectors[i]);
          if (!elem)
            continue;
          if (/iframe|frame/.test(elem.nodeName.toLowerCase())) {
            win = elem.contentWindow;
            doc = elem.contentDocument;
          } else if (elem.shadowRoot != null) {
            doc = elem.shadowRoot;
          } else if (/textarea/.test(elem.nodeName.toLowerCase())) {
            if (!elem.disable) {
              hidden = false;
              enable = !!elem.value;
            }
            break;
          } else if (/input/.test(elem.nodeName.toLowerCase())) {
            if (!elem.disable &&
                (/file|text|search|tel|url|email|password|datetime|date|month|week|time|datetime-local|number/.test(elem.type) ||
                 !elem.type)) {
              hidden = false;
              enable = !!elem.value;
            }
            break;
          }
        }
        sendSyncMessage("ucjs_clearfield.menuEnabled", {isHidden: hidden, isEnable: enable});
      },
      doClear: function(selectors) {
        let win = content;
        let doc = win.document;
        for (let i = 0; i < selectors.length; i++) {
          let elem = doc.querySelector(selectors[i]);
          if (!elem)
            continue;
          if (/iframe|frame/.test(elem.nodeName.toLowerCase())) {
            win = elem.contentWindow;
            doc = elem.contentDocument;
          } else if (elem.shadowRoot != null) {
            doc = elem.shadowRoot;
          } else if (/textarea/.test(elem.nodeName.toLowerCase())) {
            /*
            if (!elem.disable)
              elem.value = "";
            */
            break;
          } else if (/input/.test(elem.nodeName.toLowerCase())) {
            if (!elem.disable &&
                (/file/.test(elem.type)))
              elem.value = "";
            break;
          }
        }
      }
    };
    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource() + ".init()")
      , true, true);

    messageManager.addMessageListener("ucjs_clearfield.menuEnabled", this);
    window.addEventListener("unload", this, false);
    window.addEventListener("popupshowing", this, false);
  },

  uninit: function() {
    messageManager.removeMessageListener("ucjs_clearfield.menuEnabled", this);
    window.removeEventListener("unload", this, false);
    window.removeEventListener("popupshowing", this, false);
  },

  receiveMessage: function(message) {
    switch(message.name) {
      case "ucjs_clearfield.menuEnabled":
      this.menuitem.hidden = message.data.ishidden;
      this.menuitem.disabled= !message.data.isEnable;
      break;
    }
  },

  handleEvent: function(event) {
    switch(event.type) {
      case 'popupshowing':
        this.popupContextMenu(event);
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
        let UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
          createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        UI.charset = "UTF-8";
        menuitem = document.createElement("menuitem");
        menuitem.setAttribute("anonid", "ucjs_clearfield_menu");
        let l = "クリア";
        try {l = UI.ConvertToUnicode(l)} catch(e){}
        menuitem.setAttribute("label", l);
        menuitem.setAttribute("accesskey","X");
        menuitem.setAttribute("oncommand", "ucjs_clearfield.doClear(this);");
        ref.parentNode.insertBefore(menuitem, ref);
      }
      ref = popup.querySelector('[cmd="cmd_cut"]') || popup.querySelector('[command="cmd_cut"]');
      menuitem.hidden = ref.hidden;
      menuitem.disabled = !event.target.value;
      this.menuitem = menuitem;
      // content area
      if (typeof gContextMenu == "object" && gContextMenu != null) {
        let json = {
          targetSelectors: gContextMenu.targetSelectors
        }
        gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjs_clearfield.isMenuEnable", json);
      }
    }
  },

  doClear: function() {
    //if (typeof gContextMenu != "object" || gContextMenu == null) {
      goDoCommand('cmd_selectAll');
      setTimeout(() => {
        goDoCommand('cmd_delete');
      }, 250);
    //} else {
    if (typeof gContextMenu == "object" && gContextMenu != null) {
      //in case of <input type="file">
      let json = {
        targetSelectors: gContextMenu.targetSelectors
      }
      this.menuitem.hidden = !gContextMenu.onTextInput;
      gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjs_clearfield.doClear", json);
    }
  }
}

ucjs_clearfield.init();
