// ==UserScript==
// @name          MemoryUsage.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Memory Usage resident memory in MB
// @include       main
// @charset       UTF-8
// @author        Alice0775
// @compatibility 78-88, 99+
// @version       2022/03/31 23:00 Clicking on the button minimizes memory and updates the usage display.
// @version       2021/06/17 19:00 
// @version       2021/06/15
// ==/UserScript==
var ucjsMemoryUsage = {
  INTERVAL: 60, //sec 重いかも

  MRM : Components.classes['@mozilla.org/memory-reporter-manager;1']
         .getService(Components.interfaces.nsIMemoryReporterManager),

  init: function() {
    try {
      CustomizableUI.createWidget({
          id: 'memoryUsageButton',
          type: 'custom',
          onBuild: function(aDocument) {
              let toolbaritem = aDocument.createXULElement('toolbarbutton');
              let props = {
                  id: 'memoryUsageButton',
                  class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                  label: 'MemoryUsage',
                  tooltiptext: 'MinimizeMemoryUsage',
                  onclick: 'ucjsMemoryUsage.MRM.minimizeMemoryUsage(()=>{});ucjsMemoryUsage.requestMemory()'
              };
              for (let p in props)
                  toolbaritem.setAttribute(p, props[p]);
              return toolbaritem;
          }
      });
    } catch(e) {}

    style = `#memoryUsageButton .toolbarbutton-text {
              display: inline-block !important;
            }
            #memoryUsageButton .toolbarbutton-icon {
              display: none !important;
            }`
    let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
    let uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style));
    if(!sss.sheetRegistered(uri, sss.AUTHOR_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);


    window.addEventListener("unload", this, false);
    window.setInterval(this.requestMemory, this.INTERVAL * 1000);
    this.requestMemory();
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
  },

  requestMemory: async function() {
    let winTop = Services.wm.getMostRecentWindow("navigator:browser");
    if (winTop == window) {
      let total =0;
      const regex = new RegExp("^resident-unique$");
      const handleReport = (aProcess, aPath, aKind, aUnits, aAmount) => {
        if(regex.test(aPath)) {
          //Services.console.logStringMessage("aPath " + aPath);
          total += aAmount;
        }
      };

      await new Promise((r) => {
        ucjsMemoryUsage.MRM
           .getReports(handleReport, null, r, null, false);
        }
      );
      //Services.console.logStringMessage("total " + txt);
      let txt = Math.ceil(total/1024/1024);
      for (let win of Services.wm.getEnumerator("navigator:browser")) {
        if (win.closed || !win.gBrowser) {
          continue;
        }
        let btn = win.document.getElementById("memoryUsageButton");
        if (btn)
         btn.setAttribute("label", txt + "MB");
      }
    }
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "unload": 
        this.uninit();
        break;
    }
  }
}
ucjsMemoryUsage.init();


