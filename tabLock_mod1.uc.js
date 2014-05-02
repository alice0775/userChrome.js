// ==UserScript==
// @name           tabLock_mod1.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    tabLock
// @include        *
// @compatibility  17-25
// @version        2014/02/21 23:00  Multiple Tab Handler #66 
// @version        2013/12/21 23:00 exclude "prevent"
// @version        2013/11/06 10:20 Bug 846635 - Use asynchronous getCharsetForURI in getShortcutOrURI in Firefox25 and later
// @version        2013/04/06 09:00 Bug 748740
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2012/08/12 22:00 init変更
// @version        2012/02/06 07:00  sidebar 修正
// @version        2012/01/04 22:00  gURLBar.handleCommand 修正
// @version        2011/07/21 22:00  Bug 658383
// @version        2011/03/30 22:00  undefined error
// @version        2011/02/15 22:00  xxx paste and go 
// @version        2011/02/11 11:00  xxx Bug 633260 bookmark menu does not open (involves app tabs and feeds) 
// @Note           about:configの設定
//  userChrome.tabLock.ignoreNextPrevLink タブをロックしている状態で, 次のページ, 前のページ などは ロックを無視するかどうか [true]/false
//  userChrome.tabLock.ignoreHashLink タブをロックしている状態で, href ="#xxx" の場合ロックを無視するかどうか[true]/false
//  userChrome.tabLock.ignoreBrowserBack_Forward タブをロックしている状態で, BrowserBack/Forwardを [0]:通常動作, 1:新規タブに開く, 2:機能しなくする

//  browser.tabs.loadInBackground           リンクを背面で開くかどうか [true]/false
//  browser.tabs.loadBookmarksInBackground  ブックマークを背面で開くかどうか true/[false]
//  browser.tabs.loadUrlInBackground        ロケーションバーを背面で開くかどうか true/[false]
//  未実装browser.tabs.loadSearchInBackground     検索バーを背面で開くかどうか [true]/false

