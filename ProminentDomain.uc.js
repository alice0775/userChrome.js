// ==UserScript==
// @name           ProminentDomain.uc.js
// @namespace
// @description    Prominent Domain
// @include        main
// @compatibility  Firefox 6.0 7.0
// @author
// @version        2012/05/13 23:00 by Alice0775  Bug 754498 - Domain should not be highlighted in the address bar when the URL differs from the page 
// @version        2012/01/31 11:00 by Alice0775  12.0a1 about:newtab
// @version        2011/06/24 data:等は無視
// @version        2011/06/24 Bug 665580
// @version        2011/06/10
// @Note
// ==/UserScript==

var ProminentDomain = {

  init0: function() {
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      if (xpPref.getBoolPref("browser.urlbar.formatting.enabled"))
        return;
    } catch(ex) {}
    try{
      if (xpPref.getBoolPref("browser.urlbar.trimURLs"))
        return;
    } catch(ex) {}

    // xxx Bug 660391 - After closing Print preview, the favicon and the domain name highlighting disappears from the navigation bar, and Back/Forward buttons are disabled
		if ('PrintUtils' in window  &&
		    !/gNavToolbox\.collapsed/.test(PrintPreviewListener._toggleAffectedChrome.toString())) {
      if (!/ProminentDomain/.test(PrintUtils.exitPrintPreview.toSource()))
  			eval('PrintUtils.exitPrintPreview = '+PrintUtils.exitPrintPreview.toString().replace(
  				/}$/,
  				'ProminentDomain.onPrintPreviewExit(); }'
  			));
		}

    if (!document.getElementById("textbox-input-box-button")) {
      var icons = document.getElementById("urlbar-icons");
      this.label = document.createElementNS("http://www.w3.org/1999/xhtml", "button");
      this.label.setAttribute("id", "textbox-input-box-button");
      this.label.setAttribute("class", "textbox-input-box");
      this.label.style.setProperty("-moz-appearance", "textfield", "important");
      this.label.style.setProperty("border", "0px", "");
      this.label.style.setProperty("padding", "0px", "");
      this.label.style.setProperty("margin-left", "-3px", "");
      this.label.style.setProperty("background-color", "transparent", "");
      this.label.style.setProperty("visibility", "collapse", "");
      this.label.textContent = "";
      icons.insertBefore(this.label, icons.firstChild);
    }

    this.init();

    var self = this;

    gURLBar.addEventListener("ValueChange", function() {
      if (!self.hasFocus)
      {
        self.prettyView();
      }
    }, false);
    gURLBar.addEventListener("blur", function() {
      self.hasFocus = false;
      self.prettyView();
    }, true);
    gURLBar.addEventListener("focus", function() {
      self.hasFocus = true;
      self.plainView();
    }, true);

    document.getElementById("cmd_CustomizeToolbars").addEventListener("DOMAttrModified", function(aEvent) {
      if (aEvent.attrName == "disabled" && !aEvent.newValue)
      {
        self.init();
        self.prettyView();
        dump("Initialized Prominent Domain");
      }
    }, false);
    if (document.focusedElement != gURLBar)
    gURLBar.value = "";
    setTimeout(function(self){
      gURLBar.value = gURLBar.value || gBrowser.currentURI.spec;
      self.prettyView();
    }, 250, this);
  },

  init: function() {
    if (!gURLBar ||
        !document.getAnonymousElementByAttribute(gURLBar, "anonid", "input") ||
        !document.getAnonymousElementByAttribute(gURLBar, "anonid", "input")
                .QueryInterface(Components.interfaces.nsIDOMNSEditableElement).editor)
      return;

    this.nNormal = document.createElementNS("http://www.w3.org/1999/xhtml", "label");
    this.nNormal.appendChild(document.createTextNode(""));

    this.nStrong = document.createElementNS("http://www.w3.org/1999/xhtml", "label");
    this.nStrong.style.color='blue';
    this.nStrong.style.marginLeft = this.nStrong.style.marginRight = "0.0em";
    this.nStrong.appendChild(document.createTextNode(""));

    this.nBase = document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").QueryInterface(Components.interfaces.nsIDOMNSEditableElement).editor.rootElement;

    var self = this;
    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").
      addEventListener("overflow", function() {
        self.label.textContent = "...";
      }, false);

    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").
      addEventListener("underflow", function() {
        self.label.textContent = "";
      }, false);
  },
  
  onPrintPreviewExit: function() {
    if ( typeof PrintPreviewListener._toggleAffectedChrome == "function" &&
        !/gNavToolbox\.collapsed/.test(PrintPreviewListener._toggleAffectedChrome))
      this.init();
    this.prettyView();
  },

  prettyView: function()
  {
    var aURI = gURLBar.value;
    if (/^(data:|javascript:|chrome:|view-|about:)/.test(aURI))
      return;
    var ioService = Components.classes['@mozilla.org/network/io-service;1']
                      .getService(Components.interfaces.nsIIOService);
    try {
      //aURI =  ioService.newURI(aURI, null, null).spec;
      aURI =  losslessDecodeURI(ioService.newURI(aURI, null, null))
    } catch(ex) {}
    if (!/^(.+?\/\/(?:[^\/]+@)?)(.+?)((:\d+)?(\/.*)?)$/.test(aURI))
    {
      return;
    }
    //xxx Bug 754498
    try {
      if (ioService.newURI(gURLBar.value, null, null).spec != gBrowser.selectedTab.linkedBrowser.currentURI.spec)
        return;
    } catch(ex) {
      return;
    }
    
    if ("isBlankPageURL" in window ? !isBlankPageURL(aURI) : aURI != "about:blank")
      gURLBar.removeAttribute("isempty");
    this.label.style.setProperty("visibility", "visible", "");

    while (this.nBase.hasChildNodes())
    {
      this.nBase.removeChild(this.nBase.lastChild);
    }
    var a1 = RegExp.$1;
    var a2 = RegExp.$2;
    var a3 = RegExp.$3;
    //alert (a1 +"   ,   "+ a2 +"   ,   "+ a3)
    var tld = this.getValidTld(aURI);
    //alert(tld.replace(/^\[/, "\\[").replace(/\]$/, "\\]")+"$")
    var r = new RegExp(tld.replace(/^\[/, "\\[").replace(/\]$/, "\\]")+"$", "");
    a1 += a2.replace(r, '');
    [a1, tld, a3].forEach(function(aPart, aIx) {
      var node = (aIx == 1 ? this.nStrong : this.nNormal).cloneNode(true);
      node.firstChild.nodeValue = aPart;
      this.nBase.appendChild(node);
    }, this);
  },

  plainView: function()
  {
    if (gURLBar.value == "") return; //←追加
    this.label.style.setProperty("visibility", "collapse", "");

    this.nBase.replaceChild(document.createTextNode(gURLBar.value), this.nBase.firstChild);
    while (this.nBase.childNodes.length > 1)
    {
      this.nBase.removeChild(this.nBase.lastChild);
    }
    gURLBar.select();
  },

  getValidTld: function(aURI){
    try {
      var ioService = Components.classes['@mozilla.org/network/io-service;1']
                      .getService(Components.interfaces.nsIIOService);
      aURI = ioService.newURI(aURI, null, null);
      var host = aURI.host;
    } catch(e) {
      if (aURI.match(/^(.+?\/\/(?:[^\/]+@)?)((?::\d+)?[^\/]+)(.*)$/)) {
        var host = RegExp.$2;
      } else {
        return "";
      }
    }
    var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"]
                  .getService(Components.interfaces.nsIEffectiveTLDService);
    try {
      var tld = eTLDService.getBaseDomainFromHost(host);
      if (host.indexOf(tld) > -1)
        return tld;
      else
        return host;
    } catch(e) {
      if (/::/.test(host))
        host = "[" + host + "]";
      return host;
    }
  },

  debug: function(aMsg){
    Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService)
      .logStringMessage(aMsg);
  }
}
ProminentDomain.init0();

