// ==UserScript==
// @name           contextSelectionSearch.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    context menu "search text by xxx" in default browser
// @include        *
// @compatibility  Tb3
// @modifier       Alice0775
// @version        2009/09/27 Tb3
// ==/UserScript==


var ucjs_SelectionSearch = {
  // -- config --
  SearchEngine: [
    {
      name: "Google",
      param:"http://www.google.co.jp/search?q={searchTerms}&lr=lang_ja&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:ja:official&client=firefox"
    },
    {
      name:"Yahoo!",
      param:"http://search.yahoo.co.jp/search?p={searchTerms}&ei=UTF-8&fr=moz35&rls=org.mozilla:ja-JP:official"
    }
  ],
  // -- config --


  contextmenu: null,

  init: function( ){
    this.contextmenu = document.getElementById("messagePaneContext") || document.getElementById("mailContext");
    if (!this.contextmenu)
      return;

    for (var i = 0; i <  this.SearchEngine.length; i++) {
      var name = this.SearchEngine[i].name;

      var menuitem = document.createElement("menuitem");
      menuitem.setAttribute("label", "Search by " + name);
      menuitem.setAttribute("id", "contextSearchSelection_menu" + i);
      menuitem.setAttribute("engine_name", name);
      menuitem.setAttribute("oncommand", "ucjs_SelectionSearch.doSeacrhWithSelectedWord(this);");
      menuitem.setAttribute("onclick", "if (event.button==1){ucjs_SelectionSearch.doSeacrhWithSelectedWord(this, true);this.parentNode.hidePopup();}");
      this.contextmenu.appendChild(menuitem);
    }
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
    var hidden = document.commandDispatcher.focusedWindow.getSelection().isCollapsed;
    for (var i = 0; i <  this.SearchEngine.length; i++) {
      document.getElementById("contextSearchSelection_menu" + i).hidden = hidden;
    }
  },

  getSelectionWord: function() {
    var win = document.commandDispatcher.focusedWindow;
    var sel = win.getSelection().toString();
    if ( !sel )
      return null;
    return sel.split("\n");
  },

  doSeacrhWithSelectedWord: function(target, loadInTab) {
    loadInTab = (typeof loadInTab == "undefined") ? false : loadInTab;
    var word = this.getSelectionWord();
    if (!word)
      return;

    var aEngineName = target.getAttribute("engine_name");
    var param = this.getParamByEnginename(aEngineName);
    if (!param)
      return;

    if (loadInTab)
      this.doSearchInTab(word, param);
    else
      this.doSearch(word, param);
  },

  getParamByEnginename: function(aEngineName) {
    for (var i = 0; i <  this.SearchEngine.length; i++) {
      var name = this.SearchEngine[i].name;
      if (name == aEngineName)
        return this.SearchEngine[i].param;
    }
    return null;
  },

  doSearch: function(aWord, param) {
    param = param.replace("{searchTerms}", encodeURI(aWord));

    // first construct an nsIURI object using the ioservice
    var ioservice = Components.classes["@mozilla.org/network/io-service;1"]
                              .getService(Components.interfaces.nsIIOService);
    var uriToOpen = ioservice.newURI(param, null, null);
    var extps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                          .getService(Components.interfaces.nsIExternalProtocolService);
    // now, open it!
    extps.loadURI(uriToOpen, null);
  },

  doSearchInTab: function(aWord, param) {
    var mailWindow = Components.classes['@mozilla.org/appshell/window-mediator;1']
                    .getService(Components.interfaces.nsIWindowMediator)
                    .getMostRecentWindow("mail:3pane");

    mailWindow.document.getElementById("tabmail")
              .openTab(
                "contentTab",
                {contentPage: param.replace("{searchTerms}", encodeURI(aWord))}
              );
  }
}


ucjs_SelectionSearch.init();
