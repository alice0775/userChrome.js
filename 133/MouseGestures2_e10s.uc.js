// ==UserScript==
// @name          Mouse Gestures (with Wheel Gesture and Rocker Gesture)
// @namespace     http://www.xuldev.org/
// @description   Lightweight customizable mouse gestures.
// @include       main
// @charset       UTF-8
// @author        Gomita, Alice0775 since 2018/09/26
// @compatibility 133
// @version       2024/11/29 Tolerance reduced.
// @version       2024/11/29 listen mouseup on document instead gbrowser
// @version       2024/11/29 workaround: mouseup event would not fire on select element
// @version       2024/10/07 scrolling page uses keyevent instead of goDoCommand
// @version       2024/08/25 Bug 1734181 - Re-enable back button intervention in Nightly
// @version       2024/05/10 Bug 1880914 - Move Browser* helper functions used from global menubar and similar commands to a single object in a separate file, loaded as-needed
// @version       2024/05/05 Bug 1892965 - Rename Sidebar launcher and SidebarUI
// @version       2024/03/26 00:00 fix cancel RockerGestures after click select tag
// @version       2024/03/01 00:00 Bug 1882577 - Make nsISearchEngine.getIconURL an async function
// @version       2023/12/24 00:00 Bug 1870644 use engine.getIconURL() instead engine.iconURI.spec
// @version       2023/07/17 00:00 use ES module imports
// @version       2023/06/20 remove Bug 1780695 - Remove Services.jsm
// @version       2023/06/16 08:00 Bug 1819675 - Expand recently closed tabs to include all Windows
// @version       2023/02/17 19:00 fix show favicon in タブの履歴をポップアップ
// @version       2023/02/08 10:00 remove -moz-image-region
// @version       2023/02/08 10:00 fix triggeringPrincipal
// @version       2023/02/08 10:00 Bug 1815439 - Remove useless loadURI wrapper from browser.js
// @version       2023/01/04 19:00 fix Bug 1475606 - Extend addTab to allow selecting a tab and remove the loadOneTab() API
// @version       2022/12/19 19:00 fix label of 検索エンジンポップアップ
// @version       2022/12/10 12:00 xxxx workaround: cancel gesture
// @version       2022/11/30 23:00 workaround for focusing delay
// @version       2022/11/30 23:00 stop using finder
// @version       2022/11/27 23:00 fix can't access property "selectedText", r is undefined
// @version       2022/11/27 00:21 fix WheelGestures
// @version       2022/11/27 00:10 fix clear statusinfo
// @version       2022/11/27 00:00 fix unexpected command fire
// @version       2022/11/26 21:00 Simplified.
// @version       2022/11/26 19:00 fix _selectedTXT for iframe
// @version       2022/11/26 18:00 revert removed workaround changes xxx
// @version       2022/09/22 22:00 removed workaround xxx
// @version       2022/09/22 15:00 fix workaround xxx
// @version       2022/08/19 00:00 remove "Services" from frame scripts
// @version       2022/08/02 18:00 Images in child nodes are also targeted.
// @version       2022/07/25 23:00 fix Bug 1766030 take3
// @version       2022/07/25 23:00 fix Bug 1766030 take2
// @version       2022/07/25 23:00 fix Bug 1766030
// @version       2022/05/08 23:00 fix ページ内検索バー(check gFindBarInitialized before reffering hidden attribute.)
// @version       2022/03/08 13:00 add 新しいコンテナータブを開く
// @version       2021/12/11 23:00 workaround for left mouseup event does not fire on select element
// @version       2021/12/09 11:00 no longer require MiddleClick handler
// @version       2021/12/09 09:00 remove eval(Bug 1733425)
// @version       2021/11/07 00:00 L>R
// @version       2021/10/16 20:00 update go button after change value of searchbar
// @version       2021/10/15 00:00 @compatibility 95, Addressed "Services" not being loaded in frame scripts (Bug 1708243).
// @version       2021/10/14 00:00 @compatibility 91
// @version       2021/09/19 00:30 fix use cookieJarSettings and referrer for saveImage  and saveLink
// @version       2021/09/16 00:30 Fix to detect links correctly.
// @version       2021/09/15 14:30 Fix openURLsInSelection
// @version       2021/08/31 23:30 Fix surplus selection after "L<R"
// @version       2021/08/31 22:30 use mouseleave instead mouseout
// @version       2021/08/31 22:00 fix left button status after "L>R"
// @version       2021/08/25 15:00 fix Principal for about:* link and checkLoadURIStrWithPrincipal flag
// @version       2021/06/05 10:00 fix use cookieJarSettings for save image
// @version       2021/04/25 20:00 fix TypeError: this._linkdocURLs is undefined, TypeError: target.ownerDocument is null
// @version       2021/04/11 12:00 workaround 選択テキストで検索 Bug 360332
// @version       2021/04/11 12:00 workaround: use finder.getInitialSelection
// @version       2021/02/09 15:00 Bug 1685801 - Move most things out of BrowserUtils.jsm
// @version       2020/12/19 15:00 fix typo and remove refferer
// @version       2020/12/19 00:00 Bug 1641270 - Saving already-loaded images from a webpage yields "not an image".
// @version       2020/12/14 09:00 add urlSecurityCheck for _linkURL, _linkURLs
// @version       2020/11/29 20:00 add コンテナータブを指定してリンクを開く
// @version       2020/08/22 21:11 fix すべてのタブを閉じる
// @version       2020/06/01 00:21 fix content-type
// @version       2020/04/25 10:00 Bug 1612068 - Move zoom from the content viewer to the browsing context
// @version       2020/06/01 00:00 fix Bug 1616881 - Get rid of `uses-unsafe-cpows`
// @version       2020/01/20 00:00 fix 'Home'
// @version       2019/10/31 19:00 fix >>374 '選択テキストを検索バーに追加'
// @version       2019/10/22 09:00 fix 71.0 fix web search
// @version       2019/10/22 08:00 fix 70.0 fix web search Bug 1587803 - Check BrowserContentHandler.jsm doSearch uses the right engine
// @version       2019/10/15 15:00 fix mousescroll(see software 1567300946/286)
// @version       2019/09/05 15:00 fix 69.0 load parent
// @version       2019/05/23 03:10 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version       2019/05/23 03:10 fix Bug 1483077 - Replaced reference to getBrowser with gBrowser for 68+
// @version       2019/05/23 03:00 Fix 67.0a1 Bug 1492475 The search service init() method should simply return a Promise
// @version       2019/03/21 01:00 fix Bug 1528695 for 67+
// @version       2019/01/21 01:00 reloadAllTabs to reloadTabs
// @version       2018/12/25 20:00 clear wheel gesture flg when right mouseup/down(wip)
// @version       2018/10/24 01:00 fix, some command
// @version       2018/10/10 22:00 fix, Suppressing mousemove event after wheel gesture
// @version       2018/10/03 11:00 add ucjsMouseGestures_helper.executeInContent, ucjsMouseGestures.executeInChrome
// @version       2018/10/03 08:00 add mime/type, content-dispositon (ucjsMouseGestures._imgTYPE, ucjsMouseGestures._imgDISP)
// @version       2018/10/02 02:00 add auto hide for status info
// @version       2018/09/30 24:00 fix Close Tabs to left right (closeMultipleTabs)
// @version       2018/09/30 22:00 fix surplus scroll if doing Wheel Gestures on 60esr
// @version       2018/09/30 03:00 add dispatchEvent command( dispatch event to content from chrome)
// @version       2018/09/30 01:00 fix getting selected text on CodeMirror editor
// @version       2018/09/30 00:00 fix getting selected text on about:addons page
// @version       2018/09/29 19:00 support zoomIn/Out/Reset for pdf.js
// @version       2018/09/29 19:00 add 'Search for "hogehoge..."' to webSearchPopup
// @version       2018/09/29 02:00 fix unused argument
// @version       2018/09/29 01:00 add commandsPopop
// @version       2018/09/29 01:00 fix "Closed Tabs Popup" does not work if UndoListInTabmenuToo.uc.js is not installed
// @version       2018/09/29 00:00 fix commands list (missing arguments webSearchPopup)
// @version       2018/09/28 23:00 add "Closed Tabs Popup" and "Session History Popup"
// @version       2018/09/28 23:00 fix typo(wip)
// @version       2018/09/28 22:40 fix Close other thabs(wip)
// @version       2018/09/28 19:00 fix typo(wip)
// @version       2018/09/28 18:50 fix gestures command(wip)
// @version       2018/09/28 18:30 change gestures command(wip)
// @version       2018/09/28 06:30 fix regression (wip)
// @version       2018/09/28 06:30 add/modify some gesture (wip)
// @version       2018/09/28 06:00 add library(ucjsMouseGestures_helper.hogehoge) (wip)
// @version       2018/09/27 22:00 add outline for hover links (wip)
// @version       2018/09/27 16:00 fix rocker gesture etc (wip)
// @version       2018/09/26 20:40 fix statusinfo in fx60 (wip)
// @version       2018/09/26 20:40 add find command (wip)
// @version       2018/09/26 20:30 fix page scrolled when Wheel Gesture (wip)
// @version       2018/09/26 19:10 fix author; (wip)
// @version       2018/09/26 19:10 fix missing break; (wip)
// @version       2018/09/26 19:00 fix statusinfo (wip)
// @version       2018/09/26 18:30 e10s (wip)
// @original      ver. 1.0.20080201
// @homepage      http://www.xuldev.org/misc/ucjs.php
// ==/UserScript==

// @note          Linux and Mac are not supported.

