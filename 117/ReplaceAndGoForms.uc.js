// ==UserScript==
// @name           ReplaceAndGoForms.uc.js
// @description    ReplaceAndGoForms
// @include        main
// @compatibility  Firefox 117
// @version        2023/07/17 00:00 use ES module imports
// @version        2020/01/12 02:00 Use ContentDOMReference and Bug 1589328 - Remove global-scope pollution from nsContextMenu.js
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/10/25 21:30 e10s
// @Note
// ==/UserScript==
var ReplaceAndGoForms = {

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
    

    item = doc.createXULElement("menuitem");
    item.setAttribute("id", "context-pasteandgo-forms");
    let label = "Replace and Submrt";//doc.getElementById("searchbar")._stringBundle.getString("cmd_pasteAndSearch");
    item.setAttribute("label", label);
    item.setAttribute("accesskey", "R");
    item.setAttribute("oncommand", "ReplaceAndGoForms.doCommand();");
    var pasteItem = doc.getElementById("context-paste");
    menu.insertBefore(item, pasteItem.nextSibling);

    let framescript = {
      init: function() {
        ChromeUtils.defineESModuleGetters(this, {
            ContentDOMReference: "resource://gre/modules/ContentDOMReference.sys.mjs",
        });
        addMessageListener("ReplaceAndGoForms.doPasteAndSubmit", this);
      },
      receiveMessage: function(message) {
        switch(message.name) {
          case "ReplaceAndGoForms.doPasteAndSubmit":
           this.doPasteAndSubmit(message.data.targetIdentifier, message.data.str)
           break;
        }
      },
      doPasteAndSubmit: function(targetIdentifier, str) {
        let target =  this.ContentDOMReference.resolve(targetIdentifier);
        if(target) {
          /*
          target.select();
          target.value = str;
          */
          content.document.execCommand("paste")
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
        targetIdentifier: gContextMenu.targetIdentifier,
        str: readFromClipboard()
      }
      gBrowser.selectedBrowser.messageManager.
        sendAsyncMessage("ReplaceAndGoForms.doPasteAndSubmit", json);
    }
  }
};
ReplaceAndGoForms.init();
