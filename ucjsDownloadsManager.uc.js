// ==UserScript==
// @name           ucjsDownloadsManager.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Donloads Manager
// @include        main
// @include        chrome://browser/content/downloads/contentAreaDownloadsView.xul
// @compatibility  Firefox 31+
// @author         Alice0775
// @version        2016/05/04 20:30 remove typo
// @version        2016/05/04 20:00 remove in-content css, add preference for Taskbar Progress
// @version        2016/05/03 01:00 Indicate Taskbar Progress
// @version        2016/04/19 07:00 change title dexcription "/" instead of " of "
// @version        2015/05/08 00:00 remove padding due to Bug 1160734
// @version        2015/03/29 00:00 Check window.windowState instead of sizemode attribute
// @version        2014/12/28 23:00 Skip save window size if closed immediately
// @version        2014-12-23 23:00 number of files
// @version        2014-10-23 22:00 number of files
// @version        2014/10/18 20:00 fix posiotion
// @version        2014/06/07 20:00 Woraround closes
// @version        2014/06/03 12:00 
// @version        2014/05/15 22:00 clean up
// @version        2014/05/15 20:00 removed the following oraround
// @version        2014/05/15 19:00 Woraround closes the manager 10 seconds after download completion
// @version        2014/03/31 00:00 fix for browser.download.manager.showWhenStarting
// @version        2014/03/01 12:00 Bug 978291
// @version        2013/12/19 17:10 rename REMEMBERHISTOTY to DO_NOT_DELETE_HISTORY
// @version        2013/12/19 17:00 fix do not close the Manager if there is main window
// @version        2013/12/18 23:10 
// @version        2013/12/16 23:10 open only download added
// @version        2013/12/16 02:00 defineLazyModuleGetter for Firefox26
// @version        2013/12/15 22:00 typo and correct version date
// @version        2013/12/15 08:00 label placeholder size
// @version        2013/12/14 20:10 Search
// @version        2013/12/14 19:30 getBoolPref
// @version        2013/12/14 18:30 typo and fix closeWhenDone
// @version        2013/12/14 18:00 browser.download.manager.showWhenStarting , browser.download.manager.closeWhenDone
// @version        2013/12/02 00:00 
// @note           Require Sub-Script/Overlay Loader v3.0.40mod
// @note           preferences: (bool) browser.download.manager.showWhenStarting
// @note                        (bool) browser.download.manager.closeWhenDone
// @note                        (bool) browser.download.manager.showProgressInTaskButton
// ==/UserScript== 

