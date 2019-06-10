// ==UserScript==
// @name          patchForBug419911andBug1422171.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 419911 - Support diagonal dragging through bookmarks menus (was:Bookmarks submenu is closed immediately during dragging)  and Bug 1422171 - When dragging a link into a bookmark folder and scrolling down via the hovering over the down arrow it scrolls way too fast
// @include       main
// @compatibility Firefox 67+
// @author        alice0775
// @version       2019/06/10 00:00 fix Bug 1533720 - Bookmark insertion indicator of bookmarks menu is slightly shifted in vertically, Bug 1479125 - Rewrite callers firstChild/lastChild/childNodes/previousSibling/nextSibling with firstElementChild/lastElementChild/children/previousElementSibling/nextElementSibling in browser.xul
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
        let anonid = event.originalTarget.getAttribute("anonid");
        let scrollDir = 0;
        if (anonid == "scrollbutton-up") {
          scrollDir = -1;
        } else if (anonid == "scrollbutton-down") {
          scrollDir = 1;
        }
        if (scrollDir != 0) {
          this._scrollBox.scrollByIndex(scrollDir, true);
        }

      // Check if we should hide the drop indicator for this target.
      if (dropPoint.folderElt || this._hideDropIndicator(event)) {
        this._indicatorBar.hidden = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // We should display the drop indicator relative to the arrowscrollbox.
      let scrollRect = this._scrollBox.getBoundingClientRect();
      let newMarginTop = 0;
      if (scrollDir == 0) {
        let elt = this.firstElementChild;
        while (elt && event.screenY > elt.screenY +
                                      elt.getBoundingClientRect().height / 2)
          elt = elt.nextElementSibling;
        newMarginTop = elt ? elt.screenY - this._scrollBox.screenY :
                               scrollRect.height;
      }
      else if (scrollDir == 1)
        newMarginTop = scrollRect.height;

      // Set the new marginTop based on arrowscrollbox.
        newMarginTop += scrollRect.y - this._scrollBox.getBoundingClientRect().y;
        this._indicatorBar.firstElementChild.style.marginTop = newMarginTop + "px";
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
      if (!target || !this.contains(target))
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
