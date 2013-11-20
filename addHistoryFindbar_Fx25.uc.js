// ==UserScript==
// @name           addHistoryFindbarFx25.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add History to Findbar
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 25
// @author         Alice0775
// @version        2013/11/16 12:30 Firefox25
// ==/UserScript==
// @version        2009/01/25 テーマに依存する
// @Note           need Sub-Script/Overlay Loader v3.0.20mod +
var historyFindbar = {
  // --config --
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

  get inputbox(){
    delete this.inputbox;
    return this.inputbox = document.getAnonymousElementByAttribute(this._findField2,
                                                                   "anonid", "textbox-input-box");
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
                       allowevents="false" \
                       autocompletesearch="form-history" \
                       autocompletesearchparam="findbar-history" \
                       disableAutocomplete="true" \
                       onkeypress="historyFindbar.copyToFindfield(event);" \
                       onclick="historyFindbar.copyToFindfield(event);" \
                       ondrop="historyFindbar.copyToFindfield(event);" \
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
                       allowevents="false" \
                       autocompletesearch="form-history" \
                       autocompletesearchparam="findbar-history" \
                       disableAutocomplete="true" \
                       onkeypress="historyFindbar.copyToFindfield(event);" \
                       onclick="historyFindbar.copyToFindfield(event);" \
                       ondrop="historyFindbar.copyToFindfield(event);" \
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
          background-color: transparent !important; \
          color: transparent !important; \
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
      gFindBar._findField = document.getAnonymousElementByAttribute(gFindBar, "anonid", "findbar-textbox");
    }

    window.addEventListener("resize", this, false);
    window.addEventListener("findbaropen", this, false);
    window.addEventListener("find", this, false);
    window.addEventListener("findagain", this, false);
    window.addEventListener("findclose", this, false);

    if (this.isMainBrowser())
      gBrowser.tabContainer.addEventListener("TabSelect", this, false);

    //fx25 for existing findbar
    let findBars = document.querySelectorAll("findbar");
    if (findBars.length > 0) {
      Array.forEach(findBars, function (aFindBar) {
        historyFindbar.patch(aFindBar);
      });
    } else if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar)
        historyFindbar.patch(gBrowser.selectedTab._findBar);
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

    gFindBar.close_org = gFindBar.close;
    gFindBar.close = function() {
      gFindBar.close_org();
      gFindBar._dispatchFindEvent("close");
    }

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
        this.adjustSizeTimer = setTimeout((function(){
          this.adjustSize();
        }).bind(this), this.adjustSizeDelay, this);
        break;
      case 'findbaropen':
        this.historyfindbar.hidden = gFindBar.hidden;
        this.adjustSize();
        setTimeout((function(){
          this._findField2.value = gFindBar._findField.value;
        }).bind(this), 0, this);
        break;
      case 'find':
      case "findagain":
        if ( gFindBar._findField.value != this.lastInputValue){
          this.addToHistory(gFindBar._findField.value);
        }
        break;
      case 'findclose':
          this.historyfindbar.hidden = true;
        break;
      case 'TabSelect':
        setTimeout((function(){
          if (gBrowser.isFindBarInitialized(aEvent.target)) {
            this.historyfindbar.hidden = gFindBar.hidden;
            this._findField2.value = gFindBar._findField.value;
          } else
            this.historyfindbar.hidden = true;
        }).bind(this), 0);
        break;
    }
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

    historyfindField.style.width  = textboxW + "px";
    historyfindField.style.height = textboxH + "px";
    //
    historyfindbarbox.style.marginLeft = textboxX + "px";
    historyfindField.style.marginTop  = textboxY + "px";
  },

  copyToFindfield: function(aEvent){
    if (aEvent.type == 'click' ||
        aEvent.type == 'keypress' ||
        aEvent.type == 'drop'){
      gFindBar._findField.value  = aEvent.target.value; userChrome_js.debug(aEvent.originalTarget.localName);
      if (aEvent.originalTarget.localName == "div" ||
          aEvent.originalTarget.localName == "treechildren")
        gFindBar._findField.focus();
      var evt = document.createEvent("UIEvents");
      evt.initUIEvent("input", true, false, window, 0);
      gFindBar._findField.dispatchEvent(evt);
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