var ucjsMouseGestures = {
  // == config ==
  // options
  enableWheelGestures: true,  // Wheel Gestures (Scroll wheel with holding right-click)
  enableRockerGestures: true,  // Rocker Gestures (Left-click with holding right-click and vice versa)
  STATUSINFO_TIMEOUT: 2000, // timeout(in millisecond) hide status info

  // These are the mouse gesture mappings. Customize this as you like. 
  // Gesture Sequence,  UDRL: right-click then move to up down right left
  // Wheel Gestures,    W+ : right-click then wheel turn down , W- : left-click then wheel turn up
  // Rocker Gestures,   L<R : right-click then left-click , L>R : left-click then right-click
  // Any Gesture Sequence,  *hogehoge :  Gesture Sequence following that any faesture
  // ucjsMouseGestures._lastX, ucjsMouseGestures._lastY  : start coordinates

  // ucjsMouseGestures._linkURLs: link url hover
  // ucjsMouseGestures._selLinkURLs: link url in selected
  // ucjsMouseGestures._docURL : ownerDocument url
  // ucjsMouseGestures._linkURL ,ucjsMouseGestures._linkTXT : ownerDocument url : link url, ownerDocument url
  // ucjsMouseGestures._imgSRC  _imgTYPE _imgDISP: src mime/type contentdisposition
  // ucjsMouseGestures._mediaSRC : media src
  // ucjsMouseGestures._selectedTXT : selected text
  // ucjsMouseGestures._version : browser major version

  commands :

      [


        ['L', '戻る', function(){ document.getElementById("Browser:Back").doCommand(); } ],
        ['R', '進む', function(){ document.getElementById("Browser:Forward").doCommand(); } ],
        ['', 'Home', function(){ BrowserCommands.home(); } ],

        ['', 'タブの履歴をポップアップ', function(){ ucjsMouseGestures_helper.sessionHistoryPopup(); } ],
        ['', '履歴の先頭へ戻る', function(){ SessionStore.getSessionHistory(gBrowser.selectedTab, history => {gBrowser.gotoIndex(history.entries.length = 0)}); } ],
        ['', '履歴の末尾へ進む', function(){ SessionStore.getSessionHistory(gBrowser.selectedTab, history => {gBrowser.gotoIndex(history.entries.length - 1)}); } ],
        ['RLR', '>> 早送り', function(){ ucjsNavigation?.fastNavigationBackForward(1); } ],
        ['LRL', '<< 巻き戻し', function(){ ucjsNavigation?.fastNavigationBackForward(-1); } ],

        ['RULD', 'ひとつ上の階層へ移動', function(){ ucjsMouseGestures_helper.goUpperLevel(); } ],
        ['ULDR', '数値を増やして移動', function(){ ucjsMouseGestures_helper.goNumericURL(+1); } ],
        ['DLUR', '数値を減らして移動', function(){ ucjsMouseGestures_helper.goNumericURL(-1); } ],
        ['RL', '[次へ]等のリンクへ移動', function(){ ucjsNavigation?.advancedNavigateLink(1); } ],
        ['LR', '[戻る]等のリンクへ移動', function(){ ucjsNavigation?.advancedNavigateLink(-1); } ],

        ['UD', 'リロード', function(){ document.getElementById("Browser:Reload").doCommand(); } ],
        ['UDU', 'リロード(キャッシュ無視)', function(){ document.getElementById("Browser:ReloadSkipCache").doCommand(); } ],
        ['', 'すべてタブをリロード', function(){ typeof gBrowser.reloadTabs == "function" ? gBrowser.reloadTabs(gBrowser.visibleTabs) : gBrowser.reloadAllTabs(); } ],
        ['', '読込中止', function(){ document.getElementById("Browser:Stop").doCommand(); } ],

        ['', 'コンテナータブを指定してリンクを開く', function(){ ucjsMouseGestures_helper.openLinkInContainerTab(); } ],

        ['', '選択範囲のテキストリンクをすべてタブに開く(リンクが無い場合は規定の検索エンジンで検索)', function(){ ucjsMouseGestures_helper.openURLsInSelection(); } ],
        ['*RDL', '選択範囲のリンクをすべてタブに開く', function(){ ucjsMouseGestures_helper.openSelectedLinksInTabs(); } ],
        ['*RUL', '通過したリンクをすべてタブに開く', function(){ ucjsMouseGestures_helper.openHoverLinksInTabs(); } ],
        ['', 'リンクを新しいタブに開く', function(){ ucjsMouseGestures_helper.openURLs([ucjsMouseGestures._linkURL]); } ],

        ['', '選択したリンクを保存', function(){ ucjsMouseGestures_helper.saveSelectedLinks(); } ],
        ['', '通過したリンクを保存', function(){ ucjsMouseGestures_helper.saveHoverLinks(); } ],

        ['', 'コピー', function(){ ucjsMouseGestures_helper.copyText(ucjsMouseGestures._selectedTXT); } ],
        ['', '通過したリンクをコピー', function(){ ucjsMouseGestures_helper.copyHoverLinks(); } ],
        ['', '選択したリンクをコピー', function(){ ucjsMouseGestures_helper.copySelectedLinks(); } ],

        ['', 'リンクを保存',
          function(){ ucjsMouseGestures_helper.saveLink(ucjsMouseGestures._linkURL, ucjsMouseGestures._linkReferrerInfo); } ],
        ['', '画像を保存',
          function() { ucjsMouseGestures_helper.saveImage(ucjsMouseGestures._imgSRC,
                                                          ucjsMouseGestures._referrerInfo,
                                                          ucjsMouseGestures._imgTYPE,
                                                          ucjsMouseGestures._imgDISP); } ],

        ['UL', '前のタブ', function(){ gBrowser.tabContainer.advanceSelectedTab(-1, true); } ],
        ['UR', '次のタブ', function(){ gBrowser.tabContainer.advanceSelectedTab(+1, true); } ],
        ['ULR', '直前に選択していたタブ', function(){ ucjsNavigation_tabFocusManager?.advancedFocusTab(-1); } ],
        ['URL', '直前に選択していたタブを一つ戻る', function(){ ucjsNavigation_tabFocusManager?.advancedFocusTab(1); } ],

        ['', '新しいタブを開く', function(){ document.getElementById("cmd_newNavigatorTab").doCommand(); } ],
        ['', '新しいコンテナータブを開く', function(){ ucjsMouseGestures_helper.openLinkInContainerTab("about:blank", false, false); } ],
        ['', 'タブをピン留めトグル',
          function(){ var tab = gBrowser.selectedTab;
            tab.pinned ? gBrowser.unpinTab(tab) : gBrowser.pinTab(tab);
          } ],
        ['', 'タブを複製',
         function(){ 
            var orgTab = gBrowser.selectedTab;
            var newTab = gBrowser.duplicateTab(orgTab);
            gBrowser.moveTabTo(newTab, orgTab._tPos + 1);
          } ],
        ['LD', 'タブを閉じる', function(){ document.getElementById("cmd_close").doCommand(); } ],
        ['', 'タブ(Pinnedタブを除く)を閉じる', function(){ if (!gBrowser.selectedTab.pinned) { document.getElementById("cmd_close").doCommand(); } } ],

        ['', '左側のタブをすべて閉じる', function(){ ucjsMouseGestures_helper.closeMultipleTabs("left"); } ],
        ['', '右側のタブをすべて閉じる', function(){ ucjsMouseGestures_helper.closeMultipleTabs("right"); } ],
        ['', '他のタブをすべて閉じる', function(){ gBrowser.removeAllTabsBut(gBrowser.selectedTab); } ],
        ['DRU', '閉じたタブを元に戻す', function(){ document.getElementById("History:UndoCloseTab").doCommand(); } ],
        /*['DRU', '閉じたタブを元に戻す(一個ずつ)', function(){undoCloseTab(0); } ],*/
        ['', '閉じたタブのリストをポップアップ', function(){ ucjsMouseGestures_helper.closedTabsPopup(); } ],
        ['', 'すべてのタブを閉じる', function(){ var browser = gBrowser; var ctab = browser.addTrustedTab(BROWSER_NEW_TAB_URL, {skipAnimation: true,}); browser.removeAllTabsBut(ctab); } ],
        ['', 'ウインドウを閉じる', function(){ document.getElementById("cmd_closeWindow").doCommand(); } ],

        ['', '最小化', function(){ window.minimize(); } ],
        ['', '最大化/元のサイズ', function(){ window.windowState == 1 ? window.restore() : window.maximize(); } ],
        ['LDRU', 'フルスクリーン', function(){ document.getElementById("View:FullScreen").doCommand(); } ],

        ['RU', '上端へスクロール', function(){
            ucjsMouseGestures_helper.sendKey(/*shift*/null, /*ctrl*/null, /*alt*/null, /*meta*/null, [{key:"Home", keycode:KeyboardEvent.DOM_VK_HOME}]);
          } ],
        ['RD', '下端へスクロール', function(){
            ucjsMouseGestures_helper.sendKey(null, null, null, null, [{key:"End", keycode:KeyboardEvent.DOM_VK_END}]);
          } ],
        ['U', '上へスクロール', function(){
            ucjsMouseGestures_helper.sendKey(null, null, null, null, [{key:"PageUp", keycode:KeyboardEvent.DOM_VK_PAGE_UP}]);
          } ],
        ['D', '下へスクロール', function(){
            ucjsMouseGestures_helper.sendKey(null, null, null, null, [{key:"PageDown", keycode:KeyboardEvent.DOM_VK_PAGE_DOWN}]);
          } ],

        ['W-', 'ズームイン', function(){ ucjsMouseGestures_helper.zoomIn(); } ],
        ['W+', 'ズームアウト', function(){ ucjsMouseGestures_helper.zoomOut(); } ],
        ['L<R', 'ズームリセット', function(){ ucjsMouseGestures_helper.zoomReset(); } ],

        ['DL', 'ページ内検索バー',
          function(){
            if (gFindBarInitialized) {
              gFindBar.hidden? gFindBar.onFindCommand(): gFindBar.close();
            } else {
              gLazyFindCommand("onFindCommand");
            }
          } ],


        ['', '選択テキストで検索',
          function(){
            ucjsMouseGestures_helper._loadSearchWithDefaultEngine(
              ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT,
              false);
          } ],
        ['DRD', '選択テキストで検索(検索エンジンポップアップ)', function(){ ucjsMouseGestures_helper.webSearchPopup(ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT); } ],
        ['DR', '選択テキストを検索バーにコピー',
          function(){ 
            if (BrowserSearch.searchBar) {
              BrowserSearch.searchBar.value = ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT;
              BrowserSearch.searchBar.updateGoButtonVisibility();
            }
          } ],
        ['', '選択テキストを検索バーに追加',
          function(){ 
            if (BrowserSearch.searchBar.value){
              BrowserSearch.searchBar.value = BrowserSearch.searchBar.value + " " +
                     (ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT);
              BrowserSearch.searchBar.updateGoButtonVisibility();
            }else{
              BrowserSearch.searchBar.value = ucjsMouseGestures._selectedTXT ||
                                              ucjsMouseGestures._linkTXT;
              BrowserSearch.searchBar.updateGoButtonVisibility();
            }
          } ],
        ['', '検索バー（Web検索ボックス）をクリア',
          function(){
            document.getElementById("searchbar").value = "";
            BrowserSearch.searchBar.updateGoButtonVisibility();
          } ],
        ['', 'CSS切り替え', function(){ var styleDisabled = gPageStyleMenu._getStyleSheetInfo(gBrowser.selectedBrowser).authorStyleDisabled; if (styleDisabled) gPageStyleMenu.switchStyleSheet(""); else gPageStyleMenu.disableStyle(); } ],

        ['UDUD', 'ジェスチャーコマンドをポップアップ', function(){ ucjsMouseGestures_helper.commandsPopop(); } ],
        ['', '再起動', function(){ ucjsMouseGestures_helper.restart(); } ],

        ['', 'ブックマークサイドバー', function(){ SidebarController.toggle("viewBookmarksSidebar"); } ],
        ['', '履歴サイドバー', function(){ SidebarController.toggle("viewHistorySidebar"); } ],

        ['', '最近の履歴を消去', function(){ setTimeout(function(){ document.getElementById("Tools:Sanitize").doCommand(); }, 0); } ],
        ['', 'ブラウザーコンソール', function(){ ucjsMouseGestures_helper.openBrowserConsole(); } ],
        ['', 'アドオンマネージャ', function(){ openTrustedLinkIn("about:addons", "tab", {inBackground: false, relatedToCurrent: true}); } ],
        ['', 'トラブルシューティング情報', function(){ openTrustedLinkIn("about:support", "tab", {inBackground: false, relatedToCurrent: true}); } ],
        ['', '設定（オプション）', function(){ openTrustedLinkIn("about:preferences", "tab", {inBackground: false, relatedToCurrent: true}); } ],
        ['', 'weAutopagerizeのトグル',
          function(){
            ucjsMouseGestures_helper.dispatchEvent(
                            { target: "document", type: "AutoPagerizeToggleRequest" } );
          } ],
        ['', 'weAutopagerizeのトグル 方法2',
          function(){
            ucjsMouseGestures_helper.executeInContent(function aFrameScript() {
              content.document.dispatchEvent(new content.Event("AutoPagerizeToggleRequest"));
            });
          } ],

        ['RDR', 'TWP - Switch between the translated and the original page「Ctrl+Alt+T」',
          function(){
            ucjsMouseGestures_helper.sendKey(/*shift*/null, /*ctrl*/true, /*alt*/true, /*meta*/null, [{key:"T", keycode:KeyboardEvent.DOM_VK_T}]);
          } ],

        ['LDR', 'TWP - Translate selected text「Ctrl+Alt+S」',
          function(){
            ucjsMouseGestures_helper.sendKey(null, true, true, null, [{key:"S", keycode:KeyboardEvent.DOM_VK_S}]);
          } ],

        ['DLU', 'TWP - Translate the page to the target language 1「Shift+Alt+1」',
          function(){
            ucjsMouseGestures_helper.sendKey(true, null, true, null, [{key:"1", keycode:KeyboardEvent.DOM_VK_1}]);
          } ],

        ['RULDR', 'TWP - Translate the page to the target language 2「Shift+Alt+2」',
          function(){
            ucjsMouseGestures_helper.sendKey(true, null, true, null, [{key:"2", keycode:KeyboardEvent.DOM_VK_2}]);
          } ],

        ['', 'ページ内キャンバスをすべて保存',
          function() {
            let browserMM = gBrowser.selectedBrowser.messageManager;
            browserMM.addMessageListener("getCanvas", function fnc(listener) {
              browserMM.removeMessageListener("getCanvas", fnc, true);
              let data = listener.data;
              let i = data.length;
              while(i){
                let IMGtitle = ("000"+i).slice(-3);
                i--;
                //saveURL(aURL, aOriginalURL, aFileName, aFilePickerTitleKey, aShouldBypassCache,
                //        aSkipPrompt, aReferrerInfo, aCookieJarSettings,
                //        aSourceDocument,
                //        aIsContentWindowPrivate,
                //        aPrincipal)
                saveURL(data[i], null, IMGtitle + ".png", null, false,
                        true,
                        ucjsMouseGestures._referrerInfo, //referrerInfo
                        ucjsMouseGestures._cookieJarSettings, //cookieJarSettings
                        null,
                        PrivateBrowsingUtils.isWindowPrivate(window),
                        Services.scriptSecurityManager.createNullPrincipal({}));
              }
            });
            function contentScript() {
              function populate(win) {
                let data = [];
                for (let j = 0; j <  win.frames.length; j++) {
                  data = data.concat(populate(win.frames[j]));
                }

                let elems = win.document.getElementsByTagName("canvas");
                let i = elems.length;
                while(i--){
                  data.push(elems[i].toDataURL("image/png"));
                }
                return data
              }
              let data = populate(content.document.defaultView);
              sendAsyncMessage("getCanvas", data);
            }
            let script = 'data:application/javascript;charset=utf-8,' + encodeURIComponent('(' + contentScript.toString() + ')();');
            browserMM.loadFrameScript(script, false);
          } ],

        ['', 'frameスクリプトのテスト用',
          function() {
            //frameスクリプトを実行
            ucjsMouseGestures_helper.executeInContent(function aFrameScript(window) {
              // the following are available in frame script
              // ucjsMouseGestures._linkURL     // link url at star mouse gestures(string)
              // ucjsMouseGestures._linkTXT     //      linktext (string)
              // ucjsMouseGestures._imgSRC      // image src at star mouse gestures(string)(string)
              // ucjsMouseGestures._imgTYPE     //       mime/type (string)
              // ucjsMouseGestures._imgDISP     //       cpntent-disposition (string)
              // ucjsMouseGestures._mediaSRC    // media src at star mouse gestures(string)(string)(string)
              // ucjsMouseGestures.executeInChrome: function(func, args) // function oject, array [string, ...]


              /*
              Services.console.logStringMessage("contentScript window: " + window); //should undefined
              Services.console.logStringMessage("contentScript this: " + this);
              Services.console.logStringMessage("contentScript content: " + content);
              Services.console.logStringMessage("contentScript this === content: " + (this === content));

              Services.console.logStringMessage("contentScript test: " + ucjsMouseGestures._imgSRC);
              */

              // このframeスクリプトからChromeスクリプトを実行するテスト
              ucjsMouseGestures.executeInChrome(
                function aChromeScript(url, inBackground = true) {
                  //gBrowser.loadOneTab(
                  gBrowser.addTab(
                    url, {
                    relatedToCurrent: true,
                    inBackground: inBackground,
                    triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
                  });
                },
                ["http://www.yahoo.co.jp", false]
              );
            });
          }],  


      ],
  // == /config ==


  _lastX: 0,
  _lastY: 0,
  _directionChain: "",
  _linkdocURLs: [],
  _linkURLs: [],
  _linkReferrerInfos: [],
  _selLinkdocURLs: [],
  _selLinkURLs: [],
  _selLinkReferrerInfos: [],
  _docURL: "",
  _linkURL: "",
  _linkTXT: "",
  _imgSRC: "",
  _mediaSRC: "",
  _selectedTXT: "",
  _version: "",

  _isMac: false,  // for Mac

  get statusinfo() {
    if ("StatusPanel" in window) {
      // fx61+
      return StatusPanel._labelElement.value;
    } else {
      return XULBrowserWindow.statusTextField.label;
    }
  },

  set statusinfo(val) {
    if ("StatusPanel" in window) {
      // fx61+
      StatusPanel._label = val;
    } else {
      XULBrowserWindow.statusTextField.label = val;
    }
    if(this._statusinfotimer)
      clearTimeout(this._statusinfotimer);
    this._statusinfotimer = setTimeout(() => {this.hideStatusInfo();}, this.STATUSINFO_TIMEOUT);
    this._laststatusinfo = val;
    return val;
  },

  get _isMouseDownR() {
    return this.__isMouseDownR;
  },

  set _isMouseDownR(val) {
    this.__isMouseDownR = val;
    this._isWheelCanceled = false;
    return val;
  },

  init: function() {
    if (AppConstants.platform == "linux")
      Services.prefs.setBoolPref("ui.context_menus.after_mouseup", true);
    this._version = Services.appinfo.version.split(".")[0];
    this._isMac = navigator.platform.indexOf("Mac") == 0;
    gBrowser.tabpanels.addEventListener("mousedown", this, false);
    document.addEventListener("mouseup", this, false);
    gBrowser.tabpanels.addEventListener("contextmenu", this, true);
    if (this.enableWheelGestures)
      window.addEventListener('wheel', this, true);

     messageManager.addMessageListener("ucjsMouseGestures_linkURL_isWheelCancel", this);
     messageManager.addMessageListener("ucjsMouseGestures_linkURL_start", this);
     messageManager.addMessageListener("ucjsMouseGestures_linkURLs_stop", this);
     messageManager.addMessageListener("ucjsMouseGestures_linkURL_dragstart", this);

     messageManager.addMessageListener("ucjsMouseGestures_executeInChrome", this);
     window.addEventListener("unload", this, false);
  },

  uninit: function() {
    gBrowser.tabpanels.removeEventListener("mousedown", this, false);
    gBrowser.tabpanels.removeEventListener("mousemove", this, false);
    document.removeEventListener("mouseup", this, false);
    gBrowser.tabpanels.removeEventListener("mouseleave", this, false);
    gBrowser.tabpanels.removeEventListener("contextmenu", this, true);
    if (this.enableWheelGestures)
      window.removeEventListener('wheel', this, true);

     messageManager.removeMessageListener("ucjsMouseGestures_linkURL_isWheelCancel", this);
     messageManager.removeMessageListener("ucjsMouseGestures_linkURL_start", this);
     messageManager.removeMessageListener("ucjsMouseGestures_linkURLs_stop", this);
     messageManager.removeMessageListener("ucjsMouseGestures_linkURL_dragstart", this);

     messageManager.removeMessageListener("ucjsMouseGestures_executeInChrome", this);
     window.removeEventListener("unload", this, false);
  },

  _isMouseDownL: false,
  __isMouseDownR: false,
  _suppressContext: false,
  _shouldFireContext: false,  // for Linux 
  _isWheelCanceled: false,
  _statusinfotimer :null,
  _laststatusinfo : "",

  hideStatusInfo: function() {
    if(this._statusinfotimer)
      clearTimeout(this._statusinfotimer);
    this._statusinfotimer = null;
    if (this._laststatusinfo == this.statusinfo)
      this.statusinfo = "";
  },

  receiveMessage: function(message) {
    //Services.console.logStringMessage("message from framescript: " + message.name);
    switch(message.name) {
      case "ucjsMouseGestures_linkURL_isWheelCancel":
        return { _isWheelCanceled: this._isWheelCanceled};
        break;
      case "ucjsMouseGestures_linkURL_start":
        this._docURL = message.data.docURL;
        this._docCHARSET = message.data.docCHARSET;
        this._linkURL = message.data.linkURL;
        this._linkTXT = message.data.linkTXT;
        this._linkReferrerInfo = E10SUtils.deserializeReferrerInfo(message.data.linkReferrerInfo);
        this._imgSRC = message.data.imgSRC;
        this._imgTYPE = message.data.imgTYPE;
        this._imgDISP = message.data.imgDISP;
        this._mediaSRC = message.data.mediaSRC;
        this._selectedTXT = message.data.selectedTXT;
        this._cookieJarSettings = E10SUtils.deserializeCookieJarSettings(message.data.cookieJarSettings);
         this._referrerInfo = E10SUtils.deserializeReferrerInfo(message.data.referrerInfo);
      break;
      case "ucjsMouseGestures_linkURLs_stop":
        this._linkdocURLs = message.data.linkdocURLs.split(" ");
        this._linkURLs = message.data.linkURLs.split(" ");
        this._linkReferrerInfos = message.data.linkReferrerInfos.split(" ");
        for(let i = 0; i < this._linkReferrerInfos.length; i++) {
          this._linkReferrerInfos[i] =
            E10SUtils.deserializeReferrerInfo(this._linkReferrerInfos[i])
        }
        this._selLinkdocURLs = message.data.selLinkdocURLs.split(" ");
        this._selLinkURLs = message.data.selLinkURLs.split(" ");
        this._selLinkReferrerInfos = message.data.selLinkReferrerInfos.split(" ");
        for(let i = 0; i < this._selLinkReferrerInfos.length; i++) {
          this._selLinkReferrerInfos[i] =
            E10SUtils.deserializeReferrerInfo(this._selLinkReferrerInfos[i])
        }
        break;
      case "ucjsMouseGestures_linkURL_dragstart":
        if (this.enableRockerGestures)
          this._isMouseDownL = false;
        break;
      case "ucjsMouseGestures_executeInChrome":
        //try {
          browser = message.target;
          func = message.data.func;
          args = JSON.parse(message.data.args);
          functionobj = new Function(
             func.match(/\((.*)\)\s*\{/)[1],
             func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
          );
          functionobj.apply(window, args);
        //} catch(ex) {
        //  Services.console.logStringMessage("Error in executeInChrome : " /*+ ex*/);
        //}
        break;
    }
    return {};
  },

  handleEvent: function(event) {
    var x = event.screenX;
    var y = event.screenY;
    switch (event.type) {
      case "mousedown": 
        if (event.button == 2) {
          gBrowser.tabpanels.addEventListener("mousemove", this, false);
          this._isMouseDownR = true;
          this._suppressContext = false;
          this._startGesture(event);
          if (this.enableRockerGestures && this._isMouseDownL) {
            event.preventDefault();
            event.stopPropagation();
            gBrowser.tabpanels.addEventListener("mouseleave", this, false);
            this._isMouseDownR = false;
            this._suppressContext = true;
            this._directionChain = "L>R";
            if (this._selectedTXT) {
              this._stopGesture(event);
            } else {
              try {
                gBrowser.selectedBrowser.finder.getInitialSelection().then((r)=> {
                  this._selectedTXT = r.selectedText;
                  this._stopGesture(event);
                })
              } catch(ex){
                this._stopGesture(event);
              }
            }
          }
        } else if (this.enableRockerGestures && event.button == 0) {
          this._isMouseDownL = true;
          this._lastX = x;
          this._lastY = y;
          if (this._isMouseDownR) {
            event.preventDefault();
            event.stopPropagation();
            this._isMouseDownL = false;
            this._suppressContext = true;
            this._directionChain = "L<R";
            this._stopGesture(event);
          }
        }
        break;
      case "mousemove": 
        if (this._isMouseDownR && !(this._suppressContext)) { // bousyo
          this._progressGesture(event);
        }
        let tabpanels = gBrowser.tabpanels;
        if (x < tabpanels.screenX ||
            y < tabpanels.screenY ||
            x > tabpanels.screenX + tabpanels.clientWidth ||
            y > tabpanels.screenY + tabpanels.clientHeight ) {
          this._isMouseDownL = false;
          this._isMouseDownR = false;
        }
        break;
      case "mouseup": 
        gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsMouseGestures_mouseup");
        gBrowser.tabpanels.removeEventListener("mousemove", this, false);
        if ((this._isMouseDownR && event.button == 2) ||
            (this._isMouseDownR && this._isMac && event.button == 0 && event.ctrlKey)) {
          this._isMouseDownR = false;
          if (this._directionChain)
            this._suppressContext = true;
          this._stopGesture(event);
          if (this._shouldFireContext) {
            this._shouldFireContext = false;
            this._displayContextMenu(event);
          }
        } else if (this.enableRockerGestures && event.button == 0 && this._isMouseDownL) {
          gBrowser.tabpanels.removeEventListener("mouseleave", this, false);
          this._isMouseDownL = false;
        }
        break;
      case "mouseleave": 
        gBrowser.tabpanels.removeEventListener("mouseleave", this, false);
        this._isMouseDownL = false;
        break;
      case "contextmenu": 
        if (this._suppressContext || this._isMouseDownR) {
          this._suppressContext = false;
          event.preventDefault();
          event.stopPropagation();
          if (this._isMouseDownR) {
            this._shouldFireContext = true;
          }
        }
        break;
      case "wheel": 
        if (this.enableWheelGestures && this._isMouseDownR) {
          //Cancel scrolling
          event.preventDefault();
          event.stopPropagation();
          this._isWheelCanceled = true;

          this._suppressContext = true;
          this._directionChain = "W" + (event.deltaY > 0 ? "+" : "-");
          this._stopGesture(event);
        } else {
          this._isWheelCanceled = false;
        }
        break;
    }
  },

  _displayContextMenu: function(event) {
    var evt = event.originalTarget.ownerDocument.createEvent("MouseEvents");
    evt.initMouseEvent(
      "contextmenu", true, true, event.originalTarget.defaultView, 0,
      event.screenX, event.screenY, event.clientX, event.clientY,
      false, false, false, false, 2, null
    );
    event.originalTarget.dispatchEvent(evt);
  },

  _startGesture: function(event) {
    this._lastX = event.screenX;
    this._lastY = event.screenY;
    this._directionChain = "";
    this._linkdocURLs = [];
    this._linkURLs = [];
    this._selLinkdocURLs = [];
    this._selLinkURLs = [];
  },

  _progressGesture: function(event) {

    var x = event.screenX;
    var y = event.screenY;
    var distanceX = Math.abs(x - this._lastX);
    var distanceY = Math.abs(y - this._lastY);
    // minimal movement where the gesture is recognized
    const tolerance = 10;
    if (distanceX < tolerance && distanceY < tolerance) {
      this.statusinfo = this._laststatusinfo;
      return;
    }
    // determine current direction
    var direction;
    if (distanceX > distanceY)
      direction = x < this._lastX ? "L" : "R";
    else
      direction = y < this._lastY ? "U" : "D";
    // compare to last direction
    var lastDirection = this._directionChain.charAt(this._directionChain.length - 1);
    if (direction != lastDirection) {
      this._directionChain += direction;
      let commandName = "";
      for (let command of this.commands) {
        if (command[0].substring(0, 1) == "*") {
          let cmd = command[0].substring(1);
          if (cmd == this._directionChain.substring(this._directionChain.length - cmd.length)) {
            commandName = command[1];
            break;
          }
        }
      }
      if (!commandName)
        for (let command of this.commands) {
          if (!!command[0] && command[0] == this._directionChain){
            commandName = command[1];
            break;
          }
        }
      this.statusinfo = "Gesture: " + this._directionChain + " " + commandName;
    }
    // save current position
    this._lastX = x;
    this._lastY = y;
  },

  _stopGesture: function(event) {
    window.messageManager.broadcastAsyncMessage("ucjsMouseGestures_mouseup");
    gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsMouseGestures_linkURLs_request");
    if (!document.hasFocus()) {
      // xxxx workaround
      this._isMouseDownR = false;
      this._isMouseDownL = false;
      this._directionChain = "";
      this._isWheelCanceled = false;
      return;
    }
    if (this._directionChain) {
      this._performAction(event);
      this.statusinfo =  "";
    }
/*
    this._directionChain = "";
    this._linkURLs = null;
*/
  },

  _performAction: function(event) {
//    Services.console.logStringMessage("====" + this._directionChain);
    // Any Gesture Sequence
    for (let command of this.commands) {
      if (command[0].substring(0, 1) == "*") {
        let cmd = command[0].substring(1);
        if (cmd == this._directionChain.substring(this._directionChain.length - cmd.length)) {
          try {
            command[2]();
          } catch(ex) {
            Services.console.logStringMessage("Error in command (" + this._directionChain + ")" /*+ ex*/);
          }
          this._directionChain = "";
          return;
        }
      }
    }
    // These are the mouse gesture mappings.
    for (let command of this.commands) {
      if (this._directionChain !== "" && command[0] == this._directionChain) {
        try {
          command[2]();
        } catch(ex) {
          Services.console.logStringMessage("Error in command (" + this._directionChain + ")" /*+ ex*/);
        }
        this._directionChain = "";
        return;
      }
    }
    // Unknown Gesture
    // throw "Unknown Gesture: " + this._directionChain;

    this._directionChain = "";

    this._shouldFireContext = false; // for Linux 
    this._isWheelCanceled = false;
    this._laststatusinfo  = "";

  }

};

// エントリポイント
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  ucjsMouseGestures.init();

} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      ucjsMouseGestures.init();

    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}






