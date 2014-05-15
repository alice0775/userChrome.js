// ==UserScript==
// @name           ucjsDownloadsManager.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Donloads Manager
// @include        main
// @include        chrome://browser/content/downloads/contentAreaDownloadsView.xul
// @compatibility  Firefox 26+
// @author         Alice0775
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
// @note           preferences: browser.download.manager.showWhenStarting
// @note                        browser.download.manager.closeWhenDone
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
        var screenX = Math.max(0,Services.prefs.getIntPref("browser.download.manager.size.screenX"));
        var screenY = Math.max(0,Services.prefs.getIntPref("browser.download.manager.size.screenY"));
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
      this.numDls = 0;
      if (showWhenStarting) {
        if (this._list) {
          this._list.getAll().then(downloads => {
            for (let download of downloads) {
              if (!download.stopped)
                this.numDls++;
            }
            if (this.numDls > 0)
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

    init: function() {
      window.addEventListener("unload", this, false);

      var style = ' \
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        *|*:root { \
          padding: 5px 5px 0 5px; \
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
    },

    uninit: function() {
      window.removeEventListener("unload", this, false);

      if (document.getElementById("contentAreaDownloadsView").getAttribute("sizemode") == "normal") {
        Services.prefs.setIntPref("browser.download.manager.size.height", window.outerHeight);
        Services.prefs.setIntPref("browser.download.manager.size.width", window.outerWidth);
        Services.prefs.setIntPref("browser.download.manager.size.screenX", window.screenX);
        Services.prefs.setIntPref("browser.download.manager.size.screenY", window.screenY);
      }

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

    onDownloadChanged: function (aDownload) {
      if (!this._list)
        return;
      this._list.getAll().then(downloads => {
        var num = 0;
        for (let download of downloads) {
          if (!(download.succeeded || download.canceled))
            num++;
        }
        if (num == 0) {
          var closeWhenDone = false;
          try {
            closeWhenDone = Services.prefs.getBoolPref("browser.download.manager.closeWhenDone");
          } catch(e) {}
          if (closeWhenDone) {
            var enumerator = Services.wm.getEnumerator("navigator:browser");
            while(enumerator.hasMoreElements()) {
              return;
            }
            /// mmm
            DownloadIntegration._store.save();
            window.close();
          }
        }
      }).then(null, Cu.reportError);
    },

    onSummaryChanged: function () {
      if (!this._summary)
        return;
      if (this._summary.allHaveStopped || this._summary.progressTotalBytes == 0) {
        document.title = this.originalTitle;
      } else {
        // Update window title
        this.numDls = 0;
        if (!this._list)
          return;
        this._list.getAll().then(downloads => {
          for (let download of downloads) {
            if (download.hasProgress && !download.succeeded)
              this.numDls++;
          }

          let progressCurrentBytes = Math.min(this._summary.progressTotalBytes,
                                            this._summary.progressCurrentBytes);
          let percent = Math.floor(progressCurrentBytes / this._summary.progressTotalBytes * 100);
          let text = percent + "% of " + this.numDls + (this.numDls < 2 ? " file - " : " files - ") ;
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
