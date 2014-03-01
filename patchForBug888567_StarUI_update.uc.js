// ==UserScript==
// @name           patchForBug888567_StarUI_update.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 888567 	Bookmark star icon doesn't work properly on link-opened tab
// @include        main
// @compatibility  Firefox 13.0-30
// @author         Alice0775
// @version        2014/02/27
// @version        2013/06/29
// @Note
// ==/UserScript==
(function () {
  
  window.Bug888567_StarUI_onclick = function(event) {
    var StarUI = document.getElementById("star-button") || document.getElementById("bookmarks-menu-button");
    if (typeof PlacesStarButton != 'undefined') {
      // Firefox 13-22
      if (StarUI.getAttribute('starred') != 'true') {
        PlacesStarButton._uri = null;
        PlacesStarButton.updateState();
      }
    } else {
      // Firefox 23-
      if (StarUI.getAttribute('starred') != 'true') {
        BookmarkingUI._uri = null;
        BookmarkingUI.updateStarState();
      }
    }
  }

  var StarUI = document.getElementById("star-button") || document.getElementById("bookmarks-menu-button");
  if (StarUI) {
    if (StarUI.hasAttribute("oncommand")) {
      var _org = StarUI.getAttribute("oncommand");
      StarUI.setAttribute("oncommand", _org + "Bug888567_StarUI_onclick({})")
    } else {
      var _org = StarUI.getAttribute("onclick");
      StarUI.setAttribute("onclick", _org + "Bug888567_StarUI_onclick(event)")
    }
  }


  var CMD = document.getElementById("Browser:AddBookmarkAs");
  if (CMD) {
    _org = CMD.getAttribute("oncommand");
    CMD.setAttribute("oncommand", _org + "Bug888567_StarUI_onclick(event)")
  }

  CMD = document.getElementById("Browser:BookmarkAllTabs");
  if (CMD) {
    _org = CMD.getAttribute("oncommand");
    CMD.setAttribute("oncommand", _org + "Bug888567_StarUI_onclick(event)")
  }

})();
