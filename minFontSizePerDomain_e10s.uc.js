// ==UserScript==
// @name           minFontSizePerDomain_e10s.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Min Font Size Per Domain
// @include        main
// @compatibility  Firefox 35-35
// @author         Alice0775
// @version        2014/10/10 00:00 e10s (eliminates docShell)
// @version        2014/10/09 12:00 use sqlite istead of prefs.js
// @version        2014/10/08 11:00 add acceskey, persist local directory
// @version        2014/10/07 20:00
// ==/UserScript==


var minFontSizePerDomain = {
  defaultMinSize: 16,    // default min font size
  
  // regular expression or wild card * ? +
  SITEINFO: [
    {url: "https?://docs.google.(com|co.jp)*" , size: 0},
    {url: /^https?:\/\/min\.size\.(com|co\.jp)./ , size: 20}, // ex. regular expression
    {url: "https?://min.size.(com|co.jp)*" , size: 20},       // ex. wild card: * ? +
    {url: "about:*" , size: 0}, // maybe not change
  ],
  

  aUrlMinSize: [],
  getParam: function() {
    return minFontSizePerDomain_storage.getAllminFontSizeData();
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    minFontSizePerDomain_storage.initDB();

    // cache to minimize accessing sqlite db
    this.initCache();

    // convert to regexp
    for (let i = 0; i < this.SITEINFO.length; i++) {
      let info = this.SITEINFO[i];
      let re = info.url;
      if (typeof re == "string") {
        re = new RegExp("^" + re.replace(/\./g, "\\.").replace(/\*/g, "."));
      this.SITEINFO[i].url = re;
      }
    }

    // frame script
    function content_setMinFontSize() {
      /*
      let { interfaces: Ci, utils: Cu } = Components;
      Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
      let wp = docShell.QueryInterface(Ci.nsIWebProgress);
      */
      addMessageListener("minFontSizePerDomain:setMinFontSize",
         function(msg) {
           docShell.contentViewer.minFontSize = Math.floor(msg.data.minFontSize / 0.016674);
         }
      )
    }
    window.messageManager.loadFrameScript("data:,(" + content_setMinFontSize.toString() + ")();", true);

    // Listeners
    window.addEventListener("unload", this, false);
    gBrowser.addProgressListener(this);

    // mmm for already loaded page
    this.setMinFontSize(gBrowser.selectedBrowser);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    gBrowser.removeProgressListener(this);
    minFontSizePerDomain_storage.closeDB();
  },

  initCache: function() {
    this.aUrlMinSize = this.getParam();
    this.defaultMinSize = minFontSizePerDomain_storage.getSizeByUrl("default_min_size") || this.defaultMinSize;
  },

  getDefaultSize: function() {
    return this.defaultMinSize;
  },

  getMinFontSize: function(aURI) {
    try {
      if (!/https?|ftp|file/.test(aURI.scheme)) {
        return 0;
      }
    } catch(e) {
      return 0;
    }

    try {
      var url = aURI.host;
      if (!url) {
        if (/^file:/i.test(aURI.spec)) {
          let tmp = gBrowser.currentURI.spec.split('/');
          tmp.pop();
          url = tmp.join('/');
          url = ioService.newURI(url, null, null).spec;
        }
      }
    } catch(e) {
      return null;
    }

    //userChrome_js.debug(encodeURIComponent(url));
    let minFontSize = this.aUrlMinSize[encodeURIComponent(url)];
    if (typeof minFontSize != "undefined") {
       //userChrome_js.debug(minFontSize);
       return minFontSize;
    }
    
    for (let i = 0; i < this.SITEINFO.length; i++) {
      let info = this.SITEINFO[i];
      let re = info.url;
      if (re.test(url)) {
        minFontSize = info.size;
        //userChrome_js.debug(minFontSize);
        return minFontSize;
      }
    }

    return this.defaultMinSize;
  },

  setMinFontSize: function(browser) {
    if (!browser.currentURI)
      return;
    let minFontSize = this.getMinFontSize(browser.currentURI);
    if (!minFontSize)
      return

    //markupDocViewer.minFontSize = Math.floor(minFontSize / 0.016674);
    browser.messageManager.sendAsyncMessage("minFontSizePerDomain:setMinFontSize", {
      minFontSize : minFontSize
    });
  },

  STATE_START: Ci.nsIWebProgressListener.STATE_START,
  STATE_STOP : Ci.nsIWebProgressListener.STATE_STOP,
  QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
                                         "nsISupportsWeakReference"]),

  onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {
    //userChrome_js.debug("onStateChange");
    // If you use myListener for more than one tab/window, use
    // aWebProgress.DOMWindow to obtain the tab/window which triggers the state change
    if (aFlag & this.STATE_START) {
        // This fires when the load event is initiated
    }
    if (aFlag & this.STATE_STOP) {
        // This fires when the load finishes
    }
  },

  onLocationChange: function(aWebProgress, aRequest, aLocationURI) {
    // This fires when the location bar changes; that is load event is confirmed
    // or when the user switches tabs. If you use myListener for more than one tab/window,
    // use aWebProgress.DOMWindow to obtain the tab/window which triggered the change.
    //userChrome_js.debug("onLocationChange");
    /*
    let docShell = aWebProgress.DOMWindow
                               .QueryInterface(Ci.nsIInterfaceRequestor)
                               .getInterface(Ci.nsIWebNavigation)
                               .QueryInterface(Ci.nsIDocShell);
    let markupDocViewer = docShell.contentViewer;
    */
    this.setMinFontSize(gBrowser.getBrowserForContentWindow(aWebProgress.DOMWindow));
  },

  // For definitions of the remaining functions see related documentation
  onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {},
  onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {},
  onSecurityChange: function(aWebProgress, aRequest, aState) {}
}



