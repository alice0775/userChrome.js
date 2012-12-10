// ==UserScript==
// @name           ucjsResizeWindow.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    windowやダイアログをリサイズ
// @include        main
// @include        chrome://browser/content/preferences/preferences.xul
// @include        chrome://browser/content/places/bookmarkProperties.xul
// @include        chrome://global/content/commonDialog.xul
// @include        chrome://browser/content/search/engineManager.xul
// @include        chrome://searchboxsync/content/options/optionsDialog.xul
// @include        chrome://greasemonkey/content/manage.xul
// @include        chrome://refcontrol/content/refcontrolOptions.xul
// @include        chrome://noscript/content/noscriptOptions.xul
// @include        chrome://inspector/content/viewers/domNode/domNodeDialog.xul
// @include        chrome://dta/content/dta/manager/conflicts.xul
// @include        chrome://*/config.xul
// @include        chrome://*/configure.xul
// @include        chrome://*/option.xul
// @include        chrome://*/pref.xul
// @include        chrome://*/options.xul
// @include        chrome://*/prefs.xul
// @include        chrome://allowclipboardhelper/content/allowclipboardhelper.xul
// @include        chrome://refererremover/content/refererremoverPref.xul
// @include        chrome://scriptish/content/script-options.xul*
// @exclude        chrome://browser/content/sanitize.xul
// @compatibility  Firefox 2.0 3.0 3.1 3.2a1pre
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2010/03/29 00:00 exclude chrome://browser/content/sanitize.xul
// @version        2010/02/12 00:00 Fixed Bug 468810  - Make "Manage search engines" window resizable
// @version        2010/01/11 00:00 engineManager
// @version        2010/01/10 22:00 pref
// @version        2009/08/06 18:00 bookmarkPropertiesは幅のみ
// @version        2009/07/28 18:00 サイズおよび位置を復元するかどうかを指定出来るようにした。
// @version        2009/01/28 00:00 selectDialog
// @version        2009/01/27 00:00
// @note           オプション, ブックマークプロパティ, 検索エンジン管理ダイアログや一部のリストボックスに有効

