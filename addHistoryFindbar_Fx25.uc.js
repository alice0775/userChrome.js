// ==UserScript==
// @name           addHistoryFindbarFx25.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add History to Findbar
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 25
// @author         Alice0775
// @version        2014/10/18 23:40 XUL/migemo input
// @version        2014/09/14 23:40 XUL/migemo
// @version        2014/09/14 23:20 more frequent status check
// @version        2013/11/28 23:00 XUL/migemo
// @version        2013/11/22 21:00 XUL/migemo
// @version        2013/11/22 17:30 Fix input and click caret position etc..
// @version        2013/11/16 12:30 Firefox25
// ==/UserScript==
// @version        2009/01/25 テーマに依存する
// @Note           need Sub-Script/Overlay Loader v3.0.20mod +
var historyFindbar = {
  // --config --
  // ENTERキーでのみ保存する[true] どのキーでも保存する false
  ONLYENTER : true,
  //保存間隔(msec)
  KEY_TIMER : 2000,
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

  get inputbox(){
    delete this.inputbox;
    return this.inputbox = document.getAnonymousElementByAttribute(this._findField2,
                                                                   "anonid", "textbox-input-box");
  },

  get historyPopup(){
    delete this.historyPopup;
    return this.historyPopup = document.getAnonymousElementByAttribute(this._findField2, "anonid", "historydropmarker");
  },

  get contextmenu(){
    delete this.contextmenu;
    return this.contextmenu = document.getAnonymousElementByAttribute(this.inputbox,
                                                                      "anonid", "input-box-contextmenu");
  },

  init :function(){
    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <window id="main-window"> \
          <hbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                pack="end" \
                id="historyfindbar"> \
            <hbox id="historyfindbar-box" \
                   align="center" \
                   flex="1" \
                   pack="end" \
                   style="position: fixed; width: auto; height: 29px; left: 0px; top: auto; bottom: 0px;"> \
              <textbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                       type="autocomplete" \
                       id="find-field2" \
                       autocompletesearch="form-history" \
                       autocompletesearchparam="findbar-history" \
                       disableAutocomplete="true" \
                       oninput="historyFindbar.copyToFindfield(event);" \
                       onkeypress="historyFindbar.copyToFindfield(event);" \
                       oncompositionstart="historyFindbar.handleEvent(event);" \
                       oncompositionend="historyFindbar.handleEvent(event);" \
                       onclick="historyFindbar.copyToFindfield(event);" \
                       ondrop="historyFindbar.handleEvent(event);" \
                       style="margin-left: 0px;"/> \
            </hbox> \
          </hbox> \
        </window> \
        <window id="viewSource"> \
          <hbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                pack="end" \
                id="historyfindbar"> \
            <hbox id="historyfindbar-box" \
                   align="center" \
                   flex="1" \
                   pack="end" \
                   style="position: fixed; width: auto; height: 29px; left: 0px; top: auto; bottom: 0px;"> \
              <textbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                       type="autocomplete" \
                       id="find-field2" \
                       autocompletesearch="form-history" \
                       autocompletesearchparam="findbar-history" \
                       disableAutocomplete="true" \
                       oninput="historyFindbar.copyToFindfield(event);" \
                       onkeypress="historyFindbar.copyToFindfield(event);" \
                       oncompositionstart="historyFindbar.handleEvent(event);" \
                       oncompositionend="historyFindbar.handleEvent(event);" \
                       onclick="historyFindbar.copyToFindfield(event);" \
                       ondrop="historyFindbar.handleEvent(event);" \
                       style="margin-left: 0px;"/> \
            </hbox> \
          </hbox> \
        </window> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, this);
  },

  observe: function(){
    XPCOMUtils.defineLazyModuleGetter(this, "FormHistory",
                                      "resource://gre/modules/FormHistory.jsm");

    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
        findbar { \
          transition-property: margin-bottom, opacity, visibility !important; \
          transition-duration: 0ms, 0ms, 0s !important; \
          transition-timing-function: ease-in-out, ease-in-out, linear !important; \
        } \
\
        findbar[hidden] { \
          transition-delay: 0s, 0s, 0ms !important; \
        } \
\
       /*履歴を出すボタンを表示*/ \
        #find-field2 .autocomplete-history-dropmarker { \
          display: -moz-box; \
          -moz-binding: url("chrome://global/content/bindings/autocomplete.xml#history-dropmarker"); \
        } \
