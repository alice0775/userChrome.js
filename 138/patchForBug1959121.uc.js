// ==UserScript==
// @name          patchForBug1959121.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1959121 - Sidebar does not remember last used if closed it with close x button (legacy sidebar)
// @include       main
// @async         true
// @compatibility Firefox 138
// @author        alice0775
// @version       2025/04/08
// ==/UserScript==
"use strict";
var bug1959121 = {
  init: function(){
    document.getElementById("sidebar-close").addEventListener("command", (event) => {
        event.preventDefault();
        SidebarController.toggle("");
    }, true);
  }
}


bug1959121.init();
