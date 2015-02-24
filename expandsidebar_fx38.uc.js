// ==UserScript==
// @name           expandsidebar_fx38.uc.js
// @description    サイドバーの自動開閉
// @namespace      http://forums.mozillazine.org/viewtopic.php?p=2592073#2592073
// @include        chrome://browser/content/browser.xul
// @compatibility  Firefox 38
// @author         Alice0775
// @Note           _SIDEBARPOSITIONにあなたの環境におけるサイドバーの位置を指示しておく
// @Note           keycongigやmousegesture等には SidebarUI.toggle(何タラ);
// @Note
// @version        2015/02/20 22:00 fix due to Bug 1123517
// @version        2014/10/31 22:00 fix due to Bug 714675
// @version        2014/05/22 12:00 fix var
// @version        2013/03/03 00:00 fix It close too soon when it opened from a button or menu
// @version        2013/02/26 00:00 fix close delay 
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2012/08/04 09:00 private browsingを考慮
// @version        2012/08/04 09:00 hiddenではなくcollapsedを使うように
// @version        2012/02/08 14:00 splitter width in full screen
// @version        2011/05/26 12:00 5.0a2でマウスが要素上通過する時, 移動速度が速すぎるとmouseoverイベントが発火しない? 感度が落ちた?
// @version        2011/03/24 12:00 ドラッグオーバー遅延を別設定とした
// @version        2010/10/30 18:00 http://hg.mozilla.org/mozilla-central/pushloghtml?fromchange=84baf90b040c&tochange=16eac4b8b8e0
// @version        2010/10/09 18:00 Windows7 Aero
// @version        2009/06/06 20:00 ドラッグオーバーで閉じてしまうので
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
  _inFullscreen: true,     //Fullscreen時の挙動をFirefox31当時の物にする
  //ここまで
