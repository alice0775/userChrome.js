// ==UserScript==
// @name           revertBrowserLinkOpenExternal.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    revert browser.link.open_external
// @include        main
// @compatibility  Firefox 3.5 3.6a1pre
// @author         Alice0775
// @version        2012/07/24 14:30 Bug 761723 implement toString of function objects by saving source
// ==/UserScript==
// @version        2009/10/08 00:00 Bug 514310 -  browserDOMWindow.openURI should always pass the referrer to loadOneTab and avoid loading about:blank if possible のチェックインによる
// @version        2009/09/21 00:00
// @version        2009/06/21 00:00
// 設定はabout:config等で
// browser.tabs.loadDivertedInBackground   : ブラウザを背面のままにするかどうか true:背面のまま [false]前面に浮上
// browser.link.open_external       整数値 : 1:現在のタブ, 2:新規ウインドウ, [3]:タブで開く
// browser.link.open_external.focus 真偽値 : 外部からのリンクを開いたタブを true:選択する [false]:選択しない



(function() {
    var aWhere = gPrefService.getIntPref("browser.link.open_newwindow");
    try {
      gPrefService.getIntPref("browser.link.open_external");
    } catch (e) {
      gPrefService.setIntPref("browser.link.open_external", aWhere)
    }
    var loadInBackground = gPrefService.getBoolPref("browser.tabs.loadInBackground");
    try {
      gPrefService.getBoolPref("browser.link.open_external.focus");
    } catch (e) {
      gPrefService.setBoolPref("browser.link.open_external.focus", !loadInBackground);
    }




  var func = nsBrowserAccess.prototype.openURI.toString();
  if (!/browser\.link\.open_external\.focus/.test(func)){
    func = func.replace(
        /{/,
        <><![CDATA[
        $&
        try {
          var isExternalFocus = gPrefService.getBoolPref("browser.link.open_external.focus");
        } catch (e) {
          isExternalFocus = !gPrefService.getBoolPref("browser.tabs.loadInBackground");
        }
        ]]></>
    );

    func = func.replace(
        'aWhere = gPrefService.getIntPref("browser.link.open_newwindow");',
        <><![CDATA[
        switch (aContext) {
          case Ci.nsIBrowserDOMWindow.OPEN_EXTERNAL :
            try {
              aWhere = gPrefService.getIntPref("browser.link.open_external");
            } catch(ex) {
              aWhere = gPrefService.getIntPref("browser.link.open_newwindow");
            }
            break;
          default : // OPEN_NEW or an illegal value
            aWhere = gPrefService.getIntPref("browser.link.open_newwindow");
        }
        ]]></>
    );
    func = func.replace(
        /if \(needToFocusWin \|\| \(*!loadInBackground \&\& isExternal\)*\)/,
        <><![CDATA[
        if (isExternalFocus && isExternal) {
          setTimeout(function(){
            gBrowser.selectedTab = (typeof newTab == "undefined") ? tab: newTab;
            if (!gPrefService.getBoolPref("browser.tabs.loadDivertedInBackground")) {
                content.focus();
            }
          }, 500);
          break;
        }
        $&
        ]]></>
    );

    eval("window.nsBrowserAccess.prototype.openURI = " + func);
  }



/*
nsBrowserAccess.prototype.openURI = function (aURI, aOpener, aWhere, aContext) {
    var newWindow = null;
    var referrer = null;
    try {
      var isExternalFocus = gPrefService.getBoolPref("browser.link.open_external.focus");
    } catch (e) {
      isExternalFocus = !gPrefService.getBoolPref("browser.tabs.loadInBackground");
    }
    var isExternal = aContext == Ci.nsIBrowserDOMWindow.OPEN_EXTERNAL;
    if (isExternal && aURI && aURI.schemeIs("chrome")) {
        dump("use -chrome command-line option to load external chrome urls\n");
        return null;
    }
    var loadflags = isExternal ? Ci.nsIWebNavigation.LOAD_FLAGS_FROM_EXTERNAL : Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
    var location;
    if (aWhere == Ci.nsIBrowserDOMWindow.OPEN_DEFAULTWINDOW) {
        switch (aContext) {
          case Ci.nsIBrowserDOMWindow.OPEN_EXTERNAL:
            try {
                aWhere = gPrefService.getIntPref("browser.link.open_external");
            } catch (ex) {
                aWhere = gPrefService.getIntPref("browser.link.open_newwindow");
            }
            break;
          default:
            aWhere = gPrefService.getIntPref("browser.link.open_newwindow");
        }
    }
    if (aOpener &&
        aWhere == Components.interfaces.nsIBrowserDOMWindow.OPEN_NEWTAB) {
        TreeStyleTabService.readyToOpenChildTab(aOpener);
    }
    switch (aWhere) {
      case Ci.nsIBrowserDOMWindow.OPEN_NEWWINDOW:
        var url = aURI ? aURI.spec : "about:blank";
        newWindow = openDialog(getBrowserURL(), "_blank", "all,dialog=no", url, null, null, null);
        break;
      case Ci.nsIBrowserDOMWindow.OPEN_NEWTAB:
        let win, needToFocusWin;
        if (!window.document.documentElement.getAttribute("chromehidden")) {
            win = window;
        } else {
            win = Cc['@mozilla.org/browser/browserglue;1'].getService(Ci.nsIBrowserGlue).getMostRecentBrowserWindow();
            needToFocusWin = true;
        }
        if (!win) {
            return null;
        }
        var loadInBackground = gPrefService.getBoolPref("browser.tabs.loadDivertedInBackground");
        var newTab = win.gBrowser.loadOneTab("about:blank", null, null, null, loadInBackground, false);
        newWindow = win.gBrowser.getBrowserForTab(newTab).docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
        try {
            if (aURI) {
                if (aOpener) {
                    location = aOpener.location;
                    referrer = makeURI(location);
                }
                newWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).loadURI(aURI.spec, loadflags, referrer, null, null);
            }
            if (isExternalFocus && isExternal) {
              setTimeout(function(){
                gBrowser.selectedTab = newTab;
                if (!gPrefService.getBoolPref("browser.tabs.loadDivertedInBackground")) {
                    content.focus();
                }
              }, 500);
              break;
            }
            if (needToFocusWin || !loadInBackground && isExternal) {
                newWindow.focus();
            }
        } catch (e) {
        }
        break;
      default:
        try {
            if (aOpener) {
                newWindow = aOpener.top;
                if (aURI) {
                    location = aOpener.location;
                    referrer = makeURI(location);
                    newWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(nsIWebNavigation).loadURI(aURI.spec, loadflags, referrer, null, null);
                }
            } else {
                newWindow = gBrowser.selectedBrowser.docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
                if (aURI) {
                    gBrowser.loadURIWithFlags(aURI.spec, loadflags, null, null, null);
                }
            }
            if (!gPrefService.getBoolPref("browser.tabs.loadDivertedInBackground")) {
                content.focus();
            }
        } catch (e) {
        }
    }
    return newWindow;
}
*/


})();