if (location.href == "chrome://browser/content/browser.xul") {
  Cu.import("resource://gre/modules/Services.jsm");

  window.ucjs_downloadManager = {
    _summary: null,
    _list: null,

    init: function() {
      window.addEventListener("unload", this, false);

      var overlay = ' \
        <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                 xmlns:html="http://www.w3.org/1999/xhtml"> \
            <menupopup  id="menu_ToolsPopup"> \
                  <menuitem \
                    insertbefore="menu_openDownloads" \
                    label="Open Download Manager" \
                    accesskey="D" \
                    oncommand="ucjs_downloadManager.openDownloadManager(true);" /> \
            </menupopup> \
        </overlay>';
      overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
      window.userChrome_js.loadOverlay(overlay, this);
    },

    observe: function() {
      XPCOMUtils.defineLazyModuleGetter(this, "Downloads",
                "resource://gre/modules/Downloads.jsm");
      // Ensure that the DownloadSummary object will be created asynchronously.
      if (!this._summary) {
        this.Downloads.getSummary(this.Downloads.ALL).then(summary => {
          this._summary = summary;
          return this._summary.addView(this);
        }).then(null, Cu.reportError);
      }

      if (!this._list) {
        this.Downloads.getList(this.Downloads.ALL).then(list => {
          this._list = list;
          return this._list.addView(this);
        }).then(null, Cu.reportError);
      }
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

    openDownloadManager: function ucjs_openDownloadManager(aForceFocus) {
      var enumerator = Services.wm.getEnumerator(null);
      while(enumerator.hasMoreElements()) {
        var win = enumerator.getNext();
        if (win.location == "chrome://browser/content/downloads/contentAreaDownloadsView.xul") {
          if (aForceFocus)
            win.focus();
          return;
        }
      }

      try {
        var height = Math.max(100,Services.prefs.getIntPref("browser.download.manager.size.height"));
        var width  = Math.max(300,Services.prefs.getIntPref("browser.download.manager.size.width"));
        var screenX = Math.min(Math.max(0,Services.prefs.getIntPref("browser.download.manager.size.screenX")), screen.availWidth - width);
        var screenY = Math.min(Math.max(0,Services.prefs.getIntPref("browser.download.manager.size.screenY")), screen.availHeight - height);
      } catch(r){
        height = 300;
        width  = 600;
        screenX = 0;
        screenY = 0;
      }
      var win = window.open("chrome://browser/content/downloads/contentAreaDownloadsView.xul",
                            "Download",
                            "outerWidth=" + width + ",outerHeight=" + height +
                            ",left=" + screenX + ",top=" + screenY +
                            ",chrome,toolbar=yes,dialog=no,resizable");
    },

    closeDownloadManager: function ucjs_closeDownloadManager() {
      var enumerator = Services.wm.getEnumerator(null);
      while(enumerator.hasMoreElements()) {
        var win = enumerator.getNext();
        if (win.location == "chrome://browser/content/downloads/contentAreaDownloadsView.xul") {
          win.close();
          return;
        }
      }
    },

    onDownloadAdded: function (aDownload) {
      var showWhenStarting = true;
      try {
        showWhenStarting = Services.prefs.getBoolPref("browser.download.manager.showWhenStarting");
      } catch(e) {}
      var numDls = 0;
      if (showWhenStarting) {
        if (this._list) {
          this._list.getAll().then(downloads => {
            for (let download of downloads) {
              if (!download.stopped)
                numDls++;
            }
            if (numDls > 0)
              this.openDownloadManager(false);
          }).then(null, Cu.reportError);
        }
      }
    },

    onDownloadChanged: function (aDownload) {
      if (!this._list)
        return;
      this._list.getAll().then(downloads => {
        var num = 0;
        for (let download of downloads) {
          if (!download.succeeded)
            num++;
        }
        if (num == 0) {
          var closeWhenDone = false;
          try {
            closeWhenDone = Services.prefs.getBoolPref("browser.download.manager.closeWhenDone");
          } catch(e) {}
          if (closeWhenDone) {
            this.closeDownloadManager();
          }
        }
      }).then(null, Cu.reportError);
    }
  };
  ucjs_downloadManager.init();
}


if (window.opener && location.href == "chrome://browser/content/downloads/contentAreaDownloadsView.xul") {
  Cu.import("resource://gre/modules/Services.jsm");
  Cu.import("resource://gre/modules/DownloadIntegration.jsm");

  window.ucjs_downloadManagerMain = {
    originalTitle:"",
    _summary: null,
    _list: null,
    _wait:false,

    init: function() {
      window.addEventListener("unload", this, false);

      // xxx remove in-content css
      var elements = document.childNodes;
      for (var i = 0; i <= elements.length; i++) {
        var element = elements[i];
        if (element.nodeValue.indexOf("chrome://browser/skin/downloads/contentAreaDownloadsView.css") > -1) {
          document.removeChild(element);
          break;
        }
      }
      
      var style = ' \
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        #contentAreaDownloadsView { \
          padding: 0 ; \
        } \
        #downloadsRichListBox:empty + #downloadsListEmptyDescription { \
          pointer-events: none; \
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

      var overlay = ' \
        <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                 xmlns:html="http://www.w3.org/1999/xhtml"> \
          <hbox> \
            <button label="Clear List" \
                    accesskey="C" \
                    oncommand="ucjs_downloadManagerMain.clearDownloads();"/> \
            <spacer flex="1"/> \
            <textbox clickSelectsAll="true" \
                     type="search" \
                     placeholder="Search..." \
                     oncommand="ucjs_downloadManagerMain.doSearch(this.value);" \
                     aria-autocomplete="list"/> \
            </hbox> \
        </overlay>';
      overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
      window.userChrome_js.loadOverlay(overlay, this);
    },

    observe: function() {
      this.originalTitle = document.title;

      setTimeout(function(){this._wait = true}.bind(this), 0);

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

      try {
        var showProgressInTaskButton = Services.prefs.getBoolPref("browser.download.manager.showProgressInTaskButton")
      } catch(ex) {
        showProgressInTaskButton = true; //default
      }
      if (showProgressInTaskButton)
        setTimeout(function() {
          try {
            let docShell = window.QueryInterface(Ci.nsIInterfaceRequestor)
                                  .getInterface(Ci.nsIWebNavigation)
                                  .QueryInterface(Ci.nsIDocShellTreeItem).treeOwner
                                  .QueryInterface(Ci.nsIInterfaceRequestor)
                                  .getInterface(Ci.nsIXULWindow).docShell;
            let gWinTaskbar = Components.classes["@mozilla.org/windows-taskbar;1"]
                                      .getService(Components.interfaces.nsIWinTaskbar);
            this._taskbarProgress = gWinTaskbar.getTaskbarProgress(docShell);
          } catch(ex) {
            this._taskbarProgress = null;
          }
        }.bind(this), 10);
    },

    uninit: function() {
      window.removeEventListener("unload", this, false);

      this._taskbarProgress = null;
      if (this._wait)
        this.saveSizePosition();

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

    saveSizePosition: function() {
      if (window.windowState == 3) {
        Services.prefs.setIntPref("browser.download.manager.size.height", window.outerHeight);
        Services.prefs.setIntPref("browser.download.manager.size.width", window.outerWidth);
        Services.prefs.setIntPref("browser.download.manager.size.screenX", window.screenX);
        Services.prefs.setIntPref("browser.download.manager.size.screenY", window.screenY);
      }
    },

    onSummaryChanged: function () {
      if (!this._summary)
        return;
      if (this._summary.allHaveStopped || this._summary.progressTotalBytes == 0) {
        document.title = this.originalTitle;
        if (this._taskbarProgress) {
          this._taskbarProgress.setProgressState(
                                     Ci.nsITaskbarProgress.STATE_NO_PROGRESS, 0, 0);
        }
        Cu.import("resource://gre/modules/Services.jsm");
        var enumerator = Services.wm.getEnumerator("navigator:browser");
        while(enumerator.hasMoreElements()) {
          return;
        }

        var closeWhenDone = false;
        try {
          closeWhenDone = Services.prefs.getBoolPref("browser.download.manager.closeWhenDone");
        } catch(e) {}
        if (closeWhenDone) {
          DownloadIntegration._store.save();
          window.close();
        }

      } else {

        // If the last browser window has been closed, we have no indicator any more.
        if (this._taskbarProgress) {
          if (this._summary.allHaveStopped || this._summary.progressTotalBytes == 0) {
            this._taskbarProgress.setProgressState(
                                     Ci.nsITaskbarProgress.STATE_NO_PROGRESS, 0, 0);
          } else {
            // For a brief moment before completion, some download components may
            // report more transferred bytes than the total number of bytes.  Thus,
            // ensure that we never break the expectations of the progress indicator.
            let progressCurrentBytes = Math.min(this._summary.progressTotalBytes,
                                                this._summary.progressCurrentBytes);
            this._taskbarProgress.setProgressState(
                                     Ci.nsITaskbarProgress.STATE_NORMAL,
                                     progressCurrentBytes,
                                     this._summary.progressTotalBytes);
          }
        }

        // Update window title
        var numDls = 0;
        if (!this._list)
          return;
        this._list.getAll().then(downloads => {
          for (let download of downloads) {
            if (download.hasProgress && !download.succeeded)
              numDls++;
          }

          let progressCurrentBytes = Math.min(this._summary.progressTotalBytes,
                                            this._summary.progressCurrentBytes);
          let percent = Math.floor(progressCurrentBytes / this._summary.progressTotalBytes * 100);
          let text = percent + "%/" + numDls + (numDls < 2 ? " file - " : " files - ") ;
          document.title = text + this.originalTitle;
        }).then(null, Cu.reportError);
      }
    },

    clearDownloads: function ucjs_clearDownloads() {
      var DO_NOT_DELETE_HISTORY = true; /* custmizable true or false */

      var places = [];
      function addPlace(aURI, aTitle, aVisitDate) {
        places.push({
          uri: aURI,
          title: aTitle,
          visits: [{
            visitDate: aVisitDate,
            transitionType: Ci.nsINavHistoryService.TRANSITION_LINK
          }]
        });
      }
      function moveDownloads2History(d) {
        var richListBox = document.getElementById("downloadsRichListBox");

        if (DO_NOT_DELETE_HISTORY) {
          var cont = richListBox._placesView.result.root;
          cont.containerOpen = true;
          for (let i = cont.childCount - 1; i > -1; i--) {
              let node = cont.getChild(i);
              let aURI = makeURI(node.uri);
              let aTitle = node.title;
              let aVisitDate = node.time;
              addPlace(aURI, aTitle, aVisitDate)
          }
        }

        // Clear List
        richListBox._placesView.doCommand('downloadsCmd_clearDownloads');

        if (DO_NOT_DELETE_HISTORY) {
          if (places.length > 0) {
            var asyncHistory = Components.classes["@mozilla.org/browser/history;1"]
                     .getService(Components.interfaces.mozIAsyncHistory);
              asyncHistory.updatePlaces(places);
          }
        }
      }
      moveDownloads2History(0);
    },

    doSearch: function ucjs_doSearch(filterString) {
      var richListBox = document.getElementById("downloadsRichListBox");
      richListBox._placesView.searchTerm = filterString;
    }
  };
  ucjs_downloadManagerMain.init();
}
