// ==UserScript==
// @name           changeDefaultTargetTranslateLanguage.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Change default target translate language
// @include        main
// @compatibility  Firefox 34.0
// @author         Alice0775
// @version        2014/08/02 00:00
// ==/UserScript==
Cu.import("resource:///modules/translation/Translation.jsm",{}).Translation._defaultTargetLanguage = "ja"
