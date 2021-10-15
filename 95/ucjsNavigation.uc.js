// ==UserScript==
// @name           ucjsNavigation.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @include        main
// @compatibility  Firefox 95
// @author         Alice0775
// @version        2021/10/15 00:00 @compatibility 95, Addressed "Services" not being loaded in frame scripts (Bug 1708243).
// @version        2021/10/05 Change word '次''前' → '次へ''前へ' to prevent wrong target
// @version        2021/09/25 add flags for fallback or not
// @version        2021/09/12 remove the misjudged part on Reddit 
// @version        2020/08/04 add fastNavigationBackForward
// @version        2020/01/15 78+
// @version        2015/01/15 Fixed strictmode
// ==/UserScript==
//  軽量マウスジェスチャー用なので MouseGestures2_e10s.uc.js等に以下を追加して使う
/*
        ['RL', '[次へ]等のリンクへ移動', function(){ ucjsNavigation?.advancedNavigateLink(1); } ],
        ['LR', '[戻る]等のリンクへ移動', function(){ ucjsNavigation?.advancedNavigateLink(-1); } ],
        ['URL', '<< 巻き戻し', function(){ ucjsNavigation?.fastNavigationBackForward(-1); } ],
        ['URL', '>> 早送り', function(){ ucjsNavigation?.fastNavigationBackForward(1); } ],
        ['ULR', '直前に選択していたタブ', function(){ ucjsNavigation_tabFocusManager?.advancedFocusTab(-1); } ],
        ['URL', '直前に選択していたタブを一つ戻る', function(){ ucjsNavigation_tabFocusManager?.advancedFocusTab(1); } ],
*/
var ucjsNavigation = {

  init: function() {
    Services.console.logStringMessage("ucjsNavigation.init ");
    let frameScript = {
      init: function() {
	      /*
	      const { Services } = ChromeUtils.import(
	        "resource://gre/modules/Services.jsm"
	      );
        this.Services = Services;
        delete Services;
        */
        addMessageListener("ucjsNavigation_unload", this);
        addMessageListener("ucjsNavigation_getNextLink", this);
        addMessageListener("ucjsNavigation_getPrevLink", this);
      },

      uninit: function() {
        removeMessageListener("ucjsNavigation_unload", this);
        removeMessageListener("ucjsNavigation_getNextLink", this);
        removeMessageListener("ucjsNavigation_getPrevLink", this);
      },

      receiveMessage: function(message) {
        // this.Services.console.logStringMessage("====" + message.name);
        let url;
        switch(message.name) {
          case "ucjsNavigation_unload":
            this.uninit();;
            break;
          case "ucjsNavigation_getNextLink":
            url = this._navigateNext();
            // this.Services.console.logStringMessage("ucjsNavigation_getNextLink: " + url);
            if (url) {
              let win = content;
              win.location.href = url;
            }
            break;
          case "ucjsNavigation_getPrevLink":
            url = this._navigatePrev();
            // this.Services.console.logStringMessage("ucjsNavigation_getPrevLink: " + url);
            if (url) {
              let win = content;
              win.location.href = url;
            }
            break;
        }
        return {};
      },

    //次のページ
      _navigateNext: function() {
        // linkタグ
        let win = content;
        let arrTags = win.document.getElementsByTagName('link');
        for(let i=0,len=arrTags.length; i<len; i++) {
          if(!arrTags[i].hasAttribute('rel') || !arrTags[i].hasAttribute('href')) continue;
          if(!arrTags[i].getAttribute('rel').match(/next/i)) continue;
        //   this.Services.console.logStringMessage('link ' + arrTags[i].href);
          return arrTags[i].href;
        }
        // Eigene: Go to Link named Next
        const XPATH = 'descendant::text()';
        arrTags = win.document.links;
        if( arrTags ){
          for(let i=0; i<arrTags.length; i++) {
            let result = win.document.evaluate(XPATH,arrTags[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
            let link='';
            for(let j=0;j<result.snapshotLength;j++){
              link = link.concat(result.snapshotItem(j).textContent);
            }
            if (!link) continue;
            link = link.replace(/&nbsp;/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<");
            //dump(link);
/*
            if (link.match(/^[n>s]?次(の?(s?d+?s?)?(ページ|頁|記事|件|結果|スレッド|ツリー)?(s?d+?s?)?へ?)?s?[→»]?s?>?n?$/)
             || link.match(/次のページへ/)
             || link.match(/進むs?[→»]?n?$/)
             || link.match(/続くn?$/)
             || link.match(/つづくn?$/) )          {
*/
            if (link.match(/^[\n>\s]?\u6b21(\u306e?(\s?\d+?\s?)?(\u30da\u30fc\u30b8|\u9801|\u8a18\u4e8b|\u4ef6|\u7d50\u679c|\u30b9\u30ec\u30c3\u30c9|\u30c4\u30ea\u30fc)?(\s?\d+?\s?)?\u3078?)?\s?[\u2192\u00bb]?\s?>?\n?$/)
             || link.match(/\u6b21\u306e\u30da\u30fc\u30b8\u3078/)
             || link.match(/\u9032\u3080\s?[\u2192\u00bb]?\n?$/)
             || link.match(/\u7d9a\u304f\n?$/)
             || link.match(/\u3064\u3065\u304f\n?$/) )          {
        //   this.Services.console.logStringMessage('next ' + arrTags[i].href);
              return arrTags[i].href;
            }
          }
/*
          //さらに
          for(let i=0; i<arrTags.length; i++) {
            let result = win.document.evaluate(XPATH,arrTags[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
            let link='';
            for(let j=0;j<result.snapshotLength;j++){
              link = link.concat(result.snapshotItem(j).textContent);
            }
            if (!link) continue;
            //dump(link);
            if ( (link.match(/[＞›>]{1}\n?$/) && !link.match(/[＜‹<]{1}/))
             || link.match(/^[>\s\(]?next(\s?\d+?\s?)?(search)?\s?(pages?|results?)?/i) )

            {
        //   this.Services.console.logStringMessage('number ' + arrTags[i].href);
              return arrTags[i].href;
            }
          }
*/
        }
/*
        let arr = ['次へ','続き','進む','next','もっと読む','>>','xBB','＞'];
*/
        let arr = ['\u6B21\u3078','\u7D9A\u304D','\u9032\u3080','next','\u3082\u3063\u3068\u8AAD\u3080','>>','\xBB','\uFF1E'];
        let before = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\n\t ';
        let after  = 'abcdefghijklmnopqrstuvwxyz';
        let nextLink = arr.map(function(str){
          if (str.indexOf('"') >= 0) return '';
          return '//text()[starts-with(translate( self::text(), "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a'
          +'|//img[starts-with(translate( @alt, "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a';
        }).join('|');
        let x = win.document.evaluate(nextLink, win.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (x.snapshotLength){
          next = x.snapshotItem(x.snapshotLength-1);
          return next.href;
        }
      // Eigene: Go to Next numbered Page
        let aURL = this._numberedPage(win.location.href, 1)
        if(aURL){
          return aURL;
        }

        return null;
      },
    //前のページ
      _navigatePrev: function() {
        // linkタグ
        let win = content;;
        let arrTags = win.document.getElementsByTagName('link');
        for(let i=0; i<arrTags.length; i++) {
          if(!arrTags[i].hasAttribute('rel') || !arrTags[i].hasAttribute('href')) continue;
          if(!arrTags[i].getAttribute('rel').match(/prev/i)) continue;
          return arrTags[i].href;
        }
        // Eigene: Go to Link named Previous
        const XPATH = 'descendant::text()';
         arrTags = win.document.links;
        if( arrTags ){
          for(let i=0; i<arrTags.length; i++) {
            let result = win.document.evaluate(XPATH,arrTags[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
            let link='';
            for(let j=0;j<result.snapshotLength;j++){
              link = link.concat(result.snapshotItem(j).textContent);
            }
            if (!link) continue;
            link = link.replace(/&nbsp;/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<");
/*
            if (link.match(/^n?[←«]?<?s?前(の?(s?d+?s?)?(ページ|頁|記事|件|結果|スレッド|ツリー)?(s?d+?s?)?へ?)?[s<n]?$/)
             || link.match(/前のページへ/)
             || link.match(/^n?[←«]?s?戻る/)
             || (link.match(/^n?[＜‹<]{1}/) && !link.match(/[＞›>]{1}/))
             || link.match(/^[<s(]?prev(ious)?(s|(s?d+s?))(search)?s?(pages?|results?)?/i) )
*/
            if (link.match(/^\n?[\u2190\u00ab]?<?\s?\u524d(\u306e?(\s?\d+?\s?)?(\u30da\u30fc\u30b8|\u9801|\u8a18\u4e8b|\u4ef6|\u7d50\u679c|\u30b9\u30ec\u30c3\u30c9|\u30c4\u30ea\u30fc)?(\s?\d+?\s?)?\u3078?)?[\s<\n]?$/)
             || link.match(/\u524d\u306e\u30da\u30fc\u30b8\u3078/)
             || link.match(/^\n?[\u2190\u00ab]?\s?\u623b\u308b/)
             || (link.match(/^\n?[\uff1c\u2039<]{1}/) && !link.match(/[\uff1e\u203a>]{1}/))
             || link.match(/^[<\s\(]?prev(ious)?(\s|(\s?\d+\s?))(search)?\s?(pages?|results?)?/i) )
            {
              return arrTags[i].href;
            }
          }
        }
/*
        let arr = ['前へ','戻る','prev','<<','xAB','＜'];
*/
        let arr = ['\u524D\u3078','\u623B\u308B','prev','<<','\xAB','\uff1c'];
        let before = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\n\t ';
        let after  = 'abcdefghijklmnopqrstuvwxyz';
        let nextLink = arr.map(function(str){
          if (str.indexOf('"') >= 0) return '';
          return '//text()[starts-with(translate( self::text(), "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a'
          +'|//img[starts-with(translate( @alt, "'+ before +'", "'+ after +'"),"' + str + '")]/ancestor-or-self::a';
        }).join('|');

        let x = win.document.evaluate(nextLink, win.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (x.snapshotLength){
          next = x.snapshotItem(x.snapshotLength-1);
          return next.href;
        }
        // Eigene: Go to Previous numbered Page
        let aURL = this._numberedPage(win.location.href, -1)
        if(aURL){
          return aURL;
        }
        return null;
      },

    // Eigene: solve URL to numbered Page
      _numberedPage: function(aURL, direction) {
        //dump('Parsing numbered Page of url : ' + aURL);
        let urlParts = aURL.match(/^(.+?:\/\/)([^\/]+@)?([^\/]*)(.*)$/);
        if (!urlParts) return false;
        for(let i=0; i<urlParts.length; i++){
          if(!urlParts[i]) urlParts[i] = '';
        }
        let path= urlParts[4];
        //dump(path);
        let w = path.split(/(%[0-7|a-f]+)|(\d+)/i);
        for(let i = w.length-1; i>=0; i--){
          if (w[i].match(/^\d+/)) break;
        }
        if (i >= 0) {
          let l = w[i].length;
          if(w[i].match(new RegExp('^0')))
            w[i] = ( parseInt(w[i],10)+1000000000 + (direction>0 ? +1 : -1) ).toString().substr(-l);
          else
            w[i] = parseInt(w[i]) + (direction>0 ? +1 : -1);
          return urlParts[1]+urlParts[2]+urlParts[3]+w.join('');
        }
        return false
      }
      
    }; // frameScript
    Services.console.logStringMessage("framescript: " + frameScript);
    window.messageManager.loadFrameScript(
      'data:application/javascript,' +
       encodeURIComponent(frameScript.toSource().replace(/\n[ ]+/g, "\n ") + ".init();"),
       true, true
     );

    window.addEventListener("unload", this, false);
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "unload": 
        this.uninit();
        break;
    }
  },

  uninit: function() {
    gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsNavigation_unload");
    window.removeEventListener("unload", this, false);
  },
  
  advancedNavigateLink: function(aNext) {
    if (aNext >= 0) {
      gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsNavigation_getNextLink");
    } else {
      gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsNavigation_getPrevLink");
    }
  },

  getHost: function(url) {
    let uri = Services.io.newURI(url);
    try {
      return uri.host;
    } catch(e) {
      return uri.specIgnoringRef;
    }
    return url
  },
  
  fastNavigationBackForward: function fastNavigationBackForward(fastBack) {
    let sessionHistory = SessionStore.getSessionHistory(gBrowser.selectedTab);
    let index = sessionHistory.index;
  	let entry = sessionHistory.entries[index];
    let host = this.getHost(entry.url);
  	
    if (fastBack < 0) {
      // 異なるホストの最新エントリまでさかのぼる
    	for (let i = index - 1; i >= 0; i--) {
        let entry1  = sessionHistory.entries[i];
        let host1 = this.getHost(entry1.url);
        if (host != host1) {
          gBrowser.webNavigation.gotoIndex(i);
          return;
        }
      }
      // fallback ホストの最初のエントリまでさかのぼる
      gBrowser.webNavigation.gotoIndex(0);
    } else {
      // 異なるホストの最古エントリまで進む
    	for (let i = index + 1; i < sessionHistory.entries.length; i++) {
        let entry1  = sessionHistory.entries[i];
        let host1 = this.getHost(entry1.url);
        if (host != host1) {
          gBrowser.webNavigation.gotoIndex(i);
          return;
        }
      }
      // fallback ホストの最後のエントリまで進む
      gBrowser.webNavigation.gotoIndex(sessionHistory.entries.length - 1);
    }
  }
}


var ucjsNavigation_tabFocusManager = {
  _tabHistory: [],
  _tabHistory2: [],
  init: function() {
    gBrowser.tabContainer.addEventListener("TabSelect", this, false);
    gBrowser.tabContainer.addEventListener("TabOpen", this, false);
    gBrowser.tabContainer.addEventListener("SSTabRestored", this, false);
    window.addEventListener("unload", this, false);
    let panel = gBrowser.selectedTab.getAttribute("linkedpanel");
    //Services.console.logStringMessage("TabSelect0: " + panel);
    this._tabHistory.push(panel);
  },

  uninit: function() {
    gBrowser.tabContainer.removeEventListener("TabSelect", this, false);
    gBrowser.tabContainer.removeEventListener("TabOpen", this, false);
    gBrowser.tabContainer.removeEventListener("SSTabRestored", this, false);
    window.removeEventListener("unload", this, false);
  },

  advancedFocusTab: function(aPrev, fallback = false) {
    if (aPrev <= 0 ) {
      this.focusPrevSelectedTab(fallback);
    } else {
      this.focusNextSelectedTab(fallback);
    }
  },

  focusPrevSelectedTab: function(fallback = false) {
    let currentPanel = gBrowser.selectedTab.getAttribute("linkedpanel");
    while (this._tabHistory.length > 0) {
      let panel = this._tabHistory.pop();
      if (panel == currentPanel) {
        continue;
      }
      let tab = this.getTabFromPanel(panel);
      if (!tab || tab.getAttribute('hidden'))
        continue;
      if (this._tabHistory2[this._tabHistory2.length - 1] != currentPanel)
        this._tabHistory2.push(currentPanel);
      if (this._tabHistory2.length > 32) this._tabHistory2.shift();
      gBrowser.selectedTab = tab;
      break;
    }
    if (this._tabHistory.length == 0) {
       this._tabHistory.push(gBrowser.selectedTab.getAttribute("linkedpanel"));
       return;
    }
    // fallback
    if (fallback) {
      gBrowser.tabContainer.advanceSelectedTab(-1, false);
      if (this._tabHistory2[this._tabHistory2.length - 1] != currentPanel)
        this._tabHistory2.push(currentPanel);
      if (this._tabHistory2.length > 32) this._tabHistory2.shift();
    }
  },

  focusNextSelectedTab: function(fallback = false) {
    let panel,
        currentPanel = gBrowser.selectedTab.getAttribute("linkedpanel");
    while (panel = this._tabHistory2.pop()) {
      if (panel == currentPanel) continue;
      let tab = this.getTabFromPanel(panel);
      if (!tab || tab.getAttribute('hidden'))
        continue;
      gBrowser.selectedTab = tab;
      return;
    }
    // fallback
    if (fallback)
      gBrowser.tabContainer.advanceSelectedTab(1, false);
  },

  getTabFromPanel: function(panel) {
    let children = gBrowser.tabContainer.allTabs;
    for(let i = 0; i < children.length; i++) {
      let tab = children[i];
      if (tab.getAttribute("linkedpanel") == panel) {
        return tab;
        break;
      }
    }
    return null;
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
      case "TabOpen":
      case "SSTabRestored":
        if (!event.target.selected)
          return;
      case "TabSelect":
        let panel = event.target.getAttribute("linkedpanel");
        //Services.console.logStringMessage("TabSelect(" + event.type + "): " + panel);
        if (this._tabHistory[this._tabHistory.length - 1] != panel)
          this._tabHistory.push(panel);
        if (this._tabHistory.length > 32) //max 32 個覚える
          this._tabHistory.shift();
    }
  }
};

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  ucjsNavigation.init();
  ucjsNavigation_tabFocusManager.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      ucjsNavigation.init();
      ucjsNavigation_tabFocusManager.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
