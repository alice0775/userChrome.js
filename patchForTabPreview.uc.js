// ==UserScript==
// @name           patchForTabPreview.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    An invalid or illegal string was specified = NS_ERROR_DOM_SYNTAX_ERR
// @author         Alice0775
// @include        main
// @version        2009/06/22
// @compatibility  3.5 3.6a1pre
// ==/UserScript==
//
setTimeout(function(){tabPreviews.init();},1000);
