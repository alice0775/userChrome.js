// ==UserScript==
// @name           contextScanWithVirusTotal.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    scan with Virus Total
// @include        main
// @compatibility  Firefox 23
// @author         Alice0775
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
    let overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <menupopup id="contentAreaContextMenu"> \
          <menuitem id="context-scanWithVirusTotal" label="Scan with VirusTotal" \
                    tooltip="aHTMLTooltip" \
                    accesskey="V" \
                    oncommand="scanWithVirusTotal.scan();" \
                    insertbefore="context-bookmarklink"/> \
        </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, scanWithVirusTotal);
  },

  observe: function(){
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this, false);
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
    window.removeEventListener("unload", this, false);
  },

  onpopupshowing: function(event) {
    this.linkURL = this.getPlainTextLink();
    if (gContextMenu.onLink) {
      this.linkURL = gContextMenu.linkURL;
    } else if (gContextMenu.onCanvas || gContextMenu.onImage ||
               gContextMenu.onVideo || gContextMenu.onAudio) {
      this.linkURL = gContextMenu.mediaURL;
    }
    let menuitem = document.getElementById("context-scanWithVirusTotal");
    menuitem.hidden = !this.linkURL;
    menuitem.setAttribute("tooltiptext", "Scan: " + this.linkURL);
  },

  getPlainTextLink: function() {
    if (!(gContextMenu.onLink || gContextMenu.onCanvas || gContextMenu.onImage ||
          gContextMenu.onVideo || gContextMenu.onAudio)) {
      // Ok, we have some text, let's figure out if it looks like a URL.
      let selection =  document.commandDispatcher.focusedWindow
                               .getSelection();
      let linkText = selection.toString().trim() || readFromClipboard().trim();
      if (!!linkText)
        return this.getTextLink(linkText);
    }
    return null;
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
    openUILinkIn(url, 'tab');
  }
}
scanWithVirusTotal.init();
