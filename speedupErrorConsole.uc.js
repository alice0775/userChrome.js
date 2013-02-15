// ==UserScript==
// @name           speedupErrorConsole.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    sppedup Error Console (hide long source code) Bug 840451
// @include        chrome://global/content/console.xul
// @include        chrome://console2/content/console2.xul
// @include        main
// @compatibility  Firefox 21+
// @author         Alice0775
// @version        2013/02/15 18:00 typo
// @version        2013/02/11 12:30
// ==/UserScript==
(function() {
  function applyPatch() {
    if (!document.getElementById('ConsoleBox'))
      return;
    var func = document.getElementById('ConsoleBox').appendError.toString();
    if (/\.indexOf\("CSS"\)/.test(func))
      return;

    if(/aObject/.test(func)) {
      func = func.replace(
      'if (aObject.sourceLine) {',
      '$&if (!aObject.category || aObject.category.indexOf("CSS") < 0 || aObject.columnNumber < 120) {'
      ).replace(
      'row.mSourceLine = sourceLine;',
      '$&}else{}'
      ).replace(
      'if (aObject.columnNumber) {',
      '$&if (!aObject.category || aObject.category.indexOf("CSS") < 0 || aObject.columnNumber < 120) {'
      ).replace(
      'row.setAttribute("errorCaret", " ");',
      '} else {row.setAttribute("code", "Column: " + aObject.columnNumber || 0);row.setAttribute("hideCaret", "true");}'
      );
      document.getElementById('ConsoleBox').appendError = new Function(
        func.match(/\(([^)]*)/)[1],
        func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
      );
    } else {
      func = func.replace(
      /if \(aMessage\.sourceLine\)[\s\t\r]+\{/,
      '$& if (!aMessage.category || aMessage.category.indexOf("CSS") < 0 || aMessage.columnNumber < 120){'
      ).replace(
      'row.setAttribute("errorDots", this.repeatChar(" ", aMessage.columnNumber));',
      '$&} else {row.setAttribute("code", "Column: " + aMessage.columnNumber || 0);}'
      );
      document.getElementById('ConsoleBox').appendError = new Function(
        func.match(/\(([^)]*)/)[1],
        func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
      );
    }
  }

  if (location.href == "chrome://browser/content/browser.xul") {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator(null);
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      // win is [Object ChromeWindow] (just like window), do something with it
      if (win.location.href == "chrome://global/content/console.xul" ||
          win.location.href == "chrome://console2/content/console2.xul")
        applyPatch();
        break;
    }
  } else {
    applyPatch();
  }
})();
