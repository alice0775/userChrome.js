// ==UserScript==
// -*- mode:JScript; Encoding:utf8n -*-
// @name           upper URI
// @namespace      http://d.hatena.ne.jp/p-arai/
// @description    Add upper URIs to the context menu in Location bar.
// @include        main
// @author         p-arai
// @version        2023/04/17 22:50 Bug 1817443 - remove openUILinkIn entirely and rename fromChrome
// @version       2023/02/08 10:00 Bug 1815439 - Remove useless loadURI wrapper from browser.js
// @version        2022/08/22 09:50 fixed wrong popup
// @version        2021/11/25 00:30 replace whereToOpenLink with BrowserUtils.whereToOpenLink Bug 1742801
// @version        2020/12/15 00:30 fix 
// @version        2020/06/01 00:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2019.11.22 Bug 1326520 - Rename nsIURI.path to pathQueryRef
// @version        2007.08.05
// ==/UserScript==


(function() {
  // ポップアップ表示時に URIs を調査、メニュー項目を生成
  document.getElementById("urlbar").addEventListener("popupshowing", function(event) {
    var menupopup = event.originalTarget;
    if (menupopup.className != "textbox-contextmenu")
      return;
    if (!menupopup.querySelector("#upperURI")) {
      // セパレータ
      var sep = document.createXULElement("menuseparator");
      menupopup.appendChild(sep);
      var menu = document.createXULElement("menu");
      menu.setAttribute("id", "upperURI");
      menu.setAttribute("label", "Upper URI");
      menupopup.appendChild(menu);
      var menupopup2 = document.createXULElement("menupopup");
      menu.appendChild(menupopup2);
      menupopup2.addEventListener("popupshowing", upperURIpoppulate, false);
    }
    menupopup.querySelector("#upperURI").disabled = 
      menupopup.querySelector('menuitem[cmd="cmd_selectAll"]').disabled;
  }, false);

  async function upperURIpoppulate(event) {
    var menupopup = event.originalTarget;
    while(menupopup.lastChild) {
      menupopup.removeChild(menupopup.lastChild);
    }

    var uri = gBrowser.currentURI;
    var uri_array = await getUpURIs();
    if (uri_array.length > 0) {
      menupopup.goUp = function(menuitem) {
        //loadURI(menuitem.getAttribute("value"));
        openLinkIn(menuitem.getAttribute("value"),
                   "current",
                   {allowThirdPartyFixup: false,
                   });
      };
      menupopup.goUpClick = function(event) {
        if (event.button == 2) return;
        var where = whereToOpenLink ? whereToOpenLink(event, false, true)
                    : BrowserUtils.whereToOpenLink(event, false, true);
        URILoadingHelper.openWebLinkIn(window, event.originalTarget.getAttribute("value"), where,
        {allowThirdPartyFixup:false,
         postData:null,
         referrerInfo: null,
         triggeringPrincipal:Services.scriptSecurityManager.createNullPrincipal({})
        });
/*
        openUILinkIn(event.originalTarget.getAttribute("value"), where,
        {allowThirdPartyFixup:false,
         postData:null,
         referrerInfo: null,
         triggeringPrincipal:Services.scriptSecurityManager.createNullPrincipal({})
        });
*/
        //loadURI(event.originalTarget.getAttribute("label"));
      };
      // URIs
      for(var i=0; i < uri_array.length; i++){
        var menuitem = document.createXULElement("menuitem");
        if (uri_array[i] == uri.prePath) {
          menuitem.setAttribute("label", uri_array[i]);
        } else {
          menuitem.setAttribute("label", uri_array[i].replace(uri.prePath, ""));
        }
        menuitem.setAttribute("value", uri_array[i]);
        //menuitem.setAttribute("oncommand", "this.parentNode.goUp(this);", false);
        menuitem.setAttribute("onclick",   "this.parentNode.goUpClick(event);", false);
        menupopup.appendChild(menuitem);
      }
    }
  }

  var getUpURIs = async function() {
    var uri_array = [];
    var uri = gBrowser.currentURI;
    try {
      var host = uri.host;
    } catch(e) {
      return uri_array;
    }
    var uri_path = uri.pathQueryRef
    if (/^(?:data:|javascript:|chrome:|about:)/.test(uri_path))
      return [];
    if (uri_path == "/")
      return [];
    uri_path = uri_path.replace(/\/$/, "");
    var path_array = uri_path.split("/");
    let path = path_array.pop();
    if (host == "tools.taskcluster.net" ||
        host == "firefox-ci-tc.services.mozilla.com") {
      let path_array2 = path.split(".");
      path_array2.pop();
      while(path_array2.length){
        uri_array.push( uri.prePath + path_array.join("/") + "/"  + path_array2.join("."));
        path_array2.pop();
      }
    }
    while(path_array.length){
      uri_array.push( uri.prePath + path_array.join("/") + "/" );
      let path = path_array.pop();
      if (host == "tools.taskcluster.net" ||
          host == "firefox-ci-tc.services.mozilla.com") {
        let path_array2 = path.split(".");
        path_array2.pop();
        while(path_array2.length){
          uri_array.push( uri.prePath + path_array.join("/") + "/"  + path_array2.join("."));
          path_array2.pop();
        }
      }
    }
    return uri_array;
  };

})();

