// ==UserScript==
// @name           ucjsDownloadsManager.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Donloads Manager
// @include        main
// @include        about:downloads
// @compatibility  Firefox 24+
// @author         Alice0775
// @version        2013/12/02 00:00 
// @note           Require Sub-Script/Overlay Loader v3.0.40mod and 000-windowhook.uc.js
// ==/UserScript== 
(function(){
  window.ucjs_openDownloadManager = function ucjs_openDownloadManager() {

    var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);

    var enumerator = mediator.getEnumerator(null);
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.location == "about:downloads") {
        win.focus();
        return;
      }
    }
    window.open("about:downloads","Download", "width=600,height=300,chrome,toolbar=yes,dialog=no,resizable");
  }
  var overlay = ' \
    <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
             xmlns:html="http://www.w3.org/1999/xhtml"> \
        <menupopup  id="menu_ToolsPopup"> \
              <menuitem \
                insertbefore="menu_openDownloads" \
                label="Open Download Manager" \
                accesskey="D" \
                oncommand="ucjs_openDownloadManager();" /> \
        </menupopup> \
    </overlay>';
  overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
  window.userChrome_js.loadOverlay(overlay, null);
})();

WindowHook.register("about:downloads",
  function(aWindow) {
    const originalTitle = aWindow.document.title;

    aWindow.downloadProgressInLibrary = {
      _summary: null,
      _list: null,

       init: function() {
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
    button.setAttribute("label", "Clear");
    button.setAttribute("accesskey", "Clear");
    button.setAttribute("oncommand", "ucjs_clearDownloads();");
    var ref = aWindow.document.getElementById("downloadCommands");
    var box = aWindow.document.createElement("hbox");
    box.appendChild(button);
    ref.parentNode.insertBefore(box, ref);

    aWindow.ucjs_clearDownloads = function ucjs_clearDownloads() {
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
        var richListBox = aWindow.document.getElementById("downloadsRichListBox");
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
          var win = enumerator.getNext();
          if (win.location == "chrome://browser/content/places/places.xul" &&
              !win.document.getElementById("clearDownloadsButton").hidden) {
            richListBox = win.document.getElementById("downloadsRichListBox");
            richListBox._placesView.doCommand('downloadsCmd_clearDownloads');
            // mmm
            while (richListBox.itemCount > 0) {
              richListBox.removeItemAt(richListBox.itemCount - 1);
            }
            return;
          }
        }
      }
      moveDownloads2History(0);
      try {
        Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager).cleanUp();
      } catch(ex){}
    };
  }
);

