// ==UserScript==
// @name           patchForRevertBug628179.uc.js
// @namespace      http://kb.mozillazine.org/UserChrome.js/General
// @description    Do not close FindBar when  document navigation and tab switching
// @include        main
// @compatibility  Firefox 4.0
// @author         Alice0775
// @version        2011/02/12 13:33
// @version        2011/02/12 13:30
// ==/UserScript==
(function(){
  var func = XULBrowserWindow.onLocationChange.toString();
  if (/if \(gFindBar\.findMode != gFindBar\.FIND_NORMAL\) \{/.test(func))
    return;

  func = func.replace(
   'if (gFindBarInitialized) {',
   'if (false && gFindBarInitialized) {'
  );
  func = func.replace(
   'UpdateBackForwardCommands(gBrowser.webNavigation);',
    <><![CDATA[
    $&
    if (gFindBarInitialized) {
      if (gFindBar.findMode != gFindBar.FIND_NORMAL) {
        // Close the Find toolbar if we're in old-style TAF mode
        gFindBar.close();
      }

      // XXXmano new-findbar, do something useful once it lands.
      // Of course, this is especially wrong with bfcache on...

      // fix bug 253793 - turn off highlight when page changes
      gFindBar.getElement("highlight").checked = false;      
    }
    ]]></>
    );
  XULBrowserWindow.onLocationChange = new Function(
     func.match(/\((.*)\)\s*\{/)[1],
     func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
  );


  func = gBrowser.updateCurrentBrowser.toString();
  func = func.replace(
    "let fm = Cc['@mozilla.org/focus-manager;1'].getService(Ci.nsIFocusManager);",
    <><![CDATA[
    // If the find bar is focused, keep it focused.
    if (gFindBarInitialized &&
        !gFindBar.hidden &&
        gFindBar.getElement("findbar-textbox").getAttribute("focused") == "true") {
      break;
    }
    $&
    ]]></>
    );
  gBrowser.updateCurrentBrowser = new Function(
     func.match(/\((.*)\)\s*\{/)[1],
     func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
  );

  func = gFindBar.close.toString();
  func = func.replace(
    'if (this.hidden)',
    'if (false && this.hidden)'
    );
  gFindBar.close = new Function(
     func.match(/\((.*)\)\s*\{/)[1],
     func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
  );

})();
