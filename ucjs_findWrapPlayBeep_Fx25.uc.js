// ==UserScript==
// @name           ucjs_findWrapPlayBeep.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Findbarページ内検索において検索が折り返す時にビープ音を鳴らす (見つからない場合は何もしない)
// @include        main
// @compatibility  Firefox 56+
// @author         Alice0775
// @version        2018/09/15 10:00 56+
// ==/UserScript==

var findWrapPlayBeep = {
  init: function() {
      if (!/pending/.test(gBrowser.getFindBar.toString())) {
        //-Fx60
        findbar = gBrowser.getFindBar();
        this.patch(findbar);
      } else {
        //Fx61+
        if (typeof gFindBar == "undefined") {
          setTimeout(() => {
          gBrowser.getFindBar().then((findbar) => {
            this.patch(findbar);
          });
          }, 1000); /// xxx workarroundfor Bug 1411707
        }
      }
  },

  patch: function(aFindBar) {
    aFindBar._updateStatusUI_org =  aFindBar._updateStatusUI;
    aFindBar._updateStatusUI = function(res, aFindPrevious) {
       switch (res) {
          case this.nsITypeAheadFind.FIND_WRAPPED:
            findWrapPlayBeep.playBeep();
            break;
        }
      this._updateStatusUI_org(res, aFindPrevious);
    }
  },

  playBeep: function() {
    Components.classes["@mozilla.org/sound;1"]
              .createInstance(Components.interfaces.nsISound)
              .beep();
  }
}
findWrapPlayBeep.init();
