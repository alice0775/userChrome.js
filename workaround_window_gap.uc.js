// ==UserScript==
// @name           workaround_window_gap.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround, Bug 1489439 window gaps(left/right edge) when restoring previous sessions
// @description    workaround, Bug 1493472 Firefox not remembering window position in windows 10
// @include        main
// @compatibility  Firefox 62, 63beta, 64a1
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
  /*
  // workaround bug 1489852
  ADJUST_WIDTH : 16,  // ?? 2*BORDER_WIDTH   Adjust according to the environment 
  ADJUST_HEIGHT : 39, // ?? 2*BORDER_WIDTH+13    Adjust according to the environment
  */
  //--/configure--

  NEED_RESIZE: false,
  
  init : function () {
    this.moveWindow(); // initial
    /* bug 1489852 was already fixed
    if (Services.appinfo.version.split(".")[0] >= 61 &&
        Services.appinfo.version.split(".")[0] <= 62 &&
        window.windowState == window.STATE_MAXIMIZED) {
      this.NEED_RESIZE = !window.opener ? true : window.opener.noWindowGap.NEED_RESIZE;
    }
    */
    // xxx todo: Use something else instead of SSTabRestoring
    gBrowser.tabContainer.addEventListener('SSTabRestoring', this, false);
    window.addEventListener('resize', this, false);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "SSTabRestoring":
      case "resize":
        setTimeout(() => {this.moveWindow();}, 0);
        break;
    }
  },

  moveWindow: function() {
    //console.log(window.windowState + " " + this.NEED_RESIZE + " "+ window.outerWidth + " " + window.outerHeight);
    if (this.NEED_RESIZE && window.windowState == window.STATE_NORMAL) {
      // window.resizeTo(800,600); 
      this.NEED_RESIZE = false;
      window.resizeBy(-this.ADJUST_WIDTH, -this.ADJUST_HEIGHT);
    }
    
    if (window.windowState == window.STATE_NORMAL) {
      let x = window.screenX;
      let y = window.screenY;
      let xr = window.screenX + window.outerWidth;
      let yb = window.screenY + window.outerHeight;

      if (-this.BORDER_WIDTH < x && x <= 0) {
        window.moveTo(-this.BORDER_WIDTH, y);
        x = window.screenX;
        y = window.screenY;
        xr = window.screenX + window.outerWidth;
        yb = window.screenY + window.outerHeight;
      }
      if (window.screen.availWidth - this.BORDER_WIDTH <= xr && xr < window.screen.availWidth + this.BORDER_WIDTH) {
        if (-this.BORDER_WIDTH == x) {
          window.resizeBy(this.BORDER_WIDTH , 0);
        } else {
          window.moveTo(window.screen.availWidth - window.outerWidth + this.BORDER_WIDTH, y);
        }
      }


      // workaround Bug 1493472
      if (-this.BORDER_WIDTH < y && y <= 0) {
        window.moveTo(x, this.TOP_BORDER_WIDTH);
        x = window.screenX;
        y = window.screenY;
        xr = window.screenX + window.outerWidth;
        yb = window.screenY + window.outerHeight;
      }

      if (window.screen.availHeight - this.BORDER_WIDTH <= yb && yb < window.screen.availHeight + this.BORDER_WIDTH) {
        if (-this.TOP_BORDER_WIDTH == y) {
          window.resizeBy(0, this.BORDER_WIDTH);
        } else {
          window.moveTo(x, window.screen.availHeight - window.outerHeight + this.BORDER_WIDTH);
        }

      }
    }
  }
}

noWindowGap.init();
