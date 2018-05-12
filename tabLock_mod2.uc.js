// ==UserScript==
// @name           tabLock_mod2.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    tabLock
// @include        *
// @exclude        chrome://mozapps/content/downloads/unknownContentType.xul
// @compatibility  60
// @version        2018/05/12 15:30 workaround restore session for all window
// @version        2018/05/05 23:00 cleanup (fix ancestor click event)
// @version        2018/05/04 22:00 Make link handling of locked tab more safer
// @version        2018/05/04 21:00 xxxx for <a href = ""> something
// @version        2018/05/04 12:00 cleanup for 60
// @version        2018/05/04 00:00 for 60
// ==/UserScript==
// @Note           about:configの設定
//  userChrome.tabLock.ignoreBrowserBack_Forward タブをロックしている状態で, BrowserBack/Forwardを [0]:通常動作, 1:新規タブに開く, 2:機能しなくする

//  browser.tabs.loadInBackground           リンクを背面で開くかどうか [true]/false
//  browser.tabs.loadBookmarksInBackground  ブックマークを背面で開くかどうか true/[false]
//  browser.tabs.loadUrlInBackground        ロケーションバーを背面で開くかどうか true/[false]

patch: {
  if ("openLinkIn" in window) {
    if (!/isLockTab/.test(window.openLinkIn.toString())) {
      window.openLinkIn_lockorg = window.openLinkIn;
      window.openLinkIn = function(url, where, params) {
        var mainWindow = Services.wm.getMostRecentWindow("navigator:browser");
        if (url && where  == "current" && "isLockTab" in mainWindow.gBrowser &&
            mainWindow.gBrowser.isLockTab(mainWindow.gBrowser.selectedTab) &&
            !/^\s*(javascript:|data:|moz-extension:)/.test(url) &&
            !mainWindow.gBrowser.isHashLink(url, mainWindow.gBrowser.currentURI.spec)) {
          where  = "tab";
        }
        window.openLinkIn_lockorg(url, where, params);
      }
    }
  }

  if (location.href != "chrome://browser/content/browser.xul")
    break patch;

  window.tabLock = {
    ignoreNextPrevLink: true, //タブをロックしている状態で, 次のページ, 前のページ などは ロックを無視するかどうかデフォルト値
    ignoreHashLink: true, //タブをロックしている状態で,  href ="#xxx" などは ロックを無視するかどうかデフォルト値
    ignoreBrowserBackForward: 0, //タブをロックしている状態で, BrowserBack/Forwardを [0]:通常動作, 1:新規タブに開く, 2:機能しなくする
    sessionStore: {
      get ss() {
        try { 
          return Components.classes["@mozilla.org/browser/sessionstore;1"].
                                 getService(Components.interfaces.nsISessionStore)
        } catch(e) {
          return;
        }
      },
      
      getTabValue : function(aTab, aKey) {
        if (typeof SessionStore.getCustomTabValue == "function")
          return SessionStore.getCustomTabValue(aTab, aKey);
        else
          return this.ss.getTabValue(aTab, aKey);
      },

      setTabValue : function(aTab, aKey, aValue) {
        if (typeof SessionStore.setCustomTabValue == "function")
          return SessionStore.setCustomTabValue(aTab, aKey, aValue);
        else
          return this.ss.setTabValue(aTab, aKey, aValue);

      },
      deleteTabValue : function(aTab, aKeye) {
        if (typeof SessionStore.deleteCustomTabValue == "function")
          return SessionStore.deleteCustomTabValue(aTab, aKey);
        else
          return this.ss.deleteTabValue(aTab, aKey);
      }
    },
  
    init: function(){

      //BrowserBack/Forward
      window.BrowserForward_org = BrowserForward;
      BrowserForward = function(aEvent, aIgnoreAlt){
        try{
          var ignoreBrowserBackForward = Services.prefs.getIntPref("userChrome.tabLock.ignoreBrowserBack_Forward");
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
            var loadInBackground = Services.prefs.getBoolPref("browser.tabs.loadUrlInBackground");
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
          var ignoreBrowserBackForward = Services.prefs.getIntPref("userChrome.tabLock.ignoreBrowserBack_Forward");
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
            var loadInBackground = Services.prefs.getBoolPref("browser.tabs.loadUrlInBackground");
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
          var ignoreBrowserBackForward = Services.prefs.getIntPref("userChrome.tabLock.ignoreBrowserBack_Forward");
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
            var loadInBackground = Services.prefs.getBoolPref("browser.tabs.loadUrlInBackground");
          }catch(ex){
            var loadInBackground = false;
          }
          if (ignoreBrowserBackForward == 1)
            gBrowser.loadOneTab(url, null, null, null, loadInBackground, true);
          return true;
        }
        return gotoHistoryIndex_org(aEvent);
      }

      //D&D on TAB
      gBrowser.tabContainer.addEventListener('drop', this.onDrop, true);


      this.tabContextMenu();

      // CSSを適用
      var stack = document.getAnonymousElementByAttribute(
                            gBrowser.tabContainer.firstChild, "class", "tab-stack");

        var style = " \
        .tab-icon-lock{ \
          margin-top: 6px; /*要調整*/  \
          margin-left: 6px; /*要調整*/ \
          list-style-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAjElEQVQ4je3RsQ7CMAyE4S9pURl5/6csGxKJw1AKFBARK+IkD3Fyv86OQouHOhNBqzQcdJSPzCKIEMgkKFTMXcDmMI6LGzuGnvkFoBRQiWtn/x1g5dwBpx4gnalDxAZUcm4jad3HxwTpzaNxmtZef4RMkrNbDQPTtN53AanSniM0S6y8/ES82v76MV0AlREpDobXTpUAAAAASUVORK5CYII='); \
        } \
        .tab-icon-lock[hidden='true'] { \
          display: none !important; \
        }".replace(/\s+/g, " ");

      var sspi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
      );
      document.insertBefore(sspi, document.documentElement);
      sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
      };

      //起動時のタブ状態復元
      this.restoreAll();
      gBrowser.tabContainer.addEventListener('TabMove', tabLock.TabMove, false);
      gBrowser.tabContainer.addEventListener('SSTabRestoring', tabLock.restore,false);
      window.addEventListener('unload',function(){ tabLock.uninit();},false)
    },

    restoreAll: function() {
      var that = this;
      setTimeout(init, 2000, 0);
      function init(i){
        if(i < gBrowser.tabs.length){
          var aTab = gBrowser.tabs[i];
          that.restoreForTab(aTab);
          i++;
          arguments.callee(i);
        }else{
        }
      }
    },

    uninit: function(){
      window.removeEventListener('unload',function(){ tabLock.uninit();},false)
      gBrowser.tabContainer.removeEventListener('drop', this.onDrop, true);
      gBrowser.tabContainer.removeEventListener('TabMove', tabLock.TabMove, false);
      gBrowser.tabContainer.removeEventListener('SSTabRestoring', tabLock.restore,false);
    },
