/* :::::::: Sub-Script/Overlay Loader v3.0.81mod no bind version ::::::::::::::: */

// automatically includes all files ending in .uc.xul and .uc.js from the profile's chrome folder

// New Features:
// supports Greasemonkey-style metadata for userChrome scripts and overlays
// supports a "main" shortcut for the main browser window in include/exclude lines
// supports regexes in the include/exclude lines
// scripts without metadata will run only on the main browser window, for backwards compatibility
//
// 1.Including function of UCJS_loader. <--- not work in Firefox135+
// 2.Compatible with Firefox139
// 3.Cached script data (path, leafname, regex)
// 4.Support window.userChrome_js.loadOverlay(overlay [,observer]) <--- not work in recent Firefox
// Modified by Alice0775
//
// @version       2025/04/02 read meta @sandbox
// @version       2025/04/02 fix loadscript uc.js into sandbox
// @version       2025/01/05 fix error handler
// @version       2025/01/04 add error handler
// @version       2025/01/03 use ChromeUtils.compileScript if async
// @version       2024/12/25 load script async if meta has @async true. nolonger use @charset
// @version       2023/09/07 remove to use nsIScriptableUnicodeConverter and AUTOREMOVEBOM
// @version       2022/03/15 fix UCJS_loader
// @version       2022/08/26 Bug 1695435 - Remove @@hasInstance for IDL interfaces in chrome context
// @version       2022/08/26 fix load sidebar
// @version       2022/04/01 remove nsIIOService
// @version       2021/08/05 fix for 92+ port Bug 1723723 - Switch JS consumers from getURLSpecFromFile to either getURLSpecFromActualFile or getURLSpecFromDir
// @version       2021/06/25 skip for in-content dialog etc.
// @version       2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser and Bug 1601093 - Rename remaining .xul files to .xhtml in toolkit
// Date 2019/12/11 01:30 fix 72 revert the code for sidebar, use "load" in config.js(2019/12/11 01:30), 
// Date 2019/08/11 21:30 fix 70.0a1  Bug 1551344 - Remove XULDocument code
// Date 2019/05/21 08:30 fix 69.0a1 Bug 1534407 - Enable browser.xhtml by default, Bug 1551320 - Replace all CreateElement calls in XUL documents with CreateXULElement
// Date 2018/08/10 01:30 fix 63.0a1
// Date 2018/08/02 19:30 for userChrome.xml
// Date 2018/05/30 18:00 ALWAYSEXECUTE  .uc.js
// Date 2018/05/06 22:00 fix wrong commit
// Date 2018/05/06 22:00 remove workaround for editBookmarkPanel
// Date 2018/03/21 08:00 revert USE_0_63_FOLDER
// Date 2018/03/20 21:00 editBookmarkPanel etc Bug 1444228 - Remove editBookmarkOverlay.xul
// Date 2015/06/28 13:00 about:preferences#privacy etc
// Date 2014/12/28 19:00 workaround loading xul on second browser
// Date 2014/12/13 21:00 remove a debug log
// Date 2014/12/13 21:00 allow to load scripts into about: in dialog
// Date 2014/12/13 21:00 require userchrome.js-0.8.014121301-Fx31.xpi
// Date 2014/06/07 21:00 skip about:blank
// Date 2014/06/07 19:00 turn off experiment by default
// Date 2014/06/04 12:00 fixed possibility of shutdown crash Bug 1016875
// Date 2014/05/19 00:00 delay 0, experiment
// Date 2013/10/06 00:00 allow to load scripts into about:xxx
// Date 2013/09/13 00:00 Bug 856437 Remove Components.lookupMethod, remove REPLACEDOCUMENTOVERLAY
// Date 2012/04/19 23:00 starUIをbindを使うように
// Date 2012/04/19 21:00 starUI元に戻した
// Date 2012/02/04 00:00 due to bug 726444 Implement the Downloads Panel.
// Date 2012/02/04 00:00 due to bug 726440
// Date 2011/11/19 15:30 REPLACECACHE 追加 Bug 648125
// Date 2011/09/30 13:40 fix bug 640158
// Date 2011/09/30 13:00 fix bug 640158
// Date 2011/04/07 00:00 hackVersion
// Date 2010/10/10 00:00 Bug 377498 mozIJSSubscriptLoader::loadSubScript charset 入ったけどメタデータ // @charset  UTF-8 としとけばUTF-8で読み込む
// Date 2010/03/31 00:00 XULDocumentのみに適用
// Date 2010/03/11 17:30 debugbuildで動かない場合がある件に対応。
// Date 2010/02/28 13:00 ↓が直っているので元に戻した。
// Date 2009/08/06 00:00 tree_style_tab-0.8.2009073102があるとxulのdocument.overlayが出来なくなる件に対応
// Date 2009/05/23 00:00 userChrome.js0.8.1実験中 v3.0.25mod
// Date 2009/04/13 00:00 overlayのobserveの処理変更 v3.0.24mod
// Date 2009/03/10 00:00 例外トラップ
// Date 2009/02/15 15:00 chromehiddenなwindow(popup等)の場合にロードするかどうかを指定できるようにした。
// Date 2008/12/29 06:00 面倒だからdocument.overlayを置き換えるようにした。
// Date 2008/12/27 18:00 Webpanelにchromeを読み込んだときのエラーが出るのを修正(thanks 音吉)
// Date 2008/09/16 00 00 面倒だからFirefox3 の場合はeditBookmarkOverlay.xulは先読みするように修正
// Date 2008/08/28 00 00 なぜか0.8.0+を使っている人がいたので, それに対応
// Date 2008/08/26 23:50 08/26 18:00 以降 Fx2で動かなくなったようなので, 直した
// Date 2008/08/26 22:00 v3.0.11modで動かないなら,これ以降のものも動かないよ。たぶん
// Date 2008/08/26 18:00 Fx3のStarUIをなんとかして欲しいな。
// Date 2008/08/18 04:00 AUTOREMOVEBOM = trueなら文字コード自動判定するようにした。
// Date 2008/08/16 15:00 BOMを自動的に取り除くかどうか指定できるようにした
// Date 2008/07/29 23:00 なんかバグあったかも
// Date 2008/07/25 00:00 USE_0_63_FOLDERおよびFORCESORTSCRIPTがtrueの場合は, フォルダも名順でソートするようにした
// Date 2008/07/14 01:00 typo, regression
// Date 2008/07/14 00:00 typo, regression
// Date 2008/07/13 22:00 サイドバーweb-panelsにchromeウインドウを読み込んだ場合に対応
// Date 2008/03/23 12:00 80氏のフォルダ規則に対応, 0.8modバージョンにも対応
//

