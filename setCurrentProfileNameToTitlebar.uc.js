// ==UserScript==
// @name           setCurrentProfileNameToTitlebar
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    現在のプロファイル名をタイトルバーに表示
// @include        main
// @compatibility  Firefox 2.0 3.0 3.5 3.6a1
// @author         Alice0775
// @version        2012/12/31 00:00 Bug 818800 Remove the global private browsing service
// @version        2012/08/06 08:00 remove hack privatebrowsingUI
// ==/UserScript==
// @version        2010/09/25 23:00 Bug 598221 - Page Title not shown in Title Bar on Session Restore
// @version        2009/07/25 18:00 Bug 506437 -  The titlebar of a tear off window is not updated correctly after having detached a tab
// @version        2008/03/06 15:00
// @Note           公式Win32版 以外および起動時オプション-profileによりパスを変更しているのものについては知りません
(function(){
  //現在のプロファイル名を得る
  //名称を変更している場合にも対応
  //もっとスマートな方法(nsIToolkitProfileService)を使えればいいのですが...orz,でもこれで動くから
  //公式Win32版 以外および起動時オプション-profileによりパスを変更しているのものについては知りません
  function getCurrentProfileName(){
    function readFile(aFile){
      var stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);    stream.init(aFile, 0x01, 0, 0);
      var cvstream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
      cvstream.init(stream, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
      var content = "", data = {};
      while (cvstream.readString(4096, data)) {
        content += data.value;
      }
      cvstream.close();
      return content.replace(/\r\n?/g, "\n");
    }
    var PrefD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("PrefD", Components.interfaces.nsILocalFile);
    var ini = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("AppRegD", Components.interfaces.nsILocalFile);

    ini.append("profiles.ini");
    var ini = readFile(ini);
    var profiles = ini.match(/Name=.+/g);
    var profilesD = ini.match(/Path=.+/g);
    for ( var i = 0; i < profiles.length;i++) {
      if (profilesD[i].indexOf(PrefD.leafName) >= 0) {
        profiles[i].match(/Name=(.+)/);
        return RegExp.$1;
      }
    }
    return null;
  }


  window.setCurrentProfileNameToTitlebar = function(){
    var profile = getCurrentProfileName();
    if (!profile) return;
    // Set the title modifer to include the build ID.
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                                .getService(Components.interfaces.nsIXULAppInfo);
    var appBuildID = appInfo.appBuildID;

    var mainWindow = document.getElementById("main-window");

    if ('gPrivateBrowsingUI' in window && gPrivateBrowsingUI.privateBrowsingEnabled)
      var originalName = mainWindow.getAttribute("title_privatebrowsing");
    else
      var originalName = mainWindow.getAttribute("title_normal");

    ["title_normal", "title_privatebrowsing", "titlemodifier", "titlemodifier_normal", "titlemodifier_privatebrowsing"].
    forEach(callback);
    function callback(attrname){
      var originalName = mainWindow.getAttribute(attrname);
      var titlemodifier = "[" + profile+ "] "  +originalName;// + " - " + appBuildID;
      // Set the new title modifier
      mainWindow.setAttribute(attrname, titlemodifier);
    }

    // Now set the title of the window
    // Bug 506437 -  The titlebar of a tear off window is not updated correctly after having detached a tab
    if ('gPrivateBrowsingUI' in window && gPrivateBrowsingUI.privateBrowsingEnabled)
      document.title = content.document.title + " - " + "[" + profile+ "] " + originalName;
    else
      document.title = document.title.replace(new RegExp(originalName+"$", ""), "[" + profile+ "] " + originalName);
  };

  if ('gPrivateBrowsingUI' in window &&
       typeof gPrivateBrowsingUI._privateBrowsingService == 'undefined')
    try {
      gPrivateBrowsingUI._privateBrowsingService = Cc["@mozilla.org/privatebrowsing;1"].
                                   getService(Ci.nsIPrivateBrowsingService);
    } catch(e){}

  setTimeout(function(){
    setCurrentProfileNameToTitlebar();
    //xxx Bug 598221
    gBrowser.updateTitlebar()
  }, 500);
})();