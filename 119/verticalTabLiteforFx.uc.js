// ==UserScript==
// @name           verticalTabLiteforFx.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    CSS入れ替えまくりLiteバージョン
// @include        main
// @compatibility  Firefox 119
// @author         Alice0775
// @note           not support pinned tab yet
// @version        2023/09/05 convert private indicator selector due to Bug 1851163
// @version        2023/09/01 display while customization (xxx all tabs will reflow)
// @version        2023/08/29 00:00 Bug 1849904 - Convert a bunch of psuedo-boolean tab strip attributes to be standard boolean attributes
// @version        2023/08/24 00:00 workaround Bug 1849141 - Clean up --tab-min-height rules
// @version        2023/07/19 00:00 add padding-top due to Bug 1705215
// @version        2023/03/09 Bug 1820534 - Move front-end to modern flexbox.
// @version        2022/12/22 add outline for selectedtab(xxx Bug 1704347)
// @version        2022/12/19 window control in Fullscreen
// @version        2022/11/13 tweak .tab-icon-overlay css
// @version        2022/10/26 Bug 1549057 - Update naming of getCSP and getCsp to be consistent
// @version        2022/10/25 increse splitter width
// @version        2022/10/14 tweak css
// @version        2022/10/14 Bug 1790616 
// @version        2022/10/12 Bug 1794630
// @version        2022/10/07 tweak timer
// @version        2022/10/06 fix Bug 1793662
// @version        2022/10/03 fix scrollbar
// @version        2022/10/01 workaround method2 Bug 1789168 
// @version        2022/09/14 fix Bug 1790299
// @version        2022/09/09 fix Bug 1771831
// @version        2022/08/25 fix new tab button
// @version        2022/08/11 margin adjust
// @version        2022/08/08 Bug 1773042 - Remove the accessibility indicator
// @version        2022/06/26 Delayed initialization a bit more.
// @version        2022/06/13 font-size of tab-label.
// @version        2022/06/12 display while customization and tweaking firefox-view-button.
// @version        2022/06/06 "MozAfterPaint"
// @version        2022/04/07 remove mask-image
// @version        2022/03/28 21:00 Bug 1759858 - gBrowser.tabContainer.on_drop should take into account that adoptTab can abort
// @version        2022/03/28 14:00 Bug 1758295 - Lazy tabs prematurely inserted when dragged into another existing window
// @version        2022/03/09 18:00 change background-color
// @version        2022/01/10 06:00 Bug 1702501 - Remove print.tab_modal.enabled pref and old frontend print preview code
// @version        2021/12/12 20:00 window control
// @version        2021/12/12 20:00 window control
// @version        2021/11/21 18:00 Bug 1742111 - Rename internal accentcolor and textcolor properties to be more consistent with the webext theme API
// @version        2021/11/03 00:00 border
// @version        2021/11/03 00:00 workaround css
// @version        2021/09/30 22:00 change splitter color
// @version        2021/08/09 00:00 compactmode
// @version        2021/08/05 00:00 fix event is undefined
// @version        2021/08/03 00:00 fix drag over
// @version        2021/06/22 00:00 remove -moz-proton
// @version        2021/06/18 00:00 Bug 1710237 - do not show .tab-icon-overlay for PiP anymore
// @version        2021/06/11 00:00 adjust splitter width
// @version        2021/06/10 00:00 tab css color is leaking.
// @version        2021/06/02 00:00 hide titlebar if :not([tabsintitlebar])[Menubarinactive="true"]
// @version        2021/04/08 20:00 Wip proton
// @version        2021/02/09 20:00 Rewrite `X.setAttribute("hidden", Y)` to `X.hidden = Y`
// @version        2020/12/04 07:00 fix Bug 1678906 - Sidebar resizes in the opposite direction to the mouse drag after move sidebar to right
// @version        2020/10/21 12:00 fix resize vtb when drag Sidebar splitter
// @version        2020/10/18 00:00 fix detach Tab Threshold
// @version        2020/09/29 00:00 Bug 1612648 - Picture in Picture tab mute options moved to overlay on tab image icon
// @version        2020/09/25 05:00 use ResizeObserver instead resize event
// @version        2020/09/25 05:00 adjust allTabsMenu to make including pinned tab
// @version        2020/09/23 01:30 cosme label pinned
// @version        2020/09/25 01:00 dblclick splitter toggle tabbar
// @version        2020/09/25 01:00 check gBrowserInit.delayedStartupFinished
// @version        2020/09/23 01:00 cosme
// @version        2020/09/21 01:00 force ReducedMotion for tab manuplation
// @version        2020/09/21 00:00 78ESR fix close button
// @version        2020/09/16 20:00 78ESR make tab resizabe (todo pinned tab)
// @version        2020/09/16 10:00 78ESR fix fullscreen window controls(wip, todo pinned tab)
// @version        2020/09/16 00:00 78ESR fix fullscreen navbar(wip, todo pinned tab)
// @version        2020/09/15 00:00 78ESR (wip, todo pinned tab)
// @version        2019/10/23 00:00 68ESR fix multiselect mark
// @version        2019/10/22 00:00 68ESR
// ==/UserScript==
"user strict";
// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
window.addEventListener("MozAfterPaint", function () {
  if (gBrowserInit.delayedStartupFinished) {
    verticalTabLiteforFx();

  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        verticalTabLiteforFx();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
}, { once: true });

function verticalTabLiteforFx() {
  let verticalTabbar_maxWidth = 500;  /* タブバーの横幅 px */
  /* not yet */
  //let verticalTabPinned_width = 27; /* ピン留めタブの横幅 px */
  //let verticalScrollbar_width = 11; /* スクロールバー幅 px */

  let verticalTabbar_minWidth = Services.prefs.getIntPref("browser.tabs.tabMinWidth", 0);
  let verticalTabbar_width = Services.prefs.getIntPref("ucjs.tabWidth", verticalTabbar_maxWidth);
  let verticalTab_height = 22;

  var css =`@-moz-document url-prefix("chrome://browser/content/browser.xhtml") {
  :root:not([uidensity="compact"]) {
    --tab-min-height: 24px !important;
  }
  :root[uidensity="compact"] {
      --tab-min-height: 22px !important;
  }
  /* vertical tabs */
  #vtb_TabsToolbar {
    max-width: ${verticalTabbar_maxWidth}px !important;
    min-width: calc(0px + ${verticalTabbar_minWidth}px) !important;
    width: ${verticalTabbar_width}px;
    background-color: var(--toolbar-bgcolor);
  }
  :root[BookmarksToolbarOverlapsBrowser] #vtb_TabsToolbar,
  :root[BookmarksToolbarOverlapsBrowser] #vtb_splitter {
    /* Make room for the bookmarks toolbar so that it won't actually overlap the
       new tab page and sidebar contents. */
    padding-top: var(--bookmarks-toolbar-height);
  }

  
  #vtb_splitter:not([state="collapsed"]) {
    -moz-appearance: none !important;
    border: 0 solid !important;
    min-width: 1px !important;
    width: 3px !important;
    background-image: none !important;
    background-color: transparent;
    margin-inline-start: -2px !important;
    margin-inline-end: -1px !important;
    position: relative;
    z-index:99999999;
  }

  #vtb_splitter[state="collapsed"] {
    border: 0 solid !important;
    min-width: 1px !important;
    width: 1px !important;
    margin-inline-start: 0 !important;
    margin-inline-end: 0 !important;
  }

  #vtb_TabsToolbar #tabbrowser-tabs {
    height: 0;
    flex: 1000 1000 auto !important; /*Bug 1820534*/
  }

  :is(#firefox-view-button, #wrapper-firefox-view-button) + #tabbrowser-tabs {
    padding-inline-start: 0px !important;
    margin-inline-start: 0px !important;
  }
  
  .tabbrowser-tab {
    max-height: calc(${verticalTab_height}px + 0px) !important;
    font-size: calc(${verticalTab_height}px - 7px) !important;
    padding-inline-start: 0 !important;
  }

  #tabbrowser-tabs .tab-label-container {
    height: 1.0em !important;
  }
  #tabbrowser-arrowscrollbox {
      overflow: hidden !important;
  }

  .tabbrowser-tab:not([pinned]) {
    width: auto !important;
    max-width: none !important;
    transition: none !important;
  }

  .tab-background {
    min-height: unset !important;
  }


@media not (prefers-contrast) {
  .tabbrowser-tab[usercontextid] .tab-background[selected]:not([multiselected]):-moz-lwtheme {
    outline: 1px solid var(--identity-icon-color, var(--lwt-tabs-border-color, currentColor)) !important;
  }
}


  .tabbrowser-tab::after, .tabbrowser-tab::before {
    border-left: none !important;
  }

  /* put scrollbar at left side */
  #tabbrowser-tabs {
    direction: rtl; /*scroll bar position*/
  }
  .tabbrowser-tab {
    direction: ltr; /*scroll bar position*/
  }
  /* be able to drag scrollbar thumb */
  scrollbox[part] > scrollbar {
    -moz-window-dragging: no-drag;
  }

  /* hide */
  #tabs-newtab-button,
  .titlebar-spacer[type="pre-tabs"],
  .tab-drop-indicator {
    display: none !important;
  }


  /* always show toolbuttons*/
  #tabbrowser-tabs[hasadjacentnewtabbutton]:not([overflow]) ~ #new-tab-button,
  tabs:not([overflow]):not([hashiddentabs]) ~ #alltabs-button {
      /*display: -moz-box !important;*/ /*Bug 1820534*/
      display: flex !important;
  }
  #new-tab-button image,
    height: 28px !important;
  }
  #new-tab-button,
  #alltabs-button {
    height: 28px;
  }
  /*DOMFullScreen*/
  :root[inFullscreen][inDOMFullscreen] #vtb_TabsToolbar {
    display: none;
  }
  /*FullScreen*/
  :root[inFullscreen]:not([inDOMFullscreen]) #vtb_TabsToolbar:not(:hover) {
    max-width: 1px !important;
    min-width: 1px !important;
    opacity: 0;
    visibility: visible !important;
    transition: .5s;
  }
  :root[inFullscreen]:not([inDOMFullscreen]) #vtb_TabsToolbar:hover {
    visibility: visible !important;
    transition: .2s;
  }
  
  :root[inFullscreen] #vtb_splitter {
    display: none;
  }

  /*Popup window*/
  :root[chromehidden*="toolbar"] #vtb_TabsToolbar {
    display: none;
  }

  /* height of menu bar */
  :root:not([tabsintitlebar]) #toolbar-menubar {
    height: 30px;
  }
  :root:not([tabsintitlebar]) #main-menubar {
    padding-top: 4px;
  }
  :root[tabsintitlebar] #toolbar-menubar[autohide="true"] {
    height:32px !important; //workaround css
  }
  :root[tabsintitlebar][sizemode="maximized"] #toolbar-menubar[autohide="true"] {
    height:32px !important; //workaround css
  }

  /*  */
  :root:not([inFullscreen])[tabsintitlebar][Menubarinactive] #titlebar {
     margin-top:-32px;
  }


  :root:not([tabsintitlebar])[Menubarinactive="true"] #titlebar {
    height: 0 !important; 
  }

  /* window control and  drag space */
  :root:not([inFullscreen])[tabsintitlebar]:not([Menubarinactive]) #nav-bar .titlebar-buttonbox{
     display: none !important;
  }
  :root:not([inFullscreen])[tabsintitlebar]:not([Menubarinactive]) .titlebar-spacer[type="post-tabs"] {
     display: none !important;
  }
  :root:not([inFullscreen])[tabsintitlebar][Menubarinactive] .titlebar-spacer[type="post-tabs"] {
     /*display: -moz-box !important;*/ /*Bug 1820534*/
     display: flex !important;
  }

/*  :root[inFullscreen]:not([tabsintitlebar]) .titlebar-buttonbox-container,
  :root[inFullscreen]:not([tabsintitlebar]) .titlebar-buttonbox {
      display: none !important;
  }
*/    
/*  :root[inFullscreen]:not([tabsintitlebar]) #window-controls {
      display: none;
  }
*/
/*
  :root[inFullscreen] .titlebar-restore {
      display: -moz-box !important;
  }
  :root[inFullscreen] .titlebar-max {
      display: none !important
  }
*/
  /*cosme*/
  .tab-content {
    /* 上 | 右 | 下 | 左 */
    padding: 0 2px 0 3px!important;
    margin-inline-start: 1px;
  }
  .tab-label {
      line-height: 1.5em !important;
  }
  .tabbrowser-tab:hover .tab-label-container,
  .tab-label-container {
      direction: ltr;
      mask-image: none !important;
/*      mask-image: linear-gradient(to left, transparent, black 0.05em) !important;*/
  }

  :root:not([uidensity="compact"]) .tabbrowser-tab > .tab-stack > .tab-content > .tab-close-button,
  :root:not([uidensity="compact"]) .tabbrowser-tab:hover > .tab-stack > .tab-content > .tab-close-button {
      margin-inline-end: calc(var(--inline-tab-padding) / -2);
      width: 19px !important;
      height: 23px !important;
      padding: 7px 5px !important; /*[上下][左右]*/
      border-radius: 8px !important;
  }
  :root[uidensity="compact"] .tabbrowser-tab > .tab-stack > .tab-content > .tab-close-button,
  :root[uidensity="compact"] .tabbrowser-tab:hover > .tab-stack > .tab-content > .tab-close-button {
      margin-inline-end: calc(var(--inline-tab-padding) / -2);
      width: 19px !important;
      height: 19px !important;
      padding: 5px 5px !important;
      border-radius: 8px !important;
  }

  /*scrollbar color*/
  toolbar[brighttext] #tabbrowser-tabs * {
    scrollbar-color: rgba(249,249,250,.4) rgba(20,20,25,.3) !important;
  }


 /*bollow css code from https://egg.5ch.net/test/read.cgi/software/1579702570/676 */

  /* ピン留めしたタブicon左右位置調整 */
  .tab-throbber[pinned],
  .tab-sharing-icon-overlay[pinned],
  .tab-icon-pending[pinned],
  .tab-icon-image[pinned] {
    margin-inline-end: 6px;
  }
  /* ピン留めしたタブに閉じるボタンを表示する・左右位置調整 */
  #vtb_TabsToolbar .tabbrowser-tab[pinned]:not([tabProtect]) .tab-close-button {
    visibility:visible !important;
    display: unset !important;
    margin-inline-end: -2px;
  }
  .tab-icon-image:not([src])[pinned] {
    fill: #aaaaaa !important;
  }



  /* ピン留めしたタブにピンマークを付ける */
  #vtb_TabsToolbar .tabbrowser-tab[pinned="true"] .tab-content::before {
    content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAOCAYAAAD9lDaoAAABPUlEQVQokY3RTUtCQRTG8WnRNwj6DDkzotwLBoVBZLeIgsCglYvAct0LSLlICIqLm7LAIIQIAqMWiULaQsyITOkFgtpEuwokiJDE9J6nXWpG9F8efnAOM4zVVY6PH9B+NygxUC7nnSsAWtjPimdOlxF1gI7HQLkJ0OM0KpWQowEZJ2rweUuiuGNDKeUGPfhhvK+jAVFGgo4sKAQFVgcFZq3ielNRWr9BNTfqQtoMIyJw5eNYUAUCw0obY4wxHNraKd71RGkJSprxFuKIuARmpHyprUhxIClBSSuMPY5bP8dipwlrI6q1hrLqPeWHQFEFpTDHpc+E2JSKarY30XDwZ6bvhuJ2vG504MLLcTon8bHbQ01vFA54z++WbfnYJC8s2UVB1yzzTUjTtO2mYX26rvf/+gX1eTwe95/gP30BeHKkcA2on8MAAAAASUVORK5CYII=") !important;
    position: absolute !important;
    z-index: -1 !important;
    margin-left: 18px !important;
    margin-right: 0px !important;
    margin-top: -12px !important;
    display: block !important;
    filter: saturate(150%) !important;
  }
  /* タブのfaviconよりもピンマークを上にする */
  #vtb_TabsToolbar .tabbrowser-tab[pinned="true"] .tab-icon-image {
    position: relative !important;
    z-index: -2 !important;
  }   

  /* Proton */

  :root:not([uidensity="touch"]) #TabsToolbar {
      --toolbarbutton-inner-padding: unset !important;
  }
  :root {
    --tab-border-radius: 0 !important;
    --tab-shadow-max-size: 0 !important;
    --proton-tab-block-margin: 0 !important;
    --inline-tab-padding: 0 !important;
    --tabpanel-background-color: unset !important;
  }

  #TabsToolbar {
    --lwt-tab-line-color: unset !important; /*xxx Bug 1704347*/
  }
  .tab-label:is([selected], [attention]) {
    font-weight: unset !important; /*xxx Bug 1704347*/
  }

  #TabsToolbar .tabbrowser-tab:not([dragover]) .tab-background {
    box-shadow: unset !important;
  }
  
  .tab-icon-overlay[indicator-replaces-favicon] {
    stroke: black !important;
    color: white !important;
  }
  .tab-icon-stack:not([pinned], [sharing], [crashed]):is([soundplaying], [muted], [activemedia-blocked]) > :not(.tab-icon-overlay),
  :is(#toolbar-menubar:hover + #TabsToolbar, #TabsToolbar:hover) .tab-icon-stack:not([pinned], [sharing], [crashed]):is([soundplaying], [muted], [activemedia-blocked]) > :not(.tab-icon-overlay) {
      opacity: 1 !important;
  }

  .tabbrowser-tab:not(:hover) .tab-icon-overlay:not([pinned], [sharing], [crashed]):is([soundplaying], [muted], [activemedia-blocked]) {
   opacity: 1 !important;
 }

 .tab-icon-overlay:not([crashed])[soundplaying]:hover,
 .tab-icon-overlay:not([crashed])[muted]:hover,
 .tab-icon-overlay:not([crashed])[activemedia-blocked]:hover {
    background-color: white !important;
    stroke: white !important;
    color: black !important;
  }

  :root[tabsintitlebar]:not(:-moz-window-inactive, :-moz-lwtheme) #vtb_TabsToolbar,
  :root[tabsintitlebar]:not(:-moz-window-inactive)[lwt-default-theme-in-dark-mode] #vtb_TabsToolbar {
      background-color: -moz-dialog !important;
  }


  #TabsToolbar:not([brighttext]) .tabbrowser-tab[multiselected]  .tab-background {
    box-shadow: inset 0px 0px 0px 2px var(--tab-line-color) !important;
  }
  #TabsToolbar .tabbrowser-tab[multiselected]:not([selected]) .tab-label{
    opacity: .7 !important;
  }
  .tab-background {
    border-radius: unset !important;
    margin-block: unset !important;
    /*-moz-box-orient: horizontal !important;*/ /*Bug 1820534*/
    flex-direction: row !important;
  }

  /*96+*/
#TabsToolbar:not([brighttext]) #tabbrowser-tabs:not([noshadowfortests]) .tabbrowser-tab:is([visuallyselected], [multiselected]) > .tab-stack > .tab-background:not(:-moz-lwtheme) {
    border : none !important;
}
  /**/
  .tabbrowser-tab[usercontextid] > .tab-stack > .tab-background > .tab-context-line {
    height: unset !important;
    width: 2px !important;
    margin: 0 0 0 !important;
    padding-inline-end: 3px !important; /*太く*/
  }

  .tab-icon-overlay {
      top: -7px !important;
      inset-inline-end: -6px !important;
      z-index: 1 !important;
      padding: 2px !important;
  }
  .tab-icon-overlay:is([soundplaying], [muted], [activemedia-blocked]) {
      border-radius: 10px!important;
  }

  .tab-icon-overlay[muted] {
        background: linear-gradient(45deg, transparent, transparent 45%, red 45%, red 55%, transparent 55%, transparent) !important;
  }

  .tab-icon-image:not([src],[busy]) {
    display: unset !important;
    fill: #aaaaaa !important;
  }

  .tab-icon-overlay[pictureinpicture="true"]:not([soundplaying]):not([muted]) {
    display: block !important;
  }

  .tab-icon-overlay[pictureinpicture="true"]:not([soundplaying]):not([muted]) {
    list-style-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22context-fill%22%3E%3Cpath%20d%3D%22M15%209c.552%200%201%20.447%201%201v4c0%20.553-.448%201-1%201H9c-.552%200-1-.447-1-1v-4c0-.553.448-1%201-1zm-2-8c1.654%200%203%201.346%203%203v2c0%20.553-.448%201-1%201s-1-.447-1-1V4c0-.552-.449-1-1-1H3c-.551%200-1%20.448-1%201v8c0%20.552.449%201%201%201h2c.552%200%201%20.447%201%201%200%20.553-.448%201-1%201H3c-1.654%200-3-1.346-3-3V4c0-1.654%201.346-3%203-3zM3.146%204.146c.196-.195.512-.195.708%200L6%206.293V5.5c0-.276.224-.5.5-.5s.5.224.5.5v2c0%20.065-.013.13-.039.191-.05.122-.148.22-.27.271C6.63%207.986%206.565%208%206.5%208h-2c-.276%200-.5-.224-.5-.5s.224-.5.5-.5h.793L3.146%204.854c-.195-.196-.195-.512%200-.708z%22%2F%3E%3C%2Fsvg%3E")
  }
  #TabsToolbar[brighttext] .tab-icon-overlay[pictureinpicture="true"]:not([soundplaying]):not([muted]) {
    list-style-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Ccircle%20fill%3D%22black%22%20cx%3D%228%22%20cy%3D%228%22%20r%3D%228%22%2F%3E%3Cpath%20stroke%3D%22white%22%20d%3D%22M15%209c.552%200%201%20.447%201%201v4c0%20.553-.448%201-1%201H9c-.552%200-1-.447-1-1v-4c0-.553.448-1%201-1zm-2-8c1.654%200%203%201.346%203%203v2c0%20.553-.448%201-1%201s-1-.447-1-1V4c0-.552-.449-1-1-1H3c-.551%200-1%20.448-1%201v8c0%20.552.449%201%201%201h2c.552%200%201%20.447%201%201%200%20.553-.448%201-1%201H3c-1.654%200-3-1.346-3-3V4c0-1.654%201.346-3%203-3zM3.146%204.146c.196-.195.512-.195.708%200L6%206.293V5.5c0-.276.224-.5.5-.5s.5.224.5.5v2c0%20.065-.013.13-.039.191-.05.122-.148.22-.27.271C6.63%207.986%206.565%208%206.5%208h-2c-.276%200-.5-.224-.5-.5s.224-.5.5-.5h.793L3.146%204.854c-.195-.196-.195-.512%200-.708z%22%2F%3E%3C%2Fsvg%3E")
  }

  .tab-secondary-label {
    display: none;
  }

  .tabbrowser-tab[visuallyselected] {
    z-index: unset !important;
  }

  tab[tabLock] .tab-icon-lock {
    margin-top: 3px !important;
    margin-left: 2px !important;
  }
  tab[tabProtect] .tab-icon-protect {
    margin-top: 5px !important;
    margin-left: 4px !important;
  }
  `;
  var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(css));
  if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
    sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);

  var ref = /*document.getElementById('SM_toolbox') ||*/
            document.getElementById('sidebar-box') ||
            document.getElementById("appcontent");
  var vtbTabsToolbar = document.createXULElement('hbox');
  vtbTabsToolbar.setAttribute("id", "vtb_TabsToolbar");
  document.getElementById("browser").insertBefore(vtbTabsToolbar, ref);
  var tabsToolbar = document.getElementById('TabsToolbar');
  vtbTabsToolbar.appendChild(tabsToolbar);
  //prepare for splitter
  var vtbSplitter = document.createXULElement("splitter");
  vtbSplitter.setAttribute("id", "vtb_splitter");
  vtbSplitter.setAttribute("state", "open");
  vtbSplitter.setAttribute("collapse", "before");
  vtbSplitter.setAttribute("resizebefore", "sibling");
  vtbSplitter.setAttribute("resizeafter", "none");
  document.getElementById("browser").insertBefore(vtbSplitter, ref);

  tabsToolbar.setAttribute("orient", "vertical");
  tabsToolbar.querySelector(".toolbar-items").setAttribute("orient", "vertical");
  tabsToolbar.querySelector(".toolbar-items").removeAttribute("align");
  tabsToolbar.querySelector("#TabsToolbar-customization-target").setAttribute("orient", "vertical");

  // scrollbar
  gBrowser.tabContainer.setAttribute("orient", "vertical");
  var arrowScrollbox = gBrowser.tabContainer.arrowScrollbox;
  arrowScrollbox.setAttribute("orient", "vertical");
  var scrollbox = arrowScrollbox.shadowRoot.querySelector("scrollbox");
  scrollbox.setAttribute("orient", "vertical");
  scrollbox.style.setProperty("overflow-y", "auto", "");
  scrollbox.style.setProperty("scrollbar-width", "thin", "");
  var scrollboxClip = arrowScrollbox.shadowRoot.querySelector(".scrollbox-clip");
  scrollboxClip.style.setProperty("contain", "unset", "");

  // hide scroll buttons
  var scrollButtonUp = arrowScrollbox.shadowRoot.getElementById("scrollbutton-up");
  var scrollButtonDown = arrowScrollbox.shadowRoot.getElementById("scrollbutton-down");
  scrollButtonUp.style.setProperty("display", "none", "");
  scrollButtonDown.style.setProperty("display", "none", "");
  var spacer1 = arrowScrollbox.shadowRoot.querySelector('[part="overflow-start-indicator"]');
  var spacer2 = arrowScrollbox.shadowRoot.querySelector('[part="overflow-start-indicator"]');
  spacer1.style.setProperty("display", "none", "");
  spacer2.style.setProperty("display", "none", "");

  // ignore lock tab width when closing
  gBrowser.tabContainer._lockTabSizing = function (aTab, tabWidth){};

  // control buttons
  let spacer = tabsToolbar.querySelector('.titlebar-spacer[type="post-tabs"]');
  //let accessibility = tabsToolbar.querySelector('.accessibility-indicator');
  //let private = tabsToolbar.querySelector('.private-browsing-indicator');
  let private = tabsToolbar.querySelector('#private-browsing-indicator-with-label');
  let control = tabsToolbar.querySelector('.titlebar-buttonbox-container');
  
  ref = document.getElementById("PanelUI-button");
  ref.parentNode.insertBefore(spacer, ref);
  //ref.parentNode.insertBefore(accessibility, ref);
  ref.parentNode.insertBefore(private, ref);
  ref.parentNode.insertBefore(control, ref);
