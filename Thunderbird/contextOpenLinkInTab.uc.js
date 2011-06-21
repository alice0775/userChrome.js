// ==UserScript==
// @name           contextOpenLinkInTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    context menu "Open Link In Tab"
// @include        *
// @compatibility  Tb3
// @modifier       Alice0775
// @version        2009/12/11 Tb3
// ==/UserScript==


var ucjs_OpenLinkInTab = {

  contextmenu: null,

  init: function( ){
    this.contextmenu = document.getElementById("mailContext");
    if (!this.contextmenu)
      return;
    var target = document.getElementById("mailContext-openInBrowser");
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("label", "Open Link In Tab");
    menuitem.setAttribute("id", "contextOpenLinkInTab_menu");
    menuitem.setAttribute("oncommand", "ucjs_OpenLinkInTab.openLinkInTab(event);");
    target.parentNode.insertBefore(menuitem, target);

    this.contextmenu.addEventListener("popupshowing", this, false);
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    this.contextmenu.removeEventListener("popupshowing", this, false);
    window.removeEventListener("unload", this, false);
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case "popupshowing":
        this.onPopupshowing(aEvent);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  onPopupshowing: function(aEvent) {
    document.getElementById("contextOpenLinkInTab_menu").hidden = !gContextMenu.onLink;
  },

  openLinkInTab: function(aEvent) {
    var background = aEvent.shiftKey;

    var uri = gContextMenu.linkURL;

    var mailWindow = Components.classes['@mozilla.org/appshell/window-mediator;1']
                    .getService(Components.interfaces.nsIWindowMediator)
                    .getMostRecentWindow("mail:3pane");

    if (!background)
      mailWindow.focus();

    var reg = new RegExp(/.*/);//    new RegExp("^" + uri.prePath.replace(/\./g, "\\.");
    mailWindow.document.getElementById("tabmail")
              .openTab(
                "contentTab",
                {
                  contentPage: uri,
                  background: background,
                  clickHandler: function(event){
                    specialTabs.siteClickHandler(event, reg);
                  }

                }
              );
  }
}


ucjs_OpenLinkInTab.init();
