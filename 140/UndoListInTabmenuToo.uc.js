// ==UserScript==
// @name           UndoListInTabmenuToo
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    UndoListInTabmenuToo.uc.js
// @include        main
// @compatibility  Firefox 140
// @author         Alice0775
// @version        2025/09/05 mark '*' for current index in the tooltip
// @version        2025/08/06 fix tooltip bug due to the change of 025/01/05
// @version        2025/07/26 add List All Tabs menu
// @version        2025/01/05 remove redundant menuitems
// @version        2025/01/05 fix bug
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2024/08/23 Bug 1690613 - Allow access to url/title/favIconUrl without "tabs" permission in session API
// @version        2023/06/16 08:00 Bug 1819675 - Expand recently closed tabs to include all Windows
// @version        2022/05/10 fix ref to context-media-eme-separator
// @version        2021/12/09 remove JSON.parse (Bug 1733425)
// @version        2021/04/25 fix 1689378
// @version        2019/11/14 remove eval
// @version        2019/06/30 10:00 Bug 1555060 Convert <tabs> to a custom element
// @version        2019/06/24 23:00 wait for gBrowser initialized
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2018/05/10 60
// @version        2017/11/18 nsIPrefBranch to nsIPrefBranch
// @version        2010/09/18 00:00 4.0b7pre
// @version        2009/02/03 13:00 ツールチップにタブ内履歴を表示するようにした
// @Note           タブやコンテキストメニューにもUndoClose Tab Listを追加するもの
// @OriginalCode   browser.jsからpopulateUndoSubmenuを拝借し, ごにょごにょした
// @version        2018/05/09 15:00 61
// ==/UserScript==
// @version        2010/03/26 13:00  Minefield/3.7a4pre Bug 554991 -  allow tab context menu to be modified by normal XUL overlays
// @version        2010/03/15 00:00  Minefield/3.7a4pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2009/09/09 15:00 中クリック処理
// @version        2009/09/03 22:00 Firegox3.7a1preで動かなくなっていたのを修正(Bug 489925. getElementById should not return anonymous nodes)
// @version        2009/08/22 00:00 Firegox3.6 stringbandleの変更による
// @version        2009/04/24 00:00 #394759 [Firefox:Session Restore]-Add undo close window feature
// @version        2008/10/12 18:00 Fx3.0.4pre中クリックしたときメニューポップアップが閉じないおよびその他fix
// @version        2007/10/05 10:00

