// ==UserScript==
// @name           unreadTabs.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    未読のタブの色を変えるだけ
// @author         Alice0775
// @include        main
// @modified by    Alice0775
// @compatibility  135
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2023/10/10 00:00 Stop using xml-stylesheet processing instructions
// @version        2022/04/14 00:00 Fix gCryptoHash is not defined
// @version        2022/03/25 08:30 remove ns IScriptableUnicodeConverter
// @version        2021/06/14 20:00 remove pending and loading tab styles
// @version        2020/11/29 20:00 add try catch
// @version        2019/11/14 00:00 Fix 72+ Bug 1591145 Remove Document.GetAnonymousElementByAttribute
// @version        2019/06/24 23:00 wait for gBrowser initialized
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/09/24 23:00 remove logging
// @version        2018/09/23 09:00 add style pending and unread, reduce text color flickering
// @version        2018/09/22 23:00 fix bug
// @version        2018/09/22 22:00 fix bug
// @version        2018/09/17 16:00 remove logging, change pending color/style
// @version        2018/09/17 06:00 add twitter, treeherder, remove ldr
// @version        2018/09/17 06:00 some fix
// @version        2018/09/16 22:00 e10s
// @version        2018/05/06 12:00 treat pending tab
// @version        2016/01/30 18:00 fix Bug 1220564
// @version        2015/03/30 11:00 Force unread whwn tab title changed
// @version        2014/06/21 07:00 Fixed due to Bug 996053 
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2011/10/16 12:00 エラー
// @version        2011/09/16 01:00 Bug 487242 - Implement 'unread' attribute for tabbrowser tabs
// @version        2011/07/23 01:00 16桁の日付
// @version        2010/12/22 11:00 最近のTree Style Tabは変更多すぎるからもう知らん
// @version        2010/10/12 11:00 by Alice0775  4.0b8pre
// @version        2010/03/26 13:00 Minefield/3.7a4pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/15 00:00 Minefield/3.7a4pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2010/01/29 16:00 http://piro.sakura.ne.jp/latest/blosxom/mozilla/extension/treestyletab/2009-09-29_debug.htm
// @version        2010/01/12 13:00 deleteTabValue例外処理
// @version        2009/09/02 13:00 xulドキュメント等読み込んだ場合の例外処理
// @version        2009/09/01 19:00 コード整理, typo
// @version        2009/08/22 14:00 タブのコンテキスト"Remove UnRead For All Tabs"を表示
// @version        2009/08/21 08:00 CHECK_MD5 falseを既定値にした
// @version        2009/08/06 12:10 type修正, CHECK_MD5=falseが効かなくなっていたので修正, tabがbusyの時DOMContentLoadedの評価をちょっと遅延させてみた
// @version        2009/08/06 restoreUnreadForTab
// @version        2009/08/06 typo this.setUnreadTa b (event.target);
// @version        2009/08/05 CSSは最後に実行するようにした userChrome.css二記述しておくのがいいかも
// @version        2009/07/19 コンテンツの未読判定に文書のmd5を見るかどうか追加
// @version        2009/07/19
const unreadTabs = {
  // -- config --
  CONTENT_LOAD: true,     // [true]:コンテントの読み込み, false:新規タブの時のみ, を未読とする
  CHECK_MD5:    true,     // CONTENT_LOAD=trueの時,
                          // true:未読かどうか文書のMD5もチェックする, [false]:チェックしない
                          // (frameドキュメントはfalseと同じ扱い)
                          // (ダイナミックドキュメントの場合はfalseとした方が無駄がない)

  READ_SCROLLCLICK: false,// true:コンテントのスクロールまたはクリック, [false]:タブセレクト, で既読とする
  TABCONTEXTMENU: true,   // タブのコンテキスト"Remove UnRead For All Tabs"を表示 [ture]:する, false:しない
  READ_TIMER: 600,        // タブが選択されてから READ_TIMER(msec)後には強制既読とする

  /*
  PENDING_COLOR: 'gray',   // unloadedタブの文字色
  PENDING_STYLE: 'normal', // unloadedのタブの文スタイル
  */
  PENDING_UNREAD_COLOR: 'rgba(255, 0, 0, 0.6)',    // unloaded&未読のタブの文字色
  PENDING_UNREAD_STYLE: 'italic', // unloaded&未読のタブの文スタイル
  UNREAD_COLOR: 'red',    // 未読のタブの文字色
  UNREAD_STYLE: 'italic', // 未読のタブの文スタイル
  /*
  LOADING_COLOR:'blue',   // 読み込み中のタブの文字色
  LOADING_STYLE:'normal', // 読み込み中のタブの文スタイル
  */
  WATCHURLS: /mail\.yahoo\.co\.jp|twitter.\com/  , // タブのラベル変更のチェックするURL正規表現
  // -- config --

  ss: {
    get ss_old() {
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
        return this.ss_old.getTabValue(aTab, aKey);
    },
    setTabValue : function(aTab, aKey, aValue) {
      if (typeof SessionStore.setCustomTabValue == "function")
        return SessionStore.setCustomTabValue(aTab, aKey, aValue);
      else
        return this.ss_old.setTabValue(aTab, aKey, aValue);

    },
    deleteTabValue : function(aTab, aKey) {
      if (typeof SessionStore.deleteCustomTabValue == "function")
        return SessionStore.deleteCustomTabValue(aTab, aKey);
      else
        return this.ss_old.deleteTabValue(aTab, aKey);
    }
  },

  get tabContext() {
    return document.getElementById("tabContextMenu");
  },

  init: function() {
    this.CHECK_MD5 = this.CHECK_MD5 && this.CONTENT_LOAD;

    var style = `
    @namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
      /*未読のタブの文字色*/
      .tabbrowser-tab[unreadTab]:not([pending]):not([busy]) .tab-text,
      .alltabs-item[unreadTab]
      {
        color: ${this.UNREAD_COLOR};
        font-style: ${this.UNREAD_STYLE};
      }
      .tabbrowser-tab[unreadTab][pending]:not([busy]) .tab-text,
      .alltabs-item[unreadTab][pending]:not([busy])
      {
        color: ${this.PENDING_UNREAD_COLOR};
        font-style: ${this.PENDING_UNREAD_STYLE};
      }
      /*Pendingのタブの文字色
      .tabbrowser-tab[pending]:not([unreadTab]) .tab-text,
      .alltabs-item[pending]:not([unreadTab])
      {
        color: ${this.PENDING_COLOR};
        font-style: ${this.PENDING_STYLE};
      }
      */
      /*読み込み中のタブの文字色
      .tabbrowser-tab[busy] .tab-text,
      .alltabs-item[busy]
      {
        color: ${this.LOADING_COLOR};
        font-style: ${this.LOADING_STYLE};
      }
      */
       `
      .replace(/\s+/g, " ");

    var sss = Cc['@mozilla.org/content/style-sheet-service;1']
              .getService(Ci.nsIStyleSheetService);
    var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style));
    if(!sss.sheetRegistered(uri, sss.USER_SHEET))
      sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
