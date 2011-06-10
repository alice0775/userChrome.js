// ==UserScript==
// @name           revert_loadFolderAndReplace.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    revert_loadFolderAndReplace
// @include        main
// @compatibility  Firefox 3.0 4.0
// @modified by    Alice0775
// @version        2008/12/21 mTabを使うように
// @version        2008/09/19 22:40 Homeボタンで開くときblankならそこに開く
// @Note
// ==/UserScript==
// @version        2008/09/11 23:00 タブが置き換わるとき警告するように
// @version        2008/09/07 23:00
// @version        2008/06/28 12:00
//loadFolderAndReplace  aReplace
//   T                  T(L-click)        All existing tabs were closed and replaced.
//   T                  F(M-click)        New tabs will be appended to existing tabs.
//   F                  T(L-click)        New tabs will be appended to existing tabs.
//   F                  F(M-click)        All existing tabs were closed and replaced.
(function(){
  //-- confug --
  var cancelMode = false;  //複数のタブをクローズするときCancelした場合, 追加する[false] 何もしないtrue
  //-- confug --
  if(('TM_init' in window))
    return;
  if('TreeStyleTabService' in window)
    return;
  gBrowser.loadTabs = function(aURIs, aLoadInBackground, aReplace){
    // The tab selected after this new tab is closed (i.e. the new tab's
    // "owner") is the next adjacent tab (i.e. not the previously viewed tab)
    // when several urls are opened here (i.e. closing the first should select
    // the next of many URLs opened) or if the pref to have UI links opened in
    // the background is set (i.e. the link is not being opened modally)
    //
    // i.e.
    //    Number of URLs    Load UI Links in BG       Focus Last Viewed?
    //    == 1              false                     YES
    //    == 1              true                      NO
    //    > 1               false/true                NO
    var pref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefBranch2);
    try {
      var loadFolderAndReplace = pref.getBoolPref("browser.tabs.loadFolderAndReplace");
    } catch(ex){
      var loadFolderAndReplace = true;
    }
    if (loadFolderAndReplace == aReplace){
      if (gBrowser.warnAboutClosingTabs(true)){
        //all existing tabs were closed and replaced.
        var numTabs = gBrowser.mTabs.length;
        if (numTabs > 1){
          var warnOnClose =  pref.getBoolPref("browser.tabs.warnOnClose");
          pref.setBoolPref("browser.tabs.warnOnClose", false);
            gBrowser.removeAllTabsBut(gBrowser.addTab("about:blank"));
          aReplace = true;
          pref.setBoolPref("browser.tabs.warnOnClose", warnOnClose);
        }
      } else {
        if (!cancelMode){
          aReplace = false;
        } else {
          return;
        }
      }
    } else {
      //New tabs will be appended to existing tabs.
      aReplace = false;
    }
    var owner = (aURIs.length > 1) || aLoadInBackground ? null : gBrowser.selectedTab;
    var firstTabAdded = null;
    if (aReplace)
      this.loadURI(aURIs[0], null, null);
    else {
      if (gBrowser.mCurrentTab.linkedBrowser.docShell.busyFlags ||
          gBrowser.mCurrentTab.linkedBrowser.docShell.restoringDocument ||
          gBrowser.mCurrentTab.linkedBrowser.contentDocument.URL != 'about:blank'){
        firstTabAdded = gBrowser.addTab(aURIs[0], null, null, null, owner, false);
      } else {
        gBrowser.loadURI(aURIs[0], null, null, false);
      }
    }

    var tabNum = this.mTabContainer.selectedIndex;
    for (var i = 1; i < aURIs.length; ++i) {
      var tab = gBrowser.addTab(aURIs[i]);
      if (aReplace)
        this.moveTabTo(tab, ++tabNum);
    }

    if (!aLoadInBackground) {
      if (firstTabAdded) {
        // .selectedTab setter focuses the content area
        this.selectedTab = firstTabAdded;
      }
      else
        window.content.focus();
    }
  }
})();