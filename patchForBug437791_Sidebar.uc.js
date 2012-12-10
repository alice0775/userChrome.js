// ==UserScript==
// @name           patchForBug437791_Sidebar_Close_Button_Sometimes_Does_Not_Work.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 437791 -  Sidebar close button sometimes does not work; "sidebarBroadcaster is null" in the error console
// @include        main
// @compatibility  Firefox 3.0 3.1
// @author         Alice0775
// @Note
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2008/11/07 00:00
// ==/UserScript==
if ("gSidebarCommand" in window) {
  (function(){
    var func = toggleSidebar.toString();
    func = func.replace(
        'commandID = sidebarBox.getAttribute("sidebarcommand");',
        'commandID = sidebarBox.getAttribute("sidebarcommand") || gSidebarCommand;'
        );
    func = func.replace(
        'sidebarBox.setAttribute("sidebarcommand", "");',
        '$& \
        gSidebarCommand = "";'
        );
    func = func.replace(
        'sidebarBox.setAttribute("sidebarcommand", sidebarBroadcaster.id);',
        '$& \
        gSidebarCommand = sidebarBroadcaster.id;'
        );
    eval("window.toggleSidebar = " + func);
  })();
} else {
  (function(){
    var sidebarBox = document.getElementById("sidebar-box");
    window.gSidebarCommand = sidebarBox.getAttribute("sidebarcommand");
    var func = toggleSidebar.toString();
    func = func.replace(
        'commandID = sidebarBox.getAttribute("sidebarcommand");',
        'commandID = sidebarBox.getAttribute("sidebarcommand") || gSidebarCommand; \
        if (!commandID) return;'
        );
    func = func.replace(
        'sidebarBox.setAttribute("sidebarcommand", "");',
        '$& \
        gSidebarCommand = "";'
        );
    func = func.replace(
        'sidebarBox.setAttribute("sidebarcommand", sidebarBroadcaster.id);',
        '$& \
        gSidebarCommand = sidebarBroadcaster.id;'
        );
    eval("window.toggleSidebar = " + func);
  })();
  if ("toggleSidebar_org" in window) {
    (function(){
      var sidebarBox = document.getElementById("sidebar-box");
      window.gSidebarCommand = sidebarBox.getAttribute("sidebarcommand");
      var func = toggleSidebar_org.toString();
      func = func.replace(
          'commandID = sidebarBox.getAttribute("sidebarcommand");',
          'commandID = sidebarBox.getAttribute("sidebarcommand") || gSidebarCommand;'
          );
      func = func.replace(
          'sidebarBox.setAttribute("sidebarcommand", "");',
          '$& \
          gSidebarCommand = "";'
          );
      func = func.replace(
          'sidebarBox.setAttribute("sidebarcommand", sidebarBroadcaster.id);',
          '$& \
          gSidebarCommand = sidebarBroadcaster.id;'
          );
      eval("window.toggleSidebar_org = " + func);
    })();
  }
}