let ucjsMouseGestures_framescript = {
  init: function() {


    let framescript = {
      _linkdocURLs: [],
      _linkURLs: [],
      _linkReferrerInfos: [],
      _linkElts: [],

      init: function(isMac, enableWheelGestures) {
        ChromeUtils.defineESModuleGetters(this, {
          E10SUtils: "resource://gre/modules/E10SUtils.sys.mjs",
        });
        this.Services = Services;


        this.console = Cc["@mozilla.org/consoleservice;1"]
                       .getService(Ci.nsIConsoleService);
        this._isMac = isMac;
        this.enableWheelGestures = enableWheelGestures;
        addMessageListener("ucjsMouseGestures_mouseup", this);
        addMessageListener("ucjsMouseGestures_linkURLs_request", this);
        addMessageListener("ucjsMouseGestures_dispatchKeyEvent", this);
        addMessageListener("ucjsMouseGestures_dispatchEvent", this);
        addEventListener("mousedown", this, true);
        if (this.enableWheelGestures)
          addEventListener('wheel', this, true);
      },

      receiveMessage: function(message) {
//        this.console.logStringMessage("====" + message.name);
        switch(message.name) {
          case "ucjsMouseGestures_mouseup":
            removeEventListener("mousemove", this, false);
            this.clearStyle();
            break;
          case "ucjsMouseGestures_linkURLs_request":
            let [_selLinkElts, selLinkURLs, selLinkdocURLs, selLinkReferrerInfos] = this.gatherLinkURLsInSelection();
            let json = {
              linkdocURLs: this._linkdocURLs.join(" "),
              linkURLs: this._linkURLs.join(" "),
              linkReferrerInfos: this._linkReferrerInfos.join(" "),
              selLinkdocURLs: selLinkdocURLs.join(" "),
              selLinkURLs: selLinkURLs.join(" "),
              selLinkReferrerInfos: selLinkReferrerInfos.join(" ")
            };
            sendSyncMessage("ucjsMouseGestures_linkURLs_stop",
              json
            );
            this.clearStyle();
            break;
          case "ucjsMouseGestures_dispatchKeyEvent":
            this.dispatchKeyEvent(message.data.targetSelector,
                                  message.data.type,
                                  message.data.bubbles,
                                  message.data.cancelable, 
                                  /*message.data.viewArg, */
                                  message.data.ctrlKey,
                                  message.data.shiftKey,
                                  message.data.altKey,
                                  message.data.metaKey,
                                  message.data.keyCode,
                                  message.data.charCode,
                                 );
            break;
          case "ucjsMouseGestures_dispatchEvent":
            this.dispatchEvent(message.data);
        }
        return {};
      },

      handleEvent: function(event) {
        //this.console.logStringMessage("====" + event.type);
        let imgSRC, imgTYPE, imgDISP, linkURL, linkTXT, mediaSRC, selectedTXT, json;
        let _isWheelCanceled;
        let secMan = Cc["@mozilla.org/scriptsecuritymanager;1"].getService(Ci.nsIScriptSecurityManager);
        switch(event.type) {
          case "mousedown":
            if (event.button == 2) {
              addEventListener("mousemove", this, false);
            }
            addEventListener("dragstart", this, true);
            this._linkdocURLs = [];
            this._linkURLs = [];
            this._linkReferrerInfos = [];
            this._linkElts = [];
            this._selLinkdocURLs = [];
            this._selLinkURLs = [];
            this._selLinkReferrerInfos = [];
            [imgSRC, imgTYPE, imgDISP] = this._getImgSRC(event.target);
            linkURL = null;
            let linkReferrerInfo = null;

            // Now it is time to create the timer...
            let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
            timer.init( _ => {
              try {
                let node = this._getLinkURL(event.target);
                let url = node.href;
                /*
                this.Services.scriptSecurityManager.checkLoadURIStrWithPrincipal(
                  event.target.ownerDocument.nodePrincipal,
                  url,
                  this.Services.scriptSecurityManager
                );
                */
                secMan.checkLoadURIStrWithPrincipal(
                  event.target.ownerDocument.nodePrincipal,
                  url,
                  secMan
                );
                linkURL = url;
                linkReferrerInfo = Cc["@mozilla.org/referrer-info;1"]
                                       .createInstance(Ci.nsIReferrerInfo);
                linkReferrerInfo.initWithElement(node);
              } catch (ex) {}

              linkTXT = this._getLinkTEXT(this.link);
              mediaSRC = this._getMediaSRC(event.target);
              selectedTXT = this._getSelectedText(event.originalTarget);
              let doc = event.target.ownerDocument;
              json = {
                docURL: doc.location.href,
                docCHARSET: doc.charset,
                linkURL: linkURL,
                linkTXT: linkTXT,
                imgSRC: imgSRC,
                imgTYPE: imgTYPE,
                imgDISP: imgDISP,
                mediaSRC: mediaSRC,
                selectedTXT: selectedTXT,
                cookieJarSettings: this.E10SUtils.serializeCookieJarSettings(
                                     doc.cookieJarSettings
                                   ),
                referrerInfo: this.E10SUtils.serializeReferrerInfo(
                                     doc.referrerInfo
                                   ),
                linkReferrerInfo: this.E10SUtils.serializeReferrerInfo(
                                     linkReferrerInfo
                                   )                                 
              };
              sendSyncMessage("ucjsMouseGestures_linkURL_start",
                json
              );
            }, 0, Ci.nsITimer.TYPE_ONE_SHOT); 
            break;
          case "mousemove":
                // ホバーしたリンクのURLを記憶
            let node = this._getLinkURL(event.target);
            // this.console.logStringMessage("node " + node);
            if (!node)
              break;
            linkURL = node.href;
            if (linkURL && this._linkURLs.indexOf(linkURL) == -1) {
              try {
                /*
                this.Services.scriptSecurityManager.checkLoadURIStrWithPrincipal(
                  event.target.ownerDocument.nodePrincipal,
                  linkURL,
                  this.Services.scriptSecurityManager
                );
                */
                secMan.checkLoadURIStrWithPrincipal(
                  event.target.ownerDocument.nodePrincipal,
                  linkURL,
                  secMan
                );
              } catch (ex) {
                break
              }
              this._linkdocURLs.push(event.target.ownerDocument.location.href);
              this._linkURLs.push(linkURL);
              let linkReferrerInfo = Cc["@mozilla.org/referrer-info;1"]
                                      .createInstance(Ci.nsIReferrerInfo);
              linkReferrerInfo.initWithElement(node);
              this._linkReferrerInfos.push(this.E10SUtils.serializeReferrerInfo(linkReferrerInfo));

              this._linkElts.push(event.target);
              event.target.style.outline = "1px dashed darkorange";
            }
            break;
          case "wheel":
            _isWheelCanceled = sendSyncMessage(
                    "ucjsMouseGestures_linkURL_isWheelCancel", {})[0]._isWheelCanceled;
            if (_isWheelCanceled) {
              //Cancel scrolling
              event.preventDefault();
              event.stopPropagation();
            }
            break;
          case "dragstart":
            sendSyncMessage("ucjsMouseGestures_linkURL_dragstart",{});
            removeEventListener("mousemove", this, false);
            removeEventListener("dragstart", this, true);
            break;
        }
      },

      _getSelectedText: function(target) {
        let focusedWindow = {};
        let focusedElement = this.Services.focus.getFocusedElementForWindow(
          content,
          true,
          focusedWindow
        );
        focusedWindow = focusedWindow.value;

        let selText;

        // If this is a remote subframe, return an empty string but
        // indiciate which browsing context was focused.
        if (
          focusedElement &&
          "frameLoader" in focusedElement &&
          BrowsingContext.isInstance(focusedElement.browsingContext)
        ) {
          return  "";
        }

        if (focusedElement && focusedElement.editor) {
          // The user may have a selection in an input or textarea.
          selText = focusedElement.editor.selectionController
            .getSelection(Ci.nsISelectionController.SELECTION_NORMAL)
            .toString();
        } else {
          // Look for any selected text on the actual page.
          selText = focusedWindow.getSelection().toString();
        }

        if (!selText) {
          return "" ;
        }
        return selText.substr(0, 16384);
      },
    
      _getLinkURL: function(aNode) {
        this.link = null;
        while (aNode) {
          if ((aNode instanceof content.HTMLAnchorElement || aNode instanceof content.HTMLAreaElement) && aNode.href) {
            this.link = aNode;
            return aNode;
          }
          try {
            aNode = aNode.parentNode;
          }catch(e){
            return null;
          }
        }
        return null;
      },

      _getImgSRC: function(aNode) {
        let aNode0 = aNode;
        aNode = aNode0.querySelector("img");  /*if found image in child*/
        if (!aNode) aNode = aNode0;
        while (aNode) {
          if (aNode instanceof content.HTMLImageElement && aNode.src) {
            let aURL = aNode.src
            let aContentType = null;
            let aContentDisp = null;
            let ios = Components.classes["@mozilla.org/network/io-service;1"].
              getService(Components.interfaces.nsIIOService);
            try {
              let aDoc = aNode.ownerDocument;
              aURL = ios.newURI(aURL, aDoc.characterSet);
              var imageCache = Cc["@mozilla.org/image/tools;1"]
                                 .getService(Ci.imgITools)
                                 .getImgCacheForDocument(aDoc);
              var props =
                imageCache.findEntryProperties(aURL, aDoc);
            } catch (e) {}
            if (props) {
              try {
                aContentType = props.get("type",  Ci.nsISupportsCString).data;
              } catch (e) {
              }
              try {
                aContentDisp = props.get(
                  "content-disposition",
                  Ci.nsISupportsCString
                ).data;
              } catch (e) {
              }
            }
            return [aURL.spec, aContentType, aContentDisp];
          }
          aNode = aNode.parentNode;
        }
        aNode = aNode0;
        while (aNode) {
          try {
            if (aNode instanceof content.HTMLCanvasElement) {
              return [aNode.toDataURL("image/png"), "image/png"];
            }
          } catch(e) {}
          aNode = aNode.parentNode;
        }
        
        return [null, null, null];
      },

      _getMediaSRC: function(aNode) {
        while (aNode) {
          if (aNode instanceof content.HTMLMediaElement && aNode.src) {
            return aNode.src;
          }
          aNode = aNode.parentNode;
        }
        return null;
      },

      _getLinkTEXT: function(aNode) {
        if (!aNode)
          return "";
        let text = this._gatherTextUnder(aNode);
        if (!text || !text.match(/\S/)) {
          text = aNode.getAttribute("title");
          if (!text || !text.match(/\S/)) {
            text = aNode.getAttribute("alt");
            if (!text || !text.match(/\S/)) {
              text = this._getLinkURL(aNode);
            }
          }
        }
        return text;
      },
      
      _gatherTextUnder: function(root) {
        let text = "";
        let node = root.firstChild;
        let depth = 1;
        while (node && depth > 0) {
          // See if this node is text.
          if (node.nodeType == node.TEXT_NODE) {
            // Add this text to our collection.
            text += " " + node.data;
          } else if (node instanceof content.HTMLImageElement) {
            // If it has an "alt" attribute, add that.
            let altText = node.getAttribute( "alt" );
            if ( altText && altText != "" ) {
              text += " " + altText;
            }
          }
          // Find next node to test.
          // First, see if this node has children.
          if (node.hasChildNodes()) {
            // Go to first child.
            node = node.firstChild;
            depth++;
          } else {
            // No children, try next sibling (or parent next sibling).
            while (depth > 0 && !node.nextSibling) {
              node = node.parentNode;
              depth--;
            }
            if (node.nextSibling) {
              node = node.nextSibling;
            }
          }
        }

        // Strip leading and tailing whitespace.
        text = text.trim();
        // Compress remaining whitespace.
        text = text.replace(/\s+/g, " ");
        return text;
      },

      clearStyle: function() {
        if (this._linkElts) 
          this._linkElts.forEach((aElt) => {
            if (aElt) aElt.style.outline = "";
          });
      },

      gatherLinkURLsInSelection: function() {
        var win = content;
        var sel = win.getSelection();
        if (!sel || sel.isCollapsed)
          return [[], [], [], []];
        var doc = win.document;
        var LinkElts = [];
        var linkdocURLs = [];
        var linkURLs = [];
        var linkReferrerInfos = [];
        for (var i = 0; i < sel.rangeCount; i++) {
          var range = sel.getRangeAt(i);
          var fragment = range.cloneContents();
          var treeWalker = fragment.ownerDocument.createTreeWalker(fragment,
                           content.NodeFilter.SHOW_ELEMENT, null, true);
          while (treeWalker.nextNode()) {
            var node = treeWalker.currentNode;
            if ((node instanceof content.HTMLAnchorElement ||
                 node instanceof content.HTMLAreaElement) && node.href) {
              try {
                LinkElts.push(node);
                linkdocURLs.push(fragment.ownerDocument.location.href);
                linkURLs.push(node.href);
                let linkReferrerInfo = Cc["@mozilla.org/referrer-info;1"]
                  .createInstance(Ci.nsIReferrerInfo);
                linkReferrerInfo.initWithElement(node);
                linkReferrerInfos.push(this.E10SUtils.serializeReferrerInfo(
                                       linkReferrerInfo
                                   ));
              } catch(es) {}
            }
          }
        }
        return [LinkElts, linkURLs, linkdocURLs, linkReferrerInfos]
      },

      // func       // function object
      // args       array [string, string, ...]
      executeInChrome: function(func, args) {
        let json = {
          func : func.toString(),
          args : JSON.stringify(args)
        }
        //this.console.logStringMessage("this " + content);
        sendAsyncMessage("ucjsMouseGestures_executeInChrome",
              json
        );
      },

      dispatchEvent: function(event) {
        let targetSelector = event.target;
        if (targetSelector == "document") {
          content.document.dispatchEvent(new content.Event(event.type, event));
        } else {
          content.document.querySelector(targetSelector).
                  dispatchEvent(new content.Event(event.type, event));
        }
      },

      dispatchKeyEvent: function(targetSelector, type, bubbles, cancelable, /*viewArg, */
                             ctrlKey, altKey, shiftKey, metaKey, 
                             keyCode, charCode) {
        content.document.querySelector(targetSelector).dispatchEvent(new content.KeyboardEvent(
          type, 
          { bubbles : bubbles, cancelable : cancelable,
            ctrlKey  : ctrlKey,
            shiftKey : shiftKey,
            altKey   : altKey,
            metaKey  : metaKey,
            keyCode : keyCode, charCode : charCode
          })
        );
      }

    }; // end framescript
    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource() +
        ".init(" + navigator.platform.indexOf("Mac") + "," + 
         ucjsMouseGestures.enableWheelGestures + ");")
      , true); // Set the second parameter, allowDelayedLoad, to true, to automatically load the desired frame script in newly created browsers/tabs (of possibly newly created windows) as well. the third parameter, allow global access.
    delete framescript; 
  }
}
ucjsMouseGestures_framescript.init();














