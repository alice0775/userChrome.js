// ==UserScript==
// @name           ttp2http_drop_urlbar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        main
// @compatibility  Firefox17
// @author         Alice0775
// @version        2013/07/28 12:00 drop support Firefox16 and earlier and BHNewTab anymore
// @version        2010/11/18 00:00 4.0b8pre
// @version        2009/07/13 00:00 Bug 502171 -  drag and drop from external apps to firefox malfunctions.を回避
// ==/UserScript==
// @version        2009/06/22 00:00 Bug 456106 -  Switch to new drag and drop api in toolkit/browser
// @version        2008/11/26 20:00 Fx3.1b2preロケーションバーのエンターにも対応させた
// @version        2008/10/02 00:00 gURLBarとgBrowserのD&Dfor Fx3.1b1pre
// @version        2008/03/07 00:00 BHNewTab エラー回避しただけ
// @version        2008/01/18 20:40 <A HREF="ttp://～">にも対応 TMPが導入されているときにも動作するように
// @version        2008/01/18 20:30 <A HREF="ttp://～">にも対応
// @version        2007/06/28 4/28の改良を取り込みロケーションバーに貼り付けにも対応させた
// @Note
/* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1
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
* Alternatively, the contents of this file may be used under the
* terms of the GNU General Public License Version 2 or later (the
* "GPL"), in which case the provisions of the GPL are applicable
* instead of those above.
*
* The Original Code is mozilla.org code.
*
* Modified Alice0775
* http://space.geocities.yahoo.co.jp/gl/alice0775
* (2007/04/27)
*
* Contributor(s):
* LouCypher (http://zoolcar9.lhukie.net/mozilla/userChromeJS)
*
* ***** END LICENSE BLOCK ***** */
(function(){

var ttp2http = "url = url.match(/(.*)[\\n]?/)[1].replace(/^(ttp|tp|h..p)/i,'http');";


// input to location bar
if(gURLBar && "handleCommand" in gURLBar)
   eval("gURLBar.handleCommand = " +
      gURLBar.handleCommand.toString()
                    .replace("var [url, postData] = this._canonizeURL(aTriggeringEvent);",
                             "var [url, postData] = this._canonizeURL(aTriggeringEvent);" + ttp2http)
                    .replace("var url = this.value",
                             "var url = this.value;" + ttp2http + ";if(this.value != url){this.handleRevert();this.value = url;}"));



// drag to location bar

if(gURLBar && "onDrop" in gURLBar)
  eval("gURLBar.onDrop = " +
      gURLBar.onDrop.toString().replace(
              ' url = browserDragAndDrop.getDragURLFromDataTransfer(aEvent.dataTransfer)[0];',
              "$&" + ttp2http).replace(
              'let url = browserDragAndDrop.drop(aEvent, { })',
              '$&;' + ttp2http
      ));




// drag to tab and tab container
if (gBrowser && !("_onDrop" in gBrowser)) {
  if (!("TreeStyleTabService" in window)) {
    gBrowser.tabContainer.addEventListener("drop", function(event){
     var dt = event.dataTransfer;
     if (!dt.types.contains(["text/plain"]))
       return;
     var url = dt.getData(["text/plain"]);
     if(/^ttps?/.test(url)) {
      url = url.match(/(.*)[\\n]?/)[1].replace(/^(ttp|tp|h..p)/i,'http');
      var tab = document.evaluate(
                  'ancestor-or-self::*[local-name()="tab"]',
                  event.originalTarget,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE,
                  null
                ).singleNodeValue;
        if (tab) {
          // drag to tab
          gBrowser.tabContainer._tabDropIndicator.collapsed = true;
          event.stopPropagation();
          tab.linkedBrowser.loadURI(url, null, null);
        } else if(event.target == gBrowser.tabContainer) {
          // drag to tab container
          gBrowser.tabContainer._tabDropIndicator.collapsed = true;
          event.stopPropagation();
          gBrowser.addTab(url);
        }
      }
    }, true);
  }

  if ("TreeStyleTabService" in window) {
    setTimeout(function(){
      document.getElementById("navigator-toolbox").addEventListener("drop", function(event){
       var dt = event.dataTransfer;
       if (!dt.types.contains(["text/plain"]))
         return;
       var url = dt.getData(["text/plain"]);
       if(/^ttps?/.test(url)) {
        url = url.match(/(.*)[\\n]?/)[1].replace(/^(ttp|tp|h..p)/i,'http');
        var tab = document.evaluate(
                    'ancestor-or-self::*[local-name()="tab"]',
                    event.originalTarget,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
          if (tab) {
            // drag to tab
            gBrowser.treeStyleTab.tabbarDNDObserver.clearDropPosition(true);
            event.stopPropagation();
            tab.linkedBrowser.loadURI(url, null, null);
          } else if (event.target == gBrowser.tabContainer) {
            // drag to tab container
            gBrowser.treeStyleTab.tabbarDNDObserver.clearDropPosition(true);
            event.stopPropagation();
            gBrowser.addTab(url);
          }
        }
      }, true);
    }, 1000);
  }
}

function debug(aMsg){
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  Cc["@mozilla.org/consoleservice;1"]
    .getService(Ci.nsIConsoleService)
    .logStringMessage(aMsg);
}

})();