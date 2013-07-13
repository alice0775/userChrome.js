// ==UserScript==
// @name           ProminentDomain.uc.js
// @namespace
// @description    Prominent Domain
// @include        main
// @compatibility  Firefox 6.0 7.0
// @author
// @version        2013/07/12 17:00 by Alice0775  reset horizontal scroll
// @version        2012/12/05 21:00 by Alice0775  fixed getValidTld 
// ==/UserScript==
// @version        2012/11/24 23:00 by Alice0775  fixed key navigation
// @version        2012/05/13 23:00 by Alice0775  Bug 754498 - Domain should not be highlighted in the address bar when the URL differs from the page 
// @version        2012/01/31 11:00 by Alice0775  12.0a1 about:newtab
// @version        2011/06/24 data:等は無視
// @version        2011/06/24 Bug 665580
// @version        2011/06/10
// @Note

var ProminentDomain = {

  init0: function() {
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      if (xpPref.setBoolPref("browser.urlbar.formatting.enabled", false))
        return;
    } catch(ex) {}
    try{
      if (xpPref.setBoolPref("browser.urlbar.trimURLs", false))
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

    if (!(this.label = document.getElementById("textbox-input-box-button"))) {
      var icons = document.getElementById("urlbar-icons");
      this.label = document.createElement("label");
      this.label.setAttribute("id", "textbox-input-box-button");
      //this.label.setAttribute("class", "textbox-input-box");
      this.label.style.setProperty("-moz-appearance", "label", "important");
      this.label.style.setProperty("border", "0px", "");
      this.label.style.setProperty("padding", "0px", "");
      this.label.style.setProperty("margin-left", "-3px", "");
      this.label.style.setProperty("margin-right", "-3px", "");
      this.label.style.setProperty("background-color", "transparent", "");
      this.label.style.setProperty("visibility", "collapse", "");
      this.label.textContent = "";
      icons.insertBefore(this.label, icons.firstChild);
    }

    this.init();

    var self = this;
    window.addEventListener("unload", this, false);
    gBrowser.addProgressListener(this);
    gNavToolbox.addEventListener("aftercustomization", this, false);

    // observ placeContent tree view change
    // create an observer instance
    this.observer1 = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type == "attributes" &&
            mutation.attributeName == "focused") {
          ProminentDomain.debug("onFocusChange");
          if (ProminentDomain._timer)
            clearTimeout(ProminentDomain._timer);
          if (mutation.target.getAttribute(mutation.attributeName) == "true" &&
              gURLBar.getAttribute("pageproxystate") !="invalid" )
            ProminentDomain.plainView();
          else
            ProminentDomain.prettyView();
        }
      });   
    });
    // configuration of the observer:
    var config1 = { attributes: true }
    // pass in the target node, as well as the observer options
    this.observer1.observe(gURLBar, config1);

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

    this.nBase = document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").
                 QueryInterface(Components.interfaces.nsIDOMNSEditableElement).editor.rootElement;

    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").
             addEventListener("overflow", this, false);
    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").
             addEventListener("underflow", this, false);
  },

  uninit: function(){
    window.removeEventListener("unload", this, false);
    gBrowser.removeProgressListener(this);
    gNavToolbox.removeEventListener("aftercustomization", this, false);
    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").
             removeEventListener("overflow", this, false);
    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").
             removeEventListener("underflow", this, false);

    //stop observing
    if (this.observer1)
      this.observer1.disconnect();
  },

  handleEvent: function(event){
    switch(event.type) {
      case "aftercustomization":
        this.onAftercustomization();
        break;
      case "overflow":
        this.label.textContent = "...";
        break;
      case "underflow":
        this.label.textContent = "";
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  onAftercustomization: function() {
      this.init();
      this.prettyView();
  },

  QueryInterface: function(aIID) {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) { },
 
  onLocationChange: function(aProgress, aRequest, aURI) {
   // This fires when the location bar changes; that is load event is confirmed
   // or when the user switches tabs. If you use myListener for more than one tab/window,
   // use aProgress.DOMWindow to obtain the tab/window which triggered the change.
    if (aProgress.DOMWindow == content) {
      ProminentDomain.debug("onLocationChange");
      if (ProminentDomain._timer)
        clearTimeout(ProminentDomain._timer);
      ProminentDomain._timer = setTimeout(function(){
        if (gURLBar.getAttribute("focused") != "true")
          ProminentDomain.prettyView();
        else
          ProminentDomain.plainView();
      }, 0);
    }
  },
 
  // For definitions of the remaining functions see related documentation
  onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) { },
  onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) { },
  onSecurityChange: function(aWebProgress, aRequest, aState) { },

  onPrintPreviewExit: function() {
    if ( typeof PrintPreviewListener._toggleAffectedChrome == "function" &&
        !/gNavToolbox\.collapsed/.test(PrintPreviewListener._toggleAffectedChrome))
      this.init();
    this.prettyView();
  },

  prettyView: function()
  {
    this.debug("prettyView");
    //xxx Bug 754498
    if(gURLBar.getAttribute("pageproxystate") == "invalid")
      return;

    var aURI = gURLBar.value;
    if (aURI == "") return; //←追加

    if (/^(data:|javascript:|chrome:|view-|about:)/.test(aURI))
      return;
    var ioService = Components.classes['@mozilla.org/network/io-service;1']
                      .getService(Components.interfaces.nsIIOService);
    try {
      //aURI =  ioService.newURI(aURI, null, null).spec;
      aURI =  losslessDecodeURI(ioService.newURI(aURI, null, null));
    } catch(ex) {}
    if (!/^(.+?\/\/(?:[^\/]+@)?)(.+?)((:\d+)?(\/.*)?)$/.test(aURI)) {
      return;
    }
    
    //if ("isBlankPageURL" in window ? !isBlankPageURL(aURI) : aURI != "about:blank")
    //  gURLBar.removeAttribute("isempty");
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
    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").selectionStart = 0;
    document.getAnonymousElementByAttribute(gURLBar, "anonid", "input").selectionEnd = 0;
  },

  plainView: function()
  {
    this.debug("plainView");
    this.label.style.setProperty("visibility", "collapse", "");
    if (gURLBar.value == "") return; //←追加

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
      var aURI2 = ioService.newURI(aURI, null, null);
      var host = aURI2.host;
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
    return;
    Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService)
      .logStringMessage(aMsg);
  }
}
ProminentDomain.init0();

