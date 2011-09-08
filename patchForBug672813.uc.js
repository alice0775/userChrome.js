// ==UserScript==
// @name           patchForBug672813.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 672813 -  	Content will not be focused after I type URL or TEXT or Keywod & TEXT in Location Bar and click GO button. 
// @include        *
// @compatibility  Firefox 6, 7, not 8
// @author         Alice0775
// @version        2011/07/21
// ==/UserScript==
(function(){
  if ('gURLBar' in window && 'handleCommand' in gURLBar) {
    var func = gURLBar.handleCommand.toString();

    if (!/content\.focus\(\);/.test(func))
      return;

    func = func.replace(
    /content\.focus\(\);/g,
    <><![CDATA[
    gBrowser.selectedBrowser.focus();
    ]]></>
    );

    func = func.replace(
    'if (where == "current") {',
    <><![CDATA[
    $&
    gBrowser.selectedBrowser.focus();
    ]]></>
    );

    eval("gURLBar.handleCommand = "+ func);
  }
})();


