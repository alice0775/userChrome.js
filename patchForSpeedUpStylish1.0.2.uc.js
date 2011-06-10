// ==UserScript==
// @name           patchForSpeedUpStylish1.0.2.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    improve tab switching speed
// @include        main
// @compatibility  Firefox 3.0, 3.5, 3.6a1pre
// @author         Alice0775
// @version        2009/05/19 10:00
// ==/UserScript==
(function(){
  //check Stylish 1.0.2 intalled
  if (!('stylishOverlay' in window))
    return;
  stylishOverlay.ttt = null;
  stylishOverlay.updateStatus_orig = stylishOverlay.updateStatus;
  stylishOverlay.updateStatus = function(){
    if (stylishOverlay.ttt)
      clearTimeout(stylishOverlay.ttt);
    stylishOverlay.ttt = setTimeout(function(){
      stylishOverlay.updateStatus_orig();
    }, 1000);
  }
})();
