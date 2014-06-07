// ==UserScript==
// @name           ZZZZ-launchMainWindowFrom.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ダウンロードマネージャーからメインウインドウを再構築
// @include        *
// @exclude        chrome://browser/content/browser.xul
// @compatibility  Firefox 3.0 more
// @author         Alice0775
// @version        2014/06/07 fix
// @version        2014/06/07 menupopup
// @version        2009/12/12 TypeがあったのでZZZ-inspectChrome.uc.jsが無いと動かなかった
// @version        2009/12/12
// @note           ZZZ-inspectChrome.uc.jsがある場合はZZZ-inspectChrome.uc.jsの方が先に動くようにしておく
// ==/UserScript==

var launchMainWindowFrom = {

  init: function() {
    let menuitem = document.createElement("menuitem");
    menuitem.setAttribute("class", "launchMainWindowFrom-menuitem");
    menuitem.setAttribute("label", "Launch Main Window");
    menuitem.setAttribute("accesskey","L");
    menuitem.setAttribute("oncommand", "launchMainWindowFrom.openBrowserWindow();");

    let menupopup = null;
    if (!document.documentElement.hasAttribute("context")) {
      menupopup = document.createElement("menupopup");
      menupopup.setAttribute("id", "launchMainWindowFrom-popup");
      document.documentElement.appendChild(menupopup);
      document.documentElement.setAttribute("context", "launchMainWindowFrom-popup");
    }

    let menupopups = document.getElementsByTagName("menupopup");
    for(let i= 0; i < menupopups.length; i++) {
      let menupopup = menupopups[i];
      menupopup.appendChild(menuitem.cloneNode(true));
      menupopup.addEventListener("popupshowing", this, false);
    }
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
        this.onPopupshowing(aEvent);
        break;
    }
  },

  onPopupshowing: function(aEvent) {
    let menupopup = aEvent.target;
    let menuitems = menupopup.getElementsByClassName("launchMainWindowFrom-menuitem");
    if (menuitems.length < 1)
      return;
    if (this.isExistMainWindow()) {
      menuitems[0].setAttribute("hidden", true);
    } else {
      menuitems[0].removeAttribute("hidden");
    }
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
  },

  debug: function(str) {
        Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
        .logStringMessage(str);
  }
}

launchMainWindowFrom.init();
