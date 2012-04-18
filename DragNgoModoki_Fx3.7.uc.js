// ==UserScript==
// @name           DragNgoModoki_Fx3.7.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ファイル名をD&D
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0 7.0 8 9 10.0a1
// @author         Alice0775
// @version        2012/04/19 00:05 debugなし
// @version        2012/04/19 00:00 designModeはなにもしないようにした
// @version        2012/03/01 12:00 isTabEmpty使うように
// @version        2012/02/12 16:00 fixed Bug 703514
// @version        2012/01/31 11:00 by Alice0775  12.0a1 about:newtab
// @version        2012/01/30 01:00 tavClose, this.sourcenode = null;
// @version        2011/07/22 21:00 Bug 50660 [FILE]Drag and drop for file upload form control (Fx7 and later)
// @version        2011/06/23 16:00 browser.tabs.loadInBackgroundに関わらずtabおよびtabshiftedはそれぞれ強制的に前面および背面に開く
// @version        2011/06/23 16:00 openLinkInにした
// @version        2011/06/22 00:00 getElementsByXPath 配列で返すのを忘れていた
// @version        2011/06/19 21:00 Google modified getElementsByXPath
// ==/UserScript==
// @version        2011/04/14 21:00 Google doc などでdrag drop uploadができないので外部ファイルのドロップは止め
// @version        2011/03/30 10:20 プロンプト
// @version        2011/03/29 14:20 copyToSearchBar, appendToSearchBar, searchWithEngine 追加変更
// @version        2011/03/11 10:30 Bug641090
// @version        2010/12/10 08:30 close button非表示 Bug 616014 - Add close button to the add-on bar
// @version        2010/11/13 20:30 status 4-evar
// @version        2010/09/24 20:30 Bug 574688 adon bar
// @version        2010/09/14 19:30 textのドラッグの判定時, テキストノードの制限を外してみた
// @version        2010/08/30 17:30 no more available InstallTrigger method in window since Firefox4.0b5pre
// @version        2010/08/15 17:00 パスの記入ができなくなっていた。regression from 07/15
// @version        2010/07/22 07:00 xxx Bug 580710 - Drag&Drop onto sidebar loads page into sidebar
// @version        2010/07/21 16:00 text
// @version        2010/07/15 16:00 window.getSelection()のままとした
// @version        2010/07/15 15:00 editable要素ではなにもしないようにした
// @version        2010/07/07 07:00 アドオンタブではなにもしないようにした
// @version        2010/07/06 01:05 外部テキストのドロップバグ
// @version        2010/07/06 01:00 外部テキストのドロップバグ
// @version        2010/07/06 00:55 frameへのドロップバグ, textはRESTRICT_SELECTED_TEXTにした
// @version        2010/07/05 20:55 rgression 2010/07/05 19:00 textlink
// @version        2010/07/05 20:30 検索エンジン
// @version        2010/07/05 19:00 textlink, modifier
// @version        2010/07/03 00:00 saveAs
// @version        2010/05/06 00:00 Bug 545119  - Remove browser dependency on nsDragAndDrop.js
// @version        2010/05/05 00:00 Bug 545119  - Remove browser dependency on nsDragAndDrop.js
// @version        2010/04/24 20:00 urlのjavascriptとdataは無条件にカレントタブに開くように
// @version        2010/04/22 23:00 urlの空白は削除しておく
// @version        2010/04/22 16:00 画像のドロップではリンクされている場合リンク先の画像, 保存pathのパス区切り
// @version        2010/04/21 21:35 infoない???
// @version        2010/04/21 17:50 xulエレメントは何もしないように
// @version        2010/04/21 17:50 インプットテキストエリアへのドロップができなくなっていた
// @version        2010/04/21 12:50 unload処理
// @version        2010/04/21 01:04 テキスト...が壊れていた
// @version        2010/04/21 01:03 複数の外部ファイルのtype=file へのドロップ動供くように
// @version        2010/04/21 01:02 複数の外部ファイルのドロップ動供くように
// @version        2010/04/21 01:00  saveFolderModoki.uc.xul連携
// @version        2010/04/21 01:00  Firefox3.7a5pre
// @version        2009/12/15 17:00 Fx3.6 and more
// @version        2007/08/04 20:00
// @LICENSE        MPL 1.1/GPL 2.0/LGPL 2.1
if (typeof Cc != 'object' ) { var Cc = Components.classes;}
if (typeof Ci != 'object' ) { var Ci = Components.interfaces;}
if (typeof Cr != 'object' ) { var Cr = Components.results;}
//////////// Drag and Dorp bserver: replace contentAreaDNDObserver with it. ///////////////////
var DragNGo = {
  // dir     :'UDLR',
  // modifier:'shift,ctrl,alt', //altは文字列の選択になるので実質使えない
  // name    :'hoge'
  // obj     :'link, textlink, text, image, file' ドロップの対象
  // cmd     :function(self, event, info) {} /* info:{urls:[], texts:[], nodes:[], files:[], fname:[]}*/
  //          urls:link,image,fileおよびtextlinkのurlを格納
  //          texts:linkのリンクテキストやalt文字, imageのtitle,alt文字, textはRESTRICT_SELECTED_TEXTによる
  //          nodes:ドロップしたDOMノード
  //          fname:linkやimageのファイル名の候補, textはRESTRICT_SELECTED_TEXTによる
  //
  RESTRICT_SELECTED_TEXT: true, //textは選択文字列のみ:true, ドロップした文字列(リンク等はurl):false

  GESTURES: [
  /*=== From Foreign data ===*/
    {dir:'', modifier:'',name:'Fireパス記入',obj:'file'},
    {dir:'', modifier:'',name:'xpi/jarインストール',obj:'file'},
    /*{dir:'', modifier:'',name:'新しいタブ前面に開く',obj:'file',cmd:function(self,event,info){self.openUrls(info.urls, 'tab', null);}},//Google doc などでdrag drop uploadができなくなる*/
    {dir:'', modifier:'',name:'新しいタブ前面に開く',obj:'link, textlink',cmd:function(self,event,info){self.openUrls(info.urls, 'tab', null);}},
    {dir:'', modifier:'',name:'新しいタブでGoogle検索',obj:'text',cmd:function(self,event,info){self.searchWithEngine(info.texts, ['Google'], 'tab');}},

  /*=== リンク ===*/
    {dir:'U', modifier:'',name:'xpi/jarインストール',obj:'xpi,jar',cmd:function(self,event,info){self.installXpi(info.urls);}},
    {dir:'U', modifier:'',name:'リンクを新しいタブ前面に開く',obj:'link, textlink',cmd:function(self,event,info){self.openUrls(info.urls, 'tab', null);}},
    //{dir:'D', modifier:'',name:'リンクを新しいタブ後面に開く',obj:'link, textlink',cmd:function(self,event,info){self.openUrls(info.urls, 'tabshifted', null);}},
    {dir:'D', modifier:'',name:'リンクを新しいタブでaguse.jp検索',obj:'link, textlink',cmd:function(self,event,info){self.searchWithEngine(info.urls, ['aguse.jp'], 'tab');}},
    {dir:'L', modifier:'',name:'リンクを現在のタブ開く',obj:'link, textlink',cmd:function(self,event,info){self.openUrls(info.urls, 'current', null);}},

  /*=== 画像 ===*/
    {dir:'U', modifier:'',name:'画像を新しいタブ前面に開く',obj:'image',cmd:function(self,event,info){self.openUrls(info.urls, 'tab', null);}},
    {dir:'D', modifier:'',name:'画像を新しいタブ後面に開く',obj:'image',cmd:function(self,event,info){self.openUrls(info.urls, 'tabshifted', null);}},
    {dir:'L', modifier:'',name:'画像を現在のタブに開く',obj:'image',cmd:function(self,event,info){self.openUrls(info.urls, 'current', null);}},

  /*=== Web Search ===*/
    {dir:'R', modifier:'',name:'テキストをConQueryで検索',obj:'text',cmd:function(self,event,info){self.openConQueryPopup(event);}},
    {dir:'UL', modifier:'',name:'テキストを現在のタブでgooウェブ検索(Green Label)',obj:'link, text',cmd:function(self,event,info){self.searchWithEngine(info.texts, ['gooウェブ検索(Green Label)'], 'current');}},
    {dir:'U', modifier:'',name:'テキストを新しいタブでGoogle検索',obj:'text',cmd:function(self,event,info){self.searchWithEngine(info.texts, ['Google'], 'tab');}},
    {dir:'D', modifier:'',name:'テキストを現在のタブでGoogle検索',obj:'text',cmd:function(self,event,info){self.searchWithEngine(info.texts, ['Google'], 'current');}},
    {dir:'DL', modifier:'',name:'リンクテキストを新しいタブでGoogle検索',obj:'link',cmd:function(self,event,info){self.searchWithEngine(info.texts, ['Google'], 'tab');}},
    {dir:'UL', modifier:'',name:'テキストを新しいタブでAmazon.com検索',obj:'link, text',cmd:function(self,event,info){self.searchWithEngine(info.texts, ['Amazon.com'], 'tab');}},
    {dir:'UR', modifier:'',name:'テキストを新しいタブでYahoo! JAPAN検索',obj:'link, text',cmd:function(self,event,info){self.searchWithEngine(info.texts, ['Yahoo! JAPAN'], 'tab');}},

  /*=== ページ内検索 ===*/
    {dir:'L', modifier:'',name:'テキストをページ内検索',obj:'link, text',cmd:function(self,event,info){self.findWord(info.texts[0]);}},

  /*=== クリップボード ===*/
    {dir:'UD', modifier:'',name:'リンクurl/テキストをクリップボードにコピー',obj:'text',cmd:function(self,event,info){Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(info.texts[0]);}},
    {dir:'LR', modifier:'',name:'リンクテキスト/テキストをクリップボードにコピー',obj:'link, text',cmd:function(self,event,info){Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(info.texts[0]);}},
    {dir:'UDU', modifier:'',name:'URLをクリップボードにコピー',obj:'link',cmd:function(self,event,info){Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(info.urls[0]);}},
    {dir:'DR', modifier:'',name:'テキストを検索バーにコピー',obj:'link, text',cmd:function(self,event,info){self.copyToSearchBar(info.texts[0].replace(/\n/mg,' '));}},
    {dir:'DR', modifier:'ctrl',name:'テキストを検索バーに追加コピー',obj:'link, text',cmd:function(self,event,info){self.appendToSearchBar(info.texts[0].replace(/\n/mg,' '));}},

  /*=== 保存 ===*/
    {dir:'RU', modifier:'',name:'リンク/画像をSaveFileModoki(SF)で保存',obj:'image, link',cmd:function(self,event){self.openSaveFileModokiPopup(event);}},
/*
    {dir:'RD', modifier:'',name:'画像をD:/hogeに保存(SF)',obj:'image',cmd:function(self,event,info){if('saveFolderModoki' in window){saveFolderModoki.saveLink(info.urls[0], info.texts[0], 'D:\\hoge');}else{ self.saveLinkToLocal(info.urls[0],info.fname[0],'D:/hoge', true);}}},
    {dir:'RD', modifier:'',name:'リンクをD:/に保存(SF)',obj:'link',cmd:function(self,event,info){if('saveFolderModoki' in window){saveFolderModoki.saveLink(info.urls[0], info.texts[0], 'D:\\');}else{ self.saveLinkToLocal(info.urls[0],info.fname[0],'D:/', false);}}},
*/
    {dir:'RD', modifier:'',name:'画像を名前を受けて保存'  ,obj:'image',cmd:function(self,event,info){self.saveAs(info.urls[0], info.fname[0]);}},
    {dir:'RD', modifier:'',name:'リンクを名前を受けて保存',obj:'link' ,cmd:function(self,event,info){self.saveAs(info.urls[0], info.fname[0]);}},

  /*=== appPathをparamsで開く, paramsはtxtで置き換えcharsetに変換される ===*/
    {dir:'U', modifier:'shift,ctrl',name:'リンクをInternet Explorerで開く',obj:'link',cmd:function(self,event,info){self.launch(info.urls[0], "C:\\Program Files\\Internet Explorer\\iexplore.exe",["%%URL%%"],"Shift_JIS");}},
    {dir:'R', modifier:'shift,ctrl',name:'テキストをDDwinで開く',obj:'text',cmd:function(self,event,info){self.launch(info.texts[0], "c:\\Program Files\\DDwin\\ddwin.exe", [",2,,G1,%%SEL%%"], "Shift_JIS");}},

  /*=== Utility ===*/
    {dir:'RDR', modifier:'',name:'Eijiro',obj:'text',cmd:function(){var TERM=getBrowserSelection().toString();var URL="http://eow.alc.co.jp/"+TERM+"/UTF-8/";if(TERM)gBrowser.loadOneTab(URL,null,null,null,false,false);}},
    {dir:'RDRD', modifier:'',name:'Excite で英和',obj:'text', /*要popupTranslate.uc.xul*/
      cmd:function(self,event,info){
        var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
                 createInstance(Ci.nsIScriptableUnicodeConverter);
        UI.charset = "UTF-8";

        var text = info.texts[0];
        var engine = popupTranslate.selectEngineByDescription(UI.ConvertToUnicode("Excite 英日"));
        if (engine)
          popupTranslate.getTranslateResult(text, engine, null);
      }
    },
    {dir:'RLU', modifier:'',name:'選択テキスト(プロンプト)を指定ドメイン内で検索',obj:'link, text',
      cmd:function(self,event,info){
        var _document=document.commandDispatcher.focusedWindow.document;
        var p = prompt('Input word to search under the domain('+_document.location.hostname+'):', info.texts[0]);
        if(p)
          _document.location.href = 'http://www.google.com/search?as_qdr=y15&q=site:' +
                                    _document.location.href.split('/')[2] + 
                                    ' '+encodeURIComponent(p);
      }
    },
    {dir:'UDUD', modifier:'',name:'選択範囲をテキストファイルとして保存',obj:'text',
      cmd:function(self){
        // 選択範囲をテキストファイルとして保存する。
        var _window = document.commandDispatcher.focusedWindow;
        var sel = _window.getSelection();
        if (sel && !sel.isCollapsed) {
          var fname = _window.location.href.match(/[^\/]+$/) + '.txt';
          fname = decodeURIComponent(fname);
          fname = fname.replace(/[\*\:\?\"\|\/\\<>]/g, '_');
          self.saveTextToLocal(sel.toString(), fname, false);
        } else {
          alert('No Selection!');
        }
      }
    },
  ], // ~GESTURES





  RESET_GESTURE: "RDLU",


  dataRegExp     : /^\s*(.*)\s*$/m,
  mdataRegExp    : /(^\s*(.*)\s*\n?)*$/m,
  linkRegExp     : /(((h?t)?tps?|h..ps?|ftp|((\uff48)?\uff54)?\uff54\uff50(\uff53)?|\uff48..\uff50(\uff53)?|\uff46\uff54\uff50)(:\/\/|\uff1a\/\/|:\uff0f\uff0f|\uff1a\uff0f\uff0f)[-_.!~*'()|a-zA-Z0-9;:\/?,@&=+$%#\[\]\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff08\uff09\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff1a\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]*[-_.!~*)|a-zA-Z0-9;:\/?@&=+$%#\[\]\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]+)/i,
  localLinkRegExp: /(file|localhost):\/\/.+/i,
  currentRegExp  : /^\s*(data:|\(?javascript:)/i,
  xpiLinkRegExp  : /(.+)\.(xpi|jar)$/i,
  imageLinkRegExp: /(.+)\.(png|jpg|jpeg|gif|bmp)$/i,

  get ioService() {
    delete this.ioService;
    return this.ioService = Cc["@mozilla.org/network/io-service;1"]
                            .getService(Ci.nsIIOService);
  },

  get fileHandler() {
    delete this.fileHandler;
    return this.fileHandler = this.ioService.getProtocolHandler("file")
                              .QueryInterface(Ci.nsIFileProtocolHandler);
  },

  //appPathをparamsで開く, paramsはtxtで置き換えcharsetに変換される
  launch: function launch(txt, appPath, params, charset){
    var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
          createInstance(Ci.nsIScriptableUnicodeConverter);
    UI.charset = charset;

    var appfile = Cc['@mozilla.org/file/local;1']
                    .createInstance(Ci.nsILocalFile);
    appfile.initWithPath(decodeURIComponent(escape(appPath)));
    if (!appfile.exists()){
      alert("Executable does not exist.");
      return;
    }
    var process = Cc['@mozilla.org/process/util;1']
                  .createInstance(Ci.nsIProcess);

    var args = new Array();
    for(var i=0,len=params.length;i<len;i++){
      if(params[i]){
        args.push(UI.ConvertFromUnicode(params[i].replace(/%%URL%%/i,txt).replace(/%%SEL%%/i,txt)));
      }
    }
    process.init(appfile);
    process.run(false, args, args.length, {});
  },

  //選択文字列を得る
  get selection() {
    var targetWindow = this.focusedWindow;
    var sel = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow);
    if (sel && !sel.toString()) {
      var node = document.commandDispatcher.focusedElement;
      if (node &&
          ((typeof node.mozIsTextField == 'function' && node.mozIsTextField(true)) ||
           node.type == "search" ||
           node.type == "text" || node.type == "textarea") &&
          'selectionStart' in node &&
          node.selectionStart != node.selectionEnd) {
        var offsetStart = Math.min(node.selectionStart, node.selectionEnd);
        var offsetEnd  = Math.max(node.selectionStart, node.selectionEnd);
        return node.value.substr(offsetStart, offsetEnd-offsetStart);
      }
    }
    return sel ?
      sel.toString() : "";
  },

  //現在のウインドウを得る
  get focusedWindow() {
    var win = document.commandDispatcher.focusedWindow;
    if (!win || win == window)
      win = window.content;
    return win;
  },


  //検索バーを得る
  get searchbar() {
    return document.getElementById('searchbar');
  },

  //検索エンジン名から検索エンジンを得る
  getEngineByName: function getEngineByName(aEngineName){
    const UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
          createInstance(Ci.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    const nsIBSS = Ci.nsIBrowserSearchService;
    const searchService = Cc["@mozilla.org/browser/search-service;1"].getService(nsIBSS);
    if (aEngineName.toUpperCase() == "CURRENT"){
      var searchbar = this.searchbar;
      if (searchbar) return searchbar.currentEngine;
    } else {
      try {aEngineName = UI.ConvertToUnicode(aEngineName)}catch(e){}
      var engine = searchService.getEngineByName(aEngineName);
      if (engine) return engine;
    }
    //Default
    return searchService.defaultEngine;
  },

  searchWithEngine: function searchWithEngine(texts, engines, where, addHistoryEntry){
    var text = texts[0];
    for (var i = 0; i < engines.length; i++) {
      var engine = this.getEngineByName(engines[i]);
      var submission = engine.getSubmission(text, null);
      if (!submission)
        return false;
      var url = submission.uri.spec;
      if (/tab|window/.test(where) && (
          isTabEmpty(gBrowser.selectedTab) ||
          this.currentRegExp.test(url)))
        where = 'current';
      switch (where) {
        case 'tab':
        case 'tabshifted':
          var loadInBackground = getBoolPref("browser.tabs.loadInBackground");
          if (loadInBackground) {
            if (where == 'tabshifted')
               where = 'tab';
            else if (where == 'tab') 
              where = 'tabshifted'
          }
          if ("TreeStyleTabService" in window)
            TreeStyleTabService.readyToOpenChildTab(gBrowser.selectedTab, false);
        case 'current':
        case 'window':
          openLinkIn(submission.uri.spec,
                     where,
                     {
                      fromChrome:false,
                      allowThirdPartyFixup:false,
                      postData:submission.postData,
                      charset:null,
                      referrerURI:null,
                      relatedToCurrent:true
                     }
                    );
          break;
      }
      where = 'tabshifted';
    }
    // 検索履歴に残す
    if (addHistoryEntry)
      this.searchbardispatchEvent(text);
    return true;
  },

  //検索バーにテキストをコピー
  copyToSearchBar: function copyToSearchBar(searchText){
    var searchbar = this.searchbar;
    if (!searchbar)
      return;
    searchbar.value = searchText;
  },

  //検索バーにテキストを追加コピー
  appendToSearchBar: function appendToSearchBar(searchText){
    var searchbar = this.searchbar;
    if (!searchbar)
      return;
    searchbar.value += (searchbar.value ? " " : "") + searchText;
  },

  //検索バーにテキストをコピー, 疑似イベント発行
  searchBardispatchEvent: function searchBardispatchEvent(searchText){
    this.copyToSearchBar(searchText);

    var event = document.createEvent("UIEvents");
    event.initUIEvent("input", true, true, window, 0);
    searchbar.dispatchEvent(event);
    if (searchText) {
      searchbar._textbox._formHistSvc
        .addEntry(searchbar._textbox.getAttribute("autocompletesearchparam"),
                  searchText);
    }
  },

  openUrls: function openUrls(urls, where, referrer) {
    var self = this;
    var doc = null;
    if (referrer)
      doc = content.document;
    urls.forEach(function(url){
      if (/tab|window/.test(where) && (
          isTabEmpty(gBrowser.selectedTab) ||
          self.currentRegExp.test(url)))
        where = 'current';
      switch (where) {
        case 'tab':
        case 'tabshifted':
          var loadInBackground = getBoolPref("browser.tabs.loadInBackground");
          if (loadInBackground) {
            if (where == 'tabshifted')
               where = 'tab';
            else if (where == 'tab') 
              where = 'tabshifted'
          }
          if ("TreeStyleTabService" in window)
            TreeStyleTabService.readyToOpenChildTab(gBrowser.selectedTab, false);
        case 'current':
        case 'window':
          openLinkIn(url,
                     where,
                     {
                      fromChrome:false,
                      allowThirdPartyFixup:false,
                      postData:null,
                      charset:null,
                      referrerURI:referrer,
                      relatedToCurrent:true
                     }
                    );
          break;
      }
      where = 'tabshifted';
    });
    return true;
  },

  openSaveFileModokiPopup : function openSaveFileModokiPopup(event) {
    if (typeof saveFolderModoki !='undefined')
      saveFolderModoki.showHotMenu(event.screenX, event.screenY);
  },

  openConQueryPopup: function openConQueryPopup(event) {
    if (typeof cqrShowHotmenu !='undefined')
      cqrShowHotmenu(null, event.screenX, event.screenY);
  },

  //ページ内検索
  findWord: function findWords(word){
    var findbar = (typeof gFindBar != 'undefied')
                   ? gFindBar
                   :document.getElementById('FindToolbar')
    if ('onFindAgainCommand' in findbar){ //fx3
      if(findbar.hidden)
        findbar.onFindCommand();
      findbar._findField.value = word;
      var event = document.createEvent("UIEvents");
      event.initUIEvent("input", true, false, window, 0);
      findbar._findField.dispatchEvent(event);
    }
  },

  browser_download_useDownloadDir : true,
  browser_download_folderList : 0,
  browser_download_dir : "",

  setDownloadFolderPath: function(path, skipPrompt) {
    this.browser_download_useDownloadDir = this.getPref('browser.download.useDownloadDir', 'bool', true);
    this.browser_download_folderList = this.getPref('browser.download.folderList', 'int', 0);
    this.browser_download_dir = this.getPref('browser.download.dir', 'str', '');

    this.setPref('browser.download.useDownloadDir', 'bool', !skipPrompt);
    this.setPref('browser.download.folderList', 'int', 2);
    if(window.navigator.platform.toLowerCase().indexOf('win')>-1)
      path = path.replace(/\//g, '\\');
    this.setPref('browser.download.dir', 'str', path);
  },

  restoreDownloadFolderPath: function() {
    this.setPref('browser.download.useDownloadDir', 'bool', this.browser_download_useDownloadDir);
    this.setPref('browser.download.folderList', 'int', this.browser_download_folderList);
    this.setPref('browser.download.dir', 'str', this.browser_download_dir);
  },

  saveLinkToLocal: function saveLinkToLocal(url, fname, fpath, skipPrompt) {
    var  dir = null;
    if (!!fpath) {
      this.setDownloadFolderPath(fpath, skipPrompt);
      var dnldMgr = Cc["@mozilla.org/download-manager;1"]
                    .getService(Ci.nsIDownloadManager);
      dir = dnldMgr.userDownloadsDirectory;
      this.restoreDownloadFolderPath();
    }

    var file = null;
    if (!skipPrompt) {
      var nsIFilePicker = Ci.nsIFilePicker;
      var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
      fp.init(this.focusedWindow, "Select a File", nsIFilePicker.modeSave);
      fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterImages);
      fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterHTML);
      if (dir)
        fp.displayDirectory = dir;
      fp.defaultString = fname;
      switch (fp.show()) {
        case (nsIFilePicker.returnOK):
        case (nsIFilePicker.returnReplace):
          file = fp.file;
          break;
        case (nsIFilePicker.returnCancel):
        default:
          return null;
      }
    } else {
      file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      fpath = (/\/$/.test(fpath)) ? fpath+fname :fpath+'/'+fname;
      if(window.navigator.platform.toLowerCase().indexOf('win')>-1)
        fpath = fpath.replace(/\//g, '\\');
      file.initWithPath(fpath);
    }

    var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                        .createInstance(Ci.nsIWebBrowserPersist);
    var nsIWBPersist = Ci.nsIWebBrowserPersist;
    persist.persistFlags = nsIWBPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES
                        | nsIWBPersist.PERSIST_FLAGS_FROM_CACHE;

    var uri = Cc['@mozilla.org/network/io-service;1']
            .getService(Ci.nsIIOService).newURI(url, null, null);

    try {
      //saveURL(url, fpath, null, false, skipPrompt, null);
      persist.saveURI( uri, null, null, null, "", file);
    } catch (ex) {
      alert('failed:\n' + ex);
      file = null;
    }

    return file; // nsILocalFileObject or null
  },

  saveTextToLocal: function saveTextToLocal(text, fpath, skipPrompt) {
    var  dir = null;
    if (!!fpath) {
      this.setDownloadFolderPath(fpath, skipPrompt);
      var dnldMgr = Cc["@mozilla.org/download-manager;1"]
                    .getService(Ci.nsIDownloadManager);
      dir = dnldMgr.userDownloadsDirectory;
      this.restoreDownloadFolderPath();
    }

    var file = null;
    if (!skipPrompt) {
      var nsIFilePicker = Ci.nsIFilePicker;
      var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
      fp.init(this.focusedWindow, "Select a File", nsIFilePicker.modeSave);
      fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterImages);
      fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
      if (dir)
        fp.displayDirectory = dir;
      fp.defaultString = fpath;
      switch (fp.show()) {
        case (nsIFilePicker.returnOK):
        case (nsIFilePicker.returnReplace):
          file = fp.file;
          break;
        case (nsIFilePicker.returnCancel):
        default:
          return null;
      }
    } else {
      file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      fpath = (/\/$/.test(fpath)) ? fpath+fname :fpath+'/'+fname;
      if(window.navigator.platform.toLowerCase().indexOf('win')>-1)
        fpath = fpath.replace(/\//g, '\\');
      file.initWithPath(fpath);
    }
    var strm = Cc["@mozilla.org/network/file-output-stream;1"]
                 .createInstance(Ci.nsIFileOutputStream);
    var convert = Cc['@mozilla.org/intl/scriptableunicodeconverter']
          .getService(Ci.nsIScriptableUnicodeConverter);
    convert.charset = "UTF-8";
    text = convert.ConvertFromUnicode(text);
    try {
      strm.init(file, 0x02 | 0x08 | 0x20, parseInt(664, 8), 0); // write, create, truncate
      strm.write(text, text.length);
      strm.flush();
    } catch (ex) {
      alert('failed:\n' + ex);
      file = null;
    }
    strm.close();

    return file; // nsILocalFileObject or null
  },

  saveAs: function(aURL, aFileName, aReferrer){
    var contentType = this.getContentType(aURL);
    if (this.imageLinkRegExp.test(aURL) || /^image\//i.test(contentType)){
      if (/^data:/.test(aURL))
        saveImageURL(aURL, "index.png", null, true, false, aReferrer );
      else
        saveImageURL(aURL, null, null, false, false, aReferrer );
    }else{
      this.saveURL(aURL, aFileName, null, true, false, aReferrer );
    }
  },

  //urlを名前を付けて保存
  saveURL: function saveURL(aURL, aFileName, aFilePickerTitleKey, aShouldBypassCache,
                 aSkipPrompt, aReferrer){
    window.saveURL(aURL, aFileName, aFilePickerTitleKey, aShouldBypassCache,
                 aSkipPrompt, aReferrer)
  },

  //aURLのcontentTypeをキャッシュから得る
  getContentType: function(aURL){
    var contentType = null;
    //var contentDisposition = null;
    try {
      var imageCache = Cc["@mozilla.org/image/cache;1"].getService(imgICache);
      var props =
        imageCache.findEntryProperties(makeURI(aURL, getCharsetforSave(null)));
      if (props) {
        contentType = props.get("type", nsISupportsCString);
        //contentDisposition = props.get("content-disposition", nsISupportsCString);
      }
    } catch (e) {
      // Failure to get type and content-disposition off the image is non-fatal
    }
    return contentType;
  },

  //appPathをparamsで開く, paramsはtxtで置き換えcharsetに変換される
  launch: function launch(txt, appPath,params,charset){
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
          createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = charset;

    var appfile = Components.classes['@mozilla.org/file/local;1']
                    .createInstance(Components.interfaces.nsILocalFile);
    appfile.initWithPath(decodeURIComponent(escape(appPath)));
    if (!appfile.exists()){
      alert("Executable does not exist.");
      return;
    }
    var process = Components.classes['@mozilla.org/process/util;1']
                  .createInstance(Components.interfaces.nsIProcess);

    var args = new Array();
    for(var i=0,len=params.length;i<len;i++){
      if(params[i]){
        args.push(UI.ConvertFromUnicode(params[i].replace(/%%URL%%/i,txt).replace(/%%SEL%%/i,txt)));
      }
    }
    process.init(appfile);
    process.run(false, args, args.length, {});
  },

  //ファイルのパスをインプットフィールドに記入
  putMultipleFilePath: function putMultipleFilePath(inputElement, URLs) {
    var self = this;
    var multiFile = [];
    URLs.forEach(function(url) {
      var path = self.fileHandler.getFileFromURLSpec(url).path;
      // 重複チェック
      var flg = false;
      for (var j = 0; j < multiFile.length; j++) {
        if (multiFile[j] == path)
          flg = true;
      }
      if (!flg)
        multiFile.push(path);
    });
    inputElement.mozSetFileNameArray(multiFile, multiFile.length);
  },

  putFilePath: function putFilePath(inputElement, url){
    var aFile = this.fileHandler.getFileFromURLSpec(url);
    if ("mozSetFileNameArray" in inputElement)
      inputElement.mozSetFileNameArray([aFile.path], 1);
    else
      inputElement.value = aFile.path;
  },

  //Xpiのインストール
  installXpi: function installXpi(URLs){
    var self = this;
    if (typeof InstallTrigger != 'undefined') {
      var xpinstallObj = {};
      URLs.forEach(function(url){
        url = self.getDroppedURL_Fixup(url);
        if (url && self.xpiLinkRegExp.test(url)){
          var name =url.match(self.xpiLinkRegExp)[1] || url;
          xpinstallObj[name] = url;
        }
      });
      InstallTrigger.install(xpinstallObj);
    } else {
      // xxx Firefox4.0b5pre
      var pos = 0;
      var installs = [];

      function buildNextInstall() {
          if (pos == URLs.length) {
              if (installs.length > 0) {
                  AddonManager.installAddonsFromWebpage("application/x-xpinstall", this, null, installs);
              }
              return;
          }
          AddonManager.getInstallForURL(URLs[pos++], function (aInstall) {installs.push(aInstall);buildNextInstall();}, "application/x-xpinstall");
      }

      buildNextInstall();
    }
  },

  //URLのfixUP
  getDroppedURL_Fixup: function getDroppedURL_Fixup(url) {
    if(!url) return null;
    if (/^h?.?.p(s?):(.+)$/i.test(url)){
      url = "http" + RegExp.$1 + ':' + RegExp.$2;
      if(!RegExp.$2) return null;
    }
    var URIFixup = Components.classes['@mozilla.org/docshell/urifixup;1']
                 .getService(Components.interfaces.nsIURIFixup);
    try{
      url = URIFixup.createFixupURI(url, URIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP ).spec;
      // valid urls don't contain spaces ' '; if we have a space it
      // isn't a valid url, or if it's a javascript: or data: url,
      // bail out
      if (!url ||
          !url.length ||
           url.indexOf(" ", 0) != -1 ||
           /^\s*javascript:/.test(url) ||
           /^\s*data:/.test(url) && !/^\s*data:image\//.test(url))
        return null;
      return url;
    }catch(e){
      return null;
    }
  },

  //ステータスバーに文字列を表示, timeToClearミリ秒後自動クリア
  setStatusMessage: function setStatusMessage(msg, timeToClear, hideDirectionChain) {
    const UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
          createInstance(Ci.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    var status4ever = document.getElementById("status4evar-status-text");
    if (status4ever) {
      try{
        try {msg = UI.ConvertToUnicode(msg)}catch(e){}
        if(msg!=''){
          status4ever.value = ((!hideDirectionChain)?(this.directionChain + ' : '):'')
                            + msg;
        }else{
          status4ever.value = '';
        }
      }catch(e){
        status4ever.value = '';
      }
      if(this._timer)
        clearTimeout(this._timer);
      this._timer = setTimeout(function(){
        status4ever.value = UI.ConvertToUnicode('');
      }, !timeToClear ? 1500 : timeToClear);
    } else {
      var statusbar = document.getElementById("statusbar-display");
      try{
        try {msg = UI.ConvertToUnicode(msg)}catch(e){}
        if(msg!=''){
          statusbar.label = ((!hideDirectionChain)?(this.directionChain + ' : '):'')
                            + msg;
        }else{
          statusbar.label = '';
        }
      }catch(e){
        statusbar.label = '';
      }
      if(this._timer)
        clearTimeout(this._timer);
      this._timer = setTimeout(function(){
        statusbar.label = UI.ConvertToUnicode('');
      }, !timeToClear ? 1500 : timeToClear);
    }
  },

  //prefを読み込み
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
  //prefを書き込み
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

  // Gather all descendent text under given document node.
  gatherTextUnderButNotAlt: function( root ) {
    var text = "";
    var node = root.firstChild;
    var depth = 1;
    while ( node && depth > 0 ) {
      // See if this node is text.
      if ( node.nodeType == Node.TEXT_NODE ) {
        // Add this text to our collection.
        text += " " + node.data;
      }
      // Find next node to test.
      // First, see if this node has children.
      if ( node.hasChildNodes() ) {
        // Go to first child.
        node = node.firstChild;
        depth++;
      } else {
        // No children, try next sibling.
        if ( node.nextSibling ) {
          node = node.nextSibling;
        } else {
          // Last resort is our next oldest uncle/aunt.
          node = node.parentNode.nextSibling;
          depth--;
        }
      }
    }
    // Strip leading whitespace.
    text = text.replace( /^\s+/, "" );
    // Strip trailing whitespace.
    text = text.replace( /\s+$/, "" );
    // Compress remaining whitespace.
    text = text.replace( /\s+/g, " " );
    return text;
  },

  getVer: function(){
    var info = Cc["@mozilla.org/xre/app-info;1"]
               .getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  },

  getElementsByXPath: function getNodesFromXPath(aXPath, aContextNode) {
    const XULNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
    const XHTMLNS = 'http://www.w3.org/1999/xhtml';
    const XLinkNS = 'http://www.w3.org/1999/xlink';

    // 引数の型チェック。
    if (aXPath) {
      aXPath = String(aXPath);
    }
    else {
      throw 'ERROR: blank XPath expression';
    }
    if (aContextNode) {
      try {
        if (!(aContextNode instanceof Node))
          throw '';
      }
      catch(e) {
        throw 'ERROR: invalid context node';
      }
    }

    const xmlDoc  = aContextNode ? aContextNode.ownerDocument : document ;
    const context = aContextNode || xmlDoc.documentElement;
    const type    = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
    const resolver = {
      lookupNamespaceURI : function(aPrefix)
      {
        switch (aPrefix)
        {
          case 'xul':
            return XULNS;
          case 'html':
          case 'xhtml':
            return XHTMLNS;
          case 'xlink':
            return XLinkNS;
          default:
            return '';
        }
      }
    };

    try {
      var expression = xmlDoc.createExpression(aXPath, resolver);
      var result = expression.evaluate(context, type, null);
    }
    catch(e) {
      return {
        snapshotLength : 0,
        snapshotItem : function()
        {
          return null;
        }
      };
    }
    var arr = [];
    for (let i = 0; i < result.snapshotLength; i++) {
      arr.push(result.snapshotItem(i));
    }

    return arr;
  },

  isParentEditableNode: function isParentEditableNode(node){
    //if (Components.lookupMethod(node.ownerDocument, 'designMode').call(node.ownerDocument) == 'on')
    //  return node;
    while (node && node.parentNode) {
      try {
        node.QueryInterface(Ci.nsIDOMNSEditableElement);
        if (!node.hasOwnProperty("type") || node.type != "file")
          return node;
      }
      catch(e) {
      }
      if (/input|textarea/.test(node.localName))
        return node;
      if (node.isContentEditable || node.contentEditable=='true')
        return node;
      node = node.parentNode;
    }
    return null;
  },

  // ファイルのドロップ処理
  // 処理するならtrue, しないならfalseを返す
  cmdFiles: function cmdFiles(event) {
    var dragService = Cc["@mozilla.org/widget/dragservice;1"]
                      .getService(Ci.nsIDragService);
    var dragSession = dragService.getCurrentSession();
    var sourceNode = dragSession.sourceNode;
    var target = event.target;

    var urls = [];
    var flavours = ["application/x-moz-file"];
    // fileか?
    if (flavours.some(function(type){return event.dataTransfer.types.contains(type);})) {
      // Setup a transfer item to retrieve the file data
      var trans = Cc["@mozilla.org/widget/transferable;1"]
                  .createInstance(Ci.nsITransferable);
      flavours.forEach(function (flavour) {
        trans.addDataFlavor(flavour);
      });
      for (var i = 0; i < dragSession.numDropItems; i++) {
        var uri = null;
        dragSession.getData(trans, i);
        var flavor = {}, data = {}, length = {};
        trans.getAnyTransferData(flavor, data, length);
        if (data) {
          var file = data.value.QueryInterface(Ci.nsIFile);
          if (file)
            uri = this.ioService.newFileURI(file);
        }
        //if (uri && this.dragDropSecurityCheck(event, dragSession, uri.spec))
          urls.push(uri.spec);
      }
    }
    if (urls.length < 0)
      return false;;

    var inputElement = null;
    try {
      inputElement = target.ownerDocument.elementFromPoint(event.clientX, event.clientY);
    } catch(e) {
      inputElement = target;
    }
    if (inputElement instanceof HTMLInputElement && inputElement.type == 'file') {
      if (/drop/.test(event.type)) {
        if (this.getVer >= 7) {
          dragSession.canDrop = true;
        } else {
          if (inputElement.hasAttribute("multiple") &&
              typeof inputElement.mozSetFileNameArray =="function") {
            this.putMultipleFilePath(inputElement, urls);
          } else {
            this.putFilePath(inputElement, urls[0]);
          }
        }
        event.preventDefault();
        return true;
      } else {
        this.setStatusMessage('パスを記入', 0, true);
        dragSession.canDrop = true;
        event.preventDefault();
        return true;
      }
    } else if (this.xpiLinkRegExp.test(urls[0])) {
      if (/drop/.test(event.type)) {
        this.installXpi(urls);
        event.preventDefault();
        return true;
      } else {
        this.setStatusMessage('xpiやjarのインストール', 0, true);
        dragSession.canDrop = true;
        event.preventDefault();
        return true;
      }
    }

    return false;
  },

  // リンクや画像のリンクからファイル名にする文字列を得る
  // hrefまたはsrc属性のパスを返す
  // 上記以外のとき, リンクテキストまたはtitle,alt属性の文字列を返す
  //
  candidateFname : function(target, url) {
    if (!target){
      var text = url;
      if (!text || text && !(text.match(/\S/))) {
        if(text.match(/.*\/(.+)$/)) text = RegExp.$1;
      }
      return text.replace(/[\\\/:\*\?"<>\|]/g,' '); //"
    }

    var text = gatherTextUnder( target );
    if (!text || text && !text.match(/\S/)) {
      text = target.getAttribute("title");
      if (!text || !text.match(/\S/)) {
        if (target.hasAttribute("alt")){
          text = target.getAttribute("alt");
          //fx3
          if(!!text && text.match(/.*\/(.+)$/)) text = RegExp.$1;
        }

        if (!text || !text.match(/\S/)) {
          if(target.hasAttribute("href")) text = target.href;
          if(target.hasAttribute("src")) text = target.src;
          if(text.match(/.*\/(.+)$/)) text = RegExp.$1;
        }
      }
    }
    return text.replace(/[\\\/:\*\?"<>\|]/g,' '); //"
  },








  lastX : -1,
  lastY : -1,
  directionChain : "",

  // D&Dの方向を得る
  getDirection: function getDirection(event){
    // 認識する最小のマウスの動き
    const tolerance = 10;
    var x = event.screenX;
    var y = event.screenY;

    if (this.lastX < 0) {
        this.lastX = x;
        this.lastY = y;
        return this.directionChain;
    }

    // 直前の座標と比較, 移動距離が極小のときは無視する
    var distanceX = Math.abs(x - this.lastX);
    var distanceY = Math.abs(y - this.lastY);
    if (distanceX < tolerance && distanceY < tolerance)
      return this.directionChain;

    // 方向の決定
    var direction;
    if (distanceX > distanceY*2)
        direction = x < this.lastX ? "L" : "R";
    else if (distanceX*2 < distanceY)
        direction = y < this.lastY ? "U" : "D";
    else {
        this.lastX = x;
        this.lastY = y;
        return this.directionChain;
    }
    // 前回の方向と比較して異なる場合はdirectionChainに方向を追加
    var lastDirection = this.directionChain.charAt(this.directionChain.length - 1);
    if (direction != lastDirection) {
      this.directionChain += direction;
    }
    // 今回の位置を保存
    this.lastX = x;
    this.lastY = y;

    //directionChainの最後が RDLU ならdirectionChainをリセットする
    if(new RegExp('.+' + this.RESET_GESTURE,'').test(this.directionChain)) {
      this.directionChain ='';
      this.setStatusMessage('', 0);
      return this.directionChain;
    }

    return this.directionChain;
  },

  dragstart: function dragstart(event){
    // 座標を初期化
    this.lastX = event.screenX;
    this.lastY = event.screenY;
    // ドラッグ方向を初期化
    this.directionChain = "";

    // 転送データをセットする
    if (event.originalTarget instanceof HTMLImageElement) {
      event.dataTransfer.mozSetDataAt("application/x-moz-node", event.originalTarget , 0);
      event.dataTransfer.mozSetDataAt("text/x-moz-url", event.originalTarget.src+"\n"+event.originalTarget.src ,0);
      event.dataTransfer.mozSetDataAt("text/uri-list", event.originalTarget.src ,0);
      event.dataTransfer.mozSetDataAt("text/plain", event.originalTarget.src ,0);
    }
    // xxx Bug 475045 Can't drag unlinkified URL to bookmarks toolbar (regression from Firefox 3)
    if (event.originalTarget instanceof Text) {
      var targetWindow = event.originalTarget.ownerDocument.defaultView;
      var str = targetWindow.getSelection().toString();
      str = str.match(new RegExp(this.linkRegExp.source, "ig"));
      if (str) {
        arr = str.toString().split(",");
        var j = 0;
        for (var i = 0; i < arr.length; i++){
          if (!arr[i])
            continue;
          if (arr[i].match(this.linkRegExp)) {
            try {
              uri = makeURI(RegExp.$1);
              event.dataTransfer.mozSetDataAt("text/x-moz-url", uri.spec + "\n" + uri.spec, j);
              j++;
            } catch (ex) {}
          }
        }
      }
    }
    // xxx Bug 703514 - can't drag bookmarklet to toolbar  (regression from Firefox 4)
    if (event.originalTarget instanceof HTMLAnchorElement) {
      var href = event.originalTarget.href;
      if (/^javascript:/.test(href)) {
        var str = gatherTextUnder(event.originalTarget);
        event.dataTransfer.mozSetDataAt("text/x-moz-url", href + "\n" + str, 0);
      }
    }
  },

  getSupportedFlavoursForNode: function (node){
    if (node instanceof HTMLInputElement && node.type == "file") {
      return ["application/x-moz-file"];
    } else if (node instanceof HTMLInputElement && node.type == "text" ||
               node instanceof HTMLTextAreaElement) {
      return ["text/uri-list",
              "text/html",
              "text/plain"];
    } else {
      return ["application/x-moz-node",
              "text/x-moz-url",
              "text/uri-list",
              "text/html",
              "text/plain"];
    }
  },

  // キーチェック
  keyCheck: function keyCheck(event, GESTURES) {
    var keys = GESTURES.modifier.replace(/\s+/g,'').toLowerCase().split(',');
    var flg = 0
    if (event.altKey)
      flg += 1;
    if (event.shiftKey)
      flg += 2;
    if (event.ctrlKey || event.metaKey)
      flg += 4;
    var flg1 = 0;
    for (var i = 0; i < keys.length; i++) {
      switch(keys[i]) {
      case 'alt':
       flg1 += 1;
       break;
      case 'shift':
       flg1 += 2;
       break;
      case 'ctrl':
       flg1 += 4;
       break;
      }
    }
    return (flg == flg1);
  },

  dragover: function dragover(event) {
    var self = this;
    var dragService = Cc["@mozilla.org/widget/dragservice;1"]
                      .getService(Ci.nsIDragService);
    var dragSession = dragService.getCurrentSession();
    var sourceNode = dragSession.sourceNode;
    var target = event.target;
    var info;
    // 4.0
    if (gBrowser.currentURI.spec == "about:addons"){
      return;
    }

    // タブ
    if (sourceNode instanceof XULElement)
      return;

    // D&Dの方向
    var direction = this.getDirection(event);

    // 対象flavourか?
    var flavours = this.getSupportedFlavoursForNode(target);
    var supported = flavours.some(function(type) {
                      return dragSession.isDataFlavorSupported(type);
                    });
    if (!supported) {
      return;
    }

    //designModeなら何もしない
    if (Components.lookupMethod(target.ownerDocument, 'designMode').call(target.ownerDocument) == 'on') {
      self.setStatusMessage('', 0, false);
      return;
    }
    // input/textarea何もしないで置く
    if (self.isParentEditableNode(target)) {
      self.setStatusMessage('', 0, false);
      return;
    }

    // do nothing if event.defaultPrevented (maybe hosted d&d by web page)
    if (event.defaultPrevented)
      return;
    /*
    if (sourceNode) {
      var xpath = 'ancestor-or-self::*[@draggable="true"]';
      var elm = this.getElementsByXPath(xpath, sourceNode);
      if (elm.length > 0)
        return;
    }
    */

    var isSameBrowser = !(sourceNode &&
                         (gBrowser &&
                          gBrowser.getBrowserForDocument(sourceNode.ownerDocument) !=
                          gBrowser.getBrowserForDocument(event.target.ownerDocument) ||
                          !gBrowser && sourceNode.ownerDocument != event.target.ownerDocument));

    if (!sourceNode) {// 外から
      // fileのドロップ
      if (this.cmdFiles(event)) {
        return;
      }
      // file以外のドロップ

      for (var i = 0; i < self.GESTURES.length; i++) {
        var GESTURES = self.GESTURES[i];
        // 方向はないこと
        if(GESTURES.dir || GESTURES.dir != '' ||  typeof GESTURES.cmd != 'function') {
          continue;
        }
        // キーチェック
        if (!self.keyCheck(event, GESTURES))
          continue;

        // cmd チェック
        var obj = GESTURES.obj.replace(/\s+/g,'').toLowerCase().split(',');
        info = self.getDragObject(event, obj);
        if (info) {
          if (/drop/.test(event.type)) {
            GESTURES.cmd(self, event, info);
          } else {
            self.setStatusMessage(GESTURES.name, 0, true);
          }
          dragSession.canDrop = true;
          event.preventDefault();
          break;
        }
      }
      return;
    } else if (sourceNode && !isSameBrowser) { //別ブラウザから
      for (var i = 0; i < self.GESTURES.length; i++) {
        var GESTURES = self.GESTURES[i];
        // 方向はないこと
        if(GESTURES.dir || GESTURES.dir != '' || typeof GESTURES.cmd != 'function') {
          continue;
        }
        // キーチェック
        if (!self.keyCheck(event, GESTURES))
          continue;

        // cmd チェック
        var obj = GESTURES.obj.replace(/\s+/g,'').toLowerCase().split(',');
        info = self.getDragObject(event, obj);
        if (info) {
          if (/drop/.test(event.type)) {
            GESTURES.cmd(self, event, info);
          } else {
            self.setStatusMessage(GESTURES.name, 0, true);
          }
          dragSession.canDrop = true;
          event.preventDefault();
          break;
        }
      }
      return;
    }

    // 同じブラウザ内から
    // input/textarea何もしないで置く
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      self.setStatusMessage('', 0, false);
      return;
    }
    for (var i = 0; i < self.GESTURES.length; i++) {
      var GESTURES = self.GESTURES[i];
      // 方向チェック
      if(!GESTURES.dir || GESTURES.dir == '' || direction != GESTURES.dir ||
         typeof GESTURES.cmd != 'function') {
        continue;
      }

      // キーチェック
      if (!self.keyCheck(event, GESTURES))
        continue;

      // cmd チェック
      var obj = GESTURES.obj.replace(/\s+/g,'').toLowerCase().split(',');
      info = self.getDragObject(event, obj);
      if (info) {
        if (/drop/.test(event.type)) {
          GESTURES.cmd(self, event, info);
        } else {
          self.setStatusMessage(GESTURES.name, 0, false);
        }
        dragSession.canDrop = true;
        event.preventDefault();
        break;
      }
    }; // GESTURES
    if (!dragSession.canDrop) {
      self.setStatusMessage('未定義', 0, false);
    }
  },

  getDragObject: function getDragObject(event, objcets) {
    var dragService = Cc["@mozilla.org/widget/dragservice;1"]
                      .getService(Ci.nsIDragService);
    var dragSession = dragService.getCurrentSession();
    var sourceNode = dragSession.sourceNode;
    var info = {urls:[], texts:[], nodes:[], files:[], fname:[]};

    var self = this;
    var data = null;
    for (var i = 0; i < objcets.length; i++) {
      var  obj = objcets[i]
  self.debug(obj);
      switch (obj) {
        case 'xpi':
        case 'jar':
          data = sourceNode;
          if (data instanceof HTMLAnchorElement) {
            var url = data.href;// self.getDroppedURL_Fixup(data.href);
            var baseURI = self.ioService.newURI(data.ownerDocument.documentURI, null, null);
            url = self.ioService.newURI(url, null, baseURI).spec;
            if (!self.xpiLinkRegExp.test(url))
              break;
            if (url && self.dragDropSecurityCheck(event, dragSession, url)) {
              info.urls.push(url);
              info.texts.push(gatherTextUnder(data));
              info.nodes.push(data);
              info.files.push(null);
              info.fname.push(self.candidateFname(data, url));
              self.sourcenode = data;
            }
          }
          break;

        case 'file':
          var supportedTypes = ["application/x-moz-file"];
          for (var j = 0; j < dragSession.numDropItems; j++) {
            if (event.dataTransfer.types.contains(supportedTypes)) {
              var data = event.dataTransfer.mozGetDataAt(supportedTypes, j);
              if (data instanceof Components.interfaces.nsIFile)
                var file = data;
              if (file)
                var uri = self.ioService.newFileURI(file);
              if (self.dragDropSecurityCheck(event, dragSession, uri.spec)) {
                info.urls.push(uri.spec);
                info.texts.push(uri.spec);
                info.nodes.push(null);
                info.files.push(file);
                info.fname.push(self.candidateFname(null, uri.spec));
              }
            }
          }
          break;

        case 'link':
          data = sourceNode;
          if (data instanceof HTMLAnchorElement) {
            var url = data.href;// self.getDroppedURL_Fixup(data.href);
            var baseURI = self.ioService.newURI(data.ownerDocument.documentURI, null, null);
            url = self.ioService.newURI(url, null, baseURI).spec;
            if (url && self.dragDropSecurityCheck(event, dragSession, url)) {
              info.urls.push(url);
              info.texts.push(gatherTextUnder(data));
              info.nodes.push(data);
              info.files.push(null);
              info.fname.push(self.candidateFname(data, url));
              self.sourcenode = data;
            }
          }
          break;

        case 'image':
          data = self.getElementsByXPath('descendant-or-self::img', sourceNode);
          if (data.length < 1)
            break;

          var node = data[data.length - 1];  //
          if (node instanceof HTMLImageElement) {
            var url = node.getAttribute('src');
            var baseURI = self.ioService.newURI(node.ownerDocument.documentURI, null, null);
            url = self.ioService.newURI(url, null, baseURI).spec;
            if (url && self.dragDropSecurityCheck(event, dragSession, url)) {
              info.urls.push(url);
              var title = url;
              if (node.hasAttribute('title')) {
                title = node.getAttribute('title')
              } else if (node.hasAttribute('alt')) {
                title = node.getAttribute('alt')
              }
              info.texts.push(title);
              info.nodes.push(node);
              info.files.push(null);
              info.fname.push(self.candidateFname(node, url));
              self.sourcenode = node;
            } else {
            }
          }
          break;

        case 'textlink':
          var node = sourceNode;
          if (node && !(node instanceof Text))
            break;
          if (node && (node instanceof Text)) {
            var anc = node.ownerDocument.evaluate(
                  'ancestor-or-self::*[local-name()="a"]',
                  node,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE,
                  null
                ).singleNodeValue;
            if (anc)
              break;
          }
          var supportedTypes = ["text/x-moz-url", "text/plain"];
          for each (var type in supportedTypes) {
            if (event.dataTransfer.types.contains(type)) {
              data = event.dataTransfer.getData(type);
              if (/^file:/.test(data))
                break;
              if (self.linkRegExp.test(data)) {
                var url = data.match(self.linkRegExp)[1];
                var url = self.getDroppedURL_Fixup(url);
                if (url.trim() && self.dragDropSecurityCheck(event, dragSession, url)) {
                  info.urls.push(url);
                  info.texts.push(url);
                  info.nodes.push(null);
                  info.files.push(null);
                  info.fname.push(self.candidateFname(null, url));
                }
              } else if (self.localLinkRegExp.test(data)) {
                var url = data.match(self.localLinkRegExp)[0];
                var url = self.getDroppedURL_Fixup(url);
                if (url.trim() && self.dragDropSecurityCheck(event, dragSession, url)) {
                  info.urls.push(url);
                  info.texts.push(url);
                  info.nodes.push(null);
                  info.files.push(null);
                  info.fname.push(self.candidateFname(null, url));
                }
              }
              break;
            }
          }
          break;

        case 'text':
          if (self.RESTRICT_SELECTED_TEXT && sourceNode) {
            var node = sourceNode;
            //if (!(node instanceof Text))
            //  break;
            var targetWindow = node.ownerDocument.defaultView;
            var data = targetWindow.getSelection().toString();
            if (data.trim()) {
              info.urls.push(null);
              info.texts.push(data);
              info.nodes.push(null);
              info.files.push(null);
              info.fname.push(self.candidateFname(null, data));
              break;
            } else {
              var supportedTypes = ["text/plain"];
              for each (var type in supportedTypes) {
                if (event.dataTransfer.types.contains(type)) {
                  data = event.dataTransfer.getData(type);
                  if (!data.trim())
                    return null;
                  info.urls.push(null);
                  info.texts.push(data);
                  info.nodes.push(null);
                  info.files.push(null);
                  info.fname.push(self.candidateFname(null, data));
                }
              }
              break;
            }
          } else if (!self.RESTRICT_SELECTED_TEXT ||
              !sourceNode) {
            var supportedTypes = ["text/plain"];
            for each (var type in supportedTypes) {
              if (event.dataTransfer.types.contains(type)) {
                data = event.dataTransfer.getData(type);
                if (!data.trim())
                  return null;
                info.urls.push(null);
                info.texts.push(data);
                info.nodes.push(null);
                info.files.push(null);
                info.fname.push(self.candidateFname(null, data));
               //break;
              }
            }
            break;
          }
          break;
        default:
          break;
      }

      if (info.urls.length > 0) {
        return info;
      }
    }
    return null;
  },

  dragDropSecurityCheck: function dragDropSecurityCheck(event, dragSession, url) {
    if (!url)
      return false;

    // need to do a security check to make
    // sure the source document can load the dropped URI.
    url = url.replace(/^\s*|\s*$/g, '');

    if (url.indexOf('chrome://') == 0 || url.indexOf('file://') == 0)
      return url;

    // urlSecurityCheck
    try {
      urlSecurityCheck(url, gBrowser.contentPrincipal, Ci.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);
    }
    catch(e) {
      event.stopPropagation();
      //throw 'Drop of ' + url + ' denied.';
      return false;
    }
    return url;
  },

  dragend: function dragend(event) {
    this.lastX = -1;
    this.lastY = -1;
    this.directionChain = "";
  },

  handleEvent: function handleEvent(event){
    switch (event.type) {
      case 'dragenter':
      case 'dragover':
      case 'drop':
        this.dragover(event);
        if (event.type == ' drop') {
          this.dragend(event);
        }
        break;
      case 'dragend':
        this.dragend(event);
        break;
      case 'dragstart':
        this.dragstart(event);
        break;
      case 'pagehide':
        this.sourcenode = null;
        break;
      case 'unload':
        this.uninit();
        break;
   }
  },

  init: function() {
    gBrowser.addEventListener('pagehide', this, false);
    gBrowser.addEventListener('dragend', this, false);
    gBrowser.addEventListener('drop', this, false);
    gBrowser.addEventListener('dragover', this, false);
    gBrowser.addEventListener('dragenter', this, false);
    gBrowser.addEventListener('dragstart', this, false);

    // xxx Bug 580710 - Drag&Drop onto sidebar loads page into sidebar
    var sidebar = document.getElementById('sidebar');
    if (sidebar)
      sidebar.setAttribute('ondrop', 'return false');

    // xxx Bug 574688 adon bar
    var statusbar = document.getElementById("status4evar-status-text") ||
                    document.getElementById("statusbar-display");
    if (!statusbar) {
      var addonbar = document.getElementById("addon-bar");
      if (!addonbar)
        return;
      var statusbarpanel = document.createElement("statusbarpanel");
      statusbarpanel.setAttribute("id", "statusbar-display");
      statusbarpanel.setAttribute("label", "");
      statusbarpanel.setAttribute("flex", "1");
      statusbar = document.getElementById("status-bar")
      statusbar = addonbar.insertBefore(statusbarpanel, addonbar.firstChild)

    }

    var closebtn = document.getElementById("addonbar-closebutton");
    var spling =  document.getElementById("addonbar-spring");
    if (closebtn)
      closebtn.setAttribute("collapsed", true);
    if (spling)
      spling.setAttribute("collapsed", true);
  },

  uninit: function() {
    gBrowser.removeEventListener('pagehide', this, false);
    gBrowser.removeEventListener('dragend', this, false);
    gBrowser.removeEventListener('drop', this, false);
    gBrowser.removeEventListener('dragover', this, false);
    gBrowser.removeEventListener('dragenter', this, false);
    gBrowser.removeEventListener('dragstart', this, false);
  },

  debug: function(aMsg){
    return;

    const UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
          createInstance(Ci.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    if (!aMsg)
      aMsg = '  ';
    try {
      var text = UI.ConvertToUnicode(aMsg)
    } catch(e) {
      text = aMsg;
    }
    Cc["@mozilla.org/consoleservice;1"]
      .getService(Ci.nsIConsoleService)
      .logStringMessage(text);
  }
};

DragNGo.init();
