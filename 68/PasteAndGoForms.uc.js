// ==UserScript==
// @name           PasteAndGoForms.uc.js
// @description    PasteAndGoForms
// @include        main
// @compatibility  Firefox 60
// @version        2018/10/25 21:30 e10s
// @Note
// ==/UserScript==
var PasteAndGoForms = {

  init: function () {
    let win = window, doc = win.document;
    var item, menu = doc.getElementById("contentAreaContextMenu");
    menu.addEventListener("popupshowing", function () {
      if (!item)
        return;
      if (win.gContextMenu.onTextInput && win.gContextMenu.onKeywordField) {
        item.hidden = false;
        let controller = doc.commandDispatcher.getControllerForCommand("cmd_paste");
        let enabled = controller.isCommandEnabled("cmd_paste");
        if (enabled)
          item.removeAttribute("disabled");
        else
          item.setAttribute("disabled", "true");
      } else
        item.hidden = true;
    }, false);

    item = doc.createElement("menuitem");
    item.setAttribute("id", "context-pasteandgo-forms");
    let label = doc.getElementById("searchbar")._stringBundle.getString("cmd_pasteAndSearch");
    item.setAttribute("label", label);
    item.setAttribute("oncommand", "PasteAndGoForms.doCommand();");
    var pasteItem = doc.getElementById("context-paste");
    menu.insertBefore(item, pasteItem.nextSibling);

    let framescript = {
      init: function() {
        addMessageListener("PasteAndGoForms.doPasteAndSubmit", this);
      },
      receiveMessage: function(message) {
        switch(message.name) {
          case "PasteAndGoForms.doPasteAndSubmit":
           this.doPasteAndSubmit(message.data.targetSelectors, message.data.str)
           break;
        }
      },
      doPasteAndSubmit: function(selectors, str) {
        let target = null;
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
            if (!elem.disabled) {
              target = elem;
            }
            break;
          } else if (/input/.test(elem.nodeName.toLowerCase())) {
            if (/file|text|search|tel|url|email|password|datetime|date|month|week|time|datetime-local|number/.test(elem.type) || !elem.type) {
              if (!elem.disabled) {
                target = elem;
              }
            }
            break;
          }
        }
        if(target) {
          target.select();
          target.value = str;
          target.form.submit();
        }
      },
    };
    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource() + ".init()")
      , true, true);
  },

  doCommand: function() {
    if (typeof gContextMenu == "object" && gContextMenu != null) {
      let json = {
        targetSelectors: gContextMenu.targetSelectors,
        str: readFromClipboard()
      }
      gBrowser.selectedBrowser.messageManager.
        sendAsyncMessage("PasteAndGoForms.doPasteAndSubmit", json);
    }
  }
};
PasteAndGoForms.init();
