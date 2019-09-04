// ==UserScript==
// @name           copy_link_text-1.0-fx.uc.js
// @namespace      http://brettz9.blogspot.com/2007/04/firefox-extensions.html
// @description    Right-click a link to copy its text
// @include        main
// @compatibility  Firefox 2.0
// @author         Brett Zamir
// @version        バージョン 1.0 — 2007 年 04 月 01 日
// @Note           copy_link_text-1.0-fx.xpi
// ==/UserScript==
var copylinktext = {
  onLoad: function() {
    // initialization code
    let menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "context-copylinktext");
    menuitem.setAttribute("label", "Copy Link Text");
    menuitem.setAttribute("accesskey", "t");
    menuitem.setAttribute("oncommand", "copylinktext.onMenuItemCommand(event)");
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

  // Start preparation to add contents to clipboard
  var strunicode   = Components.classes["@mozilla.org/supports-string;1"].
                       createInstance(Components.interfaces.nsISupportsString);
  if (!strunicode) return false;
  var strhtml   = Components.classes["@mozilla.org/supports-string;1"].
                       createInstance(Components.interfaces.nsISupportsString);
  if (!strhtml) return false;

  // Assign link text to clipboard variables
  strhtml.data = copytext;
  strunicode.data  = copytext;

  var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
  if (!trans) return false;
  trans.init(null);
  trans.addDataFlavor("text/html");
  trans.addDataFlavor("text/unicode");
  trans.setTransferData("text/html", strhtml, copytext.length * 2);
  trans.setTransferData("text/unicode", strunicode, copytext.length * 2);
  var clipid = Components.interfaces.nsIClipboard;
  var clip   = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
  if (!clip) return false;

  // Add the link text to the clipboard
  clip.setData(trans, null, clipid.kGlobalClipboard);

  },

};
copylinktext.onLoad();
