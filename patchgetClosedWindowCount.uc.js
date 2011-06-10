// ==UserScript==
// @name           patchgetClosedWindowCount.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    getClosedWindowCount
// @include        main
// @compatibility  Firefox 3.0 3.5 3.6
// @author         Alice0775
// @version        LastMod 2009/06/01 14:30
// @Note
// ==/UserScript==

(function(){
  if (HistoryMenu && typeof HistoryMenu.toggleRecentlyClosedWindows != 'undefined') {
    var func = HistoryMenu.toggleRecentlyClosedWindows.toSource();
    func = func.replace("if (this._ss.getClosedWindowCount() == 0)","if (typeof this._ss.getClosedWindowCount != 'function' || this._ss.getClosedWindowCount() == 0)");
    eval('HistoryMenu.toggleRecentlyClosedWindows = ' + func);
  }
})();