var UndoListInTabmenu = {
// -- config --
  TABCONTEXTMENU : true ,  //タブコンテキストメニューに              追加する:[true], しない: false
  CONTEXTMENU    : false,  //コンテンツアリアコンテキストメニューに  追加する: true , しない:[false]
// -- config end--
  ss: null,

  get tabContext() {
    return document.getElementById("tabContextMenu");
  },

  get navigatorBundle() {
    return Services.strings.createBundle(
           "chrome://browser/locale/browser.properties"
           );
  },

  init: function(){

    if (this.TABCONTEXTMENU){
      //タブコンテキスト
      var tabContext = this.tabContext;
      this.makePopup(tabContext, null, "tabContextUndoList");
    }
    if (this.CONTEXTMENU){
      //コンテンツエリアコンテキスト
      var contextMenu = document.getElementById("contentAreaContextMenu");
      var refItem = document.getElementById("context-media-eme-separator");
      this.makePopup(contextMenu, refItem, "ContextUndoList");
    }
    // get closed-tabs from nsSessionStore
    this._ss = SessionStore;

  },

  makePopup: function(popup, refItem, id){
    var menu;
    //label
    const locale = "en";
    
    // "Recently Closed Windows"
    menu = document.createXULElement("menu");
    menu.setAttribute("id", "historyUndoWindowMenu3");
    menu.setAttribute("label", "Recently Closed Window List");
    menu.setAttribute("accesskey", "W");
    menu.setAttribute("disabled", "true");
    popup.insertBefore(menu, refItem);

    menupopup = document.createXULElement("menupopup");
    menu.appendChild(menupopup);
    menupopup.setAttribute("id", "historyUndoWindowPopup3");
    //menu.setAttribute("onpopupshowing", "UndoListInTabmenu.populateUndoWindowSubmenu(this);");
    menupopup.addEventListener("popupshowing", (event) => UndoListInTabmenu.populateUndoWindowSubmenu(event.currentTarget));

    //UndoClose Tab List  最近閉じたタブ
    const LABELTEXT = "Recently Closed Tab  List";    //create menu
    menu = document.createXULElement("menu");
    menu.setAttribute("label", LABELTEXT);
    menu.setAttribute("accesskey", "L");
    if (id)
      menu.setAttribute("id", id);
    //menu.setAttribute("disabled", true);
    var menupopup = document.createXULElement("menupopup");
    menupopup.addEventListener("popupshowing", () => UndoListInTabmenu.populateUndoSubmenu(menupopup));
    //menupopup.setAttribute("onpopupshowing", "UndoListInTabmenu.populateUndoSubmenu(this);");
    menu.appendChild(menupopup);
    popup.insertBefore(menu, refItem);

    //All tabs menu
    menu = document.createXULElement("menuitem");
    menu.setAttribute("label", "List All Tabs");
    menu.setAttribute("accesskey", "A");
    popup.insertBefore(menu, refItem);
    menu.addEventListener("command", (event) => {document.getElementById("alltabs-button").click()})


    //add event listener
    popup.addEventListener('popupshowing',function(event) {
      UndoListInTabmenu.toggleRecentlyClosedWindows(document.getElementById("historyUndoWindowMenu3"));
      // no restorable tabs, so make sure menu is disabled, and return
      if (UndoListInTabmenu._ss.getClosedTabCount(window) == 0) {
        menu.setAttribute("disabled", true);
        //menu.setAttribute("hidden", true);
        return;
      }
      menu.removeAttribute("disabled");
      //menu.setAttribute("hidden", false);
    },false);
  },

  /**
   * Populate when the history menu is opened (Fx3.6)
   */
  populateUndoSubmenu: function(undoPopup) {
		while (undoPopup.hasChildNodes()) {
			undoPopup.removeChild(undoPopup.firstChild);
		}
		var utils = RecentlyClosedTabsAndWindowsMenuUtils;
		var tabsFragment = utils.getTabsFragment(
		  window,
      "menuitem",
      /* aPrefixRestoreAll = */ true,
      "menu-history-reopen-all-tabs"
    );
		undoPopup.appendChild(tabsFragment);

    // populate tab historis for tooltip
    var undoItems = UndoListInTabmenu._ss.getClosedTabDataForWindow(window);
    for (var i = 0; i < undoItems.length; i++) {
      var entries = undoItems[i].state.entries;
      var tooltiptext = "";
      for (var j = entries.length - 1; j > -1; j--){
        if (j != entries.length - 1)
          tooltiptext += "\n";
        if (undoItems[i].state.index - 1 !== j) {
          tooltiptext += parseInt(j + 1, 10) + ". " + entries[j].title;
        } else {
          tooltiptext += "*" + ". " + entries[j].title;
        }
      }
      undoPopup.childNodes[i].setAttribute("tooltiptext", tooltiptext);
    }

    // "Append Clear undo close tb list"
    undoPopup.appendChild(document.createXULElement("menuseparator"));

    let m = undoPopup.appendChild(document.createXULElement("menuitem"));
    m.setAttribute("label", "Clear undo close tab list");
    m.setAttribute("accesskey", "C");
    m.addEventListener("command", function() {
      let prefs = Services.prefs;
      let max_undo = prefs.getIntPref("browser.sessionstore.max_tabs_undo");
      prefs.setIntPref("browser.sessionstore.max_tabs_undo", 0);
      prefs.setIntPref("browser.sessionstore.max_tabs_undo", max_undo);
    }, false);
  },

  toggleRecentlyClosedWindows: function PHM_toggleRecentlyClosedWindows(menu) {
    // enable/disable the Recently Closed Windows sub menu
    // no restorable windows, so disable menu
    if (this._ss.getClosedWindowCount() == 0)
      menu.setAttribute("disabled", true);
    else
      menu.removeAttribute("disabled");
  },

  /**
   * Populate when the history menu is opened
   */
  populateUndoWindowSubmenu: function PHM_populateUndoWindowSubmenu(undoPopup) {
		while (undoPopup.hasChildNodes()) {
			undoPopup.removeChild(undoPopup.firstChild);
		}
		let utils = RecentlyClosedTabsAndWindowsMenuUtils;
		let windowsFragment = utils.getWindowsFragment(
      window,
      "menuitem",
      /* aPrefixRestoreAll = */ true,
      "menu-history-reopen-all-windows"
    );
    undoPopup.appendChild(windowsFragment);
    undoPopup.firstChild.setAttribute("accesskey", "R");

    // "Append Clear undo close window list"
    undoPopup.appendChild(document.createXULElement("menuseparator"));

    m = undoPopup.appendChild(document.createXULElement("menuitem"));
    m.setAttribute("label", "Clear undo close window list");
    m.setAttribute("accesskey", "C");
    m.addEventListener("command", function() {
      for (let i = SessionStore.getClosedWindowCount() -1; i >= 0; i--)
        SessionStore.forgetClosedWindow(i);
    }, false);
  }
};

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  UndoListInTabmenu.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      UndoListInTabmenu.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}