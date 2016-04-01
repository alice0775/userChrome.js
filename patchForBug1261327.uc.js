// ==UserScript==
// @name           patchForBug1261327.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 1261327 - Mouse over highlight bookmarks context menuitem disappears when downloads are in progress
// @include        main
// @compatibility  Firefox17
// @author         Alice0775
// @version        2016/02/09 14:30
// ==/UserScript==

(function patchForBug1261327() {
  var style = ' \
      #toolbar-context-menu[patchForBug1261327], \
      #placesContext[patchForBug1261327] \
      { \
        height: 0; \
        border: 0; \
        overflow: hidden; \
        position: absolute; \
      } ';

  style = style.replace(/\s+/g, " ");
  var sspi = document.createProcessingInstruction(
  'xml-stylesheet',
  'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
  );
  document.insertBefore(sspi, document.documentElement);
  sspi.getAttribute = function(name) {
  return document.documentElement.getAttribute(name);
  };

  var placesContext = document.getElementById("placesContext");
  placesContext.setAttribute("patchForBug1261327", "true");
  var toolbarContext = document.getElementById("toolbar-context-menu");
  toolbarContext.setAttribute("patchForBug1261327", "true");

  window.addEventListener("popupshowing", onPopupShowing, true);
  function onPopupShowing() {
    window.removeEventListener("popupshowing", onPopupShowing, true);
    placesContext.removeAttribute("patchForBug1261327");
    toolbarContext.removeAttribute("patchForBug1261327");
  }
})();