var minFontSizePerDomain_storage = {
  db: null,
  initDB: function() {
    let file = FileUtils.getFile("UChrm", ["minfontdize.sqlite"]);
    if (!file.exists()) {
      this.db = Services.storage.openDatabase(file);
      let stmt = this.db.createStatement(
        "CREATE TABLE minfontsize (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, size INTEGER)"
      );
      try {
        stmt.execute();
      } finally {
        stmt.finalize();
      }
    } else {
      this.db = Services.storage.openDatabase(file);
    }
  },

  closeDB: function() {
    try {
      this.db.close();
    } catch(e) {}
  },

  getAllminFontSizeData: function(url) {
    let aUrlMinSize = [];

    let stmt = this.db.createStatement(
      "SELECT url, size FROM minfontsize"
    );
    try {
      while (stmt.executeStep()) {
        let url         = stmt.row.url;
        let minFontSize = stmt.row.size;
        if (!!url)
          aUrlMinSize[url] = minFontSize;
      }
    } finally {
      stmt.finalize();
    }
    return aUrlMinSize;
  },

  getSizeByUrl: function(url) {
    let minfontsize = null;
    let stmt = this.db.createStatement(
      "SELECT size FROM minfontsize WHERE url = :url"
    );
    stmt.params['url'] = url;
    try {
      while (stmt.executeStep()) {
        minfontsize = stmt.row.size;
        break;
      }
    } finally {
      stmt.finalize();
    }
    return minfontsize;
  },

  setSizeByUrl: function(url, minFontSize) {
    if(this.getSizeByUrl(url) == null)
      this.insertSizeByUrl(url, minFontSize);
    else
      this.updateSizeByUrl(url, minFontSize);
  },

  insertSizeByUrl: function(url, minFontSize) {
    let stmt = this.db.createStatement(
      "INSERT INTO minFontSize (url, size) VALUES (:url, :size)"
    );
    stmt.params['url'] = url;
    stmt.params['size'] = minFontSize;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  updateSizeByUrl: function(url, minFontSize) {
    let stmt = this.db.createStatement(
      "UPDATE minFontSize SET size = :size WHERE url = :url"
    );
    stmt.params['size'] = minFontSize;
    stmt.params['url'] = url;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  deleteByUrl: function(url) {
    let stmt = this.db.createStatement(
      "DELETE FROM minFontSize WHERE url = :url"
    );
    stmt.params['url'] = url;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  }
}



var minFontSizePerDomain_menu = {

  init :function() {
    minFontSizePerDomain.init();

    let overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <menupopup id="contentAreaContextMenu"> \
          <menu id="minFontSizePerDomain" label="Minimum Font Size" accesskey="M"> \
            <menupopup id="minFontSizePerDomainMenupopup" \
                       onpopupshowing="minFontSizePerDomain_menu.onpopupshowing();"> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain26" label="26" oncommand="minFontSizePerDomain_menu.setSize(26);" accesskey="d"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain24" label="24" oncommand="minFontSizePerDomain_menu.setSize(24);" accesskey="c"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain22" label="22" oncommand="minFontSizePerDomain_menu.setSize(22);" accesskey="b"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain20" label="20" oncommand="minFontSizePerDomain_menu.setSize(20);" accesskey="a"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain18" label="18" oncommand="minFontSizePerDomain_menu.setSize(18);" accesskey="8"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain17" label="17" oncommand="minFontSizePerDomain_menu.setSize(17);" accesskey="7"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain16" label="16" oncommand="minFontSizePerDomain_menu.setSize(16);" accesskey="6"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain15" label="15" oncommand="minFontSizePerDomain_menu.setSize(15);" accesskey="5"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain14" label="14" oncommand="minFontSizePerDomain_menu.setSize(14);" accesskey="4"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain13" label="13" oncommand="minFontSizePerDomain_menu.setSize(13);" accesskey="3"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain12" label="12" oncommand="minFontSizePerDomain_menu.setSize(12);" accesskey="2"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain11" label="11" oncommand="minFontSizePerDomain_menu.setSize(11);" accesskey="1"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain10" label="10" oncommand="minFontSizePerDomain_menu.setSize(10);" accesskey="0"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain9" label="9" oncommand="minFontSizePerDomain_menu.setSize(9);" accesskey="9"/> \
              <menuseparator  id="minFontSizePerDomainMenuseparator"/> \
              <menuitem type="radio" name="minFontSizePerDomain" id="minFontSizePerDomain0" label="Reset" oncommand="minFontSizePerDomain_menu.setSize(0);" accesskey="R"/> \
              <menuseparator  id="minFontSizePerDomainMenuseparator2"/> \
              <menuitem id="minFontSizePerDomainDefault" label="Change Default" oncommand="minFontSizePerDomain_menu.changeDefaultSize();" accesskey="t"/> \
            </menupopup> \
          </menu> \
        </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, this);
  },

  observe: function() {
    
  },

  onpopupshowing: function() {
    let size = minFontSizePerDomain.getMinFontSize(gBrowser.currentURI) || 0;
    let menuitem = document.getElementById("minFontSizePerDomain" + size);
    if(menuitem)
      menuitem.setAttribute('checked',true);
  },

  setSize: function(val) {
    try {
      var url = encodeURIComponent(gBrowser.currentURI.host);
      if (!url) {
        if (/^file:/i.test(gBrowser.currentURI.spec)) {
          let tmp = gBrowser.currentURI.spec.split('/');
          tmp.pop();
          url = tmp.join('/');
          url = encodeURIComponent(ioService.newURI(url, null, null).spec);
        }
      }
    } catch(e) {
      return;
    }

    minFontSizePerDomain.aUrlMinSize[url] = val;
    if (val == 0) {
      delete minFontSizePerDomain.aUrlMinSize[url];
      minFontSizePerDomain_storage.deleteByUrl(url);
    } else
      minFontSizePerDomain_storage.setSizeByUrl(url, val);

    minFontSizePerDomain.setMinFontSize(gBrowser.selectedBrowser);
    this.broadcast(false);
  },

  changeDefaultSize: function() {
    let size = minFontSizePerDomain.defaultMinSize;
    
    let prompts = Services.prompt;
    let check = {value: false};                 // default the checkbox to false
    let input = {value: size};                  // default the edit field to size
    let result = prompts.prompt(null, "Min Font Size", "Default Min Font Size?", input, null, check);
    // result is true if OK is pressed, false if Cancel. input.value holds the value of the edit field if "OK" was pressed.
    if (result && input.value >= 0) {
      minFontSizePerDomain.defaultMinSize = input.value;
      minFontSizePerDomain_storage.setSizeByUrl("default_min_size", minFontSizePerDomain.defaultMinSize);
      this.broadcast(true);
    }
  },
  
  broadcast: function(allwindow) {
    let wm = Services.wm;
    let enumerator = wm.getEnumerator("navigator:browser");
    while(enumerator.hasMoreElements()) {
      let win = enumerator.getNext();
      // win is [Object ChromeWindow] (just like window), do something with it
      if (allwindow || win != window) {
        win.minFontSizePerDomain.initCache();
        win.minFontSizePerDomain.setMinFontSize(win.gBrowser.selectedBrowser);
      }
    }
  }
}

minFontSizePerDomain_menu.init();

