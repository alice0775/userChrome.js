// ==UserScript==
// @name           Element Inspector
// @namespace      http://www.mozilla.org/MPL/
// @description    Right click anywhere on content or browser window to inspect the element with DOMi
// @include        *
// @compatibility  Firefox 2.0 3.0 3.5 3.6a1pre
// @author         LouCypher
// @modifier       Alice0775
// @version        2009/11/22 gContextMenuないとき
// @version        2009/04/27 idダブり
// @version        2009/04/27 add Inspect Chrome Element menu in tab context menu.
// @version        2009/04/27 It was made to operate even if it was not a main window.
// @version        2009/04/26 Modify due to Bug486990 Context Menu can be disabled by stopping propagation (cancelEvent=true or stopPropagation)
// @Note
// ==/UserScript==
/*--------------------------------------------------------
      Element Inspector

      Right click anywhere on content or browser window
      to inspect the element with DOMi
  --------------------------------------------------------*/

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Element Inspector script for userChrome.js
 *
 * The Initial Developer of the Original Code is LouCypher.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s) (alphabetical order):
 *  LouCypher <loucypher.moz@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


(function() {
  function isFirefox() {
      var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
      if(mediator.getMostRecentWindow("navigator:browser"))
        return true;
      return false;
  }

  var windowType = isFirefox() ? "navigator:browser" : "mail:3pane";
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var mainWindow = wm.getMostRecentWindow(windowType);
  if(mainWindow && typeof mainWindow.inspectDOMDocument != "function") {
    var errMsg = "inspectChrome: DOM Inspector is not installed" +
                 "or is disabled";
    throw new Error(errMsg);
    return;
  }

  function addMenuitem(aNode, aIndex) {
    var mi = aNode.appendChild(document.createElement("menuitem"));
    mi.mainWindow = mainWindow;
    mi.id = aIndex ? "context-inspector-" + aIndex : "context-inspector";
    mi.setAttribute("label", aNode.id == "contentAreaContextMenu"
      ? "Inspect Element"
      : "Inspect Chrome Element");
    mi.setAttribute("accesskey","E");
    mi.setAttribute("oncommand",
      "this.mainWindow.inspectDOMDocument(document.popupNode)");
    mi.setAttribute("onclick",
      "if(event.button == 1) this.mainWindow.inspectObject(document.popupNode)");
    if(aNode.id != "chrome-inspector-popup") {
      var ms = aNode.insertBefore(document.createElement("menuseparator"), mi);
      ms.id = mi.id + "-separator";
    }
  }

  var popups = document.getElementsByTagName("popup");
  for(var i = 0; i < popups.length; i++) {
    var popup = popups[i];
    if(popup.getElementsByTagName("menuitem").length)
      addMenuitem(popup, i);
  }


  var newPopup = document.createElement("popup");
  newPopup.id = "chrome-inspector-popup";
  addMenuitem(newPopup);
  if (!document.getElementById("mainPopupSet")) {
    var popup = document.documentElement.appendChild(document.createElement("popupset"));
    popup.id = "mainPopupSet";
  }
  document.getElementById("mainPopupSet").appendChild(newPopup);
  document.documentElement.setAttribute("context", newPopup.id);
  //Fx3.6a1pre
  newPopup.setAttribute("onpopupshowing","if ('gContextMenu' in window && gContextMenu || document.popupNode instanceof HTMLElement) {return false;}return true;");

  if (document.getElementById("content") || document.getElementById("tabmail")) {
    var gBrowser = document.getElementById("content") || document.getElementById("tabmail");
    //tab context menu
    var tabContext = document.getAnonymousElementByAttribute(
                      gBrowser, "anonid", "tabContextMenu");
    if (!tabContext)
      return;

    var tabInspector = tabContext.appendChild(
                        document.createElement("menuitem"));
    tabInspector.id = "tab-inspector";
    tabInspector.setAttribute("label", "Inspect This Tab");
    tabInspector.setAttribute("accesskey", "I");

    if (!document.getElementById("tabmail")) {
      tabInspector.setAttribute("oncommand",
        "var tabbrowser = getBrowser(); " + //thanks, zeniko
        "inspectDOMDocument(tabbrowser.mContextTab.localName == 'tabs'" +
        " ? gBrowser" +
        " : tabbrowser.mContextTab.linkedBrowser.contentDocument);");
      tabInspector.setAttribute("onclick",
        "if(event.button == 1) { " +
        "var tabbrowser = getBrowser(); " +
        "inspectObject(tabbrowser.mContextTab.localName == 'tabs'" +
        " ? gBrowser" +
        " : tabbrowser.mContextTab.linkedBrowser.contentDocument); " +
        "}");
    } else {
      tabInspector.setAttribute("oncommand",
        "var tabmail = document.getElementById('tabmail'); " +
        "var [iTab, tab, tabNode] = tabmail._getTabContextForTabbyThing(document.popupNode, true); " +
        "var browserFunc = tab.mode.getBrowser || tab.mode.tabType.getBrowser; " +
        "if (browserFunc) " +
        "  inspectDOMDocument(browserFunc.call(tab.mode.tabType, tab).contentDocument);");
      tabInspector.setAttribute("onclick",
        "if(event.button == 1) { " +
        "var tabmail = document.getElementById('tabmail'); " +
        "var [iTab, tab, tabNode] = tabmail._getTabContextForTabbyThing(document.popupNode, true); " +
        "var browserFunc = tab.mode.getBrowser || tab.mode.tabType.getBrowser; " +
        "if (browserFunc) " +
        "  inspectDOMDocument(browserFunc.call(browserFunc.call(tab.mode.tabType, tab).contentDocument);" +
        "}");
    }

    var tabInspectSeparator = document.createElement("menuseparator");
    tabInspectSeparator.id = "tab-inspector-separator";
    tabContext.insertBefore(tabInspectSeparator, tabInspector);

    tabInspector = tabContext.appendChild(
                        document.createElement("menuitem"));
    tabInspector.id = "tab-inspector2";
    tabInspector.setAttribute("label", "Inspect Chrome Element");
    tabInspector.setAttribute("accesskey", "C");
    tabInspector.setAttribute("oncommand",
      "inspectDOMDocument(document.popupNode);");
    tabInspector.setAttribute("onclick",
      "if(event.button == 1) { " +
      "inspectObject(document.popupNode); " +
      "}");

    var tabInspectSeparator = document.createElement("menuseparator");
    tabInspectSeparator.id = "tab-inspector-separator";
  }

/*
  //bookmarks context menu
  var bmContext = document.getElementById("placesContext");
  if (bmContext)
    bmContext.addEventListener("popupshowing", function(e) {
      var popup = e.target;
      var bmInspector = document.createElement("menuitem");
      for(var i=0;i<bmContext.childNodes.length;i++){
        if(bmContext.childNodes[i].getAttribute("label")=="Inspect Bookmark") return;
      }
      bmInspector.setAttribute("label", "Inspect Bookmark");
      bmInspector.setAttribute("accesskey", "I");
      bmInspector.setAttribute("oncommand",
        "inspectDOMDocument(document.popupNode)");
      var bmInspectSeparator = document.createElement("menuseparator");
      bmInspectSeparator.id = "bookmark-inspector-separator";
      popup.insertBefore(bmInspectSeparator, bmContext.lastChild);
      popup.insertBefore(bmInspector, bmInspectSeparator);
      //popup.appendChild(bmInspectSeparator);
      //popup.appendChild(bmInspector);
    }, false);
*/
  //bookmarks context menu
  var bmContext = document.getElementById("bookmarks-context-menu");
  if (bmContext)
    bmContext.addEventListener("popupshowing", function(e) {
      var popup = e.target;
      var bmInspector = document.createElement("menuitem");
      bmInspector.setAttribute("label", "Inspect Bookmark");
      bmInspector.setAttribute("accesskey", "I");
      bmInspector.setAttribute("oncommand",
        "inspectDOMDocument(document.popupNode)");
      var bmInspectSeparator = document.createElement("menuseparator");
      bmInspectSeparator.id = "bookmark-inspector-separator";
      popup.insertBefore(bmInspectSeparator, bmContext.lastChild);
      popup.insertBefore(bmInspector, bmInspectSeparator);
      //popup.appendChild(bmInspectSeparator);
      //popup.appendChild(bmInspector);
    }, false);
  // for MileWideBack extension
  var mileWideBack = document.getElementById("back-strip");
  if (mileWideBack) mileWideBack.setAttribute("context", "");

})();

