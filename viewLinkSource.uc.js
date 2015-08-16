// ==UserScript==
// @name           viewLinkSource.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    リンクのソースを表示, 中クリックで新規タブ, 右クリックでサイドバー
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @include        chrome://browser/content/web-panels.xul
// @compatibility  Firefox 3.0 3.1 3.2
// @author         zeniko
// @version        2015/04/12 gContextMenu.target instead of document.popupNode;
// @version        2009/05/19 source view windowのリンクからもView Link Sourceできるように
// @version        2008/12/23 Fx 3.0 3.1 3.2
// @version        2008/04/15 loadURIの使用やめ
// @Modified by    Alice0775
// ==/UserScript==
// @version   2008/04/01 00:00
var viewLinkSource = {
  popup: null,
  init: function() {
    if ( window.location.href == "chrome://browser/content/web-panels.xul") {
      var browser = document.createElement("web-panels-browser");
      if (!/^(http|ftp|file)/.test(content.location.href))
        return;
    }
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id","context-viewlinksource");
    menuitem.setAttribute("label","View Link Source");
    menuitem.setAttribute("accesskey","V");
    menuitem.setAttribute("oncommand","viewLinkSource.viewLinkSource()");
    menuitem.setAttribute("onclick","viewLinkSource.viewLinkSource(event)");
    var refitem;
    var popup = document.getElementById("contentAreaContextMenu");
    if (popup) {
      refitem = document.getElementById("context-viewsource").nextSibling;
    } else {
      popup = document.getElementById("viewSourceContextMenu");
      if (popup){
        popup.insertBefore(document.createElement("menuseparator"), null);
        refitem = null;
      }
    }
    if (popup) {
      popup.insertBefore(menuitem, refitem);
      popup.addEventListener("popupshowing", this, false);
      this.popup = popup;
    }
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    if (this.popup) {
      this.popup.removeEventListener("popupshowing", this, false);
    }
    window.removeEventListener("unload", this, false);
  },

  popupshowing: function(aEvent) {
    this.onclick(aEvent);
    var schemes = "https?|ftp|file|data|resource|chrome|about|jar|view-source";
    var regScheme = new RegExp(schemes, "i");
    var isLinkViewable = regScheme.test(this.linkProtocol);

    this.showItem("context-viewlinksource", this.onLink && isLinkViewable);
  },

  target: null,

  get linkProtocol() {
    if (this.linkURI)
      return this.linkURI.scheme; // can be |undefined|

    return null;
  },

  get onLink() {
    return !!this.target;
  },

  get link() {
    return (this.target) ? this.target.href : null;
  },

  get linkURL() {
    return (this.target) ? this.target.href : null;
  },

  get linkURI() {
    var ioService = Cc["@mozilla.org/network/io-service;1"].
                    getService(Ci.nsIIOService);
    try {

      return ioService.newURI(this.linkURL, null, null);
    }
    catch (ex) {
     // e.g. empty URL string
    }

    return null;
  },

  showItem:function(id, show){
    var menu = document.getElementById(id);
    if (menu)
      (show) ? menu.removeAttribute('hidden')
             : menu.setAttribute('hidden', true)
  },

  onclick: function(aEvent) {
    var target = gContextMenu.target; //document.popupNode;
    this.target = null;
    while (target.nodeType == Node.ELEMENT_NODE) {
      try {
        if ((target instanceof HTMLAnchorElement && target.href) ||
            (target instanceof HTMLAreaElement && target.href) ||
            target instanceof HTMLLinkElement ||
            target.getAttributeNS("http://www.w3.org/1999/xlink", "type") == "simple")
          this.target = target;
      } catch (e) { }
      target = target.parentNode;
    }
  },

  viewLinkSource: function(aEvent) {
    try {
      this.browser.mPrefs.getBoolPref("viewSourceInTab.loadInNewTab");
    } catch(ex) {
      this.browser.mPrefs.setBoolPref("viewSourceInTab.loadInNewTab", true);
    }

    try {
      this.browser.mPrefs.getBoolPref("viewSourceInTab.loadInBackground");
    } catch(ex) {
      this.browser.mPrefs.setBoolPref("viewSourceInTab.loadInBackground", false);
    }

    var url = this.link;
    if (/^view-source:/.test(url))
      url = url.replace(/^view-source:/, '');
    if(aEvent && aEvent.button !=0) {
      aEvent.stopPropagation();
      switch(aEvent.button) {
        case 1:
          if(this.browser.mPrefs.getBoolPref("viewSourceInTab.loadInNewTab")) {
            var newTab = this.browser.addTab("view-source:" + url); //view source in new tab
            if(!this.browser.mPrefs.getBoolPref("viewSourceInTab.loadInBackground"))
              this.browser.selectedTab = newTab;  //focus new tab
          } else this.browser.loadURI("view-source:" + url);   //view source in current tab
          break;
        case 2:
          this.browserWindow.openWebPanel(url, "view-source:" + url); //view source in sidebar
          break;
      }
      closeMenus(aEvent.target);
    } else {
      if(aEvent && aEvent.button ==0) return;;
      if(typeof this.browserWindow.gViewSourceUtils == 'object'){
        this.ViewSourceOfURL(url);
      }else{
        this.browserWindow.BrowserViewSourceOfURL(url);
      }
    }
  },

  ViewSourceOfURL: function(aURL, aPageDescriptor, aDocument)
  {
    if (getBoolPref("view_source.editor.external", false)) {
      this.browserWindow.gViewSourceUtils.openInExternalEditor(aURL, aPageDescriptor, aDocument);
    }
    else {
      this.browserWindow.gViewSourceUtils.openInInternalViewer(aURL, aPageDescriptor, aDocument);
    }
  },

  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case 'popupshowing':
        this.popupshowing(aEvent);
        break;
      case 'click':
      case 'command':
        this.viewLinkSource(aEvent);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  get WindowMediator() {
    if (!this._WindowMediator) {
      this._WindowMediator = Components
          .classes['@mozilla.org/appshell/window-mediator;1']
          .getService(Components.interfaces.nsIWindowMediator);
    }
    return this._WindowMediator;
  },
  _WindowMediator : null,

  get browserWindow()
  {
    return this.WindowMediator.getMostRecentWindow('navigator:browser');
  },

  get browser()
  {
    var w = this.browserWindow;
    return !w ? null :
      'SplitBrowser' in w ? w.SplitBrowser.activeBrowser :
      w.gBrowser ;
  }
}
viewLinkSource.init();
