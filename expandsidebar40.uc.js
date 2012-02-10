// ==UserScript==
// @name           expandsidebar40.uc.js
// @description    サイドバーの自動開閉
// @namespace      http://forums.mozillazine.org/viewtopic.php?p=2592073#2592073
// @include        chrome://browser/content/browser.xul
// @compatibility  Firefox 3.0 3.5 3.6a1pre
// @author         Alice0775
// @Note           _SIDEBARPOSITIONにあなたの環境におけるサイドバーの位置を指示しておく
// @Note           keycongigやmousegesture等には toggleSidebar(何タラ);
// @Note
// @version        2012/02/08 14:00 splitter width in full screen
// @version        2011/05/26 12:00 5.0a2でマウスが要素上通過する時, 移動速度が速すぎるとmouseoverイベントが発火しない? 感度が落ちた?
// @version        2011/03/24 12:00 ドラッグオーバー遅延を別設定とした
// @version        2010/10/30 18:00 http://hg.mozilla.org/mozilla-central/pushloghtml?fromchange=84baf90b040c&tochange=16eac4b8b8e0
// @version        2010/10/09 18:00 Windows7 Aero
// @version        2009/06/06 20:00 ドラッグオーバーで閉じてしまうので
// ==/UserScript==
// @version        2009/05/24 18:00 chromeのチェック変更
// @version        2009/04/30 18:00 サイドバーを開閉したときは必ずタイマーをクリアするようにした。
// @version        2009/04/28 00:00 負荷軽減
// @version        2009/04/23 00:00 _KEEP_SIZESが動かなくなっていたので
// @version        2009/04/22 12:00 ドラッグオーバーで開かなくなっていたので
// @version        2009/04/15 21:00 マウスが通過したときは開かないが動かなくなっていたので
// @version        2009/04/15 19:00 細々bug修正
// @version        2009/04/15 02:00 _CLOSEWHENGOOUTが動かなくなっていたので
// @version        2009/04/14 22:00 fx2削除
var ucjs_expand_sidebar = {
// --- config ---
  //ここから
  _OPEN_DELAY: 9999999,   //for open by mouseover
  _OPEN_DELAY_DRAGOVER: 400,   //for open by dragover
  _CLOSE_DELAY: 800,      //for close
  _SCROLLBAR_DELAY: 1000, //for スクロールバーを操作後, 自動的に開閉を許可するまでの時間
  _DEFAULTCOMMAND: "viewBookmarksSidebar", // デフォルトのサイドバー
  _TOLERANCE: 0,          // 認識するウィンドウ左端とする範囲(TreeStyleTab等使用の場合は0がいいかも)
  _DONOTCLOSE_XULELEMENT: true, // マウスがXULエレメント上ならクローズしない(コンテンツにXULを表示している場合もクローズしなくなる)
  _CLOSEWHENGOOUT:  false, // ウィンドウ外にマウスが移動した際に: true:閉じる, [false]:閉じない
  _SIDEBARPOSITION: "L",   //サイドバーの位置 左側:L 右側:R
                           //ただし, バーチカルツールバーGomita氏作 VerticalToolbar.uc.js 0.1
                           //(http://www.xuldev.org/blog/?p=113) を先に実行するようにしておく。
  _KEEP_SIZES:true,        //サイドバーの種類毎に幅を記憶する
  _defaultWidth: 234,      //デフォルトサイドバー幅
  //ここまで
// --- config ---

  _MOUSEMOVEINTERVAL: 10,  //マウスの位置をチェックする間隔
  _CHECKBOX_AT_STARUP:false, //チェックボックスの初期値
  _CLOSE_AT_STARTUP:true, //最初は閉じておく
  _lastcommand: null,
  _open_Timeout: null,
  _close_Timeout: null,
  _sidebar_box:null,
  _sidebar:null,
  _sidebar_splitter:null,
  _checkbox:null,
  _content:null,
  _opend:false,
  _mousedown:false,
  _mouse_Timeout: null,
  _resizeTimer: null,
  _mtimer: false,
  _startup:true,

  sizes:[],
  prefKeepItSizes: "userChrome.expandSidebar.keepItSizes",

  init: function(){
    if ("EzSidebarService" in window)
      return;

    var style = <><![CDATA[
    @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);

    #main-window #sidebar-splitter:-moz-system-metric(windows-default-theme)
    {
      -moz-box-align: center;
      -moz-box-pack: center;
      cursor: ew-resize;
      border-width: 0 2px;
      border-style: solid;
      -moz-border-left-colors: ThreeDShadow ThreeDHighlight;
      -moz-border-right-colors: ThreeDDarkShadow ThreeDFace;
      width: 2px;
      max-width: 2px;
      min-width: 0px;
      background-color: ThreeDFace;
      margin-left: 0px;
    }
    #navigator-toolbox[inFullscreen="true"] #sidebar-box[hidden="true"] + #sidebar-splitter,
    #main-window[inFullscreen="true"] #sidebar-box[hidden="true"] + #sidebar-splitter
    {
      width: 0px;
      max-width: 1px;
      min-width: 0px;
      border-left-width: 0px;
      border-right-width: 1px;
      background-color: ThreeDFace;
    }
    ]]></>.toString();
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

    this._sidebar_box = document.getElementById('sidebar-box');
    this._sidebar = document.getElementById('sidebar');
    this._sidebar_splitter = document.getElementById('sidebar-splitter');
    if(this._sidebar_splitter.hasAttribute('hidden'))
      this._sidebar_splitter.removeAttribute('hidden');
    this._sidebar_splitter.setAttribute('collapsed', false);

    var checkbox = document.createElement('checkbox');
    checkbox.setAttribute("id", "sidebar-checkbox");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("label", "\u00ab");
    checkbox.setAttribute("checked", this._CHECKBOX_AT_STARUP);
    checkbox.setAttribute('persist','checked');
    var item = document.getElementById('sidebar-throbber');
    this._checkbox = item.parentNode.insertBefore(checkbox, item);

    if(this._SIDEBARPOSITION == "R"){
      (function(self){ //this code from http://pc11.2ch.net/test/read.cgi/software/1185343069/128
        self._sidebar_splitter = self._sidebar_box.parentNode.appendChild(self._sidebar_splitter);
        self._sidebar_box = self._sidebar_box.parentNode.appendChild(self._sidebar_box);
      })(this);
    }

    eval("PrintUtils.printPreview = " + PrintUtils.printPreview.toString().replace(
      '{',
      <><![CDATA[
      $&
      if(document.getElementById("sidebar-box") &&
         !!document.getElementById("sidebar-box").getAttribute("sidebarcommand"))
        window.toggleSidebar("");
      ]]></>
    ));

    //toggleSidebarの置き換え
    var func = toggleSidebar.toString();
    // Splitter should be shown always
    // sidebarSplitter.hidden = true;
    // sidebarSplitter.hidden = false;
    new_cmd = "sidebarSplitter.removeAttribute('hidden');";
    func = func.replace(/sidebarSplitter.hidden = true;/g, new_cmd);
    new_cmd = "sidebarSplitter.removeAttribute('hidden');";
    func = func.replace(/sidebarSplitter.hidden = false;/g, new_cmd);

    // Remember last commandID
    // var sidebarBroadcaster = document.getElementById(commandID);
    new_cmd = " $& if (!!commandID){ ucjs_expand_sidebar._lastcommand = commandID;ucjs_expand_sidebar._loadKeepItSizes(commandID);}";
    // sidebarbutton を 使用しているとき see sidebarbutton_2.1.11.uc.js付属のreadme.txt
    // new_cmd = " $& if (!!commandID && commandID !='viewWebPanelsSidebar') ucjs_expand_sidebar._lastcommand = commandID;";
    func = func.replace(/var sidebarBroadcaster = document\.getElementById\(commandID\);/, new_cmd);
/*

    // fail safe?
    // var sidebarBroadcaster = document.getElementById(commandID);
    new_cmd = " $& if (!sidebarBroadcaster) {return;}";
    func = func.replace(/var sidebarBroadcaster = document\.getElementById\(commandID\);/, new_cmd);

    // Resize sidebar by commandID
    // fireSidebarFocusedEvent();
    // }
    new_cmd = " $& if (sidebarBox.getAttribute('collapsed') != 'true') ucjs_expand_sidebar._loadKeepItSizes();";
    func = func.replace(/fireSidebarFocusedEvent\(\);/, new_cmd);
    new_cmd = "if (sidebarBox.getAttribute('collapsed') != 'true') ucjs_expand_sidebar._loadKeepItSizes(); $&";
    func = func.replace(/}$/, new_cmd);

    // return and clear timer
    // return;
    // }
    new_cmd = "ucjs_expand_sidebar._clearOpenCloseTimer(); $&";
    func = func.replace(/return;/g, new_cmd);
    func = func.replace(/}$/, new_cmd);
*/
    eval('toggleSidebar = ' + func + ';');
    //this.debug(toggleSidebar.toString());

    //fireSidebarFocusedEventの置き換え
    //
    var func = fireSidebarFocusedEvent.toString();
    new_cmd = "ucjs_expand_sidebar._focused(); $& ";
    func = func.replace(/}$/, new_cmd);
    eval('fireSidebarFocusedEvent = ' + func + ';');

    //起動時 閉じておく?

    setTimeout(function(self) {
      var broadcasters = document.getElementsByAttribute("group", "sidebar");
      if (self._CLOSE_AT_STARTUP) {
        toggleSidebar('');
        //self._sidebar_box.setAttribute('collapsed',true);
        for (var i = 0; i < broadcasters.length; ++i) {
          if (broadcasters[i].localName != "broadcaster") {
              continue;
          }
          broadcasters[i].removeAttribute("checked");
        }
      } else {
        for (var i = 0; i < broadcasters.length; ++i) {
          if (broadcasters[i].localName != "broadcaster") {
            continue;
          }
          if (broadcasters[i].hasAttribute("checked")) {
            self._loadKeepItSizes();
            break;;
          }
        }
      }

    }, this._CLOSE_AT_STARTUP ? 0 : 500, this);

    this._content = document.getElementById("content");

    if (this._CLOSEWHENGOOUT)
      window.addEventListener("mouseout", ucjs_expand_sidebar._mouseout, true);
    else
      this._sidebar_splitter.addEventListener("mouseout", ucjs_expand_sidebar._mouseout, true);

    if (this._KEEP_SIZES)
      window.addEventListener("resize", this, false);

    if (this._SIDEBARPOSITION == "R"){
      gBrowser.mPanelContainer.addEventListener("mouseup", this, true);
      gBrowser.mPanelContainer.addEventListener("mousedown", this, true);
    }

    //this._content.addEventListener("mouseover", ucjs_expand_sidebar._mousemove, true);
    document.getElementById("browser").addEventListener("mousemove", ucjs_expand_sidebar._mousemove, false);
    this._sidebar_box.addEventListener("mouseover", ucjs_expand_sidebar._mouseover, false);
    this._sidebar_splitter.addEventListener("dblclick", this, false);
    this._sidebar_splitter.addEventListener("dragover", this, false);
  },

  uninit: function(){
    if (this._CLOSEWHENGOOUT)
      window.removeEventListener("mouseout", ucjs_expand_sidebar._mouseout, true);
    else
      this._sidebar_splitter.removeEventListener("mouseout", ucjs_expand_sidebar._mouseout, true);

    if (this._KEEP_SIZES)
      window.removeEventListener("resize", this, false);

    if (this._SIDEBARPOSITION == "R"){
      gBrowser.mPanelContainer.removeEventListener("mouseup", this, true);
      gBrowser.mPanelContainer.removeEventListener("mousedown", this, true);
    }

    //this._content.removeEventListener("mouseover", ucjs_expand_sidebar._mousemove, true);
    document.getElementById("browser").removeEventListener("mousemove", ucjs_expand_sidebar._mousemove, false);
    this._sidebar_box.removeEventListener("mouseover", ucjs_expand_sidebar._mouseover, false);
    this._sidebar_splitter.removeEventListener("dblclick", this, false);
    this._sidebar_splitter.removeEventListener("dragover", this, false);
  },

  handleEvent: function(event){
    event = new XPCNativeWrapper(event);
    switch (event.type){
      case "mouseup":
          if (this._mouse_Timeout)
            clearTimeout(this._mouse_Timeout);
          this._mouse_Timeout = setTimeout(function(self) {
            self._mousedown = false;
            self._checkWindowSideOrNot(event);
          },this._SCROLLBAR_DELAY,this);
          break;
      case "mousedown":
          if (event.screenX < this._sidebar_splitter.screenX - this._TOLERANCE)
            break;
          this._mousedown = true;
          if (this._mouse_Timeout)
            clearTimeout(this._mouse_Timeout);
          this._mouse_Timeout = null;
          this._clearOpenCloseTimer();
          break;
      case "dblclick":
          if (this._mouse_Timeout)
            clearTimeout(this._mouse_Timeout);
          this._mouse_Timeout = null;
          this._openSidebar(this._getDefaultCommandID());
          this._mousedown = false;
          break;
      case "dragover":
          if (this._mouse_Timeout)
            clearTimeout(this._mouse_Timeout);
          this._mouse_Timeout = null;
          this._mousedown = false;
            if (this._close_Timeout)
              clearTimeout(this._close_Timeout);
            this._close_Timeout = null;
            if(!this._open_Timeout){
              this._open_Timeout = setTimeout(function(self){
                 self._openSidebar(self._getDefaultCommandID(), true);
              }, this._OPEN_DELAY_DRAGOVER, this);
            }
            //this._openSidebar();
          break;
      case "resize":
        if (this._resizeTimer)
          clearTimeout(this._resizeTimer);
        if (this._startup) {
          this._startup = false;
          return;
        }
        this._resizeTimer = setTimeout(function(self) {
          //サイドバーが開いているならそのサイズを保存しておく
          var hidden = self._sidebar_box.hasAttribute('hidden') ? true : false;
          if (!hidden && self._sidebar_box.getAttribute('collapsed') != "true" ) {
            var size = self._sidebar_box.width;
            //現在のコマンドをget
            var _command =  self.getCommandId();
            if (!!_command){
              self._saveKeepItSizes(_command, size);
            }
          }
        }, 500, this);
        break;
    }
  },

  //負荷軽減のため分離
  _mouseover: function(event){
    ucjs_expand_sidebar._checkWindowSideOrNot(event);
  },

  _mousemove: function(event){
    var self = ucjs_expand_sidebar;
    if (self._mtimer)
      return;
    self._mtimer = true;
    setTimeout(function(self){
      self._mtimer = false;
    }, self._MOUSEMOVEINTERVAL, self);

    if (event.originalTarget == self._sidebar_splitter) {
      self._checkWindowSideOrNot(event);
      return;
    }

    if (self._mousedown == true)
      return;
    self._checkWindowSideOrNot(event);
  },

  _mouseout: function(event){
    var self = ucjs_expand_sidebar;
    if (self._mouse_Timeout)
      clearTimeout(self._mouse_Timeout);
    self._mouse_Timeout = null;
    //オープン直後なら何もしない
    if (self._opend) return;
    //通過しただけなら開かない
    if(!self._CLOSEWHENGOOUT){
      if (self._sidebar_splitter == event.originalTarget){
        if (self._open_Timeout)
          clearTimeout(self._open_Timeout);
        self._open_Timeout = null;
      }
      return;
    }
    //チェックなら閉じない
    if (self._checkbox.checked) return;
    if (/^menu|browser|tooltip/.test(event.originalTarget.localName)) return;
    if (self._sidebar.contentWindow.location.href == "chrome://browser/content/web-panels.xul") return;
    if (!self._close_Timeout) {
      //self.debug(event.type + "  " + event.originalTarget.localName + "  " + event.target.localName );
      if (self._open_Timeout)
        clearTimeout(self._open_Timeout);
      self._open_Timeout = null;
      self._close_Timeout = setTimeout(function(self){
        self._mousedown = false;
        toggleSidebar();
      }, self._CLOSE_DELAY, self);
    }
  },

  //現在のコマンドをget
  getCommandId: function(){
    var _command = "";
    var broadcasters = document.getElementsByAttribute("group", "sidebar");
    for (var i = 0; i < broadcasters.length; ++i) {
      if (broadcasters[i].localName != "broadcaster") {
          continue;
      }
      if (broadcasters[i].hasAttribute('checked')) {
        _command = broadcasters[i].id;
        break;;
      }
    }
    return _command;
  },

  _loadKeepItSizes: function(_command){
      if (this._KEEP_SIZES) {
        if (!_command)
          _command = this.getCommandId();
        if(!!_command) {
          this.sizes = this.getPref(this.prefKeepItSizes, 'str', '').split('|');
          var index = this.sizes.indexOf(_command);
          if (index < 0 ){
            this.sizes.push(_command);
            index = this.sizes.length - 1;
            this.sizes.push(this._defaultWidth);
          }
          this._sidebar_box.width = this.sizes[index + 1];
          return;
        }
      }

      if (this._sidebar_box.width == 0) {
        this._sidebar_box.width = this._defaultWidth;
      }
  },

  _saveKeepItSizes: function(_command, size){
    if (!this._KEEP_SIZES)
      return;
    if (!!_command && size) {
      //this.debug(_command + "  "+ size);
      var index = this.sizes.indexOf(_command);
      if (index < 0 ){
        this.sizes.push(_command);
        this.sizes.push(size);
      } else {
        this.sizes[index + 1] = size;
      }
      var str = this.sizes.join('|');
      this.setPref(this.prefKeepItSizes, 'str', str);
    }
  },

  _openSidebar: function(_command, _forceOpen){
    this._clearOpenCloseTimer();
    toggleSidebar(_command, _forceOpen);
    //mouseoutを処理するかどうかのフラグオープン直後はtrue
    this._opend = true;
    if(this._mouseoutTimer)
      clearTimeout(this._mouseoutTimer);
    //open後200msec経過すればmouseoutを処理できるように falseにする
    this._mouseoutTimer = setTimeout(function(that){that._opend = false;},300,this);
  },

  _focused: function(){
    //検索ボックスあれば,そこをフォーカス
    var doc = this._sidebar.contentWindow.document;
    if (doc) {
      var elem = doc.getElementById("search-box");
      if (elem) {
        try {
          setTimeout(function(doc, elem){
            doc.defaultView.focus();
            elem.focus();
          }, 300, doc, elem)
        } catch(e) {}
      }
    }
  },

  _getDefaultCommandID: function(_command){
    if(!_command) _command = this._lastcommand;
    if(!_command) _command = this._DEFAULTCOMMAND;
    return _command;
  },

  _clearOpenCloseTimer: function() {
    if (this._close_Timeout)
      clearTimeout(this._close_Timeout);
    this._close_Timeout = null;
    if (this._open_Timeout)
      clearTimeout(this._open_Timeout);
    this._open_Timeout = null;
  },

  _checkMouseIsWindowEdge: function(x) {
    var sw = this._sidebar_splitter.boxObject.width;
    if (this._SIDEBARPOSITION == "L") {
      //ウインドウの左端x座標
      if ( 0 <= x && x <= sw + this._TOLERANCE)
        return true;
    }else if(this._SIDEBARPOSITION == "R") {
      //ウインドウの右端x座標
      if (-this._TOLERANCE <= x && x <= sw)
        return true;
    }
    return false;
  },

  _checkMouseIsSidebarEdge: function(x){
    var sw = this._sidebar_splitter.boxObject.width;
    if (this._SIDEBARPOSITION == "L") {
      //ウインドウの左端x座標
      if(sw + this._TOLERANCE < x)
        return true;
    } else if(this._SIDEBARPOSITION == "R") {
      //ウインドウの右端x座標
      if (x <  -this._TOLERANCE)
        return true;
    }
    return false;
  },

  _checkWindowSideOrNot: function(event){
    var sidebar_box = this._sidebar_box;
    if (sidebar_box.width == 0)
      sidebar_box.width = this._defaultWidth;//デフォルトサイドバー幅

    //コンテンツエリアの上下範囲外かどうか
    var y = event.screenY - gBrowser.mPanelContainer.boxObject.screenY;
    if(y < 0 || y > gBrowser.mPanelContainer.boxObject.height){
      this._clearOpenCloseTimer();
      return
    }

//this.debug(event.type+"\n"+event.screenX+"\n"+this._sidebar_splitter.boxObject.screenX+"\n"+(event.target instanceof HTMLElement || /browser/.test(event.target.localName) ))
    var hidden = (sidebar_box.hasAttribute('hidden')?true:false) ||
                  sidebar_box.getAttribute('collapsed') == "true";
    var x = event.screenX - this._sidebar_splitter.boxObject.screenX;
    //ウインドウの端かどうか
    if (hidden) {
      if (event.originalTarget == this._sidebar_splitter ||
          this._checkMouseIsWindowEdge(x)) {
        if (this._close_Timeout)
          clearTimeout(this._close_Timeout);
        this._close_Timeout = null;
        if (!this._open_Timeout) {
          this._open_Timeout = setTimeout(function(self){
            self._openSidebar(self._getDefaultCommandID());
          }, this._OPEN_DELAY, this);
        }
      } else {
        if (this._open_Timeout)
          clearTimeout(this._open_Timeout);
        this._open_Timeout = null;
      }
      return;
    }
    //サイドバーのコンテンツ側のx座標
    if (!this._checkbox.checked && !hidden) {
      if (event.originalTarget != this._sidebar_splitter &&
          this._checkMouseIsSidebarEdge(x) &&
          !(this._DONOTCLOSE_XULELEMENT && this.isChrome(event)) /*||
          (event.type == "mouseover" &&
           (event.target instanceof HTMLElement || /browser/.test(event.target.localName)) )*/ ) {
        if (this._open_Timeout)
          clearTimeout(this._open_Timeout);
        this._open_Timeout = null;
        if (!this._close_Timeout) {
          this._close_Timeout = setTimeout(function(self){
            toggleSidebar();
          }, this._CLOSE_DELAY, this);
        }
      } else {
        if (this._close_Timeout)
          clearTimeout(this._close_Timeout);
        this._close_Timeout = null;
      }
    }
  },

  isChrome: function(aEvent) {
    if (aEvent.target instanceof HTMLElement)
      return false;
    if (/^(tabbrowser|splitter|grippy|menu|panel)/.test(aEvent.target.localName))
      return true;
    var box = gBrowser.mPanelContainer.boxObject;
    var x = aEvent.screenX;
    var y = aEvent.screenY;
    var bx = box.screenX;
    var by = box.screenY;
    if (bx <= x && x <= bx + box.width &&
        by <= y && y <= by + box.height)
      return false;
    else
      return true;
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

  debug: function(aMsg){
   // return;
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    Cc["@mozilla.org/consoleservice;1"]
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aMsg);
  }
};

// エントリポイント
  ucjs_expand_sidebar.init();
  window.addEventListener("unload", function(){ ucjs_expand_sidebar.uninit(); }, false);
