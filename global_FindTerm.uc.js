// ==UserScript==
// @name           global_FindTerm.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    global_FindTerm + find-label
// @include        main
// @compatibility  Firefox 31-
// @author         Alice0775
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
        this.findTerm = gFindBar._findField.value;
        break;
      case 'TabSelect':
        this.copyTerm();
        break;
      case 'click':
        this.copyToandClearFindbar(event);
    }
  },

	onFndbarOpen: function() {
    if ("BrowserUtils" in window) {
	    var [elm, win] = BrowserUtils.getFocusSync(document);
    } else {
      win = window;
    }
    sel = win.getSelection().toString();

    if (!!sel)
      this.findTerm = sel;

    this.setTerm(this.findTerm);
    this.selectFindField();
	},

  copyTerm: function() {
    if(gBrowser.isFindBarInitialized(gBrowser.selectedTab) && !gFindBar.hidden) {
      this.setTerm(this.findTerm);
      gFindBar._updateFindUI();
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

    label.addEventListener("click", this, true);
  },

  copyToandClearFindbar: function(event) {
    var sel;
    switch (event.button) {
      case 0:
	      if ("BrowserUtils" in window) {
	  	    var [elm, win] = BrowserUtils.getFocusSync(document);
	      } else {
	        win = window;
	      }
	      sel = win.getSelection().toString();

        if  (sel == "" && document.getElementById("searchbar")) {
          sel = document.getElementById("searchbar")._textbox.value;
        }
		    if (!sel)
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

  setTerm: function(val) {
    gFindBar._findField.value = val;
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
