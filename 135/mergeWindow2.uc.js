// ==UserScript==
// @name           mergeWindow2
// @namespace      http://pc11.2ch.net/
// @description    merge Window
// @include        main
// @compatibility  Firefox 135
// @author         2ch
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2024/04/09 21:00
// @version        2012/01/31 11:00 by Alice0775  12.0a1 about:newtab
// ==/UserScript==
/*
 * [ファイル]メニューにウィンドウをマージするメニューを追加する
 * Shiftキーを押しながらだと他のウィンドウもまとめてマージ
 */

var ucjs_mergeWindow = {
  showList: function(aNode) {
    while (aNode.childNodes.length > 2)
      aNode.removeChild(aNode.firstChild);
    var enumerator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
                       .getEnumerator('navigator:browser');
    var separator = aNode.firstChild;
    var index = 1;
    while (enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win == window)
        continue;
      var mi = aNode.insertBefore(document.createXULElement("menuitem"), separator);
      mi.setAttribute("label", index.toString() + ": " + win.document.title);
      mi.setAttribute("accesskey", index.toString());
      mi.value = index++;
    }
    separator.hidden = index == 1;
  },
  merge: function(aEvent) {
    var windowIndex = parseInt(aEvent.target.value);
    if (windowIndex == 0) {
      var aDestWin = OpenBrowserWindow();
      this.mergeToNew(window, aDestWin, true);
      return;
    }
    var enumerator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
                       .getEnumerator('navigator:browser');
    var index = 1;
    while (enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win == window)
        continue;
      if (index++ == windowIndex) {
        this.mergeToExisting(window, win);
        return;
      }
    }
  },
  mergeAll: function(aEvent) {
    var windowIndex = parseInt(aEvent.target.value);
    var enumerator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
                       .getEnumerator('navigator:browser');
    var index = 1, srcWins = [], destWin;
    while (enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win == window) {
        srcWins.unshift(win);
        continue;
      }
      if (index++ == windowIndex) {
        destWin = win;
      } else {
        srcWins.push(win);
      }
    }
    for (var i = srcWins.length - 1; i >= 0; i--) {
      if (this.isBlankWin(srcWins[i])) {
        srcWins[i].BrowserCommands.tryToCloseWindow();
        srcWins.splice(i, 1);
      }
    }
    if (windowIndex == 0) {
      destWin = OpenBrowserWindow();
      for (var i = 0; i < srcWins.length; i++) {
        this.mergeToNew(srcWins[i], destWin, i == 0);
      }
    } else {
      for (var i = 0; i < srcWins.length; i++) {
        this.mergeToExisting(srcWins[i], destWin);
      }
    }
  },
  isBlankWin: function(aWindow) {
    var gB = aWindow.gBrowser;
    return gB.tabs.length == 1 &&
           ("isBlankPageURL" in window ? isBlankPageURL(gB.currentURI.spec) : gB.currentURI.spec == "about:blank") &&
           gB.selectedBrowser.sessionHistory && gB.selectedBrowser.sessionHistory.count < 2 &&
           !gB.selectedTab.hasAttribute("busy") &&
           !gB.selectedBrowser.contentDocument.body.hasChildNodes();
  },
  mergeToNew: function(aSrcWin, aDestWin, aFirst) {
    var winState = SessionStore.getWindowState(aSrcWin);
    aDestWin.addEventListener('load', function(aEvent) {
      setTimeout(function(){
        aDestWin.removeEventListener('load', arguments.callee, false);
        SessionStore.setWindowState(aDestWin, winState, aFirst);
        //aDestWin.focus();
        //set document.commandDispatcher.focusedWindow to content so that getBrowserSelection() properly work
        setTimeout(function(aSrcWin, aDestWin){
          aSrcWin.BrowserCommands.tryToCloseWindow();
          aDestWin.content.focus();
        },1000, aSrcWin, aDestWin);
      },0);
    }, false);
  },
  mergeToExisting: function(aSrcWin, aDestWin) {
    let tabcount = aDestWin.gBrowser.tabs.length;
    var winState = SessionStore.getWindowState(aSrcWin);
    SessionStore.setWindowState(aDestWin, winState, false);
    if (this.isBlankWin(aDestWin))
      var tabtoclose = aDestWin.gBrowser.selectedTab;

    if (tabtoclose)
      aDestWin.gBrowser.removeTab(tabtoclose);
    setTimeout(function(aSrcWin, aDestWin){
      aSrcWin.BrowserCommands.tryToCloseWindow();
      aDestWin.focus();
      aDestWin.gBrowser.selectedTab = aDestWin.gBrowser.tabs[tabcount];
    },1000, aSrcWin, aDestWin);
  }
};

(function() {
  var mergeMenu = document.createXULElement("menu");
  mergeMenu.setAttribute("label", "Merge Window To");
  mergeMenu.setAttribute("accesskey", "m");
  var windowList = mergeMenu.appendChild(document.createXULElement("menupopup"));
  windowList.addEventListener("popupshowing", () => ucjs_mergeWindow.showList(this));
  windowList.addEventListener("command", () => {if (event.shiftKey) ucjs_mergeWindow.mergeAll(event); else ucjs_mergeWindow.merge(event)});
//  windowList.setAttribute("onpopupshowing", "ucjs_mergeWindow.showList(this);");
//  windowList.setAttribute("oncommand", "if (event.shiftKey) ucjs_mergeWindow.mergeAll(event); else ucjs_mergeWindow.merge(event);");
  windowList.appendChild(document.createXULElement('menuseparator'));
  var newwin = windowList.appendChild(document.createXULElement("menuitem"));
  newwin.setAttribute('label', 'New Window');
  newwin.setAttribute('accesskey', 'n');
  newwin.value = 0;
  var filePopup = document.getElementById("menu_FilePopup");
  filePopup.insertBefore(mergeMenu, filePopup.childNodes[1]);
})();
