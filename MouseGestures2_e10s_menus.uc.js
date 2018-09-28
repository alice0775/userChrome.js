// ==UserScript==
// @name          Mouse Gestures command file (with Wheel Gesture and Rocker Gesture)
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Commands for Lightweight customizable mouse gestures. Add Reload and Edit commands menu
// @include       main
// @charset       UTF-8
// @author        Alice0775
// @compatibility 60
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
    // ucjsMouseGestures._linkURLs ,ucjsMouseGestures._linkdocURLs : link url hover, ownerDocument url
    // ucjsMouseGestures._selLinkURLs ,ucjsMouseGestures._selLinkdocURLs: link url in selected, ownerDocument url
    // ucjsMouseGestures._docURL : ownerDocument url
    // ucjsMouseGestures._linkURL ,ucjsMouseGestures._linkTXT : ownerDocument url : link url, ownerDocument url
    // ucjsMouseGestures._imgSRC ,ucjsMouseGestures._mediaSRC : image src, nedia src
    // ucjsMouseGestures._selectedTXT : selected text
    // ucjsMouseGestures._version : browser major version

    ucjsMouseGestures.commands =
     [
       ['L', '戻る', function(){ document.getElementById("Browser:Back").doCommand(); } ],
       ['R', '進む', function(){ document.getElementById("Browser:Forward").doCommand(); } ],

       ['RULD', 'ひとつ上の階層へ移動', function(){ ucjsMouseGestures_helper.goUpperLevel(); } ],
       ['ULDR', '数値を増やして移動', function(){ ucjsMouseGestures_helper.goNumericURL(+1); } ],
       ['DLUR', '数値を減らして移動', function(){ ucjsMouseGestures_helper.goNumericURL(-1); } ],

       ['UD', 'リロード', function(){ document.getElementById("Browser:Reload").doCommand(); } ],
       ['UDU', 'リロード(キャッシュ無視)', function(){ document.getElementById("Browser:ReloadSkipCache").doCommand(); } ],
       ['', 'すべてタブをリロード', function(){ gBrowser.reloadAllTabs(gBrowser.selectedTab); } ],


       ['', 'リンクを新しいタブに開く', function(){ ucjsMouseGestures_helper.openURLsInSelection(); } ],
       ['*RDL', '選択範囲のリンクをすべてタブに開く', function(){ ucjsMouseGestures_helper.openSelectedLinksInTabs(); } ],
       ['*RUL', '通過したリンクをすべてタブに開く', function(){ ucjsMouseGestures_helper.openHoverLinksInTabs(); } ],

       ['', '選択したリンクを保存', function(){ ucjsMouseGestures_helper.saveHoverLinks(); } ],
       ['', '通過したリンクを保存', function(){ ucjsMouseGestures_helper.saveHoverLinks(); } ],

       ['', 'コピー', function(){ ucjsMouseGestures_helper.copyText(ucjsMouseGestures.selectedTXT); } ],
       ['', '通過したリンクをコピー', function(){ ucjsMouseGestures_helper.copyHoverLinks(); } ],
       ['', '選択したリンクをコピー', function(){ ucjsMouseGestures_helper.copySelectedLinks(); } ],

       ['UL', '前のタブ', function(){ gBrowser.tabContainer.advanceSelectedTab(-1, true); } ],
       ['UR', '次のタブ', function(){ gBrowser.tabContainer.advanceSelectedTab(+1, true); } ],
       ['', '新しいタブを開く', function(){ document.getElementById("cmd_newNavigatorTab").doCommand(); } ],
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
       ['', '左側のタブをすべて閉じる', function(){ ucjsMouseGestures_helper.closeMultipleTabs("left"); } ],
       ['', '右側のタブをすべて閉じる', function(){ ucjsMouseGestures_helper.closeMultipleTabs("right"); } ],
       ['', '他のタブをすべて閉じる', function(){ gBrowser.removeAllTabsBut(gBrowser.selectedTab); } ],
       ['', '閉じたタブを元に戻す', function(){ ocument.getElementById("History:UndoCloseTab").doCommand(); } ],

       ['', '最小化', function(){ window.minimize(); } ],
       ['', '最大化/元のサイズ', function(){ window.windowState == 1 ? window.restore() : window.maximize(); } ],
       ['LDRU', 'フルスクリーン', function(){ document.getElementById("View:FullScreen").doCommand(); } ],

       ['RU', '上端へスクロール', function(){ goDoCommand("cmd_scrollTop"); } ],
       ['RD', '下端へスクロール', function(){ goDoCommand("cmd_scrollBottom"); } ],
       ['U', '上へスクロール', function(){ goDoCommand("cmd_scrollPageUp"); } ],
       ['D', '下へスクロール', function(){ goDoCommand("cmd_scrollPageDown"); } ],

       ['W-', 'ズームイン', function(){ document.getElementById("cmd_fullZoomReduce").doCommand(); } ],
       ['W+', 'ズームアウト', function(){ document.getElementById("cmd_fullZoomEnlarge").doCommand(); } ],
       ['L<R', 'ズームリセット', function(){ document.getElementById("cmd_fullZoomReset").doCommand(); } ],

       ['DL', 'ページ内検索バー',
         function(){
           if (ucjsMouseGestures._version <= "60") {
             if (gBrowser.getFindBar()) {
               gFindBar.hidden? gFindBar.onFindCommand(): gFindBar.close();
             } else {
               gLazyFindCommand("onFindCommand");
             }
           } else {
             // 61+
             gBrowser.getFindBar().then(findbar => {
               findbar.hidden? findbar.onFindCommand(): findbar.close();
             });
           }
         } ],

       ['', '選択テキストで検索',
         function(){
           BrowserSearch.loadSearchFromContext(ucjsMouseGestures._selectedTXT,
                  Services.scriptSecurityManager.createNullPrincipal({}));
         } ],
       ['DRD', '選択テキストで検索(検索エンジンポップアップ)', function(){ ucjsMouseGestures_helper.webSearchPopup(); } ],
       ['DR', '選択テキストを検索バーにコピー',
         function(){ 
           if (BrowserSearch.searchBar)
             BrowserSearch.searchBar.value = ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT;
         } ],

       ['', '再起動', function(){ ucjsMouseGestures_helper.restart(); } ],
       ['', 'ブラウザーコンソール', function(){ ucjsMouseGestures_helper.openBrowserConsole(); } ],
     ];

    // == /config ==
  },

  // == config ==
  editor: "C:\\Program Files\\hidemaru\\hidemaru.exe",
  // editor: "/usr/bin/gedit",
  // == /config ==











  load: function() {
    if (document.getElementById("ucjsMouseGestures_menues"))
      return;
    this.createMenu();
  },

  createMenu: function() {
    let ref = document.getElementById("menu_preferences");
    let menu = document.createElement("menu");
    menu.setAttribute("id", "ucjsMouseGestures_menues");
    menu.setAttribute("label", "ucjsMouseGestures");
    ref.parentNode.insertBefore(menu, ref);
    let menupopup = document.createElement("menupopup");
    menu.appendChild(menupopup);
    let menuitem = document.createElement("menuitem");
    menupopup.appendChild(menuitem);
    menuitem.setAttribute("id", "ucjsMouseGestures_menuepopup");
    menuitem.setAttribute("label", "Reload commands");
    menuitem.setAttribute("oncommand", "ucjsMouseGestures_menues.reloadCommands();");

    menuitem = document.createElement("menuitem");
    menupopup.appendChild(menuitem);
    menuitem.setAttribute("id", "ucjsMouseGestures_menues_launchEditor");
    menuitem.setAttribute("label", "Edit commands");
    menuitem.setAttribute("oncommand", "ucjsMouseGestures_menues.launchEditor();");
  },

  launchEditor: function() {
    var editor = this.editor;
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

    var appfile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsIFile);
    appfile.initWithPath(editor);
    var process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
    process.init(appfile);
    process.run(false, [path], 1, {});

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
    Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
             .loadSubScript(url + "?" + this.getLastModifiedTime(file),
                            document.defaultView, "utf-8");
  },

  getLastModifiedTime: function(aFile) {
    return aFile.lastModifiedTime;
  }



}
if (typeof ucjsMouseGestures == "undefined")
  ucjsMouseGestures_menues.load();