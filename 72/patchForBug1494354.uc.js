// ==UserScript==
// @name           patchForBug1494354.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround scroll problem after tab detachd if e10s enabled
// @author         Alice0775
// @include        main
// @compatibility  69+
// @version        2019/06/24 23:00 fix 69 wait for gBrowser initialized
// @version        2018/09/27 10:30 fix  tab detach
// @version        2018/09/27 01:00 
// ==/UserScript==
function patchForBug1494354() {
  function frameScript() {
    addMessageListener("contentfocus", function() {
      if (content.location.href == "about:home" || content.location.href == "about:newtab")
        return; 
      //Services.console.logStringMessage("========= " + content.location.href);
      content.focus();
    });
  }

  let frameScriptURI = 'data:application/javascript,'
            + encodeURIComponent('(' + frameScript.toString() + ')()');
   window.messageManager.loadFrameScript(frameScriptURI, true);

    // detach tab
    let func =  gBrowser.swapBrowsersAndCloseOther.toString();
    if (gBrowser && !/patchForBug1494354/.test(func)) {
      func = func.replace(
        'let otherFindBar = aOtherTab._findBar;',
        `setTimeout((browser) => {
           browser.messageManager.sendAsyncMessage("contentfocus");
           /*patchForBug1494354*/
         }, 700, aOurTab.ownerGlobal.gBrowser.getBrowserForTab(aOurTab));
         $&`
       );
      eval("gBrowser.swapBrowsersAndCloseOther = function " + func.replace(/^function/, ''));
    }

  
}


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBug1494354();

} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      patchForBug1494354();

    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}

