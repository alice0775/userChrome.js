// ==UserScript==
// @name           findSelectionInFindbar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    FindBarの選択テキスト上でマウスホイールによる選択テキスでの検索を可能にする。SearchWP-2.4.2.12.04.25.01がある場合は選択せずとも日本語のトークンを自動判定する
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 25
// @author         Alice0775
// @version        2016/05/15 23:00 fix selection
// @version        2016/05/15 23:00 RetryHistoryFindbar
// @version        2013/11/22 19:00 historyFindbar
// @version        2013/05/11 12:00 Bug537013, Bug 893349
// @version        2013/03/28 11:00 Improved to work properly without addHistoryFindbarFx3.0.uc.js
// @version        2013/02/09 19:30 null check
// @version        2012/05/01 21:30 delete this.xxx;
// @version        2012/05/01 20:00
// ==/UserScript==
var findSelectionInFindbar = {
  // addHistoryFindbarFx3.0.uc.js
  get _findField2(){
    return document.getElementById("find-field2");
  },

  _maxRetryHistoryFindbarCont: 10,
  _timer: null,

  init: function() {
    this._timer = setInterval(function(){
      if (typeof historyFindbar != "undefined" && this._findField2) {
        this._findField2.addEventListener("DOMMouseScroll", this, false);
        clearInterval(this._timer);
        return;
      }
      if (!this._maxRetryHistoryFindbarCont--)
        clearInterval(this._timer);
    }.bind(this), 2000);

    //fx25 for  existing findbar
    let findBars = document.querySelectorAll("findbar");
    if (findBars.length > 0) {
      Array.forEach(findBars, function (aFindBar) {
        findSelectionInFindbar.patch(aFindBar);
      });
    } else if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar)
        findSelectionInFindbar.patch(gBrowser.selectedTab._findBar);
    }
    //fx25 for newly created findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
        findSelectionInFindbar.patch(event.target._findBar);
      });
    }
  },

  patch: function(aFindBar) {
    window.addEventListener("unload", this, false);
    setTimeout((function(){
      var target = aFindBar._findField;
      target.addEventListener("DOMMouseScroll", this, false);
    }).bind(this), 1000)
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);

    if (this._findField2)
      this._findField2.removeEventListener("DOMMouseScroll", this, false);

    let findBars = document.querySelectorAll("findbar");
    Array.forEach(findBars, (function (aFindBar) {
      var target = aFindBar._findField;
      target.removeEventListener("DOMMouseScroll", this, false);
    }).bind(this));
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
    var fastFind = gBrowser.selectedTab.linkedBrowser.fastFind;
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

    window.getBrowser().getFindBar()._updateStatusUI(result, aFindBackwards);
  },

  onDOMMouseScroll: function(event) {
    if ( event.rangeParent.nodeType != 3 ) {
      return;
    }

    var textbox = event.originalTarget.parentNode;
    var term;
    var offset = event.rangeOffset;
    var a = textbox.selectionStart;
    var b = textbox.selectionEnd;
//userChrome_js.debug(a);
    if ( (offset < a || offset >= b) &&
         ("gSearchWP" in this.getWin && "Tokenizer" in this.getWin.gSearchWP && "getByOffset" in this.getWin.gSearchWP.Tokenizer)) {
      // gSearchWP
      var match = this.getWin.gSearchWP.Tokenizer.getByOffset( textbox.value, offset );
      if (!!match) {
        term = match.value;
        if (!!term) {
          textbox.setSelectionRange(match.index, match.index + term.length);
          //textbox.selectionStart = match.index;
          //textbox.selectionEnd = match.index + term.length;
        }
      }
    } else {
      term = textbox.value.substring( a, b );
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
