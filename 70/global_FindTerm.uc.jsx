// ==UserScript==
// @name           global_FindTerm.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    find-label: left click:copy selected text, middle click:clear findbar
// @include        main
// @compatibility  Firefox 56+
// @author         Alice0775
// @version        2018/09/15 15:00 remove unused global_FindTerm
// @version        2018/09/15 15:00 fix quickfind
// @version        2018/09/10 18:00 e10s
// @version        2016/03/31 18:00 Bug 1134769
// @version        2016/03/07 08:00 Bug 1134769
// @version        2015/08/07 08:00 fix a bug copy term
// @version        2015/02/09 23:00 fix a bug copy term
// @version        2015/01/09 08:00 workaround
// @version        2014/10/19 18:00 fix XUL/migemo UI updates
// @version        2014/10/18 18:00 fix a bug
// @version        2014/10/18 08:00 fix a bug
// @version        2014/10/15 12:00 36
// ==/UserScript==

var global_FindTerm = {
  init : function() {
    gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
      this.injectButton();
    }.bind(this));

    function frameScript() {
      addMessageListener("global_FindTerm_getSelectedText", messageListener);
      function messageListener() {
        let sel = content.getSelection();
        let data = {text: sel.toString()}
        sendSyncMessage("global_FindTerm_selectionData", data);
      }
    }
    let frameScriptURI = 'data:application/javascript,'
      + encodeURIComponent('(' + frameScript.toString() + ')()');
    window.messageManager.loadFrameScript(frameScriptURI, true);
    window.messageManager.addMessageListener("global_FindTerm_selectionData", this);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'TabFindInitialized':
        this.injectButton();
        break;
      case 'click':
        this.clickFindbar(event);
        break;
    }
  },

  receiveMessage: function(message) {
     switch (message.name) {
       case 'global_FindTerm_selectionData':
         //Services.console.logStringMessage("receiveMessage global_FindTerm_selectionData");
         this.copySelectedTextToFindbar(message);
         return {};
    }
    return {};
  },

  injectButton: function() {
    let container = gFindBar.getElement("findbar-container");
    let label = container.firstChild;
    if (label.localName == "label")
      return;

    label = document.createElement("label");
    label.setAttribute("id", "findlabel");
    label.setAttribute("value", "Find:");
    label.setAttribute("tooltiptext", "Left click: selected text, Right click: clear");
    container.insertBefore(label, container.firstChild);

    label.addEventListener("click", this, true);
  },

  clickFindbar: function(event) {
    var sel;
    switch (event.button) {
      case 0:
        gBrowser.selectedTab.linkedBrowser.messageManager.sendAsyncMessage("global_FindTerm_getSelectedText");
       return;
       break;
      case 1:
       return;
      case 2:
       sel = "";
    }

    this.setTerm(sel);
    this.selectFindField();

  },

  copySelectedTextToFindbar: function(message) {
    this.setTerm(message.data.text);
    this.selectFindField();
  },

  setTerm: function(val) {
    var oldVal= gFindBar._findField.value;
    if (oldVal != val) {
	    gFindBar._findField.value = val;
      gFindBar._updateFindUI();
    }
    if ("historyFindbar" in window) {
       historyFindbar._findField2.value = val;
    }
  },

  selectFindField: function() {
    setTimeout(function() {
	    if ("historyFindbar" in window) {
	       historyFindbar._findField2.focus();
	       historyFindbar._findField2.select();
	    } else {
		    gFindBar._findField.focus();
		    gFindBar._findField.select();
	    }
    }, 0);
  }
}

global_FindTerm.init();
