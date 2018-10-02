// ==UserScript==
// @name          doNotSelectTab_fx60.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   do not select tab when dragging it, 非アクティブをドラッグ開始した際,そのタブが前面になるのを阻止する。
// @include       main
// @compatibility Firefox 60+
// @version       2018/10/03 00:20 fix do not load tab when if it is pending background tab, wip
// @version       2018/10/02 23:10 fix do not select tab when right click, wip
// @version       2018/10/02 23:00 fix do not select tab when click on speeker icon, wip
// @version       2018/10/02 wip
// @todo          should investigate side effects due to event.stopPropagation when mousedown
// ==/UserScript==
let do_not_select_tab_when_mousedown = {
  init: function() {
    gBrowser.tabContainer.addEventListener("mousedown", this, true);
    window.addEventListener("unload", this. false);
  },

  uninit() {
    gBrowser.tabContainer.removeEventListener("mousedown", this, true);
    window.removeEventListener("unload", this. false);
 },

  _mousedownTab : null,
  _mousedownTimer: null,
  _selectedTab: null,
  _pending: null,
  
  handleEvent(event) {
    let tab, selectedTab;
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
      case "mousedown":
        if (event.button != 0)
          return;
        tab = event.target;
        if (tab.selected)
          return;
        if (event.button == 0 && !tab.selected && (event.ctrlKey || event.shiftKey))
          break;
        tab.addEventListener("dragstart", this, true);
        tab.addEventListener("mouseup", this, true);
        this._mousedownTab = tab;
        this._pending = tab.hasAttribute("pending");
        this._selectedTab = gBrowser.selectedTab;
        // xxx should investigate side effects due to event.stopPropagation when mousedown
        event.stopPropagation(); 
        break;
      case "dragstart":
        if (!this._mousedownTab)
          break;
        if (this._mousedownTimer)
          clearTimeout(this._mousedownTimer);
        this._mousedownTimer = setTimeout(() => {
          gBrowser.selectedTab = this._selectedTab;
          if (this._pending)
            gBrowser.discardBrowser(this._mousedownTab.linkedBrowser);
        }, 0);
        this._mousedownTab.removeEventListener("dragstart", this, true);
        this._mousedownTab.removeEventListener("mouseup", this, true);
        break;
      case "mouseup":
        if (event.button != 0)
          return;
        if (!this._mousedownTab)
          break;
        this._mousedownTab.removeEventListener("dragstart", this, true);
        this._mousedownTab.removeEventListener("mouseup", this, true);
        tab = event.target;
        if (this._mousedownTimer)
          clearTimeout(this._mousedownTimer);
        let originalTarget = event.originalTarget;
        let soundPlayingIcon =
          document.getAnonymousElementByAttribute(tab, "anonid", "soundplaying-icon");
        let overlayIcon =
          document.getAnonymousElementByAttribute(tab, "anonid", "overlay-icon")
        if (this._mousedownTab == tab &&
            !(soundPlayingIcon == originalTarget || overlayIcon == originalTarget))
          gBrowser.selectedTab = tab;
        break;
    }
  },
}

do_not_select_tab_when_mousedown.init();
