// ==UserScript==
// @name           ucjs_findWrapPlayBeep.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Findbarページ内検索において検索が折り返す時にビープ音を鳴らす (見つからない場合は何もしない)
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 23.0a1+
// @author         Alice0775
// @version        2013/05/11 12:00 Bug537013, Bug 893349
// @version        2013/03/28 11:00 Improved to work properly without addHistoryFindbarFx3.0.uc.js
// @version        2012/08/12 22:30 Bug 761723 implement toString of function objects by saving source
// ==/UserScript==
// @version        2010/01/05 Migemoが無いときの処理
// @version        2010/01/05
// @note           Migemoの場合accessibility.typeaheadfind.enablesound;falseとした方がいいような
var findWrapPlayBeep = {
  init: function() {
    //fx25 for existing findbar
    let findBars = document.querySelectorAll("findbar");
    if (findBars.length > 0) {
      for (var aFindBar of findBars) {
        findWrapPlayBeep.patch(aFindBar);
      };
    } else if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar)
        findWrapPlayBeep.patch(gBrowser.selectedTab._findBar);
    }
    //fx25 for newly created findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
        findWrapPlayBeep.patch(event.target._findBar);
      });
    }

    findWrapPlayBeep.patch2();
  },

  patch: function(aFindBar) {
    var func = aFindBar._updateStatusUI.toString();
    func = func.replace(/(?:case this.nsITypeAheadFind.FIND_WRAPPED:)/, '$& findWrapPlayBeep.playBeep();');
    try{
      aFindBar._updateStatusUI = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*/, '').replace(/^{/, '').replace(/}$/, '')
      );
    } catch(ex){}
  },

  patch2: function() {
    // XUL/Migemo
    if (!('XMigemoUI' in window))
      return;
    var func = XMigemoUI.onXMigemoFindProgress.toString();
    func = func.replace('{', '$& if (aEvent.resultFlag & XMigemoFind.WRAPPED) findWrapPlayBeep.playBeep();');
    try{
      XMigemoUI.onXMigemoFindProgress = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*/, '').replace(/^{/, '').replace(/}$/, '')
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
