// ==UserScript==
// @name           patchForBugxxxxScrollTree.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    tree の描画
// @include        chrome://sessionmanager/content/session_prompt.xul
// @compatibility  Firefox 3.6 more
// @author         Alice0775
// @version        2010/01/20
// ==/UserScript==
(function(){
document.getElementById("session_tree").removeAttribute("rows");
document.getElementById("tabTree").removeAttribute("rows");
})();
