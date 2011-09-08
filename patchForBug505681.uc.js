// ==UserScript==
// @name           patchForBug505681.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 505681 - Page source arrow key scrolling
// @include        chrome://global/content/viewSource.xul
// @compatibility  Firefox 5 6 7 8
// @author         Alice0775
// @version        2011/07/23 0:30
// ==/UserScript==
(function() {
  function patch(event) {
    var doc;
    if (typeof event == 'undefined')
      doc = content.document;
    else
      doc = event.originalTarget;
    var sel = doc.defaultView.getSelection();
    if (sel != "")
      return;
    document.getElementById('cmd_selectAll').doCommand();
    sel.collapse(doc.body, 0);
  }

  patch();
  window.addEventListener("pageshow", patch, true);
})();
