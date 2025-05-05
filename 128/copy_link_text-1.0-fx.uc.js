// ==UserScript==
// @name           copy_link_text-1.0-fx.uc.js
// @namespace      http://brettz9.blogspot.com/2007/04/firefox-extensions.html
// @description    Right-click a link to copy its text
// @include        main
// @async          true
// @compatibility  Firefox 135
// @author         Brett Zamir
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2023/03/10 00:00  Bug 1776879 - Investigate if we could get rid of text/unicode, but use `text/plain` directly for plain text for Clipboard and DnD
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        バージョン 1.0 — 2007 年 04 月 01 日
// @Note           copy_link_text-1.0-fx.xpi
// ==/UserScript==
var copylinktext = {
  onLoad: function() {
    // initialization code
    let menuitem = document.createXULElement("menuitem");
    menuitem.setAttribute("id", "context-copylinktext");
    menuitem.setAttribute("label", "Copy Link Text");
    menuitem.setAttribute("accesskey", "t");
    menuitem.addEventListener("command", (event) => copylinktext.onMenuItemCommand(event));
    //menuitem.setAttribute("oncommand", "copylinktext.onMenuItemCommand(event)");
    let ref = document.getElementById("context-copylink");
    ref.parentNode.insertBefore(menuitem, ref);
    
    document.getElementById("contentAreaContextMenu")
            .addEventListener("popupshowing", function(e) { copylinktext.showContextMenu(e); }, false);
  },

  showContextMenu: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("context-copylinktext").hidden = gContextMenu && !gContextMenu.onLink;
  },
  onMenuItemCommand: function(e) {

  // Get the link text
  var copytext = gContextMenu.linkText();
  Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(copytext);
  },

};
copylinktext.onLoad();
