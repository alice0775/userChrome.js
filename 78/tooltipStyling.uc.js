// ==UserScript==
// @name           tooltipStyling.uc.js
// @description    tooltipStyling
// @include        chrome://*
// ==/UserScript==
(function () {
let style = `
tooltip,
#tooltip,
.tooltip,
#aHTMLTooltip {

  -moz-appearance: none !important;
  background-color: #BDF0F7 !important;
  color: #000000 !important;
  padding: 2px 12px !important;

} 
`;

  let sspi = document.createProcessingInstruction(
    'xml-stylesheet',
    'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
  );
  document.insertBefore(sspi, document.documentElement);
  sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
  };
})();
