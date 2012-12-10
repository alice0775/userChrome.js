// ==UserScript==
// @name           stopResendWarning.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    postのリロードでワーニングが出るのを阻止
// @include        main
// @compatibility  Firefox 3.0 3.5 3.6a1pre
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2009/02/09 01:00 hashがあるとlocation.replaceが動かない
// @version        2009/02/09 00:40 restoreScrollPosition
// @version        2009/05/13 00:40
// @Note          以下の警告を出なくする
// @Note          このページを表示するにはフォームデータを再度送信する必要があります。フォームデータを再送信すると以前実行した検索、投稿や注文などの処理が繰り返されます。
// @Note          To display this page, Shiretoko must send information that will repeat any action (such as a search or order confirmation) that was performed earlier.
//
var stopResendWarning = {
  // -- config --
  // ワーニングを出さないようにするurlの正規表現の文字列を""で括りカンマ区切りで記述する。
  // ただし正規表現の文字列については, メタ文字.^$[]*+?|()等として扱わない文字を\\でエスケープしておく。
  //[留意事項]
  // リロードにより再送信しても"問題の無いサイトのみ"とすること。
  // そうでないなら警告表示のとおり二重投稿や二重注文になる。
  siteinfo: [
    "http://www\\.e2sptv\\.jp/search/e2/S9_2/Program\\.html",                /*e2ByスカパーMy番組表*/
    "http://jp\\.[0-9a-zA-Z]+\\.mail\\.yahoo\\.co\\.jp/ym/ShowFolder\\?.*",  /*旧Yahoo! Mail 表示画面*/
    /*"http://forums\\.mozillazine\\.org/.*",  forums.mozillazine.org*/
  ],
  // -- config --

  init: function() {
    var er;
    for (var i = 0; i < this.siteinfo.length; i++){
      er = false;
      try {
        var dummy1 = new RegExp(this.siteinfo[i], "i");
      } catch(e) {
        er = true;
      }
      if (er)
        alert("stopResendWarning" + i +" \u756a\u76ee\u306eURL\u6b63\u898f\u8868\u73fe\u306e\u8a18\u8ff0\u306b\u8aa4\u308a\u304c\u3042\u308a\u307e\u3059");
    }

    this.regexp = new RegExp("^(" + (this.siteinfo.join("|")) + ")$", "i");

    var func = window.BrowserReloadWithFlags.toString();
      func = func.replace(
      '{',
      " \
      { \
      try { \
        var uri = gBrowser.selectedBrowser.webNavigation.currentURI; \
        if (stopResendWarning.regexp.test(uri.spec)) { \
          var hash = gBrowser.selectedBrowser.contentDocument.location.hash; \
          gBrowser.selectedBrowser.contentDocument.location.replace(uri.spec.replace(hash,'')); \
          if ('sRW_restoreScrollPosition' in window ) \
            window.sRW_restoreScrollPosition.setScrollEntryRestore(-1, true); \
          return; \
        } \
      } catch (ex) {} \
      "
      );
    eval("window.BrowserReloadWithFlags = " + func);

    func = window.gBrowser.reloadTab.toString();
      func = func.replace(
      '{',
      " \
      { \
      try { \
        var uri = aTab.linkedBrowser.webNavigation.currentURI; \
        if (stopResendWarning.regexp.test(uri.spec)) { \
          var hash = aTab.linkedBrowser.contentDocument.location.hash; \
          aTab.linkedBrowser.contentDocument.location.replace(uri.spec.replace(hash,'')); \
          if ('sRW_restoreScrollPosition' in window ) \
            window.sRW_restoreScrollPosition.setScrollEntryRestore(-1, true); \
          return; \
        } \
      } catch (ex) {} \
      "
      );
    eval("window.gBrowser.reloadTab = " + func);

    func = window.gBrowser.reloadAllTabs.toString();
      func = func.replace(
      'this.getBrowserAtIndex(i).reload();',
      " \
      try { \
        var uri = this.getBrowserAtIndex(i).webNavigation.currentURI; \
        if (stopResendWarning.regexp.test(uri.spec)) { \
          var hash = this.getBrowserAtIndex(i).contentDocument.location.hash; \
          this.getBrowserAtIndex(i).contentDocument.location.replace(uri.spec.replace(hash,'')); \
          if ('sRW_restoreScrollPosition' in window ) \
            window.sRW_restoreScrollPosition.setScrollEntryRestore(-1, true); \
          continue; \
        } \
      } catch (ex) {} \
      this.getBrowserAtIndex(i).reload(); \
      "
      );
    eval("window.gBrowser.reloadAllTabs = " + func);
  }
}

