// ==UserScript==
// @name           patchForMouseGesturesRedox.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    speed up if rocker gestures do not use.
// @include        *
// ==/UserScript==
(function(){
  if ("mgGestureRecognizer" in window) {
    var func = mgGestureRecognizer.startGesture.toString();
    func = func.replace(
    'gs.lastDir = 0;',
    'gs.lastDir = 0;if (e.button == 0 && !mgGesturePrefs["enableRockers"]) return;'
    );
    eval("mgGestureRecognizer.startGesture = " + func);
  }
})();