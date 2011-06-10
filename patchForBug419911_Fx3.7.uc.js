// ==UserScript==
// @name           patchForBug419911_Fx3.7.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 419911 -  Bookmarks submenu is closed immediately during dragging , およびBug 555474 -  While bookmark is dragged, the tooltip should not appear を修正
// @include        main
// @compatibility  Firefox 4.0b2pre
// @author         Alice0775
// @version        2011/01/04 Bug 583386 - Implement latest Firefox Menu design 
// @version        2010/05/06 Bug 528884  - Remove places' menu and toolbar bindings
// @version        2010/03/29 Minefield 3.7a4pre
// @note           menu.xmlを修正するのが本当だが....
// ==/UserScript==

var bug419911 = {
  //-- config --
  STAY_OPEN_ONDRAGEXIT_AS_FX2: false, //Firefox2の様にドラッグ終了後メニューを 閉じない:true, 閉じる:[false]
  //-- config --

  menupopup: ["bookmarksMenuPopup",
              'PlacesToolbar',
              'BMB_bookmarksPopup',
              'appmenu_bookmarksPopup',
              'BookmarksMenuToolButtonPopup',
              'UnsortedBookmarksFolderToolButtonPopup',
              'bookmarksMenuPopup-context'],
  globDndtbTimer: null,
  timer:[],
  count:[],


  init: function(){
    //window.removeEventListener("load", this, false);
    window.addEventListener('unload', this, false);
    this.addPrefListener(this.PrefListener);

    document.getElementById("cmd_CustomizeToolbars").addEventListener("DOMAttrModified", this, false);
    if ('globDndtb' in window){
      var self = this;
      document.getElementById("PersonalToolbar").addEventListener("DOMAttrModified",
                               function(event){self.globDndtb(event);}, true);
    }

    this.initPref();
    this.delayedStartup();
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    this.removePrefListener(this.PrefListener);

    document.getElementById("cmd_CustomizeToolbars").removeEventListener("DOMAttrModified", this, false);
    if ('globDndtb' in window){
      var self = this;
      document.getElementById("PersonalToolbar").removeEventListener("DOMAttrModified",
                               function(event){self.globDndtb(event);}, true);
    }

    for (var i = 0; i < this.menupopup.length; i++){
      var menupopup = document.getElementById(this.menupopup[i]);
      if (menupopup){
        menupopup.removeEventListener('popupshowing', this, false);
        menupopup.removeEventListener('popuphiding', this, false);
      }
    }

  },

  initPref: function(){
    this.STAY_OPEN_ONDRAGEXIT_AS_FX2 =
          this.getPref('extensions.bug419911.enable.stay_on_menu_on_dragexit_like_Fx2',
                       'bool', false);
  },

  //delayed startup
  delayedStartup: function(){
    //wait till construction of bookmarksBarContent is completed.
    for (var i = 0; i < this.menupopup.length; i++){
      this.count[i] = 0;
      this.timer[i] = setInterval(function(self, i){
        if(++self.count[i] > 50 || document.getElementById(self.menupopup[i])){
          clearInterval(self.timer[i]);
          var menupopup = document.getElementById(self.menupopup[i]);
          if (menupopup) {
            menupopup.addEventListener('popupshowing', self, false);
            menupopup.addEventListener('popuphiding', self, false);
          }
        }
      }, 250, this, i);
    }
  },

  //for DragNDrop Toolbars
  globDndtb: function(event){
    if (event.target != document.getElementById("PersonalToolbar"))
      return;
    if (event.attrName == 'customizable' && event.newValue){
      if (this.globDndtbTimer)
        clearTimeout(this.globDndtbTimer);
      this.globDndtbTimer = setTimeout(function(self){self.delayedStartup(self);}, 100, this);
    }
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'popuphiding':
        this.popuphiding(event);
        break;
      case "DOMAttrModified":
        if (event.attrName == "disabled" && !event.newValue){
          //After customize toolbar
          setTimeout(function(self){self.delayedStartup(self);}, 0, this);
        }
        break;
      case 'load':
        this.init();
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  popuphiding: function(event) {
    var menupopup = event.originalTarget;
    menupopup.parentNode.parentNode.openNode = null;

    if (menupopup.parentNode.localName == "toolbarbutton") {
      menupopup.parentNode.parentNode._openedMenuButton = null;
      //patch for Bug 225434 -  dragging bookmark from personal toolbar and releasing
      // (on same bookmark or elsewhere) or clicking on bookmark menu then cancelling
      //  leaves button depressed/sunken when hovered
      //not yet

      if (!PlacesControllerDragHelper.getSession())
      // Clear the dragover attribute if present, if we are dragging into a
      // folder in the hierachy of current opened popup we don't clear
      // this attribute on clearOverFolder.  See Notify for closeTimer.
      if (menupopup.parentNode.hasAttribute("dragover"))
        menupopup.parentNode.removeAttribute("dragover");
    }
  },

  popupshowing: function(event) {
    var menupopup = event.originalTarget;
    bug419911.debug("popupshowing ===============\n" + menupopup.parentNode.getAttribute('label'));

    var parentPopup = menupopup.parentNode.parentNode;

    if (!!parentPopup.openNode){
      try {
        parentPopup.openNode.hidePopup();
      } catch(e){}
    }
    parentPopup.openNode = menupopup;

    menupopup.onDragStart = function (event) {
      // xxx  Bug 555474 -  While bookmark is dragged, the tooltip should not appear
      bug419911.hideTooltip();
    }

    menupopup.onDragOver = function (event) {
      // xxx  Bug 555474 -  While bookmark is dragged, the tooltip should not appear
      bug419911.hideTooltip();

      var target = event.originalTarget;
      while (target) {
        if (/menupopup/.test(target.localName))
          break;
        target = target.parentNode;
      }
      if (this != target)
        return;
      event.stopPropagation();
      bug419911.debug("onDragOver " + "\n" + this.parentNode.getAttribute('label'));

      PlacesControllerDragHelper.currentDropTarget = event.target;
      let dt = event.dataTransfer;

      let dropPoint = this._getDropPoint(event);

      if (!dropPoint || !dropPoint.ip ||
          !PlacesControllerDragHelper.canDrop(dropPoint.ip, dt)) {
        this._indicatorBar.hidden = true;
        event.stopPropagation();
        return;
      }

      // Mark this popup as being dragged over.
      this.setAttribute("dragover", "true");

      if (dropPoint.folderElt) {
        // We are dragging over a folder.
        // _overFolder should take the care of opening it on a timer.
        if (this._overFolder.elt &&
            this._overFolder.elt != dropPoint.folderElt) {
          // We are dragging over a new folder, let's clear old values
/*          this._overFolder.clear();*/
        }
        if (!this._overFolder.elt) {
          this._overFolder.elt = dropPoint.folderElt;
          // Create the timer to open this folder.
          this._overFolder.openTimer = this._overFolder
                                           .setTimer(this._overFolder.hoverTime);
        }
        // Since we are dropping into a folder set the corresponding style.
/*        dropPoint.folderElt.setAttribute("_moz-menuactive", true);*/
      }
      else {
        // We are not dragging over a folder.
        // Clear out old _overFolder information.
/*        this._overFolder.clear();*/
      }

      // Autoscroll the popup strip if we drag over the scroll buttons.
      let anonid = event.originalTarget.getAttribute('anonid');
      let scrollDir = anonid == "scrollbutton-up" ? -1 :
                      anonid == "scrollbutton-down" ? 1 : 0;
      if (scrollDir != 0) {
        this._scrollBox.scrollByIndex(scrollDir, false);
      }

      // Check if we should hide the drop indicator for this target.
      if (dropPoint.folderElt || this._hideDropIndicator(event)) {
        this._indicatorBar.hidden = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // We should display the drop indicator relative to the arrowscrollbox.
      let sbo = this._scrollBox.scrollBoxObject;
      let newMarginTop = 0;
      if (scrollDir == 0) {
        let elt = this.firstChild;
        while (elt && event.screenY > elt.boxObject.screenY +
                                       elt.boxObject.height / 2)
          elt = elt.nextSibling;
        newMarginTop = elt ? elt.boxObject.screenY - sbo.screenY :
                              sbo.height;
      }
      else if (scrollDir == 1)
        newMarginTop = sbo.height;

      // Set the new marginTop based on arrowscrollbox.
      newMarginTop += sbo.y - this._scrollBox.boxObject.y;
      this._indicatorBar.firstChild.style.marginTop = newMarginTop + "px";
      this._indicatorBar.hidden = false;

      event.preventDefault();
      event.stopPropagation();
    }

    menupopup.onDragExit = function (event) {
      var target = event.originalTarget;
      while (target) {
        if (/menupopup/.test(target.localName))
          break;
        target = target.parentNode;
      }
      if (this != target)
        return;
      event.stopPropagation();
      bug419911.debug("onDragExit");

      PlacesControllerDragHelper.currentDropTarget = null;
      this.removeAttribute("dragover");

      // If we have not moved to a valid new target clear the drop indicator
      // this happens when moving out of the popup.
      let target = event.relatedTarget;
      if (!target)
        this._indicatorBar.hidden = true;

      // Close any folder being hovered over
      if (this._overFolder.elt) {
        this._overFolder.closeTimer = this._overFolder
                                          .setTimer(this._overFolder.hoverTime);
      }

      // The autoopened attribute is set when this folder was automatically
      // opened after the user dragged over it.  If this attribute is set,
      // auto-close the folder on drag exit.
      // We should also try to close this popup if the drag has started
      // from here, the timer will check if we are dragging over a child.
      if (this.hasAttribute("autoopened") ||
/**/      !bug419911.STAY_OPEN_ONDRAGEXIT_AS_FX2 &&
          this.hasAttribute("dragstart")) {
        this._overFolder.closeMenuTimer = this._overFolder
                                              .setTimer(this._overFolder.hoverTime);
      }

      event.stopPropagation();
    }

    menupopup.addEventListener("dragstart", menupopup.onDragStart, true);
    menupopup.addEventListener("dragover", menupopup.onDragOver, true);
    menupopup.addEventListener("dragleave", menupopup.onDragExit, true);
  },

  hideTooltip: function() {
    ["bhTooltip", "btTooltip2"].forEach(function(id) {
      var tooltip = document.getElementById(id);
      if (tooltip)
        tooltip.hidePopup();
    });
  },

  //Fxのバージョン
  get getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  },

  debug: function(aMsg){
    return;
    Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService)
      .logStringMessage(aMsg);
  },

  getPref: function(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefService);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
        case 'str':
          return xpPref.getCharPref(aPrefString).toString(); break;
        case 'int':
          return xpPref.getIntPref(aPrefString); break;
        case 'bool':
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  },

  setPref: function(aPrefString, aPrefType, aValue){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefService);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.setComplexValue(aPrefString, Components.interfaces.nsILocalFile, aValue); break;
        case 'str':
          return xpPref.setCharPref(aPrefString, aValue); break;
        case 'int':
          aValue = parseInt(aValue);
          return xpPref.setIntPref(aPrefString, aValue);  break;
        case 'bool':
        default:
          return xpPref.setBoolPref(aPrefString, aValue); break;
      }
    }catch(e){
    }
    return null;
  },
//Thanks Piro.
  addPrefListener: function(aObserver) {
      try {
          var pbi = Components.classes['@mozilla.org/preferences;1'].
                    getService(Components.interfaces.nsIPrefBranch2);
          pbi.addObserver(aObserver.domain, aObserver, false);
      } catch(e) {}
  },

  removePrefListener: function(aObserver) {
      try {
          var pbi = Components.classes['@mozilla.org/preferences;1'].
                    getService(Components.interfaces.nsIPrefBranch2);
          pbi.removeObserver(aObserver.domain, aObserver);
      } catch(e) {}
  },

  PrefListener:{
      domain  : 'extensions.bug419911.enable.stay_on_menu_on_dragexit_like_Fx2',

      observe : function(aSubject, aTopic, aPrefstring) {
          if (aTopic == 'nsPref:changed') {
              bug419911.initPref();
          }
      }
  }
}

//window.addEventListener("load", bug419911, false);
bug419911.init();