if (!('sRW_restoreScrollPosition' in window )) {
  window.sRW_restoreScrollPosition = {
    init: function() {
      if (!window.getBrowser())
        return;
/*
      this._BrowserBack = BrowserBack;
      this._BrowserForward = BrowserForward;

      BrowserBack = function(aEvent, aIgnoreAlt)
      {
        sRW_restoreScrollPosition.setScrollEntryRestorePrev(true);
        this._BrowserBack(aEvent, aIgnoreAlt);
      };

      BrowserForward = function(aEvent, aIgnoreAlt)
      {
        sRW_restoreScrollPosition.setScrollEntryRestoreNext(true);
        this._BrowserForward(aEvent, aIgnoreAlt);
      };

      var prefs = Components.classes['@mozilla.org/preferences-service;1']
                            .getService(Components.interfaces.nsIPrefBranch);
*/
      var reload = false;
/*
      try {
        reload = prefs.getBoolPref('sRW_restoreScrollPosition.reload');
      } catch(e) {
      }
*/
      if (reload) {
        this._BrowserReload = window.BrowserReload;

        window.BrowserReload = function()
        {
          this._BrowserReload();
          window.sRW_restoreScrollPosition.setScrollEntryRestore(-1, true);
        };
      }

      reload = false;
/*
      try {
        reload = prefs.getBoolPref('sRW_restoreScrollPosition.forceReload');
      } catch(e) {
      }
*/

      if (reload) {
        this._BrowserReloadSkipCache = window.BrowserReloadSkipCache;

        window.BrowserReloadSkipCache = function()
        {
          this._BrowserReloadSkipCache();
          window.sRW_restoreScrollPosition.setScrollEntryRestore(-1, true);
        };
      }
    },

    load: function(event) {
      if (!(event.originalTarget instanceof HTMLDocument))
        return;
      var win = event.originalTarget.defaultView;
      if (win.frameElement)
        return;

      if (!window.getWebNavigation())
        return;

      var sessionHistory = window.getWebNavigation().sessionHistory;
      var scrollHistory = window.sRW_restoreScrollPosition.getScrollHistory();

      if (!scrollHistory)
        return;

      var index = sessionHistory.index;

      // scroll history exists and the current page is within a valid range
      if (scrollHistory && index >= 0 && index <= scrollHistory.length) {
        var entry = scrollHistory[index];

        // back/forward called, restore scroll position
        if (entry && entry.restore) {
          var contentWindow = window.getBrowser().contentWindow;

          // only restore if scroll x/y is zero and stored is non-zero
          if (!contentWindow.scrollX && !contentWindow.scrollY &&
             (entry.document.x || entry.document.y))
            contentWindow.scrollTo(entry.document.x, entry.document.y);

          var frames = contentWindow.frames;

          // if frame lengths match (and they should), restore
          if (entry.frames.length == frames.length)
            for (var i = 0; i < frames.length; i++)
              if (!frames[i].scrollX && !frames[i].scrollY &&
                 (entry.frames[i].x || entry.frames[i].y))
                frames[i].scrollTo(entry.frames[i].x, entry.frames[i].y);
        }
      }
    },

    save: function(event) {
      if (!(event.originalTarget instanceof HTMLDocument))
        return;
      var win = event.originalTarget.defaultView;
      if (win.frameElement)
        return;
      if (!window.getWebNavigation())
        return;

      var sessionHistory = window.getWebNavigation().sessionHistory;

      // store document (and frame) scroll positions

      var entry = { document: { x: content.scrollX, y: content.scrollY },
                    frames: [],
                    restore: false }

      var frames = window.getBrowser().contentWindow.frames;

      for (var i = 0; i < frames.length; i++) {//alert(frames[i].scrollY);
        entry.frames[i] = { x: frames[i].scrollX, y: frames[i].scrollY };
      }

      window.sRW_restoreScrollPosition.setScrollEntry(sessionHistory.index, entry);
    },

    getScrollHistory: function() {
      if (!("_scrollHistory" in window.getBrowser().mCurrentTab))
        return null;
      return window.getBrowser().mCurrentTab._scrollHistory;
    },

    setScrollEntry: function(position, entry) {
      var currentTab = window.getBrowser().mCurrentTab;

      if (!currentTab._scrollHistory)
        currentTab._scrollHistory = [];

      currentTab._scrollHistory[position] = entry;
    },

    getScrollEntry: function(position) {
      var sessionHistory = window.getWebNavigation().sessionHistory;
      var scrollHistory = this.getScrollHistory();

      var pos = (position >= 0) ? position : sessionHistory.index;

      if (scrollHistory && pos >= 0 && pos < scrollHistory.length)
        return scrollHistory[pos];

      return null;
    },

    getScrollEntryPrev: function() {
      var sessionHistory = window.getWebNavigation().sessionHistory;

      return this.getScrollEntry(sessionHistory.index - 1);
    },

    getScrollEntryNext: function() {
      var sessionHistory = window.getWebNavigation().sessionHistory;

      return this.getScrollEntry(sessionHistory.index + 1);
    },

    setScrollEntryRestore: function(position, restore) {
      var entry = this.getScrollEntry(position);

      if (entry)
        entry.restore = restore;
    },

    setScrollEntryRestorePrev: function(restore) {
      var entry = this.getScrollEntryPrev();

      if (entry)
        entry.restore = restore;
    },

    setScrollEntryRestoreNext: function(restore) {
      var entry = this.getScrollEntryNext();

      if (entry)
        entry.restore = restore;
    }
  };

  //window.addEventListener("load", sRW_restoreScrollPosition.init, false);

  gBrowser.addEventListener("load", window.sRW_restoreScrollPosition.load, true);
  gBrowser.addEventListener("beforeunload", window.sRW_restoreScrollPosition.save, true);

  window.sRW_restoreScrollPosition.init();

}
stopResendWarning.init();