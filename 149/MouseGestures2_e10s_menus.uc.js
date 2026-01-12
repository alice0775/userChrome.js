// ==UserScript==
// @name          Mouse Gestures command file (with Wheel Gesture and Rocker Gesture)
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Commands for Lightweight customizable mouse gestures. Add Reload and Edit commands menu
// @include       main
// @charset       UTF-8
// @author        Alice0775
// @compatibility  Firefox 148
// @version        2026/01/08 fix bug 
// @version        2026/01/07 Bug 2008041 - Make XUL disabled / checked attributes html-style boolean attributes.
// @version        2025/07/01 23:50 fix CSS切り替え
// @version        2025/03/22 Bug 1950904
// @version        2025/02/10 18:00 fix bug
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version       2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version       2024/05/10 Bug 1880914 - Move Browser* helper functions used from global menubar and similar commands to a single object in a separate file, loaded as-needed
// @version       2024/05/05 Bug 1892965 - Rename Sidebar launcher and SidebarUI
// @version       2023/09/07 remove to use nsIScriptableUnicodeConverter
// @version       2021/04/11 12:00 workaround 選択テキストで検索 Bug 360332
// @version       2020/12/19 15:00 fix typo
// @version       2020/11/29 20:00 add コンテナータブを指定してリンクを開く
// @version       2020/08/17 16:00 HighlightAll extension のトグル 方法 (Firefox userChrome.js greasemonkeyスクリプトｽﾚ41 595)
// @version       2020/01/20 00:00 fix 'Home'
// @version       2019/10/22 09:00 fix 71.0 fix web search

// @version       2019/10/22 08:00 fix 70.0 fix web search Bug 1587803 - Check BrowserContentHandler.jsm doSearch uses the right engine
// @version       2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version       2019/01/21 01:00 reloadAllTabs to reloadTabs
// @version       2018/09/30 03:00 add dispatchEvent command( dispatch event to content from chrome)
// @version       2018/09/29 19:00 support zoomIn/Out/Reset for pdf.js
// @version       2018/09/29 01:00 add commands list (commands popop, toggle style)
// @version       2018/09/29 00:00 fix commands list (missing arguments webSearchPopup)
// @version       2018/09/29 00:00 add commands list ("Closed Tabs Popup" and "Session History Popup")
// @version       2018/09/28 23:20 fix, reload commands should be for all browser
// @version       2018/09/28 22:50 fix bug forgot to overwrite
// @version       2018/09/28 22:50 fix bug
// @version       2018/09/28 22:00
// ==/UserScript==
// @note          MouseGestures2_e10s.uc.jsより後で読み込むようにしておく
// @note          このファイルで定義されたコマンドでMouseGestures2_e10s.uc.jsの定義を上書きします
// @note          This overwrites the command in the MouseGestures2_e10s.uc.js file // @note          Linux and Mac are not supported.

