// ==UserScript==
// @name           ttp2http_drop_urlbar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        main
// @compatibility  Firefox 2.0 3.0 4.0b8pre
// @author         Alice0775
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
/*
try{
  eval("BrowserLoadURL = " +
      BrowserLoadURL
                    .toString()
                    .replace(/var url = gURLBar\.value;/,
                             "var url = gURLBar.value;" + ttp2http)
                    .replace(/(var url = gIeTab\.getHandledURL\(gURLBar\.value\);)/,
                             "var url = gURLBar.value;" + ttp2http +
                             "url = gIeTab.getHandledURL(url);"));
//debug(BrowserLoadURL.toString());
}catch(e){}
*/
try{
  window.BrowserLoadURL_orig = BrowserLoadURL;
  BrowserLoadURL = function(aTriggeringEvent, aPostData){
    var theURI = document.getElementById("urlbar").value;
    theURI = theURI.replace(/^(ttp|tp|h..p)/i,'http');
    gURLBar.value = theURI;
    BrowserLoadURL_orig(aTriggeringEvent, aPostData);
  }
/*
  eval("BrowserLoadURL = " +
      BrowserLoadURL
                    .toString()
                    .replace(/var theURI = document\.getElementById\("urlbar"\)\.value;/,
                             'var theURI = document.getElementById("urlbar").value;' + "theURI = theURI.replace(/^(ttp|tp|h..p)/i,'http');"));
*/
}catch(e){}
//try{
   eval("gURLBar.handleCommand = " +
      gURLBar.handleCommand.toString()
                    .replace("var [url, postData] = this._canonizeURL(aTriggeringEvent);",
                             "var [url, postData] = this._canonizeURL(aTriggeringEvent);" + ttp2http)
                    .replace("var url = this.value",
                             "var url = this.value;" + ttp2http + ";if(this.value != url){this.handleRevert();this.value = url;}"));
//}catch(e){}



// drag to location bar
try{ //less Fx3.1b1pre
  eval("urlbarObserver.onDrop = " +
      urlbarObserver.onDrop
                    .toString()
                    .replace(/aXferData\.flavour\.contentType\)\;/,
                             "aXferData.flavour.contentType);" + ttp2http));
}catch(e){}
try{ //Fx3.1b1pre
  eval("gURLBar.onDrop = " +
      gURLBar.onDrop.toString().replace(
              'var url = transferUtils.retrieveURLFromData(aXferData.data, aXferData.flavour.contentType);',
              "$&" + ttp2http));
}catch(e){}
try{ //Fx3.6a1pre
  eval("gURLBar.onDrop = " +
      gURLBar.onDrop.toString().replace(
              'var url = browserDragAndDrop.getDragURLFromDataTransfer(aEvent.dataTransfer)[0];',
              "$&" + ttp2http));
}catch(e){}




// drag to Go button
try{
  eval("goButtonObserver.onDrop = " +
      goButtonObserver.onDrop
                      .toString()
                      .replace(/getShortcutOrURI\(draggedText\,\spostData\)\;/,
                               "getShortcutOrURI(draggedText, postData);" +
                               ttp2http));
}catch(e){}



// drag to tab container
try{
  eval("TabDNDObserver.onDrop = " +
      TabDNDObserver.onDrop
                      .toString()
                      .replace(/dropData\.flavour\.contentType\)\;/,
                               "dropData.flavour.contentType);" + ttp2http));
}catch(e){}

// drag to tab
if ("onDrop" in gBrowser)
  try{ //less Fx3.1b1pre
    eval("gBrowser.onDrop = " +
        gBrowser.onDrop.toString()
                       .replace(/aXferData\.flavour\.contentType\)\;/,
                                "aXferData.flavour.contentType);" + ttp2http));
  //debug(gBrowser.onDrop.toString());
  }catch(e){}
if ("_onDrop" in gBrowser)
  try{ //Fx3.1b1pre //Fx3.6a1pre
    eval("gBrowser._onDrop = " +
        gBrowser._onDrop.toString()
                .replace(
                  'url = transferUtils.retrieveURLFromData(urlData, isURLList ? "text/plain" : dataType);',
                  "$&" + ttp2http));
  //debug(gBrowser._onDrop.toString());
  }catch(e){}

/*
var func = loadURI.toString();
func  = func.replace("{","{uri = uri.replace(/^(ttp|tp|h..p)/i,'http');");
eval("loadURI = " + func);
*/

var func = contentAreaClick.toString();
func  = func.replace("wrapper = linkNode;","wrapper = linkNode;wrapper.href = wrapper.href.replace(/^(ttp|tp|h..p)/i,'http');");
eval("contentAreaClick = " + func);

if(/TMP_contentAreaClick/.test(func)){
  func  = func.replace('if (target.hasAttribute("onclick") &&','linkNode.href = linkNode.href.replace(/^(ttp|tp|h..p)/i,"http");if (target.hasAttribute("onclick") &&');
  eval("contentAreaClick = " + func);
}


function debug(aMsg){
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  Cc["@mozilla.org/consoleservice;1"]
    .getService(Ci.nsIConsoleService)
    .logStringMessage(aMsg);
}

})();