// ==UserScript==
// @name           clearInputFormHistory.uc.js
// @description    clearInputFormHistory
// @include        main
// @async          true
// @compatibility  Firefox 135
// @version        2025/01/04 modify framescript
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2023/07/17 00:00 use ES module imports
// @version        2022/08/19 00:00 remove "Services" from frame scripts
// @version        2021/10/15 00:00 @compatibility 95, Addressed "Services" not being loaded in frame scripts (Bug 1708243).
// @version        2020/08/23
// ==/UserScript==
var clearInputFormHistory = {

  init: function () {
    this.lazy = {};
    ChromeUtils.defineESModuleGetters(this.lazy, {
      FormHistory: "resource://gre/modules/FormHistory.sys.mjs",
    });
    let menu = document.getElementById("contentAreaContextMenu");
    let item = document.createXULElement("menuitem");
    item.setAttribute("id", "context-clearInputFormHistory");
    item.setAttribute("label", "Clear Form History");
    item.setAttribute("accessKey", "H");
    item.addEventListener("command", () => clearInputFormHistory.doCommand());
    //item.setAttribute("oncommand", "clearInputFormHistory.doCommand();");
    let refItem = document.getElementById("context-keywordfield");
    menu.insertBefore(item, refItem.nextSibling);
    this.menuitem = item;
    
    menu.addEventListener("popupshowing", this, false);
    messageManager.addMessageListener("clearInputFormHistory.doCommand", this);

    function framescript() {
      const lazy = {};
      ChromeUtils.defineESModuleGetters(lazy, {
        ContentDOMReference: "resource://gre/modules/ContentDOMReference.sys.mjs",
      });
      addMessageListener("clearInputFormHistory.getFieldName", receiveMessage);

      function receiveMessage(message) {
       //this.Services.console.logStringMessage("==message.name:" + message.name);
        switch(message.name) {
          case "clearInputFormHistory.getFieldName":
            let target =  lazy.ContentDOMReference.resolve(message.data.targetIdentifier);
            let fieldName = target?.name || target?.id;
            let json = {name: fieldName};
            sendSyncMessage("clearInputFormHistory.doCommand", json );
            break;
        }
      }
    }
    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource())
        + encodeURIComponent("framescript();")
      , true, true);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "popupshowing":
        if (!this.menuitem)
          return;
          this.menuitem.hidden =
               !(gContextMenu.onTextInput);// && gContextMenu.onKeywordField);
        break;
    }
  },

  receiveMessage: async function(message) {
    switch(message.name) {
      case "clearInputFormHistory.doCommand":
        let name = message.data.name;
        //Services.console.logStringMessage("==name:" + name);
        if(name) {
            await this.lazy.FormHistory.update({ op: "remove", fieldname: name  });
        }
        break;
    }
  },
  
  doCommand: function() {
    if (typeof gContextMenu == "object" && gContextMenu != null) {
      let json = {
        targetIdentifier: gContextMenu.targetIdentifier,
      }
      gBrowser.selectedBrowser.messageManager.
        sendAsyncMessage("clearInputFormHistory.getFieldName", json);
    }
  }
};
clearInputFormHistory.init();
