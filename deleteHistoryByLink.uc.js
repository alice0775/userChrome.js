// ==UserScript==
// @name           deleteHistoryByLink.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    リンクのソースを表示, 中クリックで新規タブ, 右クリックでサイドバー
// @include        main
// @compatibility  Firefox 4.0
// @author         alice0775
// @version        2011/04/15
// ==/UserScript==
var deleteHistoryByLink = {
  popup: null,
  menuitem: null,
  init: function() {
    if ( window.location.href == "chrome://browser/content/web-panels.xul") {
      var browser = document.createElement("web-panels-browser");
      if (!/^(http|ftp|file)/.test(content.location.href))
        return;
    }
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id","context-deleteHistoryByLink");
    menuitem.setAttribute("label","Delete History By Link");
    menuitem.setAttribute("accesskey","L");
    menuitem.setAttribute("oncommand","deleteHistoryByLink.deleteHistory();");

    var popup = document.getElementById("contentAreaContextMenu");
    var refitem = document.getElementById("context-sep-copylink");
    popup.insertBefore(menuitem, refitem);
    popup.addEventListener("popupshowing", this, false);
    this.popup = popup;
    this.menuitem = menuitem;

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

    this.showItem(this.menuitem, this.onLink && isLinkViewable);
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

  get linkURL() {
    return (this.target) ? this.target.href : null;
  },

  get linkURI() {
    try {
  		return makeURI(this.linkURL);
    } catch (ex) {
      return null;
    }
  },

  showItem:function(menu, show){
    if (menu)
      (show) ? menu.removeAttribute('hidden')
             : menu.setAttribute('hidden', true)
  },

  onclick: function(aEvent) {
    var target = document.popupNode;
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

  deleteHistory: function() {
    var url = this.linkURL;
    try {
  		var uri = makeURI(url);
  		var bhist = PlacesUtils.history.QueryInterface(Ci.nsIBrowserHistory);
  		bhist.removePage(uri);
  		//repaint
  		var p = this.target.parentNode;
  		var next = this.target.nextSibling;
  		var elm = p.removeChild(this.target);
      this.target = p.insertBefore(elm, next);
    } catch (ex) {
      return;
    }
  },

  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case 'popupshowing':
        this.popupshowing(aEvent);
        break;
      case 'command':
        this.deleteHistory(aEvent);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }

}
deleteHistoryByLink.init();
