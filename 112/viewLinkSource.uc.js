// ==UserScript==
// @name           viewLinkSource.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    リンクのソースを表示
// @include        main
// @compatibility  Firefox 112
// @author         zeniko
// @version        2023/04/17 22:50 Bug 1817443 - remove openUILinkIn entirely and rename fromChrome
// @version        2021/06/12 for 78+ rmove some feature
// @version        2016/03/12 use viewSource
// @version        2008/04/01 00:00
// @Modified by    Alice0775
// ==/UserScript==
var viewLinkSource = {
  popup: null,
  init: function() {
    let menuitem = document.createXULElement("menuitem");
    menuitem.setAttribute("id","context-viewlinksource");
    menuitem.setAttribute("label","View Link Source");
    menuitem.setAttribute("accesskey","V");
    menuitem.setAttribute("oncommand","viewLinkSource.viewLinkSource(event)");
    let popup = document.getElementById("contentAreaContextMenu");
    let refitem = document.getElementById("context-viewsource").nextSibling;
    popup.insertBefore(menuitem, refitem);
    popup.addEventListener("popupshowing", this, false);
    this.popup = popup;
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    if (this.popup) {
      this.popup.removeEventListener("popupshowing", this, false);
    }
    window.removeEventListener("unload", this, false);
  },

  popupshowing: function(aEvent) {
    this.showItem("context-viewlinksource", gContextMenu.onLink);
  },

  showItem:function(id, show){
    var menu = document.getElementById(id);
    if (menu)
      (show) ? menu.removeAttribute('hidden')
             : menu.setAttribute('hidden', true)
  },

  viewLinkSource: async function(aEvent) {
    var url = gContextMenu.linkURL;
    if (/^view-source:/.test(url))
      url = url.replace(/^view-source:/, '');
    if (!aEvent.shiftKey) {
      if (Services.prefs.getBoolPref("view_source.editor.external", false) &&
          !!Services.prefs.getStringPref("view_source.editor.path", "")) {
        await top.gViewSourceUtils.openInExternalEditor({
          URL: url,
          browser: gBrowser.selectedBrowser,
          lineNumber: null
        });
      } else {
        openTrustedLinkIn("view-source:" + url, 
          Services.prefs.getBoolPref("view_source.loadInBackground", false) ?
            "tabshifted": "tab",
        {
            referrerInfo: gContextMenu.linkReferrerInfo,
            charset: gContextMenu.charSet
        });
/*
        window.openUILinkIn("view-source:" + url,
          Services.prefs.getBoolPref("view_source.loadInBackground", false) ?
            "tabshifted": "tab",
        {
            referrerInfo: gContextMenu.linkReferrerInfo,
            charset: gContextMenu.charSet,
            triggeringPrincipal: Services.scriptSecurityManager
                                         .getSystemPrincipal()
        });
*/
      }
    } else {
      openTrustedLinkIn("view-source:" + url, "window",
      {
          referrerInfo: gContextMenu.linkReferrerInfo,
          charset: gContextMenu.charSet,
          relatedToCurrent: true
     });
/*
      window.openUILinkIn("view-source:" + url, "window",
      {
          referrerInfo: gContextMenu.linkReferrerInfo,
          charset: gContextMenu.charSet,
          relatedToCurrent: true,
          triggeringPrincipal: Services.scriptSecurityManager
                                       .getSystemPrincipal()
     });
*/
    }
  },

  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case 'popupshowing':
        this.popupshowing(aEvent);
        break;
      case 'command':
        this.viewLinkSource(aEvent);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }
}
viewLinkSource.init();
