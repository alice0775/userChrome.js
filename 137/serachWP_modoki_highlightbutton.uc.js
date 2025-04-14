// ==UserScript==
// @name           serachWP_modoki_highlightbutton.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    serachWPもどき用強調表示トグルボタン
// @charset        utf-8
// @include        main
// @async          true
// @compatibility  Firefox 135
// @author         Alice0775
// @version        2025/04/14 fix register eventListener
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2022/04/01 23:00 Convert Components.utils.import to ChromeUtils.import
// @version        2018/09/07 23:00 fix initial visual status
// @version        2018/09/07 17:00 changed to default off Togglehighlight
// ==/UserScript==
var SWPhighlightbutton = {
  get SWP_highlightbutton(){
    return document.getElementById("SWP_highlightbutton");
  },

  init: function() {
    let style = `
      #SWP_highlightbutton {
        list-style-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuElEQVQ4jb3TMQqDMBiG4U8Q2tWWFjxNhow5UrxIFhHPUrDDPxRKT1PK10EjaapGLDSQLc/7Q6LAP1dlLZU2vHYdAWSbMEk+7je2TU0A+WYsInTO8SecDKTwYqBtaiptKCJU2kzixYCfLiJjJMaVtfMB5xxJzEb8gEX8fF3GiIdKmxCXSey3hxE+rMJhJMK71Xi48RLAOcDZR2AFPgLYo/+Ev/6FPH6m4K3LyanRyoYDBYBTtIs5/AaTckM+8w6O/gAAAABJRU5ErkJggg==');
      }
     `.replace(/\s+/g, " ");

    let sss = Components.classes['@mozilla.org/content/style-sheet-service;1']
                .getService(Components.interfaces.nsIStyleSheetService);
    let newURIParam = {
        aURL: 'data:text/css,' + encodeURIComponent(style),
        aOriginCharset: null,
        aBaseURI: null
    }
    let cssUri = Services.io.newURI(newURIParam.aURL, newURIParam.aOriginCharset, newURIParam.aBaseURI);
    if (!sss.sheetRegistered(cssUri, sss.AUTHOR_SHEET))
      sss.loadAndRegisterSheet(cssUri, sss.AUTHOR_SHEET);

    CustomizableUI.addListener(SWPhighlightbutton);
    try {
      CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
        id: 'SWP_highlightbutton',
        type: 'custom',
        defaultArea: CustomizableUI.AREA_NAVBAR,
        onBuild: function(aDocument) {
          var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
          var props = {
            id: "SWP_highlightbutton",
            class: "toolbarbutton-1 chromeclass-toolbar-additional",
            tooltiptext: "Toggle Search WP Modoki Highlight",
            //oncommand: "serachWP_modoki.toggleHighlight(event);",
            type: "checkbox",
            label: "Toggle Search WP Modoki Highlight",
            autoCheck: "false",
            removable: "true"
          };
          for (var p in props) {
            toolbaritem.setAttribute(p, props[p]);
          }
          toolbaritem.addEventListener("command", (event) => event.target.ownerGlobal.serachWP_modoki.toggleHighlight(event));
          return toolbaritem;
        },
      });
    } catch(ee) {
      if (document.getElementById("SWP_highlightbutton"))
        document.getElementById("SWP_highlightbutton").addEventListener("command", (event) => event.target.ownerGlobal.serachWP_modoki.toggleHighlight(event));
    }

    let AUTOHIGHLIGHT = serachWP_modoki.AUTOHIGHLIGHT;
    Object.defineProperty(serachWP_modoki, 'AUTOHIGHLIGHT', {
      get() { return AUTOHIGHLIGHT; },
      set(newValue) { 
        AUTOHIGHLIGHT = newValue; 
        if (newValue) {
          SWPhighlightbutton.SWP_highlightbutton.setAttribute("checked", newValue);
        } else {
          SWPhighlightbutton.SWP_highlightbutton.removeAttribute("checked");
        }
      },
      enumerable: true,
      configurable: true
    });
  },

  onWidgetAdded: function(aWidgetId, aArea, aPosition) {
    switch(aWidgetId) {
      case "SWP_highlightbutton":
        if (aArea && serachWP_modoki.AUTOHIGHLIGHT)
          this.SWP_highlightbutton.setAttribute("checked", serachWP_modoki.AUTOHIGHLIGHT);
        break;
    }
  }
}
if ("serachWP_modoki" in window)
  SWPhighlightbutton.init();
