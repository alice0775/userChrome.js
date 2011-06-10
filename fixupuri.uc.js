// ==UserScript==
// @name           fixupuri.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ロケーションバーにおいて全角スペースが含まれるの検索語句を入力しても検索できないのを修正
// @include        main
// @compatibility  Firefox 3.5
// @author         Alice0775
// @Note
// @version        2009/09/22 go-button_enhancements.uc.jsの無いときの処理追加
// ==/UserScript==
// @version        2009/07/06 ロケーションバーにおいて全角スペースが含まれるの検索語句を入力しても検索できない
var fixupuri = {
  init: function() {
    var func = loadURI.toString();
    func = func.replace(
    'if (allowThirdPartyFixup) {',
    'if (allowThirdPartyFixup && fixupuri.fixup(uri)) {'
    );
    eval("loadURI = " + func);

    func = gBrowser.addTab.toString();
    func = func.replace(
    'if (aAllowThirdPartyFixup) {',
    'if (aAllowThirdPartyFixup && fixupuri.fixup(aURI)) {'
    );
    eval("gBrowser.addTab = " + func);

    var goButton = document.getElementById("go-button");
    if(!goButton || !("clickAndGo" in goButton)) return;

//hack go-button_enhancements.uc.js
    func = goButton.clickAndGo.toString();
    func = func.replace(
    'gBrowser.loadOneTab(uri, null, null, null, loadInBackground, true);',
    'gBrowser.loadOneTab(uri, null, null, null, loadInBackground, true && fixupuri.fixup(uri));'
    );
    eval("goButton.clickAndGo = " + func);
  },

  fixup: function(uri) {
    if (/^(https?|ftp|irc|mail|data|javascript|resource|about|telnet)/i.test(uri))
      return true;

    var flg = !/\u3000/.test(uri);
    return flg
  }
}
fixupuri.init();