/*
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };
*/

    if (this.TABCONTEXTMENU)
      this.tabContextMenu();

    var func;
    if ("_onDrop" in gBrowser) {
      func = gBrowser._onDrop.toString();
        func = func.replace(
        'this.swapBrowsersAndCloseOther(newTab, draggedTab);',
        `
        if (draggedTab.hasAttribute('unreadTab')) {
          newTab.setAttribute('unreadTab', true);
        } else {
          newTab.removeAttribute('unreadTab');
        }
        $& `
        );
      eval("gBrowser._onDrop = "+ func);
    }

    window.addEventListener('unload', this, false);
    gBrowser.tabContainer.addEventListener('TabOpen', this, false);
    gBrowser.tabContainer.addEventListener('TabClose', this, false);
    gBrowser.tabContainer.addEventListener('TabSelect', this, false);
    gBrowser.tabContainer.addEventListener('SSTabRestoring', this, false);
    gBrowser.tabContainer.addEventListener('SSTabRestored', this, false);


    // 既にあるタブに対して
    var that = this;
    setTimeout( () => { init(0); }, 2000); /// xxx
    function init(i) {
      if(i < gBrowser.tabs.length) {
        var aTab = gBrowser.tabs[i];
        that.initTab(aTab);
        //if (!aTab.hasAttribute('pending')) {
          if (!(aTab.hasAttribute('unreadTabs-restoring') ||
                aTab.hasAttribute('unreadTab')) ) {
            that.restoreUnreadForTab(aTab);
            that.restoreMD5ForTab(aTab);
          }
          if (aTab.selected) {
              aTab.removeAttribute('unreadTabs-restoring')
            if (aTab.hasAttribute('unreadTab'))
              that.setReadForTab(aTab);
          }
        //}
        i++;
        arguments.callee(i);
      }
    }
  },

  uninit: function(){
    // タイマークリア
    if (this._timer)
      clearTimeout(this._timer);

    // イベントリスナを削除
    window.removeEventListener('unload', this, false);
    gBrowser.tabContainer.removeEventListener('TabOpen', this, false);
    gBrowser.tabContainer.removeEventListener('TabClose', this, false);
    gBrowser.tabContainer.removeEventListener('TabSelect', this, false);
    gBrowser.tabContainer.removeEventListener('SSTabRestoring', this, false);
    gBrowser.tabContainer.removeEventListener('SSTabRestored', this, false);

    // タブのイベントリスナを削除
    for (var i = 0; i < gBrowser.tabs.length; i++) {
      try {
        gBrowser.tabs[i].unreadTabsEventListener.destroy();
      } catch(e) {}
    }
  },

  tabContextMenu: function(){
    //tab context menu
    var tabContext = this.tabContext;
    var menuitem = tabContext.appendChild(
                        document.createXULElement("menuitem"));
    menuitem.id = "removeunreadalltabs";
    menuitem.setAttribute("label", "Remove UnRead For All Tabs");
    menuitem.setAttribute("accesskey", "z");
    menuitem.addEventListener("command", () => unreadTabs.removeUnreadForAllTabs());
    //menuitem.setAttribute("oncommand","unreadTabs.removeUnreadForAllTabs();");
  },


  // タブのイベントリスナを登録
  initTab: function(aTab){
    if (typeof aTab.unreadTabsEventListener == 'undefined')
      aTab.unreadTabsEventListener = new unreadTabsEventListener(aTab);
  },

  // タブのイベントリスナを削除
  uninitTab: function(aTab){
    if (aTab.unreadtimer)
      clearTimeout(aTab.unreadtimer);
    try {
      aTab.unreadTabsEventListener.destroy();
      delete aTab.unreadTabsEventListener;
    } catch(e) {}
  },

  // タブの状態をセッションデータに保存
  saveUnreadForTab: function (aTab) {
    if (aTab.hasAttribute("unreadTab"))
      this.ss.setTabValue(aTab, "unreadTab", "true");
    else {
      //try {
        this.ss.deleteTabValue(aTab, "unreadTab");
      //} catch(e) {}
    }
  },

  // タブの状態をセッションデータから復元
  restoreUnreadForTab: function(aTab){
    var retrievedData = this.ss.getTabValue(aTab, "unreadTab") == "true";
//window.userChrome_js.debug( "restoreUnreadForTab " + !!retrievedData)
    if (typeof retrievedData == 'undefined' || !retrievedData)
      aTab.removeAttribute('unreadTab');
    else
      aTab.setAttribute('unreadTab', true);
    return retrievedData;
  },

  // タブのMD5をセッションデータに保存
  saveMD5ForTab: function (aTab){
    if (!this.CHECK_MD5)
      return;
    if (aTab.hasAttribute('md5'))
      this.ss.setTabValue(aTab, "md5", aTab.getAttribute('md5'));
    else {
      this.ss.deleteTabValue(aTab, "md5");
    }
  },

  // タブのMD5をセッションデータから復元
  restoreMD5ForTab: function(aTab){
    if (!this.CHECK_MD5)
      return;
    var retrievedData = this.ss.getTabValue(aTab, "md5");
    if(typeof retrievedData == 'undefined')
      aTab.removeAttribute('md5');
    else
      aTab.setAttribute('md5', retrievedData);
    return retrievedData;
  },

  setUnreadForTab: function(aTab){
//window.userChrome_js.debug("setUnreadForTab");
    aTab.setAttribute('unreadTab', true);
    this.saveUnreadForTab(aTab);
  },

  setReadForTab: function(aTab){
//window.userChrome_js.debug("setReadForTab");
    aTab.removeAttribute('unreadTab');
    this.saveUnreadForTab(aTab);
  },

  toggleUnreadSelectedTabs: function(){
    var tabs = MultipleTabService.getSelectedTabs();
    for (var i= 0; i < tabs.length; i++) {
      if (tabs[i].selected)
        continue;
      if (tabs[i].hasAttribute('unreadTab'))
        this.setReadForTab(tabs[i]);
      else
        this.setUnreadForTab(tabs[i]);
    }
  },

  removeUnreadForAllTabs: function(){
    for (var i= 0; i < gBrowser.tabs.length; i++) {
      var aTab = gBrowser.tabs[i];
      if (!aTab.hasAttribute('busy') &&
          aTab.hasAttribute('unreadTab'))
        this.setReadForTab(aTab);
    }
  },

  tabSelected: function(aTab){
    var Start = new Date().getTime();

    if (this._timer)
      clearTimeout(this._timer);

    if (!aTab.hasAttribute('unreadTab'))
      return;

    this._timer = setTimeout(function(self, aTab){
      //try {
        if (aTab.selected)
          self.setReadForTab(aTab);
      //} catch(e) {}
    }, Math.max(this.READ_TIMER - ((new Date()).getTime()-Start), 0), this, aTab);
  },

  _timer: null,

  handleEvent: function(event){
    var aTab;
//window.userChrome_js.debug(event.type);
    if (event.type != "unload")
      /*Services.console.logStringMessage(event.type + " "+ event.target._tPos);*/
    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
      case 'TabSelect':
        this.tabSelected(event.target);
        break;
      case 'TabOpen':
        this.initTab(event.target);
        //this.setUnreadForTab(event.target);
        break;
      case 'TabClose':
        this.uninitTab(event.target);
        this.saveUnreadForTab(event.target);
        break;
      case 'SSTabRestoring':
        event.target.setAttribute('unreadTabs-restoring', true)
        this.restoreUnreadForTab(event.target);
        this.restoreMD5ForTab(event.target);
        break;
      case 'SSTabRestored':
        this.initTab(event.target);
        event.target.removeAttribute('unreadTabs-restoring')
        //this.restoreUnreadForTab(event.target);
        //this.restoreMD5ForTab(event.target);
        break;
    }
  }
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  unreadTabs.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      unreadTabs.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}





