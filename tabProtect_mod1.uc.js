// ==UserScript==
// @name           tabProtect_mod1.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    tabProtect
// @include        main
// @author         Alice0775
// @Note           タスクバーからprivate browsingモードに入るとtabの状態と復帰後のtabのセッション保存おかしくなる
// @compatibility  4.0b8pre
// @version        2010/12/22 11:00 最近のTree Style Tabは変更多すぎるからもう知らん
// @version        2010/10/12 11:00 by Alice0775  4.0b8pre
// @version        2010/03/26 13:00  Minefield/3.7a4pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/15 00:00  Minefield/3.7a4pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2010/01/29 16:00 http://piro.sakura.ne.jp/latest/blosxom/mozilla/extension/treestyletab/2009-09-29_debug.htm
// @version        2009/09/03 22:00 Firegox3.7a1preで動かなくなっていたのを修正(Bug 489925. getElementById should not return anonymous nodes)
// ==/UserScript==
// @version        2009/07/21 Multiple Tab Handler 0.4.2009072001
// @version        2009/06/25 Private browsing Modeに対応 (TMPは未検証)
// @version        2008/12/30 Multiple Tab Handler
// @version        2008/12/21 mTabを使うように
// @version        2008/12/09 20:00 toggle少し改良
// @version        2008/03/18 20:00 Fx2 css
// @version        2008/03/06 00:00 tree style tab 0.5.2008030303
// @version        2008/02/21 01:00 Fx3 css
// @version        2008/02/04 19:00 Fx3 css
// @version        2008/02/01 22:00 Fx3 css
// @version        2007/12/01 21:00 Fx3 css
// @version        2007/11/23 01:00 Bug 387345 - Restyle the tabstrip. css
// @version        2007/11/23 00:00 Bug 387345 - Restyle the tabstrip.
// @version        2007/11/14 16:00

