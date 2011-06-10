// ==UserScript==
// @name           patchForgPrivateBrowsingUI.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    なにかの拍子に変になる (症状, 画像上で右クリックした場合にgPrivateBrowsingUI._privateBrowsingServiceが未定義だとエラーが出る)
// @include        main
// @compatibility  Firefox 3.5 3.6a1pre
// @author         Alice0775
// @version        2009/06/28 15:00
// ==/UserScript==
if ('gPrivateBrowsingUI' in window &&
    typeof gPrivateBrowsingUI._privateBrowsingService == 'undefined') {
  gPrivateBrowsingUI._observerService.removeObserver(gPrivateBrowsingUI, "private-browsing");
  gPrivateBrowsingUI.init()
}