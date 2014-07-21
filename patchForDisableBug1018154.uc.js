// ==UserScript==
// @name           patchForDisableBug1018154.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    patch For Disable Bug1018154
// @include        main
// @compatibility  Firefox 33+
// @author         Alice0775
// @version        2014/07/06 09:01
// @version        2014/07/06 09:00
// ==/UserScript==

window.stripUnsafeProtocolOnPaste = function stripUnsafeProtocolOnPaste(pasteData) {
  return pasteData
}