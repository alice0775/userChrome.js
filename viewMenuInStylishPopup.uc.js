// ==UserScript==
// @name           viewMenuInStylishPopup.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Stylish のステータスボタンのポップアップメニューにViewメニューの項目を表示
// @include        main
// @compatibility  Firefox 3.0, 3.1 4.0
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2011/01/26 Bug 611568 - Remove "File Import..." from the File menu
// @version        2009/05/04 version 1.0.1beta
// @version        2009/04/30 version 1.0対応(tnks 音吉) でも0.59で不具合がないなら1.0にしない方がいいよ
// @version        2008/10/23 Fx3.1で[View]>{Page Style] メニューを表示以後項目が追加されない(Thanks音吉)
// @Note
// @version        2008/07/05

var viewMenuInStylishPopup = {
  popup: null,
  _refItem: null,
  _ver:0.5,
  inserted: false,

  init: function() {
    if (document.getElementById("pageStyleMenu") || this.inserted) {
      this.observe();
      return;
    }

    /* Begin Page Style Functions */
    var getAllStyleSheets = function getAllStyleSheets(frameset) {
      var styleSheetsArray = Array.slice(frameset.document.styleSheets);
      for (let i = 0; i < frameset.frames.length; i++) {
        let frameSheets = getAllStyleSheets(frameset.frames[i]);
        styleSheetsArray = styleSheetsArray.concat(frameSheets);
      }
      return styleSheetsArray;
    };

    var stylesheetFillPopup = function stylesheetFillPopup(menuPopup) {
      var noStyle = menuPopup.firstChild;
      var persistentOnly = noStyle.nextSibling;
      var sep = persistentOnly.nextSibling;
      while (sep.nextSibling)
        menuPopup.removeChild(sep.nextSibling);

      var styleSheets = getAllStyleSheets(window.content);
      var currentStyleSheets = {};
      var styleDisabled = getMarkupDocumentViewer().authorStyleDisabled;
      var haveAltSheets = false;
      var altStyleSelected = false;

      for (let i = 0; i < styleSheets.length; ++i) {
        let currentStyleSheet = styleSheets[i];

        if (!currentStyleSheet.title)
          continue;

        // Skip any stylesheets that don't match the screen media type.
        if (currentStyleSheet.media.length > 0) {
          let media = currentStyleSheet.media.mediaText.split(", ");
          if (media.indexOf("screen") == -1 &&
              media.indexOf("all") == -1)
            continue;
        }

        if (!currentStyleSheet.disabled)
          altStyleSelected = true;

        haveAltSheets = true;

        let lastWithSameTitle = null;
        if (currentStyleSheet.title in currentStyleSheets)
          lastWithSameTitle = currentStyleSheets[currentStyleSheet.title];

        if (!lastWithSameTitle) {
          let menuItem = document.createElement("menuitem");
          menuItem.setAttribute("type", "radio");
          menuItem.setAttribute("label", currentStyleSheet.title);
          menuItem.setAttribute("data", currentStyleSheet.title);
          menuItem.setAttribute("checked", !currentStyleSheet.disabled && !styleDisabled);
          menuPopup.appendChild(menuItem);
          currentStyleSheets[currentStyleSheet.title] = menuItem;
        } else if (currentStyleSheet.disabled) {
          lastWithSameTitle.removeAttribute("checked");
        }
      }

      noStyle.setAttribute("checked", styleDisabled);
      persistentOnly.setAttribute("checked", !altStyleSelected && !styleDisabled);
      persistentOnly.hidden = (window.content.document.preferredStyleSheetSet) ? haveAltSheets : false;
      sep.hidden = (noStyle.hidden && persistentOnly.hidden) || !haveAltSheets;
      return true;
    };

    var stylesheetInFrame = function stylesheetInFrame(frame, title) {
      return Array.some(frame.document.styleSheets,
                        function (stylesheet) stylesheet.title == title);
    };

    var stylesheetSwitchFrame = function stylesheetSwitchFrame(frame, title) {
      var docStyleSheets = frame.document.styleSheets;

      for (let i = 0; i < docStyleSheets.length; ++i) {
        let docStyleSheet = docStyleSheets[i];

        if (title == "_nostyle")
          docStyleSheet.disabled = true;
        else if (docStyleSheet.title)
          docStyleSheet.disabled = (docStyleSheet.title != title);
        else if (docStyleSheet.disabled)
          docStyleSheet.disabled = false;
      }
    };

    var stylesheetSwitchAll = function stylesheetSwitchAll(frameset, title) {
      if (!title || title == "_nostyle" || stylesheetInFrame(frameset, title))
        stylesheetSwitchFrame(frameset, title);

      for (let i = 0; i < frameset.frames.length; i++)
        stylesheetSwitchAll(frameset.frames[i], title);
    };

    var setStyleDisabled = function setStyleDisabled(disabled) {
      getMarkupDocumentViewer().authorStyleDisabled = disabled;
      if ("TS" in window) 
        TS.setCheckState();
    };
    /* End of the Page Style functions */

    /*
    <!ENTITY pageStyleMenu.label "Page Style">
    <!ENTITY pageStyleMenu.accesskey "y">
    <!ENTITY pageStyleNoStyle.label "No Style">
    <!ENTITY pageStyleNoStyle.accesskey "n">
    <!ENTITY pageStylePersistentOnly.label "Basic Page Style">
    <!ENTITY pageStylePersistentOnly.accesskey "b">
    */

    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
            <menupopup id="menu_viewPopup"> \
              <menu id="pageStyleMenu" label="Page Style" \
                    accesskey="y" observes="isImage"> \
                <menupopup onpopupshowing="stylesheetFillPopup(this);" \
                           oncommand="stylesheetSwitchAll(window.content, event.target.getAttribute(\'data\')); setStyleDisabled(false);"> \
                  <menuitem id="menu_pageStyleNoStyle" \
                            label="No Style" \
                            accesskey="n" \
                            oncommand="setStyleDisabled(true); event.stopPropagation();" \
                            type="radio"/> \
                  <menuitem id="menu_pageStylePersistentOnly" \
                            label="Basic Page Style" \
                            accesskey="b" \
                            type="radio" \
                            checked="true"/> \
                  <menuseparator/> \
                </menupopup> \
              </menu> \
            </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, viewMenuInStylishPopup);
    this.inserted == true;
  },

  observe: function() {
    this.popup = document.getElementById("stylish-status-popup");
    if (!!this.popup) {
      this._ver = 0.5;
      this.popup.addEventListener('popupshowing', this, false);
    } else {
      this._ver = 1.0;
      this.popup = document.getElementById("stylish-popup");
      this.popup.addEventListener('popupshown', this, false);
      //document.getElementById("stylish-panel").addEventListener('click', this, false);
    }
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    if (this._ver == 0.5)
      this.popup.removeEventListener('popupshowing', this, false);
    else {
      this.popup.removeEventListener('popupshown', this, false);
      //document.getElementById("stylish-panel").removeEventListener('click', this, false);
    }
  },

  get refItem(){
    if (!this._refItem && this._ver == 0.5){
      var statuspopup = document.getElementById("stylish-status-popup");
      if (!statuspopup)
        statuspopup = document.getElementById("stylish-popup");
      if (!!statuspopup)
        for (var i=0; i<statuspopup.childNodes.length; i++){
          if (statuspopup.childNodes[i].hasAttribute('id') &&
              statuspopup.childNodes[i].getAttribute('id') == "stylish-global-styles"){
            this._refItem = statuspopup.childNodes[i];
            break;
          }
        }
    }
    if (!this._refItem || this._ver == 1.0)
      var statuspopup = document.getElementById("stylish-status-popup");
      if (!statuspopup)
        statuspopup = document.getElementById("stylish-popup");
      this._refItem = document.getElementById("stylish-write-style-menu").nextSibling;
      if (!!statuspopup)
        for (var i = statuspopup.childNodes.length - 1; i > -1; i--){
          if (statuspopup.childNodes[i].hasAttribute('viewMenu')){
            this._refItem = statuspopup.childNodes[i].nextSibling;
            break;
          }
        }
    return this._refItem;
  },

  handleEvent: function(event){
    switch (event.type) {
      case "unload":
        this.uninit();
        break;
      case "popupshowing":
        this.insertViewMenu();
        break;
      case "popupshown":
        setTimeout(function(self){self.insertViewMenu();}, 0, this);
        break;
      case "click":
        if (event.button == 2){
          document.getElementById("stylish-popup").openPopup(event.target, "before_start");
        }
    }
  },

  insertViewMenu: function(){
    var menuseparator;
    var menuPopup = this.popup;
    var nn = menuPopup.childNodes.length;
    for (var i = nn - 1; i> -1; i--){
      var node = menuPopup.childNodes[i];
      if (node.hasAttribute('viewMenu'))
        menuPopup.removeChild(node);
    }

    var styleSheets = getAllStyleSheets(window.content);
    var currentStyleSheets = [];
    var styleDisabled = getMarkupDocumentViewer().authorStyleDisabled;
    var haveAltSheets = false;
    var altStyleSelected = false;

    if (this._ver == 1.0) {
      menuseparator = document.createElement("menuseparator");
      menuseparator.setAttribute("viewMenu", true);
      menuPopup.insertBefore(menuseparator, this.refItem);
    }

    var noStyle = document.createElement("menuitem");
    noStyle.setAttribute("type", "radio");
    noStyle.setAttribute("label", "NoStyle");
    noStyle.setAttribute("oncommand","setStyleDisabled(true); event.stopPropagation();");
    noStyle.setAttribute("viewMenu", true);
    menuPopup.insertBefore(noStyle, this.refItem);

    var persistentOnly = document.createElement("menuitem");
    persistentOnly.setAttribute("type", "radio");
    persistentOnly.setAttribute("checked", "true");
    persistentOnly.setAttribute("label", "Basic Page Style");
    persistentOnly.setAttribute("oncommand","stylesheetSwitchAll(window.content, event.target.getAttribute('data')); setStyleDisabled(false);");
    persistentOnly.setAttribute("viewMenu", true);
    menuPopup.insertBefore(persistentOnly, this.refItem);

    var sep = document.createElement("menuseparator");
    sep.setAttribute("viewMenu", true);
    menuPopup.insertBefore(sep, this.refItem);

    for (var i = 0; i < styleSheets.length; ++i) {
      var currentStyleSheet = styleSheets[i];

      // Skip any stylesheets that don't match the screen media type.
      var media = currentStyleSheet.media.mediaText.toLowerCase();
      if (media && (media.indexOf("screen") == -1) && (media.indexOf("all") == -1))
          continue;

      if (currentStyleSheet.title) {
        if (!currentStyleSheet.disabled)
          altStyleSelected = true;

        haveAltSheets = true;

        var lastWithSameTitle = null;
        if (currentStyleSheet.title in currentStyleSheets)
          lastWithSameTitle = currentStyleSheets[currentStyleSheet.title];

        if (!lastWithSameTitle) {
          var menuItem = document.createElement("menuitem");
          menuItem.setAttribute("type", "radio");
          menuItem.setAttribute("label", currentStyleSheet.title);
          menuItem.setAttribute("data", currentStyleSheet.title);
          menuItem.setAttribute("checked", !currentStyleSheet.disabled && !styleDisabled);
          menuItem.setAttribute("oncommand","stylesheetSwitchAll(window.content, event.target.getAttribute('data')); setStyleDisabled(false);");
          menuItem.setAttribute("viewMenu", true);
          menuPopup.insertBefore(menuItem, this.refItem);
          currentStyleSheets[currentStyleSheet.title] = menuItem;
        } else {
          if (currentStyleSheet.disabled)
            lastWithSameTitle.removeAttribute("checked");
        }
      }
    }
    if (this._ver == 0.5) {
      menuseparator = document.createElement("menuseparator");
      menuseparator.setAttribute("viewMenu", true);
      menuPopup.insertBefore(menuseparator, this.refItem);
    }

    noStyle.setAttribute("checked", styleDisabled);
    persistentOnly.setAttribute("checked", !altStyleSelected && !styleDisabled);
    persistentOnly.hidden = (window.content.document.preferredStyleSheetSet) ? haveAltSheets : false;
    sep.hidden = (noStyle.hidden && persistentOnly.hidden) || !haveAltSheets;
  }
}
viewMenuInStylishPopup.init();
