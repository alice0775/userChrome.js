// ==UserScript==
// @name          doNotSelectTab_fx60.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   do not select tab when dragging it, after D&D, the unloaded state is not maintained. 非アクティブをドラッグ開始した際,そのタブが前面になるのを阻止する。
// @include       main
// @async          true
// @compatibility Firefox 140
// @version        2025/03/07 fix advanceSelectedTab does not work. (However, after D&D, the unloaded state is not maintained anymore.)
// @version        2025/03/07 fix bug of select tab
// @version        2025/03/05 fix under sidebar.verticalTabs=true
// @version        2020/09/20 workarround for Bug 1590573
// @version        2019/11/14 workarround for busy icon
// @version        2019/11/14 wait for init gBrowser
// @version        2019/02/22 00:00 fix 67 Bug 675539 - Make tab discard functionality work on tab object directly
// @version       2018/12/26 11:50 ignore close button 
// @version       2018/10/03 23:00 more aggressive pending tab 
// @version       2018/10/03 19:00 fix should not react on newtab button and other button, wip
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
    gBrowser.explicitUnloadTabs2 = async function explicitUnloadTabs2(aTab, discarded){
      await gBrowser.explicitUnloadTabs([aTab]);
      if (!discarded)
        aTab.removeAttribute("discarded");
      else
        aTab.setAttribute("discarded", "");
    }
  },

  uninit() {
    gBrowser.tabContainer.removeEventListener("mousedown", this, true);
    window.removeEventListener("unload", this. false);
 },

  _mousedownTab : null,
  _mousedownTimer: null,
  _selectedTab: null,
  _pending: null,
  _discarded: null,
  
  handleEvent(event) {
    let tab, selectedTab;
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
      case "mousedown":
        if (event.button != 0)
          break;
        tab = event.originalTarget;
        if (tab.classList.contains("tab-icon-sound")) {
          //console.log("tab-icon-sound")
          break;
        }
        if (tab.classList.contains("tab-close-button")) {
          //console.log("tab-close-button")
          break;
        }
        // xxx 複数タブ選択時は規定の動作とする
        if (gBrowser.multiSelectedTabsCount > 0)
          break;

        tab = event.target.closest('tab');
        if (!tab)
          break;
        //console.log("tab")
        if (tab.selected)
          break;
        if (event.button == 0 && !tab.selected && (event.ctrlKey || event.shiftKey))
          break;
        tab.addEventListener("dragstart", this, true);
        tab.addEventListener("mouseup", this, true);
        this._mousedownTab = tab;
        this._pending = tab.hasAttribute("pending");
        this._discarded = tab.hasAttribute("discarded");
        this._selectedTab = gBrowser.selectedTab;
        // xxx should investigate side effects due to event.stopPropagation when mousedown
        event.stopPropagation();
        //console.log("mousedown event.stopPropagation()")
        break;
      case "dragstart":
        if (!this._mousedownTab)
          break;
        if (this._mousedownTimer)
          clearTimeout(this._mousedownTimer);
        
        this._mousedownTimer = setTimeout(() => {
          gBrowser.selectedTab = this._selectedTab;
          setTimeout(() => {
            if (this._pending) {
              //gBrowser.explicitUnloadTabs2(this._mousedownTab, this._discarded);
            }
          }, 250);
        }, 0);
        
        // xxx more aggressive
        gBrowser.selectedTab = this._selectedTab;

        this._mousedownTab.removeEventListener("dragstart", this, true);
        this._mousedownTab.removeEventListener("mouseup", this, true);
        break;
      case "mouseup":
        if (event.button != 0)
          break;
        if (!this._mousedownTab)
          break;
        this._mousedownTab.removeEventListener("dragstart", this, true);
        this._mousedownTab.removeEventListener("mouseup", this, true);
        tab = event.target.closest('tab');
        if (!tab)
          break;
        if (this._mousedownTimer)
          clearTimeout(this._mousedownTimer);
        let originalTarget = event.originalTarget;
        let soundPlayingIcon = tab.soundPlayingIcon;
        let overlayIcon = tab.overlayIcon;
        //console.log(this._mousedownTab == tab)
        //console.log(!(soundPlayingIcon == originalTarget || overlayIcon == originalTarget))
        if (this._mousedownTab == tab &&
            !(soundPlayingIcon == originalTarget || overlayIcon == originalTarget)) {
          gBrowser.selectedTab = tab;
          //console.log("mouseup selected")
        }
        break;
    }
  },
}


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  do_not_select_tab_when_mousedown.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      do_not_select_tab_when_mousedown.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
