// ==UserScript==
// @name           global_FindTerm.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    global_FindTerm + find-label
// @include        main
// @async          true
// @compatibility  Firefox 87
// @author         Alice0775
// @version       2021/04/11 12:00 workaround: use finder.getInitialSelection
// @version       2021/02/09 20:00 fix an error when FindBar close
// @version       2021/02/09 15:01 fix use finder.getInitialSelection
// @version       2021/02/09 15:01 fix import SelectionUtils
// @version       2021/02/09 15:00 Bug 1685801 - Move most things out of BrowserUtils.jsm
// @version        2020/12/15 00:00 do find after copy text
// @version        2019/06/24 23:00 wait for gBrowser initialized
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/09/15 18:00 clean
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
  ENABLE_GLOBAL_FINDTERM : true,
  
  findTerm:"",

  init : function() {
      if (this.ENABLE_GLOBAL_FINDTERM) {
      gBrowser.tabContainer.addEventListener("TabSelect", this, false);
      window.addEventListener("findbaropen", this, false);
      window.addEventListener("find", this, false);
      window.addEventListener("findagain", this, false);
    }

    gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
      this.injectButton(event.target._findBar);
    }.bind(this));


/*
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
*/
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'TabFindInitialized':
        this.injectButton(vent.target._findBar);
        break;
      case 'findbaropen':
        this.onFndbarOpen();
        break;
      case 'find':
        // no break here;
      case 'findagain':
        if (gFindBar._findMode != gFindBar.FIND_NORMAL)
          break;
        this.findTerm = gFindBar._findField.value;
        break;
      case 'TabSelect':
        this.copyTerm();
        break;
      case 'click':
        this.copyToandClearFindbar(event);
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

	onFndbarOpen: function() {
    if (gFindBar._findMode != gFindBar.FIND_NORMAL)
      return;

    gBrowser.selectedBrowser.finder.getInitialSelection()?.then((r)=> {
      let sel = r.selectedText;

      if (!!sel)
        this.findTerm = sel;

      this.setTerm(this.findTerm);
      this.updateUI();
      this.selectFindField();
    });
	},

  copyTerm: function() {
    if(gBrowser.isFindBarInitialized(gBrowser.selectedTab) && !gFindBar.hidden) {
      if (gFindBar._findMode != gFindBar.FIND_NORMAL)
        return;

      this.setTerm(this.findTerm);
    }
  },

  injectButton: function(findBar) {
    let container = findBar.getElement("findbar-container");
    let label = container.firstChild;
    if (label.localName == "label")
      return;

    label = document.createXULElement("label");
    label.setAttribute("id", "findlabel");
    label.setAttribute("value", "Find:");
    label.setAttribute("tooltiptext", "Left click: selected text, Right click: clear");
    container.insertBefore(label, container.firstChild);

    label.addEventListener("click", this, true);
  },

  updateUI: function() {
    try {
      gFindBar._updateFindUI();
    } catch(ex) {}
    if ("historyFindbar" in window)
      historyFindbar.adjustSize();
  },

  copyToandClearFindbar: function(event) {
    var sel;
    switch (event.button) {
      case 0:
        gBrowser.selectedBrowser.finder.getInitialSelection().then((r)=> {
          sel = r.selectedText;
          this.copySelectedTextToFindbar(sel);
        })
        //gBrowser.selectedTab.linkedBrowser.messageManager.sendAsyncMessage("global_FindTerm_getSelectedText");
       return;
       break;
      case 1:
       return;
      case 2:
       sel = "";
    }

    this.findTerm = sel;
    this.setTerm(this.findTerm);
    this.selectFindField();
  },

  copySelectedTextToFindbar: function(text) {
    this.findTerm = text;
    this.setTerm(this.findTerm);
    this.selectFindField();

    var evt = document.createEvent("UIEvents");
    evt.initUIEvent("input", true, false, window, 0);
    gFindBar?._findField.dispatchEvent(evt);
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

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  global_FindTerm.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      global_FindTerm.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}


