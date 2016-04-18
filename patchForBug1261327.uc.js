// ==UserScript==
// @name           patchForBug1261327.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 1261327 - Mouse over highlight bookmarks context menuitem disappears when downloads are in progress
// @include        main
// @compatibility  Firefox17
// @author         Alice0775
// @version        2016/03/19 00:30 fix
// @version        2016/02/09 14:30
// ==/UserScript==

(function patchForBug1261327() {
  var placesContext = document.getElementById("placesContext");
  placesContext.addEventListener("mouseenter", mouseenter, true);
  placesContext.addEventListener("mouseout", mouseout, true);
  placesContext.addEventListener("popuphidden", popuphidden, false);
  var toolbarContext = document.getElementById("toolbar-context-menu");
  toolbarContext.addEventListener("mouseenter", mouseenter, true);
  toolbarContext.addEventListener("mouseout", mouseout, true);
  toolbarContext.addEventListener("popuphidden", popuphidden, false);
  var backup = [];

  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      var target = mutation.target;
      if (target.hasAttribute("x_active") &&
          !target.hasAttribute("_moz-menuactive")) {
        target.setAttribute("_moz-menuactive", "true");
      }
    });
  });
  // configuration of the observer:
  var config = { attributes: true, subtree: true, attributeFilter: ["_moz-menuactive"]};
  // pass in the target node, as well as the observer options
  // select the target node
  observer.observe(placesContext, config);
  observer.observe(toolbarContext, config);
  // later, you can stop observing
  window.addEventListener("unload", function(){observer.disconnect();}, false);

  function mouseenter(event) {
    var target = event.originalTarget;
    while(target) {
      if (target.localName == "menuitem") {
        remove();
        target.setAttribute("x_active", "true");
        backup.push(target);
        break;
      }
      target = target.parentNode;
    }
  }
  function mouseout(event) {
    var target = event.originalTarget;
    while(target) {
      if (target.localName == "menuitem") {
        var mx = event.screenX;
        var my = event.screenY;
        var bo = target.boxObject;
        var x = bo.screenX;
        var y = bo.screenY;
        var w = bo.width;
        var h = bo.height;
        if (mx - 2 < x || mx > x + w - 2 || my - 2 < y || my > y + h - 2) {
          target.removeAttribute("x_active");
        }
        break;
      }
      target = target.parentNode;
    }
  }
  function popuphidden(event) {
    remove();
  }

  function remove() {
    for (var i = backup.length -1 ; i >= 0; i--) {
      backup[i].removeAttribute("x_active");
      backup[i].removeAttribute("_moz-menuactive");
      backup.pop();
    }
  }
})();
