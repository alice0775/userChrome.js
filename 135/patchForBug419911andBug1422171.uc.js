// ==UserScript==
// @name          patchForBug419911andBug1422171.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 419911 - Support diagonal dragging through bookmarks menus (was:Bookmarks submenu is closed immediately during dragging)  and Bug 1422171 - When dragging a link into a bookmark folder and scrolling down via the hovering over the down arrow it scrolls way too fast
// @include       main
// @async          true
// @compatibility Firefox 111
// @author        alice0775
// @version       2023/03/19 00:00 Bug 1791529
// @version       2021/07/10 00:00 proton?
// @version       2019/06/10 00:00 fix Bug 1533720 - Bookmark insertion indicator of bookmarks menu is slightly shifted in vertically, Bug 1479125 - Rewrite callers firstChild/lastChild/childNodes/previousSibling/nextSibling with firstElementChild/lastElementChild/children/previousElementSibling/nextElementSibling in browser.xul
// @version       2018/10/05 00:00 fix 60esr
// @version       2018/10/04 60+
// ==/UserScript==
"use strict";
var bug419911 = {

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

    menupopup.on_dragover = function on_dragover(event) {
      PlacesControllerDragHelper.currentDropTarget = event.target;
      let dt = event.dataTransfer;

      let dropPoint = this._getDropPoint(event);
      if (
        !dropPoint ||
        !dropPoint.ip ||
        !PlacesControllerDragHelper.canDrop(dropPoint.ip, dt)
      ) {
        this._indicatorBar.hidden = true;
        event.stopPropagation();
        return;
      }

      // Mark this popup as being dragged over.
      this.setAttribute("dragover", "true");

      if (dropPoint.folderElt) {
        // We are dragging over a folder.
        // _overFolder should take the care of opening it on a timer.
        if (
          this._overFolder.elt &&
          this._overFolder.elt != dropPoint.folderElt
        ) {
          // We are dragging over a new folder, let's clear old values
//          this._overFolder.clear();
        }
        if (!this._overFolder.elt) {
          this._overFolder.elt = dropPoint.folderElt;
          // Create the timer to open this folder.
          this._overFolder.openTimer = this._overFolder.setTimer(
            this._overFolder.hoverTime
          );
        }
        // Since we are dropping into a folder set the corresponding style.
//        dropPoint.folderElt.setAttribute("_moz-menuactive", true);
      } else {
        // We are not dragging over a folder.
        // Clear out old _overFolder information.
//        this._overFolder.clear();
      }

      // Autoscroll the popup strip if we drag over the scroll buttons.
      let scrollDir = 0;
      if (event.originalTarget == this.scrollBox._scrollButtonUp) {
        scrollDir = -1;
      } else if (event.originalTarget == this.scrollBox._scrollButtonDown) {
        scrollDir = 1;
      }
      if (scrollDir != 0) {
        this.scrollBox.scrollByIndex(scrollDir, true);
      }

      // Check if we should hide the drop indicator for this target.
      if (dropPoint.folderElt || this._hideDropIndicator(event)) {
        this._indicatorBar.hidden = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // We should display the drop indicator relative to the arrowscrollbox.
      let scrollRect = this.scrollBox.getBoundingClientRect();
      let newMarginTop = 0;
      if (scrollDir == 0) {
        let elt = this.firstElementChild;
        for (; elt; elt = elt.nextElementSibling) {
          let height = elt.getBoundingClientRect().height;
          if (height == 0) {
            continue;
          }
          if (event.screenY <= elt.screenY + height / 2) {
            break;
          }
        }
        newMarginTop = elt
          ? elt.screenY - this.scrollBox.screenY
          : scrollRect.height;
      } else if (scrollDir == 1) {
        newMarginTop = scrollRect.height;
      }

      // Set the new marginTop based on arrowscrollbox.
      newMarginTop +=
        scrollRect.y - this._indicatorBar.parentNode.getBoundingClientRect().y;
      this._indicatorBar.firstElementChild.style.marginTop =
        newMarginTop + "px";
      this._indicatorBar.hidden = false;

      event.preventDefault();
      event.stopPropagation();
    }

  }
}


bug419911.init();