ucjsMouseGestures_menues = {
  defCommands: function() {

    // == config ==
    // This overwrites the command in the MouseGestures2_e10s.uc.js file 
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

    try {
    ucjsMouseGestures.commands =
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

        ['UL', '前のタブ', function(){ setTimeout(() => {gBrowser.tabContainer.advanceSelectedTab(-1, true);}, 0); } ],
        ['UR', '次のタブ', function(){ setTimeout(() => {gBrowser.tabContainer.advanceSelectedTab(+1, true);}, 0); } ],
        ['ULR', '直前に選択していたタブ', function(){ setTimeout(() => {ucjsNavigation_tabFocusManager?.advancedFocusTab(-1);}, 0); } ],
        ['URL', '直前に選択していたタブを一つ戻る', function(){ setTimeout(() => {ucjsNavigation_tabFocusManager?.advancedFocusTab(1);}, 0); } ],

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
            gBrowser.moveTabTo(newTab, {tabIndex: orgTab._tPos + 1});
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

        ['RU', '上端へスクロール', function(){ goDoCommand("cmd_scrollTop"); } ],
        ['RD', '下端へスクロール', function(){ goDoCommand("cmd_scrollBottom"); } ],
/*
        ['RU', '上端へスクロール', function(){ goDoCommand("cmd_moveTop"); } ],
        ['RD', '下端へスクロール', function(){ goDoCommand("cmd_moveBottom"); } ],
*/
        ['U', '上へスクロール', function(){ goDoCommand("cmd_scrollPageUp"); } ],
        ['D', '下へスクロール', function(){ goDoCommand("cmd_scrollPageDown"); } ],

        ['W-', 'ズームイン', function(){ ucjsMouseGestures_helper.zoomIn(); } ],
        ['W+', 'ズームアウト', function(){ ucjsMouseGestures_helper.zoomOut(); } ],
        [''/*'L<R'*/, 'ズームリセット', function(){ ucjsMouseGestures_helper.zoomReset(); } ],

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
            let searchbar = Services.prefs.getBoolPref("browser.search.widget.new", false) ? document.getElementById('searchbar-new') : document.getElementById('searchbar');
            if (searchbar) {
              searchbar.value = ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT;
              searchbar.setAttribute("usertyping", "");
              searchbar.setAttribute("focused", "");
              try {searchbar.updateGoButtonVisibility();} catch(ex) {};
            }
          } ],
        ['', '選択テキストを検索バーに追加',
          function(){ 
            let searchbar = Services.prefs.getBoolPref("browser.search.widget.new", false) ? document.getElementById('searchbar-new') : document.getElementById('searchbar');
            if (searchbar.value){
              searchbar.value = searchbar.value + " " +
                     (ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT);
              searchbar.setAttribute("usertyping", "");
              searchbar.setAttribute("focused", "");
              try {searchbar.updateGoButtonVisibility();} catch(ex) {};
            }else{
              searchbar.value = ucjsMouseGestures._selectedTXT ||
                                              ucjsMouseGestures._linkTXT;
              searchbar.setAttribute("usertyping", "");
              searchbar.setAttribute("focused", "");
              try {searchbar.updateGoButtonVisibility();} catch(ex) {};
            }
          } ],
        ['', '検索バー（Web検索ボックス）をクリア',
          function(){
            let searchbar = Services.prefs.getBoolPref("browser.search.widget.new", false) ? document.getElementById('searchbar-new') : document.getElementById('searchbar');
            searchbar.value = "";
            searchbar.removeAttribute("usertyping");
            searchbar.removeAttribute("focused");
            try {searchbar.updateGoButtonVisibility();} catch(ex) {};
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

        ['LU', 'Built-in Translate page to Japanese and restore original',
          async function(event){
            if (ucjsMouseGestures._selectedTXT.length !== 0) {
              const translationsLangPairPromise =
                window.SelectTranslationsPanel.getLangPairPromise(ucjsMouseGestures._selectedTXT);
              window.SelectTranslationsPanel.open(
                event,
                ucjsMouseGestures._lastX,
                ucjsMouseGestures._lastY,
                ucjsMouseGestures._selectedTXT,
                !(ucjsMouseGestures._selectedTXT.length === 0),
                translationsLangPairPromise
              ).catch(console.error);
            } else {
              const actor = TranslationsParent.getTranslationsActor(
                gBrowser.selectedBrowser
              );
              if (!actor.languageState.hasVisibleChange) {
                const detectedLang = await actor.getDetectedLanguages();
                if (!detectedLang) {
                  throw new Error("Expected to have a document language tag.");
                }
                if (!detectedLang.isDocLangTagSupported) {
                  throw new Error("language is not supported.");
                }
                const [sourceLanguage, sourceVariant] = (detectedLang.docLangTag).split(",");
                let [targetLanguage, targetVariant] = "ja".split(",");
                if (sourceLanguage == "ja") {
                  [targetLanguage, targetVariant] = "en".split(",");
                }
                actor.translate(
                  { sourceLanguage, targetLanguage, sourceVariant, targetVariant },
                  false // reportAsAutoTranslate
                );
              } else {
                const { docLangTag } = await actor.getDetectedLanguages();
                if (!docLangTag) {
                  throw new Error("Expected to have a document language tag.");
                }
                actor.restorePage(docLangTag);
              }
            }
          } ],

        ['', 'TWP - Translate selected text「Ctrl+Alt+S」',
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

        ['LDR', '選択テキストをDeepLで翻訳', function() {
            let text = ucjsMouseGestures._selectedTXT;
            if (!text) return;
            let actor = gBrowser.selectedBrowser.browsingContext.currentWindowGlobal.getActor("DLTranslator");
            actor.sendAsyncMessage("DLT:CreatePopup", {
                sourceText: ucjsMouseGestures._selectedTXT,
                fromLang: null,
                toLang: null,
                screenX: ucjsMouseGestures._lastX,
                screenY: ucjsMouseGestures._lastY,
            });
        }],


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
                //        aPrincipal,
                //        aSaveCompleteCallback)
                saveURL(data[i], null, IMGtitle + ".png", null, false,
                        true,
                        ucjsMouseGestures._referrerInfo, //referrerInfo
                        ucjsMouseGestures._cookieJarSettings, //cookieJarSettings
                        null,
                        PrivateBrowsingUtils.isWindowPrivate(window),
                        Services.scriptSecurityManager.createNullPrincipal({}),
                        null);
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


      ];
    // == /config ==
    } catch(ex) {
       Services.console.logMessage(ex);
    }
  },

  // == config ==
  editor: "C:\\Program Files\\hidemaru\\hidemaru.exe",
  // editor: "/usr/bin/gedit",
  // == /config ==











  load: function() {
    this.defCommands();
    if (document.getElementById("ucjsMouseGestures_menues"))
      return;
    this.createMenu();
  },

  createMenu: function() {
    let ref = document.getElementById("menu_preferences");
    let menu = document.createXULElement("menu");
    menu.setAttribute("id", "ucjsMouseGestures_menues");
    menu.setAttribute("label", "ucjsMouseGestures");
    ref.parentNode.insertBefore(menu, ref);
    let menupopup = document.createXULElement("menupopup");
    menu.appendChild(menupopup);
    let menuitem = document.createXULElement("menuitem");
    menupopup.appendChild(menuitem);
    menuitem.setAttribute("id", "ucjsMouseGestures_menuepopup");
    menuitem.setAttribute("label", "Reload commands");
    menuitem.addEventListener("command", () => ucjsMouseGestures_menues.reloadCommands());
    //menuitem.setAttribute("oncommand", "ucjsMouseGestures_menues.reloadCommands();");

    menuitem = document.createXULElement("menuitem");
    menupopup.appendChild(menuitem);
    menuitem.setAttribute("id", "ucjsMouseGestures_menues_launchEditor");
    menuitem.setAttribute("label", "Edit commands");
    menuitem.addEventListener("command", () => ucjsMouseGestures_menues.launchEditor());
    //menuitem.setAttribute("oncommand", "ucjsMouseGestures_menues.launchEditor();");
  },

  launchEditor: function() {
    var editor = this.editor;
/*
    var UI = Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

    var platform = window.navigator.platform.toLowerCase();

    if(platform.indexOf('win') > -1){
      UI.charset = 'Shift_JIS';
    }else{
      UI.charset =  'UTF-8';
    }
    var path = Services.io.getProtocolHandler("file").
               QueryInterface(Components.interfaces.nsIFileProtocolHandler).
               getFileFromURLSpec(this.getThisFileUrl()).path
    path = UI.ConvertFromUnicode(path);
*/
    var path = Services.io.newURI(this.getThisFileUrl())
                 .QueryInterface(Ci.nsIFileURL).file.path;
                 
    var appfile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsIFile);
    appfile.initWithPath(editor);
    var process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
    process.init(appfile);
    process.runw(false, [path], 1, {});

  },

  getThisFileUrl: function() {
        return Error().fileName.split(' -> ').pop().split('?')[0];
  },

  reloadCommands: function() {
    let url = this.getThisFileUrl();
    let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    let fileProtocolHandler = Services.io.getProtocolHandler("file").
                              QueryInterface(Ci.nsIFileProtocolHandler);
    let path = fileProtocolHandler.getFileFromURLSpec(url).path;
    file.initWithPath(path);

    let enumerator = Services.wm.getEnumerator("navigator:browser");
		while (enumerator.hasMoreElements()) { 
      let win = enumerator.getNext();
      Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
               .loadSubScriptWithOptions(url + "?" + this.getLastModifiedTime(file), {
                              target: win, ignoreCache: false
                      });
    }
  },

  getLastModifiedTime: function(aFile) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
        .logStringMessage(aFile.lastModifiedTime);
    return aFile.lastModifiedTime;
  }



}
if (typeof ucjsMouseGestures != "undefined")
  ucjsMouseGestures_menues.load();
