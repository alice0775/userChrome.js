// ==UserScript==
// @name           ucjsDownloadsStatusModoki.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Downloads Status Modoki
// @include        main
// @compatibility  Firefox 26+
// @author         Alice0775
// @version        2013/12/16 19:30 add autocheck false
// @version        2013/12/16 18:31 fix pref name
// @version        2013/12/16 18:30
// @note
// ==/UserScript== 
var ucjsDownloadsStatusModoki = {
  _summary: null,
  get downloadsStatusModokiBar() {
    delete downloadsStatusModokiBar;
    return this.downloadsStatusModokiBar = document.getElementById("downloadsStatusModokiBar");
  },

  get toggleMenuitem() {
    delete toggleMenuitem;
    return this.toggleMenuitem = document.getElementById("toggle_downloadsStatusModokiBar");
  },

  init: function() {
    XPCOMUtils.defineLazyModuleGetter(window, "Downloads",
              "resource://gre/modules/Downloads.jsm");

    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
      #ucjsDownloadsStatusModoki { \
        width: 100%; \
        max-height: 99px; \
        height: 33px; \
      } \
     '.replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };


    var toolbar = document.createElement("vbox");
    toolbar.setAttribute("id", "downloadsStatusModokiBar");
    toolbar.setAttribute("collapsed", true);

    var bottombox = document.getElementById("browser-bottombox");
    bottombox.appendChild(toolbar);
    var browser = toolbar.appendChild(document.createElement("browser"));
    browser.setAttribute("disablehistory", true);
    browser.setAttribute("id", "ucjsDownloadsStatusModoki");
    browser.addEventListener("load", function(event){ucjsDownloadsStatusModoki.onload(event)}, true);
    browser.setAttribute("src", "chrome://browser/content/downloads/contentAreaDownloadsView.xul");

    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "toggle_downloadsStatusModokiBar");
    menuitem.setAttribute("type", "checkbox");
    menuitem.setAttribute("autocheck", false);
    menuitem.setAttribute("label", "Downloads Status Modoki Bar");
    menuitem.setAttribute("checked", false);
    menuitem.setAttribute("accesskey", "D");
    menuitem.setAttribute("oncommand", "ucjsDownloadsStatusModoki.toggleDownloadsStatusModokiBar()");
    var ref = document.getElementById("menu_customizeToolbars");
    ref.parentNode.insertBefore(menuitem, ref.previousSibling);

    // Ensure that the DownloadSummary object will be created asynchronously.
    if (!this._summary) {
      Downloads.getSummary(Downloads.ALL).then(summary => {
        this._summary = summary;
        return this._summary.addView(this);
      }).then(null, Cu.reportError);
    }

    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    if (this._summary) {
      this._summary.removeView(this);
    }
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "unload":
        this.uninit();
        break;
    }
  },

  toggleDownloadsStatusModokiBar: function() {
    var collapsed = this.downloadsStatusModokiBar.collapsed;
    this.downloadsStatusModokiBar.collapsed = !collapsed;
    this.toggleMenuitem.setAttribute("checked", collapsed);
  },

  openDownloadsStatusModoki: function() {
    this.downloadsStatusModokiBar.collapsed = false;
    this.toggleMenuitem.setAttribute("checked", true);
  },

  hideDownloadsStatusModoki: function() {
    this.downloadsStatusModokiBar.collapsed = true;
    this.toggleMenuitem.setAttribute("checked", false);
  },

  onSummaryChanged: function () {
    Cu.import("resource://gre/modules/Services.jsm");
    if (!this._summary)
      return;
    if (this._summary.allHaveStopped || this._summary.progressTotalBytes == 0) {
      var closeWhenDone = false;
      try {
        closeWhenDone = Services.prefs.getBoolPref("userChrome.downloadsStatusModoki.closeWhenDone");
      } catch(e) {}
      if (closeWhenDone) {
        this.hideDownloadsStatusModoki();
      }
    } else {
      var showWhenStarting = true;
      try {
        showWhenStarting = Services.prefs.getBoolPref("userChrome.downloadsStatusModoki.showWhenStarting");
      } catch(e) {}
      if (showWhenStarting) {
        this.openDownloadsStatusModoki(false);
      }
    }
  },



  // chrome://browser/content/downloads/contentAreaDownloadsView.xul
  onload: function(event) {
    var doc = event.originalTarget;
    var win = doc.defaultView;
 
    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
      #contentAreaDownloadsView { \
        -moz-box-orient: horizontal !important; \
      } \
 \
       *|*:root { \
        padding: 0; \
      } \
 \
      #downloadsRichListBox { \
        background-color: -moz-dialog !important; \
      } \
 \
      #downloadsRichListBox .scrollbox-innerbox { \
        display:inline !important; \
      } \
 \
      richlistitem { \
        max-width:180px !important; \
        max-height:33px; \
        font-size: 13px; \
      } \
 \
      richlistitem vbox { \
        display: -moz-stack !important; \
      } \
 \
      .downloadTypeIcon { \
        display: none; \
      } \
 \
      .downloadTarget { \
      } \
 \
      .downloadProgress { \
        margin-top:16px !important; \
      } \
 \
      .progress-bar { \
        -moz-appearance:none !important; \
        background-color: lime !important; \
      } \
 \
      .progress-remainder { \
        background-color: rgba(0,0,0,0.1) !important; \
      } \
 \
      .downloadDetails { \
        padding-top:15px; \
      } \
 \
      .downloadButton { \
        padding: 0 !important; \
        margin: 0 !important; \
      } \
 \
     .button-box { \
        -moz-padding-start: 0px; \
        -moz-padding-end: 1px; \
      } \
 \
     #ucjsDownloadsStatusModoki-closebutton { \
        border: none; \
        padding: 0 5px; \
        list-style-image: url("chrome://global/skin/icons/close.png"); \
        -moz-appearance: none; \
        -moz-image-region: rect(0, 16px, 16px, 0); \
      } \
     '.replace(/\s+/g, " ");
    var sspi = doc.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    doc.insertBefore(sspi, doc.documentElement);
    sspi.getAttribute = function(name) {
      return doc.documentElement.getAttribute(name);
    };

    var button = doc.createElement("button");
    button.setAttribute("label", "Clear");
    button.setAttribute("accesskey", "C");
    button.setAttribute("oncommand", "ucjsDownloadsStatusModoki_clearDownloads();");
    var ref = doc.getElementById("downloadCommands");
    var vbox = doc.createElement("vbox");
    var box = vbox.appendChild(doc.createElement("hbox"));
    box.appendChild(button);
    box.appendChild(doc.createElement("spacer")).setAttribute("flex", 1);
    var textbox = doc.createElement("textbox");
    textbox.setAttribute("clickSelectsAll", true);
    textbox.setAttribute("type", "search");
    textbox.setAttribute("placeholder", "Search...");
    textbox.setAttribute("oncommand", "ucjsDownloadsStatusModoki_doSearch(this.value);");
    box.appendChild(textbox);
    var closebtn = doc.createElement("toolbarbutton");
    closebtn.setAttribute("id", "ucjsDownloadsStatusModoki-closebutton");
    closebtn.setAttribute("tooltiptext", "Close this bar");
    closebtn.setAttribute("oncommand", "ucjsDownloadsStatusModoki_doClose();");
    box.appendChild(closebtn);
    ref.parentNode.insertBefore(vbox, ref);

    win.ucjsDownloadsStatusModoki_clearDownloads = function ucjs_clearDownloads() {
      Cu.import("resource://gre/modules/Services.jsm");
      function moveDownloads2History(d) {
        if ( REMEMBERHISTOTY = true /* custmizable true or false */) {
          var db = Components.classes["@mozilla.org/browser/nav-history-service;1"].
                    getService(Components.interfaces.nsPIPlacesDatabase).DBConnection;
          var sql = "UPDATE moz_historyvisits SET visit_type = 1 WHERE visit_type = 7";
          if (d > 0)
            sql += ' AND visit_date <= :date';
          var statement = db.createStatement(sql);
          try {
            if (d > 0)
              statement.params.date = (new Date()).getTime()*1000 - d*24*3600*1000000;
            statement.execute();
          } catch(ex){
          } finally {
            statement.reset();
          }
        }
        // Clear List
        var richListBox = doc.getElementById("downloadsRichListBox");
        richListBox._placesView.doCommand('downloadsCmd_clearDownloads');
        // mmm
        while (richListBox.itemCount > 0) {
          richListBox.removeItemAt(richListBox.itemCount - 1);
        }
        // Clear Library
        var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
        var enumerator = mediator.getEnumerator(null);
        while(enumerator.hasMoreElements()) {
          let win = enumerator.getNext();
          if (win.location == "chrome://browser/content/places/places.xul" &&
              !win.document.getElementById("clearDownloadsButton").hidden) {
            richListBox = win.document.getElementById("downloadsRichListBox");
            richListBox._placesView.doCommand('downloadsCmd_clearDownloads');
            // mmm
            while (richListBox.itemCount > 0) {
              richListBox.removeItemAt(richListBox.itemCount - 1);
            }
            break;
          }
        }
      }
      moveDownloads2History(0);
      try {
        Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager).cleanUp();
      } catch(ex){}

      // close toolbar
      var closeWhenDone = false;
      try {
        closeWhenDone = Services.prefs.getBoolPref("userChrome.downloadsStatusModoki.closeWhenDone");
      } catch(e) {}
      if (closeWhenDone) {
        top.ucjsDownloadsStatusModoki.hideDownloadsStatusModoki();
      }
    };

    win.ucjsDownloadsStatusModoki_doSearch = function ucjs_doSearch(filterString) {
      var richListBox = doc.getElementById("downloadsRichListBox");
      richListBox._placesView.searchTerm = filterString;
    };

    win.ucjsDownloadsStatusModoki_doClose = function ucjs_doClose() {
      top.ucjsDownloadsStatusModoki.hideDownloadsStatusModoki();
    };

  }

}
ucjsDownloadsStatusModoki.init();


