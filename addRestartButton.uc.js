// ==UserScript==
// @name           addRestartButton
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @charset        UTF-8
// @description    ファイルメニューに"再起動"を追加する
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version
// @Note
// ==/UserScript==
//ファイルメニューに"再起動"を追加する
//もしTab Mix Plus  のセッションマネージャを使用しているときは,
//ファイルメニューとTMPのセッションマネージャのツールボタンに"セッションを保存して再起動"を追加する
//
var ToolRstart = {
  //SAVE_SESSION_RESTART_VERSION: "0.0.2",
  init: function() {
    if (document.getElementById("Restart_Firefox")) return;
    var optionsitem, menuitem, menupopup;
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";

    var gPref = Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefBranch);
try{
    if (!gPref.getBoolPref("browser.sessionstore.enabled")&&gPref.getBoolPref("extensions.tabmix.sessions.manager")){
      var button = document.getElementById("btn_sessionmanager");
      var label = "セッション保存後に再起動";
      //try {label =UI.ConvertToUnicode(label)} catch(e){}
      if (button){
        //button.setAttribute("disabled",false); //Fix With Rewindfowerd.xpi
        menuitem = document.createElement("menuitem");
        menuitem.setAttribute("id", "Restart_Firefox0");
        menuitem.setAttribute("class", "menuitem-iconic");
        menuitem.setAttribute("label", label);
        menuitem.setAttribute("image", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6%2BR8AAAABGdBTUEAALGPC%2FxhBQAAAkVJREFUeJxVks1Lk3EAxz%2B%2FZ79ne575tk2ntjlsCnaY1aGC7hYWVPRyiA7RX1CEEdRp8xAFRnQI6tClSx0sCBEi8FDRC4ZpSaIpvsSWm07ndC8%2B255nT4cw6nv6Hj6f20fwz26%2FS3eXy5WB6JIRomSCEFwL13G8Uxs80uXp3%2BHEzrn8ajm2lrOjXodNq0eljMC0bMySxdt0hX1u5eGtk4GnrTWO92LJtrUHr1dujK2Uo6c6NHRd4hA2DiBv2hiWTblcZSJpcrTVkT1%2FoPGMHBlNhzdzVvREWEPTHHR5VPbu0tFVhfV8hYnUNlIIGnWTgW85T3PN2iOZL1bvGaaFpmm0uCX7m1QwDBSh0u51EmhQsW14NpnlsN%2FFuY%2BZihycy4Z7QnVkKzaudJ7HMym%2Bb5o0WyZXettoD%2FkAWEgZrFZs%2FIaFzG0VzaThxue26d1dS%2BfBJsyq4PnXddJlBT1jYCsKqRKMFIBiCWnlCnIlV8%2B2W0d1VHErZTbyJXQqXP1Swl%2FN0O2RTKo6%2FnpIFw0pTwe0xZeJ7B5PXQ3xdAGRqeDz6fR0KBwKCkBh7JfFjNQhvgWbhUWZTBb6WnIcK2byPFktkljY5GLEQdDvRFEUfmbhkzeE2iDZmE6SHl3uE%2FdfzLmG3szfnMUVTQSbweWEqkmbLgh7XASCXpBOpj8vMvlhNoa%2FeudvEZFLQzHTqUd%2FtPqgpQF%2FUy2RWgm5bZLTKQrj8Vhi%2BGz%2Ffxn9EYcjdW777vy22oYqAIHLKMUT4%2FnrTF2Y2uF%2BA5XB81eiCxQGAAAAAElFTkSuQmCC");
        menuitem.setAttribute("oncommand", "ToolRstart.SaveRestart(event);");
        optionsitem = document.getElementById("btn-sm-settings");
        optionsitem.parentNode.insertBefore(menuitem, optionsitem);
      }

      menuitem = document.createElement("menuitem");
      menuitem.setAttribute("id", "Restart_Firefox1");
      menuitem.setAttribute("label", label);
      menuitem.setAttribute("oncommand", "ToolRstart.SaveRestart(event);");
      optionsitem = document.getElementById("menu_FileQuitItem");
      optionsitem.parentNode.insertBefore(menuitem, optionsitem);
    }
}catch(e){}
    label = "再起動";
    //try {label =UI.ConvertToUnicode(label)} catch(e){}
    menuitem = document.createElement("menuitem");
    menuitem.setAttribute("label", label);
    menuitem.setAttribute("accesskey", "R");
    menuitem.setAttribute("oncommand", "ToolRstart.restartApp(true);");
    optionsitem = document.getElementById("menu_FileQuitItem");
    optionsitem.parentNode.insertBefore(menuitem, optionsitem);
    menuitem.setAttribute("id", "Restart_Firefox");
    optionsitem = document.getElementById("appmenu_quit") || document.getElementById("appmenu-quit");
    if (optionsitem) {
      menuitem = optionsitem.parentNode.insertBefore(menuitem.cloneNode(true), optionsitem);
      menuitem.setAttribute("id", "Restart_Firefox2");
    }
    dump("Initialized addRestartButtons");
  },

  SaveRestart: function(event) {
    event.stopPropagation();
    SessionManager.sessionUtil('save', 'allwindows');
    ToolRstart.restartApp(true);
  },

  //sessionsaver_.2-0.2.1.031-fx+mz.xpiから
  restartApp: function(clearCache) {
    if (typeof clearCache == 'undefined')
      clearCache = false;

    const appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"]
                      .getService(Components.interfaces.nsIAppStartup);

    // Notify all windows that an application quit has been requested.
    var os = Components.classes["@mozilla.org/observer-service;1"]
                       .getService(Components.interfaces.nsIObserverService);
    var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"]
                               .createInstance(Components.interfaces.nsISupportsPRBool);
    os.notifyObservers(cancelQuit, "quit-application-requested", null);

    // Something aborted the quit process.
    if (cancelQuit.data)
      return;

    // Notify all windows that an application quit has been granted.
    os.notifyObservers(null, "quit-application-granted", null);

    // Enumerate all windows and call shutdown handlers
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var windows = wm.getEnumerator(null);
    var win;
    while (windows.hasMoreElements()) {
      win = windows.getNext();
      if (("tryToClose" in win) && !win.tryToClose())
        return;
    }

    if (clearCache) {
      let XRE = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
      XRE.invalidateCachesOnRestart();
    }
    appStartup.quit(appStartup.eRestart | appStartup.eAttemptQuit);
  }

}

ToolRstart.init();

