// ==UserScript==
// @name           launchMainWindowFrom.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ダウンロードマネージャーからメインウインドウを再構築
// @include        *
// @exclude        chrome://browser/content/browser.xul
// @compatibility  Firefox 3.0 more
// @author         Alice0775
// @version        2009/12/12 TypeがあったのでZZZ-inspectChrome.uc.jsが無いと動かなかった
// @version        2009/12/12
// @note           ZZZ-inspectChrome.uc.jsがある場合はZZZ-inspectChrome.uc.jsの方が先に動くようにしておく
// ==/UserScript==

var launchMainWindowFrom = {

  newPopup: null,
  menuitem: null,

  init: function() {

    if (!document.documentElement.hasAttribute("context")) {
      this.newPopup = document.createElement("popup");
      this.newPopup.setAttribute("id", "launchMainWindowFrom-popup");
      document.documentElement.setAttribute("context", this.newPopup.id);
    } else {
      var id = document.documentElement.getAttribute("context");
      this.newPopup = document.getElementById(id);
    }

    this.menuitem = this.newPopup.appendChild(document.createElement("menuitem"));
    this.menuitem.setAttribute("id", "launchMainWindowFrom-menuitem");
    this.menuitem.setAttribute("label", "Launch Main Window");
    this.menuitem.setAttribute("accesskey","L");
    this.menuitem.setAttribute("oncommand", "launchMainWindowFrom.openBrowserWindow();");

    if (!document.getElementById("mainPopupSet")) {
      var popup = document.documentElement.appendChild(document.createElement("popupset"));
      popup.setAttribute("id", "mainPopupSet");
    }
    document.getElementById("mainPopupSet").appendChild(this.newPopup);

    this.newPopup.addEventListener("popupshowing", this, false);
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    this.newPopup.removeEventListener("popupshowing", this, false);
    window.removeEventListener("unload", this, false);
  },

  isExistMainWindow: function() {
    var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    if(mediator.getMostRecentWindow("navigator:browser"))
      return true;
    return false;
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case "popupshowing":
        this.onPopupshowing();
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  onPopupshowing: function(aEvent) {
    if (this.isExistMainWindow()) {
      this.menuitem.setAttribute("hidden", true);
    } else {
      this.menuitem.removeAttribute("hidden");
    }
    if ('gContextMenu' in window &&
        gContextMenu ||
        document.popupNode instanceof HTMLElement) {
      return false;
    }
    return true;
  },

  openBrowserWindow: function() {
    var charsetArg = new String();
    var handler = Components.classes["@mozilla.org/browser/clh;1"]
                            .getService(Components.interfaces.nsIBrowserHandler);
    var defaultArgs = handler.defaultArgs;
    var wintype = "navigator:browser"; //document.documentElement.getAttribute('windowtype');

    // if and only if the current window is a browser window and it has a document with a character
    // set, then extract the current charset menu setting from the current document and use it to
    // initialize the new browser window...
    var win;
    if (window && (wintype == "navigator:browser") && window.content && window.content.document)
    {
      var DocCharset = window.content.document.characterSet;
      charsetArg = "charset="+DocCharset;

      //we should "inherit" the charset menu setting in a new window
      win = window.openDialog("chrome://browser/content/", "_blank", "chrome,all,dialog=no", defaultArgs, charsetArg);
    }
    else // forget about the charset information.
    {
      win = window.openDialog("chrome://browser/content/", "_blank", "chrome,all,dialog=no", defaultArgs);
    }

    return win;
  }
}

launchMainWindowFrom.init();
