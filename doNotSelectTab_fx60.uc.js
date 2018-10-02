// ==UserScript==
// @name          doNotSelectTab_fx60.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   do not select tab when dragging it, 非アクティブをドラッグ開始した際,そのタブが前面になるのを阻止する。
// @include       main
// @compatibility Firefox 60+
// @version       2018/10/02
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

  _mousedown : null,
  _mousedownTimer: null,
  _selectedTab: null,
  
  handleEvent(event) {
    let tab, selectedTab;
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
      case "mousedown":
        tab = event.target;
        if (tab.selected)
          return;
        if (event.button == 0 && !tab.selected && (event.ctrlKey || event.shiftKey))
          break;
        tab.addEventListener("dragstart", this, true);
        tab.addEventListener("mouseup", this, true);
        this._mousedown = tab;
        this._selectedTab = gBrowser.selectedTab;
        // xxx should investigate side effects due to event.stopPropagation when mousedown
        event.stopPropagation(); 
        break;
      case "dragstart":
        if (!this._mousedown)
          break;
        tab = event.target;
        this._mousedown.removeEventListener("dragstart", this, true);
        this._mousedown.removeEventListener("mouseup", this, true);
        if (this._mousedownTimer)
          clearTimeout(this._mousedownTimer);
        this._mousedownTimer = setTimeout(() => {gBrowser.selectedTab = this._selectedTab;}, 0);
        break;
      case "mouseup":
        if (!this._mousedown)
          break;
        this._mousedown.removeEventListener("dragstart", this, true);
        this._mousedown.removeEventListener("mouseup", this, true);
        tab = event.target;
        if (this._mousedownTimer)
          clearTimeout(this._mousedownTimer);
        if (this._mousedown == tab)
          gBrowser.selectedTab = tab;
        break;
    }
  },
}

do_not_select_tab_when_mousedown.init();
