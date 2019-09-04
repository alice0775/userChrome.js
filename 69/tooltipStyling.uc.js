// ==UserScript==
// @name           tooltipStyling.uc.js
// @description    tooltipStyling
// @include        *
// ==/UserScript==
(function () {
let sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);

let uri = Services.io.newURI("data:text/css;charset=utf-8," + encodeURIComponent(`
tooltip,
#tooltip,
.tooltip,
#aHTMLTooltip {

  -moz-appearance: none !important;
  background-color: #BDF0F7 !important;
  color: #000000 !important;
  padding: 2px 12px !important;

} 
`), null, null);

sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
})();
