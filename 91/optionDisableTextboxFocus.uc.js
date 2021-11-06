// ==UserScript==
// @name           optionDisableTextboxFocus.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround Bug 1727888 - Unable to unfocus searchbox of the preferences with mouse
// @include        about:preferences
// @compatibility  78+
// @version        2020/11/07 01:00 defocus with key
// @version        2020/08/07 01:00
// ==/UserScript==
  window.optionDisableTextboxFocus = {
    init: function() {
      let style = `
        .main-content,
        .pane-container {
          -moz-user-focus: normal !important;
        }
        groupbox[data-category]:not([hidden="true"]):not([id="startupGroup"]):not([id="oneClickSearchProvidersGroup"]):not([id="applicationsGroup"]):not([id="fontsGroup"]):not([id="homepageGroup"]):not([id="downloadsGroup"]):not([id="homeContentsGroup"])
        {
          display: inline-block;
        }
        #startupPageBox:not([hidden="true"]),
        #updateRadioGroup:not([hidden="true"]),
        #doNotTrackRadioGroup:not([hidden="true"]),
        #browsingProtectionGroup:not([hidden="true"]),
        #searchSuggestionsGroup:not([hidden="true"]) > vbox.indent,
        #passwordSettings:not([hidden="true"]) hbox.indent,
        #saveWhere:not([hidden="true"]),
        #homeContentsGroup:not([hidden="true"]) > vbox:nth-child(3),
        #homeContentsGroup:not([hidden="true"]) > vbox:nth-child(4),
        #homeContentsGroup:not([hidden="true"]) > vbox:nth-child(4) > vbox:nth-child(2),
        #homeContentsGroup:not([hidden="true"]) > vbox:nth-child(5),
        #homeContentsGroup:not([hidden="true"]) > vbox:nth-child(6),
        #homeContentsGroup:not([hidden="true"]) > vbox:nth-child(6) > vbox:nth-child(2),
        #homeContentsGroup:not([hidden="true"]) > vbox:nth-child(7),
        #browsingProtectionGroup:not([hidden="true"]) > vbox.indent
        {
          display: inline-block;
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

      document.querySelector(".pane-container").focus();

      document.querySelector("#searchInput").addEventListener("keypress", this, true)
    },
    handleEvent: function(event) {
      switch (event.keyCode) {
        /*case KeyEvent.DOM_VK_END:
        case KeyEvent.DOM_VK_HOME:*/
        case KeyEvent.DOM_VK_PAGE_UP:
        case KeyEvent.DOM_VK_PAGE_DOWN:
          if (
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey
          ) {
            document.querySelector(".pane-container").focus();
            event.preventDefault();
          }
          break;
        case KeyEvent.DOM_VK_UP:
        case KeyEvent.DOM_VK_DOWN:
          document.querySelector(".pane-container").focus();
          event.preventDefault();
          break;
      }
    }
  }
  setTimeout(() => {optionDisableTextboxFocus.init();}, 250);
