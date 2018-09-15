// ==UserScript==
// @name           addHistoryFindbarFx60.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add History to Findbar
// @include        main
// @compatibility  Firefox 60
// @author         Alice0775
// @version        2018/09/15 17:00 remove logging
// @version        2018/09/15 15:00 fix dop. and use TabFindInitialized instead TabSelect
// @version        2018/09/15 07:30 workarround for Bug 1411707 Switch findbar and findbar-textbox from XBL bindings 
// @version        2018/09/06 14:30 fix unnecessary findbar popup
// @version        2018/08/25 12:30 fix save formhistory
// @version        2018/08/14 12:30 fix unnecessary findbar popup
// @version        2018/08/10 01:30 fix 63.0a1
// @version        2018/07/30 21:30 fix cursor
// @version        2018/07/30 21:30 fix drop selected text
// @version        2018/07/21 01:40 fix tab order
// @version        2018/07/21 01:30 fix find selection word
// @version        2018/07/21 01:10 fix clear formhistory
// @version        2018/07/20 00:30
// ==/UserScript==
const addHistoryFindbar = {
  // --config --
  // ENTERキーでのみ保存する[true] どのキーでも保存する false
  ONLYENTER : true,
  //保存間隔(msec)
  KEY_TIMER : 800,
  // --config --

  init: function() {

    var style = `

      .findbar-textbox {
        padding :0 !important;
      }
      .findbar-textbox > .textbox-input-box {
        max-width: 0 !important;
      }
      textbox[anonid="findbar-history-textbox"] {
        -moz-appearance: none;
        background-color: var(-moz-Field);
        color: var(-moz-FieldText);
        width: 250px !important;
        padding :0 !important;
        margin :0 !important;
        border-color: transparent !important;
      }

      textbox[anonid="findbar-history-textbox"]:-moz-lwtheme {
        background-color: var(--lwt-toolbar-field-background-color, -moz-Field);
        color: var(--lwt-toolbar-field-color, -moz-FieldText);
      }

      /*フラッシュ*/
      .findbar-textbox[flash="true"] textbox[anonid="findbar-history-textbox"]{
        -moz-appearance: none;
        background-color: yellow;
      }
      /*検索語句が見つからない時*/
      .findbar-textbox[status="notfound"] textbox[anonid="findbar-history-textbox"] {
        -moz-appearance: none;
        background-color: #FF6666;
        color: #FFFFFF;
      }
      /*折り返した*/
      .findbar-textbox[status="wrapped"] textbox[anonid="findbar-history-textbox"] {
        -moz-appearance: none;
        background-color: lime;
        color: #000000;
      }
     /*履歴を出すボタンを表示*/
      textbox[anonid="findbar-history-textbox"] .autocomplete-history-dropmarker {
        display: -moz-box;
        -moz-binding: url("chrome://global/content/bindings/autocomplete.xml#history-dropmarker");
      }


    
      .findBar-history-dropmarker {
        -moz-appearance: none;
        list-style-image: url(chrome://global/skin/icons/arrow-dropdown-16.svg);
        opacity: 0.6;
        cursor: default;
      }
      .findBar-history-dropmarker:active,
      .findBar-history-dropmarker[checked] {
        background-color: var(--toolbarbutton-active-background);
      }
      .findBar-history-dropmarker:hover {
        background-color: var(--toolbarbutton-hover-background);
      }
      toolbar[brighttext] .findBar-history-dropmarker {
        -moz-context-properties: fill, fill-opacity;
        fill: currentColor;
        fill-opacity: var(--toolbarbutton-icon-fill-opacity);
      }
      `.replace(/\s+/g, " ");

    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    gBrowser.tabContainer.addEventListener('TabFindInitialized', this, false);
    gBrowser.tabContainer.addEventListener('TabClose', this, false);

    //cmd_findの監視して, 逆転送する
		document.addEventListener('drop', this, true);
    window.addEventListener("keypress", this, true);
    window.addEventListener("command", this, false);
  },

  initFindBar: function() {
    if (/pending/.test(gBrowser.getFindBar.toString()) &&
        typeof gFindBar == "undefined") {
      setTimeout(() => {
        gBrowser.getFindBar().then(findbar => {
          this.addDropMarker(findbar);
        });
      }, 1000); /// xxx workarroundfor Bug 1411707
      return;
    } else {
      gFindBar = gBrowser.getFindBar();
      let textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "findbar-history-textbox");
      if (!textbox2) {
        this.addDropMarker(gFindBar);
      }
    }
  },

  addDropMarker: function(findbar) {
    const kNSXUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    let textbox2 = document.createElementNS(kNSXUL, "textbox");
    findbar._findField.appendChild(textbox2);
    textbox2.setAttribute("anonid", "findbar-history-textbox");
    textbox2.setAttribute("type", "autocomplete");
    textbox2.setAttribute("autocompletesearch", "form-history");
    textbox2.setAttribute("autocompletesearchparam", "findbar-history");
    textbox2.setAttribute("disableAutocomplete", "true");
    textbox2.setAttribute("placeholder", "Find in Page");
    textbox2.setAttribute("oninput", "addHistoryFindbar.copyToFindfield(event);");
    textbox2.setAttribute("onkeypress", "addHistoryFindbar.copyToFindfield(event);");
    textbox2.setAttribute("oncompositionstart", "addHistoryFindbar.handleEvent(event);");
    textbox2.setAttribute("oncompositionend", "addHistoryFindbar.handleEvent(event);");
    textbox2.setAttribute("onclick", "addHistoryFindbar.copyToFindfield(event);");

    let btn = document.createElementNS(kNSXUL, "dropmarker");
    textbox2.appendChild(btn);
    btn.setAttribute("anonid", "historydropmarker");
    btn.setAttribute("class", "findBar-history-dropmarker chromeclass-toolbar-additional");
    btn.setAttribute("tooltiptext", "Show history");
    btn.setAttribute("inherits", "open,parentfocused=focused,usertyping");
    btn.setAttribute("ordinal", "99");
    btn.setAttribute("type", "checkbox");
    btn.setAttribute("autoCheck", "false");
    btn.addEventListener("mousedown", this, false);

    //文字列ドラッグドロップの時保存する
    textbox2.addEventListener("change", this, true);

    textbox2.FormHistory =
      (ChromeUtils.import("resource://gre/modules/FormHistory.jsm", {})).FormHistory;

    gFindBar._findField.lastInputValue = "";
    gFindBar._findField.addEventListener("focus", this, false);
    gFindBar._findField.addEventListener("input", this, false);

    // コンテキストメニュー
    setTimeout(() => {
    let cxmenu;
    let inputbox = document.getAnonymousElementByAttribute(textbox2, "anonid", "moz-input-box");
    if (!inputbox) {
      // -fx62
      inputbox = document.getAnonymousElementByAttribute(textbox2, "anonid", "textbox-input-box");
      cxmenu = document.getAnonymousElementByAttribute(inputbox, "anonid", "input-box-contextmenu");
    } else {
      // fx63+
      cxmenu = document.getAnonymousElementByAttribute(textbox2, "class", "textbox-contextmenu");
    }
    let element, label, akey;

    element = document.createElementNS(kNSXUL, "menuseparator");
    cxmenu.appendChild(element);

    element = document.createElementNS(kNSXUL, "menuitem");
    label = "Clear Search History";
    akey = "H";
    element.setAttribute("label", label);
    element.setAttribute("accesskey", akey);
    element.setAttribute("oncommand", "addHistoryFindbar.clearHistory();");

    cxmenu.appendChild(element);
    }, 1000); /// xxx
    return textbox2;
  },

  uninit: function() {
    gBrowser.tabContainer.removeEventListener('TabFindInitialized', this, false);
    gBrowser.tabContainer.removeEventListener('TabClose', this, false);
		document.removeEventListener('drop', this, true);
    window.removeEventListener("keypress", this, true);
    window.removeEventListener("command", this, false);
  },

  handleEvent: function(event){
    let textbox2;

    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
      case 'TabFindInitialized':
        this.initFindBar();
        break;
      case 'TabClose':
        /*
        if (typeof gFindBar == "undefined")
          break;
        let btn = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "historydropmarker");
        btn.removeEventListener("mousedown", this, false);
        */
        break;
      case 'drop': //fx3.1 more
        if (typeof gFindBar == "undefined")
          break;
        if(event.target != gFindBar && event.target.getAttribute("anonid") != "findbar-history-textbox")
	    	  break;
        event.stopPropagation();
        event.preventDefault();

        this.drop(event);
        break;
      case 'focus':
        if (typeof gFindBar == "undefined")
          break;
        textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "findbar-history-textbox");
        if ( gFindBar._findField.value != textbox2.value) {
            textbox2.value = gFindBar._findField.value;
            this.addToHistory(textbox2.value);
        }
        textbox2.focus();
        textbox2.select();
        // xxx do not hide findbar when FAYT is starting
        // gFindBar.removeAttribute('hidden');
        break;
      case 'keypress':
        if (typeof gFindBar == "undefined")
          break;
        textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "findbar-history-textbox");
        if (event.originalTarget == textbox2.inputField &&
            event.keyCode == KeyEvent.DOM_VK_TAB) {
          this._handleTab(event);
          break;
        }
        if (event.keyCode == KeyEvent.DOM_VK_ESCAPE) {
          gBrowser.selectedTab.linkedBrowser.focus();
          gFindBar.close();
          break;
        }

        if (event.keyCode == KeyEvent.DOM_VK_F3 ||
            event.keyCode == KeyEvent.DOM_VK_F4 ||
            event.altKey && event.keyCode == KeyEvent.DOM_VK_A ||
            event.altKey && event.keyCode == KeyEvent.DOM_VK_N ||
            event.altKey && event.keyCode == KeyEvent.DOM_VK_P ) {
           this.addToHistory(textbox2.value);
           textbox2.popupOpen = false;
           break;
        }

        if (event.originalTarget == textbox2.inputField &&
            event.keyCode == KeyEvent.DOM_VK_RETURN &&
            event.ctrlKey) {
              gFindBar.getElement("highlight").click();
           break;
        }

        if (event.originalTarget == textbox2.inputField &&
            (event.keyCode == KeyEvent.DOM_VK_RETURN ||
             event.keyCode == KeyEvent.DOM_VK_ENTER ||
             event.keyCode == KeyEvent.DOM_VK_PAGE_UP ||
             event.keyCode == KeyEvent.DOM_VK_PAGE_DOWN ||
             event.keyCode == KeyEvent.DOM_VK_UP ||
             event.keyCode == KeyEvent.DOM_VK_DOWN)) {
          // do nothing if history drop down is openned
          let historyPopup = document.getAnonymousElementByAttribute(textbox2, "type", "autocomplete-richlistbox");
          if (!!historyPopup.getAttribute("open"))
            return
          gFindBar._findField.value = textbox2.value;
          var evt = document.createEvent("KeyboardEvent");
          evt.initKeyEvent ('keypress', true, true, window,
                        event.ctrlKey, event.altKey,
                        event.shiftKey, event.metaKey,
                        event.keyCode, 0);
          gFindBar._findField.dispatchEvent(evt);

          if (!(event.keyCode == KeyEvent.DOM_VK_RETURN))
            event.preventDefault();
          break;
        }
       break;
      case "command":
        if (typeof gFindBar == "undefined")
          break;
        if (gFindBar.hidden) {
          gBrowser.selectedTab.linkedBrowser.focus();
          break;
        }
        textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "findbar-history-textbox");
        if (event.target == document.getElementById("cmd_find")){
          if ( gFindBar._findField.value != textbox2.value){
            textbox2.value = gFindBar._findField.value;
            this.addToHistory(textbox2.value);
          }
        }
        break;
      case 'input':
        if (typeof gFindBar == "undefined")
          break;
        textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "findbar-history-textbox");
        if ( gFindBar._findField.value != textbox2.value){
          textbox2.value = gFindBar._findField.value;
          if (gFindBar._findMode == gFindBar.FIND_NORMAL)
            textbox2.select();
          textbox2.focus();
          if (gFindBar._findMode == gFindBar.FIND_NORMAL)
            this.addToHistory(textbox2.value);
        }
        break;
      case 'change':
        if (typeof gFindBar == "undefined")
          break;
        textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                        "anonid", "findbar-history-textbox");
        textbox2.select();
        textbox2.focus();
        this.addToHistory(textbox2.value);
        break;
      case 'mousedown':
        if (typeof gFindBar == "undefined")
          break;
        this.showHistory(event);
        break;
    }
  },

  copyToFindfield: function(aEvent){
    let textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "findbar-history-textbox");
    //window.userChrome_js.debug("UIEvents  " + this.lastInputValue +"\n"+textbox.value);
    //if(this.lastInputValue == textbox.value) return;

    //本来のfindbar-textboxに転記して, ダミーイベント送信
    var text = textbox2.value;
    gFindBar._findField.value  = text;
    gFindBar._findField.removeAttribute('status');
    if (aEvent.type == 'input' ||
        aEvent.type == 'drop' ||
        aEvent.type == 'dragdrop'){
      var evt = document.createEvent("UIEvents");
      evt.initUIEvent("input", true, false, window, 0);
      gFindBar._findField.dispatchEvent(evt);
    }

    if(textbox2.value.replace(/ /g,'')===''){
      gFindBar._findField.removeAttribute('status');
      gFindBar._findField.lastInputValue = '';
      return;
    }

    //ENTERなら保存
    //window.userChrome_js.debug("copyToFindfield " + this.lastInputValue +"\n"+textbox.value);
    if (!this.ONLYENTER ||
        aEvent.type == 'keypress' && aEvent.keyCode == KeyEvent.DOM_VK_RETURN ){
      this.addToHistory(textbox2.value);
    }
  },

  addToHistory: function(value){
    try {
      if (PrivateBrowsingUtils.isWindowPrivate(window))
        return;
    } catch(ex) {
      if (document.documentElement.getAttribute("titlemodifier_privatebrowsing") ==
          document.documentElement.getAttribute("titlemodifier"))
        return;
    }
    //データーベースに記入
    let textbox = gFindBar._findField;
    if(textbox.lastInputValue == value) return;
    if(value.replace(/ /g,'')===''){
      textbox.lastInputValue = '';
      return;
    }
    if(this.addHistoryFindbarTimeout){
      clearTimeout(this.addHistoryFindbarTimeout);
    }
    this.addHistoryFindbarTimeout = setTimeout(function(textbox){
      textbox.lastInputValue = value;
      if(!!textbox.lastInputValue){
        let textbox2 = document.getAnonymousElementByAttribute(textbox,
                          "anonid", "findbar-history-textbox");
        textbox2.FormHistory.update(
          { op: 'bump',
            fieldname: "findbar-history",
            value: value},
          { handleError(aError) {
              Cu.reportError("Saving search to form history failed: " + aError.message);
          }});
      }
    }, this.KEY_TIMER, textbox);
  },
  
  clearHistory: function() {
    try {
      if (PrivateBrowsingUtils.isWindowPrivate(window))
        return;
    } catch(ex) {}
    let textbox = gFindBar._findField;
    let textbox2 = document.getAnonymousElementByAttribute(textbox,
                      "anonid", "findbar-history-textbox");
    textbox2.FormHistory.update(
      { op: "remove",
        fieldname: "findbar-history"},
      { handleError(aError) {
          Cu.reportError("Saving search to form history failed: " + aError.message);
      }});
  },

  showHistory: function(event) {
    let textbox = gFindBar._findField;
    let textbox2 = document.getAnonymousElementByAttribute(textbox,
                          "anonid", "findbar-history-textbox");
  	let v = '';
		if(textbox2.value)
		  v = textbox2.value;
		textbox2.value = '';
   	textbox2.showHistoryPopup();
		textbox2.value = v;
  },

  _handleTab: function (aEvent) {
    var shouldHandle = !aEvent.altKey && !aEvent.ctrlKey &&
                       !aEvent.metaKey;
      //window.userChrome_js.debug(gFindBar._finishFAYT(aEvent));
    if (shouldHandle &&
        gFindBar._findMode == gFindBar.FIND_NORMAL) {
      aEvent.preventDefault();
      if (aEvent.shiftKey) {
        gBrowser.selectedBrowser.focus();
      } else {
        if (document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-previous").disabled)
          document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-case-sensitive").focus();
        else
          document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-previous").focus();
      }
    } else if (shouldHandle &&
        gFindBar._findMode != gFindBar.FIND_NORMAL) {
      gFindBar._finishFAYT(aEvent)
    }
  },

  drop: function (aEvent) {
		let data = aEvent.dataTransfer.getData('text/x-moz-url').split(/\r\n|\n/)[1];
		data = data? data : aEvent.dataTransfer.getData('text/plain');
		// タブをドロップした場合はタブのラベル
		if(aEvent.dataTransfer.mozTypesAt(0)[0] == "application/x-moz-tabbrowser-tab"){
			draggedTab = aEvent.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0);
			data = draggedTab.getAttribute('label');
		}
    //window.userChrome_js.debug("onDrop " + data);
    if (data) {
      let textbox2 = document.getAnonymousElementByAttribute(gFindBar._findField,
                          "anonid", "findbar-history-textbox");
      textbox2.value  = data;
      this.copyToFindfield(aEvent);
      this.addToHistory(data);
    }
  },

  seachbarOnDropUseTextContent_drop: function (aEvent) {
    gFindBar._findField.findBarOnDropUseTextContent(aEvent);
    var evt = document.createEvent("UIEvents");
    evt.initUIEvent("input", true, false, window, 0);
    gFindBar._findField.dispatchEvent(evt);
  },

  getSupportedFlavours: function () {
    var flavourSet = new FlavourSet();

    flavourSet.appendFlavour("text/unicode");
    flavourSet.appendFlavour("text/x-moz-url");
    flavourSet.appendFlavour("application/x-moz-file", "nsIFile");
    return flavourSet;
  },


}
addHistoryFindbar.init();
