// ==UserScript==
// @name           workaround_window_gap.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround, Bug 1489439 window gaps(left/right edge) when restoring previous sessions
// @description    workaround, Bug 1493472 Firefox not remembering window position in windows 10
// @include        main
// @compatibility  Firefox 95+
// @version        2021/10/12 23:00 fix Bug 1736518 - Make browser.tabs.drawInTitlebar a tri-state
// @version        2019/12/14 23:00 fix 69 wait for gBrowser initialized
// @version        2019/06/24 23:00 fix 69 wait for gBrowser initialized
// @version        2018/10/26 00:00 prevent supulus resize event fire
// @version        2018/10/26 00:00 adjust left and roght, top and bottom, Bug 1502062
// @version        2018/09/24 07:00 add workaround Bug 1493472
// @version        2018/09/24 07:00 remove workaround bug 1489852
// @version        2018/09/09 22:00
// @version        2018/09/01 19:00
// ==/UserScript==

var noWindowGap = {
  //--configure--
  // workaround bug 1493472
  TOP_BORDER_WIDTH : 3, // ?? Adjust according to the environment
  // workaround bug 1489439
  BORDER_WIDTH : 8, // ?? Adjust according to the environment
  //--/configure--
  
  init : function () {
    this.timer = setTimeout(() => {this.moveWindow();}, 1000);
    gBrowser.tabContainer.addEventListener('SSTabRestoring', this, false);
    window.addEventListener('resize', this, false);
  },
  timer: null,
  handleEvent: function(event) {
    switch(event.type) {
      case "SSTabRestoring":
      case "resize":
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {this.moveWindow();}, 250);
        break;
    }
  },

  moveWindow: function() {
    window.removeEventListener('resize', this, false);
    if (Services.appinfo.drawInTitlebar) {
      // no titlebar
      if (window.windowState == window.STATE_NORMAL) {
        let x = window.screenX;
        let y = window.screenY;
        let yb = window.screenY + window.outerHeight;
        let yyb = window.screen.availHeight - yb;
        if (-this.TOP_BORDER_WIDTH < y && y <= 0) {
          let dy = y + this.TOP_BORDER_WIDTH;
          window.moveTo(x, -this.TOP_BORDER_WIDTH);
        }
        y = window.screenY;
        yb = window.screenY + window.outerHeight;
        yyb = window.screen.availHeight - yb + this.TOP_BORDER_WIDTH;
        if (1.5 * this.TOP_BORDER_WIDTH >= yyb && yyb > 0) {
          window.resizeTo(window.outerWidth, window.screen.availHeight - y + 2 * this.TOP_BORDER_WIDTH);
        }

        x = window.screenX;
        y = window.screenY;
        let xr = window.screenX + window.outerWidth;
        let xxr = window.screen.availWidth - xr;
        if (-2 * this.TOP_BORDER_WIDTH < x && x <= 0) {
          window.moveTo(-2 * this.TOP_BORDER_WIDTH, y);
        }
        x = window.screenX;
        xr = window.screenX + window.outerWidth;
        xxr = window.screen.availWidth - xr + 2 * this.TOP_BORDER_WIDTH;
        if (1.5 * this.TOP_BORDER_WIDTH >= xxr && xxr > 0) {
          window.resizeTo(window.screen.availWidth - x + 2 * this.TOP_BORDER_WIDTH, window.outerHeight);
        }
      }
    } else {
      if (window.windowState == window.STATE_NORMAL) {
        let x = window.screenX;
        let y = window.screenY;
        let yb = window.screenY + window.outerHeight;
        let yyb = window.screen.availHeight - yb;
        if (/*-this.TOP_BORDER_WIDTH*/-1 < y && y <= /*0*/this.TOP_BORDER_WIDTH) {
          window.moveTo(x, /*-this.TOP_BORDER_WIDTH*/0);
        }
        y = window.screenY;
        yb = window.screenY + window.outerHeight;
        yyb = window.screen.availHeight - yb + this.BORDER_WIDTH;
        if (1.5 * this.BORDER_WIDTH >= yyb && yyb > 0) {
          window.resizeTo(window.outerWidth,
                          window.screen.availHeight - y + this.BORDER_WIDTH);
        }

        x = window.screenX;
        y = window.screenY;
        let xr = window.screenX + window.outerWidth;
        let xxr = window.screen.availWidth - xr;
        if (-this.BORDER_WIDTH < x && x <= 0) {
          window.moveTo(-this.BORDER_WIDTH, y);
        }
        x = window.screenX;
        xr = window.screenX + window.outerWidth;
        xxr = window.screen.availWidth - xr + this.BORDER_WIDTH;
        if (this.BORDER_WIDTH >= xxr && xxr > 0) {
          window.resizeTo(window.screen.availWidth - x + this.BORDER_WIDTH, window.outerHeight);
        }
      }
    }  
    window.addEventListener('resize', this, false);
  }
}
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  noWindowGap.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      noWindowGap.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}


