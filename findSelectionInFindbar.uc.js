// ==UserScript==
// @name           findSelectionInFindbar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    FindBarの選択テキスト上でマウスホイールによる選択テキスでの検索を可能にする。SearchWP-2.4.2.12.04.25.01がある場合は選択せずとも日本語のトークンを自動判定する
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 17+
// @author         Alice0775
// @version        2013/03/28 11:00 Improved to work properly without addHistoryFindbarFx3.0.uc.js
// @version        2013/02/09 19:30 null check
// @version        2012/05/01 21:30 delete this.xxx;
// @version        2012/05/01 20:00
// ==/UserScript==
var findSelectionInFindbar = {
  // addHistoryFindbarFx3.0.uc.js
  get _findField2(){
    delete this._findField2;
    return this._findField2 = document.getElementById("find-field2");
  },

  // addHistoryFindbarFx3.0.uc.js
  get inputbox2(){
    delete this.inputbox2;
    return this.inputbox2 = document.getAnonymousElementByAttribute(this._findField2,
                                                                    "anonid",
                                                                    "textbox-input-box");
  },

  get _findField() {
    return this._findField2 || gFindBar._findField;
  },

  init: function() {
    try {
      gFindBar;
    } catch(e) {}
    if (typeof gFindBar == 'undefined') {
      window.gFindBar = document.getElementById("FindToolbar");
      gFindBar._findField = document.getAnonymousElementByAttribute(gFindBar, "anonid", "findbar-textbox");
    }
    
    window.addEventListener("unload", this, false);
    setTimeout((function(){
      var target = this._findField;
      target.addEventListener("DOMMouseScroll", this, false);
    }).bind(this), 1000)
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    var target = this._findField;
    target.removeEventListener("DOMMouseScroll", this, false);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "DOMMouseScroll":
        this.onDOMMouseScroll(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  _findFast: function(aWord, aFindBackwards, aMatchCase) {
    var fastFind = window.getBrowser().fastFind;
    fastFind.caseSensitive = aMatchCase;

    var result = Components.interfaces.nsITypeAheadFind.FIND_NOTFOUND;
    if (fastFind.searchString != aWord) {
      result = fastFind.find(aWord, false);
    }
    else {
      result = fastFind.findAgain(aFindBackwards, false);
    }

    // a
    if(typeof ucjsFind != 'undefined') ucjsFind._dispSelectionCenter(result);

    gFindBar._updateStatusUI(result, aFindBackwards);
  },

  onDOMMouseScroll: function(event) {
    if ( event.rangeParent.nodeType != 3 ) {
      return;
    }

    var term;
    var offset = event.rangeOffset;
    var a = this._findField.selectionStart;
    var b = this._findField.selectionEnd;
//userChrome_js.debug(a);
    if ( (offset < a || offset >= b) &&
         ("gSearchWP" in this.getWin && "Tokenizer" in this.getWin.gSearchWP && "getByOffset" in this.getWin.gSearchWP.Tokenizer)) {
      // gSearchWP
      var match = this.getWin.gSearchWP.Tokenizer.getByOffset( this._findField.value, offset );
      if (!!match) {
        term = match.value;
        if (!!term) {
          this._findField.selectionStart = match.index;
          this._findField.selectionEnd = match.index + term.length;
        }
      }
    } else {
      term = this._findField.value.substring( a, b );
    }

    if (!!term) {
      var findBackwards = event.detail < 0 ? true : false;
      var matchCase = event.altKey || event.ctrlKey;
      this._findFast( term, findBackwards,  matchCase);
    }
  },

  get getWin() {
    var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    if(mediator.getMostRecentWindow("navigator:browser"))
      return mediator.getMostRecentWindow("navigator:browser");
    else if (mediator.getMostRecentWindow("mail:3pane"))
      return mediator.getMostRecentWindow("mail:3pane");
  }
}

findSelectionInFindbar.init();
