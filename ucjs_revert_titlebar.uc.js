// ==UserScript==
// @name           ucjs_revert_titlebar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    revert titlebar Bug 583905 - Add Option To Show Title in New Windows Theme
// @include        main
// @compatibility  Firefox 4.0b5pre
// @author         Alice0775
// @version        2011/04/05 07:00
// @version        2010/08/26 07:00
// ==/UserScript==
var ucjs_revert_titlebar = {
  label: null,
  init: function() {
    var spacer = document.getElementById("titlebar-spacer");
    if (!spacer)
      return;

    this.label = spacer.parentNode.insertBefore(document.createElement("label"),spacer);
    this.label.setAttribute("id", "revertedtitle")
    this.label.setAttribute("flex", "1");
    this.label.setAttribute("crop", "end");

    var func = gBrowser.updateTitlebar.toString();
    func = func.replace(/}$/, "ucjs_revert_titlebar.handler();}");
    gBrowser.updateTitlebar = new Function(
       func.match(/\((.*)\)\s*\{/)[1],
       func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
    );
    var style = <><![CDATA[
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
        #revertedtitle {
          font-weight: bold;
          color: captiontext;
          padding-top: 4px;
        }
        #revertedtitle:-moz-window-inactive{
          color: inactivecaptiontext;
        }
        #main-window:not([sizemode="normal"])[tabsontop="true"] #revertedtitle{
          visibility: collapse;
        }
        #titlebar,
        #titlebar * {
          -moz-user-focus: ignore !important;
          -moz-user-select: -moz-none !important;
        }
    ]]></>.toString().replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    this.handler();
  },

  handler: function() {
    this.label.setAttribute("value", gBrowser.ownerDocument.title);
  }
}
ucjs_revert_titlebar.init();