/*
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
*/
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
              /^\s*(javascript:|data:|moz-extension:)/.test(url))
            return;

          // urlSecurityCheck
          urlSecurityCheck(url, gBrowser.tabContainer.childNodes[0].linkedBrowser.contentPrincipal,
                           Components.interfaces.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);

          var bgLoad = true;
          try {
            bgLoad = Services.prefs.getBoolPref("browser.tabs.loadInBackground");
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
      var tabContext = gBrowser.tabContainer.contextMenu;;
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
      var retrievedData = this.sessionStore.getTabValue(aTab, "tabLock") == "true";
      if(retrievedData)
        aTab.setAttribute('tabLock',true);
      else
        if ( aTab.hasAttribute("tabLock") ) aTab.removeAttribute("tabLock");
      gBrowser.lockTabIcon(aTab);
    },

    toggle: function(event){
      var aTab =  TabContextMenu.contextTab;
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
      var aTab =  TabContextMenu.contextTab;
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
      var mTabChilds = gBrowser.tabs;
      for (var i = 0,len = mTabChilds.length; i < len; i++)
        if (mTabChilds[i] == aTab)
           var index = i;
      return index;
    },

    getPref: function(aPrefString, aPrefType, aDefault){
      var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefBranch);
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
                    .getService(Components.interfaces.nsIPrefBranch);
      try{
        switch (aPrefType){
          case 'complex':
            return xpPref.setComplexValue(aPrefString, Components.interfaces.nsIFile, aValue); break;
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
    if ( aTab.hasAttribute("tabLock") ){
      aTab.removeAttribute("tabLock");
      try {
        tabLock.sessionStore.deleteTabValue(aTab, "tabLock");
      } catch(e) {}
      var isLocked = false;
    }else{
      aTab.setAttribute("tabLock", "true");
      tabLock.sessionStore.setTabValue(aTab, "tabLock", "true");
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


  gBrowser.isHashLink = function (aUrl, aDocumentUrl){
    if(!tabLock.getPref('userChrome.tabLock.ignoreHashLink','bool', tabLock.ignoreHashLink))
      return false;
    let aURI = new URL(aUrl);
    let aDocumentURI = new URL(aDocumentUrl);
    if (aURI.hash || aDocumentURI.hash) {
      if(aURI.href.replace(aURI.hash, "") == aDocumentURI.href.replace(aDocumentURI.hash, "")) {
        return true;
      }
    }
    return false;
  }

  tabLock.init();



(function() {
  'use strict';

  let frameScript = function() {
    addEventListener("click", onClick, false);  /*先祖要素のclick eventListener 優先, trueの場合 無視されるので*/

    function onClick(event) {
      if (event.button !== 0) return;
      if (event.altKey || event.ctrlKey || event.shiftKey) return;

      if (!sendSyncMessage("linkclick_isLockedTab", {  })[0].isLockedTab)
        return;
      /*先祖要素のclick eventListener 優先*/
      if (event.defaultPrevented)
        return;

      let [url, node, principal] = _hrefAndLinkNodeForClickEvent(event);
      let ownerDoc = event.originalTarget.ownerDocument;

      if (!url || !node || node.getAttribute("href") == "" ||    /*xxxx fix ""*/
           /^\s*(javascript:|data:|moz-extension:)/.test(url))
        return;

     if (sendSyncMessage("linkclickByLockTab_isHash", {url: url, documentURI: ownerDoc.documentURI})[0].isHash)
        return;

      if (node.hasAttribute("onclick"))
        return;

      if (node.getAttribute("rel") == "sidebar")
        return;

      let target = node.target;
      if (target)
        return;
  
      event.preventDefault();
      event.stopPropagation();

      let referrerPolicy = ownerDoc.referrerPolicy;
      if (node) {
        let referrerAttrValue = Services.netUtils.parseAttributePolicyString(node.
                                getAttribute("referrerpolicy"));
        if (referrerAttrValue !== Components.interfaces.nsIHttpChannel.REFERRER_POLICY_UNSET) {
          referrerPolicy = referrerAttrValue;
        }
      }

      let referrerURI = node.referrer || ownerDoc.documentURI;
      let noreferrer = BrowserUtils.linkHasNoReferrer(node);
      if (noreferrer)
         referrerURI = null;

      let userContextId = null;
      if (ownerDoc.nodePrincipal.originAttributes.userContextId) {
        userContextId = ownerDoc.nodePrincipal.originAttributes.userContextId;
      }

      sendAsyncMessage('openLinkByLockTab', 
        {url: url, 
         target: target,
         documentURI: ownerDoc.documentURI,
         referrerURI: referrerURI,
         noReferrer: noreferrer,
         referrerPolicy: referrerPolicy,
         userContextId: userContextId,
         originPrincipal: ownerDoc.nodePrincipal,
         triggeringPrincipal: ownerDoc.nodePrincipal,
        });
    }

    function _hrefAndLinkNodeForClickEvent(event) {
      function isHTMLLink(aNode) {
        return ((aNode instanceof content.HTMLAnchorElement && aNode.href) ||
                (aNode instanceof content.HTMLAreaElement && aNode.href) ||
                aNode instanceof content.HTMLLinkElement);
      }

      let node = event.originalTarget;
      while (node && !isHTMLLink(node)) {
        node = node.parentNode;
      }

      if (node)
        return [node.href, node, node.ownerDocument.nodePrincipal];

      let href, baseURI;
      node = event.target;
      while (node && !href) {
        if (node.nodeType == content.Node.ELEMENT_NODE &&
            (node.localName == "a" ||
             node.namespaceURI == "http://www.w3.org/1998/Math/MathML")) {
          href = node.getAttribute("href") ||
                 node.getAttributeNS("http://www.w3.org/1999/xlink", "href");
          if (href) {
            baseURI = node.ownerDocument.baseURIObject;
            break;
          }
        }
        node = node.parentNode;
      }

      return [href ? Services.io.newURI(href, null, baseURI).spec : null, null,
              node && node.ownerDocument.nodePrincipal];
    }
  };

  let frameScriptURI = 'data:,(' + frameScript.toString() + ')()';
  window.messageManager.loadFrameScript(frameScriptURI, true);
  window.messageManager.addMessageListener("linkclick_isLockedTab",
    function(message) {
        return { isLockedTab: gBrowser.selectedTab.hasAttribute('tabLock') };
    }
  );
  window.messageManager.addMessageListener("linkclickByLockTab_isHash",
    function(message) {
      return { isHash: gBrowser.isHashLink(message.data.url, message.data.documentURI) };
    }
  );
  window.messageManager.addMessageListener('openLinkByLockTab',
    function(message) {
      let referrerURI = message.data.referrerURI;
      try {
        referrerURI = Services.io.newURI(message.data.referrerURI)
      } catch(e) {
        referrerURI = null;
      }
      let params = {
          relatedToCurrent: Services.prefs.getBoolPref("browser.tabs.insertRelatedAfterCurrent"),
          inBackground: Services.prefs.getBoolPref("browser.tabs.loadInBackground"),
          referrerURI: referrerURI,
          noReferrer: message.data.noReferrer,
          referrerPolicy: message.data.referrerPolicy,
          userContextId: message.data.userContextId,
          originPrincipal: message.data.originPrincipal,
          triggeringPrincipal: message.data.triggeringPrincipal
      };
      window.openLinkIn(message.data.url, "tab", params);
    }
  );

}());

}
