// ==UserScript==
// @name           zzzz-adjustSearchbarPositionFx78.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    adjust Searchbar Position
// @include        main
// @compatibility  Firefox 78-83
// @author         Alice0775
// @version        2020/12/16 22:30 Bug 1411372 - Order of buttons on menu toolbar changes after restart / new window
// ==/UserScript==
var adjustSearchbarPosition = {
  init: function() {
    var style = "";
    for (let i = 0; i <= 30; i++) {
      style += '*[adjustSearchbarPosition="' + i.toString() + '"] {-moz-box-ordinal-group :' + i + ' !important;}';
    }

    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style.replace(/\s+/g, " ")) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    this.adjust(5000);
    window.addEventListener('beforecustomization', this, false);
    window.addEventListener('aftercustomization', this, false);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    window.removeEventListener('beforecustomization', this, false);
    window.removeEventListener('aftercustomization', this, false);
    window.removeEventListener('unload', this, false);
  },

  handleEvent: function(event){
    switch (event.type) {
      case "beforecustomization":
        this.reset();
        break;
      case "aftercustomization":
        this.adjust(1000);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  reset: function() {
    let ref = document.querySelector("#toolbar-menubar");
    for (let j = ref.childNodes.length -1; j >= 0; j--) {
      let elm = ref.childNodes[j];
      elm.removeAttribute("adjustSearchbarPosition");
    }
  },

  adjust: function(t) {
    setTimeout(() => {
      let ref = document.querySelector("#toolbar-menubar");
      for (let j = ref.childNodes.length -1; j >= 0; j--) {
        let elm = ref.childNodes[j];
        elm.setAttribute("adjustSearchbarPosition", j);
      }
    }, t);
  }
}

  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    adjustSearchbarPosition.init();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        adjustSearchbarPosition.init();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
