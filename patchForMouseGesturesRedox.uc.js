// ==UserScript==
// @name           patchForMouseGesturesRedox.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    speed up if rocker gestures do not use.
// @include        *
// @version        2012/04/14 button, EventListener
// ==/UserScript==
(function(){
  if ("mgGestureRecognizer" in window) {
    window.removeEventListener("mousedown", mgGestureRecognizer.startGesture, true);
    var func = mgGestureRecognizer.startGesture.toString();
    func = func.replace(
    'gs.lastDir = 0;',
    'gs.lastDir = 0;if (mgGesturePrefs["mousebutton"] == 2 && e.button == 0 && !mgGesturePrefs["enableRockers"]) return;'
    );
    eval("mgGestureRecognizer.startGesture = " + func);
    window.addEventListener("mousedown", mgGestureRecognizer.startGesture, true);
  }
})();