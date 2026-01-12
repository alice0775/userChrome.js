// ==UserScript==
// @name           ReplaceAndGoForms.uc.js
// @description    ReplaceAndGoForms
// @include        main
// @async          true
// @compatibility  Firefox 149
// @version        2026/01/13 00:00 compatibility 149 from 148
// @version        2026/01/07 Bug 2008041 - Make XUL disabled / checked attributes html-style boolean attributes.
// @version        2025/01/04 modify framescript2
// @version        2025/01/04 modify framescript
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2023/11/26 18:00 do not check onKeywordField
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
      if (win.gContextMenu.onTextInput /*&& win.gContextMenu.onKeywordField*/) {
        item.hidden = false;
        let controller = doc.commandDispatcher.getControllerForCommand("cmd_paste");
        let enabled = controller.isCommandEnabled("cmd_paste");
        item.toggleAttribute("disabled", enabled);
      } else
        item.hidden = true;
    }, false);
    

    item = doc.createXULElement("menuitem");
    item.setAttribute("id", "context-pasteandgo-forms");
    let label = "Replace and Submit";//doc.getElementById("searchbar")._stringBundle.getString("cmd_pasteAndSearch");
    item.setAttribute("label", label);
    item.setAttribute("accesskey", "R");
    item.addEventListener("command", () => ReplaceAndGoForms.doCommand());
    //item.setAttribute("oncommand", "ReplaceAndGoForms.doCommand();");
    var pasteItem = doc.getElementById("context-paste");
    menu.insertBefore(item, pasteItem.nextSibling);

    function framescript() {
      const lazy = {};
      ChromeUtils.defineESModuleGetters(lazy, {
        ContentDOMReference: "resource://gre/modules/ContentDOMReference.sys.mjs",
      });

      addMessageListener("ReplaceAndGoForms.doPasteAndSubmit", doPasteAndSubmit);

      function doPasteAndSubmit(message) {
        //Services.console.logStringMessage("ReplaceAndGoForms.doPasteAndSubmit");
        let target =  lazy.ContentDOMReference.resolve(message.data.targetIdentifier);
        if(target) {
          /*
          let str = message.data.str;
          target.select();
          target.value = str;
          */
          content.document.execCommand("paste")
          target.form.submit();
        }
      }
    }

    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toString())
        + encodeURIComponent("framescript();")
      , true, true);
  },

  doCommand: function() {
    if (typeof gContextMenu == "object" && gContextMenu != null) {
      let json = {
        targetIdentifier: gContextMenu.targetIdentifier,
        //str: readFromClipboard()
      }
      gBrowser.selectedBrowser.messageManager.
        sendAsyncMessage("ReplaceAndGoForms.doPasteAndSubmit", json);
    }
  }
};
ReplaceAndGoForms.init();
