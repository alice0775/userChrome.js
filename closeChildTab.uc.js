// ==UserScript==
// @name           closeChildTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    openTabsWhere_whichTabSelectWhenCloseTabと連動, 子タブを閉じるメニューを親タブのタブコンテキストメニューに追加
// @author         Alice0775
// @include        main
// @version        2010/03/26 13:00  Minefield/3.7a4pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/15 00:00  Minefield/3.7a4pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2008/12/21 mTabを使うように
// @compatibility  Firefox 2.0 3.0
// ==/UserScript==
// @version        LastMod 2007/11/13 01:30 locale
// @version        LastMod 2007/11/11 21:30 Session Manager, タブの復元による子タブの入れ子状態の保存および復元に対応
// @version        LastMod 2007/11/11 00:30 openTabsWhere_whichTabSelectWhenCloseTab.uc.jsに連動 子タブの入れ子に対応
// @version        LastMod 2007/11/11 00:00

(function closeChildTab() {
  if('TreeStyleTabService' in window) return;
  //tab context menu
  var tabContext = document.getAnonymousElementByAttribute(
                        gBrowser, "anonid", "tabContextMenu") ||
                   gBrowser.tabContainer.contextMenu;
  var menuitem1 = tabContext.appendChild(
                      document.createElement("menuitem"));
  menuitem1.id = "closeChildTabAndParent";
  menuitem1.setAttribute("accesskey", "o");
  menuitem1.setAttribute("oncommand","gBrowser.closeChildTabAndParent(gBrowser.mContextTab)");

  var menuitem2 = tabContext.appendChild(
                      document.createElement("menuitem"));
  menuitem2.id = "closeChildTabOnly";
  menuitem2.setAttribute("accesskey", "k");
  menuitem2.setAttribute("oncommand","gBrowser.closeChildTabOnly(gBrowser.mContextTab)");

  tabContext.addEventListener('popupshowing',function(event){
    var locale = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    locale = locale.getCharPref("general.useragent.locale");
    var n = gBrowser.getChildTabCount(gBrowser.mContextTab);
    if (n < 1) {
      menuitem1.setAttribute("hidden", true);
      menuitem2.setAttribute("hidden", true);
      return;
    }
    menuitem1.setAttribute("hidden", false);
    menuitem1.setAttribute("label", locale.indexOf("ja")==-1?"Close Child Tabs w/ Parent Tab[" + (n + 1) + "]":"\u89aa\u3068\u5b50\u30bf\u30d6\u3092\u9589\u3058\u308b[" + (n + 1) + "]");
    menuitem2.setAttribute("hidden", false);
    menuitem2.setAttribute("label", locale.indexOf("ja")==-1?"Close Child Tabs[" + n + "]":"\u5b50\u30bf\u30d6\u3092\u9589\u3058\u308b[" + n + "]");
  },false);

  function getMostRightChildTab(pTab){
    if( !pTab.hasAttribute("Olinkedpanel")) return pTab;
    var mTabChilds = gBrowser.mTabs;
    var Olinkedpanel = pTab.getAttribute("Olinkedpanel");
    var rTab = pTab;
    for(var i= pTab._tPos+1,len=mTabChilds.length;i<len;i++){
      var aTab = mTabChilds[i];
      if(aTab.hasAttribute("Plinkedpanel")
         && aTab.getAttribute("Plinkedpanel").indexOf(Olinkedpanel) > -1){
        rTab = aTab;
      }else{
        break;
      }
    }
    if(rTab == null ) rTab = pTab;
    return rTab;
  }

  gBrowser.getChildTabCount = function (pTab){
     if( !pTab.hasAttribute("Olinkedpanel")) return 0;
     var mTabChilds = gBrowser.mTabs;
     var Olinkedpanel = pTab.getAttribute("Olinkedpanel");
      var rTab = pTab;
      for(var i= pTab._tPos+1,len=mTabChilds.length;i<len;i++){
        var aTab = mTabChilds[i];
        if(aTab.hasAttribute("Plinkedpanel")
           && aTab.getAttribute("Plinkedpanel").indexOf(Olinkedpanel) > -1){
          rTab = aTab;
        }else{
          break;
        }
      }
      if(rTab == null ) rTab = pTab;
      var n = rTab._tPos - pTab._tPos;
      return (n > 0) ? n : 0;
  }

  gBrowser.closeChildTabAndParent = function (aTab){
    if (aTab.localName != "tab")
      aTab = this.mCurrentTab;
    var rTab = getMostRightChildTab(aTab);

    if ( aTab._tPos <= this.mCurrentTab._tPos && this.mCurrentTab._tPos <= rTab._tPos)
      this.mTabContainer.selectedItem = aTab;

    var childNodes = this.mTabs;
    for ( i = rTab._tPos; i > aTab._tPos-1; i-- )
      this.removeTab(childNodes[i]);
  }

  gBrowser.closeChildTabOnly = function (aTab){
    if (aTab.localName != "tab")
      aTab = this.mCurrentTab;
    var rTab = getMostRightChildTab(aTab);

    if ( aTab._tPos < this.mCurrentTab._tPos && this.mCurrentTab._tPos <= rTab._tPos)
      this.mTabContainer.selectedItem = aTab;

    var childNodes = this.mTabs;
    for ( i = rTab._tPos; i > aTab._tPos; i-- )
      this.removeTab(childNodes[i]);
  }
})();
