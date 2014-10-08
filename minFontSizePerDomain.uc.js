// ==UserScript==
// @name           minFontSizePerDomain.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Min Font Size Per Domain
// @include        main
// @compatibility  Firefox 24-35 (not e10s)
// @author         Alice0775
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
  
  handleEvenet: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    let obj = {};
    obj.url = /./;
    obj.size = this.defaultMinSize;
    this.SITEINFO.push(obj);
    window.addEventListener("unload", this, false);
    gBrowser.addProgressListener(this);
    // mmm for already loaded page
    this.setMinFontSize(gBrowser.markupDocumentViewer, gBrowser.currentURI);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    gBrowser.removeProgressListener(this);
  },

  setMinFontSize: function(markupDocViewer, aURI) {
    try {
      if (!/https?|ftp|file/.test(aURI.scheme)) {
        markupDocViewer.minFontSize = 0;
        return;
      }
    } catch(e) {
      markupDocViewer.minFontSize = 0;
      return;
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
      return;
    }

    //userChrome_js.debug(encodeURIComponent(url));
    let minFontSize = minFontSizePerDomain_menu.params[encodeURIComponent(url)];
    if (typeof minFontSize != "undefined") {
       markupDocViewer.minFontSize = Math.floor(minFontSize / 0.016674);
       //userChrome_js.debug(minFontSize);
       return;
    }
    
    for (let i = 0; i < this.SITEINFO.length; i++) {
      let info = this.SITEINFO[i];
      let re = info.url;
      if (typeof re == "string") {
        re = new RegExp("^" + re.replace(/\./g, "\\.").replace(/\*/g, "."));
      }
      //userChrome_js.debug(re.test(url));
      //userChrome_js.debug(re);
      //userChrome_js.debug(info.size);
      if (re.test(url)) {
        minFontSize = info.size;
        markupDocViewer.minFontSize = Math.floor(minFontSize / 0.016674)
        //userChrome_js.debug(minFontSize);
        return;
      }
    }
    markupDocViewer.minFontSize = 0;
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
    let docShell = aWebProgress.DOMWindow
                               .QueryInterface(Ci.nsIInterfaceRequestor)
                               .getInterface(Ci.nsIWebNavigation)
                               .QueryInterface(Ci.nsIDocShell);
    let markupDocViewer = docShell.contentViewer;
    this.setMinFontSize(markupDocViewer, aLocationURI);
  },

  // For definitions of the remaining functions see related documentation
  onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {},
  onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {},
  onSecurityChange: function(aWebProgress, aRequest, aState) {}
};

minFontSizePerDomain.init();


var minFontSizePerDomain_menu = {

  init :function() {
    this.getParam();

    var overlay = ' \
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
            </menupopup> \
          </menu> \
        </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, this);
  },

  observe: function() {
    
  },

  onpopupshowing: function(val) {
    var size = Math.floor(gBrowser.markupDocumentViewer.minFontSize * 0.016674 + 0.5);
    var menuitem = document.getElementById("minFontSizePerDomain" + size);
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

    this.params[url] = val;

    var str = "";
    for (let url in this.params) {
      if (!!url) {
        if (this.params[url] != 0)
          str += url + "<>" + this.params[url] + "><";
      }
    }
    str = str.replace(/><$/, "");
    Services.prefs.setCharPref("userChrome.minFontSizePerDomain.param", str);
    minFontSizePerDomain_menu.getParam();

    minFontSizePerDomain.setMinFontSize(gBrowser.markupDocumentViewer, gBrowser.currentURI);
  },

  params: [],
  getParam: function() {
    try {
      var str = Services.prefs.getCharPref("userChrome.minFontSizePerDomain.param");
    } catch(e) {
      str ="";
    }  
    this.params = [];
    var sites = str.split("><");
    for (var i = 0; i< sites.length; i++) {
      var [url, size] = sites[i].split("<>");
      this.params[url] = size;
    }
  }
}

minFontSizePerDomain_menu.init();
