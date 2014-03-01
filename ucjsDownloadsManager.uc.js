// ==UserScript==
// @name           ucjsDownloadsManager.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Donloads Manager
// @include        main
// @compatibility  Firefox 26+
// @author         Alice0775
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
// @note           Require Sub-Script/Overlay Loader v3.0.40mod and 000-windowhook.uc.js
// ==/UserScript== 
// state 0 inprogress, 1 finished, 2 faild, 3 calceled, 4 paused, 5 queued, 6 blocked parental, 7 scanning
//       8 dirty, 9 blocked policy
(function(){
  window.ucjs_openDownloadManager = function ucjs_openDownloadManager(aForceFocus) {

    var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);

    var enumerator = mediator.getEnumerator(null);
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.location == "chrome://browser/content/downloads/contentAreaDownloadsView.xul") {
        if (aForceFocus)
          win.focus();
        return;
      }
    }
    window.open("chrome://browser/content/downloads/contentAreaDownloadsView.xul","Download", "width=600,height=300,chrome,toolbar=yes,dialog=no,resizable");
  }
  window.ucjs_closeDownloadManager = function ucjs_closeDownloadManager() {

    var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);

    var enumerator = mediator.getEnumerator(null);
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.location == "chrome://browser/content/downloads/contentAreaDownloadsView.xul") {
        win.close();
        return;
      }
    }
  }
  var overlay = ' \
    <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
             xmlns:html="http://www.w3.org/1999/xhtml"> \
        <menupopup  id="menu_ToolsPopup"> \
              <menuitem \
                insertbefore="menu_openDownloads" \
                label="Open Download Manager" \
                accesskey="D" \
                oncommand="ucjs_openDownloadManager(true);" /> \
        </menupopup> \
    </overlay>';
  overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
  window.userChrome_js.loadOverlay(overlay, null);
})();

var openOrHideDownloadWindow_at_startDownload = {
  _summary: null,
  _list: null,

  init: function() {
    XPCOMUtils.defineLazyModuleGetter(window, "Downloads",
              "resource://gre/modules/Downloads.jsm");
    window.addEventListener("unload", this, false);
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

  onDownloadAdded: function (aDownload) {
    Cu.import("resource://gre/modules/Services.jsm");
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
        }).then(null, Cu.reportError);
        if (this.numDls > 0)
          ucjs_openDownloadManager(false);
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
        closeWhenDone = Services.prefs.getBoolPref("browser.download.manager.closeWhenDone");
      } catch(e) {}
      if (closeWhenDone) {
        ucjs_closeDownloadManager();
      }
    }
  }
}
openOrHideDownloadWindow_at_startDownload.init();



WindowHook.register("chrome://browser/content/downloads/contentAreaDownloadsView.xul",
  function(aWindow) {
    const originalTitle = aWindow.document.title;

    aWindow.downloadProgressInLibrary = {
      _summary: null,
      _list: null,

       init: function() {
        Cu.import("resource://gre/modules/Services.jsm");
        try {
          var height = Services.prefs.getIntPref("browser.download.manager.size.height");
          var width = Services.prefs.getIntPref("browser.download.manager.size.width");
          var screenX = Services.prefs.getIntPref("browser.download.manager.size.screenX");
          var screenY = Services.prefs.getIntPref("browser.download.manager.size.screenY");
          aWindow.moveTo(screenX, screenY);
          aWindow.resizeTo(width, height);
        } catch(r){}
        var style = ' \
          @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
          *|*:root { \
            padding: 5px 5px 0 5px; \
          } \
          #downloadsRichListBox:empty + #downloadsListEmptyDescription { \
            pointer-events: none; \
          } \
         '.replace(/\s+/g, " ");
        var sspi = aWindow.document.createProcessingInstruction(
          'xml-stylesheet',
          'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
        );
        aWindow.document.insertBefore(sspi, aWindow.document.documentElement);
        sspi.getAttribute = function(name) {
          return aWindow.document.documentElement.getAttribute(name);
        };

        aWindow.addEventListener("unload", this, false);
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
        Cu.import("resource://gre/modules/Services.jsm");
        if (aWindow.document.getElementById("contentAreaDownloadsView").getAttribute("sizemode") == "normal") {
          Services.prefs.setIntPref("browser.download.manager.size.height", aWindow.outerHeight);
          Services.prefs.setIntPref("browser.download.manager.size.width", aWindow.outerWidth);
          Services.prefs.setIntPref("browser.download.manager.size.screenX", aWindow.screenX);
          Services.prefs.setIntPref("browser.download.manager.size.screenY", aWindow.screenY);
        }
        aWindow.removeEventListener("unload", this, false);
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

      xonDownloadChanged: function (aDownload) {
        this.numDls = 0;
        if (!this._list)
          return;
        this._list.getAll().then(downloads => {
        for (let download of downloads) {
          if (download.hasProgress && !download.succeeded)
            this.numDls++;
        }
        }).then(null, Cu.reportError);
      },

      onSummaryChanged: function () {
        if (!this._summary)
          return;
        if (this._summary.allHaveStopped || this._summary.progressTotalBytes == 0) {
          aWindow.document.title = originalTitle;

          var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
          var enumerator = mediator.getEnumerator("navigator:browser");
          while(enumerator.hasMoreElements()) {
            return;
          }

          Cu.import("resource://gre/modules/Services.jsm");
          var closeWhenDone = false;
          try {
            closeWhenDone = Services.prefs.getBoolPref("browser.download.manager.closeWhenDone");
          } catch(e) {}
          if (closeWhenDone) {
            aWindow.close();
          }

        } else {
          // Update window title
          this.xonDownloadChanged();
          let progressCurrentBytes = Math.min(this._summary.progressTotalBytes,
                                            this._summary.progressCurrentBytes);
          let percent = Math.floor(progressCurrentBytes / this._summary.progressTotalBytes * 100);
          let text = percent + "% of " + this.numDls + (this.numDls < 2 ? " file - " : " files - ") ;
          aWindow.document.title = text + originalTitle;
        }
      }

    }
    aWindow.downloadProgressInLibrary.init();


    var button = aWindow.document.createElement("button");
    button.setAttribute("label", "Clear List");
    button.setAttribute("accesskey", "C");
    button.setAttribute("oncommand", "ucjs_clearDownloads();");
    var ref = aWindow.document.getElementById("downloadCommands");
    var box = aWindow.document.createElement("hbox");
    box.appendChild(button);
    box.appendChild(aWindow.document.createElement("spacer")).setAttribute("flex", 1);
    var textbox = aWindow.document.createElement("textbox");
    textbox.setAttribute("clickSelectsAll", true);
    textbox.setAttribute("type", "search");
    textbox.setAttribute("placeholder", "Search...");
    textbox.setAttribute("oncommand", "ucjs_doSearch(this.value);");
    box.appendChild(textbox);
    ref.parentNode.insertBefore(box, ref);

    aWindow.ucjs_clearDownloads = function ucjs_clearDownloads() {
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
        var richListBox = aWindow.document.getElementById("downloadsRichListBox");

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
    };

    aWindow.ucjs_doSearch = function ucjs_doSearch(filterString) {
      var richListBox = aWindow.document.getElementById("downloadsRichListBox");
      richListBox._placesView.searchTerm = filterString;
    };
  }
);

