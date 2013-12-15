
// ==UserScript==
// @name downloadProgressInCaption_Fx26.uc.js
// @namespace http://space.geocities.yahoo.co.jp/gl/alice0775
// @include main
// @compatibility Firefox 26
// @version 1.0
// @version        2013/12/16 02:00 defineLazyModuleGetter for Firefox26
// @date 2013-11-26 21:00 null check
// @date 2013-04-06 22:00
// @description Display Download Progress In Library
// ==/UserScript==

var downloadProgressInCaption = {
  _summary: null,
  _list: null,

   init: function() {
    XPCOMUtils.defineLazyModuleGetter(window, "Downloads",
              "resource://gre/modules/Downloads.jsm");
    gBrowser.tabContainer.addEventListener("TabSelect", this, false);
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
    gBrowser.tabContainer.removeEventListener("TabSelect", this, false);
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
      case "TabSelect":
        //this.onDownloadChanged();
        this.onSummaryChanged();
        break;
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
      document.title = document.title.replace(/^\d+% of \d+ files? - /,"");
    } else {
      // Update window title
      this.xonDownloadChanged();
      let progressCurrentBytes = Math.min(this._summary.progressTotalBytes,
                                        this._summary.progressCurrentBytes);
      let percent = Math.floor(progressCurrentBytes / this._summary.progressTotalBytes * 100);
      let text = percent + "% of " + this.numDls + (this.numDls < 2 ? " file - " : " files - ") ;
      document.title = text + document.title.replace(/^\d+% of \d+ files? - /,"");
    }
  }

}
downloadProgressInCaption.init();
