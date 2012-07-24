// ==UserScript==
// @name           patchForMouseGesturesRedox.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    speed up if rocker gestures do not use.
// @include        *
// @version        2012/07/24 14:30 Bug 761723 implement toString of function objects by saving source
// ==/UserScript==
// @version        2012/04/14 button, EventListener
(function(){
  if ("mgGestureRecognizer" in window) {
    window.removeEventListener("mousedown", mgGestureRecognizer.startGesture, true);
    var func = mgGestureRecognizer.startGesture.toString();
    func = func.replace(
    'if (ms)',
    'if (mgGesturePrefs["mousebutton"] == 2 && e.button == 0 && !mgGesturePrefs["enableRockers"]) return; if (ms)'
    );
    eval("mgGestureRecognizer.startGesture = " + func);
    window.addEventListener("mousedown", mgGestureRecognizer.startGesture, true);
  }
})();