function unreadTabsEventListener(aTab) {
  this.mTab = aTab;
  this.init();
}

unreadTabsEventListener.prototype = {
  mTab : null,
  observer: null,
  init : function() {
    //window.userChrome_js.debug('init');
    //this.mTab = aTab;
    if (unreadTabs.READ_SCROLLCLICK) {
      this.mTab.linkedBrowser.addEventListener('scroll', this, false);
      this.mTab.linkedBrowser.addEventListener('mousedown', this, false);
    }

		// select the target node
		var target = this.mTab;
		// create an observer instance
		this.observer = new MutationObserver(function(mutations) {
		  mutations.forEach(function(mutation) {
        var tab = mutation.target;
        if (mutation.attributeName != "label")
          return;
        if (tab.hasAttribute('busy') ||
            tab.hasAttribute('unreadTabs-restoring') ||
            tab.hasAttribute('unreadTab'))
          return;
        if (tab.selected)
          return
        if(unreadTabs.WATCHURLS.test(tab.linkedBrowser.currentURI.spec)) {
          unreadTabs.setUnreadForTab(tab);
        }
		  });    
		});
		// configuration of the observer:
		var config = { attributes: true, attributeFilter: ["label"] };
		// pass in the target node, as well as the observer options
		this.observer.observe(target, config);
  },

  destroy : function() {
    if (unreadTabs.READ_SCROLLCLICK) {
      this.mTab.linkedBrowser.removeEventListener('scroll', this, false);
      this.mTab.linkedBrowser.removeEventListener('mousedown', this, false);
    }
		// later, you can stop observing
		this.observer.disconnect();

    delete this.mTab;
  },
  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case 'scroll':
      case 'mousedown':
        aTab = this.mTab;
        if (!aTab.hasAttribute('unreadTab'))
          return;

        unreadTabs.setReadForTab(aTab);
        break;

    }
  },
};

