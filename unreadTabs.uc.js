// ==UserScript==
// @name           unreadTabs.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    未読のタブの色を変えるだけ
// @author         Alice0775
// @include        main
// @modified by    Alice0775
// @compatibility  56+
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

  PENDING_COLOR: 'gray',   // unloadedタブの文字色
  PENDING_STYLE: 'italic', // unloadedのタブの文スタイル
  UNREAD_COLOR: 'red',    // 未読のタブの文字色
  UNREAD_STYLE: 'italic', // 未読のタブの文スタイル
  LOADING_COLOR:'blue',   // 読み込み中のタブの文字色
  LOADING_STYLE:'normal', // 読み込み中のタブの文スタイル
  WATCHURLS: /mail\.yahoo\.co\.jp|reader\.livedoor\.com\/reader/  , // タブのラベル変更のチェックするURL正規表現
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

  init: function() {
    this.CHECK_MD5 = this.CHECK_MD5 && this.CONTENT_LOAD;

    var style = `
    @namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
      /*未読のタブの文字色*/
      .tabbrowser-tab[unreadTab] .tab-text,
      .alltabs-item[unreadTab]
      {
        color: %UNREAD_COLOR%;
        font-style: %UNREAD_STYLE%;
      }
      /*Pendingのタブの文字色*/
      .tabbrowser-tab[pending] .tab-text,
      .alltabs-item[pending]
      {
        color: %PENDING_COLOR%;
        font-style: %PENDING_STYLE%;
      }
      /*読み込み中のタブの文字色*/
      .tabbrowser-tab[busy] .tab-text,
      .alltabs-item[busy]
      {
        color: %LOADING_COLOR%;
        font-style: %LOADING_STYLE%;
      } `.
                  replace(/%PENDING_STYLE%/g, this.PENDING_STYLE).
                  replace(/%PENDING_COLOR%/g, this.PENDING_COLOR).
                  replace(/%UNREAD_STYLE%/g, this.UNREAD_STYLE).
                  replace(/%UNREAD_COLOR%/g, this.UNREAD_COLOR).
                  replace(/%LOADING_STYLE%/g, this.LOADING_STYLE).
                  replace(/%LOADING_COLOR%/g, this.LOADING_COLOR).replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

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
    for (var i = 0; i < gBrowser.mTabs.length; i++) {
      try {
        gBrowser.mTabs[i].unreadTabsEventListener.destroy();
      } catch(e) {}
    }
  },

  tabContextMenu: function(){
    //tab context menu
    var tabContext = gBrowser.tabContainer.contextMenu ||
                     document.getAnonymousElementByAttribute(gBrowser, "anonid", "tabContextMenu");
    var menuitem = tabContext.appendChild(
                        document.createElement("menuitem"));
    menuitem.id = "removeunreadalltabs";
    menuitem.setAttribute("label", "Remove UnRead For All Tabs");
    menuitem.setAttribute("accesskey", "z");
    menuitem.setAttribute("oncommand","unreadTabs.removeUnreadForAllTabs();");
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
    //try {
      aTab.unreadTabsEventListener.destroy();
      delete aTab.unreadTabsEventListener;
    //} catch(e) {}
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
    for (var i= 0; i < gBrowser.mTabs.length; i++) {
      var aTab = gBrowser.mTabs[i];
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
        self.setReadForTab(aTab);
      //} catch(e) {}
    }, Math.max(this.READ_TIMER - ((new Date()).getTime()-Start), 0), this, aTab);
  },

  _timer: null,

  handleEvent: function(event){
    var aTab;
//window.userChrome_js.debug(event.type);
    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
      case 'TabSelect':
        this.tabSelected(event.target);
        break;
      case 'TabOpen':
        this.initTab(event.target);
        this.setUnreadForTab(event.target);
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
        this.restoreUnreadForTab(event.target);
        this.restoreMD5ForTab(event.target);
        break;
    }
  }
}
unreadTabs.init();



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
    
    function frameScript() {
      function load(event) {
        /*Services.console.logStringMessage("Send to chrome: unreadTabs_ContentMD5\n" + content.document.location.href);*/

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
          MD5: calMD5(doc)
        },
        {
           target : event.target
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

      function calculateHashFromStr(str) {
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                                  .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        /* ここでは UTF-8 を使います。他のエンコーディングも選ぶこともできます。*/
        converter.charset = "UTF-8";
        /* result は出力用パラメータです。*/
        /* result.value は配列の長さを保持します。*/
        var result = {};
        /* data はバイトの配列です。*/
        var data = converter.convertToByteArray(str, result);
        var ch = Components.classes["@mozilla.org/security/hash;1"]
                           .createInstance(Components.interfaces.nsICryptoHash);
        str = null;
        ch.init(ch.MD5);
        ch.update(data, data.length);
        var hash = ch.finish(false);
        str = data = ch = null;
        /* 1 バイトに対して 2 つの 16 進数コードを返す。*/
        function toHexString(charCode)
        {
          return ("0" + charCode.toString(16)).slice(-2);
        }

        /* バイナリのハッシュデータを 16 進数文字列に変換する。*/
        /* return [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");*/
        return Array.from(hash, (c, i) => toHexString(hash.charCodeAt(i))).join(""); /* due to Bug 1220564*/
      }

      addEventListener('load', load, true);

    } /* /frameScript */ 

    let frameScriptURI = 'data:application/javascript,'
      + encodeURIComponent('(' + frameScript.toString() + ')()');
    window.messageManager.loadFrameScript(frameScriptURI, true);

    window.messageManager.addMessageListener("unreadTabs_ContentMD5", this);
    window.addEventListener('unload', unreadTabs_getContentMD5.uninit, false);
  },

  uninit: function() {
    window.messageManager.removeMessageListener("unreadTabs_ContentMD5", this);
    window.removeEventListener('unload', unreadTabs_getContentMD5.uninit, false);
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


    for (let i = 0; i < gBrowser.tabs.length; i++) {
      if (gBrowser.getBrowserAtIndex(i) == browser) {
        Services.console.logStringMessage("tab:"+ i + " md5:"+ message.data.MD5);
        break;
      }
    }

      
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