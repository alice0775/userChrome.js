// ==UserScript==
// @name           patchForCommonDialog.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    CommonDialog文字化け対策 nsIHttpChannel "http-on-examine-response" を使用しない版
// @include        main
// @compatibility  Firefox 3.0 3.5 3.6a1pre
// @author         Alice0775
// @version        2009/06/28
// @note           000-windowhook.uc.js が必要
// ==/UserScript==
WindowHook.register("chrome://global/content/commonDialog.xul",
  function(aWindow) {
    function ucjsGetCharset(str){
      function charCode(str){
        if (/\x1B\x24(?:[\x40\x42]|\x28\x44)/.test(str))
          return 'ISO-2022-JP';
        if (/[\x80-\xFE]/.test(str)){
            var buf = RegExp.lastMatch + RegExp.rightContext;
            if (/[\xC2-\xFD][^\x80-\xBF]|[\xC2-\xDF][\x80-\xBF][^\x00-\x7F\xC2-\xFD]|[\xE0-\xEF][\x80-\xBF][\x80-\xBF][^\x00-\x7F\xC2-\xFD]/.test(buf))
              return (/[\x80-\xA0]/.test(buf)) ? 'Shift_JIS' : 'EUC-JP';
            if (/^(?:[\x00-\x7F\xA1-\xDF]|[\x81-\x9F\xE0-\xFC][\x40-\x7E\x80-\xFC])+$/.test(buf))
              return 'Shift_JIS';
            if (/[\x80-\xA0]/.test(buf))
              return 'UTF-8';
            return 'EUC-JP';
        } else
          return 'us-ascii';
      }
      var charset = charCode(str);
      if (charset == "UTF-8" || charset == "us-ascii")
        return charset;

      //判定に失敗している場合があるので, 再チェック (鈍くさ);
      var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      try {
        UI.charset = "UTF-8";
        if (str === UI.ConvertFromUnicode(UI.ConvertToUnicode(str)))
          return "UTF-8";
      } catch(ex){}
      try {
        UI.charset = charset;
        if (str === UI.ConvertFromUnicode(UI.ConvertToUnicode(str)))
          return charset;
      } catch(ex){}
      return "UTF-8";
    }

    setTimeout(function(){
      if (!aWindow.document)
        return;
      var info = aWindow.document.getElementById("info.body");
      if (!info)
        return;
      var str = info.textContent;
      if (!str)
        return;
      var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      try {
        var matchStr = str.match(/(?:.*")(.+)(?:".*)$/);
        if (!matchStr[1])
          return;
        UI.charset = ucjsGetCharset(matchStr[1]);
        str = str.replace(matchStr[1], UI.ConvertToUnicode(matchStr[1]));
        aWindow.document.getElementById("info.body").textContent = str;
      } catch (ex) {
        return;
      }
      var box = aWindow.document.getElementById("infoContainer");
      var grid = box.parentNode.parentNode.parentNode;
      var width = grid.boxObject.width;
      box.style.setProperty("max-Width", width + "px", "important")
    }, 0);

  }
);
