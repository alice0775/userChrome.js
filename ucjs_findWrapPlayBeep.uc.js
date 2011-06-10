// ==UserScript==
// @name           ucjs_findWrapPlayBeep.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Findbarページ内検索において検索が折り返す時にビープ音を鳴らす (見つからない場合は何もしない)
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 3.0 3.5 3.6 3.7a1pre
// @author         Alice0775
// @version        2010/01/05 Migemoが無いときの処理
// @version        2010/01/05
// @note           Migemoの場合accessibility.typeaheadfind.enablesound;falseとした方がいいような
// ==/UserScript==
var findWrapPlayBeep = {
  init: function() {
    if (!("gFindBar" in window)) {
      window.gFindBar = document.getElementById("FindToolbar");
    }
    if (!('_updateStatusUI' in gFindBar))
      return;
    var timer, count = 0;
    timer = setInterval(function(self){
      if(++count > 10000 || /playBeep/.test(gFindBar._updateStatusUI.toString())){
        clearInterval(timer);
      } else {
        self.patch();
      }
    }, 250, this);
  },

  patch: function() {
    var func = gFindBar._updateStatusUI.toString();
    func = func.replace(/(?:case this.nsITypeAheadFind.FIND_WRAPPED:)/, '$& findWrapPlayBeep.playBeep();');
    try{
      gFindBar._updateStatusUI = new Function(
         func.match(/\((.*)\)\s*\{/)[1],
         func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
      );
    } catch(ex){}

    // XUL/Migemo
    if (!('XMigemoUI' in window))
      return;
    var func = XMigemoUI.onXMigemoFindProgress.toString();
    func = func.replace('{', '$& if (aEvent.resultFlag & XMigemoFind.WRAPPED) findWrapPlayBeep.playBeep();');
    try{
      XMigemoUI.onXMigemoFindProgress = new Function(
         func.match(/\((.*)\)\s*\{/)[1],
         func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
      );
    } catch(ex){}
  },

  playBeep: function() {
    Components.classes["@mozilla.org/sound;1"]
              .createInstance(Components.interfaces.nsISound)
              .beep();
  }
}
findWrapPlayBeep.init();
