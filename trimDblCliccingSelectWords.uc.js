// ==UserScript==
// @name           trimDblCliccingSelectWords.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    テキストをダブル(トリプル)クリックで選択したとき, 最後の半角スペースを取り除く
// @include        main
// @compatibility  Firefox 3.0 3.1 3.2
// @author         Alice0775
// @version        2008/12/31 18:00
// @Note           layout.word_select.eat_space_to_next_word が false の時のみ実行
// ==/UserScript==
var trimDblCliccingSelectWords = {
  EAT_SPACE_TO_NEXT_WORD: "layout.word_select.eat_space_to_next_word",
  _timer: null,
  _button:null,

  init: function () {
    window.addEventListener("unload", this, false);
    window.addEventListener("click", this, false);
  },

  uninit: function () {
    window.removeEventListener("unload", this, false);
    window.removeEventListener("click", this, false);
  },

  handleEvent: function (event) {
    switch (event.type) {
      case "unload":
        this.uninit();
        break;
      case "click":
        if (event.button != 0) {
          this._button = null;
          break;
        }
        if (event.detail < 2){
          this._button = true;
          break;
        }
        if (this._button && !gPrefService.getBoolPref(this.EAT_SPACE_TO_NEXT_WORD)) {
          if (this._timer)
            clearTimeout(this._timer);
          this._timer = setTimeout(function(self){self.trimDblCliccingSelectWords(event);}, 100, this);
        }
        break;
    }
  },

  //現在のウインドウを得る
  _getFocusedWindow: function () {
      var focusedWindow = document.commandDispatcher.focusedWindow;
      if (!focusedWindow || focusedWindow == window) {
        return window.content;
      } else {
        return focusedWindow;
      }
  },

  //選択されている文字列を得る
  _getselection: function (notrim) {
    var targetWindow = this._getFocusedWindow();
    var sel = Components.lookupMethod(targetWindow, "getSelection").call(targetWindow);
    if (sel && !sel.toString()) {
      var node = document.commandDispatcher.focusedElement;
      if (node &&
          (node.type == "text" || node.type == "textarea") &&
          "selectionStart" in node &&
          node.selectionStart != node.selectionEnd) {
        var offsetStart = Math.min(node.selectionStart, node.selectionEnd);
        var offsetEnd = Math.max(node.selectionStart, node.selectionEnd);
        return node.value.substr(offsetStart, offsetEnd - offsetStart);
      }
    }
    if (notrim) {
      return sel ? sel.toString() : null;
    } else {
      return sel ? sel.toString().replace(/\s/g, " ").replace(/^[\ ]+|[\ ]+$/g, "").replace(/[\ ]+/g, " ") : null;
    }
  },

  trimDblCliccingSelectWords: function (event){
    //選択文字無いなら,これは目的と違う
    var sel = this._getselection(true);
    if (!sel) {
      return;
    }
    if (!/\s$/.test(sel)) {
      return;
    }
    var targetWindow = this._getFocusedWindow();
    var ev = document.createEvent("KeyboardEvent");
    ev.initKeyEvent(
         "keypress",        //  in DOMString typeArg,
          true,             //  in boolean canBubbleArg,
          true,             //  in boolean cancelableArg,
          null,             //  in nsIDOMAbstractView viewArg, Specifies UIEvent.view. This value may be null.
          false,            //  in boolean ctrlKeyArg,
          false,            //  in boolean altKeyArg,
          true,             //  in boolean shiftKeyArg,
          false,            //  in boolean metaKeyArg,
          KeyEvent.DOM_VK_LEFT,      //  in unsigned long keyCodeArg,
          0);               //  in unsigned long charCodeArg);
     event.target.ownerDocument.dispatchEvent(ev);
  }
}
trimDblCliccingSelectWords.init();
