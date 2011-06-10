// ==UserScript==
// @name           patchForBug551434.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 551434 -  Toolbar search work not in selected engine but in active page,Bug 599349 - Key event for "Enter / Return" captured by website's eventListeners also when focus is on urlbar, searchbar, menubar, sidebar etc. Can be used to redirect user to evil-site,Bug 112298 - the alert box called when, document.onkeyup JS event is triggered, goes in a loop
// @include        *
// @compatibility  Firefox 3.6 4.0
// @author         Alice0775
// @version        2010/09/27 keyupで処理するように
// ==/UserScript==
var bug551434 = {

  init: function(){
    // xxx Bug 599349
    window.addEventListener('keydown', bug551434.keydown, true);
    window.addEventListener('keyup', bug551434.keyup, true);
  },

  win : false,
  keydown: function(aEvent) {
    //window.userChrome_js.debug(aEvent.type);
    if (aEvent.keyCode == KeyEvent.DOM_VK_RETURN) {
      bug551434.win = aEvent.originalTarget.ownerDocument.defaultView;
    } else {
      bug551434.win = false;
    }
  },

  keyup: function(aEvent) {
   //window.userChrome_js.debug(aEvent.type);
   if (aEvent.keyCode == KeyEvent.DOM_VK_RETURN) {
      if (bug551434.win != aEvent.originalTarget.ownerDocument.defaultView) {
        //window.userChrome_js.debug("trap keyup");
        aEvent.preventDefault();
        aEvent.stopPropagation();
      }
    }
    bug551434.win = false;
  }
}

bug551434.init();
