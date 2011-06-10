// ==UserScript==
// @name           duplicateTabInContextMenu
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    duplicateTabInContextMenu.uc.js
// @include        main
// @compatibility  Firefox 3.5 3.6 4.0b2pre
// @author         Alice0775
// @version        2010/07/05 17:00  Minefield/4.0b2pre
// @version        2010/03/26 13:00  Minefield/3.7a4pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/15 00:00  Minefield/3.7a4pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2007/10/04 03:00
// @Note           about:config の設定値
// @Note           userChrome.openDuplicateNext          : 複製したタブを右隣に開くか(規定値false)
// @Note           userChrome.openDuplicateInBackground  : 複製したタブを背面に開くか(規定値false)
// @reference code cf. Copy Dragged Tab by zeniko
// ==/UserScript==
(function(){
  const PREFID = '@mozilla.org/preferences-service;1';
  const nsIPrefBranch = Components.interfaces.nsIPrefBranch
  const PREF = Components.classes[PREFID].getService(nsIPrefBranch);
if('TM_init' in window) return;
if('MultipleTabService' in window &&
   PREF.getBoolPref('extensions.multipletab.show.multipletab-context-duplicate')) return;

gBrowser.duplicateTab = function(aTab) {
  var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].getService(Components.interfaces.nsISessionStore);
  var state = ss.getWindowState(aTab.ownerDocument.defaultView);
  state = JSON.parse(state);
  state.windows[0].tabs = state.windows[0].tabs.splice(aTab._tPos, 1);
  ss.setWindowState(window, JSON.stringify(state), false);

  return document.getAnonymousElementByAttribute(this, "linkedpanel", this.mPanelContainer.lastChild.id);
};

gBrowser.duplicateTabInContextMenu = function(event){
  const PREFID = '@mozilla.org/preferences-service;1';
  const nsIPrefBranch = Components.interfaces.nsIPrefBranch
  const PREF = Components.classes[PREFID].getService(nsIPrefBranch);
  var tabs = [];
  tabs.push(gBrowser.mContextTab);

  for (var i= 0; i < tabs.length; i++){
    var tab = gBrowser.duplicateTab(tabs[i]);
    if((function(){try{return PREF.getBoolPref('userChrome.openDuplicateNext',false)}catch(e){return false}})())
      tab = gBrowser.moveTabTo(tab, tabs[i]._tPos + 1);
    if(i == 0 &&
       !(function(){try{return PREF.getBoolPref('userChrome.openDuplicateInBackground',false)}catch(e){return false}})())
      gBrowser.selectedTab = tab;
  }
}

//tab context menu
const locale = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefBranch2).getCharPref("general.useragent.locale");
var tabContext = document.getAnonymousElementByAttribute(
                        gBrowser, "anonid", "tabContextMenu") ||
                 gBrowser.tabContainer.contextMenu;
var menuitem = document.createElement("menuitem")
menuitem.id = "duplicateTabContext";
menuitem.setAttribute("label", locale.indexOf("ja") == -1?"Duplicate Tab":"\u30bf\u30d6\u3092\u8907\u88fd");//タブを複製
menuitem.setAttribute("accesskey", "D");
menuitem.setAttribute("oncommand", "gBrowser.duplicateTabInContextMenu(event);" );
tabContext.insertBefore(menuitem,tabContext.firstChild.nextSibling);
})();