patch: {
  if (location.href == "chrome://updatescan/content/updatescan.xul") {
    var func = USc_updatescan._diffItemThisWindow.toString();
    func = func.replace(
      'if (diffURL) {',
      '$& \
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"] \
                         .getService(Components.interfaces.nsIWindowMediator); \
      var mainWindow = wm.getMostRecentWindow("navigator:browser"); \
      if (mainWindow.gBrowser.isLockTab(mainWindow.gBrowser.selectedTab) && \
          !/^\s*(javascript:|data:)/.test(diffURL)) { \
        mainWindow.gBrowser.loadOneTab(diffURL, null, null, null, false, null); \
        return; \
      }'
    );
    eval ("USc_updatescan._diffItemThisWindow = " + func);
  }


  if (location.href == "chrome://browser/content/places/places.xul" ||
      location.href == "chrome://browser/content/bookmarks/bookmarksPanel.xul" ||
      location.href == "chrome://browser/content/history/history-panel.xul") {
    var func = openLinkIn.toString();
    if (!/isLockTab/.test(func)) {
      func = func.replace(
        /{/,
        '{ \
          var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"] \
                             .getService(Components.interfaces.nsIWindowMediator); \
          var mainWindow = wm.getMostRecentWindow("navigator:browser"); \
          if (url && where == "current" && "isLockTab" in mainWindow.gBrowser && \
              mainWindow.gBrowser.isLockTab(mainWindow.gBrowser.selectedTab) && \
              !/^\s*(javascript:|data:)/.test(url)) { \
            where = "tab"; \
          }'
      );
      eval ("openLinkIn = " + func);
    }
  }


  if (location.href != "chrome://browser/content/browser.xul")
    break patch;



  window.tabLock = {
    ignoreNextPrevLink: true, //タブをロックしている状態で, 次のページ, 前のページ などは ロックを無視するかどうかデフォルト値
    ignoreHashLink: true, //タブをロックしている状態で,  href ="#xxx" などは ロックを無視するかどうかデフォルト値
    ignoreBrowserBackForward: 0, //タブをロックしている状態で, BrowserBack/Forwardを [0]:通常動作, 1:新規タブに開く, 2:機能しなくする

    init: function(){

      //Hack Second Search tohoho
      if ('SecondSearchBrowser' in window){
        eval("SecondSearchBrowser.prototype.loadForSearch = " +
            SecondSearchBrowser.prototype.loadForSearch.toSource().replace(
         'if (this.browser.localName == "tabbrowser"',
         'if (gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(aURI)){ \
            newTab = true; \
            isManual = false; \
          } \
          $&'
        ));

      eval("SecondSearchBrowser.prototype.checkToDoSearch = " +

      SecondSearchBrowser.prototype.checkToDoSearch.toSource().replace(
         'switch (aWhere)',
         'if (gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(aURI)){ \
            aWhere = "tab"; \
          } \
          $&'
        ));
      }

      func = window.loadURI.toString();
        func = func.replace(
          /(getBrowser\(\)|gBrowser)\.loadURIWithFlags/,
          'if (gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(uri)) { \
            gBrowser.loadOneTab(uri, referrer, null, postData, false, flags); \
              return; \
           } \
           $&'
        );
      eval("window.loadURI="+func);

      //BrowserBack/Forward
      window.BrowserForward_org = BrowserForward;
      BrowserForward = function(aEvent, aIgnoreAlt){
        try{
          var ignoreBrowserBackForward = gPrefService.getIntPref("userChrome.tabLock.ignoreBrowserBack_Forward");
        }catch(ex){
          var ignoreBrowserBackForward = tabLock.ignoreBrowserBackForward;
        }
        if(ignoreBrowserBackForward == 2 &&
          (gBrowser.selectedTab.hasAttribute("locked") ||
           typeof gBrowser.isLockTab !='undefined' && gBrowser.isLockTab(gBrowser.selectedTab))) return;
        if(ignoreBrowserBackForward !=0 &&
          (gBrowser.selectedTab.hasAttribute("locked") ||
           typeof gBrowser.isLockTab !='undefined' && gBrowser.isLockTab(gBrowser.selectedTab)) ) {
          var sessionHistory = getWebNavigation().sessionHistory;
          var currentIndex = sessionHistory.index;
          var entry = sessionHistory.getEntryAtIndex(currentIndex + 1, false);
          var url = entry.URI.spec;
          try{
            var loadInBackground = gPrefService.getBoolPref("browser.tabs.loadUrlInBackground");
          }catch(ex){
            var loadInBackground = false;
          }
          if (ignoreBrowserBackForward == 1)
            gBrowser.loadOneTab(url, null, null, null, loadInBackground, true);
          return;
        }
        BrowserForward_org(aEvent, aIgnoreAlt);
      };

      window.BrowserBack_org = BrowserBack;
      BrowserBack = function(aEvent, aIgnoreAlt){
        try{
          var ignoreBrowserBackForward = gPrefService.getIntPref("userChrome.tabLock.ignoreBrowserBack_Forward");
        }catch(ex){
          var ignoreBrowserBackForward = tabLock.ignoreBrowserBackForward;
        }
        if(ignoreBrowserBackForward == 2 &&
          (gBrowser.selectedTab.hasAttribute("locked") ||
           typeof gBrowser.isLockTab !='undefined' && gBrowser.isLockTab(gBrowser.selectedTab))) return;
        if(ignoreBrowserBackForward != 0 &&
          (gBrowser.selectedTab.hasAttribute("locked") ||
           typeof gBrowser.isLockTab !='undefined' && gBrowser.isLockTab(gBrowser.selectedTab)) ) {
          var sessionHistory = getWebNavigation().sessionHistory;
          var currentIndex = sessionHistory.index;
          var entry = sessionHistory.getEntryAtIndex(currentIndex - 1, false);
          var url = entry.URI.spec;
          try{
            var loadInBackground = gPrefService.getBoolPref("browser.tabs.loadUrlInBackground");
          }catch(ex){
            var loadInBackground = false;
          }
          if (ignoreBrowserBackForward == 1)
            gBrowser.loadOneTab(url, null, null, null, loadInBackground, true);
          return;
        }
        BrowserBack_org(aEvent, aIgnoreAlt);
      };

      //dropDown
      window.gotoHistoryIndex_org = gotoHistoryIndex;
      gotoHistoryIndex = function(aEvent){
        var index = aEvent.target.getAttribute("index");
        if (!index)
          return false;
        try{
          var ignoreBrowserBackForward = gPrefService.getIntPref("userChrome.tabLock.ignoreBrowserBack_Forward");
        }catch(ex){
          var ignoreBrowserBackForward = tabLock.ignoreBrowserBackForward;
        }
        if(ignoreBrowserBackForward == 2 &&
          (gBrowser.selectedTab.hasAttribute("locked") ||
           typeof gBrowser.isLockTab !='undefined' && gBrowser.isLockTab(gBrowser.selectedTab))) return false;

        if(ignoreBrowserBackForward != 0 &&
          (gBrowser.selectedTab.hasAttribute("locked") ||
           typeof gBrowser.isLockTab !='undefined' && gBrowser.isLockTab(gBrowser.selectedTab)) ) {
          var where = whereToOpenLink(aEvent);
          var sessionHistory = getWebNavigation().sessionHistory;
          var entry = sessionHistory.getEntryAtIndex(index, false);
          var url = entry.URI.spec;
          try{
            var loadInBackground = gPrefService.getBoolPref("browser.tabs.loadUrlInBackground");
          }catch(ex){
            var loadInBackground = false;
          }
          if (ignoreBrowserBackForward == 1)
            gBrowser.loadOneTab(url, null, null, null, loadInBackground, true);
          return true;
        }
        return gotoHistoryIndex_org(aEvent);
      }

      //locationbar
      func = gURLBar.handleCommand.toString();
      // xxx 
      func = func.replace(
       'altEnter = altEnter && !isTabEmpty(gBrowser.selectedTab);',
       '$& \
        altEnter = gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(url) || altEnter'
      );
/*Fx6+ xxx Bug 658383*/
      func = func.replace(
        'where = whereToOpenLink(aTriggeringEvent, false, false);',
        '$& \
        if (where == "current" && \
            gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(url) ) { \
          where = "tab"; \
        }'
      );
      func = func.replace(
        'if (aTriggeringEvent &&',
        'if ((aTriggeringEvent &&'
      );
      func = func.replace(
        'aTriggeringEvent.altKey && !isTabEmpty(gBrowser.selectedTab)) {',
        'aTriggeringEvent.altKey && !isTabEmpty(gBrowser.selectedTab) || \
        gBrowser.isLockTab(gBrowser.selectedTab)) && !/^\s*(javascript:|data:)/.test(url) ) {'
      );
/**/      
      func = func.replace(
        'openUILinkIn(url, where, {allowThirdPartyFixup: true, postData: postData});',
        'if (gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(url) ) { \
          this.handleRevert(); \
          content.focus(); \
          where = "tab"; \
        } \
        $&'
      );
      func = func.replace(
        'loadURI(url, null, postData, true);',
        'if (gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(url) ) { \
          this.handleRevert(); \
          content.focus(); \
          where = "tab"; \
          openUILinkIn(url, where, {allowThirdPartyFixup: true, postData: null}); \
        } else { \
          $& \
        }'
      );
      eval("gURLBar.handleCommand =" + func);

      //openUILinkIn whereToOpenLinkを書き換え現在のタブかつロックタブなら 新規タブに
      eval("openUILinkIn ="+openUILinkIn.toSource().replace(
      'switch (where) {',
      'if (where == "current" && gBrowser.isLockTab(gBrowser.selectedTab) && \
           !/^\s*(javascript:|data:)/.test(url) ) \
          where = "tab"; \
      $&'
      ));
  //this.debug('openUILinkIn: \n'+openUILinkIn.toString());


    //Left Click (Home Button, WizzRSS)
  //this.debug('gBrowser.loadURI: \n'+gBrowser.loadURI.toString());
      eval("gBrowser.loadURI ="+gBrowser.loadURI.toString().replace(
        '{',
        '{ \
        if (gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(aURI)){ \
          try{ \
            var loadInBackground = gPrefService.getBoolPref("browser.tabs.loadBookmarksInBackground"); \
          }catch(ex){ \
            var loadInBackground = false; \
          } \
          return gBrowser.loadOneTab(aURI, null, null, null, loadInBackground, false ); \
        }'
      ));
  //this.debug('gBrowser.loadURI: \n'+gBrowser.loadURI.toString());

      //Bookmark, History, searchBar, D&D form sidebar and from outside window.
  //this.debug('loadURI: \n'+loadURI.toString());
      eval("loadURI ="+loadURI.toString().replace(
        'getWebNavigation',
        'if (gBrowser.isLockTab(gBrowser.selectedTab) && !/^\s*(javascript:|data:)/.test(uri)){ \
          try{ \
            var loadInBackground = gPrefService.getBoolPref("browser.tabs.loadBookmarksInBackground"); \
          }catch(ex){ \
            var loadInBackground = false; \
          } \
          gBrowser.loadOneTab(uri, null, null, postData, loadInBackground, true ); \
        }else \
         $&'
      ));

  //this.debug('loadURI: \n'+loadURI.toString());
      if ("openLinkIn" in window) {
        var func = openLinkIn.toString();
        func = func.replace(
          'switch (where) {',
          'if (where == "current" && gBrowser.isLockTab(gBrowser.selectedTab) && \
               !/^\s*(javascript:|data:)/.test(url)){ \
            where = "tab"; \
          } \
          $&'
        );
        eval("openLinkIn =" + func);
      }
      
      // xxx Bug 633260 bookmark menu does not open (involves app tabs and feeds) 
      var p = document.getElementById('bookmarksMenuPopup');
      p.addEventListener('command',function(event){
        p.hidePopup();
      }, false);

      /*
      eval("PlacesUtils.openNodeWithEvent =" + PlacesUtils.openNodeWithEvent.toString().replace(
      '{',
      '{alert("openNodeWithEvent");'
      ));
      */
      try{
        var doc = document.getElementById("sidebar").contentDocument;
        if (doc) {
          var win = doc.defaultView;
          if(win.location == 'chrome://browser/content/bookmarks/bookmarksPanel.xul' || win.location == 'chrome://browser/content/history/history-panel.xul'){
              eval("win.SidebarUtils.handleTreeClick =" + win.SidebarUtils.handleTreeClick.toString());
              eval("win.SidebarUtils.handleTreeKeyPress =" + win.SidebarUtils.handleTreeKeyPress.toString());
          }
        }
      }catch(e){}


      //link click, through the event to window.handleLinkClick.
  //this.debug('contentAreaClick: \n'+window.contentAreaClick.toString());
      // Firefox22+
      if (!gBrowser.hasAttribute("onclick")) {
        Cc["@mozilla.org/eventlistenerservice;1"]
            .getService(Ci.nsIEventListenerService)
            .removeSystemEventListener(gBrowser, "click", contentAreaClick, true);
      }
      
      var func = contentAreaClick.toString();
      func = func.replace(
        'let target = linkNode.target;',
        '$& \
        if ( \
          ( !linkNode.getAttribute("onclick") && \
            gBrowser.isLockTab(gBrowser.selectedTab) && \
            !/^\s*(javascript:|data:)/.test((typeof wrapper != "undefined") ? wrapper.href : href) && \
             !( \
               gBrowser.isNextLink(linkNode) || \
               gBrowser.isPrevLink(linkNode) || \
               gBrowser.isHashLink(linkNode) \
             )  \
           ) \
        ) { \
            try { \
                urlSecurityCheck(href, linkNode.ownerDocument.nodePrincipal); \
            } catch (ex) { \
                event.preventDefault(); \
                return true; \
            } \
            let postData = {}; \
            let url = tabLock.getShortcutOrURI(href, postData); \
            if (!url) { \
                return true; \
            } \
            var doc = linkNode.ownerDocument; \
            if ("TreeStyleTabService" in window) \
              TreeStyleTabService.readyToOpenChildTab(gBrowser.selectedTab,false); \
            openLinkIn(url, "tab", { referrerURI: doc.documentURIObject, \
                             charset: doc.characterSet }); \
            event.preventDefault(); \
            return true; \
        }'
        );
      eval("contentAreaClick ="+func);
  //this.debug('contentAreaClick: \n'+window.contentAreaClick.toString());
      // Firefox22+
      if (!gBrowser.hasAttribute("onclick")) {
        Cc["@mozilla.org/eventlistenerservice;1"]
            .getService(Ci.nsIEventListenerService)
            .addSystemEventListener(gBrowser, "click", contentAreaClick, true);
      }


      //D&D on TAB
      func = gBrowser.swapBrowsersAndCloseOther.toString();
        func = func.replace(
        /}$/,
        'if (aOtherTab.hasAttribute("tabLock")) { \
          aOurTab.setAttribute("tabLock", true); \
          gBrowser.lockTabIcon(aOurTab); \
        } \
        $&'
        );
      eval("gBrowser.swapBrowsersAndCloseOther = "+ func);
      gBrowser.tabContainer.addEventListener('drop', this.onDrop, true);


      // #66
      if ("MultipleTabService" in window) {
        func = MultipleTabService.toggleTabsLocked.toString();
        func = func.replace(
        /this\._isTabLocked\(aTab\)\)/,
        'this._isTabLocked(tab))'
        );
      eval("MultipleTabService.toggleTabsLocked = "+ func);
        
      }


      this.tabContextMenu();

      // CSSを適用
      var stack = document.getAnonymousElementByAttribute(
                              gBrowser.mTabContainer.firstChild, "class", "tab-stack") ||
                  document.getAnonymousElementByAttribute(
                              gBrowser.mTabContainer.firstChild, "class", "tab-stack");;
      if(this.getVer()<3 ||
         typeof TreeStyleTabService !='undefined' ||
         typeof MultipleTabService !='undefined' ||
         stack) {
        var style = " \
        .tab-icon-lock{ \
          list-style-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAjElEQVQ4je3RsQ7CMAyE4S9pURl5/6csGxKJw1AKFBARK+IkD3Fyv86OQouHOhNBqzQcdJSPzCKIEMgkKFTMXcDmMI6LGzuGnvkFoBRQiWtn/x1g5dwBpx4gnalDxAZUcm4jad3HxwTpzaNxmtZef4RMkrNbDQPTtN53AanSniM0S6y8/ES82v76MV0AlREpDobXTpUAAAAASUVORK5CYII='); \
        } \
        .tab-icon-lock[hidden='true'] { \
          display: none !important; \
        }".replace(/\s+/g, " ");
      } else if(stack) {
        var style = ' \
          .tabbrowser-tab[fadein] .tab-stack, \
          .tabbrowser-tab[fadein]:hover .tab-stack, \
          .tabbrowser-tab[fadein][selected="true"] .tab-stack, \
          .tabbrowser-tab[fadein][selected="true"]:hover .tab-stack  { \
            border-top: transparent solid 1px; \
          } \
          .tabbrowser-tab[tabLock="true"][fadein] .tab-stack, \
          .tabbrowser-tab[tabLock="true"][fadein]:hover .tab-stack, \
          .tabbrowser-tab[tabLock="true"][fadein][selected="true"] .tab-stack, \
          .tabbrowser-tab[tabLock="true"][fadein][selected="true"]:hover .tab-stack  { \
            border-top: red solid 1px; \
          }'.replace(/\s+/g, " ");
      } else {
        var style = ' \
          .tabbrowser-tab[tabLock="true"], \
          .tabbrowser-tab[tabLock="true"]:hover, \
          .tabbrowser-tab[tabLock="true"][selected="true"], \
          .tabbrowser-tab[tabLock="true"][selected="true"]:hover  { \
            /*border-top: 2px solid !important;*/ \
            -moz-border-top-colors: red !important; \
            -moz-border-right-colors: red !important; \
            -moz-border-left-colors: red !important; \
          }'.replace(/\s+/g, " ");
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
          if(false && (aTab.linkedBrowser.docShell.busyFlags
            || aTab.linkedBrowser.docShell.restoringDocument) ){
            setTimeout(init,1000,i);
          }else{
            that.restoreForTab(aTab);
            i++;
            init(i);
            //setTimeout(init,0,i);
          }
        }else{
        }
      }

      gBrowser.tabContainer.addEventListener('TabMove', tabLock.TabMove, false);
      gBrowser.tabContainer.addEventListener('SSTabRestoring', tabLock.restore,false);
      window.addEventListener('unload',function(){ tabLock.uninit();},false)
    },

    uninit: function(){
      gBrowser.tabContainer.removeEventListener('drop', this.onDrop, true);
      gBrowser.tabContainer.removeEventListener('TabMove', tabLock.TabMove, false);
      gBrowser.tabContainer.removeEventListener('SSTabRestoring', tabLock.restore,false);
    // document.documentElement.removeEventListener('SubBrowserFocusMoved', function(){ tabLock.init(); }, false);
    },

    getVer: function(){
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
      // このコードを実行しているアプリケーションの名前を取得する
      var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
      return ver;
    },

     //acync to sync
    getShortcutOrURI : function getShortcutOrURI(aURI) {
      // Firefox 24 and older
      if ("getShortcutOrURI" in window)
        return getShortcutOrURI(aURI);

      // Firefox 25 and later
      var getShortcutOrURIAndPostData = window.getShortcutOrURIAndPostData;
      var done = false;
      Task.spawn(function() {
        var data = yield getShortcutOrURIAndPostData(aURI);
        aURI = data.url;
        done = true;
      });

      // this should be rewritten in asynchronous style...
      setTimeout(function(){done = true;}, 1000);
      var thread = Cc['@mozilla.org/thread-manager;1'].getService().mainThread;
      while (!done)
      {
        thread.processNextEvent(true);
      }

      return aURI;
    },

    //TAB D&D
    onDrop: function(aEvent) {
      function _getDropIndex(aEvent){
        var tabs = gBrowser.tabContainer.childNodes;
        var tab = gBrowser.tabContainer._getDragTargetTab(aEvent);
        for (let i = tab ? tab._tPos : 0; i < tabs.length; i++)
          if (aEvent.screenX > tabs[i].boxObject.screenX &&
              aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width &&
              aEvent.screenY > tabs[i].boxObject.screenY &&
              aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height)
            return i;
        return -1;
      }

      var newIndex = _getDropIndex(aEvent);

      if (newIndex >= 0 && newIndex < gBrowser.tabContainer.childNodes.length) {
        if (gBrowser.isLockTab(gBrowser.tabContainer.childNodes[newIndex])) {
          var dt = aEvent.dataTransfer;
          var url;
          for (var i=0; i < gBrowser.tabContainer._supportedLinkDropTypes.length; i++) {
            let dataType = gBrowser.tabContainer._supportedLinkDropTypes[i];
            // uri-list: for now, support dropping of the first URL
            // only
            var isURLList = dataType == "text/uri-list";
            let urlData = isURLList ?
                          dt.mozGetDataAt("URL", 0) : dt.mozGetDataAt(dataType, 0);
            if (urlData) {
              url = transferUtils.retrieveURLFromData(urlData, isURLList ? "text/plain" : dataType);
              break;
            }
          }
          NS_ASSERT(url, "In the drop event, at least one mime-type should match our supported types");

          // valid urls don't contain spaces ' '; if we have a space it isn't a valid url.
          // Also disallow dropping javascript: or data: urls--bail out
          if (!url || !url.length || url.indexOf(" ", 0) != -1 ||
              /^\s*(javascript|data):/.test(url))
            return;

          // urlSecurityCheck
          urlSecurityCheck(url, gBrowser.tabContainer.childNodes[0].linkedBrowser.contentPrincipal,
                           Components.interfaces.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);

          var bgLoad = true;
          try {
            bgLoad = gBrowser.tabContainer.mPrefs.getBoolPref("browser.tabs.loadInBackground");
          }
          catch (e) { }
          aEvent.stopPropagation();
          aEvent.preventDefault();
          gBrowser.loadOneTab(getShortcutOrURI(url), null, null, null, bgLoad, false);
          return;
        }
      }
    },

    TabMove: function (aEvent){
      var aTab = aEvent.target;
      gBrowser.lockTabIcon(aTab);
    },

    tabContextMenu: function(){
      //tab context menu
      var tabContext = document.getAnonymousElementByAttribute(
                        gBrowser, "anonid", "tabContextMenu") ||
                       gBrowser.tabContainer.contextMenu;
      var menuitem = this.tabLockMenu
                   = tabContext.appendChild(
                          document.createElement("menuitem"));
      menuitem.id = "tabLock";
      menuitem.setAttribute("type", "checkbox");
      menuitem.setAttribute("label", "Lock This Tab");
      menuitem.setAttribute("accesskey", "L");
      menuitem.setAttribute("oncommand","tabLock.toggle(event);");
      tabContext.addEventListener('popupshowing',function(event){tabLock.setCheckbox(event);},false);
    },

    restore: function(event){
      var aTab =  event.target;
      tabLock.restoreForTab(aTab);
    },

    restoreForTab: function(aTab){
      var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].
                             getService(Components.interfaces.nsISessionStore);
      var retrievedData = ss.getTabValue(aTab, "tabLock");
      if(retrievedData)
        aTab.setAttribute('tabLock',true);
      else
        if ( aTab.hasAttribute("tabLock") ) aTab.removeAttribute("tabLock");
      gBrowser.lockTabIcon(aTab);
    },

    checkCachedSessionDataExpiration : function(aTab) {
      var data = aTab.linkedBrowser.__SS_data; // Firefox 3.6-
      if (data &&
         data._tabStillLoading &&
         aTab.getAttribute('busy') != 'true')
        data._tabStillLoading = false;
    },

    toggle: function(event){
      var aTab =  gBrowser.mContextTab || gBrowser.tabContainer._contextTab;
      if (!aTab)
        aTab = event.target;
      while( aTab && aTab instanceof XULElement && aTab.localName !='tab'){
        aTab = aTab.parentNode;
      }
      if( !aTab || aTab.localName !='tab') return;
      gBrowser.lockTab(aTab);
    },

    toggleLockSelectedTabs: function(){
      var tabs = MultipleTabService.getSelectedTabs();
      gBrowser.lockTab(tabs[0]);
      //var isLockFirstTab = gBrowser.isLockTab(tabs[0]);
      for (var i= 1; i < tabs.length; i++){
        //if (isLockFirstTab != gBrowser.isLockTab(tabs[i]))
          gBrowser.lockTab(tabs[i]);
      }
    },

    setCheckbox: function(event){
      var menuitem = this.tabLockMenu;
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
      if(aTab.hasAttribute('tabLock') && aTab.getAttribute('tabLock')){
        menuitem.setAttribute('checked', true);
      }else{
        menuitem.setAttribute('checked', false);
      }
    },

    getIndexForTab: function(aTab){
      var mTabChilds = gBrowser.mTabs;
      for (var i = 0,len = mTabChilds.length; i < len; i++)
        if (mTabChilds[i] == aTab)
           var index = i;
      return index;
    },

    getPref: function(aPrefString, aPrefType, aDefault){
      var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefBranch2);
      try{
        switch (aPrefType){
          case 'complex':
            return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
          case 'str':
            return xpPref.getCharPref(aPrefString).toString(); break;
          case 'int':
            return xpPref.getIntPref(aPrefString); break;
          case 'bool':
          default:
            return xpPref.getBoolPref(aPrefString); break;
        }
      }catch(e){
      }
      return aDefault;
    },

    setPref: function(aPrefString, aPrefType, aValue){
      var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefBranch2);
      try{
        switch (aPrefType){
          case 'complex':
            return xpPref.setComplexValue(aPrefString, Components.interfaces.nsILocalFile, aValue); break;
          case 'str':
            return xpPref.setCharPref(aPrefString, aValue); break;
          case 'int':
            aValue = parseInt(aValue);
            return xpPref.setIntPref(aPrefString, aValue);  break;
          case 'bool':
          default:
            return xpPref.setBoolPref(aPrefString, aValue); break;
        }
      }catch(e){
      }
      return null;
    },

    debug: function(aMsg){
            Cc["@mozilla.org/consoleservice;1"]
              .getService(Ci.nsIConsoleService)
              .logStringMessage(aMsg.toString());
    }
  }


  gBrowser.isLockTab = function (aTab){
    //var x = gBrowser.isLockTab.caller;
     return aTab.hasAttribute("tabLock");
  }

  gBrowser.lockTab = function (aTab){
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].
                               getService(Components.interfaces.nsISessionStore);
    if ( aTab.hasAttribute("tabLock") ){
      aTab.removeAttribute("tabLock");
      tabLock.checkCachedSessionDataExpiration(aTab);
      try {
        ss.deleteTabValue(aTab, "tabLock");
      } catch(e) {}
      var isLocked = false;
    }else{
      aTab.setAttribute("tabLock", "true");
      ss.setTabValue(aTab, "tabLock", true);
      var isLocked = true;
    }
    this.lockTabIcon(aTab);
    return isLocked;
  }

  gBrowser.lockTabIcon = function (aTab){
    const kXULNS =
             "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var image = document.getAnonymousElementByAttribute(
                             aTab, "class", "tab-icon-lock");
    if ( aTab.hasAttribute("tabLock") ){
      if(!image){
        var stack = document.getAnonymousElementByAttribute(
                               aTab, "class", "tab-icon") ||
                    document.getAnonymousElementByAttribute(
                               aTab, "class", "tab-stack");
        var image = document.createElementNS(kXULNS,'image');
        image.setAttribute('class','tab-icon-lock');
        image.setAttribute('left',0);
        image.setAttribute('top',0);
        if(stack) stack.appendChild(image);
      }
      image.removeAttribute('hidden');
      aTab.setAttribute('class',aTab.getAttribute('class')+' tabLock');
    }else{
      if(image){
        image.setAttribute('hidden', true);
      }
      aTab.setAttribute('class',aTab.getAttribute('class').replace(/\stabLock/g,''));
    }
  }

  gBrowser.isNextLink = function (aNode){
    if(!tabLock.getPref('userChrome.tabLock.ignoreNextPrevLink','bool',tabLock.ignoreNextPrevLink) || !aNode) return false;
    var b = gBrowser.getBrowserForDocument(aNode.ownerDocument);
    if (!b || b.docShell.busyFlags || b.docShell.restoringDocument)
      return false;

    const XPATH = 'descendant::text()';
    var result = aNode.ownerDocument.evaluate(XPATH,aNode,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
    for(var j=0,link='';j<result.snapshotLength;j++){
      link = link.concat(result.snapshotItem(j).textContent);
    }
    if (link!=''){

      if (link.match(/^\n?\u6b21(\u306e?(\s?\d+?\s?)?(\u30da\u30fc\u30b8|\u9801|\u8a18\u4e8b|\u4ef6|\u7d50\u679c|\u30b9\u30ec\u30c3\u30c9|\u30c4\u30ea\u30fc)?(\s?\d+?\s?)?\u3078?)?\s?[\u2192\u00bb]?\n?$/)
               || link.match(/\u9032\u3080\s?[\u2192\u00bb]?\n?$/)
              /* || link.match(/\u7d9a\u304f\n?$/)*/
               || link.match(/\u3064\u3065\u304f\n?$/)
               || (link.match(/[\uff1e\u203a>]{1}\n?$/) && !link.match(/[\uff1c\u2039<]{1}/))
               || link.match(/^[>\s\(]?next(\s?\d+?\s?)?(search)?\s?(pages?|results?)?/i) )

      {
        return true;
      }
    }
    var arr = ['\u6B21','\u7D9A\u304D','\u9032\u3080','next','\u3082\u3063\u3068\u8AAD\u3080','>>','\xBB','\uFF1E'];
    var before = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\n\t ';
    var after  = 'abcdefghijklmnopqrstuvwxyz';
    var nextLink = arr.map(function(str){
      if (str.indexOf('"') >= 0) return '';
      return '//text()[starts-with(translate( self::text(), "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a'
      +'|//img[starts-with(translate( @alt, "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a';
    }).join('|');
    var x = aNode.ownerDocument.evaluate(nextLink, aNode.ownerDocument, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (x.snapshotLength){
      next = x.snapshotItem(x.snapshotLength-1);
      //this._openURL(next.href,win,-1);
      if (aNode.href == next.href)
        return true;
    }
    if(aNode.href==gBrowser._numberedPage(gBrowser.currentURI.spec, 1) )
      return true;
    return false;
  }

  gBrowser.isPrevLink = function (aNode){
    if(!tabLock.getPref('userChrome.tabLock.ignoreNextPrevLink','bool',tabLock.ignoreNextPrevLink) || !aNode) return false;
    var b = gBrowser.getBrowserForDocument(aNode.ownerDocument);
    if (!b || b.docShell.busyFlags || b.docShell.restoringDocument)
      return false;

    const XPATH = 'descendant::text()';
    var result = aNode.ownerDocument.evaluate(XPATH,aNode,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
    for(var j=0,link='';j<result.snapshotLength;j++){
      link = link.concat(result.snapshotItem(j).textContent);
    }
    if (link!=''){

      if (link.match(/^\n?[\u2190\u00ab]?\s?\u524d(\u306e?(\s?\d+?\s?)?(\u30da\u30fc\u30b8|\u9801|\u8a18\u4e8b|\u4ef6|\u7d50\u679c|\u30b9\u30ec\u30c3\u30c9|\u30c4\u30ea\u30fc)?(\s?\d+?\s?)?\u3078?)?\n?$/)
       || link.match(/^\n?[\u2190\u00ab]?\s?\u623b\u308b/)
       || (link.match(/^\n?[\uff1c\u2039<]{1}/) && !link.match(/[\uff1e\u203a>]{1}/))
       || link.match(/^[<\s\(]?prev(ious)?(\s|(\s?\d+\s?))(search)?\s?(pages?|results?)?/i) )

      {
        if (/Prevent/i.test(link)) {
          return false;
        }
        return true;
      }
    }
    var arr = ['\u524D','\u623B\u308B','prev','<<','\xAB'];
    var before = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\n\t ';
    var after  = 'abcdefghijklmnopqrstuvwxyz';
    var nextLink = arr.map(function(str){
      if (str.indexOf('"') >= 0) return '';
      return '//text()[starts-with(translate( self::text(), "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a'
      +'|//img[starts-with(translate( @alt, "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a';
    }).join('|');

    var x = aNode.ownerDocument.evaluate(nextLink, aNode.ownerDocument, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (x.snapshotLength){
      next = x.snapshotItem(x.snapshotLength-1);
      //this._openURL(next.href,win,-1);
      if (/prevent/i.test(next.textContent)) {
        return false;
      }
      if (aNode.href == next.href)
        return true;;
    }
    if(aNode.href==gBrowser._numberedPage(gBrowser.currentURI.spec, -1) )
      return true;
    return false;
  }
  gBrowser._numberedPage = function(aURL, direction){
    //dump('Parsing numbered Page of url : ' + aURL);
    var urlParts = aURL.match(/^(.+?:\/\/)([^\/]+@)?([^\/]*)(.*)$/);
    if (!urlParts) return false;
    for(var i=0; i<urlParts.length; i++){
      if(!urlParts[i]) urlParts[i] = '';
    }
    var path= urlParts[4];
    //dump(path);
    var w = path.split(/(%[0-7|a-f]+)|(\d+)/i);
    for(var i = w.length-1; i>=0; i--){
      if (typeof w[i] != 'undefined' && w[i].match(/^\d+/)) break;
    }
    if (i >= 0) {
      var l = w[i].length;
      if(w[i].match(new RegExp('^0')))
        w[i] = ( parseInt(w[i],10)+1000000000 + (direction>0 ? +1 : -1) ).toString().substr(-l);
      else
        w[i] = parseInt(w[i]) + (direction>0 ? +1 : -1);
      return urlParts[1]+urlParts[2]+urlParts[3]+w.join('');
    }
    return false
  }

  gBrowser.isHashLink = function (aNode){
    if(!tabLock.getPref('userChrome.tabLock.ignoreHashLink','bool',tabLock.ignoreHashLink) || !aNode) return false;
    var b = gBrowser.getBrowserForDocument(aNode.ownerDocument);
    if (!b || b.docShell.busyFlags || b.docShell.restoringDocument)
      return false;

    if (aNode.href && aNode.hash && aNode.ownerDocument && aNode.ownerDocument.location){
      var doc = aNode.ownerDocument;
      var docprotocol = doc.location.protocol;
      var dochostname = doc.location.hostname;
      var docport = doc.location.port;
      var docpathname = doc.location.pathname;
      if(docprotocol == aNode.protocol && dochostname == aNode.hostname && docport == aNode.port && docpathname == aNode.pathname)
      {
        return true;
      }
    }
    return false;
  }

  tabLock.init();
}