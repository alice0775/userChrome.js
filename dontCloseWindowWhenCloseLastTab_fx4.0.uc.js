// ==UserScript==
// @name           dontCloseWindowWhenCloseLastTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    常にタブバーを表示するをオフの時, 最後のタブを閉じてもウインドウは閉じない
// @include        main
// @compatibility  Firefox 4.0
// @author         Alice0775
// @version        2010/08/18 00:00 Bug 577820
// @version        2010/04/09 00:00 Bug 554991  - allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/23 02:50 Bug 501714 -  Last tab should show close button when browser.tabs.closeWindowWithLastTab=false (missing close button, no close button on last tab, does not have)

// @version        2009/10/07 22:50 tabバーを常に表示しない場合はダブが一つしかない場合タブを表示しない Bug 504475 -  closing last tab shows tab bar with "Always show the tab bar" off, and browser.tabs.closeWindowWithLastTab = false
// @version        2009/10/07 22:30 chromehiddenがnullでないなら最後のタブを閉じるときウインドウを閉じるように
// @Note
// ==/UserScript==
(function(){
  var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  UI.charset = "UTF-8";

  // xxx Bug 577820
  gBrowser.mPrefs.setBoolPref("browser.tabs.closeWindowWithLastTab", true);

/*
  //最後のタブを閉じたときホームページを表示
  if ("_endRemoveTab" in gBrowser) {
    var func = gBrowser._endRemoveTab.toString();
    func = func.replace(
      '"about:blank"',
      <><![CDATA[
      'gHomeButton.getHomePage() || $&'
      ]]></>
    );
    eval('gBrowser._endRemoveTab = ' + func);
  }
*/

  var func = TabContextMenu.updateContextMenu.toSource();
  func = func.replace(
    'var disabled = gBrowser.visibleTabs.length == 1',
    <><![CDATA[
    if (false && Services.prefs.getBoolPref("browser.tabs.closeWindowWithLastTab") ||
        gBrowser.tabs[0].linkedBrowser.currentURI.spec == "about:blank" )
      var disabled = gBrowser.visibleTabs.length == 1;
    else {
      disabled = gBrowser.visibleTabs.length == 0;
    }
    ]]></>
  );
  eval('TabContextMenu.updateContextMenu = ' + func);
  var style = <><![CDATA[
  .tabbrowser-tab:not([pinned]):only-child  .tab-close-button,
  .tabbrowser-tab:not([pinned]):only-child  {
    display: -moz-box !important;
    visibility: visible !important;
  }  .tabbrowser-tab[label="(Untitled)"]:not([pinned]):only-child  .tab-close-button,
  .tabbrowser-tab[label="New Tab"]:not([pinned]):only-child  .tab-close-button,
  .tabbrowser-tab[label="(無題)"]:not([pinned]):only-child  .tab-close-button,
  .tabbrowser-tab[label="新しいタブ"]:not([pinned]):only-child  .tab-close-button {
    display: -moz-box !important;
    visibility: collapse !important;
  }
  ]]></>.toString();
  try{style = UI.ConvertToUnicode(style)}catch(e){}
  var sspi = document.createProcessingInstruction(
    'xml-stylesheet',
    'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
  );
  document.insertBefore(sspi, document.documentElement);
  sspi.getAttribute = function(name) {
  return document.documentElement.getAttribute(name);
  };


  // chromehiddenがnullでないなら最後のタブを閉じるときウインドウを閉じる
  func = gBrowser._beginRemoveTab.toSource();
  func = func.replace(
    'this.mPrefs.getBoolPref("browser.tabs.closeWindowWithLastTab")',
    <><![CDATA[
    ($&
    || !!this.ownerDocument.documentElement.getAttribute("chromehidden"));
    ]]></>
  );
  eval('gBrowser._beginRemoveTab = ' + func);

  // tabバーを常に表示しない場合はダブが一つしかない場合タブを表示しない
  // Bug 504475 -  closing last tab shows tab bar with "Always show the tab bar" off, and browser.tabs.closeWindowWithLastTab = false
  func = gBrowser.addTab.toSource();
  func = func.replace(
    'if (this.mStrip.collapsed) {',
    <><![CDATA[
    if (this.mStrip.collapsed &&
        this.mTabs.length - this._removingTabs.length > 1) {
    ]]></>
  );
  eval('gBrowser.addTab = ' + func);

  var func = gBrowser._beginRemoveTab.toString();
  func = func.replace(
    '{',
    <><![CDATA[
    {
    aCloseWindowWithLastTab = false;
    ]]></>
  );
  eval('gBrowser._beginRemoveTab = ' + func);

  gBrowser.tabContainer.addEventListener("click", function(event) {
    if (event.button != 1) return;
    var tab = aEvent.originalTarget;
    while(tab) {
      if (tab.localName == "tab")
        break;
      tab = tab.parentNode;
    }
    if (!tab)
      return;
    event.stopPropagation();
    gBrowser.removeTab(event.target, {animate: true});
  }, true);
  
  func = gBrowser.removeTab.toString();
  func = func.replace(
    ' if (aParams) {',
    <><![CDATA[
    if (this.tabContainer._closeWindowWithLastTab &&
        this.tabs.length == 1)
      gBrowser.addTab('about:blank');
    $&
    ]]></>
  );
  eval('gBrowser.removeTab = ' + func);


  //Fxのバージョン
  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }

})();