var ucjsResizeWindow = {
  //--config--
  RESTORESIZE: true,      //サイズを復元するかどうか
  RESTOREPOSITION: false, //位置を復元するかどうか
  //--config--


  PREF_SIZE: "userChrome.resizeWindow",
  PREF_POSITION: "userChrome.positionWindow",
  resizing: false,
  m1X: 0,
  m1Y: 0,
  W: 0,
  H: 0,

  get prefs() {
    var p = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefBranch2);
    if (!p)
      p = window.top.gPrefService;
    return p;
  },

  get getVer() {
    var info = Components.classes["@mozilla.org/xre/app-info;1"]
               .getService(Components.interfaces.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  },

  init: function(){
    if (this.getVer >= 3.7 && location.href == "chrome://browser/content/search/engineManager.xul") {
      // xxx  Bug 545967 -  After resize "Manage search engines", the engine item could not drag
      document.getElementById("engineList").removeAttribute('rows');
      return
    }

    //if (location.href =="chrome://global/content/selectDialog.xul") {
      try {
        var listboxes = document.getElementsByTagName('listbox');
        for (var i = 0; i < listboxes.length; i++) {
           listboxes[i].removeAttribute('rows');
        }
      } catch(e) { }
    //}

    if (location.href =="chrome://browser/content/browser.xul") {
      var func = window.openPreferences.toString();
      func = func.replace(
      'var features = "chrome,titlebar,toolbar,centerscreen"',
      'var features = "resizable,chrome,titlebar,toolbar,centerscreen"'
      );
      eval("window.openPreferences = " + func);
      return;
    }

    if (location.href =="chrome://browser/content/preferences/preferences.xul") {
      var style = " \
      .content-box{ \
      height:auto !important; \
      }".replace(/\s+/g, " ");
      var sspi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
      );
      document.insertBefore(sspi, document.documentElement);
      sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
      };
    }

    if (location.href =="chrome://refererremover/content/refererremoverPref.xul") {
      var t = document.getElementById("refererremover.pref.list");
      t.setAttribute('flex', 1);
      t.parentNode.setAttribute('flex', 1);
    }

    if (this.RESTORESIZE){
      var size = this.getPrefSizes(location.href, window.outerHeight, window.outerWidth);
      if (location.href == "chrome://browser/content/places/bookmarkProperties.xul") {
        window.resizeBy(size.w - window.outerWidth, 0);
      } else {
        window.resizeTo(size.w, size.h);
      }
    }

    if (this.RESTOREPOSITION){
      var position = this.getPrefPosition(location.href, window.screenX, window.screenY);
      window.moveTo(position.x, position.y);
    }

    if (this.RESTORESIZE || this.RESTOREPOSITION){
      window.addEventListener('unload', this, false);
      window.addEventListener('mouseup', this, true);
      window.addEventListener('mousemove', this, false);
      window.addEventListener('mousedown', this, true);
      window.addEventListener('mouseover', this, true);
    }
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.removeEventListener('mouseup', this, true);
    window.removeEventListener('mousemove', this, false);
    window.removeEventListener('mousedown', this, true);
    window.removeEventListener('mouseover', this, true);
  },

  handleEvent: function(aEvent){
    switch (aEvent.type){
      case 'unload':
        this.uninit(aEvent);
        break;
      case 'mouseup':
        this._mouseup(aEvent);
        break;
      case 'mousemove':
        this._mousemove(aEvent);
        break;
      case 'mousedown':
        this._mousedown(aEvent);
        break;
      case 'mouseover':
        this._mouseover(aEvent);
        break;
    }
  },

  _mousemove: function(aEvent){
    var mX = aEvent.screenX;
    var mY = aEvent.screenY;
    if (this.resizing){
      if (location.href == "chrome://browser/content/places/bookmarkProperties.xul")
        mY = this.m1Y;
      window.resizeTo(this.W + (mX - this.m1X), this.H + (mY - this.m1Y));
    }
  },

  _mouseup: function(aEvent){
    this.resizing = false;
    this.setPrefSizes(location.href, window.outerHeight, window.outerWidth);
    this.setPrefPosition(location.href, window.screenX, window.screenY);
  },

  _mousedown: function(aEvent){
    this.m1X = aEvent.screenX;
    this.m1Y = aEvent.screenY;
    if (this.m1X > window.screenX + window.outerWidth - 16){
      if (this.m1Y > window.screenY + window.outerHeight - 16){
        this.W = window.outerWidth;
        this.H = window.outerHeight;
        this.resizing=true;
      }
    }
  },

  _mouseover: function(aEvent){
    var mX = aEvent.screenX;
    var mY = aEvent.screenY;
    //window.userChrome_js.debug((mX>window.screenX+window.outerWidth-5) + "\n" +(mY>window.screenY+window.outerHeight-5));
    if (!this.resizing){
      if (mX > window.screenX + window.outerWidth - 16){
        if (mY > window.screenY + window.outerHeight - 16){
          aEvent.target.style.cursor = "nw-resize";
          return;
        }
      }
    }
    aEvent.target.style.cursor = "auto";
  },

  getPrefSizes: function(id, h, w){
    try {
      var pref_size = this.prefs.getCharPref(this.PREF_SIZE);
    } catch(e) {
      var pref_size = "";
    }
    var xx = new RegExp(escape(id) + "H([-.0-9]+)W([-.0-9]+)").exec(pref_size);
    h = xx ? parseInt(xx[1], 10): h;
    w = xx ? parseInt(xx[2], 10): w;
    return {"h":h, "w":w}
  },

  setPrefSizes: function(id, h, w){
    try {
      var pref_size = this.prefs.getCharPref(this.PREF_SIZE);
    } catch(e) {
      var pref_size = "";
    }
    var xx = new RegExp(escape(id) + "H([-.0-9]+)W([-.0-9]+)","g")
    pref_size = pref_size.replace(xx, '');
    pref_size = pref_size + escape(id) + "H" + h + "W" + w;
    try {
      this.prefs.setCharPref(this.PREF_SIZE, pref_size);
    } catch(e) { }
  },

  getPrefPosition: function(id, x, y){
    try {
      var pref_position = this.prefs.getCharPref(this.PREF_POSITION);
    } catch(e) {
      var pref_position = "";
    }
    var xx = new RegExp(escape(id) + "X([-.0-9]+)Y([-.0-9]+)").exec(pref_position);
    x = xx ? parseInt(xx[1], 10): x;
    y = xx ? parseInt(xx[2], 10): y;
    return {"x":x, "y":y}
  },

  setPrefPosition: function(id, x, y){
    try {
      var pref_position = this.prefs.getCharPref(this.PREF_POSITION);
    } catch(e) {
      var pref_position = "";
    }
    var xx = new RegExp(escape(id) + "X([-.0-9]+)Y([-.0-9]+)","g")
    pref_position = pref_position.replace(xx, '');
    pref_position = pref_position + escape(id) + "X" + x + "Y" + y;
    try {
      this.prefs.setCharPref(this.PREF_POSITION, pref_position);
    } catch(e) { }
  }
}

ucjsResizeWindow.init();