// 新たなコンテントの読み込みを未読と見なす
const unreadTabs_getContentMD5 = {
  init: function() {
    
    function frameScript(CHECK_MD5) {
      function load(event) {

        let doc = event.originalTarget;
        let win = doc.defaultView;
        if (!(doc instanceof win.HTMLDocument))
          return;
        if (doc.location.href == "about:blank")
          return;
        
        if (win.frameElement)
          return;

        sendAsyncMessage("unreadTabs_ContentMD5",
        {
          details : "MD5",
          MD5: CHECK_MD5 ? calMD5(doc) : ""
        });
      }


      function calMD5(aDocument) {
        return calculateHashFromStr(getTextContentForDoc(aDocument)).toString();
      }
      function getTextContentForDoc(aDocument) {
        try {
          if (aDocument.body) {
            var str = aDocument.body.textContent.replace(/\n/g,' ');
            return str.replace(/\b\d{1,2}\b/g,'').replace(/\b\d{1,16}\b/g,'');
          }
        } catch(e) {
        }
        return "";
      }

      function calculateHashFromStr(data) {
        // Lazily create a reusable hasher
        if (gCryptoHash === null) {
          gCryptoHash = Cc["@mozilla.org/security/hash;1"].createInstance(
            Ci.nsICryptoHash
          );
        }

        gCryptoHash.init(gCryptoHash.MD5);

        // Convert the data to a byte array for hashing
        gCryptoHash.update(
          data.split("").map(c => c.charCodeAt(0)),
          data.length
        );
        // Request the has result as ASCII base64
        return gCryptoHash.finish(true);
      }

      let gCryptoHash = null;
      addEventListener('load', load, true);

    } /* /frameScript */ 

    let frameScriptURI = 'data:application/javascript,'
      + encodeURIComponent('(' + frameScript.toString() + ')(' + unreadTabs.CHECK_MD5 + ')');
    window.messageManager.loadFrameScript(frameScriptURI, true);

    window.messageManager.addMessageListener("unreadTabs_ContentMD5", this);
    window.addEventListener('unload', this, false);
  },

  uninit: function() {
    window.messageManager.removeMessageListener("unreadTabs_ContentMD5", this);
    window.removeEventListener('unload', this, false);
  },

  handleEvent: function(event) {
    switch (event.type) {
      case 'uninit':
        this.uninit();
        break;
    }
  },

  receiveMessage: function(message) {
    switch (message.name) {
      case 'unreadTabs_ContentMD5':
        this.contentLoaded(message);
        return {};
    }
    return {};
  },

  contentLoaded: function(message) {
    let browser = message.target;
    if (!browser)
      return;

    let aTab = gBrowser.getTabForBrowser(browser);
    if (!aTab)
      return;
      
    let md5 = null;
    let prevmd5 = null;
    if (unreadTabs.CHECK_MD5) {
      md5 = message.data.MD5;
      prevmd5 = unreadTabs.ss.getTabValue(aTab, "md5");
      aTab.setAttribute('md5', md5);
      unreadTabs.saveMD5ForTab(aTab);
    }

    // コンテントを読み込んだのが前面のタブなら既読にセット
    if (aTab.selected) {
        aTab.removeAttribute('unreadTabs-restoring')
       unreadTabs.setReadForTab(aTab);
     return;
    }

    // コンテントを読み込んだのが背面のタブなら未読にセット
    if (!unreadTabs.CHECK_MD5 || md5 != prevmd5) {
      unreadTabs.setUnreadForTab(aTab);
    }
  }
}


unreadTabs_getContentMD5.init();