(function(){
  "use strict";
  var { AppConstants } = AppConstants || ChromeUtils.importESModule(
  "resource://gre/modules/AppConstants.sys.mjs"
  );
  // -- config --
  const EXCLUDE_CHROMEHIDDEN = false; //chromehiddenなwindow(popup等)ではロード: しないtrue, する[false]
  const USE_0_63_FOLDER = true; //0.63のフォルダ規則を使う[true], 使わないfalse
  const FORCESORTSCRIPT = (AppConstants.platform != "win") ? true : false; //強制的にスクリプトをファイル名順でソートするtrue, しない[false]
  const REPLACECACHE = true; //スクリプトの更新日付によりキャッシュを更新する: true , しない:[false]
  //=====================USE_0_63_FOLDER = falseの時===================
  var UCJS      = new Array("UCJSFiles","userContent","userMenu"); //UCJS Loader 仕様を適用 (NoScriptでfile:///を許可しておく)
  var arrSubdir = new Array("", "xul","TabMixPlus","withTabMixPlus", "SubScript", "UCJSFiles", "userCrome.js.0.8","userContent","userMenu");    //スクリプトはこの順番で実行される
  //===================================================================
  const ALWAYSEXECUTE   = ['rebuild_userChrome.uc.xul', 'rebuild_userChrome.uc.js']; //常に実行するスクリプト
  var INFO = true;
  var BROWSERCHROME = "chrome://browser/content/browser.xhtml"; //Firfox
                    //"chrome://browser/content/browser.xul"; //Firfox
  //var BROWSERCHROME = "chrome://navigator/content/navigator.xul"; //SeaMonkey:
  // -- config --
/* USE_0_63_FOLDER true の時
 * chrome直下およびchrome/xxx.uc 内の *.uc.js および *.uc.xul
 * chrome/xxx.xul 内の  *.uc.js , *.uc.xul および *.xul
 * chrome/xxx.ucjs 内の *.uc.js は 特別に UCJS Loader 仕様を適用(NoScriptでfile:///を許可しておく)
 */

/* USE_0.63_FOLDER false の時
 *[ フォルダは便宜上複数のフォルダに分けているだけで任意。 下のarrSubdirで指定する ]
 *[ UCJS Loaderを適用するフォルダをUCJSで指定する                                  ]
  プロファイル-+-chrome-+-userChrome.js(このファイル)
                        +-*.uc.jsまたは*.uc.xul群
                        |
                        +-SubScript--------+-*.uc.jsまたは*.uc.xul群
                        |
                        +-UCJSFiles--------+-*.uc.jsまたは*.uc.xul群
                        | (UCJS_loaderでしか動かないもの JavaScript Version 1.7/日本語)
                        |
                        +-xul--------------+-*.xul, *.uc.xulおよび付随File
                        |
                        +-userCrome.js.0.8-+-*.uc.jsまたは*.uc.xul群 (綴りが変なのはなぜかって? )
 */

  //chrome/aboutでないならスキップ
  if(!/^(chrome:|about:)/i.test(location.href)) return;
  if(/^(about:(blank|newtab|home))/i.test(location.href)) return;
  //コモンダイアログに対するオーバーレイが今のところ無いので時間短縮のためスキップすることにした
  if(location.href =='chrome://global/content/commonDialog.xul') return;
  if(location.href =='chrome://global/content/commonDialog.xhtml') return;
  if(location.href =='chrome://global/content/selectDialog.xhtml') return;
  if(location.href =='chrome://global/content/alerts/alert.xul') return;
  if(location.href =='chrome://global/content/alerts/alert.xhtml') return;
  if(/\.html?$/i.test(location.href)) return;
  window.userChrome_js = {
    USE_0_63_FOLDER: USE_0_63_FOLDER,
    UCJS: UCJS,
    arrSubdir: arrSubdir,
    FORCESORTSCRIPT: FORCESORTSCRIPT,
    ALWAYSEXECUTE: ALWAYSEXECUTE,
    INFO: INFO,
    BROWSERCHROME: BROWSERCHROME,
    EXCLUDE_CHROMEHIDDEN: EXCLUDE_CHROMEHIDDEN,
    REPLACECACHE: REPLACECACHE,

    get hackVersion () {
      delete this.hackVersion;
      return this.hackVersion = "0.8";
      //拡張のバージョン違いを吸収
      this.baseUrl = /^(chrome:\/\/\S+\/content\/)\S+/i.test( Error().fileName).$1;
      if (!/^(chrome:\/\/\S+\/content\/)\S+/i.test( Error().fileName) ){
      } else if (Error().fileName.indexOf("chrome://uc_js/content/uc_js.xul") > -1 ||
           "chrome://userchrome_js_cache/content/userChrome.js" == Error().fileName ){  //0.8.0+ or 0.7
        return this.hackVersion = "0.8+";
      } else if (Error().fileName.indexOf("chrome://browser/content/browser.xul -> ") == 0) {
        return this.hackVersion = "0.8.1";
      } else {
        return this.hackVersion = "0.8mod";
      }
    },

    //スクリプトデータを作成
    getScripts: function(){
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      const fph = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
      const ds = Services.dirsvc;
var Start = new Date().getTime();
      //getdir
      if (this.USE_0_63_FOLDER) {
        var o = [""];
        this.UCJS =[];
        this.arrSubdir =[];
        var workDir = ds.get("UChrm", Ci.nsIFile);
        var dir = workDir.directoryEntries;
        while(dir.hasMoreElements()){
          var file = dir.getNext().QueryInterface(Ci.nsIFile);
          if( !file.isDirectory()) continue;
          var dirName = file.leafName;
          if(/(uc|xul|ucjs)$/i.test(dirName)){
            o.push(dirName);
            if(/ucjs$/i.test(dirName)){
              this.UCJS.push(dirName);
            }
          }
        }
        if(this.FORCESORTSCRIPT){
          o.sort(cmp_name);
        }
        [].push.apply(this.arrSubdir, o);
      }

      var that = this;
      var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
      if(mediator.getMostRecentWindow("navigator:browser"))
        var mainWindowURL = that.BROWSERCHROME;
      else if (mediator.getMostRecentWindow("mail:3pane"))
        var mainWindowURL = "chrome://messenger/content/messenger.xul";

      this.dirDisable = restoreState(getPref("userChrome.disable.directory", "str", "").split(','));
      this.scriptDisable = restoreState(getPref("userChrome.disable.script", "str", "").split(','));
      this.scripts = [];
      this.overlays = [];

      var findNextRe = /^\/\/ @(include|exclude)[ \t]+(\S+)/gm;
      this.directory = {name:[], UCJS:[], enable:[]};
      for(var i=0, len=this.arrSubdir.length; i<len; i++){
        var s = [], o = [];
        try{
          var dir = this.arrSubdir[i]=="" ? "root" : this.arrSubdir[i];
          this.directory.name.push(dir);
          this.directory.UCJS.push(checkUCJS(dir));

          var workDir = ds.get("UChrm", Ci.nsIFile);
          workDir.append(this.arrSubdir[i]);
          var files = workDir.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);
          var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
          while(files.hasMoreElements()){
            var file = files.getNext().QueryInterface(Ci.nsIFile);
            if(/\.uc\.js$|\.uc\.xul$/i.test(file.leafName)
               || /\.xul$/i.test(file.leafName) && /\xul$/i.test(this.arrSubdir[i])) {
              var script = getScriptData(readFile(file, true) ,file);
              script.dir = dir;
              if(/\.uc\.js$/i.test(script.filename)){
                script.ucjs = checkUCJS(script.file.path);
                s.push(script);
              }else{
                script.xul = '<?xul-overlay href=\"'+ script.url +'\"?>\n';
                o.push(script);
              }
            }
          }
        }catch(e){}
        if(this.FORCESORTSCRIPT){
          s.sort(cmp_fname);
          o.sort(cmp_fname);
        }
        [].push.apply(this.scripts, s);
        [].push.apply(this.overlays, o);
      }
this.debug('Parsing getScripts: '+((new Date()).getTime()-Start) +'msec');

      //nameを比較する関数
      function cmp_name(a, b) {
        if(a.toLowerCase()==b.toLowerCase())
          return  a < b?-1:1;
        else
          return  a.toLowerCase() < b.toLowerCase()?-1:1;
      }
      function cmp_fname(a, b) {
        return cmp_name(a.filename, b.filename);
      }

      //UCJSローダ必要か
      function checkUCJS(aPath){
        for(var i=0,len=that.UCJS.length; i<len; i++){
          if( aPath.indexOf(that.UCJS[i], 0)>-1 )
            return true;
        }
        return false;
      }

      //メタデータ収集
      function getScriptData(aContent,aFile){
        var charset, description, async, sandbox;
        var header = (aContent.match(/^\/\/ ==UserScript==[ \t]*\n(?:.*\n)*?\/\/ ==\/UserScript==[ \t]*\n/m) || [""])[0];
        var match, rex = { include: [], exclude: []};
        while ((match = findNextRe.exec(header)))
        {
          rex[match[1]].push(match[2].replace(/^main$/i,mainWindowURL).replace(/\W/g, "\\$&").replace(/\\\*/g, ".*?"));
        }
        if( rex.include.length == 0) rex.include.push(mainWindowURL);
        var exclude = rex.exclude.length > 0 ? "(?!" + rex.exclude.join("$|") + "$)" : "";

        match = header.match(/\/\/ @charset\b(.+)\s*/i);
        charset = "";
        //try
        if(match)
          charset = match.length > 0 ? match[1].replace(/^\s+/,"") : "";

        match = header.match(/\/\/ @async\b(.+)\s*/i);
        async = false;
        //try
        if(match) {
          async = match.length > 0 ? match[1].replace(/^\s+/,"") : "";
          async = (sandbox == "true");
        }
        
        match = header.match(/\/\/ @sandbox\b(.+)\s*/i);
        sandbox = true; // default sandboxed
        //try
        if(match) {
          sandbox = match.length > 0 ? match[1].replace(/^\s+/,"") : "";
          sandbox = !(sandbox == "false");
        }

        match = header.match(/\/\/ @description\b(.+)\s*/i);
        description = "";
        //try
        if(match)
          description = match.length > 0 ? match[1].replace(/^\s+/,"") : "";
        //}catch(e){}
        if (description =="" || !description)
          description = aFile.leafName;
        var url = fph.getURLSpecFromActualFile(aFile);

        return {
          filename: aFile.leafName,
          file: aFile,
          url: url,
          //namespace: "",
          charset: charset,
          description: description,
          async: async,
          sandbox: sandbox,
          //code: aContent.replace(header, ""),
          regex: new RegExp("^" + exclude + "(" + (rex.include.join("|") || ".*") + ")$", "i")
        }
      }

      //スクリプトファイル読み込み
      function readFile(aFile, metaOnly){
        if (typeof metaOnly == 'undefined')
          metaOnly = false;
        var stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
        stream.init(aFile, 0x01, 0, 0);
        var cvstream = Cc["@mozilla.org/intl/converter-input-stream;1"].
                                  createInstance(Ci.nsIConverterInputStream);
        cvstream.init(stream, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
        var content = "", data = {};
        while (cvstream.readString(4096, data)) {
          content += data.value;
          if (metaOnly &&
              content.indexOf('// ==/UserScript==') > 0)
            break;
        }
        cvstream.close();
        return content.replace(/\r\n?/g, "\n");
      }

      //バイナリ読み込み
      function readBinary(aFile){
        var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                                .createInstance(Components.interfaces.nsIFileInputStream);
        istream.init(aFile, -1, -1, false);

        var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
                                .createInstance(Components.interfaces.nsIBinaryInputStream);
        bstream.setInputStream(istream);
        return bstream.readBytes(bstream.available());
      }

      //バイナリ書き込み
      function writeFile(aFile, aData){
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                 .createInstance(Components.interfaces.nsIFileOutputStream);
        // ファイル追記の際は、0x02 | 0x10 を使う
        foStream.init(aFile, 0x02 | 0x08 | 0x20, parseInt(664, 8), 0); // write, create, truncate
        foStream.write(aData, aData.length);
        foStream.close();
        return aData;
      }

      //prefを読み込み
      function getPref(aPrefString, aPrefType, aDefault){
        var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                      .getService(Components.interfaces.nsIPrefService);
        try{
          switch (aPrefType){
            case 'complex':
              return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
            case 'str':
              return unescape(xpPref.getCharPref(aPrefString).toString()); break;
            case 'int':
              return xpPref.getIntPref(aPrefString); break;
            case 'bool':
            default:
              return xpPref.getBoolPref(aPrefString); break;
          }
        }catch(e){
        }
        return aDefault;
      }

      //pref文字列変換
      function restoreState(a){
        try{
            var sd = [];
            for(var i = 0,max = a.length;i < max;++i) sd[unescape(a[i])] = true;
            return sd;
        }
        catch(e){ return []; }
      }
    },

    getLastModifiedTime: function(aScriptFile) {
      if (this.REPLACECACHE) {
        return aScriptFile.lastModifiedTime;
      }
      return "";
    },

    //window.userChrome_js.loadOverlay
    shutdown: false,
    overlayWait:0,
    overlayUrl:[],
    loadOverlay: function(url, observer, doc){
       window.userChrome_js.overlayUrl.push([url, observer, doc]);
       if(!window.userChrome_js.overlayWait) window.userChrome_js.load(++window.userChrome_js.overlayWait);

    },

    load: function (){
        if(!window.userChrome_js.overlayUrl.length) return --window.userChrome_js.overlayWait;
        var [url, aObserver, doc] = this.overlayUrl.shift();
        if (!!aObserver && typeof aObserver == 'function') {
          aObserver.observe = aObserver;
        }
        if (!doc) doc = document;
        /*if (!(doc instanceof XULDocument))
          return 0;*/
        var observer = {
          observe:function (subject, topic, data) {
            if (topic == 'xul-overlay-merged') {
              //XXX We just caused localstore.rdf to be re-applied (bug 640158)
              if ("retrieveToolbarIconsizesFromTheme" in window)
                retrieveToolbarIconsizesFromTheme();
              if (!!aObserver && typeof aObserver.observe == 'function') {
                try {
                  aObserver.observe(subject, topic, data);
                } catch(ex){
                  window.userChrome_js.error(url, ex);
                }
              }
              if ('userChrome_js' in window)
               window.userChrome_js.load();
            }
          },
          QueryInterface: function(aIID){
            if(!aIID.equals(Components.interfaces.nsISupports)
               && !aIID.equals(Components.interfaces.nsIObserver))
              throw Components.results.NS_ERROR_NO_INTERFACE;
            return this
          }
        };
        //if (this.INFO) this.debug("document.loadOverlay: " + url);
        try{
          if (window.userChrome_js.shutdown) return;
          doc.loadOverlay(url, observer);
        } catch(ex){
          window.userChrome_js.error(url, ex);
        }
        return 0;
    },

    //xulを読み込む
    runOverlays: function(doc){
      try {
        var dochref = doc.location.href.replace(/#.*$/, "");
      } catch (e) {
        return;
      }

      var overlay;

      for(var m=0,len=this.overlays.length; m<len; m++){
        overlay = this.overlays[m];
        if(this.ALWAYSEXECUTE.indexOf(overlay.filename) < 0
          && ( !!this.dirDisable['*']
               || !!this.dirDisable[overlay.dir]
               || !!this.scriptDisable[overlay.filename]) ) continue;

        // decide whether to run the script
        if(overlay.regex.test(dochref)){
          if (this.INFO) this.debug("loadOverlay: " + overlay.filename);
          this.loadOverlay(overlay.url + "?" + this.getLastModifiedTime(overlay.file), null, doc);
        }
      }
    },

    //uc.jsを読み込む
    runScripts: function(doc){
      try {
        var dochref = doc.location.href.replace(/#.*$/, "");
      } catch (e) {
        return;
      }
      if (!HTMLDocument.isInstance(doc))
          return;

      var script, aScript, url;
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      const maxJSVersion = (function getMaxJSVersion() {
        var appInfo = Components
            .classes["@mozilla.org/xre/app-info;1"]
            .getService(Components.interfaces.nsIXULAppInfo);
        var versionChecker = Components
            .classes["@mozilla.org/xpcom/version-comparator;1"]
            .getService(Components.interfaces.nsIVersionComparator);

        // Firefox 3.5 and higher supports 1.8.
        if (versionChecker.compare(appInfo.version, "3.5") >= 0) {
          return "1.8";
        }
        // Firefox 2.0 and higher supports 1.7.
        if (versionChecker.compare(appInfo.version, "2.0") >= 0) {
          return "1.7";
        }

        // Everything else supports 1.6.
        return "1.6";
      })();

      let target = win = doc.defaultView;
      
        target = new Cu.Sandbox(win, {
            sandboxPrototype: win,
            sameZoneAs: win,
        });
        /* toSource() is not available in sandbox */
        Cu.evalInSandbox(`
            Function.prototype.toSource = window.Function.prototype.toSource;
            Object.prototype.toSource = window.Object.prototype.toSource;
            Array.prototype.toSource = window.Array.prototype.toSource;
        `, target);
        win.addEventListener("unload", () => {
            setTimeout(() => {
                Cu.nukeSandbox(target);
            }, 0);
        }, {once: true});

      for(var m=0,len=this.scripts.length; m<len; m++){
        script = this.scripts[m];
        if (this.ALWAYSEXECUTE.indexOf(script.filename) < 0
          && (!!this.dirDisable['*']
            || !!this.dirDisable[script.dir]
            || !!this.scriptDisable[script.filename]) ) continue;
        if( !script.regex.test(dochref)) continue;
        if( script.ucjs ){ //for UCJS_loader
            if (this.INFO) this.debug("loadUCJSSubScript: " + script.filename);
            aScript = doc.createElementNS("http://www.w3.org/1999/xhtml", "script");
            aScript.type = "text/javascript";
            aScript.src = script.url + "?" + this.getLastModifiedTime(script.file);
            try {
              doc.documentElement.appendChild(aScript);
            }catch(ex) {
              this.error(script.filename, ex);
            }
        }else{ //Not for UCJS_loader
          if (this.INFO) this.debug("loadSubScript: " + script.filename);
          /*
          try {
            if (script.charset)
              Services.scriptloader.loadSubScript(
                         script.url + "?" + this.getLastModifiedTime(script.file),
                         target, script.charset);
            else
              Services.scriptloader.loadSubScript(
                         script.url + "?" + this.getLastModifiedTime(script.file),
                         target);
          }catch(ex) {
            this.error(script.filename, ex);
          }
          continue;
          */
          
          if (!script.async) {
            try {
              if (script.charset)
                Services.scriptloader.loadSubScript(
                           script.url + "?" + this.getLastModifiedTime(script.file),
                           script.sandbox ? target : doc.defaultView, script.charset);
              else
                Services.scriptloader.loadSubScript(
                           script.url + "?" + this.getLastModifiedTime(script.file),
                           script.sandbox ? target : doc.defaultView);
            }catch(ex) {
              this.error(script.filename, ex);
            }
          } else {
            ChromeUtils.compileScript(
              script.url + "?" + this.getLastModifiedTime(script.file)
            ).then((r) => {
              r.executeInGlobal(/*global*/ script.sandbox ? target : doc.defaultView, {reportExceptions: true});
            }).catch((ex) => {this.error(script.filename, ex);});
          }
        }
      }
    },

    debug: function(aMsg){
      Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
        .logStringMessage(aMsg);
    },

    error: function(aMsg,err){
      const CONSOLE_SERVICE    = Components.classes['@mozilla.org/consoleservice;1']
                                 .getService(Components.interfaces.nsIConsoleService);
      var error = Components.classes['@mozilla.org/scripterror;1']
                  .createInstance(Components.interfaces.nsIScriptError);
      if(typeof(err) == 'object') error.init(aMsg + '\n' + err.name + ' : ' + err.message,err.fileName || null,null,err.lineNumber,null,2,err.name);
      else error.init(aMsg + '\n' + err + '\n',null,null,null,null,2,null);
      CONSOLE_SERVICE.logMessage(error);
    }
  };

  //少しでも速くするためスクリプトデータの再利用
  var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService);
  try{
    var pref = prefObj.getBoolPref("userChrome.enable.reuse");
  }catch(e){
    var pref = true;
  }


  var that = window.userChrome_js;
  window.addEventListener("unload", function(){
    that.shutdown = true;
  },false);

  window.xxdebug = that.debug;
  //that.debug(typeof that.getScriptsDone);
  if(pref){
    //現在のメインウィンドウは一度もuserChrome.jsのスクリプトで初期化されていない?
    if(!that.getScriptsDone){
      //Firefox or Thunderbard?
      var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
      if(mediator.getMostRecentWindow("navigator:browser"))
        var windowType = "navigator:browser";
      else if (mediator.getMostRecentWindow("mail:3pane"))
        var windowType = "mail:3pane";
      var enumerator = mediator.getEnumerator(windowType);
      //他の身内のメインウィンドウではどうかな?
      while(enumerator.hasMoreElements()) {
        var win = enumerator.getNext();
        //身内のメインウインドウは初期状態でない?
        if(win.userChrome_js && win.userChrome_js.getScriptsDone){
          //オブジェクトはたぶんこのウインドウのを複製すりゃいいんじゃぁないかな
          that.UCJS = win.userChrome_js.UCJS;
          that.arrSubdir = win.userChrome_js.arrSubdir;
          that.scripts = win.userChrome_js.scripts;
          that.overlays = win.userChrome_js.overlays;
          that.dirDisable = win.userChrome_js.dirDisable;
          that.scriptDisable = win.userChrome_js.scriptDisable;
          that.getScriptsDone = true;
          break;
        }
      }
    }
  }

  if(!that.getScriptsDone){
    if (that.INFO) that.debug("getScripts");
    that.getScripts();
    that.getScriptsDone= true;
  }else{
    if (that.INFO) that.debug("skip getScripts");
  }

  var href = location.href;
  var doc = document;

  //Bug 330458 Cannot dynamically load an overlay using document.loadOverlay
  //until a previous overlay is completely loaded

  if (that.INFO) that.debug("load " + href);

  //chromehiddenならロードしない
  if (location.href === that.BROWSERCHROME &&
      that.EXCLUDE_CHROMEHIDDEN &&
      document.documentElement.getAttribute("chromehidden") !="" )
    return;

  if (typeof gBrowser != undefined) {
    that.runScripts(doc);
    setTimeout(function(doc){that.runOverlays(doc);},0, doc);
  } else {
    setTimeout(function(doc){
      that.runScripts(doc);
      setTimeout(function(doc){that.runOverlays(doc);},0, doc);
    },0, doc);
  }


  //Sidebar for Trunc
  if(location.href != that.BROWSERCHROME) return;
  window.document.addEventListener("load",
    function(event){
      if (!event.originalTarget.location) return;
      if(/^(about:(blank|newtab|home))/i.test(event.originalTarget.location.href)) return;
      if( !/^(about:|chrome:)/.test(event.originalTarget.location.href) )return;
      var doc = event.originalTarget;
      var href = doc.location.href;
      // skip for in-content dialog etc.
      if(href =='chrome://global/content/commonDialog.xhtml') return;
      if(href =='chrome://global/content/selectDialog.xhtml') return;
      if(href =='chrome://global/content/alerts/alert.xhtml') return;

      if (that.INFO) that.debug("load Sidebar " +  href);
      setTimeout(function(doc){that.runScripts(doc);
        setTimeout(function(doc){that.runOverlays(doc);}, 0, doc);
      },0, doc);
      if (href != "chrome://browser/content/web-panels.xul") return;
      if (!window.document.getElementById("sidebar")) return;
      var sidebarWindow = window.document.getElementById("sidebar").contentWindow;
        if (sidebarWindow){
          loadInWebpanel.init(sidebarWindow);
        }
    }
  , true);

  var loadInWebpanel = {
    sidebarWindow: null,
    init: function(sidebarWindow){
      this.sidebarWindow = sidebarWindow;
      this.sidebarWindow.document.getElementById("web-panels-browser").addEventListener("load", this, true);
      this.sidebarWindow.addEventListener("unload", this, false);
    },
    handleEvent: function(event){
      switch (event.type) {
        case "unload":
          this.uninit(event);
          break;
        case "load":
          this.load(event);
          break;
      }
    },
    uninit: function(event){
      this.sidebarWindow.document.getElementById("web-panels-browser").removeEventListener("load", this, true);
      this.sidebarWindow.removeEventListener("unload", this, false);
    },
    load: function(event){
      var doc = event.originalTarget;
      var href = doc.location.href;
        if( !/^chrome:/.test(href) )return;
        if (that.INFO) that.debug("load Webpanel " +  href);
        setTimeout(function(doc){that.runScripts(doc);
          setTimeout(function(doc){that.runOverlays(doc);},0, doc);
        },0, doc);
    }
  }
})();
