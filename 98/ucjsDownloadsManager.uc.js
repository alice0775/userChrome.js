// ==UserScript==
// @name           ucjsDownloadsManager.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Donloads Manager
// @include        main
// @include        chrome://browser/content/downloads/contentAreaDownloadsView.xhtml
// @compatibility  Firefox 98+
// @author         Alice0775
// @version        2022/02/16 Bug 1747422 - Remove preprocessor variable use from downloads CSS
// @version        2020/12/19 WIP:Workaround to avoid closing the manager if download.error/download.canceled.
// @version        2020/12/18 fix closeWhenDone if small size downloaded
// @version        2020/09/24 fix emptylist layout
// @version        2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser

// @version        2019/10/20 12:30 workaround Bug 1497200: Apply Meta CSP to about:downloads, Bug 1513325 - Remove textbox binding
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1534407 - Enable browser.xhtml by default
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/07/01 16:30 revert Disable btn
// @version        2018/06/12 21:30 remove unused
// @version        2018/06/12 21:00 fix for private window mode
// @version        2018/06/07 12:00 fix file name for history
// @version        2018/04/14 00:00 de XUL overlay
// @version        2017/12/10 12:00 fix error when DO_NOT_DELETE_HISTORY = true
// @version        2017/12/10 12:00 remove workaround Bug 1279329. Disable btn while clear list is doing
// @version        2016/06/10 00:00 Workaround Bug 1279329
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
// ==/UserScript== 
// preferences:
// 自動で開く(デフォルト true):
//   (bool) browser.download.manager.showWhenStarting
// 自動で閉じる(デフォルト false):
//   (bool) browser.download.manager.closeWhenDone
// 上記falseの場合,自動で開いたときにのみ自動で閉じる(デフォルト false):
//   (bool) browser.download.manager.closeWhenDoneIfAutoOpened
// タスクバーにプロフレスメーターを表示(デフォルト true):
//   (bool) browser.download.manager.showProgressInTaskButton

