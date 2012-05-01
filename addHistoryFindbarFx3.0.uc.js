// ==UserScript==
// @name           addHistoryFindbarFx3.0.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add History to Findbar
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 3.0 3.5 3.6 4.0 14
// @author         Alice0775
// @version        2012/04/02 23:00 Bug 482057
// @version        2011/10/02 18:00 ctrl+enter toggle hiligight all
// @version        2011/03/29 17:00 コンテキストメニューにClear Search Historyを追加
// @version        2011/02/12 14:00 ESCでfindbarを閉じた後, 黒色矩形のゴーストがでるのを修正
// @version        2010/07/09 07:00
// @version        2010/05/27 16:50 do not hide findbar when FAYT is starting
// @version        2010/03/30 00:10 DOM_VK_ENTER
// @version        2010/03/13 00:10 undo
// @version        2010/02/07 00:10 enter, shift+enterで 前,次検索
// ==/UserScript==
// @version        2010/02/03 00:10 Bug seachbarOnDropUseTextContent.uc.js連動
// @version        2009/12/23 00:10 Bug 509298 - updateCurrentBrowser leaves focus in location bar if no specific element is focused in that browser
// @version        2009/12/05 23:00 ドラッグドロップ Firefox3.6
// @version        2009/11/05 19:00 new Drag Drop APIを使うようにした。
// @version        2009/09/25 23:00 popupはxblのを使うようにした。
// @version        2009/08/05 23:00 インプット時status削除するようにしてみた
// @version        2009/05/12 20:00 statusが折り返すと位置がずれるときがあるので, 折り返さないように
// @version        2009/05/02 20:00 more Minefield/3.6a1pre ID:20090501045247
// @version        2009/04/16 00:00 起動時にXUL/Migemo 0.11.12no初期化が時間かかるので...
// @version        2009/04/09 00:00 起動時にFindbarが表示されていたらサイズ調整して表示する
// @version        2009/04/08 17:00 Windowリサイズ後はAutocompleteポップアップの幅をリセットするようにした
// @version        2009/04/02 12:30 スタイルが反映されない場合があるようなので スタイルの注入タイミングをoverlay完了後に変更。
// @version        2009/03/30 23:30 b4preにもなってBug 481397 - Incorrect tab order of findbar buttons on Linux.
// @version        2009/03/15 23:30 何でこうコロコロと意味のない変更するのかね > Dao  Gottwald ( Bug 483378 -  findbar-textbox should be a proper textbox rather than faking the appearance on find-field-container)
// @version        2009/02/27 00:00 Fixed: Search for text when I start typing
// @version        2009/01/29 23:00 border:0pxにした(default theme)
// @version        2009/01/27 01:00 typoによりドロップダウンマーカークリックでも検索されてしまっていたのを修正
// @version        2009/01/27 00:00 Fx3.0.* でもドロップと同時に検索できるように
// @version        2009/01/26 22:00 textboxのサイズ調整部分を修正
// @version        2009/01/26 13:00 無理があるな
// @version        2009/01/26 00:00 ドラッグドロップの処理追加, next/prev, dropで保存, エンターキーでのみ保存
// @version        2009/01/25 18:00 find-statusのテキストが折り返して2行になっても位置がずれないように
// @version        2009/01/25 17:00 viewSourceやviewPartialSourceでも動くように
// @version        2009/01/25 13:00 逆転記するようにして, 他スクリプトなどとの相性を改善
// @version        2009/01/25 テーマに依存するがとりあえずどうすか
// @Note           need Sub-Script/Overlay Loader v3.0.20mod
// @Note           KKNOWN ISSUE: 時々doropdownの位置が変になる,Fx3.0.* ではドロップと同時に検索開始しない。
var historyFindbar = {
  // --config --
  // ENTERキーでのみ保存する[true] どのキーでも保存する false
  ONLYENTER : true,
  //保存間隔(msec)
  KEY_TIMER : 800,
  // --config --

  adjustSizeDelay: 200,
  adjustSizeTimer: null,
  addHistoryFindbarTimeout: null,
  lastInputValue: "",

  get historyfindbar(){
    delete this.historyfindbar;
    return this.historyfindbar = document.getElementById("historyfindbar");
  },

  get _findField2(){
    delete this._findField2;
    return this._findField2 = document.getElementById("find-field2");
  },

  get autocomplete_textbox_container(){
    delete this.autocomplete_textbox_container;
    return this.autocomplete_textbox_container = document.getAnonymousElementByAttribute(
                                                   historyFindbar._findField2,
                                                  "class", "autocomplete-textbox-container");
  },

  get inputbox(){
    delete this.inputbox;
    return this.inputbox = document.getAnonymousElementByAttribute(this._findField2, "anonid", "textbox-input-box");
  },
  
  get contextmenu(){
    delete this.contextmenu;
    return this.contextmenu = document.getAnonymousElementByAttribute(this.inputbox, "anonid", "input-box-contextmenu");
  },

  get historyPopup(){
    delete this.historyPopup;
    return this.historyPopup = document.getAnonymousElementByAttribute(this._findField2, "anonid", "historydropmarker");
  },

  init :function(){
    window.addEventListener('unload', this, false);
    try {
      gFindBar;
    } catch (e) {}
      
/*
    if (!document.getElementById("FindToolbar") &&
        typeof gFindBarInitialized != 'undefined' &&
        !gFindBarInitialized) {
      window.watch('gFindBarInitialized', function() { historyFindbar.init(); });
      return;
    }
*/
    //viewSourceやviewPartialSourceでは未定義
    if (typeof gFindBar == 'undefined') {
      window.gFindBar = document.getElementById("FindToolbar");
      gFindBar._findField = document.getAnonymousElementByAttribute(gFindBar, "anonid", "findbar-textbox");
    }

    var overlay =
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
               xmlns:html="http://www.w3.org/1999/xhtml">
        <window id="main-window">
          <hbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                pack="end"
                id="historyfindbar">
            <hbox id="historyfindbar-box"
                   align="center"
                   flex="1"
                   pack="end"
                   style="position: fixed; width: auto; height: 29px; left: 0px; top: auto; bottom: 0px;">
              <textbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                       type="autocomplete"
                       id="find-field2"
                       autocompletesearch="form-history"
                       autocompletesearchparam="findbar-history"
                       disableAutocomplete="true"
                       oninput="historyFindbar.copyToFindfield(event);"
                       onkeypress="historyFindbar.copyToFindfield(event);"
                       oncompositionstart="historyFindbar.handleEvent(event);"
                       oncompositionend="historyFindbar.handleEvent(event);"
                       onclick="historyFindbar.copyToFindfield(event);"
                       style="margin-left: 0px;"/>
            </hbox>
          </hbox>
        </window>
        <window id="viewSource">
          <hbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                pack="end"
                id="historyfindbar">
            <hbox id="historyfindbar-box"
                   align="center"
                   flex="1"
                   pack="end"
                   style="position: fixed; width: auto; height: 29px; left: 0px; top: auto; bottom: 0px;">
              <textbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                       type="autocomplete"
                       id="find-field2"
                       autocompletesearch="form-history"
                       autocompletesearchparam="findbar-history"
                       disableAutocomplete="true"
                       oninput="historyFindbar.copyToFindfield(event);"
                       onkeypress="historyFindbar..copyToFindfield(event);"
                       oncompositionstart="historyFindbar.handleEvent(event);"
                       oncompositionend="historyFindbar.handleEvent(event);"
                       onclick="historyFindbar.copyToFindfield(event);"
                       style="margin-left: 0px;"/>
            </hbox>
          </hbox>
        </window>

      </overlay>;
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay.toXMLString());
    window.userChrome_js.loadOverlay(overlay, this);
  },

  observe: function(){
    if (!!document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-field-container")){ //less Fx3.5?
      var style = <><![CDATA[
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
        #find-field2{
          -moz-appearance: none;
          background-color: #FFFFFF;
          border:0px;
        }
        /*フラッシュ*/
        #find-field2[flash="true"]{
          -moz-appearance: none;
          background-color: yellow;
        }
        /*検索語句が見つからない時*/
        #find-field2[status="notfound"] {
          -moz-appearance: none;
          background-color: #FF6666;
          color: #FFFFFF;
        }
        /*折り返した*/
        #find-field2[status="wrapped"] {
          -moz-appearance: none;
          background-color: lime;
          color: #000000;
        }
        /*履歴を出すボタンを表示*/
        #find-field2 .autocomplete-history-dropmarker {
          display: -moz-box;
          -moz-binding: url('chrome://global/content/bindings/autocomplete.xml#history-dropmarker');
        }

        #find-field2[_moz-xmigemo-disable-ime="true"] {
          ime-mode: disabled !important;
        }
        #find-field2[_moz-xmigemo-inactivate-ime="true"] {
          ime-mode: inactive !important;
        }
        /*折り返さないように*/
        #FindToolbar *
        {
          overflow:hidden !important;
        }
        #FindToolbar * description[anonid="find-status"]{
          padding-top: 0px !important;
          padding-bottom: 0px !important;
          margin-top: 0px !important;
          margin-bottom: 0px !important;
          line-height: 1em !important;
          font-size:12px !important;
          max-height: 2em !important;
        }
      ]]></>.toString().replace(/\s+/g, " ");
    } else { //more Fx3.6?
      var style = <><![CDATA[
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
        #find-field2{
          -moz-appearance: none;
          background-color: #FFFFFF;
        }
        /*フラッシュ*/
        #find-field2[flash="true"]{
          -moz-appearance: none;
          background-color: yellow;
        }
        /*検索語句が見つからない時*/
        #find-field2[status="notfound"] {
          -moz-appearance: none;
          background-color: #FF6666;
          color: #FFFFFF;
        }
        /*折り返した*/
        #find-field2[status="wrapped"] {
          -moz-appearance: none;
          background-color: lime;
          color: #000000;
        }
       /*履歴を出すボタンを表示*/
        #find-field2 .autocomplete-history-dropmarker {
          display: -moz-box;
          -moz-binding: url('chrome://global/content/bindings/autocomplete.xml#history-dropmarker');
        }

        #find-field2[_moz-xmigemo-disable-ime="true"] {
          ime-mode: disabled !important;
        }
        #find-field2[_moz-xmigemo-inactivate-ime="true"] {
          ime-mode: inactive !important;
        }
        /*折り返さないように*/
        #FindToolbar *
        {
          overflow:hidden !important;
        }
        #FindToolbar * description[anonid="find-status"]{
          padding-top: 0px !important;
          padding-bottom: 0px !important;
          margin-top: 0px !important;
          margin-bottom: 0px !important;
          line-height: 1em !important;
          /*font-size:12px !important;*/
          max-height: 2em !important;
        }

        #historyfindbar[hidden] #find-field2 > popupset {
          display:none;
        }
      ]]></>.toString().replace(/\s+/g, " ");
    }
