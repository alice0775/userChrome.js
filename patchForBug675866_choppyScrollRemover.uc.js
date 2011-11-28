// ==UserScript==
// @name           patchForBug675866_choppyScrollRemover.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 675866 scrolling complex pages like Engadget is consistently slower and jerkier than the competition and Bug 705174 Bug 705361 ftp slow scroll and hover
// @include        main
// @compatibility  Firefox 7-
// @author         Alice0775
// @version        2011/11/08 13:00 タブ選択時
// @version        2011/10/24 19:00 xxx scroll amount become small when forst tick of wheel scroll
// @version        2011/10/22 12:00
// @Note           コンテンツにDIV要素を挿入しているので留意
// ==/UserScript==
var patchForBug675866_choppyScrollRemover = {
  DELAY: 400,
  timer: null,
  scrolling: false,

  KscreenId : "__patchForBug675866_Screen",

  get box() {
    delete this.box;
    return this.box = document.getElementById("appcontent");
  },

  get autoscroller() {
    delete this.autoscroller;
    return this.autoscroller = document.getElementById("autoscroller");
  },

  init : function() {
    gBrowser.tabContainer.addEventListener('TabSelect', this, false);
    gBrowser.tabContainer.addEventListener('mousedown', this, true);
    window.addEventListener('resize', this, false);
    this.DELAY_SHOW = Services.prefs.getIntPref("browser.overlink-delay");
    this.box.addEventListener('scroll', this, true);
    this.autoscroller.addEventListener('popupshowing', this, false);
    window.addEventListener('unload', this, false);

    var style = String(<![CDATA[
    @namespace url(http://www.w3.org/1999/xhtml);
    #__patchForBug675866_Screen {
      left : 0 !important;
      top : 0 !important;
      width : 100%;
      height : 100%;
      border : 0 !important;
      margin : 0 !important;
      padding : 0 !important;
      background : transparent !important;
      position : absolute !important;
      display : none !important;
      z-index : 1000000 !important;
    }
    #__patchForBug675866_Screen[on] {
      display : -moz-box !important;
    }

    @-moz-document url-prefix(ftp://) {


    tbody > tr:nth-child(2n+1) {
      background:#efefff;
      /*color:#000000;*/
    }
    tbody > tr:nth-child(2n) {
      background-color: #feffff;
      /*color:#000000;*/
    }

    tbody > tr:hover {
      outline: none !important;
      background-color: #ccccff;
    }
    }
    ]]>).replace(/\s+/g, " ");
    
		code = "data:text/css;charset=utf-8," + encodeURIComponent(style);
		var uri = Services.io.newURI(code, null, null);
	  Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService)
	             .loadAndRegisterSheet(uri, Ci.nsIStyleSheetService.USER_SHEET);
  },

  uninit : function() {
    gBrowser.tabContainer.removeEventListener('TabSelect', this, false);
    gBrowser.tabContainer.removeEventListener('mousedown', this, true);
    window.removeEventListener('resize', this, false);
    window.removeEventListener('unload', this, false);
    this.box.removeEventListener('scroll', this, true);
    this.autoscroller.removeEventListener('popupshowing', this, false);
    if (this.timer)
      clearTimeout(this.timer);
  },

  insertScreen : function(win) {
    if (typeof win == 'undefined')
      win = content;
    if (/^ftp:/.test(win.location.href))
      return;
    if (win.frames && win.frames.length) {
      var self = this;
      Array.prototype.slice.call(win.frames).forEach(function(aSubFrame) {
        self.insertScreen(aSubFrame);
      });
    }
    var doc = win.document;
    // skip when document is in design mode
    if (Components.lookupMethod(doc, 'designMode').call(doc) == 'on')
      return;

    var screen = doc.getElementById(this.KscreenId);
    // skip already created SCREEN
    if (screen) {
      return;
    }

    // skip no body element
    var bodies = doc.getElementsByTagName("body");
    if(bodies.length == 0)
      return;
    // skip when bosy is in ContentEditable
    if (bodies[0].isContentEditable)
      return;

    var screen = doc.createElement("div");
    screen.setAttribute("id", this.KscreenId);
    var screen = bodies[0].insertBefore(screen, bodies[0].lastChild);
  },

  screenSwitch: function(on, win) {
    if (typeof win == 'undefined')
      win = content;
    if (/^ftp:/.test(win.location.href))
      return;
    if (win.frames && win.frames.length) {
      var self = this;
      Array.prototype.slice.call(win.frames).forEach(function(aSubFrame) {
        self.screenSwitch(on, aSubFrame);
      });
    }
    var doc = win.document;

    var screen = doc.getElementById(this.KscreenId);
    // skip if no SCREEN element
    if (!screen)
      return;

    if (on) {
      var bodies = doc.getElementsByTagName("body");
      screen.setAttribute('on', true);
      // xxx hack for document mode
      var rectObject = screen.getBoundingClientRect();
      var height = Math.floor(rectObject.bottom - rectObject.top);
      var scrollH = Math.max(bodies[0].parentNode.scrollHeight, bodies[0].offsetHeight);
      var scrollW = Math.max(bodies[0].parentNode.scrollWidth , bodies[0].offsetWidth);
      userChrome_js.debug(height+ " " +scrollH);
      if (height < scrollH) {
        // xxx -5 ;  This prevent that scroll amount become small when forst tick of wheel scroll
        screen.style.setProperty('min-height', scrollH-5 + 'px', 'important');
        screen.style.setProperty('min-width', scrollW-5 + 'px', 'important');
      }
    } else {
      screen.removeAttribute('on');
      screen.style.removeProperty('min-height');
      screen.style.removeProperty('min-width');
    }
  },

  scroll: function(event) {
    if (this.autoscroller.state == "open" ||
        this.autoscroller.state == "showing")
      return;
    if ("GrabScroll" in window && GrabScroll.mStatus == 2)
      return;
    var doc = event.originalTarget;
    if (doc instanceof HTMLDocument &&
        doc.defaultView.top == content) {
      doc = doc.defaultView.top.document;
      if (!this.scrolling) {
        this.addListener();
      }
    }
    if (this.timer)
      clearTimeout(this.timer);
    this.timer = setTimeout(function(self) {
      self.removeListener();
    }, this.DELAY, this); 
  },

  addListener: function() {
    //userChrome_js.debug('addListener');
    this.scrolling = true;
    this.insertScreen();
    this.screenSwitch(true);
  },

  removeListener: function() {
    //userChrome_js.debug('removeListener');
    if (this.timer)
      clearTimeout(this.timer);
    this.scrolling = false;
    this.screenSwitch(false);
  },

  popupshowing: function(event) {
    this.autoscroller.addEventListener('popuphidden', this, false);
    this.addListener();
  },

  popuphidden: function(event) {
    this.autoscroller.removeEventListener('popuphidden', this, false);
    this.removeListener();
  },

  resized: null,
  resize: function(event) {
    this.box.removeEventListener('scroll', this, true);
    if (this.resized)
      clearTimeout(this.resized);
    this.resized = setTimeout(function(self) {
      self.removeListener();
      self.box.addEventListener('scroll', self, true);
    }, 500, this);
  },

  handleEvent: function(event) {
    switch (event.type) {
      case 'scroll':
        this.scroll(event);
        break;
      case 'mousedown':
        if (event.originalTarget.id != this.KscreenId)
          return;
        //no break
      case 'TabSelect':
        this.removeListener();
        break;
      case 'popupshowing':
        this.popupshowing();
        break;
      case 'popuphidden':
        this.popuphidden();
        break;
      case 'resize':
        this.resize(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }
}
patchForBug675866_choppyScrollRemover.init();