\
        #find-field2  { \
          -moz-appearance:none !important;\
        } \
\
        #historyfindbar[hidden] #find-field2 > popupset { \
          display:none; \
        } \
\
        #find-field2[_moz-xmigemo-disable-ime="true"] { \
          ime-mode: disabled !important; \
        } \
        #find-field2[_moz-xmigemo-inactivate-ime="true"] { \
          ime-mode: inactive !important; \
        } \
     '.replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    this.historyfindbar.setAttribute('hidden', true);

    // コンテキストメニュー
    const kXULNS =
                "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    let cxmenu = this.contextmenu;
    let element, label, akey;
    element = document.createElementNS(kXULNS, "menuseparator");
    cxmenu.appendChild(element);
    element = document.createElementNS(kXULNS, "menuitem");
    label = "Clear Search History";
    akey = "H";
    element.setAttribute("label", label);
    element.setAttribute("accesskey", akey);
    element.setAttribute("oncommand", "historyFindbar.clearHistory();");
    cxmenu.appendChild(element);

    if (typeof gFindBar == 'undefined') {
      window.gFindBar = document.getElementById("FindToolbar");
     // gFindBar.getElement("findbar-textbox")
     // gFindBar._findField = document.getAnonymousElementByAttribute(gFindBar, "anonid", "findbar-textbox");
    }
    window.addEventListener("resize", this, false);
    window.addEventListener("findbaropen", this, false);
    window.addEventListener("find", this, false);
    window.addEventListener("findagain", this, false);
    window.addEventListener("findclose", this, false);
    //終了のためESCの監視と, 少なくともF3,F4が押されたとき保存する
    window.addEventListener("keypress", this, true);

    if (this.isMainBrowser())
      gBrowser.tabContainer.addEventListener("TabSelect", this, false);

    //fx25 for existing findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar) {
        historyFindbar.patch(gBrowser.selectedTab._findBar);
      }
    }
    //fx25 for newly created findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
        historyFindbar.patch(event.target._findBar);
      });
    }

  },

  patch: function(aFindBar) {

    if (this.isMainBrowser() && gBrowser.isFindBarInitialized(gBrowser.selectedTab) && !gFindBar.hidden) {
         setTimeout(function(self){
           if (gBrowser.isFindBarInitialized(gBrowser.selectedTab) && !gFindBar.hidden) {
             self.adjustSize();
           }
         }, 0, this);
         setTimeout(function(self){
           if (gBrowser.isFindBarInitialized(gBrowser.selectedTab) && !gFindBar.hidden) {
             self.adjustSize();
             self.historyfindbar.removeAttribute('hidden');
           }
         }, 800, this);
    }
    setTimeout(function(aFindBar){
      aFindBar.close_org = aFindBar.close;
      aFindBar.close = function() {
        this.close_org();
        this._dispatchFindEvent("close");
      }
    }.bind(this), 100, aFindBar);

  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    window.removeEventListener("resize", this, false);
    window.removeEventListener("findbaropen", this, false);
    window.removeEventListener("find", this, false);
    window.removeEventListener("findagain", this, false);
    window.removeEventListener("findclose", this, false);
    if (this.isMainBrowser())
      gBrowser.tabContainer.removeEventListener("TabSelect", this, false);
  },

  handleEvent: function(aEvent){
    var controller = null;
    //window.userChrome_js.debug("handleEvent " + aEvent.type);
    switch (aEvent.type) {
      case 'unload':
        this.uninit();
        break;
      case 'resize':
        //window.userChrome_js.debug("change gFindBar._findField.value " + gFindBar._findField.value);
        if (this.adjustSizeTimer)
          clearTimeout(this.adjustSizeTimer);
        this.adjustSizeTimer = setTimeout(function(){
          this.adjustSize();
        }.bind(this), this.adjustSizeDelay, this);
        break;
      case 'findbaropen':
        historyFindbar.statusModified();
        // XUL/Migenoの時 および QuickFind の時は何もしたい
        if ("XMigemoUI" in window && XMigemoUI.isQuickFind || gFindBar._findMode != gFindBar.FIND_NORMAL)
          return;
        //Findbarの表示状態を監視して, 非表示にしたり背景の色を変えたりする
        // create an observer instance
        gFindBar.historyfindbarObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            switch (mutation.attributeName) {
              case "_moz-xmigemo-disable-ime":
              case "_moz-xmigemo-inactivate-ime":
                if (mutation.target.getAttribute("mutation.attributeName"))
                  this._findField2.setAttribute(attrName, 'true');
                else
                  this._findField2.removeAttribute(attrName);
                break;
              case "status":
              case "flash":
                historyFindbar.statusModified();
                break;
            }
          });
        });
         
        // configuration of the observer:
        var config = { attributes: true };
         
        // pass in the target node, as well as the observer options
        gFindBar.historyfindbarObserver.observe(gFindBar._findField, config);

        this.placeholderModified();
        gFindBar._findField.addEventListener("focus", this, false);
        this.historyfindbar.hidden = gFindBar.hidden;

        this.adjustSize();

        setTimeout(function(){
          this._findField2.value = gFindBar._findField.value;
          this._findField2.focus();
        }.bind(this), 0, this);
        break;
      case 'find':
      case "findagain":
        historyFindbar.statusModified();
        if ( gFindBar._findField.value != this.lastInputValue){
          this.addToHistory(gFindBar._findField.value);
        }
        break;
      case 'XMigemoFindBarClose':
      case 'findclose':
          // stop observing
          if (gFindBar.historyfindbarObserver)
            gFindBar.historyfindbarObserver.disconnect();

          gFindBar._findField.removeEventListener("focus", this, false);
          this.historyfindbar.hidden = true;
          content.focus();
        break;
      case 'TabSelect':
        setTimeout(function(){
          if (gBrowser.isFindBarInitialized(aEvent.target)) {
            this.historyfindbar.hidden = gFindBar.hidden;
            this._findField2.value = gFindBar._findField.value;
            historyFindbar.statusModified();
          } else
            this.historyfindbar.hidden = true;
        }.bind(this), 0);
        break;
      case 'focus':
        this._findField2.focus();
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

  placeholderModified: function() {
    if (gFindBar._findMode == gFindBar.FIND_TYPEAHEAD)
      this._findField2.placeholder = gFindBar._fastFindStr;
    else if (gFindBar._findMode == gFindBar.FIND_LINKS)
      this._findField2.placeholder = gFindBar._fastFindLinksStr;
    else
     this._findField2.placeholder = gFindBar._normalFindStr;
  },

  statusModified: function() {
    var status = gFindBar._findField.getAttribute("status");
    if (status)
      this._findField2.setAttribute("status", status);
    else if (!status)
      this._findField2.removeAttribute("status");

    var cssProp = ["border-color", "background-color", "color"];
    var style = window.getComputedStyle(gFindBar._findField, null);
    for (var i = 0; i <=2; i++) {
      this._findField2.style.setProperty(cssProp[i], style.getPropertyValue(cssProp[i]), "");
    }
  },

  drop: function (aEvent) {
    if ("findBarOnDropUseTextContent" in gFindBar._findField) {
      gFindBar._findField.findBarOnDropUseTextContent(aEvent);
      this._findField2.value  = gFindBar._findField.value;
      return;
    }
    var data = aEvent.dataTransfer.getData("text/plain");
    //window.userChrome_js.debug("onDrop " + data);
    if (data) {
      this._findField2.value  = data;
      this.copyToFindfield(aEvent);
      this.addToHistory(data);
    }
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
    if (!this.isMainBrowser() && gFindBar.hidden)
      return;
    else if (this.isMainBrowser() && (!gBrowser.isFindBarInitialized(gBrowser.selectedTab) || gFindBar.hidden))
      return;

    var textbox = gFindBar._findField;
    var textbox_boxObject = textbox.boxObject;
    var gFindBar_boxObject = gFindBar.boxObject;

    var textboxX = textbox_boxObject.screenX - gFindBar_boxObject.screenX;
    var textboxY = textbox_boxObject.screenY - gFindBar_boxObject.screenY;
    var textboxW = textbox_boxObject.width;
    var textboxH = textbox_boxObject.height;
    this.textboxW = textboxW;

    var historyfindField = this._findField2;

    var historyfindbarbox = document.getElementById("historyfindbar-box");
    historyfindbarbox.style.bottom  = "0px";

    historyfindbarbox.style.height  = gFindBar_boxObject.height + "px";
    historyfindbarbox.style.left  = (gFindBar_boxObject.screenX
                                     - this.historyfindbar.boxObject.screenX) + "px";
    historyfindbarbox.style.bottom  = (historyfindbarbox.boxObject.screenY
                                       - gFindBar_boxObject.screenY) + "px";


    var textboxblft = window.getComputedStyle(textbox, '').
                      getPropertyValue('border-left-width').replace('px','')
    var textboxbrgt = window.getComputedStyle(textbox, '').
                      getPropertyValue('border-right-width').replace('px','')
    var textboxbtop = window.getComputedStyle(textbox, '').
                      getPropertyValue('border-top-width').replace('px','')
    var textboxbbot = window.getComputedStyle(textbox, '').
                      getPropertyValue('border-bottom-width').replace('px','')

    historyfindField.style.width  = -0+textboxW + "px";
    historyfindField.style.height = textboxH + "px";
    //
    historyfindbarbox.style.marginLeft = 0+textboxX + "px";
    historyfindField.style.marginTop  = textboxY + "px";
  },

  copyToFindfield: function(aEvent){window.userChrome_js.debug(aEvent.target.localName);
    if (aEvent.type == 'keypress' && "XMigemoUI" in window) {
		  XMigemoUI.onKeyPress(aEvent, XMigemoUI.getFindFieldFromContent(aEvent.originalTarget));
      historyFindbar._findField2.value = gFindBar._findField.value;
      return;
    }

    var textbox = aEvent.target;
    //window.userChrome_js.debug("UIEvents  " + this.lastInputValue +"\n"+textbox.value);
    if (aEvent.target == this._findField2.inputField &&
        aEvent.keyCode == KeyEvent.DOM_VK_TAB) {
      this._handleTab(aEvent);
      return;
    }

    if (aEvent.target == this._findField2.inputField &&
        (aEvent.keyCode == KeyEvent.DOM_VK_ESCAPE ||
         aEvent.keyCode == KeyEvent.DOM_VK_RETURN ||
         aEvent.keyCode == KeyEvent.DOM_VK_ENTER ||
         aEvent.keyCode == KeyEvent.DOM_VK_PAGE_UP ||
         aEvent.keyCode == KeyEvent.DOM_VK_PAGE_DOWN ||
         aEvent.keyCode == KeyEvent.DOM_VK_UP ||
         aEvent.keyCode == KeyEvent.DOM_VK_DOWN)) {
      // do nothing if history drop down is openned
      if (!!this.historyPopup.getAttribute("open")) {
        return;
      }
      var evt = document.createEvent("KeyboardEvent");
      evt.initKeyEvent ('keypress', true, true, window,
                    aEvent.ctrlKey, aEvent.altKey,
                    aEvent.shiftKey, aEvent.metaKey,
                    aEvent.keyCode, 0);
      gFindBar._findField.dispatchEvent(evt);
    }

    //本来のfindbar-textboxに転記して, ダミーイベント送信
    var text = textbox.value;
    gFindBar._findField.value = text;
    gFindBar._enableFindButtons(!!gFindBar._findField.value);
    if (aEvent.type == 'input' ||
      aEvent.type == 'drop'){
			var evt = document.createEvent("UIEvents");
			evt.initUIEvent("input", true, true, window, 0);
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
        if (gFindBar.getElement("find-previous").disabled)
          gFindBar.getElement("highlight").focus();
        else
          gFindBar.getElement("find-previous").focus();
      }
    } else {
        gFindBar._handleTab(aEvent);
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
    if(this.lastInputValue == value) return;
    if(value.replace(/ /g,'').length <= 2){
      this.lastInputValue = '';
      return;
    }
    if(this.addHistoryFindbarTimeout){
      clearTimeout(this.addHistoryFindbarTimeout);
    }
    this.addHistoryFindbarTimeout = setTimeout(function(self){
      self.lastInputValue = value;
      if(!!self.lastInputValue) {
        self.FormHistory.update(
          { op : "bump",
            fieldname : "findbar-history",
            value : value
          },
          { handleError : function(aError) {
              Components.utils.reportError("Saving search to form history failed: " + aError.message);
          }});
      }
    }, this.KEY_TIMER, this);
  },

  clearHistory: function() {
    try {
      if (PrivateBrowsingUtils.isWindowPrivate(window))
        return;
    } catch(ex) {}
    this.FormHistory.update(
      { op : "remove",
        fieldname : "findbar-history"
      }, null);
  },

  isMainBrowser: function() {
    return ("gBrowser" in window && "tabContainer" in gBrowser);
  }
}

historyFindbar.init();