/*
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var uri =  'data:text/css,' + encodeURIComponent(style);
    uri = ios.newURI(uri, null, null);
      sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
    if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
    }
*/

    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    // xxx Bug 509298 - updateCurrentBrowser leaves focus
    // in location bar if no specific element is focused in that browser
    if ('gBrowser' in window && 'updateCurrentBrowser' in gBrowser) {
      var func = gBrowser.updateCurrentBrowser.toString();
      func = func.replace(
        'gFindBar.getElement("findbar-textbox").getAttribute("focused") != "true"',
        '($& && historyFindbar._findField2).getAttribute("focused") != "true"'
      );
      eval("gBrowser.updateCurrentBrowser = " + func);
    }

    this.historyfindbar.setAttribute('hidden', true);
    content.focus();

    //起動時にFindbarが表示されていたらサイズ調整して表示する
    if (!gFindBar.hidden) {
       setTimeout(function(self){
         if (!gFindBar.hidden) {
           self.adjustSize();
         }
       }, 0, this);
       setTimeout(function(self){
         if (!gFindBar.hidden) {
           self.adjustSize();
           self.historyfindbar.removeAttribute('hidden');
         }
       }, 800, this);
    }


    // コンテキストメニュー

          const kXULNS =
                      "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
          var cxmenu = this.contextmenu;
          var element, label, akey;

          element = document.createElementNS(kXULNS, "menuseparator");
          cxmenu.appendChild(element);

          element = document.createElementNS(kXULNS, "menuitem");
          label = "Clear Search History";
          akey = "H";
          element.setAttribute("label", label);
          element.setAttribute("accesskey", akey);
          element.setAttribute("oncommand", "historyFindbar.clearHistory();");

          cxmenu.appendChild(element);


    //文字列ドラッグドロップの時保存する
    if (this.getVer() < 3.1)
      this._findField2.addEventListener("dragdrop", function(event){nsDragAndDrop.drop(event, historyFindbar);}, true);
    else
      this._findField2.addEventListener("drop", this, true);
    this._findField2.addEventListener("undo", this, true);
    gFindBar._findField.addEventListener("focus", this, false);
    //終了のためESCの監視と, 少なくともF3,F4が押されたとき保存する
    window.addEventListener("keypress", this, true);
    //cmd_findの監視して, 逆転送する
    window.addEventListener("command", this, false);
    //Findbar幅変更の監視して, サイズを調整する
    window.addEventListener("resize", this, false);
    //Findbarの表示状態を監視して, 非表示にしたり背景の色を変えたりする
    gFindBar.addEventListener("DOMAttrModified", this, false);
    //find-status等幅が変化するのをとらえる代わりにnext/prevボタン等のクリック捕捉する
    //少なくともnext/prevが押されたとき保存する
    gFindBar.addEventListener("click", this, false);
    //textbox変更の監視, 逆転送する
    gFindBar._findField.addEventListener("input", this, false);

  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.unwatch('gFindBarInitialized');
    if(this.addHistoryFindbarTimeout)
      clearTimeout(this.addHistoryFindbarTimeout);
    if (this.adjustSizeTimer)
      clearTimeout(this.adjustSizeTimer);
    if (this.getVer() < 3.1)
      this._findField2.removeEventListener("dragdrop", function(event){nsDragAndDrop.drop(event, historyFindbar);}, true);
    else
      this._findField2.removeEventListener("drop", this, true);
    this._findField2.removeEventListener("undo", this, true);
    gFindBar._findField.removeEventListener("focus", this, false);
    window.removeEventListener("keypress", this, true);
    window.removeEventListener("command", this, false);
    window.removeEventListener("resize", this, false);
    gFindBar.removeEventListener("DOMAttrModified", this, false);
    gFindBar.removeEventListener("click", this, false);
    gFindBar._findField.removeEventListener("input", this, false);
  },

  handleEvent: function(aEvent){
    var controller = null;
    //window.userChrome_js.debug("handleEvent " + aEvent.type);
    switch (aEvent.type) {
      case 'unload':
        this.uninit();
        break;
      case 'DOMAttrModified':
        this._DOMAttrModified(aEvent);
        break;
      case 'focus':
        this._findField2.focus();
        // xxx do not hide findbar when FAYT is starting
        gFindBar.removeAttribute('hidden');
        break;
      case 'keypress':
        
        if (aEvent.originalTarget == this._findField2.inputField) {
          var win = gFindBar._currentWindow ||
                    gFindBar.browser.contentWindow;
          controller = gFindBar._getSelectionController(win);
        }
        if (aEvent.originalTarget == this._findField2.inputField &&
            aEvent.keyCode == KeyEvent.DOM_VK_TAB) {
          this._handleTab(aEvent);
          break;
        }
        if (aEvent.keyCode == KeyEvent.DOM_VK_ESCAPE) {
          gFindBar.close();
          break;
        }

        if (aEvent.keyCode == KeyEvent.DOM_VK_F3 ||
            aEvent.keyCode == KeyEvent.DOM_VK_F4 ||
            aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_A ||
            aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_N ||
            aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_P ) {
           this.addToHistory(this._findField2.value);
           this._findField2.popupOpen = false;
           break;
        }

        if (aEvent.originalTarget == this._findField2.inputField &&
            aEvent.keyCode == KeyEvent.DOM_VK_RETURN &&
            aEvent.ctrlKey) {
              gFindBar.getElement("highlight").click();
           break;
        }

        if (aEvent.originalTarget == this._findField2.inputField &&
            (aEvent.keyCode == KeyEvent.DOM_VK_RETURN ||
             aEvent.keyCode == KeyEvent.DOM_VK_ENTER ||
             aEvent.keyCode == KeyEvent.DOM_VK_PAGE_UP ||
             aEvent.keyCode == KeyEvent.DOM_VK_PAGE_DOWN ||
             aEvent.keyCode == KeyEvent.DOM_VK_UP ||
             aEvent.keyCode == KeyEvent.DOM_VK_DOWN)) {
          // do nothing if history drop down is openned
          if (!!this.historyPopup.getAttribute("open"))
            return
          gFindBar._findField.value = this._findField2.value;
          var evt = document.createEvent("KeyboardEvent");
          evt.initKeyEvent ('keypress', true, true, window,
                        aEvent.ctrlKey, aEvent.altKey,
                        aEvent.shiftKey, aEvent.metaKey,
                        aEvent.keyCode, 0);
          gFindBar._findField.dispatchEvent(evt);

          if (!(aEvent.keyCode == KeyEvent.DOM_VK_RETURN))
            aEvent.preventDefault();
          break;
        }
       break;
      case "command":
        //window.userChrome_js.debug("command gFindBar._findField.value " + gFindBar._findField.value +"\n"+this._findField.value);
        if (aEvent.originalTarget == document.getElementById("cmd_find")){
          if ( gFindBar._findField.value != this._findField2.value){
            this._findField2.value = gFindBar._findField.value;
            this.addToHistory(this._findField2.value);
          }
        }
        break;
      case 'input':
        //window.userChrome_js.debug("input gFindBar._findField.value " + gFindBar._findField.value +"\n"+this._findField.value);
        if ( gFindBar._findField.value != this._findField2.value){
          this._findField2.value = gFindBar._findField.value;
          if (gFindBar._findMode == gFindBar.FIND_NORMAL)
            this._findField2.select();
          this._findField2.focus();
          if (gFindBar._findMode == gFindBar.FIND_NORMAL)
            this.addToHistory(this._findField2.value);
        }
        break;
      case 'undo':
          this._findField2.select();
          this._findField2.focus();
          this.addToHistory(this._findField2.value);
        break;
      case 'click':
        //window.userChrome_js.debug("handleEvent  " + aEvent.type);
        if (aEvent.originalTarget.localName != 'toolbarbutton')
          return;
       this.addToHistory(this._findField2.value);
       //break;
      case 'resize':
        //window.userChrome_js.debug("change gFindBar._findField.value " + gFindBar._findField.value);
        if (this.adjustSizeTimer)
          clearTimeout(this.adjustSizeTimer);
        this.adjustSizeTimer = setTimeout(function(self){
          self.adjustSize();
        }, this.adjustSizeDelay, this);
        break;
      case 'compositionstart':
        // Don't close the find toolbar while IME is composing.
        gFindBar._isIMEComposing = true;
        if (gFindBar._quickFindTimeout) {
          clearTimeout(gFindBar._quickFindTimeout);
          gFindBar._quickFindTimeout = null;
        }
        break;
      case 'compositionend':
        gFindBar._isIMEComposing = false;
        if (gFindBar._findMode != gFindBar.FIND_NORMAL &&
            !gFindBar.hidden)
          gFindBar._setFindCloseTimeout();
        break;
      case 'drop': //fx3.1 more
        aEvent.stopPropagation(); //fx3.6 more
        aEvent.preventDefault(); //fx4.0 more

        this.drop(aEvent);
        break;
    }
  },

  _handleTab: function (aEvent) {
    var shouldHandle = !aEvent.altKey && !aEvent.ctrlKey &&
                       !aEvent.metaKey;
      //window.userChrome_js.debug(gFindBar._finishFAYT(aEvent));
    if (shouldHandle &&
        gFindBar._findMode == gFindBar.FIND_NORMAL) {
      aEvent.preventDefault();
      if (aEvent.shiftKey) {
        content.focus();
      } else {
        if (document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-next").disabled)
          document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-case-sensitive").focus();
        else
          document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-next").focus();
      }
    } else if (shouldHandle &&
        gFindBar._findMode != gFindBar.FIND_NORMAL) {
      gFindBar._finishFAYT(aEvent)
      content.focus();
    }
  },

  onDrop: function (aEvent, aXferData, aDragSession) {
    if ("findBarOnDropUseTextContent" in gFindBar._findField) {
      this.seachbarOnDropUseTextContent_drop(aEvent);
      return;
    }
    var data = transferUtils.retrieveURLFromData(aXferData.data,
                   aXferData.flavour.contentType);
    //window.userChrome_js.debug("onDrop " + data);
    if (data) {
      historyFindbar._findField2.value  = data;
      historyFindbar.copyToFindfield(aEvent);
      historyFindbar.addToHistory(data);
    }
  },

  drop: function (aEvent) {
    if ("findBarOnDropUseTextContent" in gFindBar._findField) {
      this.seachbarOnDropUseTextContent_drop(aEvent);
      return;
    }
    var data = aEvent.dataTransfer.getData("text/plain");
    //window.userChrome_js.debug("onDrop " + data);
    if (data) {
      historyFindbar._findField2.value  = data;
      historyFindbar.copyToFindfield(aEvent);
      historyFindbar.addToHistory(data);
    }
  },

  seachbarOnDropUseTextContent_drop: function (aEvent) {
    gFindBar._findField.findBarOnDropUseTextContent(aEvent);
    var evt = document.createEvent("UIEvents");
    evt.initUIEvent("input", true, false, window, 0);
    gFindBar._findField.dispatchEvent(evt);
    content.focus();
  },

  getSupportedFlavours: function () {
    var flavourSet = new FlavourSet();

    flavourSet.appendFlavour("text/unicode");
    flavourSet.appendFlavour("text/x-moz-url");
    flavourSet.appendFlavour("application/x-moz-file", "nsIFile");
    return flavourSet;
  },

  adjustSize: function(event){
    //本来のfindbar-textboxに履歴付きのfind-field2を重なるように配置する。
    //window.userChrome_js.debug("adjustSize");
    if (gFindBar.hidden)
      return;
    var textbox = gFindBar._findField;
    var textbox_boxObject = textbox.boxObject;
    var gFindBar_boxObject = gFindBar.boxObject;

    var textboxX = textbox_boxObject.screenX - gFindBar_boxObject.screenX;
    var textboxY = textbox_boxObject.screenY - gFindBar_boxObject.screenY;
    var textboxW = textbox_boxObject.width;
    var textboxH = textbox_boxObject.height;

    var findField2 = this._findField2;
    var dropmark  = document.getAnonymousElementByAttribute(findField2, "anonid", "historydropmarker");

    //reset Autocomplete popup width
    var panel = document.getAnonymousElementByAttribute(findField2, "anonid", "popupset");
    if (!!panel && !!panel.firstChild) {
      panel.firstChild.width = 0;
    }

    var historyfindbarbox = document.getElementById("historyfindbar-box");
    historyfindbarbox.style.bottom  = "0px";

    historyfindbarbox.style.height  = gFindBar_boxObject.height + "px";
    historyfindbarbox.style.bottom  = historyfindbarbox.boxObject.screenY
                                      - gFindBar_boxObject.screenY + "px";

    if (!!document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-field-container")){ //less Fx3.5?

      var btop = window.getComputedStyle(findField2, '').
                        getPropertyValue('border-top-width').replace('px','')
      var bleft = window.getComputedStyle(findField2, '').
                        getPropertyValue('border-left-width').replace('px','')
      if (findField2.boxObject.width + dropmark.boxObject.width != textboxW)
        findField2.style.width  = textboxW + "px";
      findField2.style.height = textboxH + "px";
      historyfindbarbox.style.marginLeft = textboxX - bleft + "px";
      findField2.style.marginTop  = textboxY - btop + "px";

    } else { //more Fx3.6?

      var textboxblft = window.getComputedStyle(textbox, '').
                        getPropertyValue('border-left-width').replace('px','')
      var textboxbrgt = window.getComputedStyle(textbox, '').
                        getPropertyValue('border-right-width').replace('px','')
      var textboxbtop = window.getComputedStyle(textbox, '').
                        getPropertyValue('border-top-width').replace('px','')
      var textboxbbot = window.getComputedStyle(textbox, '').
                        getPropertyValue('border-bottom-width').replace('px','')

      //window.userChrome_js.debug(findField2.boxObject.width +"\n"+ dropmark.boxObject.width +"\n"+ textboxW);
      //more Minefield/3.6a1pre ID:20090501045247
      findField2.style.width  = textboxW /*-
                                  textboxblft - textboxbrgt*/ + "px";
      findField2.style.height = textboxH /*-
                                textboxbtop - textboxbbot*/ + "px";
      //
      historyfindbarbox.style.marginLeft = textboxX + "px";
      findField2.style.marginTop  = textboxY + "px";

    }
  },

  copyToFindfield: function(aEvent){
    var textbox = aEvent.target;
    //window.userChrome_js.debug("UIEvents  " + this.lastInputValue +"\n"+textbox.value);
    //if(this.lastInputValue == textbox.value) return;

    //本来のfindbar-textboxに転記して, ダミーイベント送信
    var text = textbox.value;
    gFindBar._findField.value  = text;
    gFindBar._findField.removeAttribute('status');
    if (aEvent.type == 'input' ||
        aEvent.type == 'drop' ||
        aEvent.type == 'dragdrop'){
      var evt = document.createEvent("UIEvents");
      evt.initUIEvent("input", true, false, window, 0);
      gFindBar._findField.dispatchEvent(evt);
    }

    if(textbox.value.replace(/ /g,'')===''){
      gFindBar._findField.removeAttribute('status');
      this.lastInputValue = '';
      return;
    }

    //ENTERなら保存
    //window.userChrome_js.debug("copyToFindfield " + this.lastInputValue +"\n"+textbox.value);
    if (!this.ONLYENTER ||
        aEvent.type == 'keypress' && aEvent.keyCode == KeyEvent.DOM_VK_RETURN ){
      this.addToHistory(textbox.value);
    }
  },

  addToHistory: function(value){
    //データーベースに記入
    if(this.lastInputValue == value) return;
    if(value.replace(/ /g,'')===''){
      this._findField2.removeAttribute('status');
      this.lastInputValue = '';
      return;
    }
    if(this.addHistoryFindbarTimeout){
      clearTimeout(this.addHistoryFindbarTimeout);
    }
    this.addHistoryFindbarTimeout = setTimeout(function(self){
      self.lastInputValue = value;
      if(!!self.lastInputValue){
        var formHistory = Components.classes["@mozilla.org/satchel/form-history;1"]
            .getService(Components.interfaces.nsIFormHistory2);
        formHistory.addEntry("findbar-history", value);
      }
    }, this.KEY_TIMER, this);
  },

  clearHistory: function() {
      var formHistory = Components.classes["@mozilla.org/satchel/form-history;1"]
          .getService(Components.interfaces.nsIFormHistory2);
      formHistory.removeEntriesForName("findbar-history");
  },

  _DOMAttrModified: function(aEvent){
    var attrName = aEvent.attrName;
//window.userChrome_js.debug("_DOMAttrModified " + attrName);
    switch (attrName) {
      case "_moz-xmigemo-disable-ime":
      case "_moz-xmigemo-inactivate-ime":
        if (aEvent.newValue == "true")
          this._findField2.setAttribute(attrName, 'true');
        else
          this._findField2.removeAttribute(attrName);
        break;
      case "hidden":
        //Findbarの表示/非表示に同期して重ね合わせる
//window.userChrome_js.debug("aEvent.newValue " + aEvent.newValue);
        if (!aEvent.newValue){
          this.adjustSize(aEvent);
          this.historyfindbar.removeAttribute('hidden');

          setTimeout(function(self){
            var findField2 = self._findField2;
            //findField2.select();
            findField2.disableAutocomplete = gFindBar._findMode != gFindBar.FIND_NORMAL;
//window.userChrome_js.debug("gFindBar._findField.value " + gFindBar._findField.value)
            findField2.value = gFindBar._findField.value;
            if (gFindBar._findMode == gFindBar.FIND_NORMAL)
              findField2.select();
            findField2.focus();
          }, 100, this);
        } else {
          this._findField2.popupOpen = false;
          this.historyfindbar.setAttribute('hidden', true);
          content.focus();
        }
        break;
      case "value":
        if (aEvent.originalTarget == gFindBar.getElement("find-label")){
          if (this.adjustSizeTimer)
            clearTimeout(this.adjustSizeTimer);
          this.adjustSizeTimer = setTimeout(function(self){
            self.adjustSize();
          }, this.adjustSizeDelay, this);
        }
      case "flash":
        if (aEvent.newValue == "true")
          this._findField2.setAttribute('flash', 'true');
        else
          this._findField2.removeAttribute('flash');
        //fail safe

        if (this.adjustSizeTimer)
          clearTimeout(this.adjustSizeTimer);
        this.adjustSizeTimer = setTimeout(function(self){
          self.adjustSize();
        }, this.adjustSizeDelay, this);

        break;
      case "status":
//window.userChrome_js.debug("_DOMAttrModified " + aEvent.newValue);
       //this._findField2.value = gFindBar._findField.value;
       //ステータス同期して色を変える
       if (aEvent.newValue == "notfound"){
          this._findField2.setAttribute('status', 'notfound');
        } else if (aEvent.newValue == "wrapped"){
          this._findField2.setAttribute('status', 'wrapped');
        } else {
          this._findField2.removeAttribute('status');
        }
        //fail safe

        if (this.adjustSizeTimer)
          clearTimeout(this.adjustSizeTimer);
        this.adjustSizeTimer = setTimeout(function(self){
          self.adjustSize();
        }, this.adjustSizeDelay, this);

        break;
    }
  },

  getVer: function(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }
}

historyFindbar.init();

