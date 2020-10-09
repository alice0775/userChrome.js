// ==UserScript==
// @name           patchForBug1514601.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Fix Selecting all tabs and then closing them while browser.tabs.closeWindowWithLastTab is false can "break" that window
// @include        main
// @compatibility  Firefox 78+
// @author         Alice0775
// @version        2020/10/10 00:00
// @Note
// ==/UserScript==
{
  let func = gBrowser._beginRemoveTab.toString();
  if (!/bulkOrderedOpen:true/.test(func)) {
    func = func.replace(
    'this.addTrustedTab(BROWSER_NEW_TAB_URL, {',
    'this.addTrustedTab(BROWSER_NEW_TAB_URL, {bulkOrderedOpen:true,'
    );
    gBrowser._beginRemoveTab = new Function(
           func.match(/\(([^)]*)/)[1],
           func.replace(/[^)]*\)\s*\{/,'').replace(/}\s*$/, '')
    );
  }
}