// ==UserScript==
// @name           000-revertAddonBarStatusBar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Revert AddonBar StatusBar
// @include        main
// @compatibility  Firefox 29+
// @author         Alice0775
// @version        2014/05/12 12:40 specify mode, iconsize
// @version        2014/05/12 12:30
// ==/UserScript==
(function(){
  if (document.getElementById("ctraddon_addon-bar") || document.getElementById("ctr_addon-bar"))
    return;

  let style = ' \
    @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
    #ucjs-addon-bar { \
      border-top: 1px solid threedhighlight; \
      border-bottom: 0 solid transparent; \
    } \
\
    #main-window[customizing] #ucjs-addon-bar { \
      border: 1px dotted threedshadow; \
    } \
\
    #main-window[customizing] #ucjs-addon-bar #status-bar { \
      border: 1px solid black; \
      opacity: 0.5; \
    } \
    '.replace(/\s+/g, " ");

  let sspi = document.createProcessingInstruction(
    'xml-stylesheet',
    'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
  );
  document.insertBefore(sspi, document.documentElement);
  sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
  };


  let addonbar = document.createElement("toolbar");
  addonbar.setAttribute("id", "ucjs-addon-bar");
  addonbar.setAttribute("customizable", "true");
  addonbar.setAttribute("mode", "icons");
  addonbar.setAttribute("iconsize", "small");

  let toolbarspring = document.createElement("spacer");
  toolbarspring.setAttribute("flex", "1");
  toolbarspring.setAttribute("id", "spring_revertAddonBarStatusBar");
  toolbarspring.setAttribute("removable", "false");
  addonbar.appendChild(toolbarspring);

  addonbar.appendChild(document.getElementById("status-bar"));
  var bottombox = document.getElementById("browser-bottombox");
  bottombox.appendChild(addonbar);

  CustomizableUI.registerArea("ucjs-addon-bar", {
    type: CustomizableUI.TYPE_TOOLBAR,
    legacy: true,
    defaultPlacements: ["spring_revertAddonBarStatusBar", "status-bar"],
    defaultCollapsed: false,
  }, true);


})();