var tabProtect = {
  debug: function(aMsg){
          Cc["@mozilla.org/consoleservice;1"]
            .getService(Ci.nsIConsoleService)
            .logStringMessage(aMsg.toString());
  },

  init: function(){
    this.tabContextMenu();

    // Tree Stryle Tab
    if ("treeStyleTab" in gBrowser &&
       "performDrop" in gBrowser.treeStyleTab) {
      func = gBrowser.treeStyleTab.performDrop.toString();
        func = func.replace(
        'targetBrowser.swapBrowsersAndCloseOther(tab, aTab);',
        <><![CDATA[
//window.userChrome_js.debug("swap  " + aTab.label + "  " + aTab.hasAttribute("tabProtect"));
        if (aTab.hasAttribute("tabProtect")) {
          tab.setAttribute("tabProtect", true);
          gBrowser.protectTabIcon(tab);
        } else {
          tab.removeAttribute("tabProtect");
        }
        $&
        ]]></>
        );
      eval("gBrowser.treeStyleTab.performDrop = "+ func);
    } else if ('_onDrop' in gBrowser){ //Fx3.1b1pre
      func = gBrowser._onDrop.toString();
        func = func.replace(
        'this.swapBrowsersAndCloseOther(newTab, draggedTab);',
        <><![CDATA[
//window.userChrome_js.debug("swap  " + draggedTab.label + "  " + draggedTab.hasAttribute("tabProtect"));
        if (draggedTab.hasAttribute("tabProtect")) {
          newTab.setAttribute("tabProtect", true);
          gBrowser.protectTabIcon(newTab);
        } else {
          newTab.removeAttribute("tabProtect");
        }
        $&
        ]]></>
        );
      eval("gBrowser._onDrop = "+ func);
    } else {
      func = gBrowser.swapBrowsersAndCloseOther.toString();
        func = func.replace(
        /}$/,
        <><![CDATA[
//window.userChrome_js.debug("swap  " + draggedTab.label + "  " + draggedTab.hasAttribute("tabProtect"));
        if (aOtherTab.hasAttribute("tabProtect")) {
          aOurTab.setAttribute("tabProtect", true);
          gBrowser.protectTabIcon(aOurTab);
        }
        $&
        ]]></>
        );
      eval("gBrowser.swapBrowsersAndCloseOther = "+ func);
    }

    //tabbrowser.xmlを置き換え
    var func = gBrowser.removeTab.toString();
    func = func.replace(
    '{',
    <><![CDATA[
    {
     if (aTab.localName != "tab")
       aTab = this.selectedTab;
     if (aTab.hasAttribute("tabProtect")) return;
    ]]></>
    );
    eval("gBrowser.removeTab = " + func);
    //this.debug(gBrowser.removeTab.toString());

    //privatebrowsing
    if ('gPrivateBrowsingUI' in window && !('TM_init' in window)) {
      var func = gPrivateBrowsingUI.toggleMode.toString();
      func = func.replace(
      'this._privateBrowsingService.privateBrowsingEnabled =',
      <><![CDATA[
      if (!this.privateBrowsingEnabled) {
        for (var i= 0; i < gBrowser.mTabs.length; i++) {
          if ( gBrowser.isProtectTab(gBrowser.mTabs[i])) {
            gBrowser.mTabs[i].setAttribute('savedProtectTab', true);
            gBrowser.mTabs[i].removeAttribute("tabProtect");
          }
        }
      }
      $&
      ]]></>
      );
      func = func.replace(
      /}&/,
      <><![CDATA[
      if (this.privateBrowsingEnabled) {
        setTimeout(function(){
          for (var i= 0; i < gBrowser.mTabs.length; i++) {
            if ( gBrowser.mTabs[i].hasAttribute('savedProtectTab')) {
              gBrowser.mTabs[i].removeAttribute('savedProtectTab');
              gBrowser.protectTab(gBrowser.mTabs[i]);
            }
          }
        }, 0);
      }
      $&
      ]]></>
      );
      eval("gPrivateBrowsingUI.toggleMode = " + func);
    }

    // CSSを適用
    var stack = document.getAnonymousElementByAttribute(
                            gBrowser.mTabContainer.firstChild, "class", "tab-icon") ||
                document.getAnonymousElementByAttribute(
                            gBrowser.mTabContainer.firstChild, "class", "tab-stack");
    if(this.getVer()<3 ||
       typeof TreeStyleTabService !='undefined' ||
       typeof MultipleTabService !='undefined' ||
       stack){
      var style = <><![CDATA[
      .tab-close-button[hidden='true'] image {
        width: 0px;
      }
      .tab-icon-protect{
        list-style-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQUlEQVQ4jWNgGAXDADASUvDvOsN/fPJMlLqAhRhFTJqo/H/XKXQBsoFEuQDDVnIMQPcGXJxYA3C5hiwvUOwCZAAAlRcK7m+YgB4AAAAASUVORK5CYII=');
      }
      .tab-icon-protect[hidden='true'] {
        display: none;
      }
      ]]></>.toString();
    }else{
      var style = <><![CDATA[
      .tab-close-button[hidden='true'] {
        display: none;
      }
      .tabProtect {
        background-color:#ddddaa;
      }

      .tabProtect[selected="true"] {
        background-color:#ddddaa;
      }
      .tabProtect[selected="true"]:hover {
        background-color:#ddddaa;
     }

      .tabProtect:not([selected="true"]) {
        background-color:#ddddaa;
      }
      .tabProtect:not([selected="true"]):hover {
        background-color:#ddddaa;
      }
      ]]></>.toString();
    }
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

    //起動時のタブ状態復元
    var that = this;
    setTimeout(function(){that.restoreForTab(gBrowser.selectedTab);},0);
    init(0);
    function init(i){
      if(i < gBrowser.mTabs.length){
        var aTab = gBrowser.mTabs[i];
        if(aTab.linkedBrowser.docShell.busyFlags
          || aTab.linkedBrowser.docShell.restoringDocument){
          setTimeout(init,250,i);
        }else{
          that.restoreForTab(aTab);
          i++;
          setTimeout(init,0,i);
        }
      }else{
      }
    }

    gBrowser.tabContainer.addEventListener('TabMove', tabProtect.TabMove, false);
    gBrowser.tabContainer.addEventListener('SSTabRestored', tabProtect.restore,false);
    window.addEventListener('unload',function(){ tabProtect.uninit();},false)

    //Multiple Tab Handler
    /*
    var menupopup = document.getElementById('multipletab-selection-menu');
    if (menupopup){
      var menuitem = document.createElement('menuitem');
      menuitem.setAttribute('label', 'Toggle Protect Selected Tabs');
      menuitem.setAttribute('oncommand', 'tabProtect.toggleProtectSelectedTabs();');
      menupopup.appendChild(menuitem);
    }
    */
  },

  uninit: function(){
    gBrowser.tabContainer.removeEventListener('drop', this.onDrop, true);
    gBrowser.tabContainer.removeEventListener('TabMove', tabProtect.TabMove, false);
    gBrowser.tabContainer.removeEventListener('SSTabRestored', tabProtect.restore,false);
  // document.documentElement.removeEventListener('SubBrowserFocusMoved', function(){ tabProtect.init(); }, false);
  },

  getVer: function(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  },

  //TAB D&D
  onDrop: function(aEvent) {
    var newIndex = this._getDropIndex(aEvent);
    if (newIndex >= 0 && newIndex < gBrowser.tabContainer.childNodes.length) {

    }
  },

  _getDropIndex: function (aEvent){
    var tabs = gBrowser.tabContainer.childNodes;
    var tab = gBrowser.tabContainer._getDragTargetTab(aEvent);
    for (let i = tab ? tab._tPos : 0; i < tabs.length; i++)
      if (aEvent.screenX > tabs[i].boxObject.screenX &&
          aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width &&
          aEvent.screenY > tabs[i].boxObject.screenY &&
          aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height)
        return i;
    return -1;
  },

  TabMove: function(aEvent){
    var aTab = aEvent.target;
    gBrowser.protectTabIcon(aTab);
  },

  tabContextMenu: function(){
    //tab context menu
    var tabContext = document.getAnonymousElementByAttribute(
                        gBrowser, "anonid", "tabContextMenu") ||
                     gBrowser.tabContainer.contextMenu;
    var menuitem = this.tabProtectMenu
                 = tabContext.appendChild(
                        document.createElement("menuitem"));
    menuitem.id = "tabProtect";
    menuitem.setAttribute("type", "checkbox");
    menuitem.setAttribute("label", "Protect This Tab");
    menuitem.setAttribute("accesskey", "P");
    menuitem.setAttribute("oncommand","tabProtect.toggle(event);");
    tabContext.addEventListener('popupshowing',function(event){tabProtect.setCheckbox(event);},false);
  },

  restore: function(event){
    var aTab =  event.originalTarget;
    tabProtect.restoreForTab(aTab);
  },

  restoreForTab: function(aTab){
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].
                             getService(Components.interfaces.nsISessionStore);
    var retrievedData = ss.getTabValue(aTab, "tabProtect");
    if(retrievedData){
      aTab.setAttribute('tabProtect',true);
      var closeButton = document.getAnonymousElementByAttribute(
                             aTab, "anonid", "close-button");
      closeButton.setAttribute('hidden',true);
    }
    gBrowser.protectTabIcon(aTab);
  },

  toggle: function(event){
    var aTab =  gBrowser.mContextTab || gBrowser.tabContainer._contextTab;
    if (!aTab)
      aTab = event.target;
    while( aTab && aTab instanceof XULElement && aTab.localName !='tab'){
      aTab = aTab.parentNode;
    }
    if( !aTab || aTab.localName !='tab') return;
    gBrowser.protectTab(aTab);
  },

  toggleProtectSelectedTabs: function(){
    var tabs = MultipleTabService.getSelectedTabs();
    gBrowser.protectTab(tabs[0]);
    //var isProtectFirstTab = gBrowser.isProtectTab(tabs[0]);
    for (var i= 1; i < tabs.length; i++){
      //if (isProtectFirstTab != gBrowser.isProtectTab(tabs[i]))
        gBrowser.protectTab(tabs[i]);
    }
  },

  setCheckbox: function(event){
    var menuitem = this.tabProtectMenu;
    var aTab =  gBrowser.mContextTab || gBrowser.tabContainer._contextTab;
    if (!aTab)
      aTab = event.target;
    while( aTab && aTab instanceof XULElement && aTab.localName !='tab'){
      aTab = aTab.parentNode;
    }
    if( !aTab || aTab.localName !='tab'){
      menuitem.setAttribute('hidden',true);
      return;
    }
    menuitem.setAttribute('hidden',false);
    if(aTab.hasAttribute('tabProtect') && aTab.getAttribute('tabProtect')){
      menuitem.setAttribute('checked', true);
    }else{
      menuitem.setAttribute('checked', false);
    }
  },

  checkCachedSessionDataExpiration: function(aTab) {
    var data = aTab.linkedBrowser.__SS_data; // Firefox 3.6-
    if (data &&
       data._tabStillLoading &&
       aTab.getAttribute('busy') != 'true')
      data._tabStillLoading = false;
  }
}
if(!('TM_init' in window)) {
  gBrowser.isProtectTab = function (aTab){
    //var x = gBrowser.isLockTab.caller;
    return aTab.hasAttribute("tabProtect");
  }

  gBrowser.protectTab = function (aTab){
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].
                               getService(Components.interfaces.nsISessionStore);
    if ( aTab.hasAttribute("tabProtect") ){
      aTab.removeAttribute("tabProtect");
      tabProtect.checkCachedSessionDataExpiration(aTab);
      try {
        ss.deleteTabValue(aTab, "tabProtect");
      } catch(e) {}
      var isProtected = false;
    } else {
      aTab.setAttribute("tabProtect", "true");
      ss.setTabValue(aTab, "tabProtect", true);
      var isProtected = true;
    }
    this.protectTabIcon(aTab);
    return isProtected;
  }

  gBrowser.protectTabIcon = function (aTab){
    const kXULNS =
             "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var closeButton = document.getAnonymousElementByAttribute(
                    aTab, "anonid", "close-button");
    var image = document.getAnonymousElementByAttribute(
                             aTab, "class", "tab-icon-protect");
    if ( aTab.hasAttribute("tabProtect") ){
      closeButton.setAttribute('hidden',true);
      if(!image){
        var stack = document.getAnonymousElementByAttribute(
                               aTab, "class", "tab-icon") ||
                    document.getAnonymousElementByAttribute(
                               aTab, "class", "tab-stack");
        var image = document.createElementNS(kXULNS,'image');
        image.setAttribute('class','tab-icon-protect');
        image.setAttribute('left',0);
        image.setAttribute('top',0);
        if(stack) stack.appendChild(image);
      }
      aTab.setAttribute('class',aTab.getAttribute('class')+' tabProtect');
      image.removeAttribute('hidden');
    }else{
      closeButton.setAttribute('hidden',false);
      if(image){
        image.setAttribute('hidden', true);
      }
      aTab.setAttribute('class',aTab.getAttribute('class').replace(/\stabProtect/g,''));
    }
  }
}

if(!('TM_init' in window)) tabProtect.init();
