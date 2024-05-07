// ==UserScript==
// @name           expandsidebar_fx58.uc.js
// @description    サイドバーの自動開閉
// @namespace      http://forums.mozillazine.org/viewtopic.php?p=2592073#2592073
// @include        main
// @compatibility  Firefox 127
// @author         Alice0775
// @Note           _SIDEBARPOSITIONにあなたの環境におけるサイドバーの位置を指示しておく
// @Note           keycongigやmousegesture等には SidebarUI.toggle(何タラ);
// @Note
// @version        2024/05/05 Bug 1892965 - Rename Sidebar launcher and SidebarUI
// @version        2024/03/19 WIP Bug 1884792 - Remove chrome-only :-moz-lwtheme pseudo-class
// @version        2023/10/10 00:00 Stop using xml-stylesheet processing instructions
// @version        2023/08/31 fix z-index
// @version        2023/08/25 make hidden overflowed header
// @version        2023/03/09 Bug 1820534 - Move front-end to modern flexbox.
// @version        2023/03/09 Bug 1820534 - Move front-end to modern flexbox.
// @version        2022/10/14 20:00 sidebar width:100%
// @version        2022/09/30 20:00 Bug 1792748
// @version        2022/09/14 11:00 box width:auto
// @version        2022/08/26 Bug 1695435 - Remove @@hasInstance for IDL interfaces in chrome context
// @version        2021/11/14 21:00 css
// @version        2021/11/14 13:00 no longer close when print preview
// @version        2021/09/30 22:00 change splitter color
// @version        2020/12/14 00:00 vtb
// @version        2020/07/14 00:00 style
// @version        2019/12/09 18:00 fix 72 Bug 1582530
// @version        2019/12/05 18:00 fix 72 Bug 1492582 - browser.xhtml: Migrate root xul:window element to an html:html element
// @version        2019/12/05 17:00 fix 71 Bug 1582530 - Turn on `layout.css.xul-box-display-values.survive-blockification.enabled` by default
// @version        2019/12/05 10:00 fix 70 Bug 1558914 - Disable Array generics in Nightly
// @version        2019/09/04 Fx69
// @version        2018/07/03 Fx61 fix regression from remove loadoverlay
// @version        2018/07/03 Fx61 remove loadoverlay
// @version        2018/06/25 Fx61 wip
// @version        2018/01/25 Fx58 wip
// @version        2017/11/18 Fx57
// @version        2017/11/18 nsIPrefBranch2 to nsIPrefBranch
// @version        2017/02/01 00:00 enable floating(overlay) sidebar
// @version        2017/01/19 00:00 change event phase,target
// @version        2015/08/29 00:00 fix lastused command
// @version        2015/05/13 19:00 fix lastused command
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
  _FLOATING_SIDEBAR: true, //enable floating(overlay) sidebar, (known issue:can't resize sidebar.)
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

  jsonToDOM: function(jsonTemplate, doc, nodes) {
    jsonToDOM.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
    };
    jsonToDOM.defaultNamespace = jsonToDOM.namespaces.xul;
    function jsonToDOM(jsonTemplate, doc, nodes) {
      function namespace(name) {
          var reElemNameParts = /^(?:(.*):)?(.*)$/.exec(name);
          return { namespace: jsonToDOM.namespaces[reElemNameParts[1]], shortName: reElemNameParts[2] };
      }

      // Note that 'elemNameOrArray' is: either the full element name (eg. [html:]div) or an array of elements in JSON notation
      function tag(elemNameOrArray, elemAttr) {
        // Array of elements?  Parse each one...
        if (Array.isArray(elemNameOrArray)) {
          var frag = doc.createDocumentFragment();
          Array.prototype.forEach.call(arguments, function(thisElem) {
            frag.appendChild(tag.apply(null, thisElem));
          });
          return frag;
        }

        // Single element? Parse element namespace prefix (if none exists, default to defaultNamespace), and create element
        var elemNs = namespace(elemNameOrArray);
        var elem = doc.createElementNS(elemNs.namespace || jsonToDOM.defaultNamespace, elemNs.shortName);

        // Set element's attributes and/or callback functions (eg. onclick)
        for (var key in elemAttr) {
          var val = elemAttr[key];
          if (nodes && key == "keyvalue") {
              nodes[val] = elem;
              continue;
          }

          var attrNs = namespace(key);
          if (typeof val == "function") {
            // Special case for function attributes; don't just add them as 'on...' attributes, but as events, using addEventListener
            elem.addEventListener(key.replace(/^on/, ""), val, false);
          } else {
            // Note that the default namespace for XML attributes is, and should be, blank (ie. they're not in any namespace)
            elem.setAttributeNS(attrNs.namespace || "", attrNs.shortName, val);
          }
        }

        // Create and append this element's children
        var childElems = Array.prototype.slice.call(arguments, 2);
        childElems.forEach(function(childElem) {
          if (childElem != null) {
            elem.appendChild(
                doc.defaultView.Node.isInstance(childElem)
                /*childElem instanceof doc.defaultView.Node*/ ? childElem :
                    Array.isArray(childElem) ? tag.apply(null, childElem) :
                        doc.createTextNode(childElem));
          }
        });
        return elem;
      }
      return tag.apply(null, jsonTemplate);
    }

    return jsonToDOM(jsonTemplate, doc, nodes);
  },

  init: function(){
    if ("EzSidebarService" in window)
      return;
    this._sidebar_box = document.getElementById('sidebar-box');

    var style = ` 
    @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);     
    #sidebar-checkbox {
      border: 1px solid currentColor !important;
      width: 16px !important;
      height: 16px !important;
      overflow-x: hidden !important;
    }
    #sidebar-checkbox .checkbox-check {
      min-width: 14px !important;
      min-height: 14px !important;
    }
    
    #sidebar-splitter 
    { 
      /*-moz-box-align: center;*/  /*Bug 1820534*/ 
      /*-moz-box-pack: center;*/
      justify-content: center;
      cursor: ew-resize; 
      border-width: 0 !important;
      border-style: solid; 
      width: 2px; 
      max-width: 2px; 
      min-width: 0px; 
      background-color: transparent;
      border-inline-start-color: var(--toolbar-bgcolor) !important;
      border-inline-end-color: var(--toolbar-bgcolor) !important;
      margin-left: 0px; 
      margin-inline-start: 0px; 
    } 
    #navigator-toolbox[inFullscreen="true"] #sidebar-box[hidden="true"] + #sidebar-splitter, 
    :root[inFullscreen="true"] #sidebar-box[hidden="true"] + #sidebar-splitter 
    { 
      width: 0px; 
      max-width: 1px; 
      min-width: 0px; 
      border-left-width: 0px; 
      border-right-width: 1px; 
      background-color: ThreeDFace; 
    }  
    `;

/*
    var sss = Cc['@mozilla.org/content/style-sheet-service;1']
              .getService(Ci.nsIStyleSheetService);
    var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style));
    if(!sss.sheetRegistered(uri, sss.AUTHER_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AUTHER_SHEET);
*/
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

    if (this._FLOATING_SIDEBAR) {
      // floating css
      var floatingStyle = `
        @namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"); 
 
        #sidebar-box { 
        position: fixed ; 
        display: block; 
        z-index: 100000000; 
        left: 4px; 
        min-width: unset;
        max-width: unset;
        }
        :root:not([lwtheme-image]) #sidebar-box { 
        background-color: var(--toolbar-bgcolor); 
        } 
        :root[lwtheme-image] #sidebar-box { 
        background-color: var(--tabpanel-background-color); 
        } 

        #sidebar-box #sidebar-header 
        { 
        width :100%; 
        overflow: hidden;
        } 
        #sidebar-box #sidebar 
        { 
        height: calc(100vh - 230px); 
        border-left:3px solid var(--toolbar-bgcolor); 
        border-right:3px solid var(--toolbar-bgcolor); 
        border-bottom:3px solid var(--toolbar-bgcolor); 
        } 
        :root[lwtheme] #sidebar-box #sidebar
        { 
        border-left:3px solid var(--sidebar-background-color);
        border-right:3px solid var(--sidebar-background-color);
        border-bottom:3px solid var(--sidebar-background-color);
        } 
 
        #sidebar-box { 
          border-right: 1px solid var(--sidebar-border-color);
          border-bottom: 1px solid var(--sidebar-border-color); 
          
        } 
        #sidebar-box:-moz-locale-dir(rtl) { 
          border-left: 1px solid var(--sidebar-border-color); 
        } 
        :root[lwtheme] #sidebar-box { 
          background-color: var(--sidebar-background-color);
        } 
        :root[lwtheme] #sidebar-box sidebarheader { 
          color: -moz-dialogtext; 
          text-shadow: none; 
          background-color: var(--sidebar-background-color);
          -moz-appearance: toolbox; 
          border-bottom: 1px solid var(--sidebar-border-color); 
          border-top: 1px solid var(--sidebar-border-color); 
        } 
        #sidebar-box #sidebarpopuppanel-bottom { 
        background-color: var(--toolbar-bgcolor); 
        width:100%; 
        }
        :root[lwtheme] #sidebar-box #sidebarpopuppanel-bottom { 
        background-color: var(--sidebar-background-color);
        }`;

      if (this._SIDEBARPOSITION="L") {
        floatingStyle += ' #sidebar-box .PopupResizerGripper { \
        list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABG0lEQVQ4jZXT2ytEURTH8U8UIjNESh5kQq4zGIpci+LBg8vkMhgkl+RhMo0Uf7yHWWo8jDlzXvbZv32+a63fr31o7WnHEDaxj6VW4TTW8YgHbLUC92E2wDKKWEgCtyEVcAEfsc6gJwmcxgpKqGIPExhAd7OxUwFf4QknmMYadrD8H/zruRTwEbLI4za0g0Zj13uuRud5ZGKaL7xiNYnnXUyqJV7EN05D+5NBI8+ToZ2jEnAeI+ht5nk+Op/jDfexX8NGvDf1XIzOd1jEXIRYxgX0J/D8W3Aaz/iM72cFfBljH2MMufBaCTgbWgHvOIschmE7Dg6jcypGLeAa4xiMIjdROBd6Xl1QGXSho+5wCp2hj6ndvlG1XzqPlx+JJSwSgQwohgAAAABJRU5ErkJggg=="); \
        cursor: se-resize; \
        }';
      } else {
        floatingStyle += ' #sidebar-box:-moz-locale-dir(rtl) .PopupResizerGripper { \
        list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIUlEQVQ4jZXRwUsUYRzG8Q8Jthi6SiKEB1lZJdvWXUtBKW3BIA8dajfSUjdlMSU6RFII9cd7mGdBPM3MYYaZ9/0983y/L7TxBluYwwMVry4+4UtCZjBRJWAZ7/EdQ7QwWyWkhlV8xJ+0aaVJKZzJbG5gPyFDBU69TEgTG+ikST84x0o6eZnaA4XQNj6o4OQpTnCNrwqp7TQp5eRhMPr4n5BucEo5qWEe6wm5xmEGSjlpZLiT6mf4mZBSTno4Deua4kTO7zkZt7vrpD4OWVKcwG9c4nn+PIiTY8VJreEt/mKEV1iQWwefcYNv2MnQAP/ufFtJg1+4wK5sbOY5zOJrLEbij/D38BjPgjbCO7jK8JOwHQVhGlPYxgE28/4o63t4cQuE/SwSa1JPlgAAAABJRU5ErkJggg=="); \
        cursor: sw-resize; \
        }';
      }
/*
    uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style));
    if(!sss.sheetRegistered(uri, sss.AUTHER_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AUTHER_SHEET);
*/
       sspi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css,' + encodeURIComponent(floatingStyle) + '"'
      );
      document.insertBefore(sspi, document.documentElement);
      sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
      };

      let template = 
        ["hbox", {id: "sidebarpopuppanel-bottom"},
          ["spacer", {style: "flex: auto;"}],
          ["image", {class: "PopupResizerGripper",
             onmousedown: "if (event.target == this) sidebarpopuppanelResize.start(event);"}]
        ];
      document.getElementById('sidebar-box')
              .appendChild(this.jsonToDOM(template, document, {}));
    }

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
    this._sidebar_splitter.removeAttribute('state');
    this._sidebar_splitter.removeAttribute('collapsed');

    var checkbox = document.createXULElement('checkbox');
    var item = document.getElementById('sidebar-throbber');
    this._checkbox = item.parentNode.insertBefore(checkbox, item);
    checkbox.setAttribute("id", "sidebar-checkbox");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("label", "");
    checkbox.setAttribute('persist','checked');

    
    checkbox.checked = this._CHECKBOX_AT_STARUP;
    
    if(this._SIDEBARPOSITION == "R"){
      (function(self){ //this code from http://pc11.2ch.net/test/read.cgi/software/1185343069/128
        self._sidebar_splitter = self._sidebar_box.parentNode.appendChild(self._sidebar_splitter);
        self._sidebar_box = self._sidebar_box.parentNode.appendChild(self._sidebar_box);
      })(this);
    }

    window.PrintUtils.printPreview_org = PrintUtils.printPreview;
    PrintUtils.printPreview = function(arg) {
      if(document.getElementById("sidebar-box") && 
         !!document.getElementById("sidebar-box").getAttribute("sidebarcommand")) { 
        if (window.ucjs_expand_sidebar._FLOATING_SIDEBAR)
          SidebarController.hide();
      }
      window.PrintUtils.printPreview_org(arg);
    };

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
		defineGetter(SidebarController, "isOpen", function isOpen(){return this._box && !this._box.collapsed;})


		SidebarController.show_org = SidebarController.show;
		SidebarController.show = function show(commandID, triggerNode) {
	      //this._box.hidden = false;
	      this._box.collapsed = false;
	      this._splitter.hidden = false;
        ucjs_expand_sidebar._loadKeepItSizes(commandID);
        ucjs_expand_sidebar._lastcommand = commandID;
        ucjs_expand_sidebar._opend = true;
        if (ucjs_expand_sidebar._FLOATING_SIDEBAR) {
          let x = document.getElementById("appcontent").getBoundingClientRect().x;
          ucjs_expand_sidebar._sidebar_box.style.setProperty("left", x + "px", "");
        }
      SidebarController.show_org(commandID, triggerNode);
	  }

		SidebarController.hide_org = SidebarController.hide;
		SidebarController.hide =
		function hide(triggerNode) {
	    if (!this.isOpen) {
	      return;
	    }

      ucjs_expand_sidebar._saveKeepItSizes(ucjs_expand_sidebar._lastcommand);
	    this._box.collapsed = true;
        if ("treeStyleTab" in gBrowser)
          gBrowser.treeStyleTab.updateFloatingTabbar(gBrowser.treeStyleTab.kTABBAR_UPDATE_BY_WINDOW_RESIZE);
	    gBrowser.selectedBrowser.focus();

	    //SidebarController.hide(triggerNode);
	  }

    //fireSidebarFocusedEventの置き換え
    //
    if (typeof fireSidebarFocusedEvent == "function") {
      window.fireSidebarFocusedEvent_org = fireSidebarFocusedEvent;
      fireSidebarFocusedEvent = function () {
        fireSidebarFocusedEvent_org();
        ucjs_expand_sidebar._focused();
      }
    }

    if (typeof SidebarController._fireFocusedEvent == "function") {
      SidebarController._fireFocusedEvent_org = SidebarController._fireFocusedEvent;
      SidebarController._fireFocusedEvent = function () {
        SidebarController._fireFocusedEvent_org();
        ucjs_expand_sidebar._focused();
      }
    }

    //起動時 閉じておく?

    setTimeout(function(self) {
      var command = self._sidebar_box.getAttribute("sidebarcommand");
      if (command)
        self._lastcommand = command;
      var broadcasters = document.getElementsByAttribute("group", "sidebar");
      if (self._CLOSE_AT_STARTUP) {
        SidebarController.hide();
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

    this._sidebar.style.removeProperty('max-width');
    this._sidebar.style.removeProperty('min-width');
    this._sidebar.style.setProperty('width', '100%', '');

    this._content = document.getElementById("content");

    if (this._CLOSEWHENGOOUT)
      window.addEventListener("mouseout", ucjs_expand_sidebar._mouseout, true);
    else
      this._sidebar_splitter.addEventListener("mouseout", ucjs_expand_sidebar._mouseout, true);

    if (this._KEEP_SIZES)
      window.addEventListener("resize", this, false);

    if (this._SIDEBARPOSITION == "R"){
      gBrowser.tabpanels.addEventListener("mouseup", this, true);
      gBrowser.tabpanels.addEventListener("mousedown", this, true);
    }

    //this._content.addEventListener("mouseover", ucjs_expand_sidebar._mousemove, true);
    document.getElementById("browser").addEventListener("mousemove", ucjs_expand_sidebar._mousemove, true);
    this._sidebar_box.addEventListener("mouseover", ucjs_expand_sidebar._mouseover, true);
    window.addEventListener("dblclick", this, true);
    //window.addEventListener("click", this, true);
    this._sidebar_splitter.addEventListener("dragover", this, true);

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
      gBrowser.tabpanels.removeEventListener("mouseup", this, true);
      gBrowser.tabpanels.removeEventListener("mousedown", this, true);
    }

    //this._content.removeEventListener("mouseover", ucjs_expand_sidebar._mousemove, true);
    document.getElementById("browser").removeEventListener("mousemove", ucjs_expand_sidebar._mousemove, true);
    this._sidebar_box.removeEventListener("mouseover", ucjs_expand_sidebar._mouseover, true);
    window.removeEventListener("dblclick", this, true);
    //window.removeEventListener("click", this, true);
    this._sidebar_splitter.removeEventListener("dragover", this, true);

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
      case "click":
        if (event.button != 2) {
          //return;
        }
        event.preventDefault();
      case "dblclick":
          if(event.originalTarget != this._sidebar_splitter)
            return;
          event.preventDefault();
          event.stopPropagation();
          if (this._mouse_Timeout)
            clearTimeout(this._mouse_Timeout);
          this._mouse_Timeout = null;
          SidebarController.toggle(this._getDefaultCommandID());
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
                 var hidden = (self._sidebar_box.hasAttribute('hidden')?true:false) ||
                               self._sidebar_box.getAttribute('collapsed') == "true";
                 if (hidden) {
                   SidebarController.toggle(self._getDefaultCommandID(), true);
                   self._openSidebar(self._getDefaultCommandID(), true);
                 }
              }, this._OPEN_DELAY_DRAGOVER, this);
            }
          break;
      case "resize":
        if (this._FLOATING_SIDEBAR) {
/*          this._loadKeepItSizes();
          if (this._resizeTimer)
            clearTimeout(this._resizeTimer);
          this._resizeTimer = setTimeout(() => {this._loadKeepItSizes();},250)
*/
          return;
        }
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
            var size = self._sidebar_box.getBoundingClientRect().width;
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
//self.debug(event);
    if (self._mtimer)
      return;
    self._mtimer = true;
    setTimeout(function(self){
      self._mtimer = false;
    }, self._MOUSEMOVEINTERVAL, self);
    
    //self..debug("_mousemove " +event.originalTarget);

    if (event.originalTarget == self._sidebar_splitter) {
      self._checkWindowSideOrNot(event);
      return;
    }
    //self.debug("_mousemove self._mousedown=" +self._mousedown);

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
    return SidebarController._box.getAttribute("sidebarcommand");
  },

	toggleSidebar: function expandsidebartoggleSidebar(commandID, forceOpen = false) {
    if (this._FLOATING_SIDEBAR) {
      let x = document.getElementById("appcontent").getBoundingClientRect().x;
      this._sidebar_box.style.setProperty("left", x + "px", "");
      this._sidebar.style.setProperty("left", x - 1  + "px", "");
    }
    if (forceOpen) {
      SidebarController.show(commandID);
    } else {
      SidebarController.toggle(commandID);
    }
  },

  _loadKeepItSizes: function(_command){
      if (this._KEEP_SIZES) {
        if (!_command)
          _command = this.getCommandId();
        if(!!_command) {
          this.sizes = this.getPref(this.prefKeepItSizes, 'str', 'viewBookmarksSidebar|178|viewHistorySidebar|286|viewGrepSidebar|157|viewUpdateScanSidebar|230|viewWebPanelsSidebar|371|viewWebPageSidebar|371|viewScrapBookSidebar|182|viewAdd-onsSidebar|371|viewStylishSidebar|379|viewMozgestSidebar|234|viewConsole2Sidebar|234|viewGoogleTransitSidebar|371|viewGoogleDocSidebar|371|viewIGoogleSidebar|371|viewPasswordManagerSidebar|371').split('|');
          var index = this.sizes.indexOf(_command);
          if (index < 0 ){
            this.sizes.push(_command);
            index = this.sizes.length - 1;
            this.sizes.push(this._defaultWidth);
          }
          if (this.sizes[index + 1] <= 0)
            this.sizes[index + 1] = this._defaultWidth

          if (this._FLOATING_SIDEBAR) {
            this._sidebar_box.style.setProperty('width', this.sizes[index + 1] + "px", "");
            //this._sidebar.style.setProperty('width', this.sizes[index + 1] - 1  + "px", "");
          } else
            this._sidebar_box.style.setProperty('width', this.sizes[index + 1] + "px", "");

          sidebarpopuppanelResize.setSize(0, this.sizes[index + 1]);
          return;
        }
      }

      if (this._sidebar_box.getBoundingClientRect().width == 0) {
        if (this._FLOATING_SIDEBAR) {
          this._sidebar_box.style.setProperty('width', this._defaultWidth + "px", "");
          //this._sidebar.style.setProperty('width', this._defaultWidth - 1  + "px", "");
        } else {
          this._sidebar_box.style.setProperty('width', this._defaultWidth + "px", "");
        }
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
    //this.toggleSidebar(_command, _forceOpen);
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
          }, 0, doc, elem)
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
    var sw = this._sidebar_splitter.getBoundingClientRect().width;
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
    var sw = this._sidebar_splitter.getBoundingClientRect().width;

    //this.debug("_checkMouseIsSidebarEdge " +(sw + this._TOLERANCE+"px ") + (x+"px "));

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
    if (sidebar_box.getBoundingClientRect().width == 0) {
      sidebar_box.style.setProperty('width', this._defaultWidth + "px", "");//デフォルトサイドバー幅
      //this._sidebar.style.setProperty('width', this._defaultWidth - 1 + "px", "");//デフォルトサイドバー幅
    }
