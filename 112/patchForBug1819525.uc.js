// ==UserScript==
// @name          patchForBug1819525.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1819525 - Firefox now shows one pixel line at bottom of Window when taskbar is set to "Hide" and Firefox's titlebar is disabled
// @include       main
// @compatibility Firefox 111 (Windows11 only)
// @author        alice0775
// @version       2023/03/10 00:00
// ==/UserScript==
"use strict";
var bug1819525 = {

  flg: false,
  w: 0,
  h: 0,
  x: 0,
  y: 0,

  init: function(){
    const lazy = {};
    XPCOMUtils.defineLazyModuleGetters(lazy, {
      WindowsVersionInfo:
      "resource://gre/modules/components-utils/WindowsVersionInfo.jsm",
    });
    if (lazy.WindowsVersionInfo.get().buildNumber < 22000) {
      return;
    }

    window.restore_bug1819525 = window.restore;
    window.restore = function() {
      window.restore_bug1819525();
      if (bug1819525.flag) {
        window.resizeTo(bug1819525.w, bug1819525.h);
        window.moveTo(bug1819525.x, bug1819525.y);
        bug1819525.flag = false;
      }
    }

    window.maximize_bug1819525 = window.maximize;
    window.maximize = function() {
      if (Services.prefs.getIntPref("browser.tabs.inTitlebar", 0) == 0) {
        window.maximize_bug1819525();
        return;
      }
      if (bug1819525.flag) {
        window.resizeTo(bug1819525.w, bug1819525.h);
        window.moveTo(bug1819525.x, bug1819525.y);
        bug1819525.flag = false;
      } else {
        bug1819525.flag = true;
        setTimeout(() => {
          window.resizeTo(window.screen.availWidth + 15, window.screen.availHeight + 13.9);
          window.moveTo(-5,1);
          setTimeout(() => {window.maximize_bug1819525();}, 0);
        }, 400);
      }
    }
    // 変更を監視するノードを選択
    const targetNode = document.getElementById("main-window");
    // (変更を監視する) オブザーバーのオプション
    const config = { attributes: true, childList: false, subtree: false };

    // 変更が発見されたときに実行されるコールバック関数
    const callback = function(mutationsList, observer) {
      for(const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
          bug1819525.resize();
        }
      }
    };

    // コールバック関数に結びつけられたオブザーバーのインスタンスを生成
    this.observer = new MutationObserver(callback);

    // 対象ノードの設定された変更の監視を開始
    this.observer.observe(targetNode, config);
    
    this.resize();
    window.addEventListener("unload", this);
  },

  handleEvent: function(event){
    switch (event.type) {
      case 'unload':
        // 監視を停止
        this.observer.disconnect();
        break;
    }
  },

  resize: function() {
    const w = document.getElementById("main-window");
    if (window.windowState == window.STATE_NORMAL) {
      if (this.flag) {
        return;
      }
      this.w = parseInt(w.getAttribute("width"));
      this.h = parseInt(w.getAttribute("height"));
      this.x = parseInt(w.getAttribute("screenX"));
      this.y = parseInt(w.getAttribute("screenY"));
    }
  }
}

bug1819525.init();
