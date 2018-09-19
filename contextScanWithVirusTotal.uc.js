// ==UserScript==
// @name           contextScanWithVirusTotal.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    scan with Virus Total
// @include        main
// @compatibility  Firefox 56+
// @author         Alice0775
// @version        2018/09/18 e10s and remove overlay
// @version        2013/09/03 open child tab if tree style tab installed
// @version        2012/01/07
// @Note
// ==/UserScript==
var scanWithVirusTotal = {
  handleEvent: function(event) {
    switch (event.type) {
      case "popupshowing":
        this.onpopupshowing(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    let menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "context-scanWithVirusTotal");
    menuitem.setAttribute("label", "Scan with VirusTotal");
    menuitem.setAttribute("tooltip", "aHTMLTooltip");
    menuitem.setAttribute("accesskey", "V");
    menuitem.setAttribute("oncommand", "scanWithVirusTotal.scan();");
    let ref = document.getElementById("context-bookmarklink");
    ref.parentNode.insertBefore(menuitem, ref);

    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this, false);
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
    window.removeEventListener("unload", this, false);
  },

  onpopupshowing: function(event) {
    if (gContextMenu.onLink) {
      this.linkURL = gContextMenu.linkURL;
    } else if (gContextMenu.onCanvas || gContextMenu.onImage ||
               gContextMenu.onVideo || gContextMenu.onAudio) {
      this.linkURL = gContextMenu.mediaURL;
    } else if (gContextMenu.isTextSelected) {
      this.linkURL = this.getTextLink(gContextMenu.selectionInfo.fullText);
    }
    if (!this.linkURL) {
      this.linkURL = this.getTextLink(readFromClipboard());
    }
    let menuitem = document.getElementById("context-scanWithVirusTotal");
    menuitem.hidden = !this.linkURL;
    menuitem.setAttribute("tooltiptext", "Scan: " + this.linkURL);
  },

  getTextLink: function(linkText) {
    let uri;
    if (/^(?:https?|ftp):/i.test(linkText)) {
      try {
        uri = makeURI(linkText);
      } catch (ex) {}
    }
    // Check if this could be a valid url, just missing the protocol.
    else if (/^(?:\w+\.)+\D\S*$/.test(linkText) ||
             /^(?:[a-z\d-]+\.)+[a-z]+$/i.test(linkText)) {
      let uriFixup = Cc["@mozilla.org/docshell/urifixup;1"]
                       .getService(Ci.nsIURIFixup);
      try {
        uri = uriFixup.createFixupURI(linkText, uriFixup.FIXUP_FLAG_NONE);
      } catch (ex) {}
    }

    if (uri && uri.host) {
      return uri.spec;
    }
    return null;
  },

  scan: function() {
    let url = "https://www.virustotal.com/url/submission/?force=1&url=" + escape(this.linkURL);
    if ("TreeStyleTabService" in window)
      TreeStyleTabService.readyToOpenChildTab(gBrowser.selectedTab, false);
    openUILinkIn(url, 'tab');
  }
}
scanWithVirusTotal.init();
