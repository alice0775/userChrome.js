// ==UserScript==
// @name           viewSourceModoki.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    viewSourceModoki
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2008/07/06 00:00 例外処理
// ==/UserScript==
// @version        2012/03/25 18:00 aLineNumber
// @version        2012/01/08 23:00 aLineNumber
// @version        2008/03/24 13:00 テンポラリファイルを削除するように
// @version        2008/03/24 12:00
/*あらかじめ使用するエディタをprefにセットしておく
  view_source.editor.external を true
  view_source.editor.path に C:\\Program Files\\Hidemaru\\Hidemaru.exe などエディタパス
*/
/*リストボックスが小さいので, userChrome.cssに以下をあらかじめ追記しておく
  @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
  @-moz-document url(chrome://global/content/selectDialog.xul) {
    dialog,
    listbox {
      height:600px !important;
      width:51em !important;
      overflow:auto !important;
    }
  }
*/
var viewSourceModoki = {
  MAXLEN:100,
  LASTDOC:null,
  TMP:[],

  init:function() {

    var menu, menupopup, menuitem;
    menu = document.createElement('menu');
    menu.setAttribute('label','View Source With');
    menu.setAttribute('accesskey','W');

    menupopup = document.createElement('menupopup');
    menupopup.setAttribute('onpopupshowing','event.stopPropagation();viewSourceModoki.popup(event)');

    menuitem = document.createElement('menuitem');
    menuitem.setAttribute('id','viewSourceModokiAll');
    menuitem.setAttribute('label','All');
    menuitem.setAttribute('oncommand','viewSourceModoki.list("All");');
    menupopup.appendChild(menuitem);

    menuitem = document.createElement('menuitem');
    menuitem.setAttribute('id','viewSourceModokiDocument');
    menuitem.setAttribute('label','Document');
    menuitem.setAttribute('oncommand','viewSourceModoki.list("frames");');
    menupopup.appendChild(menuitem);

    menuitem = document.createElement('menuitem');
    menuitem.setAttribute('id','viewSourceModokiCSS');
    menuitem.setAttribute('label','CSS');
    menuitem.setAttribute('oncommand','viewSourceModoki.list("css");');
    menupopup.appendChild(menuitem);

    menuitem = document.createElement('menuitem');
    menuitem.setAttribute('id','viewSourceModokiJS');
    menuitem.setAttribute('label','JS');
    menuitem.setAttribute('oncommand','viewSourceModoki.list("scripts");');
    menupopup.appendChild(menuitem);

    menu.appendChild(menupopup);
    document.getElementById('contentAreaContextMenu').appendChild(menu);
  },

  popup: function(event){
    var doc = this.getTargetDoc(event)
    if (this.LASTDOC == doc) return;
    this.debug("getDocumentInfo for viewSourceModoki");

    this.LASTDOC = doc;
    this.getDataByDoc(doc);
    this._All =[];
    this._All = this._All.concat(this._frames, this._css, this._scripts);

    var menuitem = document.getElementById('viewSourceModokiAll');
    if (this._All.length > 0){
      menuitem.setAttribute('disabled',false);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),this._All.length ));
    }else{
      menuitem.setAttribute('disabled',true);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),0 ));
    }

    var menuitem = document.getElementById('viewSourceModokiDocument');
    if (this._frames.length > 0){
      menuitem.setAttribute('disabled',false);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),this._frames.length ));
    }else{
      menuitem.setAttribute('disabled',true);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),0 ));
    }

    menuitem = document.getElementById('viewSourceModokiCSS');
    if (this._css.length > 0){
      menuitem.setAttribute('disabled',false);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),this._css.length ));
    }else{
      menuitem.setAttribute('disabled',true);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),0 ));
    }

    menuitem = document.getElementById('viewSourceModokiJS');
    if (this._scripts.length > 0){
      menuitem.setAttribute('disabled',false);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),this._scripts.length ));
    }else{
      menuitem.setAttribute('disabled',true);
      menuitem.setAttribute('label',this.getMenuLabel(menuitem.getAttribute('label'),0 ));
    }
  },

  getMenuLabel: function(label,n){
    label = label.replace(/\(\d+\)/,'');
    return label +'(' + n + ')';
  },

  debug: function(aMsg){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    Cc["@mozilla.org/consoleservice;1"]
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aMsg);
  },

  getTargetDoc: function(event){
    var win = this._getFocusedWindow();
    var doc = win.document;
    return doc;
  },

  getDataByDoc: function(doc){
    this._frames = this.getFrames(doc);
    this._css = this.getStyleSheets(doc);
    this._scripts = this.getScripts(doc);
  },

  activeBrowser: function() {
    return ('SplitBrowser' in window ? SplitBrowser.activeBrowser : null )
            ||  gBrowser;
  },

  //現在のウインドウを得る
  _getFocusedWindow: function(){
    var focusedWindow = document.commandDispatcher.focusedWindow;
    if (!focusedWindow || focusedWindow == window)
        return window.content;
    else
        return focusedWindow;
  },

  chkdup: function (arr, host){
    var flg = true;
    for (var j = 0; j < arr.length;j++){
      if(arr[j] != host) continue;
      flg = false;
      break;
    }
    return flg;
  },

  //nameを比較する関数
  cmp_name : function(a, b) {
    if(a.toLowerCase()==b.toLowerCase())
      return  a < b ? -1 : 1;
    else
      return  a.toLowerCase() < b.toLowerCase() ? -1 : 1;
  },

  //doc内の外部CSSのhostの配列を得る
  getStyleSheets : function(doc){
    var _css = [];
    if (!doc) return _css;

    var links = doc.getElementsByTagName("link");
    for(var i=0; i<links.length; i++){
      if(links[i].rel.indexOf('stylesheet') >= 0 && links[i].type == "text/css" ){
        var host = links[i].href;
        if(host && this.chkdup(_css, host)) _css.push(host);
      }
    }

    //これ以降は冗長かもしれないが念のため
    var links = doc.styleSheets;
    var loc = doc.location;
    if(!links) return _css;

    for (var i = 0; i < links.length; i++) {
      // Determine if href is an external url.
      // If href matches with location is external
      if (links[i].type == "text/css" && links[i].href != loc) {
        var host = links[i].href;
        if(host && this.chkdup(_css, host)) _css.push(host);
      }
      try {
        var rules = links[i].cssRules;
        for (var r = 0; r < rules.length; r++) {
          if (rules[r].type == CSSRule.IMPORT_RULE) {
            if(!rules[r].styleSheet) continue;
            var host = rules[r].styleSheet.href;
            if(host && this.chkdup(_css, host)) _css.push(host);
          }
        }
      } catch(ex){}
    }
    _css.sort(this.cmp_name);
    return _css;
  },

  //doc内の外部スクリプトのhostの配列を得る
  getScripts : function(doc){
      var _scripts = [];
      if (!doc) return _scripts;

      var scripts = doc.getElementsByTagName('script');
      if(!scripts) return _scripts;

      for (var i = 0; i < scripts.length; i++) {
        var host = scripts[i].src;
        if(host == 'browser') continue;
        if(host && this.chkdup(_scripts, host)) _scripts.push(host);
      }
      _scripts.sort(this.cmp_name);
      return _scripts;
  },
    //doc内のframe/iframeのhostの配列を得る
  getFrames : function(doc){
      var _frames = [];
      if (!doc) return _frames;
      _frames.push(doc.location.href);
      var frames = doc.getElementsByTagName('frame');
      for (var i = 0; i < frames.length; i++) {
        var host = frames[i].src;
        if(host == 'browser') continue;
        if(host && this.chkdup(_frames, host)) _frames.push(host);
      }
      var frames = doc.getElementsByTagName('iframe');
      for (var i = 0; i < frames.length; i++) {
//alert(frames[i].src);
        var host = frames[i].src;
        if(host == 'browser') continue;
        if(host && this.chkdup(_frames, host)) _frames.push(host);
      }
      _frames.sort(this.cmp_name);
      return _frames;
  },

  //リスト表示
  list: function(kind){
    switch(kind){
      case 'All':
        this.displayList(this._All);
        break;
      case 'frames':
        this.displayList(this._frames);
        break;
      case 'css':
        this.displayList(this._css);
        break;
      case 'scripts':
        this.displayList(this._scripts);
        break;
    }
  },

  displayList:function(objArray){
    this.TMP = [];
    var maxLen = this.MAXLEN;
    var objDisp = [], selected = {}, result, aURL;
    var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Ci.nsIPromptService);
    for (var i= 0;i < objArray.length; i++){
      var text = objArray[i];
      var len0 = this.jstrlen(text);
      if (len0 > maxLen){
        /(.*\/)+(.+)$/.test(text);
        var text1 = RegExp.$1;
        var text2 = RegExp.$2;
        len2 = this.jstrlen(text2);
        if(len2 >= maxLen-6){
          var text2 = ' ... ' + text2.substring(len2 - maxLen , len2 - 6);
          text = text2;
        }else if(len2 !=0){
          var text1 = text1.substring(0, maxLen - len2 - 6);
          text = text1 + ' ... ' + text2;
        }else{

        }
      }
      objDisp.push(text);
    }
    while(true){
      selected = {};
      result = promptService.select(null, 'View Source Modoki',
                                    'Select a Document',
                                    objArray.length, objDisp, selected);
      if (!result) {
        this.daleteTmpFile();
        return;
      }
      aURL = objArray[selected.value];
      this.launch(aURL);
    }
  },

  daleteTmpFile: function(){
    while(this.TMP.length > 0){
      var file = this.TMP.pop();
this.debug(file.path);
      try{file.remove(false);}catch(e){}
    }
  },

  jstrlen: function (str) {
    /*
    var len = 0;
    str = escape(str);
    for (i = 0; i < str.length; i++, len++) {
      if (str.charAt(i) != "%")
    continue;
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
    */
    var len = str.length;
    return len;
  },

  launch: function(aURL){
    var aDocument = null;
    var aLineNumber = null;
    var aCallBack = null; //this.aCallBack;
    var aContentType = null;
    // make a uri
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var charset = aDocument ? aDocument.characterSet : null;
    var aURI = ios.newURI(aURL, charset, null);
    var aPageDescriptor = null;
    this.TMP.push(gViewSourceUtils.getTemporaryFile(aURI, aDocument, aContentType));
    if(/aLineNumber/.test(gViewSourceUtils.openInExternalEditor.toSource()))
      gViewSourceUtils.openInExternalEditor(aURL, aPageDescriptor, aDocument, aLineNumber, aCallBack);
    else
      gViewSourceUtils.openInExternalEditor(aURL, aPageDescriptor, aDocument, aCallBack);
  },

  aCallBack: function(status,data){
  }
}
viewSourceModoki.init();
