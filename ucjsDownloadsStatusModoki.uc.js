// ==UserScript==
// @name           ucjsDownloadsStatusModoki.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Downloads Status Modoki
// @include        main
// @compatibility  Firefox 26+
// @author         Alice0775
// @version        2013/12/16 23:28 fixed initialize numDls
// @version        2013/12/16 23:24 open only download added
// @version        2013/12/16 23:10 open only download started
// @version        2013/12/16 21:20 modify css Windows7 Aero
// @version        2013/12/16 21:00 modify css
// @version        2013/12/16 19:30 add autocheck false
// @version        2013/12/16 18:31 fix pref name
// @version        2013/12/16 18:30
// @note
// ==/UserScript== 
var ucjsDownloadsStatusModoki = {
  _summary: null,
  _list: null,

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
        max-height: 100px; \
        height: 34px; \
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
    if (!this._list) {
      Downloads.getList(Downloads.ALL).then(list => {
        this._list = list;
        return this._list.addView(this);
      }).then(null, Cu.reportError);
    }

    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    if (this._summary) {
      this._summary.removeView(this);
    }
    if (this._list) {
      this._list.removeView(this);
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

  onDownloadAdded: function (aDownload) {
    Cu.import("resource://gre/modules/Services.jsm");
    var showWhenStarting = true;
    try {
      showWhenStarting = Services.prefs.getBoolPref("userChrome.downloadsStatusModoki.showWhenStarting");
    } catch(e) {}
    this.numDls = 0;
    if (showWhenStarting) {
      if (this._list) {
        this._list.getAll().then(downloads => {
        for (let download of downloads) {
          if (!download.stopped)
            this.numDls++;
        }
        }).then(null, Cu.reportError);
        if (this.numDls > 0)
          this.openDownloadsStatusModoki(false);
      }
    }
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
    }
  },



  // chrome://browser/content/downloads/contentAreaDownloadsView.xul
  onload: function(event) {
    var doc = event.originalTarget;
    var win = doc.defaultView;
 
    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
      #contentAreaDownloadsView { \
        -moz-box-orient: horizontal; \
      } \
 \
       *|*:root { \
        padding: 0; \
      } \
 \
      #downloadsRichListBox { \
        max-height:34px; \
        background-color: -moz-dialog; \
      } \
 \
      #downloadsRichListBox .scrollbox-innerbox { \
        display:inline !important; \
      } \
 \
      richlistitem { \
        min-width:200px; \
        max-width:200px; \
        max-height:33px; \
        font-size: 13px; \
      } \
 \
      richlistitem vbox { \
      } \
 \
      .downloadTypeIcon { \
        height:24px; \
        width: 24px; \
        -moz-margin-end: 0px; \
        -moz-margin-start: 1px; \
      } \
 \
      .downloadTarget { \
        margin-top:2px; \
        padding-bottom:16px; \
      } \
 \
      .downloadTarget:-moz-system-metric(windows-default-theme) { \
        margin-top:2px; \
        padding-bottom:10px; \
      } \
 \
      .downloadProgress { \
        margin-top:-16px; \
      } \
 \
      .progress-bar { \
        -moz-appearance:none !important; \
        background-color: lime !important; \
      } \
 \
      .progress-remainder { \
      } \
 \
      .downloadDetails { \
        margin-top:-17px; \
      } \
 \
      richlistitem[selected] .downloadDetails { \
      opacity: 1; \
      } \
 \
      .downloadButton { \
        padding: 0; \
        margin: 0; \
      } \
 \
     .button-box { \
        -moz-padding-start: 0px; \
        -moz-padding-end: 1px; \
      } \
 \
     #downloadFilter { \
       width: 150px; \
     } \
 \
     #ucjsDownloadsStatusModoki-closebutton { \
        border: none; \
        padding: 0 5px; \
        list-style-image: url("chrome://global/skin/icons/close.png"); \
        -moz-appearance: none; \
        -moz-image-region: rect(0, 16px, 16px, 0); \
      } \
 \
      #ucjsDownloadsStatusModoki-closebutton:hover { \
        -moz-image-region: rect(0px, 32px, 16px, 16px); \
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
    textbox.setAttribute("id", "downloadFilter");
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
        for (var i = richListBox.itemCount - 1; i >= 0; i--) {
          if (!/0|4/.test(richListBox.getItemAtIndex(i).getAttribute('state')))
            richListBox.removeItemAt(i);
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
            for (var i = richListBox.itemCount - 1; i >= 0; i--) {
              if (!/0|4/.test(richListBox.getItemAtIndex(i).getAttribute('state')))
                richListBox.removeItemAt(i);
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


