// ==UserScript==
// @name           TabTitleToolTip.uc.xul
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    CTRLキーを押しながらタブにマウスオーバーするとすぐにタブタイトルをポップアップする。
// @include        main
// @compatibility  Firefox 3.0 3.5 3.6 3.7a5pre
// @author         Alice0775
// @version        2014/05/31 00:00  e4x
// @version        2010/05/02 00:00  TreeStyleTab
// @version        2010/03/27 00:00  Bug 508482  - Window activation status should be a pseudoclass (:-moz-window-inactive) instead of an attribute および 長いタイトルは折り返すように
// @Note
// ==/UserScript==
var TabTitlePopup = {
  tooltip:null,
  _delay: 50,
  _lastTarget: null,
  _showTimeout: null,
  _hideTimeout: null,
  _enableCtrlKey: true, // true:default=normal  +ctrlKey=quick popup,   false: always quick popup.

  get getVer() {
    var info = Components.classes["@mozilla.org/xre/app-info;1"]
               .getService(Components.interfaces.nsIXULAppInfo);
    return parseInt(info.version.substr(0,3) * 10,10) / 10;
  },

  init: function() {
    // initialization code
    var style = '\
      #TabTooltip\
      {\
        max-width:450px !important;\
      }\
      #main-window:-moz-window-inactive  #TabTooltip\
      {\
        visibility: collapse !important;\
      }\
    '.toString();
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id","menutabTooltip");
    menuitem.setAttribute("type","checkbox");
    menuitem.setAttribute("label","\u30bf\u30d6\u306e\u30c4\u30fc\u30eb\u30c1\u30c3\u30d7\u3092\u77ac\u6642\u306b\u8868\u793a"); //タブのツールチップを瞬時に表示
    menuitem.setAttribute("oncommand","TabTitlePopup.togglePrefValue('userChrome.TabToolTip.Quick');");
    menuitem.setAttribute("accesskey","T");
    var refitem = document.getElementById("menu_preferences");
    refitem.parentNode.appendChild(menuitem,refitem);

    this.tooltip = document.createElement("tooltip");
    this.tooltip.setAttribute("id","TabTooltip");
    this.tooltip.setAttribute("orient","vertical");
    var description = document.createElement("description");
    description.setAttribute("flex","1");
    this.tooltip.appendChild(description);
    document.getElementById("main-window").appendChild(this.tooltip);

    var b = gBrowser;
    // hide tooltips on tabbrowser tabs.  this is so ghetto.
    var anon = document.getAnonymousElementByAttribute(b, 'class', 'tabbrowser-strip')||
               document.getElementById('tabbrowser-tabs');
    if(anon) anon.tooltip = "";
    b.tabContainer.removeAttribute('tooltip');

    b.tabContainer.addEventListener("mouseout", this, true);
    b.tabContainer.addEventListener("mouseover", this, true);
    b.tabContainer.addEventListener("mousedown", this, true);
    document.getElementById('menu_ToolsPopup').addEventListener('popupshowing', this, false);
    window.addEventListener("unload", function(){ TabTitlePopup.uninit(); }, false);
  },

  uninit: function() {
    window.addEventListener("unload", arguments.callee, false);
    if(this._hideTimeout) clearTimeout(this._hideTimeout);
    if(this._showTimeout) clearTimeout(this._showTimeout);
    var b = gBrowser;
    b.tabContainer.removeEventListener("mouseout", this, true);
    b.tabContainer.removeEventListener("mouseover", this, true);
    b.tabContainer.removeEventListener("mousedown", this, true);
    document.getElementById('menu_ToolsPopup').removeEventListener('popupshowing', this, false);
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "popupshowing": this.setMenuInit(); break;
      case "mouseout":     this.mouseOut(event); break;
      case "mouseover":     this.mouseOver(event); break;
      case "mousedown":    this.dohide(); break;
    }
  },

  mouseOut: function(event) {
    var aTarget = event.relatedTarget;
    while( aTarget && aTarget instanceof XULElement && aTarget.localName !='tab'){
      aTarget = aTarget.parentNode;
    }
    if( !aTarget || aTarget.localName !='tab') {
      this.dohide();
      return;
    }
  },

  mouseOver: function(event) {
    this._enableCtrlKey = !this.getPrefValue("userChrome.TabToolTip.Quick","bool",false);
    var aTarget = event.target;
    while( aTarget && aTarget instanceof XULElement && aTarget.localName !='tab'){
      aTarget = aTarget.parentNode;
    }
    if( !aTarget || aTarget.localName !='tab') {
      this.dohide();
      return;
    }

    if(this._lastTarget != aTarget){
      var title = aTarget.label;

      if( !(event.ctrlKey || !this._enableCtrlKey) && this._lastTitle != aTarget.getAttribute('linkedpanel')){
        this.dohide();
      }

      clearTimeout(this._showTimeout);
      var self = this;
      this._showTimeout = setTimeout(function(event){
        clearTimeout(self._hideTimeout);
        self.show(event.target, event);
        self._lastTitle = targetElm.getAttribute('linkedpanel');

        if( !(event.ctrlKey || !self._enableCtrlKey) ){
          self._hideTimeout = setTimeout(function(self){
            clearTimeout(self._showTimeout);
            self.tooltip.hidePopup();
          }, 5000, this);
        }

      }, ( event.ctrlKey || !this._enableCtrlKey) ? this._delay : 400, event);
    }
    this._lastTarget = aTarget;
  },

  show: function(targetElm, event) {
    this.tooltip.hidePopup();
    this.tooltip.firstChild.textContent = targetElm.label;
    this.tooltip.width = "";
    var x = event.screenX - targetElm.boxObject.screenX + 21;
    var y = targetElm.boxObject.clientY + 21;
    document.popupNode = null; //THANKS http://www.xuldev.org/blog/?p=109
    this.tooltip.openPopup( targetElm , "overlap" , x, y , false, false );
  },

  dohide:  function() {
    clearTimeout(this._hideTimeout);
    clearTimeout(this._showTimeout);
    setTimeout(function(self){
      self.tooltip.hidePopup();
      self._lastTarget = null;
    }, 0, this);
  },

  setMenuInit: function(){
    document.getElementById("menutabTooltip")
      .setAttribute("checked",this.getPrefValue("userChrome.TabToolTip.Quick","bool",false));
  },

  togglePrefValue: function(aPrefString){
    this.setPrefValue(aPrefString,"bool",!this.getPrefValue(aPrefString,false));
  },

  setPrefValue: function(aPrefString, aPrefType, aValue){
    var nsIPrefBranch = Components.interfaces.nsIPrefBranch;
    var xpPref = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefBranch);
    var prefType = xpPref.getPrefType(aPrefString);
    try{
      switch (aPrefType){
        case "str":
          return xpPref.setCharPref(aPrefString, aValue); break;
        case "int":
          return xpPref.setIntPref(aPrefString, aValue);  break;
        case "bool":
        default:
        if(!aValue) aValue = false;
          return xpPref.setBoolPref(aPrefString, aValue); break;
      }
    }catch(e){
    }
    return aValue.toString();
  },

  getPrefValue: function(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefBranch);
    if(xpPref.getPrefType(aPrefString) == xpPref.PREF_INVALID){
      return aDefault;
    }
    try{
      switch (aPrefType){
        case "str":
          return xpPref.getCharPref(aPrefString).toString(); break;
        case "int":
          return xpPref.getIntPref(aPrefString); break;
        case "bool":
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  }
};

TabTitlePopup.init();