// --- config ---

  _MOUSEMOVEINTERVAL: 10,  //マウスの位置をチェックする間隔
  _CHECKBOX_AT_STARUP:false, //チェックボックスの初期値
  _CLOSE_AT_STARTUP:true, //最初は閉じておく
  _lastcommand: null,
  _backup_lastcommand:null,
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

    var style = ' \
    @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
 \
    #main-window #sidebar-splitter:-moz-system-metric(windows-default-theme) \
    { \
      -moz-box-align: center; \
      -moz-box-pack: center; \
      cursor: ew-resize; \
      border-width: 0 2px; \
      border-style: solid; \
      -moz-border-left-colors: ThreeDShadow ThreeDHighlight; \
      -moz-border-right-colors: ThreeDDarkShadow ThreeDFace; \
      width: 2px; \
      max-width: 2px; \
      min-width: 0px; \
      background-color: ThreeDFace; \
      margin-left: 0px; \
    } \
    #navigator-toolbox[inFullscreen="true"] #sidebar-box[hidden="true"] + #sidebar-splitter, \
    #main-window[inFullscreen="true"] #sidebar-box[hidden="true"] + #sidebar-splitter \
    { \
      width: 0px; \
      max-width: 1px; \
      min-width: 0px; \
      border-left-width: 0px; \
      border-right-width: 1px; \
      background-color: ThreeDFace; \
    } ';
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

    this._sidebar_box = document.getElementById('sidebar-box');
    if (this._sidebar_box.hasAttribute('hidden') ||
        this._CLOSE_AT_STARTUP) {
      this._sidebar_box.collapsed = true;
    }
    this._sidebar_box.hidden = false;

    this._sidebar = document.getElementById('sidebar');

    this._sidebar_splitter = document.getElementById('sidebar-splitter');
    if (this._sidebar_splitter.hasAttribute('hidden')) {
      this._sidebar_splitter.removeAttribute('hidden');
    }
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
      '$& \
      if(document.getElementById("sidebar-box") && \
         !!document.getElementById("sidebar-box").getAttribute("sidebarcommand")) \
        window.ucjs_expand_sidebar.toggleSidebar("");'
    ));

    /**
     * helper functions
     */
		function accessorDescriptor(field, fun) {
		  var desc = { enumerable: true, configurable: true };
		  desc[field] = fun;
		  return desc;
		}

		function defineGetter(obj, prop, get) {
		  if (Object.defineProperty)
		    return Object.defineProperty(obj, prop, accessorDescriptor("get", get));
		  if (Object.prototype.__defineGetter__)
		    return obj.__defineGetter__(prop, get);

		  throw new Error("browser does not support getters");
		}

		function defineSetter(obj, prop, set) {
		  if (Object.defineProperty)
		    return Object.defineProperty(obj, prop, accessorDescriptor("set", set));
		  if (Object.prototype.__defineSetter__)
		    return obj.__defineSetter__(prop, set);

		  throw new Error("browser does not support setters");
		}


    /**
     * hack
     */
		defineGetter(SidebarUI, "isOpen", function isOpen(){return !this._box.collapsed;})

		/*
		SidebarUI.toggle =
		function toggle(commandID = this.currentID) {
		    if (this.isOpen && commandID == this.currentID) {
		      this.hide();
		      return Promise.resolve();
		    } else {
		      return this.show(commandID);
		    }
		  }
		*/

		SidebarUI.show =
		function show(commandID) {
	    return new Promise((resolve, reject) => {
	      let sidebarBroadcaster = document.getElementById(commandID);
	      if (!sidebarBroadcaster || sidebarBroadcaster.localName != "broadcaster") {
	        reject(new Error("Invalid sidebar broadcaster specified"));
	        return;
	      }

	      let broadcasters = document.getElementsByAttribute("group", "sidebar");
	      for (let broadcaster of broadcasters) {
	        // skip elements that observe sidebar broadcasters and random
	        // other elements
	        if (broadcaster.localName != "broadcaster") {
	          continue;
	        }

	        if (broadcaster != sidebarBroadcaster) {
	          broadcaster.removeAttribute("checked");
	        } else {
	          sidebarBroadcaster.setAttribute("checked", "true");
	        }
	      }

	      //this._box.hidden = false;
	      this._box.collapsed = false;
	      this._splitter.hidden = false;
        ucjs_expand_sidebar._loadKeepItSizes(commandID);
        ucjs_expand_sidebar._opend = true;
        if ("treeStyleTab" in gBrowser)
          gBrowser.treeStyleTab.updateFloatingTabbar(gBrowser.treeStyleTab.kTABBAR_UPDATE_BY_WINDOW_RESIZE);

	      this._box.setAttribute("sidebarcommand", sidebarBroadcaster.id);

	      let title = sidebarBroadcaster.getAttribute("sidebartitle");
	      if (!title) {
	        title = sidebarBroadcaster.getAttribute("label");
	      }
	      this._title.value = title;

	      let url = sidebarBroadcaster.getAttribute("sidebarurl");
	      this.browser.setAttribute("src", url); // kick off async load

	      // We set this attribute here in addition to setting it on the <browser>
	      // element itself, because the code in SidebarUI.uninit() persists this
	      // attribute, not the "src" of the <browser id="sidebar">. The reason it
	      // does that is that we want to delay sidebar load a bit when a browser
	      // window opens. See delayedStartup() and SidebarUI.startDelayedLoad().
	      this._box.setAttribute("src", url);

	      if (this.browser.contentDocument.location.href != url) {
	        let onLoad = event => {
	          this.browser.removeEventListener("load", onLoad, true);

	          // We're handling the 'load' event before it bubbles up to the usual
	          // (non-capturing) event handlers. Let it bubble up before firing the
	          // SidebarFocused event.
	          setTimeout(() => this._fireFocusedEvent(), 0);

	          // Run the original function for backwards compatibility.
	          sidebarOnLoad(event);

	          resolve();
	        };

	        this.browser.addEventListener("load", onLoad, true);
	      } else {
	        // Older code handled this case, so we do it too.
	        this._fireFocusedEvent();
	        resolve();
	      }
	    });
	  }

		SidebarUI.hide =
		function hide() {
	    if (!this.isOpen) {
	      return;
	    }

	    let commandID = this._box.getAttribute("sidebarcommand");
	    let sidebarBroadcaster = document.getElementById(commandID);

	    if (sidebarBroadcaster.getAttribute("checked") != "true") {
	      return;
	    }

	    // Replace the document currently displayed in the sidebar with about:blank
	    // so that we can free memory by unloading the page. We need to explicitly
	    // create a new content viewer because the old one doesn't get destroyed
	    // until about:blank has loaded (which does not happen as long as the
	    // element is hidden).
	    //this.browser.setAttribute("src", "about:blank");
	    //this.browser.docShell.createAboutBlankContentViewer(null);

      ucjs_expand_sidebar._saveKeepItSizes(commandID);
	    sidebarBroadcaster.removeAttribute("checked");
	    //this._box.setAttribute("sidebarcommand", "");
	    //this._title.value = "";
	    //this._box.hidden = true;
	    //this._splitter.hidden = true;
	    this._box.collapsed = true;
	    //this._splitter.hidden = true;
        if ("treeStyleTab" in gBrowser)
          gBrowser.treeStyleTab.updateFloatingTabbar(gBrowser.treeStyleTab.kTABBAR_UPDATE_BY_WINDOW_RESIZE);
	    gBrowser.selectedBrowser.focus();
	  }

    //fireSidebarFocusedEventの置き換え
    //
    var func = fireSidebarFocusedEvent.toString();
    var new_cmd = "ucjs_expand_sidebar._focused(); $& ";
    func = func.replace(/}$/, new_cmd);
    eval('fireSidebarFocusedEvent = ' + func + ';');

    //起動時 閉じておく?

    setTimeout(function(self) {
      var broadcasters = document.getElementsByAttribute("group", "sidebar");
      if (self._CLOSE_AT_STARTUP) {
        SidebarUI.hide();
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

    }, 500, this);

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

    Services.obs.addObserver(this, "private-browsing", false);
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

     Services.obs.removeObserver(this, "private-browsing");
  },

  _back_url: null,
  _back_cachedurl: null,
  observe: function(aSubject, aTopic, aData) {
    var self = ucjs_expand_sidebar;
    if (aData == "enter") {
      self._back_url = self._sidebar_box.getAttribute("src");
      if (self._back_url == "chrome://browser/content/web-panels.xul") {
        var b = self._sidebar.contentDocument.getElementById("web-panels-browser");
        self._back_cachedurl = b.getAttribute("cachedurl");
      }
      self._sidebar_box.setAttribute("src", "about:blank");
      self._sidebar.setAttribute("src", "about:blank");
      self._backup_lastcommand = self._lastcommand;
    } else if (aData == "exit") {
      self._lastcommand = self._backup_lastcommand;
      self._backup_lastcommand = null;
      self._sidebar.setAttribute("src", "about:blank");
      if (self._back_url == "chrome://browser/content/web-panels.xul") {
        if (!!self._back_cachedurl) {
          b = self._sidebar.contentDocument.getElementById("web-panels-browser");
          b.setAttribute("cachedurl", self._back_cachedurl);
          document.persist("web-panels-browser", "cachedurl");
          self._back_cachedurl = null;
        }
      }
      self._sidebar_box.setAttribute("src", self._back_url);
      self._back_url = null;
    }
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

    if (self._mousedown) {
      return;
    }
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
        self.toggleSidebar();
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

	toggleSidebar: function expandsidebartoggleSidebar(commandID, forceOpen = false) {
    if (forceOpen) {
      SidebarUI.show(commandID);
    } else {
      SidebarUI.toggle(commandID);
    }
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
    this.toggleSidebar(_command, _forceOpen);
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

    if(/tabbrowser/.test(event.target.localName)){
      return
    }

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

        if (this._close_Timeout || this._opend)
          return;
        this._close_Timeout = setTimeout(function(self){
          self.toggleSidebar();
        }, this._CLOSE_DELAY, this);
      } else {
        if (this._close_Timeout)
          clearTimeout(this._close_Timeout);
        this._close_Timeout = null;
        this._opend = false;
      }
    }
  },

  isChrome: function(aEvent) {
    if (aEvent.target instanceof HTMLElement)
      return false;
    if (/^(tabbrowser|splitter|grippy|menu|panel|notification)/.test(aEvent.target.localName))
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