/*  var func = FullScreen._updateToolbars.toString();
  func = func.replace(
  'document.getElementById("TabsToolbar").appendChild(fullscreenctls);',
  ''
  );
  FullScreen._updateToolbars = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );
*/
  const target = document.getElementById('toolbar-menubar');
  if (!target?.getAttribute("inactive"))
    document.getElementById("main-window").removeAttribute("Menubarinactive");
  else
    document.getElementById("main-window").setAttribute("Menubarinactive", "true");

  verticalTabLiteforFx.observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (!mutation.target?.getAttribute("inactive"))
        document.getElementById("main-window").removeAttribute("Menubarinactive");
      else
        document.getElementById("main-window").setAttribute("Menubarinactive", "true");
    });    
  });
  const config = { attributes: true, attributeFilter: ["inactive", "autohide"]};
  verticalTabLiteforFx.observer.observe(target, config);

  window.addEventListener("unload", function(){
    verticalTabLiteforFx.observer.disconnect();
  }, {once: true});

  gBrowser.tabContainer._positionPinnedTabs = function _positionPinnedTabs() {
      return;
  }
  gBrowser.tabContainer._updateCloseButtons = function _updateCloseButtons() {
      return;
  }

  gBrowser.removeTab_vtb_org = gBrowser.removeTab;
  gBrowser.removeTab = function removeTab(
    aTab,
    {
      animate,
      byMouse,
      skipPermitUnload,
      closeWindowWithLastTab,
      prewarmed,
    } = {}) {
    animate = false;
    gBrowser.removeTab_vtb_org(aTab,
    {
      animate,
      byMouse,
      skipPermitUnload,
      closeWindowWithLastTab,
      prewarmed,
    });
  }

  //gBrowser.tabContainer.getDropEffectForTabDrag = function(event){return "";}; // default "dragover" handler does nothing
  gBrowser.tabContainer.lastVisibleTab = function() {
    var tabs = this.allTabs;
    for (let i = tabs.length - 1; i >= 0; i--){
      if (!tabs[i].hidden)
        return i;
    }
    return -1;
  };
  gBrowser.tabContainer.clearDropIndicator = function() {
    var tabs = this.allTabs;
    for (let i = 0, len = tabs.length; i < len; i++){
      let tab_s= tabs[i].querySelector(".tab-background").style;
      tab_s.removeProperty("box-shadow");
      tabs[i].removeAttribute("dragover");
    }
  };
  gBrowser.tabContainer.addEventListener("drop",function(event){this.on_drop(event);},true);
  gBrowser.tabContainer.addEventListener("dragleave",function(event){this.clearDropIndicator(event);},true);

  gBrowser.tabContainer._getDragTargetTab = function _getDragTargetTab(event, isLink) {
    let tab = event.target;
    while (tab && tab.localName != "tab") {
      tab = tab.parentNode;
    }
    if (tab && isLink) {
      let { height } = tab.getBoundingClientRect();
      if (
        event.screenY < tab.screenY + height * 0.25 ||
        event.screenY > tab.screenY + height * 0.75
      ) {
        return null;
      }
    }
    return tab;
  }
  
  gBrowser.tabContainer._dragOverDelay = 1000; //350;
  gBrowser.tabContainer.on_dragover = function(event) {
    this.clearDropIndicator();
    var effects = this.getDropEffectForTabDrag(event);
    event.preventDefault();
    event.stopPropagation();
    console.log(effects);
    if (effects == "link") {
      let tab = this._getDragTargetTab(event, true);
      if (tab) {
        if (!this._dragTime) {
          this._dragTime = Date.now();
        }
        if (Date.now() >= this._dragTime + this._dragOverDelay) {
          this.selectedItem = tab;
        }
        return;
      }
    }
    var newIndex = this._getDropIndex(event, effects == "link");
    if (newIndex == null)
      return;

    if (newIndex < this.allTabs.length) {
      this.allTabs[newIndex].querySelector(".tab-background").style.setProperty("box-shadow","0px 2px 0px 0px #f00 inset, 0px -2px 0px 0px #f00","important");
      this.allTabs[newIndex].setAttribute("dragover", true);
    } else {
      newIndex = gBrowser.tabContainer.lastVisibleTab();
      if (newIndex >= 0) {
        this.allTabs[newIndex].querySelector(".tab-background").style.setProperty("box-shadow","0px -2px 0px 0px #f00 inset, 0px 2px 0px 0px #f00","important");
        this.allTabs[newIndex].setAttribute("dragover", true);
      }
    }
  };
  gBrowser.tabContainer.addEventListener("dragover", gBrowser.tabContainer.on_dragover, true);
  gBrowser.tabContainer._getDropIndex = function(aEvent, isLink) {
    var tabs = this.allTabs;
    for (let i = 0; i < tabs.length; i++){
      if (aEvent.screenY >= tabs[i].screenY &&
          aEvent.screenY < tabs[i].screenY + tabs[i].getBoundingClientRect().height / 2)
        return i;
      if (aEvent.screenY >= tabs[i].screenY + tabs[i].getBoundingClientRect().height / 2 &&
          aEvent.screenY < tabs[i].screenY + tabs[i].getBoundingClientRect().height)
        return i + 1;
    }
    return tabs.length;
  };

  gBrowser.tabContainer.on_drop = function(event) {
    this.clearDropIndicator();
    var dt = event.dataTransfer;
    var dropEffect = dt.dropEffect;
    var draggedTab;
    let movingTabs;
    if (dt.mozTypesAt(0)[0] == TAB_DROP_TYPE) {
      // tab copy or move
      draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
      // not our drop then
      if (!draggedTab) {
        return;
      }
      movingTabs = draggedTab._dragData.movingTabs;
      draggedTab.container._finishGroupSelectedTabs(draggedTab);
    }
    this._tabDropIndicator.hidden = true;
    event.stopPropagation();
    if (draggedTab && dropEffect == "copy") {
      // copy the dropped tab (wherever it's from)
      let newIndex = this._getDropIndex(event, false);
      let draggedTabCopy;
      for (let tab of movingTabs) {
        let newTab = gBrowser.duplicateTab(tab);
        gBrowser.moveTabTo(newTab, newIndex++);
        if (tab == draggedTab) {
          draggedTabCopy = newTab;
        }
      }
      if (draggedTab.container != this || event.shiftKey) {
        this.selectedItem = draggedTabCopy;
      }
    } else if (draggedTab && draggedTab.container == this) {
      let oldTranslateX = Math.round(draggedTab._dragData.translateX);
      let tabWidth = Math.round(draggedTab._dragData.tabWidth);
      let translateOffset = oldTranslateX % tabWidth;
      let newTranslateX = oldTranslateX - translateOffset;
      if (oldTranslateX > 0 && translateOffset > tabWidth / 2) {
          newTranslateX += tabWidth;
      } else if (oldTranslateX < 0 && -translateOffset > tabWidth / 2) {
          newTranslateX -= tabWidth;
      }
      let dropIndex = this._getDropIndex(event, false);
      //  "animDropIndex" in draggedTab._dragData &&
      //  draggedTab._dragData.animDropIndex;
      let incrementDropIndex = true;
      if (dropIndex && dropIndex > movingTabs[0]._tPos) {
          dropIndex--;
          incrementDropIndex = false;
      }

      if (false && oldTranslateX && oldTranslateX != newTranslateX && !gReduceMotion) {
        for (let tab of movingTabs) {
          tab.toggleAttribute("tabdrop-samewindow", true);
          tab.style.transform = "translateX(" + newTranslateX + "px)";
          let onTransitionEnd = transitionendEvent => {
            if (
                transitionendEvent.propertyName != "transform" ||
                transitionendEvent.originalTarget != tab
            ) {
              return;
            }
            tab.removeEventListener("transitionend", onTransitionEnd);
            tab.removeAttribute("tabdrop-samewindow");
            this._finishAnimateTabMove();
            if (dropIndex !== false) {
              gBrowser.moveTabTo(tab, dropIndex);
              if (incrementDropIndex) {
                dropIndex++;
              }
            }
            gBrowser.syncThrobberAnimations(tab);
          };
          tab.addEventListener("transitionend", onTransitionEnd);
        }
      } else {
        this._finishAnimateTabMove();
        if (dropIndex !== false) {
          for (let tab of movingTabs) {
            gBrowser.moveTabTo(tab, dropIndex);
            if (incrementDropIndex) {
              dropIndex++;
            }
          }
        }
      }
    } else if (draggedTab) {
        // Move the tabs. To avoid multiple tab-switches in the original window,
        // the selected tab should be adopted last.
        const dropIndex = this._getDropIndex(event, false);
        let newIndex = dropIndex;
        let selectedTab;
        let indexForSelectedTab;
        for (let i = 0; i < movingTabs.length; ++i) {
          const tab = movingTabs[i];
          if (tab.selected) {
            selectedTab = tab;
            indexForSelectedTab = newIndex;
          } else {
            const newTab = gBrowser.adoptTab(tab, newIndex, tab == draggedTab);
            if (newTab) {
              ++newIndex;
            }
          }
        }
        if (selectedTab) {
          const newTab = gBrowser.adoptTab(
            selectedTab,
            indexForSelectedTab,
            selectedTab == draggedTab
          );
          if (newTab) {
            ++newIndex;
          }
        }

        // Restore tab selection
        gBrowser.addRangeToMultiSelectedTabs(
          gBrowser.tabs[dropIndex],
          gBrowser.tabs[newIndex - 1]
        );
    } else {
      // Pass true to disallow dropping javascript: or data: urls
      let links;
      try {
          links = browserDragAndDrop.dropLinks(event, true);
      } catch (ex) {}
      if (!links || links.length === 0) {
          return;
      }
      let inBackground = Services.prefs.getBoolPref(
          "browser.tabs.loadInBackground"
      );
      if (event.shiftKey) {
          inBackground = !inBackground;
      }
      let targetTab = this._getDragTargetTab(event, true);
      let userContextId = this.selectedItem.getAttribute("usercontextid");
      let replace = !!targetTab;
      let newIndex = this._getDropIndex(event, true);
      let urls = links.map(link => link.url);
      let csp = browserDragAndDrop.getCsp(event);
      let triggeringPrincipal = browserDragAndDrop.getTriggeringPrincipal(
          event
      );
      (async () => {
        if (
          urls.length >=
          Services.prefs.getIntPref("browser.tabs.maxOpenBeforeWarn")
        ) {
          // Sync dialog cannot be used inside drop event handler.
          let answer = await OpenInTabsUtils.promiseConfirmOpenInTabs(
                       urls.length,
                       window
          );
          if (!answer) {
            return;
          }
        }
        gBrowser.loadTabs(urls, {
                          inBackground,
                          replace,
                          allowThirdPartyFixup: true,
                          targetTab,
                          newIndex,
                          userContextId,
                          triggeringPrincipal,
                          csp,
        });
      })();
    }
    if (draggedTab) {
      delete draggedTab._dragData;
    }
  };

  func = gBrowser.tabContainer.on_dragend.toString();
  func = func.replace(
  'var wX = window.screenX;',
  'var wX = window.screenX;var wY = window.screenY;'
  ).replace(
  'let detachTabThresholdY = window.screenY + rect.top + 1.5 * rect.height;',
  'let detachTabThresholdX = window.screenX + rect.left + rect.width + 50;'
  ).replace(
  'if (eY < detachTabThresholdY && eY > window.screenY) {',
  'if (eX < detachTabThresholdX && eX > window.screenX) {'
  );
  gBrowser.tabContainer.on_dragend = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );
  
  gBrowser.tabContainer.addEventListener('SSTabRestoring', ensureVisible, false);
  gBrowser.tabContainer.addEventListener('TabSelect', ensureVisible, false);
  gBrowser.tabContainer.addEventListener('dragend', ensureVisible, false);
  function ensureVisible(event) {
    let aTab = event?.target;
    setTimeout((aTab) => {
      ensureVisibleTab(aTab);
    }, 150, aTab);
  }
  function ensureVisibleTab(aTab, allowScrollUp = true) {
    let tab = gBrowser.selectedTab;
    if (tab != aTab)
      return;
    let tabContainer = gBrowser.tabContainer;
    if ( tab.screenY + tab.getBoundingClientRect().height + 1 >
           tabContainer.screenY + tabContainer.getBoundingClientRect().height ) {
      tab.scrollIntoView(false);
    } else if ( tab.screenY < tabContainer.screenY && allowScrollUp) {
      tab.scrollIntoView(true);
    }
  }

  // check width only while dragging of splitter
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if(entry.contentBoxSize) {
        ensureVisibleTab(gBrowser.selectedTab);
        if (vtbSplitter.getAttribute("state") == "dragging" ||
            document.getElementById("SM_splitter")?.getAttribute("state") == "dragging" ||
            SidebarUI._splitter.getAttribute("state") == "dragging") {
          let width = vtbTabsToolbar.getBoundingClientRect().width;
          if (verticalTabbar_minWidth <= width) {
            sizeofToolbottun();
            Services.prefs.setIntPref("ucjs.tabWidth", width);
          }
        }
      }
    }
  });
  resizeObserver.observe(vtbTabsToolbar);

  // adjust button size
  sizeofToolbottun();
  function sizeofToolbottun() {
    let width = vtbTabsToolbar.getBoundingClientRect().width;
    let btn = document.querySelector("#new-tab-button .toolbarbutton-icon");
    btn.style.setProperty("width", "auto", "");
    btn.style.setProperty("padding", "6px " + (width - 16 - 4) / 2 + "px", "");
    btn = document.querySelector("#alltabs-button .toolbarbutton-badge-stack");
    btn.style.setProperty("padding", "6px " + (width - 16 - 4) / 2 + "px", "");
  };
  // dblclick splitter toggle tabbar
  vtbSplitter.addEventListener('dblclick', vtbSplitter_toggle, false);
  function vtbSplitter_toggle(event) {
    if (vtbSplitter.getAttribute("state") == "collapsed")
      vtbSplitter.setAttribute("state", "open");
    else
      vtbSplitter.setAttribute("state", "collapsed");
  }

  // adjust allTabsMenu to make including pinned tab
  func = gTabsPanel.init.toString();
  func = func.replace(
  'filterFn: tab => !tab.pinned && !tab.hidden,',
  'filterFn: tab => !tab.hidden,'
  );
  gTabsPanel.init = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );

  gNavToolbox.addEventListener("customizationready", function(aEvent) {
    switch (aEvent.type) {
      case "customizationready":
        document.getElementById("browser").hidden = false; //xxx all tabs will reflow
        break;
    }
  });
/*
  gNavToolbox.addEventListener("aftercustomization", function(aEvent) {
    switch (aEvent.type) {
      case "aftercustomization":
        document.getElementById("browser").collapsed = false;
        break;
    }
  });
*/
}
