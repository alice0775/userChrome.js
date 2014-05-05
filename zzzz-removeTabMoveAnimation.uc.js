// ==UserScript==
// @name           zzzz-removeTabMoveAnimation.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    remove tab move animation
// @include        main
// @compatibility  Firefox29+
// @author         Alice0775
// @note           no tab related addon installed
// @version        2014/05/05 10:30 Fixed for Fx29
// @version        2014/05/05 09:00 Fx29
// @version        2013/11/19 19:00 getShortcutOrURI
// @version        2012/12/05 16:00 tst
// ==/UserScript==
// @version        2014/05/05 10:30 Fx29-Fx32
// @version        2014/05/05 09:00 Fx29
// @version        2012/12/05 00:40 cleanup
// @version        2012/12/04 18:40 pinned
// @version        2012/12/04 01:00
if (window['piro.sakura.ne.jp'] &&
    "tabsDragUtils" in window['piro.sakura.ne.jp'] &&
    "canAnimateDraggedTabs" in window['piro.sakura.ne.jp'].tabsDragUtils) {
  window['piro.sakura.ne.jp'].tabsDragUtils.canAnimateDraggedTabs = function TDU_canAnimateDraggedTabs(aEvent) {
    return false;
  }
} else {
  (function(){
  
    gBrowser.tabContainer.getShortcutOrURI = function getShortcutOrURI(aURI) {
      // Firefox 24 and older
      if ("getShortcutOrURI" in window)
        return getShortcutOrURI(aURI);

      // Firefox 25 and Fx30
      var getShortcutOrURIAndPostData = window.getShortcutOrURIAndPostData;
      var done = false;
      Task.spawn(function() {
        var data = yield getShortcutOrURIAndPostData(aURI);
        aURI = data.url;
        done = true;
      });

      // this should be rewritten in asynchronous style...
      var thread = Cc['@mozilla.org/thread-manager;1'].getService().mainThread;
      while (!done)
      {
        thread.processNextEvent(true);
      }

      return aURI;
    } 

      gBrowser.tabContainer._onDragOver = function(event) {
        var effects = this._setEffectAllowedForDataTransfer(event);
        var ind = this._tabDropIndicator;
        if (effects == "" || effects == "none") {
          ind.collapsed = true;
          return;
        }
        event.preventDefault();
        event.stopPropagation();

        var tabStrip = this.mTabstrip;
        var ltr = (window.getComputedStyle(this, null).direction == "ltr");

        // autoscroll the tab strip if we drag over the scroll
        // buttons, even if we aren't dragging a tab, but then
        // return to avoid drawing the drop indicator
        var pixelsToScroll = 0;
        if (this.getAttribute("overflow") == "true") {
          var targetAnonid = event.originalTarget.getAttribute("anonid");
          switch (targetAnonid) {
            case "scrollbutton-up":
              pixelsToScroll = tabStrip.scrollIncrement * -1;
              break;
            case "scrollbutton-down":
              pixelsToScroll = tabStrip.scrollIncrement;
              break;
          }
          if (pixelsToScroll)
            tabStrip.scrollByPixels((ltr ? 1 : -1) * pixelsToScroll);
        }

        //if (effects == "move" &&
        //    this == event.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0).parentNode) {
          //ind.collapsed = true;
          //this._animateTabMove(event);
          //return;
        //}

        //this._finishAnimateTabMove();

        if (effects == "link") {
          let tab = this._getDragTargetTab(event);
          if (tab) {
            if (!this._dragTime)
              this._dragTime = Date.now();
            if (Date.now() >= this._dragTime + this._dragOverDelay)
              this.selectedItem = tab;
            ind.collapsed = true;
            return;
          }
        }

        var rect = tabStrip.getBoundingClientRect();
        var newMargin;
        if (pixelsToScroll) {
          // if we are scrolling, put the drop indicator at the edge
          // so that it doesn't jump while scrolling
          let scrollRect = tabStrip.scrollClientRect;
          let minMargin = scrollRect.left - rect.left;
          let maxMargin = Math.min(minMargin + scrollRect.width,
                                   scrollRect.right);
          if (!ltr)
            [minMargin, maxMargin] = [this.clientWidth - maxMargin,
                                      this.clientWidth - minMargin];
          newMargin = (pixelsToScroll > 0) ? maxMargin : minMargin;
        }
        else {
          let newIndex = this._getDropIndex(event);
          if (newIndex == this.childNodes.length) {
            let tabRect = this.childNodes[newIndex-1].getBoundingClientRect();
            if (ltr)
              newMargin = tabRect.right - rect.left;
            else
              newMargin = rect.right - tabRect.left;
          }
          else {
            let tabRect = this.childNodes[newIndex].getBoundingClientRect();
            if (ltr)
              newMargin = tabRect.left - rect.left;
            else
              newMargin = rect.right - tabRect.right;
          }
        }

        ind.collapsed = false;

        newMargin += ind.clientWidth / 2;
        if (!ltr)
          newMargin *= -1;

        ind.style.transform = "translate(" + Math.round(newMargin) + "px)";
        ind.style.MozMarginStart = (-ind.clientWidth) + "px";
      };
      gBrowser.tabContainer.addEventListener("dragover", gBrowser.tabContainer._onDragOver, true);


      gBrowser.tabContainer._onDrop = function(event) {
        var dt = event.dataTransfer;
        var dropEffect = dt.dropEffect;
        var draggedTab;
        if (dropEffect != "link") { // copy or move
          draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
          // not our drop then
          if (!draggedTab)
            return;
        }

        this._tabDropIndicator.collapsed = true;
        event.stopPropagation();
        if (draggedTab && dropEffect == "copy") {
          // copy the dropped tab (wherever it's from)
          let newIndex = this._getDropIndex(event);
          let newTab = this.tabbrowser.duplicateTab(draggedTab);
          this.tabbrowser.moveTabTo(newTab, newIndex);
          if (draggedTab.parentNode != this || event.shiftKey)
            this.selectedItem = newTab;
        } else if (draggedTab && draggedTab.parentNode == this) {
          //this._finishAnimateTabMove();
          // actually move the dragged tab
          //if ("animDropIndex" in draggedTab._dragData) {
          //  let newIndex = draggedTab._dragData.animDropIndex;
          //  if (newIndex > draggedTab._tPos)
          //    newIndex--;
          //  this.tabbrowser.moveTabTo(draggedTab, newIndex);
          //}
          let newIndex = this._getDropIndex(event);
          if (newIndex > draggedTab._tPos)
            newIndex--;
          let numPinned = this.tabbrowser._numPinnedTabs;
          if (newIndex < numPinned && !draggedTab.pinned) {
            this.tabbrowser.pinTab(draggedTab);
          } else if (numPinned <= newIndex && draggedTab.pinned) {
            this.tabbrowser.unpinTab(draggedTab);
          }
          this.tabbrowser.moveTabTo(draggedTab, newIndex);
        } else if (draggedTab) {
          // swap the dropped tab with a new one we create and then close
          // it in the other window (making it seem to have moved between
          // windows)
          let newIndex = this._getDropIndex(event);
          let newTab = this.tabbrowser.addTab("about:blank");
          let newBrowser = this.tabbrowser.getBrowserForTab(newTab);
          // Stop the about:blank load
          newBrowser.stop();
          // make sure it has a docshell
          newBrowser.docShell;

          let numPinned = this.tabbrowser._numPinnedTabs;
          if (newIndex < numPinned || draggedTab.pinned && newIndex == numPinned)
            this.tabbrowser.pinTab(newTab);
          this.tabbrowser.moveTabTo(newTab, newIndex);

          //draggedTab.parentNode._finishAnimateTabMove();
          this.tabbrowser.swapBrowsersAndCloseOther(newTab, draggedTab);

          // We need to select the tab after we've done
          // swapBrowsersAndCloseOther, so that the updateCurrentBrowser
          // it triggers will correctly update our URL bar.
          this.tabbrowser.selectedTab = newTab;
        } else {
          // Pass true to disallow dropping javascript: or data: urls
          let url;
          try {
            url = browserDragAndDrop.drop(event, { }, true);
          } catch (ex) {}

          // valid urls don't contain spaces ' '; if we have a space it isn't a valid url.
          if (!url || url.contains(" "))
            return;

          let bgLoad = Services.prefs.getBoolPref("browser.tabs.loadInBackground");

          if (event.shiftKey)
            bgLoad = !bgLoad;

          let tab = this._getDragTargetTab(event);
          if (Components.classes["@mozilla.org/xre/app-info;1"]
                 .getService(Components.interfaces.nsIXULAppInfo).version.split(".")[0] < 31) {
            if (!tab || dropEffect == "copy") {
              // We're adding a new tab.
              let newIndex = this._getDropIndex(event);
              let newTab = this.tabbrowser.loadOneTab(this.getShortcutOrURI(url), {inBackground: bgLoad});
              this.tabbrowser.moveTabTo(newTab, newIndex);
            } else {
              // Load in an existing tab.
              try {
                this.tabbrowser.getBrowserForTab(tab).loadURI(this.getShortcutOrURI(url));
                if (!bgLoad)
                  this.selectedItem = tab;
              } catch(ex) {
                // Just ignore invalid urls
              }
            }
          } else {
            //Fx31,32...
            if (!tab || dropEffect == "copy") {
              // We're adding a new tab.
              let newIndex = this._getDropIndex(event);
              getShortcutOrURIAndPostData(url, data => {
                if (data.url) {
                  let newTab = this.tabbrowser.loadOneTab(data.url, {inBackground: bgLoad});
                  this.tabbrowser.moveTabTo(newTab, newIndex);
                }
              });
            } else {
              // Load in an existing tab.
              try {
                getShortcutOrURIAndPostData(url, data => {
                  if (data.url) {
                    this.tabbrowser.getBrowserForTab(tab).loadURI(data.url);
                    if (!bgLoad)
                      this.selectedItem = tab;
                  }
                });
              } catch(ex) {
                // Just ignore invalid urls
              }
            }
          }
        }

        if (draggedTab) {
          delete draggedTab._dragData;
        };
      }
      gBrowser.tabContainer.addEventListener("drop", gBrowser.tabContainer._onDrop, true);

  })();
}
