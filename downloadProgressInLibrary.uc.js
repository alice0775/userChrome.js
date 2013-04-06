// ==UserScript==
// @name downloadProgressInLibrary.uc.js
// @namespace http://space.geocities.yahoo.co.jp/gl/alice0775
// @include chrome://browser/content/places/places.xul
// @compatibility Firefox 20
// @version 1.0
// @date 2013-04-06 22:00
// @description Display Download Progress In Library
// ==/UserScript==
(function(){

  const progressInTitleBar = true;
  const originalTitle = document.title;

  let DownloadMonitorPanel = {
    //////////////////////////////////////////////////////////////////////////////
    //// DownloadMonitorPanel Member Variables

    _listening: false,

    get DownloadUtils() {
      delete this.DownloadUtils;
      Cu.import("resource://gre/modules/DownloadUtils.jsm", this);
      return this.DownloadUtils;
    },

    get gDownloadMgr() {
      delete this.gDownloadMgr;
      return this.gDownloadMgr = Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
    },

    //////////////////////////////////////////////////////////////////////////////
    //// DownloadMonitorPanel Public Methods

    /**
     * Initialize the status panel and member variables
     */
    init: function DMP_init() {

      this.gDownloadMgr.addListener(this);
      this._listening = true;

      this.updateStatus();
    },

    uninit: function DMP_uninit() {
      if (this._listening)
        this.gDownloadMgr.removeListener(this);
    },

    /**
     * Update status based on the number of active and paused downloads
     */
    updateStatus: function DMP_updateStatus() {

      let numActive = this.gDownloadMgr.activeDownloadCount;

      // Hide the status if there's no downloads
      if (numActive == 0) {
        if (progressInTitleBar) {
          // Update window title
          document.title = originalTitle;
        }
        return;
      }

      // Find the download with the longest remaining time
      let numPaused = 0;
      let dls = this.gDownloadMgr.activeDownloads;
      let totalsize = 0;
      let transferredsize = 0;
      while (dls.hasMoreElements()) {
        let dl = dls.getNext();
        if (dl.state == this.gDownloadMgr.DOWNLOAD_DOWNLOADING) {
          // Figure out if this download takes longer
          if (dl.speed > 0 && dl.size > 0) {
            totalsize += dl.size;
            transferredsize += dl.amountTransferred;
          }
        }
        else if (dl.state == this.gDownloadMgr.DOWNLOAD_PAUSED)
          numPaused++;
      }

      // Figure out how many downloads are currently downloading
      let numDls = numActive - numPaused;

      // If all downloads are paused, show the paused message instead
      if (numDls == 0) {
        numDls = numPaused;
      }

      if (progressInTitleBar && totalsize > 0) {
        // Update window title
        let percent = Math.floor(transferredsize / totalsize * 100);
        let text = percent + "% of " + numDls + (numDls < 2 ? " file - " : " files - ") ;
        document.title = text + originalTitle;
      }
    },
    //////////////////////////////////////////////////////////////////////////////
    //// nsIDownloadProgressListener

    /**
     * Update status for download progress changes
     */
    onProgressChange: function() {
      this.updateStatus();
    },

    /**
     * Update status for download state changes
     */
    onDownloadStateChange: function() {
      this.updateStatus();
    },

    onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus, aDownload) {
    },

    onSecurityChange: function(aWebProgress, aRequest, aState, aDownload) {
    },

    //////////////////////////////////////////////////////////////////////////////
    //// nsISupports

    QueryInterface: XPCOMUtils.generateQI([Ci.nsIDownloadProgressListener]),
  };





  DownloadMonitorPanel.init();

  window.addEventListener("unload", function unloadDownloadProgressInLibrary(){
    window.removeEventListener("unload", unloadDownloadProgressInLibrary, false);
    DownloadMonitorPanel.uninit();
  }, false);
  
})();