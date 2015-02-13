// ==UserScript==
// @name           ucjsNavigation.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2015/01/15 Fixed strictmode
// @version        2013/09/02 19:00 26.0 Bug 910161 Remove nsIHistoryEntry and replace it with nsISHEntry
// @version        2011/02/01 22:00 4.0
// @version        2008/04/15 loadURIの使用やめ
// @note           use UCJSLoader
// ==/UserScript==
//  軽量マウスジェスチャー用の次へ,前へのナビゲーションリンクコマンド
//  次へ  : ucjsNavigation._navigateNext(event),     前へ    : ucjsNavigation._navigatePrev(event),
//  早送り: ucjsNavigation._fastForward(event), 巻き戻し: ucjsNavigation._fastRewind(event),
//  一つ上の階層へ: ucjsNavigation._upPath(event)
//  直前に選択していたタブ: ucjsNavigation.tabFocusManager.focusLastSelectedTab()
//  上記を一つ戻る        : ucjsNavigation.tabFocusManager.focusPrevSelectedTab();
// @Note           フレーム内でコマンド発行すると,そのフレームをナビゲートできる
var ucjsNavigation = {

  _enableLink: true,    // metaタグ内のlink rel=next/prev があればそれを使用する (優先順位1)
  _enableLinkWithCTRLKey: true, //ctrlKeyを押下しているときのみmetaタグ内のlinkを有効とする
  _enableWord: true,    // Anchorタグに指定した文字列があるリンクの走査を行うなう(優先順位2)
  _enableNumber: true,  // urlに含む数字を増減しナビゲートする                   (優先順位3)
  _enableHistory: true, // 何れの場合も履歴があるなら履歴を再利用する
  _typeOfRewaind: 1,    // 0:同一ドメインの最初のエントリへ,  1:異なるホストのエントリまでさかのぼる
                        // ただしctrlKeyを押下している時は, 設定が逆転する
  _typeOfFoward:  1,    // 0:同一ドメインの最後のエントリへ,  1:異なるホストのエントリまで進む
                        // ただしctrlKeyを押下している時は, 設定が逆転する

  activeBrowser: function() {
    return ('SplitBrowser' in window ? SplitBrowser.activeBrowser : null )
            || gBrowser;
  },

  _getWindow: function(){
    var focusedWindow = document.commandDispatcher.focusedWindow;
    if (!focusedWindow || focusedWindow == window)
      return window.content;
    else
      return focusedWindow;
  },
//URLをカレントwindow(frame)で開く
  _openURL: function(aURI,aWin,aHistoryDirection){
    //相対パスの処理
    const ioService = Components.classes['@mozilla.org/network/io-service;1']
                      .getService(Components.interfaces.nsIIOService);
    var baseURI = ioService.newURI(aWin.document.documentURI, null, null);
    aURI = ioService.newURI(aURI, null, baseURI).spec;
    // もし読み込むページがすでに前後の履歴にある場合は、そちらを優先する
    // (original:SHIMODA Hiroshi http://piro.sakura.ne.jp/xul/_rewindforward.html)
    if( this._enableHistory
        && aHistoryDirection != 0
        && aWin == this.activeBrowser().contentWindow // フレーム未実装
      ){
      var SH    = this.activeBrowser().sessionHistory;
      var index = SH.index + (aHistoryDirection > 0 ? 1 : -1 );
      if (index > -1 && index < SH.count) {
        var entry = this._GetHistoryEntryAt(index);
//dump("entry.URI: "+convert(entry.URI.spec)+"\n     aURI: "+convert(aURI)+"\nentry.URI.spec == aURI: "+(convert(entry.URI.spec) == convert(aURI)).toString());
        if ( convert(entry.URI.spec) == convert(aURI) ) {
          this.activeBrowser().webNavigation.gotoIndex(index);
          return;
        }
      }
    }

    if(this.activeBrowser().contentPrincipal) urlSecurityCheck(aURI, this.activeBrowser().contentPrincipal);
    else urlSecurityCheck(aURI, aWin.document.documentURI);
    aWin.location = aURI;

    function convert(aURI){
      if( aURI.match(/^http:\/\/www\.google\.co\.jp\/search/) ){
        return aURI.replace(/&hs=\w\w\w&/,'&');
      }else if( aURI.match(/^http:\/\/(wrs)?\.?search\.yahoo\.co\.jp\/(search|S)/) ){
        return aURI.replace(/\S+-http%3A\/\//,'http://').replace(/&(xargs|pstart|fr)=.+&/,'&');
      }else if( aURI.match(/^http:\/\/search\.goo\.ne\.jp\/web\.jsp/) ){
        return aURI.replace(/&from=.+$/,'');
      }else if( aURI.match(/^http:\/\/search\.live\.com\/results\.aspx/) ){
        return aURI.replace(/&FORM=.+$/,'');
      }
      return aURI;
    }
  },
  _GetHistoryEntryAt: function(aIndex){
    try{
      var entry  = this.activeBrowser().sessionHistory.getEntryAtIndex(aIndex, false);
      var info = { URI : null, referrerURI : null };
      if (entry) {
        try {
          entry = entry.QueryInterface(Components.interfaces.nsIHistoryEntry)
                .QueryInterface(Components.interfaces.nsISHEntry);
        } catch(er) {}
        if (entry.URI)
          info.URI = entry.URI;
        if (entry.referrerURI)
          info.referrerURI = entry.referrerURI;
      }
      return info;
    }catch(e){return null;}
  },

//次のページ
  _navigateNext: function(aEvent){
    // linkタグ
    var win = this._getWindow();
    if( this._enableLink && ( !this._enableLinkWithCTRLKey || this._enableLinkWithCTRLKey && aEvent.ctrlKey) ){
      var arrTags = win.document.getElementsByTagName('link');
      for(var i=0,len=arrTags.length; i<len; i++) {
        if(!arrTags[i].hasAttribute('rel') || !arrTags[i].hasAttribute('href')) continue;
        if(!arrTags[i].getAttribute('rel').match(/next/i)) continue;
        this._openURL(arrTags[i].getAttribute('href'),win,1);
        return;
      }
    }
    if( this._enableWord){  // Eigene: Go to Link named Next
      const XPATH = 'descendant::text()';
      var arrTags = win.document.links;
      if( arrTags ){
        for(var i=0; i<arrTags.length; i++) {
          var result = win.document.evaluate(XPATH,arrTags[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
          for(var j=0,link='';j<result.snapshotLength;j++){
            link = link.concat(result.snapshotItem(j).textContent);
          }
          if (!link) continue;
          link = link.replace(/&nbsp;/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<");
          //dump(link);
          if (link.match(/^[\n>\s]?\u6b21(\u306e?(\s?\d+?\s?)?(\u30da\u30fc\u30b8|\u9801|\u8a18\u4e8b|\u4ef6|\u7d50\u679c|\u30b9\u30ec\u30c3\u30c9|\u30c4\u30ea\u30fc)?(\s?\d+?\s?)?\u3078?)?\s?[\u2192\u00bb]?\s?>?\n?$/)
           || link.match(/\u6b21\u306e\u30da\u30fc\u30b8\u3078/)
           || link.match(/\u9032\u3080\s?[\u2192\u00bb]?\n?$/)
           || link.match(/\u7d9a\u304f\n?$/)
           || link.match(/\u3064\u3065\u304f\n?$/) )          {
            this._openURL(arrTags[i].getAttribute('href'),win,1);
            return;
          }
        }
        //さらに
        for(var i=0; i<arrTags.length; i++) {
          var result = win.document.evaluate(XPATH,arrTags[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
          for(var j=0,link='';j<result.snapshotLength;j++){
            link = link.concat(result.snapshotItem(j).textContent);
          }
          if (!link) continue;
          //dump(link);
          if ( (link.match(/[＞›>]{1}\n?$/) && !link.match(/[＜‹<]{1}/))
           || link.match(/^[>\s\(]?next(\s?\d+?\s?)?(search)?\s?(pages?|results?)?/i) )

          {
            this._openURL(arrTags[i].getAttribute('href'),win,1);
            return;
          }
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
      var x = win.document.evaluate(nextLink, win.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      if (x.snapshotLength){
        next = x.snapshotItem(x.snapshotLength-1);
        this._openURL(next.href,win,-1);
        return;
      }
    }
    if( this._enableNumber ){ // Eigene: Go to Next numbered Page
      var aURL = this._numberedPage(win.location.href, 1)
      if(aURL){
        this._openURL(aURL, win, 1);
        return;
      }
    }
    return;
  },
//前のページ
  _navigatePrev: function(aEvent){
    // linkタグ
    var win = this._getWindow();
    if( this._enableLink && ( !this._enableLinkWithCTRLKey || this._enableLinkWithCTRLKey && aEvent.ctrlKey) ){
      var arrTags = win.document.getElementsByTagName('link');
      for(var i=0; i<arrTags.length; i++) {
        if(!arrTags[i].hasAttribute('rel') || !arrTags[i].hasAttribute('href')) continue;
        if(!arrTags[i].getAttribute('rel').match(/prev/i)) continue;
        this._openURL(arrTags[i].getAttribute('href'),win,-1);
        return;
      }
    }
    if( this._enableWord){  // Eigene: Go to Link named Previous
      const XPATH = 'descendant::text()';
      var arrTags = win.document.links;
      if( arrTags ){
        for(var i=0; i<arrTags.length; i++) {
          var result = win.document.evaluate(XPATH,arrTags[i],null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
          for(var j=0,link='';j<result.snapshotLength;j++){
            link = link.concat(result.snapshotItem(j).textContent);
          }
          if (!link) continue;
          link = link.replace(/&nbsp;/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<");

          if (link.match(/^\n?[\u2190\u00ab]?<?\s?\u524d(\u306e?(\s?\d+?\s?)?(\u30da\u30fc\u30b8|\u9801|\u8a18\u4e8b|\u4ef6|\u7d50\u679c|\u30b9\u30ec\u30c3\u30c9|\u30c4\u30ea\u30fc)?(\s?\d+?\s?)?\u3078?)?[\s<\n]?$/)
           || link.match(/\u524d\u306e\u30da\u30fc\u30b8\u3078/)
           || link.match(/^\n?[\u2190\u00ab]?\s?\u623b\u308b/)
           || (link.match(/^\n?[\uff1c\u2039<]{1}/) && !link.match(/[\uff1e\u203a>]{1}/))
           || link.match(/^[<\s\(]?prev(ious)?(\s|(\s?\d+\s?))(search)?\s?(pages?|results?)?/i) )
          {
            this._openURL(arrTags[i].href,win,-1);
            return;
          }
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

      var x = win.document.evaluate(nextLink, win.document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      if (x.snapshotLength){
        next = x.snapshotItem(x.snapshotLength-1);
        this._openURL(next.href,win,-1);
        return;
      }
    }
    if( this._enableNumber ){ // Eigene: Go to Previous numbered Page
      var aURL = this._numberedPage(win.location.href, -1)
      if(aURL){
        this._openURL(aURL, win, -1);
        return;
      }
    }
    return;
  },
// Eigene: solve URL to numbered Page
  _numberedPage: function(aURL, direction){
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
      if (w[i].match(/^\d+/)) break;
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
  },
//早送り
  _fastForward: function(aEvent){
    var SH = this.activeBrowser().sessionHistory;
    var current = this._GetHistoryEntryAt(SH.index);
    if(  this._typeOfFoward == 1 && !aEvent.ctrlKey
      || this._typeOfFoward == 0 &&  aEvent.ctrlKey ){ //異なるホストの最後のエントリまで進む
      for(var i=SH.index+1,len=SH.count;i<len;i++){
        var entry = this._GetHistoryEntryAt(i);
        try{
          if ( entry.URI.host != current.URI.host ) {
            this.activeBrowser().webNavigation.gotoIndex(i);
            return;
          }
        }catch(ex){
          document.getElementById("Browser:Forward").doCommand(); //ホスト部が無いので進むコマンド実行
          return;
        }
      }
    } //同一ドメインの最後のエントリへ, ただしカレントが最後のエントリーなら何もしない
    var index = SH.index;
    for(var i=SH.index+1,len=SH.count;i<len;i++){
      var entry = this._GetHistoryEntryAt(i);
      try{
        if ( entry.URI.host == current.URI.host ) index = i;
        else break;
      }catch(ex){
        document.getElementById("Browser:Forward").doCommand(); //ホスト部が無いので進むコマンド実行
        return;
      }
    }
    if(index != SH.index) this.activeBrowser().webNavigation.gotoIndex(index);
    return;
  },
//巻き戻し
  _fastRewind: function(aEvent){
    var SH = this.activeBrowser().sessionHistory;
    var current = this._GetHistoryEntryAt(SH.index);
    if(  this._typeOfRewaind == 1 && !aEvent.ctrlKey
      || this._typeOfRewaind == 0 &&  aEvent.ctrlKey ){ //異なるホストの最後のエントリまでさかのぼる
      for(var i=SH.index-1; i>-1; i--){
        var entry = this._GetHistoryEntryAt(i);
        try{
          if ( entry.URI.host != current.URI.host ) {
            this.activeBrowser().webNavigation.gotoIndex(i);
            return;
          }
        }catch(ex){
          document.getElementById("Browser:Back").doCommand(); //ホスト部が無いので戻るコマンド実行
          return;
        }
      }
    } //同一ドメインの最初のエントリへ, ただしカレントが最初のエントリーなら何もしない
    var index = SH.index;
    for(var i=SH.index-1; i>-1; i--){
      var entry = this._GetHistoryEntryAt(i);
      try{
        if ( entry.URI.host == current.URI.host ) index = i;
        else break;
      }catch(ex){
        document.getElementById("Browser:Back").doCommand(); //ホスト部が無いので戻るコマンド実行
        return;
      }
    }
    if(index != SH.index) this.activeBrowser().webNavigation.gotoIndex(index);
    return;
  },
//上の階層
  _upPath: function(aEvent){
    var uri = this.activeBrowser().currentURI;
    if (uri.path == "/") return;
    var pathList = uri.path.split("/");
    if (!pathList.pop()) pathList.pop();
    var uri = uri.prePath + pathList.join("/") + "/";
    if( this._enableHistory ){
      var SH = this.activeBrowser().sessionHistory;
      for(var i=SH.index-1; i>-1; i--){
        var entry = this._GetHistoryEntryAt(i);
        try{
          if ( entry.URI.spec.replace(/\/(index\.html?|default\.htm)$/i,'/') == uri ) {
            this.activeBrowser().webNavigation.gotoIndex(i);
            return;
          }
        }catch(ex){}
      }
    }
    gBrowser.loadURI(uri);
  }
}
// init tab focus manager (thanks http://www.xuldev.org/blog/?page_id=130#comments)
//ucjsNavigation.tabFocusManager.focusLastSelectedTab();

ucjsNavigation.tabFocusManager = {
  _tabHistory: [],
  _tabHistory2: [],
  focusLastSelectedTab: function() {
    var currentPanel = gBrowser.mCurrentTab.getAttribute("linkedpanel");
    while (this._tabHistory.length > 1) {
      var panel = this._tabHistory.pop();
      this._tabHistory2.push(panel);
      if (this._tabHistory2.length > 32) this._tabHistory2.shift();
      if (panel == currentPanel) continue;
      var tab = this.getTabFromPanel(panel);
      if (!tab || tab.getAttribute('hidden'))
        continue;
      gBrowser.selectedTab = tab;
      break;
    }
  },
  focusPrevSelectedTab: function() {
    var currentPanel = gBrowser.mCurrentTab.getAttribute("linkedpanel");
    while (this._tabHistory2.length > 1) {
      var panel = this._tabHistory2.pop();
      if (panel == currentPanel) continue;
      var tab = this.getTabFromPanel(panel);
      if (!tab || tab.getAttribute('hidden'))
        continue;
      gBrowser.selectedTab = tab;
      break;
    }
  },
  getTabFromPanel: function(panel) {
    for(var i = 0; i < gBrowser.mTabs.length; i++) {
      var tab = gBrowser.mTabs[i];
      if (tab.getAttribute("linkedpanel") == panel) {
        return tab;
        break;
      }
    }
    return null;
  },
  handleEvent: function(event) {
    this._tabHistory.push(event.target.getAttribute("linkedpanel"));
    if(event.type != 'TabSelect')
      this._tabHistory2 = [event.target.getAttribute("linkedpanel")];
    if (this._tabHistory.length > 32)
      this._tabHistory.shift();
  }
}
if(gBrowser.selectedTab && gBrowser.selectedTab.hasAttribute("linkedpanel"))
  ucjsNavigation.tabFocusManager._tabHistory = [gBrowser.selectedTab.getAttribute("linkedpanel")];
gBrowser.mTabContainer.addEventListener("TabSelect", ucjsNavigation.tabFocusManager, false);
gBrowser.mTabContainer.addEventListener("TabOpen", ucjsNavigation.tabFocusManager, false);
//gBrowser.mTabContainer.addEventListener("SSTabRestored", ucjsNavigation.tabFocusManager, false);
