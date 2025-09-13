// ==UserScript==
// @name           setCurrentProfileNameToTitlebar
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    現在のレガシープロファイル名をタイトルバーに表示
// @include        main
// @compatibility  Firefox 144
// @author         Alice0775
// @version        2025/09/13 00:00 Bug 1983284 - Improve how we handle localization of the window title
// @version        2025/01/27 00:00 Bug 1919600
// @version        2022/06/03 00:00
// @version        2012/12/31 00:00 Bug 818800 Remove the global private browsing service
// ==/UserScript==
// @version        2023/07/17 00:00 use ES module imports
// @version        2015/06/06 fix
// @version        2012/08/06 08:00 remove hack privatebrowsingUI
// @version        2010/09/25 23:00 Bug 598221 - Page Title not shown in Title Bar on Session Restore
// @version        2009/07/25 18:00 Bug 506437 -  The titlebar of a tear off window is not updated correctly after having detached a tab
// @version        2008/03/06 15:00
// @Note           公式Win32版 以外および起動時オプション-profileによりパスを変更しているのものについては知りません
function setCurrentProfileNameToTitlebar(){
  //現在のプロファイル名を得る
  //名称を変更している場合にも対応
  //もっとスマートな方法(nsIToolkitProfileService)を使えればいいのですが...orz,でもこれで動くから
  //公式Win32版 以外および起動時オプション-profileによりパスを変更しているのものについては知りません
  gBrowser.getWindowTitleForBrowser_org = gBrowser.getWindowTitleForBrowser;
  gBrowser.getWindowTitleForBrowser = function(browser) {
    function getCurrentProfileName(){
      function readFile(aFile){
        let stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);    stream.init(aFile, 0x01, 0, 0);
        let cvstream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
        cvstream.init(stream, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
        let content = "", data = {};
        while (cvstream.readString(4096, data)) {
          content += data.value;
        }
        cvstream.close();
        return content.replace(/\r\n?/g, "\n");
      }
      let PrefD = Services.dirsvc.get("PrefD", Ci.nsIFile);
      let ini = Services.dirsvc.get("AppRegD", Ci.nsIFile);

      ini.append("profiles.ini");
      ini = readFile(ini);
      let profiles = ini.match(/Name=.+/g);
      let profilesD = ini.match(/Path=.+/g);
      for ( let i = 0; i < profiles.length;i++) {
        if ((profilesD[i]+"$").indexOf(PrefD.leafName+"$") >= 0) {
          profiles[i].match(/Name=(.+)$/);
          return RegExp.$1;
        }
      }
      return null;
    }

    let profile = getCurrentProfileName();
    if (!profile) {
      return gBrowser.getWindowTitleForBrowser_org(browser);
    }
    let version = Services.appinfo.version;
    /*
    let currentProfileName = SelectableProfileService?.currentProfile?.name;
    if (currentProfileName) {
      profile += "(" + currentProfileName + ")";
    }
    */
    return gBrowser.getWindowTitleForBrowser_org(browser) + " " + version + "-[" + profile+ "] ";
  }


  setTimeout(function(){
    gBrowser.updateTitlebar()
  }, 500);
}
  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    setCurrentProfileNameToTitlebar();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        setCurrentProfileNameToTitlebar();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