if (location.href == "chrome://browser/content/browser.xhtml") {
  Cu.import("resource://gre/modules/Services.jsm");

  window.ucjs_downloadManager = {
    delay: 500, //自動で閉じる設定の場合、 自動表示しない閾値(ミリ秒)

    _summary: null,
    _list: null,
    kshowWhenStarting: "browser.download.manager.showWhenStarting",
    kcloseWhenDone:    "browser.download.manager.closeWhenDone",
    kcloseWhenDoneIfAutoOpened:
                       "browser.download.manager.closeWhenDoneIfAutoOpened",

    createElement: function(localName, arryAttribute) {
      let elm = document.createXULElement(localName);
      for(let i = 0; i < arryAttribute.length; i++) {
        elm.setAttribute(arryAttribute[i].attr, arryAttribute[i].value);
      }
      return elm;
    },

    init: function() {
      window.addEventListener("unload", this, false);

      let ref = document.getElementById("menu_openDownloads");
      let menu = ref.parentNode.insertBefore(
        this.createElement("menuitem",
          [{attr: "label", value:"Open Download Manager"},
           {attr: "accesskey", value:"D"},
           {attr : "oncommand", value: "ucjs_downloadManager.openDownloadManager(true);"}
          ]), ref);

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

    getDMWindow: function() {
      var enumerator = Services.wm.getEnumerator(null);
      while(enumerator.hasMoreElements()) {
        var win = enumerator.getNext();
        if (win.location == "chrome://browser/content/downloads/contentAreaDownloadsView.xhtml"
          && PrivateBrowsingUtils.isWindowPrivate(window) ==
             PrivateBrowsingUtils.isWindowPrivate(win)) {
          return win;
        }
      }
      return null;
    },

    openDownloadManager: function ucjs_openDownloadManager(aForceFocus) {
      var win = this.getDMWindow();
      if (win) {
        if (aForceFocus) {
          win.focus();
          win.autoOpened = false;
        }
        return false; //既存
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
      win = window.open("chrome://browser/content/downloads/contentAreaDownloadsView.xhtml",
                            "Download" +
                              (PrivateBrowsingUtils.isWindowPrivate(window) ? " - Private Window"
                                                                            : ""),
                            "outerWidth=" + width + ",outerHeight=" + height +
                            ",left=" + screenX + ",top=" + screenY +
                            ",chrome,toolbar=yes,dialog=no,resizable");
       this.success = true;
       if (aForceFocus)
         win.autoOpened = false;
       return win; //新規
    },

    success: true,
    onDownloadChanged: function (aDownload) {
      this.success = this.success && !(aDownload.canceled || aDownload.error);
    },

    closeTimer: null,
    onSummaryChanged: function (aDownload) {
      var showWhenStarting = Services.prefs.getBoolPref(this.kshowWhenStarting, true);
      if (!showWhenStarting) //自動オープンでないならDMを開かない
        return

      var win = this.getDMWindow();
      if (win) {  // すでに開らかれている
        return;
      }

      if (this.success && this._summary.allHaveStopped) //エラーもダウンロード中がないならDMを開かない
        return;

      var closeWhenDone = Services.prefs.getBoolPref(this.kcloseWhenDone, false);
      var closeWhenDoneIfAutoOpened
                        = Services.prefs.getBoolPref(this.kcloseWhenDoneIfAutoOpened, false);
      if (!this.success || !(closeWhenDone || closeWhenDoneIfAutoOpened)) { //エラーがあるまたは自動クローズでないならDMを開く
        var newWindow = this.openDownloadManager(false);
        if (newWindow) {
          newWindow.autoOpened = true;
        }
      }
      
      this.closeTimer = setTimeout(() => {
       if (this.success && this._summary.allHaveStopped) //エラーもダウンロード中もない
          return;

        newWindow = this.openDownloadManager(false); 
        if (newWindow) {
          newWindow.autoOpened = true;
        }
      }, this.delay);

    }
  };
  ucjs_downloadManager.init();
}


if (window.opener && location.href == "chrome://browser/content/downloads/contentAreaDownloadsView.xhtml") {
  
  Cu.import("resource://gre/modules/Services.jsm");
  Cu.import("resource://gre/modules/DownloadIntegration.jsm");

  window.ucjs_downloadManagerMain = {
    originalTitle:"",
    _hasDowbload: false,
    _summary: null,
    _list: null,
    _wait:false,
    kshowWhenStarting: "browser.download.manager.showWhenStarting",
    kcloseWhenDone:    "browser.download.manager.closeWhenDone",
    kcloseWhenDoneIfAutoOpened:
                       "browser.download.manager.closeWhenDoneIfAutoOpened",

    createElement: function(localName, arryAttribute) {
      let elm = document.createXULElement(localName);
      for(let i = 0; i < arryAttribute.length; i++) {
        elm.setAttribute(arryAttribute[i].attr, arryAttribute[i].value);
      }
      return elm;
    },

    createElementNS: function(NS, localName, arryAttribute) {
      let elm = document.createElementNS(NS, localName);
      for(let i = 0; i < arryAttribute.length; i++) {
        elm.setAttribute(arryAttribute[i].attr, arryAttribute[i].value);
      }
      return elm;
    },

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
      /*
      var style = ' \
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        #contentAreaDownloadsView { \
          padding: 0 ; \
        } \
        #downloadsListBox:empty + #downloadsListEmptyDescription { \
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
      */

      document.getElementById("downloadsListEmptyDescription").setAttribute("flex", "1");
      let ref = document.documentElement;
      ref = ref.appendChild(this.createElement("hbox", []));
      ref.appendChild(this.createElement("button",
        [{attr: "id", value: "ucjs_clearListButton"},
         {attr: "label", value: "Clear List"},
         {attr: "accesskey", value: "C"}
        ]));
      ref.appendChild(this.createElement("spacer",
        [{attr: "flex", value: "1"}]));
      ref.appendChild(this.createElementNS("http://www.w3.org/1999/xhtml", "input",
        [{attr: "id", value: "ucjs_downloadManagerMain_input"},
         {attr: "clickSelectsAll", value: "true"},
         {attr: "type", value: "search"},
         {attr: "placeholder", value: "Search..."},
         {attr: "aria-autocomplete", value: "list"}
        ]));

        document.getElementById("ucjs_clearListButton").addEventListener("command", function(event) {
            ucjs_downloadManagerMain.clearDownloads();
          });
        document.getElementById("ucjs_downloadManagerMain_input")
                .addEventListener("input", function(event) {
            ucjs_downloadManagerMain.doSearch(event.target.value);
          });

      this.originalTitle = document.title +
                           (PrivateBrowsingUtils.isWindowPrivate(window) ? " - Private Window"
                                                                         : "");

/*
      // xxx Bug 1279329 "Copy Download Link" of context menu in Library is grayed out
      var listBox = document.getElementById("downloadsListBox");
      var placesView = listBox._placesView;
      var place = placesView.place;
      placesView.place= null;
      placesView.place = place;
*/

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

      var showProgressInTaskButton = Services.prefs.getBoolPref("browser.download.manager.showProgressInTaskButton", true);
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

    success: true,
    onDownloadChanged: function (aDownload) {
      this.success = this.success && !(aDownload.canceled || aDownload.error);
    },
    onSummaryChanged: function () {
      if (!this._summary)
        return;

      if (!this._hasDowbload) {
        this._hasDowbload = true;
        return;
      }
      if (this._summary.allHaveStopped || this._summary.progressTotalBytes == 0) {
        document.title = this.originalTitle;
        if (this._taskbarProgress) {
          this._taskbarProgress.setProgressState(
                                     Ci.nsITaskbarProgress.STATE_NO_PROGRESS, 0, 0);
        }


        var closeWhenDone = Services.prefs.getBoolPref(this.kcloseWhenDone, false);
        var closeWhenDoneIfAutoOpened = Services.prefs.getBoolPref(this.kcloseWhenDoneIfAutoOpened, false) && window.autoOpened;
        if (this.success && (closeWhenDone || closeWhenDoneIfAutoOpened)) {
          DownloadIntegration?._store?.save();
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
      var richListBox = document.getElementById("downloadsListBox");

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
      function moveDownloads2History(d) {
        if (DO_NOT_DELETE_HISTORY &&
            !PrivateBrowsingUtils.isWindowPrivate(window)) {
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
        }

        // Clear List
        richListBox._placesView.doCommand('downloadsCmd_clearDownloads');

        if (DO_NOT_DELETE_HISTORY &&
            !PrivateBrowsingUtils.isWindowPrivate(window)) {
          if (places.length > 0) {
            var asyncHistory = Components.classes["@mozilla.org/browser/history;1"]
                     .getService(Components.interfaces.mozIAsyncHistory);
              asyncHistory.updatePlaces(places);
          }
        }
      }
      var btn = document.getElementById("ucjs_clearListButton");
      moveDownloads2History(0);
    },

    doSearch: function ucjs_doSearch(filterString) {
      var richListBox = document.getElementById("downloadsListBox");
      richListBox._placesView.searchTerm = filterString;
    }
  };
  ucjs_downloadManagerMain.init();
}
