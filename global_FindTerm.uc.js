// ==UserScript==
// @name           global_FindTerm.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    global_FindTerm + find-label
// @include        main
// @compatibility  Firefox 45-
// @author         Alice0775
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
  findTerm:"",

  init : function() {
    gBrowser.tabContainer.addEventListener("TabSelect", this, false);
    window.addEventListener("findbaropen", this, false);
    window.addEventListener("find", this, false);
    window.addEventListener("findagain", this, false);

    //fx25 for existing findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar) {
        this.injectButton(gBrowser.selectedTab._findBar);
      }
    }
    //fx25 for newly created findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
        this.injectButton(event.target._findBar);
      }.bind(this));
    }


    function frameScript() {
      addMessageListener("global_FindTerm_getSelectedText", messageListener);
      function messageListener() {
        //Services.console.logStringMessage("messageListener global_FindTerm_getSelectedText");
        let sel = content.getSelection();
        let data = {text: sel.toString()}
        //Services.console.logStringMessage("sendSyncMessage global_FindTerm_selectionData");
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

    let sel = BrowserUtils.getSelectionDetails(window).text

    if (!!sel)
      this.findTerm = sel;

    this.setTerm(this.findTerm);
    this.updateUI();
    this.selectFindField();
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

    label = document.createElement("label");
    label.setAttribute("id", "findlabel");
    label.setAttribute("value", "Find:");
    label.setAttribute("tooltiptext", "Left click: selected text, Right click: clear");
    container.insertBefore(label, container.firstChild);

    label.addEventListener("click", this, true);
  },

  updateUI: function() {
    gFindBar._updateFindUI();
    if ("historyFindbar" in window)
      historyFindbar.adjustSize();

    if ("XMigemoUI" in window) {
			window.setTimeout(function() {
	      XMigemoUI.updatingFindBar = true;
			  XMigemoUI.updateFloatingFindBarAppearance({type:'XMigemoFindBarUpdateRequest'});
				XMigemoUI.onChangeFindBarSize({type:'XMigemoFindBarUpdateRequest'});
				window.setTimeout(function(aSelf) {
					aSelf.updatingFindBar = false;
				}, 100, XMigemoUI);
      }, 100);
    }
  },

  copyToandClearFindbar: function(event) {
    var sel;
    switch (event.button) {
      case 0:
        //Services.console.logStringMessage("sendAsyncMessage global_FindTerm_getSelectedText");
        gBrowser.selectedTab.linkedBrowser.messageManager.sendAsyncMessage("global_FindTerm_getSelectedText");
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
    /*
    var evt = document.createEvent("UIEvents");
    evt.initUIEvent("input", true, false, window, 0);
    gFindBar._findField.dispatchEvent(evt);
    */
  },

  copySelectedTextToFindbar: function(message) {
    this.findTerm = message.data.text;
    this.setTerm(this.findTerm);
    this.selectFindField();
  },

  setTerm: function(val) {
    var oldVal= gFindBar._findField.value;
    if (oldVal != val) {
	    gFindBar._findField.value = val;
	    /*
      gFindBar.browser.finder.fastFind(val, gFindBar._findMode == gFindBar.FIND_LINKS,
	                             gFindBar._findMode != gFindBar.FIND_NORMAL);
	    */
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
