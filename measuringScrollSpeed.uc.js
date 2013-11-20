// ==UserScript==
// @name           measuringScrollSpeed.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    measuringScrollSpeed
// @include        main
// @compatibility  Firefox
// @author         Alice0775
// @version        2011/10/07 12:30
// @note           measuringScrollSpeed
// ==/UserScript==


var measuringScrollSpeed = {
  init: function() {
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("label", "Measuring Scroll Speed");
    menuitem.setAttribute("oncommand", "measuringScrollSpeed.run(5, 150)");
    document.getElementById("menu_ToolsPopup").appendChild(menuitem);
  },

  run: function(aMaxIteration, aMaxScroll) {
    function scroll(event) {
      var tp = content.document.documentElement.scrollTop;
      
      if (count < aMaxScroll && tp < tpMax) {
        count++;
        var evt = content.document.createEvent("KeyboardEvent");
        evt.initKeyEvent ("keypress", true, true, window, 
                              null, null, null, null, 
                              40, 0) 
        content.document.dispatchEvent(evt)
      } else {
        iteration++;
        content.removeEventListener("scroll", scroll, false);
        content.scrollTo(0,0);
        if (iteration < aMaxIteration) {
          content.addEventListener("scroll", scroll, false);
          count = 0;
          scroll();
        } else {
          alert((new Date().getTime() - start) / aMaxIteration);
        }
      }
    }

    content.focus();
    content.scrollTo(0,0);
    var tpMax = content.document.documentElement.scrollTopMax || content.document.documentElement.scrollHeight-content.document.documentElement.clientHeight;
    var iteration = 0;
    var count = 0;
    var start = new Date().getTime();
    content.addEventListener("scroll", scroll, false);
    scroll();
  }
}
measuringScrollSpeed.init();