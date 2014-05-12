// ==UserScript==
// @name           000-revertAddonBarStatusBar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Revert AddonBar StatusBar
// @include        main
// @compatibility  Firefox 29+
// @author         Alice0775
// @version        2014/05/12 15:30 defaultCollapsed is only allowed for default toolbars
// @version        2014/05/12 14:00 clean up
// @version        2014/05/12 14:00 wrapped status-bar, regidter before create toolbar
// @version        2014/05/12 13:00 toolbar style, load CustomizableUI.jsm
// @version        2014/05/12 12:40 specify mode, iconsize
// @version        2014/05/12 12:30
// ==/UserScript==
(function(){
  if (document.getElementById("ctraddon_addon-bar") || document.getElementById("ctr_addon-bar"))
    return;

  Components.utils.import("resource:///modules/CustomizableUI.jsm");

  // sprong and wrapper
  let toolbarspring = document.createElement("spacer");
  toolbarspring.setAttribute("flex", "1");
  toolbarspring.setAttribute("id", "spring_revertAddonBarStatusBar");
  toolbarspring.setAttribute("removable", "true");

  let palette = document.getElementById("navigator-toolbox").palette;
  palette.appendChild(toolbarspring);
  let dmy = document.createElement("toolbaritem");
  dmy.setAttribute("id", "ucjs-status-bar");
  palette.appendChild(dmy);

  //register toolbar.id
  CustomizableUI.registerArea("ucjs-addon-bar", {
    type: CustomizableUI.TYPE_TOOLBAR,
    defaultPlacements: ["spring_revertAddonBarStatusBar", "ucjs-status-bar"],
  }, true);

  //create toolbar
  let addonbar = document.createElement("toolbar");
  addonbar.setAttribute("id", "ucjs-addon-bar");
  addonbar.setAttribute("customizable", "true");
  addonbar.setAttribute("mode", "icons");
  addonbar.setAttribute("iconsize", "small");
  addonbar.setAttribute("removable", "false");
  addonbar.setAttribute("context", "toolbar-context-menu");

  var bottombox = document.getElementById("browser-bottombox");
  dmy.appendChild(document.getElementById("status-bar"));
  bottombox.appendChild(addonbar);

  let style = ' \
    @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
    #ucjs-addon-bar { \
      border-top: 1px solid threedshadow; \
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
\
    #main-window[customizing] #spring_revertAddonBarStatusBar { \
      margin-left: 10px; \
      margin-right:10px; \
      border: 1px dashed threedshadow; \
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
})();
