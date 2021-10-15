// ==UserScript==
// @name           clearInputFormHistory.uc.js
// @description    clearInputFormHistory
// @include        main
// @compatibility  Firefox 95
// @version       2021/10/15 00:00 @compatibility 95, Addressed "Services" not being loaded in frame scripts (Bug 1708243).
// @version        2020/08/23
// ==/UserScript==
var clearInputFormHistory = {

  init: function () {
    const { FormHistory } = ChromeUtils.import(
        "resource://gre/modules/FormHistory.jsm",
    );
    this.FormHistory = FormHistory;
    delete FormHistory;
    let menu = document.getElementById("contentAreaContextMenu");
    let item = document.createXULElement("menuitem");
    item.setAttribute("id", "context-clearInputFormHistory");
    item.setAttribute("label", "Clear Form History");
    item.setAttribute("accessKey", "H");
    item.setAttribute("oncommand", "clearInputFormHistory.doCommand();");
    let refItem = document.getElementById("context-keywordfield");
    menu.insertBefore(item, refItem.nextSibling);
    this.menuitem = item;
    
    menu.addEventListener("popupshowing", this, false);
    messageManager.addMessageListener("clearInputFormHistory.doCommand", this);

    let framescript = {
      init: function() {
        const { ContentDOMReference } = ChromeUtils.import(
            "resource://gre/modules/ContentDOMReference.jsm"
        );
        this.ContentDOMReference = ContentDOMReference;
        delete ContentDOMReference;
	      /*
	      const { Services } = ChromeUtils.import(
	        "resource://gre/modules/Services.jsm"
	      );
        this.Services = Services;
        delete Services;
        */
        addMessageListener("clearInputFormHistory.getFieldName", this);
      },

      receiveMessage: function(message) {
       //this.Services.console.logStringMessage("==message.name:" + message.name);
        switch(message.name) {
          case "clearInputFormHistory.getFieldName":
            let targetIdentifier = message.data.targetIdentifier;
            let target =  this.ContentDOMReference.resolve(targetIdentifier);
            let fieldName = target?.name || target?.id;
            let json = {name: fieldName};
            sendSyncMessage("clearInputFormHistory.doCommand", json );
            break;
        }
      }
    };

    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource() + ".init()")
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
          await new Promise((resolve, reject) => {
            this.FormHistory.update(
              { op: "remove", fieldname: name  },
              {
                handleError(error) { reject(error); },
                handleCompletion(reason) {
                  if (!reason) {
                    resolve();
                  } else {
                    reject();
                  }
                },
              }
            );
          });
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