//this.debug(event.target.localName);
/*
    if(/tabbrowser/.test(event.target.localName)){
      return
    }
*/
    //コンテンツエリアの上下範囲外かどうか
    var y = event.screenY - gBrowser.tabpanels.screenY;
    if(y < 0 || y > gBrowser.tabpanels.getBoundingClientRect().height){
      this._clearOpenCloseTimer();
      return
    }

//this.debug(event.type+"\n"+event.screenX+"\n"+this._sidebar_splitter.boxObject.screenX+"\n"+(event.target instanceof HTMLElement || /browser/.test(event.target.localName) ))
    var hidden = (sidebar_box.hasAttribute('hidden')?true:false) ||
                  sidebar_box.getAttribute('collapsed') == "true";
    var x = event.screenX - this._sidebar_splitter.screenX;
    //ウインドウの端かどうか
    if (hidden) {
      if (event.originalTarget == this._sidebar_splitter ||
          this._checkMouseIsWindowEdge(x)) {
        if (this._close_Timeout)
          clearTimeout(this._close_Timeout);
        this._close_Timeout = null;
        if (!this._open_Timeout) {
          this._open_Timeout = setTimeout(function(self){
            SidebarController.toggle(self._getDefaultCommandID());
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
//this.debug("this.isChrome(event) "+ this.isChrome(event));
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
    var x = aEvent.screenX;
    var y = aEvent.screenY;
    var sidebarBox = this._sidebar_box.getBoundingClientRect();
//userChrome_js.debug( this._sidebar_box.screenX <= x)
//userChrome_js.debug( x <= this._sidebar_box.screenX + sidebarBox.width )
    if (this._sidebar_box.screenX <= x && x <= this._sidebar_box.screenX + sidebarBox.width &&
        this._sidebar_box.screenY <= y && y <= this._sidebar_box.screenY + sidebarBox.height)
      return true;
    //if (aEvent.target instanceof HTMLElement)
    //  return false;
    if (/^(splitter|grippy|menu|panel|notification)/.test(aEvent.target.localName))
      return true;
    var box = gBrowser.tabpanels.getBoundingClientRect();
    var bx = gBrowser.tabpanels.screenX;
    var by = gBrowser.tabpanels.screenY;
    if (bx <= x && x <= bx + box.width &&
        by <= y && y <= by + box.height)
      return false;
    else
      return true;
  },

  //prefを読み込み
  getPref: function(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch);
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
                  .getService(Components.interfaces.nsIPrefBranch);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.setComplexValue(aPrefString, Components.interfaces.nsIFile, aValue); break;
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

var sidebarpopuppanelResize = {
  drag   : false,
  size   : null,
  offset : null,

  PREF_SIZE : "extensions.sidebarpopuppanelResize.size.",

  get isRTL() {
    return document.defaultView
                .getComputedStyle(document.getElementById("nav-bar"), "")
                .direction == "rtl";
  },

  get sidebar() {
    return document.getElementById("sidebar");;
  },
  
  get sidebarbox() {
    return document.getElementById("sidebar-box");;
  },

  get sidebarcommand() {
    return this.sidebarbox.getAttribute('sidebarcommand');
  },

  init: function(){
    window.addEventListener("unload", this, false);
      this.SM_Observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.attributeName) {
          case "style":
            let style = this.sidebarbox.getAttribute("style");
            if (style.includes("width: 0px")) {
              ucjs_expand_sidebar._loadKeepItSizes();
            }
            break;
        }
      }.bind(this));
    }.bind(this));
    // pass in the target node, as well as the observer options
    this.SM_Observer.observe(document.getElementById("sidebar-box"),
                             {attribute: true, attributeFilter: ["style"]});
  },

  uninit: function(){
    window.removeEventListener("unload", this, false);
    window.removeEventListener("mouseup", this, true);
    window.removeEventListener("mousemove", this, true);
  },

  handleEvent: function (event) {
    switch (event.type) {
      case "load":
        this.init();
        break;
      case "unload":
        this.uninit();
        break;
      case "mouseup":
        this.mouseup(event);
        break;
      case "mousemove":
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(function (event, self) {
          self.mousemove(event);
        }, 10, event, this);
        break;
      default:;
    }
  },

  start: function(event){
    this.checked = ucjs_expand_sidebar._checkbox.checked;
    ucjs_expand_sidebar._checkbox.checked = true;
    this.drag = true;
    this.size = {height:parseInt(this.sidebarbox.getBoundingClientRect().height),
                 width:parseInt(this.sidebarbox.getBoundingClientRect().width)};
    this.offset = {x: event.screenX, y: event.screenY};
    window.addEventListener("mouseup", this, true);
    window.addEventListener("mousemove", this, true);
  },

  mouseup: function(event) {
    ucjs_expand_sidebar._checkbox.checked = this.checked;
    this.drag = false;
    window.removeEventListener("mousemove", this, true);
    window.removeEventListener("mouseup", this, true);
    ucjs_expand_sidebar._saveKeepItSizes(this.sidebarcommand, this.sidebarbox.getBoundingClientRect().width);
  },

  mousemove: function(event) {
    if (this.drag) {
      var newValue;
      var h = this.size.height;
      newValue = h + event.screenY - this.offset.y;
      if (newValue <= h - 50) {
        h = newValue;
      }

      var w = this.size.width;
      if (this.isRTL)
        newValue = w - (event.screenX - this.offset.x);
      else
        newValue = w + event.screenX - this.offset.x;
      if (newValue <= screen.width) {
        w = newValue;
      }
      this.setSize(h, w);
    }
  },

  setSize: function(h, w){
    if (h && h + this.sidebarbox.screenY <= screen.height - 50 && h >= 10) {
//      this.sidebar.style.setProperty('height', h + "px", "");
    }
    if (w && 0<=w ) {
      //this.sidebar.style.setProperty('width', w - 1 + "px", "");
      this.sidebarbox.style.setProperty('width', w + "px", "");
    }
  }
};
sidebarpopuppanelResize.init();
