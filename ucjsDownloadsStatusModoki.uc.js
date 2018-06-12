// ==UserScript==
// @name           ucjsDownloadsStatusModoki.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Downloads Status Modoki
// @include        main
// @compatibility  Firefox 57
// @author         Alice0775
// @version        2018/06/12 21:00 fix for private window mode
// @version        2018/06/07 12:00 fix file name for history
// @version        2018/02/10 12:00 try catch error when DO_NOT_DELETE_HISTORY = true
// @version        2017/12/10 12:00 fix error when DO_NOT_DELETE_HISTORY = true
// @version        2017/12/10 12:00 remove workaround Bug 1279329. Disable btn while clear list is doing, close button styling for 57.
// @version        2016/06/10 12:00 modify style independent of font-family
// @version        2016/06/10 07:00 modify style of close button, fix typo
// @version        2016/06/10 00:00 Workaround Bug 1279329. adjust some padding
// @version        2015/05/08 00:00 remove padding due to Bug 1160734
// @version        2014/03/31 00:00 fix for browser.download.manager.showWhenStarting
// @version        2013/12/22 13:00 chromehidden
// @version        2013/12/19 17:10 rename REMEMBERHISTOTY to DO_NOT_DELETE_HISTORY
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
    if (document.documentElement.getAttribute("chromehidden") !="" )
      return;

    XPCOMUtils.defineLazyModuleGetter(window, "Downloads",
              "resource://gre/modules/Downloads.jsm");

    var style = ` 
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); 
      #ucjsDownloadsStatusModoki { 
        width: 100%; 
        max-height: 100px; 
        height: 35px; 
      } 
     `.replace(/\s+/g, " ");
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
    browser.setAttribute("remote", false);
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
          if (this.numDls > 0)
            this.openDownloadsStatusModoki(false);
        }).then(null, Cu.reportError);
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
 
    var style = ` 
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); 
      #contentAreaDownloadsView { 
        -moz-box-orient: horizontal; 
        background-color: -moz-dialog; 
        padding: 0; 
      } 
 
      #downloadsRichListBox { 
        max-height:35px; 
        background-color: -moz-dialog; 
      } 
 
      #downloadsRichListBox .scrollbox-innerbox { 
        display:inline !important; 
      } 
 
      richlistitem { 
        min-width:200px; 
        max-width:200px; 
        max-height:33px; 
        font-size: 13px; 
        border-width: 0 1px 0 0;
        border-style: solid;
        border-color: black;
       } 
 
      richlistitem vbox { 
      } 
 
      .downloadTypeIcon { 
        height:16px; 
        width: 16px; 
        -moz-margin-end: 0px; 
        -moz-margin-start: 1px; 
         padding-right: 0; 
         padding-left: 1px; 
      } 
 
      .downloadTarget { 
        margin-top:1px; 
        padding-bottom:16px; 
        max-width: calc(100% - 50px) !important; 
        min-width: calc(100% - 50px) !important; 
      } 
 
      .downloadTarget:-moz-system-metric(windows-default-theme) { 
        margin-top:2px; 
        /*padding-bottom:10px;  windows7 ?*/
      } 
 
      .downloadProgress { 
        margin-top:-16px; 
        margin-bottom: -1px;
        height:12px;
        margin-inline-end: 0 !important;
      } 
 
      .progress-bar { 
        -moz-appearance:none !important; 
        background-color: lime !important; 
      } 
 
      .progress-remainder { 
      } 
 
      .downloadDetails { 
        margin-top:-12px; 
      } 

       .download-state:not(:-moz-any([state="-1"], [state="5"], [state="0"], [state="4"], [state="7"]))      .downloadDetails {
         margin-top:-17px; 
      }

      richlistitem[selected] .downloadDetails { 
      opacity: 1; 
      } 
 
      .downloadButton { 
        padding: 0; 
        margin: 0; 
      } 
 
     button > .button-box { 
        -moz-padding-start: 0px; 
        -moz-padding-end: 1px; 
        padding-right: 0 !important; 
        padding-left: 0 !important; 
      } 
 
     #downloadFilter { 
       width: 150px; 
     } 
 
     `.replace(/\s+/g, " ");
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
    button.setAttribute("id", "ucjs_clearListButton");
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
    closebtn.setAttribute("class", "close-icon");
    closebtn.setAttribute("tooltiptext", "Close this bar");
    closebtn.setAttribute("oncommand", "ucjsDownloadsStatusModoki_doClose();");
    box.appendChild(closebtn);
    ref.parentNode.insertBefore(vbox, ref);

/*
    // xxx Bug 1279329 "Copy Download Link" of context menu in Library is grayed out
    var listBox = doc.getElementById("downloadsRichListBox");
    var placesView = listBox._placesView;
    if (placesView) {
      var place = placesView.place;
      placesView.place= null;
      placesView.place = place;
    }
*/
    win.ucjsDownloadsStatusModoki_clearDownloads = function ucjs_clearDownloads() {
      var DO_NOT_DELETE_HISTORY = true; /* custmizable true or false */
      var richListBox = doc.getElementById("downloadsRichListBox");

      Cu.import("resource://gre/modules/Services.jsm");
      var places = [];
      function addPlace(aURI, aTitle, aVisitDate) {
        places.push({
          uri: aURI,
          title: aTitle,
          visits: [{
            visitDate: (aVisitDate || Date.now()) * 1000,
            transitionType: Ci.nsINavHistoryService.TRANSITION_LINK
          }]
        });
      }
      function moveDownloads2History() {
        if (DO_NOT_DELETE_HISTORY &&
            !PrivateBrowsingUtils.isWindowPrivate(window)) {
          try {
            for (let element of richListBox.childNodes) {
              let download = element._shell.download;
              let aURI = makeURI(download.source.url);
              // let aTitle = document.getAnonymousElementByAttribute(element, "class", "downloadTarget").value
              let aTitle = download.target.path;
              aTitle = aTitle.match( /[^\\]+$/i )[0];
              aTitle = aTitle.match( /[^/]+$/i )[0];

              let aVisitDate = download.endTime || download.startTime;
              addPlace(aURI, aTitle, aVisitDate)
            }
          } catch(ex) {}
        }

        // Clear List
        richListBox._placesView.doCommand('downloadsCmd_clearDownloads');

        if (DO_NOT_DELETE_HISTORY &&
            !PrivateBrowsingUtils.isWindowPrivate(window)) {
          try {
            if (places.length > 0) {
              var asyncHistory = Components.classes["@mozilla.org/browser/history;1"]
                       .getService(Components.interfaces.mozIAsyncHistory);
                asyncHistory.updatePlaces(places);
            }
          } catch(ex) {}
        }
      }
      var btn = doc.getElementById("ucjs_clearListButton");
      btn.setAttribute("disabled", true);
      moveDownloads2History();
      btn.removeAttribute("disabled");

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