let ucjsMouseGestures_helper = {

  executeInContent: function(func) {
    try {
      let script = 'data:application/javascript;charset=utf-8,' +
                    encodeURIComponent('{let f = ' + func.toString() + '; f.apply(content, []);}');
      gBrowser.selectedBrowser.messageManager.loadFrameScript(script, false);

    } catch(ex) {
      Services.console.logStringMessage("Error in executeInContent : " /*+ ex*/);
    }
  },

  dispatchEvent: function(event) {
      gBrowser.selectedBrowser.messageManager
          .sendAsyncMessage("ucjsMouseGestures_dispatchEvent", event);
  },

  get tip() {
    if (this._tip !== undefined)
      return this._tip;
    this._tip = Cc["@mozilla.org/text-input-processor;1"]
                .createInstance(Ci.nsITextInputProcessor);
    return this._tip
  },
  //キーシーケンスをコンテントに送る
  sendKey: function(shift, ctrl, alt, meta, arryKey){
    if (!this.tip.beginInputTransactionForTests(window)) {
      return;
    }
    let keyEventShift, keyEventCtrl, keyEventAlt, keyEventMeta, keyEventS;
    if (shift) keyEventShift = new KeyboardEvent("", {key: "Shift", keyCode: KeyboardEvent.DOM_VK_SHIFT});
    if (ctrl) keyEventCtrl = new KeyboardEvent("", {key: "Control", keyCode: KeyboardEvent.DOM_VK_CONTROL});
    if (alt) keyEventAlt = new KeyboardEvent("", {key: "Alt", keyCode: KeyboardEvent.DOM_VK_ALT});
    if (meta) keyEventMeta = new KeyboardEvent("", {key: "Meta", keyCode: KeyboardEvent.DOM_VK_META});
    if (shift) this.tip.keydown(keyEventShift);
    if (ctrl) this.tip.keydown(keyEventCtrl);
    if (alt) this.tip.keydown(keyEventAlt);
    if (meta) this.tip.keydown(keyEventMeta);
    for (let i = 0; i < arryKey.length; i++) {
      keyEventS = new KeyboardEvent("", {key: arryKey[i].key, keyCode: arryKey[i].keycode});
      this.tip.keydown(keyEventS);
      this.tip.keyup(keyEventS);
    }
    if (meta) this.tip.keyup(keyEventMeta);
    if (alt) this.tip.keyup(keyEventAlt);
    if (ctrl) this.tip.keyup(keyEventCtrl);
    if (shift) this.tip.keyup(keyEventShift);
  },

  //キーをコンテントに送る
  dispatchKeyEvent: function(targetSelector, type, bubbles, cancelable, /*viewArg, */
                             ctrlKey, altKey, shiftKey, metaKey, 
                             keyCode, charCode) {

    let json = {
        targetSelector: targetSelector,
        type: type, 
        bubbles : bubbles, cancelable : cancelable, /*viewArg: viewArg, */
        ctrlKey  : ctrlKey,
        shiftKey : shiftKey,
        altKey   : altKey,
        metaKey  : metaKey,
        keyCode : keyCode, charCode : charCode
      }

    gBrowser.selectedBrowser.messageManager
            .sendAsyncMessage("ucjsMouseGestures_dispatchKeyEvent", json);
  },

  //ズームイン
  zoomIn: function() {
    if(/\.pdf$/.test(gBrowser.currentURI.spec)) {
      ucjsMouseGestures_helper.dispatchKeyEvent(
        "#zoomIn",
        "keydown", true, true,/*viewArg, */
        true, false, false, false,
        107, 0);
    } else {
      document.getElementById("cmd_fullZoomEnlarge").doCommand();
    }
  },
  //ズームアウト
  zoomOut: function() {
    if(/\.pdf$/.test(gBrowser.currentURI.spec)) {
      ucjsMouseGestures_helper.dispatchKeyEvent(
        "#zoomOut",/*viewArg, */
        "keydown", true, true,
        true, false, false, false,
        109, 0);
    } else {
      document.getElementById("cmd_fullZoomReduce").doCommand();
    }
  },
  //ズームリセット
  zoomReset: function() {
    if(/\.pdf$/.test(gBrowser.currentURI.spec)) {
      ucjsMouseGestures_helper.dispatchKeyEvent(
        "#scaleSelect",/*viewArg, */
        "keydown", true, true,
        true, false, false, false,
        96, 96);
    } else {
       document.getElementById("cmd_fullZoomReset").doCommand();
    }
  },


// commandsPopop() 
  commandsPopop: function(screenX, screenY) {
    let that = ucjsMouseGestures;

    if (typeof screenX == "undefined")
      screenX = that._lastX;
    if (typeof screenY == "undefined")
      screenY = that._lastY;

    if(document.getElementById("ucjsMouseGestures_popup")) {
      document.getElementById("mainPopupSet").
               removeChild(document.getElementById("ucjsMouseGestures_popup"));
    }
    let popup = document.createXULElement("menupopup");
    document.getElementById("mainPopupSet").appendChild(popup);
    popup.setAttribute("id", "ucjsMouseGestures_popup");
    popup.setAttribute("oncommand", "ucjsMouseGestures_helper.doCommand(event);");
    /*popup.setAttribute("onclick", "checkForMiddleClick(this, event);");*/

		for (let i =0; i < that.commands.length; i++) {
      let command = that.commands[i];
			let menuitem = document.createXULElement("menuitem");
			menuitem.setAttribute("label", command[1]);
			menuitem.setAttribute("acceltext", command[0]);
			menuitem.setAttribute("index", i);
			menuitem.index = i;
			popup.appendChild(menuitem);
		}

		let ratio = 1;
		let os = Cc["@mozilla.org/system-info;1"].getService(Ci.nsIPropertyBag2).getProperty("name");
		if (os == "Darwin") {
			ratio = popup.ownerDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
		            getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
		}
		popup.openPopupAtScreen(screenX * ratio, screenY * ratio, false);
  },
  doCommand: function(aEvent) {
    let index = aEvent.target.getAttribute("index");
    ucjsMouseGestures.commands[index][2](aEvent);
  },


  // Closed Tabs Popup
    closedTabsPopup: function(screenX, screenY) {
    let that = ucjsMouseGestures;

    if (typeof screenX == "undefined")
      screenX = that._lastX;
    if (typeof screenY == "undefined")
      screenY = that._lastY;

    if(document.getElementById("ucjsMouseGestures_popup")) {
      document.getElementById("mainPopupSet").
               removeChild(document.getElementById("ucjsMouseGestures_popup"));
    }
    let popup = document.createXULElement("menupopup");
    document.getElementById("mainPopupSet").appendChild(popup);

    let ss = SessionStore;

    populatePopup(popup);

		let ratio = 1;
		let os = Cc["@mozilla.org/system-info;1"].getService(Ci.nsIPropertyBag2).getProperty("name");
		if (os == "Darwin") {
			ratio = popup.ownerDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
		            getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
		}
		popup.openPopupAtScreen(screenX * ratio, screenY * ratio, false);

		function populatePopup(undoPopup) {

      // remove existing menu items
      while (undoPopup.hasChildNodes())
        undoPopup.removeChild(undoPopup.firstChild);

      // "Open All in Tabs"
      m = undoPopup.appendChild(document.createXULElement("menuitem"));
      m.setAttribute("label", "Restore All Tabs");
      //m.setAttribute("class", "menuitem-iconic bookmark-item");
      m.setAttribute("accesskey", "R" /*strings.getString("menuRestoreAllTabs.accesskey")*/);
      m.addEventListener("command", function() {
        for (let i = 0; i < undoItems.length; i++)
          undoCloseTab();
      }, false);

      undoPopup.appendChild(document.createXULElement("menuseparator"));

      // populate menu
      let undoItems = ss.getClosedTabDataForWindow(window);
      for (let i = 0; i < undoItems.length; i++) {
        var entries = undoItems[i].state.entries;
        var tooltiptext = "";
        for (let j = entries.length - 1; j > -1; j--){
          if (j != entries.length - 1)
            tooltiptext += "\n";
          tooltiptext += parseInt(j + 1, 10) + ". " + entries[j].title;
        }
        let m = document.createXULElement("menuitem");
        m.setAttribute("tooltiptext", tooltiptext);
        m.setAttribute("label", undoItems[i].title);
        if (undoItems[i].image)
          m.setAttribute("image", undoItems[i].image);
        m.setAttribute("class", "menuitem-iconic bookmark-item");
        m.setAttribute("value", i);
        m.setAttribute("oncommand", "undoCloseTab(" + i + ");");
        /*m.setAttribute("onclick", "ucjsMouseGestures_helper._undoCloseMiddleClick(event);");*/
        if (i == 0)
          m.setAttribute("key", "key_undoCloseTab");
        undoPopup.appendChild(m);
      }

      // "Clear undo close tb list"
      undoPopup.appendChild(document.createXULElement("menuseparator"));

      m = undoPopup.appendChild(document.createXULElement("menuitem"));
      m.setAttribute("label", "Clear undo close tab list");
      m.setAttribute("accesskey", "C");
      m.addEventListener("command", function() {
        let max_undo = Services.prefs.getIntPref("browser.sessionstore.max_tabs_undo", 10);
        Services.prefs.setIntPref("browser.sessionstore.max_tabs_undo", 0);
        Services.prefs.setIntPref("browser.sessionstore.max_tabs_undo", "int", max_undo);
        if (max_undo != Services.prefs.getIntPref("browser.sessionstore.max_tabs_undo", 10))
          Services.prefs.setIntPref("browser.sessionstore.max_tabs_undo", max_undo);
      }, false);
    }

  },
  _undoCloseMiddleClick: function PHM__undoCloseMiddleClick(aEvent) {
    if (aEvent.button != 1)
      return;

    undoCloseTab(aEvent.originalTarget.value);
    gBrowser.moveTabToEnd();
    if (!aEvent.ctrlKey)
      aEvent.target.parentNode.hidePopup();
  },



  
  // Session History popup
  sessionHistoryPopup: function(screenX, screenY) {
    let that = ucjsMouseGestures;

    if (typeof screenX == "undefined")
      screenX = that._lastX;
    if (typeof screenY == "undefined")
      screenY = that._lastY;

    const MAX_HISTORY_MENU_ITEMS = 15;
    const tooltipBack = gNavigatorBundle.getString("tabHistory.goBack");
    const tooltipCurrent = gNavigatorBundle.getString("tabHistory.reloadCurrent");
    const tooltipForward = gNavigatorBundle.getString("tabHistory.goForward");

    if(document.getElementById("ucjsMouseGestures_popup")) {
      document.getElementById("mainPopupSet").
               removeChild(document.getElementById("ucjsMouseGestures_popup"));
    }
    let aParent = document.createXULElement("menupopup");
    document.getElementById("mainPopupSet").appendChild(aParent);
    aParent.setAttribute("id", "ucjsMouseGestures_popup");
    aParent.setAttribute("oncommand", "BrowserCommands.gotoHistoryIndex(event); event.stopPropagation();");
    /*aParent.setAttribute("onclick", "checkForMiddleClick(this, event);");*/
    aParent.setAttribute("context", "");
    let children = aParent.children;

    // If session history in parent is available, use it. Otherwise, get the session history
    // from session store.
    let sessionHistory = gBrowser.selectedBrowser.browsingContext.sessionHistory;
    if (sessionHistory?.count) {
      // Don't show the context menu if there is only one item.
      if (sessionHistory.count <= 1) {
        return false;
      }

      updateSessionHistory(sessionHistory, true, true);
    } else {
      sessionHistory = SessionStore.getSessionHistory(
        gBrowser.selectedTab,
        updateSessionHistory
      );
      updateSessionHistory(sessionHistory, true, false);
    }
  	let ratio = 1;
  	let os = Cc["@mozilla.org/system-info;1"].getService(Ci.nsIPropertyBag2).getProperty("name");
  	if (os == "Darwin") {
  		ratio = aParent.ownerDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
  	            getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
  	}
  	aParent.openPopupAtScreen(screenX * ratio, screenY * ratio, false);

    function updateSessionHistory(sessionHistory, initial, ssInParent) {
      let count = ssInParent
        ? sessionHistory.count
        : sessionHistory.entries.length;

      if (!initial) {
        if (count <= 1) {
          // if there is only one entry now, close the popup.
          aParent.hidePopup();
          return;
        } else if (aParent.id != "backForwardMenu" && !aParent.parentNode.open) {
          // if the popup wasn't open before, but now needs to be, reopen the menu.
          // It should trigger FillHistoryMenu again. This might happen with the
          // delay from click-and-hold menus but skip this for the context menu
          // (backForwardMenu) rather than figuring out how the menu should be
          // positioned and opened as it is an extreme edgecase.
          aParent.parentNode.open = true;
          return;
        }
      }

      let index = sessionHistory.index;
      let half_length = Math.floor(MAX_HISTORY_MENU_ITEMS / 2);
      let start = Math.max(index - half_length, 0);
      let end = Math.min(
        start == 0 ? MAX_HISTORY_MENU_ITEMS : index + half_length + 1,
        count
      );
      if (end == count) {
        start = Math.max(count - MAX_HISTORY_MENU_ITEMS, 0);
      }

      let existingIndex = 0;

      for (let j = end - 1; j >= start; j--) {
        let entry = ssInParent
          ? sessionHistory.getEntryAtIndex(j)
          : sessionHistory.entries[j];
        // Explicitly check for "false" to stay backwards-compatible with session histories
        // from before the hasUserInteraction was implemented.
        if (
          BrowserUtils.navigationRequireUserInteraction &&
          entry.hasUserInteraction === false &&
          // Always allow going to the first and last navigation points.
          j != end - 1 &&
          j != start &&
          // Always display the current entry
          j != index
        ) {
          continue;
        }
        let uri = ssInParent ? entry.URI.spec : entry.url;

        let item =
          existingIndex < children.length
            ? children[existingIndex]
            : document.createXULElement("menuitem");

        item.setAttribute("uri", uri);
        item.setAttribute("label", entry.title || uri);
        item.setAttribute("index", j);

        // Cache this so that BrowserCommands.gotoHistoryIndex doesn't need the
        // original index
        item.setAttribute("historyindex", j - index);

        if (j != index) {
          // Use list-style-image rather than the image attribute in order to
          // allow CSS to override this.
          item.style.listStyleImage = `url(page-icon:${uri})`;
        }

        if (j < index) {
          item.className =
            "unified-nav-back menuitem-iconic menuitem-with-favicon";
          item.setAttribute("tooltiptext", tooltipBack);
        } else if (j == index) {
          item.setAttribute("type", "radio");
          item.setAttribute("checked", "true");
          item.className = "unified-nav-current";
          item.setAttribute("tooltiptext", tooltipCurrent);
        } else {
          item.className =
            "unified-nav-forward menuitem-iconic menuitem-with-favicon";
          item.setAttribute("tooltiptext", tooltipForward);
        }

        if (!item.parentNode) {
          aParent.appendChild(item);
        }

        existingIndex++;
      }

      if (!initial) {
        let existingLength = children.length;
        while (existingIndex < existingLength) {
          aParent.removeChild(aParent.lastElementChild);
          existingIndex++;
        }
      }
    }
  },

  // Web search selected text with search engins popup
  webSearchPopup: function(aText, screenX, screenY) {
    Services.search.init().then(rv => { 
      if (Components.isSuccessCode(rv)) {
        this._webSearchPopupBuild(aText, screenX, screenY);
      }
    });
  },

  _webSearchPopupBuild: async function(aText, screenX, screenY) {
    this.text = aText;
    let that = ucjsMouseGestures;

    if (typeof screenX == "undefined")
      screenX = that._lastX;
    if (typeof screenY == "undefined")
      screenY = that._lastY;
    let searchSvc = Services.search;
		let engines = await searchSvc.getVisibleEngines({});
		if (engines.length < 1)
			throw "No search engines installed.";

    if(document.getElementById("ucjsMouseGestures_popup")) {
      document.getElementById("mainPopupSet").
               removeChild(document.getElementById("ucjsMouseGestures_popup"));
    }
    let popup = document.createXULElement("menupopup");
    document.getElementById("mainPopupSet").appendChild(popup);
    popup.setAttribute("id", "ucjsMouseGestures_popup");
    popup.setAttribute("oncommand", "ucjsMouseGestures_helper._loadSearch(event);");
    /*popup.setAttribute("onclick", "checkForMiddleClick(this, event);");*/
    popup.setAttribute("style", "width:300px");

		for (let i = engines.length - 1; i >= 0; --i) {
			let menuitem = document.createXULElement("menuitem");
			menuitem.setAttribute("label", engines[i].name);
			menuitem.setAttribute("class", "menuitem-iconic searchbar-engine-menuitem menuitem-with-favicon");
			menuitem.setAttribute("image", await engines[i].getIconURL());
			popup.insertBefore(menuitem, popup.firstChild);
			menuitem.engine = engines[i];
		}

    // 'Search for "hogehoge..."'
    if (!!this.text) {
      let sep = document.createXULElement("menuseparator");
      sep.setAttribute("style", "margin-inline-start: -28px;margin-top: -4px;");
      popup.insertBefore(sep, popup.firstChild);
  		let toolbar = document.createXULElement("toolbar");
      let label = document.createXULElement("label");
      let ellipsis = "\u2026";
      try {
        ellipsis = Services.prefs.getComplexValue("intl.ellipsis",
                                                       Ci.nsIPrefLocalizedString).data;
      } catch (e) { }
      let selectedText = this.text;
      if (selectedText.length > 15) {
        let truncLength = 15;
        let truncChar = selectedText[15].charCodeAt(0);
        if (truncChar >= 0xDC00 && truncChar <= 0xDFFF)
          truncLength++;
        selectedText = selectedText.substr(0, truncLength) + ellipsis;
      }
      label.setAttribute("value" , "Search for \"" + selectedText + "\"");
      toolbar.appendChild(label);
      popup.insertBefore(toolbar, popup.firstChild);
    }

		let ratio = 1;
		let os = Cc["@mozilla.org/system-info;1"].getService(Ci.nsIPropertyBag2).getProperty("name");
		if (os == "Darwin") {
			ratio = popup.ownerDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
		            getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
		}
		popup.openPopupAtScreen(screenX * ratio, screenY * ratio, false);
  },
  _loadSearch: function(event) {
		let engine = event.target.engine;
		if (!engine)
			return;
		let submission = engine.getSubmission(this.text, null);
		if (!submission)
			return;

		//gBrowser.loadOneTab(submission.uri.spec, {
		gBrowser.addTab(submission.uri.spec, {
			postData: submission.postData,
			relatedToCurrent: true,
			inBackground: (event.button == 1 || event.ctrlKey) ? true: false,
      triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
		});
  },
  _loadSearchWithDefaultEngine: async function(text, inBackground) {
		let engine = await Services.search.getDefault();
		if (!engine)
			return;
		let submission = engine.getSubmission(text, null);
		if (!submission)
			return;

		//gBrowser.loadOneTab(submission.uri.spec, {
		gBrowser.addTab(submission.uri.spec, {
			postData: submission.postData,
			relatedToCurrent: true,
			inBackground: inBackground,
      triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
		});
  },

  // 再起動
  restart: function() {
    let cancelQuit = Cc["@mozilla.org/supports-PRBool;1"].
                     createInstance(Ci.nsISupportsPRBool);
    Services.obs.notifyObservers(cancelQuit, "quit-application-requested", "restart");
    if (cancelQuit.data)
      return;
    let XRE = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
    if (typeof XRE.invalidateCachesOnRestart == "function")
      XRE.invalidateCachesOnRestart();
    let appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].
                     getService(Ci.nsIAppStartup);
    appStartup.quit(Ci.nsIAppStartup.eAttemptQuit |  Ci.nsIAppStartup.eRestart);
  },

  // ブラウザコンソールを開く
  openBrowserConsole: function() {
    document.getElementById("menu_browserConsole").doCommand();
  },

  // ホバーしたリンクをすべて保存
  saveHoverLinks: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      this.saveLinks(that._linkURLs, that._linkReferrerInfos)
		}, 500);
  },
  
  // 選択範囲のリンクをすべて保存
  saveSelectedLinks: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      this.saveLinks(that._selLinkURLs, that._selLinkReferrerInfos)
		}, 500);
  },

  // リンクを保存
  saveLink: function(aLinkURL, aLinkReferrerInfo) {
    let that = ucjsMouseGestures;
    if (typeof(aLinkReferrerInfo) == "string") {
      try {
        aLinkReferrerInfo = new ReferrerInfo(
          Ci.nsIReferrerInfo.EMPTY,
          true,
          aLinkReferrerInfo
        )
      } catch(ex){}
    }
    else if (typeof aLinkReferrerInfo == "undefined")
      aLinkReferrerInfo = that._referrerInfo;

    //saveURL(aURL, aOriginalURL, aFileName, aFilePickerTitleKey, aShouldBypassCache,
    //        aSkipPrompt, aReferrerInfo, aCookieJarSettings,
    //        aSourceDocument,
    //        aIsContentWindowPrivate,
    //        aPrincipal)
    saveURL(aLinkURL, null, aLinkURL, null, true,
            true,
            aLinkReferrerInfo, //referrerInfo
            that._cookieJarSettings, //cookieJarSettings
            null,
            PrivateBrowsingUtils.isWindowPrivate(window),
            Services.scriptSecurityManager.createNullPrincipal({}));
  },

  // リンクをすべて保存
  saveLinks: function(aLinkURLs, aLinkReferrerInfos) {
    for (let i = 0; i < aLinkURLs.length; i++) {
      let linkURL = aLinkURLs[i];
      if (!linkURL)
        continue;
      let linkReferrerInfo = null;
      if (Array.isArray(aLinkReferrerInfos)) {
        try {
          linkReferrerInfo = aLinkReferrerInfos[i];
        } catch(e) {}
      }
      this.saveLink(linkURL, linkReferrerInfo);
    }
  },

  getImageInfo: function(aURL) {
    try {
      aURL = Services.io.newURI(aURL);
      var imageCache = Cc["@mozilla.org/image/tools;1"]
                         .getService(Ci.imgITools)
                         .getImgCacheForDocument(null);
      var props =
        imageCache.findEntryProperties(aURL);
    } catch (e) {
    }
    let aContentType = aContentDisp = "";
    if (props) {
      try {
        aContentType = props.get("type",  Ci.nsISupportsCString).data;
      } catch (e) {
        aContentType = "image/jpeg"
      }
      try {
        aContentDisp = props.get(
          "content-disposition",
          Ci.nsISupportsCString
        ).data;
      } catch (e) {
      }
    }
    return [aContentType, aContentDisp];
  },


  // 画像を保存
  saveImage: function(src, referrerInfo, aContentType, aContentDisp) {
    let that = ucjsMouseGestures;
    if (typeof(referrerInfo) == "string") {
      try {
        referrerInfo = new ReferrerInfo(
          Ci.nsIReferrerInfo.EMPTY,
          true,
          referrerInfo
        )
      } catch(ex){}
    }
    else if (typeof referrerInfo == "undefined")
      referrerInfo = that._referrerInfo;
Services.console.logStringMessage("aContentType " + aContentType);
    if (typeof aContentType == "undefined")
      [aContentType, aContentDisp] = this.getImageInfo(src);

    internalSave(
      that._imgSRC, // dataURL
      null, // aOriginalURL
      null, // aDocument
      null, // aFilename
      aContentDisp, // content disposition
      aContentType, // content type - keep in sync with ContextMenuChild!
      false, // skip cache or not
       "SaveImageTitle", // FilePickerTitleKey
      null, // chosen data
      referrerInfo, //referrerInfo
      that._cookieJarSettings, //cookieJarSettings
      null, // initiating doc
      false, // don't skip prompt for where to save
      null, // cache key
      PrivateBrowsingUtils.isWindowPrivate(window),
      Services.scriptSecurityManager.createNullPrincipal({})
    );
  },

  // textをクリップボードにコピー
  copyText: function(text) {
    let clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
    clipboard.copyString(text);
  },

  // ホバーしたリンクをすべてクリップボードにコピー
  copyHoverLinks: function() {
    let that = ucjsMouseGestures;
    let newLine = navigator.platform.indexOf("Win") ? "\r\n" : "\n";
    setTimeout(() => {
  		let urls = that._linkURLs.join(newLine);
  		if (that._linkURLs.length > 1)
  			urls += newLine;
  		let clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
  		clipboard.copyString(urls);
		}, 500);
  },

  // 選択範囲のリンクをすべてクリップボードにコピー
  copySelectedLinks: function() {
    let that = ucjsMouseGestures;
    let newLine = navigator.platform.indexOf("Win") ? "\r\n" : "\n";
    setTimeout(() => {
  		let urls = that._selLinkURLs.join(newLine);
  		if (that._selLinkURLs.length > 1)
  			urls += newLine;
  		let clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
  		clipboard.copyString(urls);
		}, 500);
  },

  // URLを開く
  loadURI: function(url) {
		/*
		loadURI(url, null, null, false,
		        null, null, false, false,
		        Services.scriptSecurityManager.createContentPrincipal(
		          Services.io.newURI(url),
		          {}
		        ),
		        false, null);
    */
    openLinkIn(url, "current", {
        allowThirdPartyFixup: false,
        triggeringPrincipal: Services.scriptSecurityManager.createContentPrincipal(
          Services.io.newURI(url),
          {}
        )
      });
  },

  // ひとつ上の階層へ移動
	goUpperLevel: function() {
		let uri = gBrowser.currentURI;
		if (uri.schemeIs("about")) {
      this.loadURI("about:about");
			return;
		}
		let path = uri.spec.slice(uri.prePath.length)
		if (path == "/") {
			if (/:\/\/[^\.]+\.([^\.]+)\./.test(uri.prePath))
      this.loadURI(RegExp.leftContext + "://" + RegExp.$1 + "." + RegExp.rightContext + "/");
			return;
		}
		let pathList = path.split("/");
		if (!pathList.pop())
			pathList.pop();
		this.loadURI(uri.prePath + pathList.join("/") + "/");
	},

  // 数値を増減して移動
	goNumericURL: function(aIncrement) {
		let url = gBrowser.currentURI.spec;
		if (!url.match(/(\d+)(\D*)$/))
			throw "No numeric value in URL";
		let num = RegExp.$1;
		let digit = (num.charAt(0) == "0") ? num.length : null;
		num = parseInt(num, 10) + aIncrement;
		if (num < 0)
			throw "Cannot decrement number in URL anymore";
		num = num.toString();
		digit = digit - num.length;
		for (let i = 0; i < digit; i++)
			num = "0" + num;
		this.loadURI(RegExp.leftContext + num + RegExp.$2);
	},

  // 選択範囲のテキストリンクをすべてタブに開く(選択範囲にリンク文字が無い場合は規定の検索エンジンで検索)
	openURLsInSelection: function() {
    let that = ucjsMouseGestures;
		let sel = that._selectedTXT;
		if (!sel)
			throw "No selection";
		let URLs = [];
		sel.split(/\s/).forEach((str) => {
			let arrUrl = str.match(/((((h?t)?tps?|h..ps?)(:\/\/))?[a-zA-Z0-9+$;?.%,!#~*/:@&=_-]+)/ig);
			if (!arrUrl)
			  return;
			for(let i = 0; i < arrUrl.length; i++) {
  			if (!arrUrl[i] || arrUrl[i].indexOf(".") < 0 || arrUrl[i].length < 8)
  				continue;
        // ttp等を http等に
        let url = arrUrl[i].replace(/^(ttp|tp|h..p):\/\//i,'http://');
        const URIFixup = Services.uriFixup;
        let uri = URIFixup.getFixupURIInfo(
                  url,
                  URIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP )?.fixedURI;
        if(!uri) continue;
        // if(!isValidTld(uri) continue; //todo
  			URLs.push(uri.spec);
  	  }
		});
		if (URLs.length > 0)
			this.openURLs(URLs);
		else
      ucjsMouseGestures_helper._loadSearchWithDefaultEngine(sel, true);
  },

  // ホバーしたリンクをすべてタブで開く
  openHoverLinksInTabs: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      ucjsMouseGestures_helper.openURLs(that._linkURLs, that._linkReferrerInfos);
    }, 500);
  },

  // 選択範囲のリンクをすべてタブに開く
  openSelectedLinksInTabs: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      ucjsMouseGestures_helper.openURLs(that._selLinkURLs, that._selLinkReferrerInfos);
    }, 500);
  },

  // リンクをすべてタブに開く
  openURLs: function(linkURLs, linkReferrerInfos = null, inBackground = true) {
      for (let i = 0; i < linkURLs.length; i++) {
        let linkURL = linkURLs[i];
        if (!linkURL)
          continue;

        let linkReferrerInfo = null;
        if (typeof(linkReferrerInfos) == "string") {
          try {
            linkReferrerInfo = new ReferrerInfo(
              Ci.nsIReferrerInfo.EMPTY,
              true,
              linkReferrerInfos
            )
          } catch(ex){}
        }
        else if (Array.isArray(linkReferrerInfos)) {
          try {
            linkReferrerInfo = linkReferrerInfos[i];
          } catch(e) {}
        }
        let param = {
            relatedToCurrent: true,
            referrerInfo: linkReferrerInfo,
            inBackground: inBackground,
      			triggeringPrincipal:
      			  Services.scriptSecurityManager.createContentPrincipal(
      			    Services.io.newURI(linkURL),
      			    gBrowser.selectedBrowser.contentPrincipal.originAttributes
      			  )
      	};
        //gBrowser.loadOneTab(linkURL, param);
        gBrowser.addTab(linkURL, param);
      }
  },

  // 左側または右側のタブをすべて閉じる
	closeMultipleTabs: function(aLeftRight) {
    let aTab = gBrowser.selectedTab;
    if (aLeftRight != "left") {
      gBrowser.removeTabsToTheEndFrom(aTab);
      return;
    }
    
    let tabs = this.getTabsToTheStartFrom(aTab);

    let shouldPrompt = Services.prefs.getBoolPref("browser.tabs.warnOnCloseOtherTabs");
    if (tabs.length > 1 && shouldPrompt) {
      let ps = Services.prompt;
      let ret = ps.confirm(window, 
                "Confirm close",
                "You are about to close " + tabs.length +
                " tabs. Are you sure you want to continue?")
      if (!ret) {
        return;
      }
    }
    for (let i = tabs.length - 1; i >= 0; --i) {
      gBrowser.removeTab(tabs[i]);
    }
  },
  getTabsToTheStartFrom: function(aTab) {
    let tab;
    if (!!aTab.multiselected) {
      // In a multi-select context, pick the leftmost
      // selected tab as reference.
      let selectedTabs = gBrowser.selectedTabs;
      tab = selectedTabs[0];
    } else {
      tab = aTab;
    }

    let tabsToStart = [];
    let tabs = gBrowser.visibleTabs;
    for (let i = 0; i < tabs.length; ++i) {
      if (tabs[i] == tab )
        break;

      if (!tabs[i].pinned) {
        tabsToStart.push(tabs[i]);
      }
    }
    return tabsToStart;
  },

  // open uri from Container Popup
  openLinkInContainerTab: function(url = "", inBackground = true, relatedToCurrent = true, screenX, screenY) {
    let that = ucjsMouseGestures;

    if (typeof screenX == "undefined")
      screenX = that._lastX;
    if (typeof screenY == "undefined")
      screenY = that._lastY;

    if(document.getElementById("ucjsMouseGestures_popup")) {
      document.getElementById("mainPopupSet").
               removeChild(document.getElementById("ucjsMouseGestures_popup"));
    }
    let popup = document.createXULElement("menupopup");
    document.getElementById("mainPopupSet").appendChild(popup);
    popup.setAttribute("id", "ucjsMouseGestures_popup");
    // ucjsMouseGestures_helper.openLinkInTabFromContainerMenu(event, url, inBackground, relatedToCurrent)
    popup.setAttribute("oncommand", "ucjsMouseGestures_helper.openLinkInTabFromContainerMenu(event, '" + url + "', " + inBackground + ", " + relatedToCurrent +");");
   
    let createMenuOptions = {
      isContextMenu: true,
      showDefaultTab: true,
      excludeUserContextId: null, //gBrowser.selectedBrowser.contentPrincipal.userContextId
    };
    this.createUserContextMenu(popup, createMenuOptions);
    
		let ratio = 1;
		let os = Cc["@mozilla.org/system-info;1"].getService(Ci.nsIPropertyBag2).getProperty("name");
		if (os == "Darwin") {
			ratio = popup.ownerDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
		            getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
		}
		popup.openPopupAtScreen(screenX * ratio, screenY * ratio, false);
  },

  openLinkInTabFromContainerMenu: function(event, url = "", inBackground = true, relatedToCurrent = true) {
    let that = ucjsMouseGestures;
    let linkURL = (url != "") ? url : (that._linkURL || that._docURL); // link url or docment url
    let param = {
      relatedToCurrent: relatedToCurrent,
      inBackground: inBackground,
			triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({}),
		  userContextId: parseInt(event.target.getAttribute("data-usercontextid")),
    };

    //gBrowser.loadOneTab(linkURL, param);
    gBrowser.addTab(linkURL, param);
  },

  createUserContextMenu: function(
    popup,
    {
      isContextMenu = false,
      excludeUserContextId = 0,
      showDefaultTab = false,
      useAccessKeys = true,
    } = {}
  ) {

    let bundle = Services.strings.createBundle(
      "chrome://browser/locale/browser.properties"
    );
    let docfrag = document.createDocumentFragment();

    // If we are excluding a userContextId, we want to add a 'no-container' item.
    if (excludeUserContextId || showDefaultTab) {
      let menuitem = document.createXULElement("menuitem");
      menuitem.setAttribute("data-usercontextid", "0");
      menuitem.setAttribute(
        "label",
        bundle.GetStringFromName("userContextNone.label")
      );
      menuitem.setAttribute(
        "accesskey",
        bundle.GetStringFromName("userContextNone.accesskey")
      );

      // We don't set an oncommand/command attribute because if we have
      // to exclude a userContextId we are generating the contextMenu and
      // isContextMenu will be true.

      docfrag.appendChild(menuitem);

      let menuseparator = document.createXULElement("menuseparator");
      docfrag.appendChild(menuseparator);
    }

    ContextualIdentityService.getPublicIdentities().forEach(identity => {
      if (identity.userContextId == excludeUserContextId) {
        return;
      }

      let menuitem = document.createXULElement("menuitem");
      menuitem.setAttribute("data-usercontextid", identity.userContextId);
      menuitem.setAttribute(
        "label",
        ContextualIdentityService.getUserContextLabel(identity.userContextId)
      );

      if (identity.accessKey && useAccessKeys) {
        menuitem.setAttribute(
          "accesskey",
          bundle.GetStringFromName(identity.accessKey)
        );
      }

      menuitem.classList.add("menuitem-iconic");
      menuitem.classList.add("identity-color-" + identity.color);
      menuitem.classList.add("identity-icon-" + identity.icon);

      docfrag.appendChild(menuitem);
    });

    popup.appendChild(docfrag);
    return true;
  },

}
