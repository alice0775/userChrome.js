// ==UserScript==
// @name           ddwin_button.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ddwin起動ボタン
// @charset        utf-8
// @include        main
// @compatibility  Firefox 100
// @author         Alice0775
// @version        2022/04/01 23:00 Convert Components.utils.import to ChromeUtils.import
// @version        2019/09/05 12:00 
// @version        2018/09/07 17:00 
// ==/UserScript==
var ddwin_button = {
  //-- config --
    PATH: "c:\\Program Files\\DDwin\\ddwin.exe",
    GROUP: "",
  //-- /config --

  init: function() {
    ChromeUtils.import("resource:///modules/CustomizableUI.jsm");

    try {
      CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
        id: 'ddwin_button',
        type: 'custom',
        defaultArea: CustomizableUI.AREA_NAVBAR,
        onBuild: function(aDocument) {
          var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
          var props = {
            id: "ddwin_button",
            class: "toolbarbutton-1 chromeclass-toolbar-additional",
            tooltiptext: "Launch ddwin",
            oncommand: "ddwin_button.launchWithSelectedText();",
            label: "Launch ddwin",
            removable: "true",
            style: "list-style-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABBklEQVQ4jY2TPW6DQBBGH0rkciW3ERJ3GF+BkhxjuQZpcocVvgYnSOFmtZzBRWR3LkjPpMBOAC+IkabYn/fmk1YLq2UVRNfvLIIoeIVewW2VzMFxr0rG4BR2zqrIahJ7P5yC3ot6L9r3jARxiWJdFLTWzeCoxA7T7xIR/9fPYFRSDRviJ0m2tdMX+PkA4Po++IoG2sOGFwtAQzIsRKEESpAAhwDHcgWsEYE83z8EEQnMkgwTRS7k+Z4sy0jTdCxYkgTg+gQaY+i6bi6YS2qEEAWbpiEEYoKxJFBVb4gIxhjO529Opy9CgLY9JgCvcUGbQK3Qstt9crv9T3yAG0u0KAoVsYsf6RersuxSjXvhngAAAABJRU5ErkJggg==');",
          };
          for (var p in props) {
            toolbaritem.setAttribute(p, props[p]);
          }
          
          return toolbaritem;
        },
      });
    } catch(ee) {}


    function frameScript() {
      addMessageListener("ddwin_getSelectedText", messageListener);
      function messageListener() {
        let sel = content.getSelection();
        let data = {text: sel.toString()}
        sendSyncMessage("ddwin_selectionData", data);
      }
    }
    let frameScriptURI = 'data:application/javascript,'
      + encodeURIComponent('(' + frameScript.toString() + ')()');
    window.messageManager.loadFrameScript(frameScriptURI, true);
    window.messageManager.addMessageListener("ddwin_selectionData", this);


  },

  receiveMessage: function(message) {
    switch (message.name) {
      case 'ddwin_selectionData':
        this.launch(message.data.text);
        break;
    }
  },

  launchWithSelectedText: function() {
    gBrowser.selectedTab.linkedBrowser.messageManager.sendAsyncMessage("ddwin_getSelectedText");
  },

  launch: function(query) {
    var ddwinPath = this.PATH;
    var ddwinGroup = this.GROUP;
    if(query != null) {
        query = this.remove_latin_1_accent(query);
        query = query
                    .replace(/^\s+/, "")
                    .replace(/\s+$/, "")
                    .replace(/^[\x21-\x2F\x7B-\x7E]+/, "")
                    .replace(/[\x21-\x2F\x7B-\x7E]+$/, "");
        query = this.convertCharCodeFrom(query, "shift_jis");
        this.exec(ddwinPath,
        ",2," + this.convertCharCodeFrom(ddwinGroup, "shift_jis") + ",G1," + query);
    }
  },

  remove_latin_1_accent: function(s) {
      return s
    .replace(/[\xC0-\xC5]/g, "A")
    .replace(/[\xC6]/g, "AE")
    .replace(/[\xC7]/g, "C")
    .replace(/[\xC8-\xCB]/g, "E")
    .replace(/[\xCC-\xCF]/g, "I")
    .replace(/[\xD0]/g, "TH") // ETH ("D" にアクセント)
    .replace(/[\xD1]/g, "N")
    .replace(/[\xD2-\xD6\xD8]/g, "O")
    .replace(/[\xD9-\xDC]/g, "U")
    .replace(/[\xDD]/g, "Y")
    .replace(/[\xDE]/g, "TH") // THORN
    .replace(/[\xDF]/g, "ss")
    .replace(/[\xE0-\xE5]/g, "a") 
    .replace(/[\xE6]/g, "ae")
    .replace(/[\xE7]/g, "c")
    .replace(/[\xE8-\xEB]/g, "e")
    .replace(/[\xEC-\xEF]/g, "i")
    .replace(/[\xF0]/g, "th") // eth ("d" にアクセント)
    .replace(/[\xF1]/g, "n")
    .replace(/[\xF2-\xF6\xF8]/g, "o")
    .replace(/[\xF9-\xFC]/g, "u")
    .replace(/[\xFD\xFF]/g, "y")
    .replace(/[\xFE]/g, "th") // thorn
      
    // Latin Extended-A
    // 簡単にするため French 以外は大文字・小文字を区別していない。
    .replace(/[\u0100-\u0105]/g, "a")
    .replace(/[\u0106-\u010D]/g, "c")
    .replace(/[\u010E-\u0111]/g, "d")
    .replace(/[\u0112-\u011B]/g, "e")
    .replace(/[\u011C-\u0123]/g, "g")
    .replace(/[\u0124-\u0127]/g, "h")
    .replace(/[\u0128-\u0131]/g, "i")
    .replace(/[\u0132]/g, "IJ")
    .replace(/[\u0133]/g, "ij")
    .replace(/[\u0134-\u0135]/g, "j")
    .replace(/[\u0136-\u0138]/g, "k")
    .replace(/[\u0139-\u0142]/g, "l")
    .replace(/[\u0143-\u014B]/g, "n")
    .replace(/[\u014C-\u0151]/g, "o")
    .replace(/[\u0152]/g, "OE")
    .replace(/[\u0153]/g, "oe")
    .replace(/[\u0154-\u0159]/g, "r")
    .replace(/[\u015A-\u0161]/g, "s")
    .replace(/[\u0162-\u0167]/g, "t")
    .replace(/[\u0168-\u0173]/g, "u")
    .replace(/[\u0174-\u0175]/g, "w")
    .replace(/[\u0176-\u0177]/g, "y")
    .replace(/[\u0178]/g, "Y")
    .replace(/[\u0179-\u017E]/g, "z")
    .replace(/[\u017F]/g, "s");
  },

  convertCharCodeFrom: function(str,charset){
      const UNICODE_CONVERTER = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);
      try{
          UNICODE_CONVERTER.charset = charset;
          return UNICODE_CONVERTER.ConvertFromUnicode(str);
      }
      catch(e){ return null; }
  },

  exec: function(aFilePath, aArgs, blocking){
    var localFile = this.getLocalFile(aFilePath);
    if(!localFile) return false;

    var argArray = new Array();
    if(aArgs)
      if(aArgs instanceof Array) argArray = aArgs;
      else argArray = aArgs.toString().split(" ");
    if(!blocking) blocking = false;
    var process = Components.classes["@mozilla.org/process/util;1"]
                            .createInstance(Components.interfaces.nsIProcess);
    try{
      process.init(localFile);
      process.run(blocking, argArray, argArray.length);
    }catch(e){
      alert(e);
      return false;
    }
    return true;
  },

  getLocalFile: function(aFilePath){
      var localFile = Components.classes['@mozilla.org/file/local;1']
                          .createInstance(Components.interfaces.nsIFile);
      try{
          localFile.initWithPath(aFilePath);
          return localFile;
      }catch(e){}
      return null;
  }

}
ddwin_button.init();
