// ==UserScript==
// @name           patchForBug729872.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    cannot focus textbox if exit html5 fullscreen by alt+tab (workaround Bug734653)
// @include        main
// @compatibility  Firefox 10-12 (fixed in 13)
// @author         Alice0775
// @version        2012/03/11 00:00
// ==/UserScript==

if ("FullScreen" in window &&
    !("handleEvent" in FullScreen) &&
    !("exitDomFullScreen_org" in FullScreen)) {
  FullScreen.exitDomFullScreen_org = FullScreen.exitDomFullScreen;
  FullScreen.exitDomFullScreen = function() {
    setTimeout(FullScreen.exitDomFullScreen_org.bind(FullScreen), 0);
  }
}