// ==UserScript==
// @name           key_myToggleSidebar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ToggleSidebar
// @include        main
// @compatibility  127
// @version        2024/05/05 Bug 1892965 - Rename Sidebar launcher and SidebarUI
// @version        2021/09/14
// ==/UserScript==
(function(){
    if (document.getElementById("key_myToggleSidebar")) return;
    let key = document.createXULElement("key");
    key.setAttribute("modifiers", "accel");
    key.setAttribute("key", "Q");
    key.setAttribute("oncommand", "SidebarController.toggle();");
    key.id = "key_myToggleSidebar";
    document.getElementById("mainKeyset").appendChild(key);
}());