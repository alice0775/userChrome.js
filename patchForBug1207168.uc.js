// ==UserScript==
// @name           patchForBug1207168.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 1207168 - [Page Info] Save As (download) doesn't work when two or more media files are selected at the same time
// @include        chrome://browser/content/pageinfo/pageInfo.xul
// @compatibility  Firefox 42+
// @author         Alice0775
// @version        2015/09/30 17:00
// ==/UserScript==

(function(){
  "use strict";
  var func = window.saveMedia.toString();
  if (!/gDocument/.test(func)) {
    func = func.replace(
      /{/,
      '{\n\
         gWindow = window.opener.gBrowser.selectedBrowser.contentWindowAsCPOW;\n\
         gDocument = gWindow.document;'
      );
    func = func.replace(
      'aChosenData, aBaseURI, null,',
      'aChosenData, aBaseURI, gDocument,'
      );
    try{
      window.saveMedia = new Function(
         func.match(/\((.*)\)\s*\{/)[1],
         func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
      );
    } catch(ex){}
  }
})();