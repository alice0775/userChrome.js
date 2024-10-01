// ==UserScript==
// @name         highlightMenuitemAtRightClick.uc.js
// @description  Highlight menuitem at right click, Bug 909122 - Right click on a menu entry doesn't change the visible focus
// @charset      utf-8
// @include      main
// @version		   2024/10/01 Firefox 128
// @version		   2023/04/21 Firefox 112
// @version		   2022/03/06
// ==/UserScript==
{
  let style= `
    menu[_moz-menuactive2="true"],
    menuitem[_moz-menuactive2="true"],
    toolbarbutton[_moz-menuactive2="true"] {
      background-color: var(--toolbarbutton-active-background) !important;
      color: inherit !important;
    }
/*
    :root:not([lwt-popup-brighttext]) menu[_moz-menuactive2="true"],
    :root:not([lwt-popup-brighttext]) menuitem[_moz-menuactive2="true"],
    :root:not([lwt-popup-brighttext]) toolbarbutton[_moz-menuactive2="true"] {
      background-color: -moz-cellhighlight !important;
      color: -moz-cellhighlighTtext !important;
    }
*/ 
  `;
  let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  let uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style.replace(/\s+/g, " ")));
    if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
}

window.addEventListener("popupshowing", (event) => {
  if (event.target.id == "placesContext" ||
      event.target.id == "toolbar-context-menu" ||
      event.target.id == "appMenu-popup") {
    //console.log(event.target);
    event.target.triggerNode?.setAttribute("_moz-menuactive2", true);
    //console.log(event.target.triggerNode);
  }
});

window.addEventListener("popuphiding", (event) => {
  if (event.target.id == "placesContext" ||
      event.target.id == "toolbar-context-menu" ||
      event.target.id == "appMenu-popup") {
    event.target.triggerNode?.removeAttribute("_moz-menuactive2", true);
  }
});
