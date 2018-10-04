// ==UserScript==
// @name          patchForBug419911andBug1422171.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 419911 - Support diagonal dragging through bookmarks menus (was:Bookmarks submenu is closed immediately during dragging)  and Bug 1422171 - When dragging a link into a bookmark folder and scrolling down via the hovering over the down arrow it scrolls way too fast
// @include       main
// @compatibility Firefox 60
// @author        alice0775
// @version       2018/10/05 00:00 fix 60esr
// @version       2018/10/04 60+
// ==/UserScript==
"use strict";
var bug419911 = {
  //-- config --
  STAY_OPEN_ONDRAGEXIT_AS_FX2: false, //Firefox2の様にドラッグ終了後メニューを 閉じない:true, 閉じる:[false]
  //-- config --

  menupopup: ["bookmarksMenuPopup",
              'PlacesToolbar',
              'BMB_bookmarksPopup'],
  timer:[],
  count:[],
  rptcnt: 0,

  init: function(){
    window.removeEventListener("load", this, false);
    window.addEventListener('unload', this, false);

    window.addEventListener("aftercustomization", this, false);

    this.delayedStartup();
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);

    window.removeEventListener("aftercustomization", this, false);

    for (var i = 0; i < this.menupopup.length; i++){
      var menupopup = document.getElementById(this.menupopup[i]);
      if (menupopup){
        menupopup.removeEventListener('popupshowing', this, false);
        menupopup.removeEventListener('popuphiding', this, false);
      }
    }

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

  handleEvent: function(event){
    switch (event.type) {
      case 'popupshowing':
        this.popupshowing(event);
        break;
      case 'popuphiding':
        this.popuphiding(event);
        break;
      case "aftercustomization":
        setTimeout(function(self){self.delayedStartup(self);}, 0, this);
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

    var parentPopup = menupopup.parentNode.parentNode;

    if (!!parentPopup.openNode){
      try {
        parentPopup.openNode.hidePopup();
      } catch(e){}
    }
    parentPopup.openNode = menupopup;

    menupopup.onDragOver = function (event) {
      var target = event.originalTarget;
      while (target) {
        if (/menupopup/.test(target.localName))
          break;
        target = target.parentNode;
      }
      if (this != target)
        return;
      event.stopPropagation();

      PlacesControllerDragHelper.currentDropTarget = event.target;
      var dt = event.dataTransfer;

      var dropPoint = this._getDropPoint(event);

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
      var anonid = event.originalTarget.getAttribute('anonid');
      var scrollDir = anonid == "scrollbutton-up" ? -1 :
                      anonid == "scrollbutton-down" ? 1 : 0;
      if (scrollDir != 0 && this.rptcnt == 0) {
        this.rptcnt++;
        let rptbutton = event.originalTarget;
        if (typeof this._scrollBox._startScroll != "undefined") {
          this._scrollBox._startScroll(scrollDir);
        } else {
          this._scrollBox._autorepeatbuttonScroll(event); // Bug 1422171 
        }
      } else {
        this.rptcnt = 0;
        if (typeof this._scrollBox._startScroll != "undefined")
          this._scrollBox._stopScroll()
      }

      // Check if we should hide the drop indicator for this target.
      if (dropPoint.folderElt || this._hideDropIndicator(event)) {
        this._indicatorBar.hidden = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // We should display the drop indicator relative to the arrowscrollbox.
      var sbo = this._scrollBox.scrollBoxObject;
      var newMarginTop = 0;
      if (scrollDir == 0) {
        var elt = this.firstChild;
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

      PlacesControllerDragHelper.currentDropTarget = null;
      this.removeAttribute("dragover");

      // If we have not moved to a valid new target clear the drop indicator
      // this happens when moving out of the popup.
      target = event.relatedTarget;
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

    menupopup.addEventListener("dragover", menupopup.onDragOver, true);
    menupopup.addEventListener("dragleave", menupopup.onDragExit, true);
  }
}


bug419911.init();
