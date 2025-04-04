// ==UserScript==
// @name           verticalTabLiteforFx.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    CSS入れ替えまくりLiteバージョン
// @include        main
// @compatibility  Firefox 135 Not compatible with sidebar.revamp, sidebar.verticalTabs and browser.tabs.groups.enabled
// @author         Alice0775
// @note           not support pinned tab yet
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2024/12/22 00:00 remeve css hack due to crash in customozetoolbar on debug build 
// @version        2024/12/16 20:00 Tweak css for Bug 1937686 - Tab close button pushed onto next tab with many tabs when playing audio
// @version        2024/12/08 23:00 firefox-view-button readd handler
// @version        2024/11/27 12:00 Tweak window control button
// @version        2024/11/20 18:00 set Margin For HoverPreview
// @version        2024/11/18 08:00 Tweak css for attention dot
// @version        2024/11/06 12:00 revert the change of Bug 1929345
// @version        2024/10/27 22:00 Bug 1926582 - Rename things related to moving multiselected tabs together
// @version        2024/10/24 18:00 Bug 1923052 - Show private browsing indicator icon
// @version        2024/10/20 08:00 Tweak css for close button
// @version        2024/10/08 20:00 Tweak close button paddings bug 1912403
// @version        2024/10/07 08:00 Tweak z-index of splitter
// @version        2024/09/28 08:00 Tweak css Bug 1910358
// @version        2024/09/25 13:00 Tweak sound/mute icons (Bug 1919439)
// @version        2024/09/21 14:00 Bug 1906888
// @version        2024/09/18 12:00 Bug 1918638
// @version        2024/09/14 12:00 always expaded tabs, revert Bug 1918608
// @version        2024/09/14 00:00 Bug 1911889
// @version        2024/09/11 00:00 revert Bug 1913279
// @version        2024/09/09 00:00 add missing arguments
// @version        2024/09/02 Bug 1916098 - Remove appcontent box.
// @version        2024/08/23 wip Bug 1913322 - Remove overflow / underflow event usage from arrowscrollbox / tabs.js.
// @version        2024/08/17 wip Bug 1899582 - Update styling for vertical tabs
// @version        2024/08/10 wip add space at start of label
// @version        2024/08/09 wip undoing Bug 1912281 - Fix alignment of tabs and tools in the sidebar
// @version        2024/08/07 make verticalMode return false 
// @version        2024/07/30 wip undoing Bug 1899336 - Style pinned tabs and add new tab button with divider to vertical tabs
// @version        2024/07/29 wip undoing Bug 1899336
// @version        2024/07/20 wip undoing Bug 1893655 - Set up the tabstrip to work vertically
// @version        2024/07/10 wip undoing Bug 1907103 - All tab borders are highlighted
// @version        2024/07/10 wip undoing Bug 1893656 - Fix drag n' drop in vertical tabstrip
// @version        2024/06/15 wip undoing Bug 1893655 - Set up the tabstrip to work vertically
// @version        2024/05/21 use[pinned] instead [pinned="true"]
// @version        2024/05/05 Bug 1892965 - Rename Sidebar launcher and SidebarUI
// @version        2024/03/19 WIP Bug 1884792 - Remove chrome-only :-moz-lwtheme pseudo-class
// @version        2023/09/09 adjust height
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
  // do nothing if sidebarrevamp verticalTabs is enabled
  if (Services.prefs.getBoolPref("sidebar.verticalTabs", false)) {
    Services.prefs.setBoolPref("browser.tabs.groups.enabled", true); // restore default
    return;
  }
  // disable tab group
  Services.prefs.setBoolPref("browser.tabs.groups.enabled", false);

  let closebuttons="activetab"; // "activetab" or ""

  let verticalTabbar_maxWidth = 500;  /* タブバーの横幅 px */
  /* not yet */
  //let verticalTabPinned_width = 27; /* ピン留めタブの横幅 px */
  //let verticalScrollbar_width = 11; /* スクロールバー幅 px */

  let verticalTabbar_minWidth = Services.prefs.getIntPref("browser.tabs.tabMinWidth", 0);
  let verticalTabbar_width = Services.prefs.getIntPref("ucjs.tabWidth", verticalTabbar_maxWidth);
  let verticalTab_height = 22;

  setMarginForHoverPreview();

  var css =`@-moz-document url-prefix("chrome://browser/content/browser.xhtml") {
  :root {
    --tab-inner-inline-margin: 0 !important;
    --tab-inline-padding: 0 !important;
    --tab-close-button-padding: 0 !important;
    /*revert the change of Bug 1929345*/
    --tab-icon-overlay-fill: light-dark(black, white) !important;
    --tab-icon-overlay-stroke: light-dark(white, black) !important;
  }
  :root:not([uidensity="compact"]) {
    --tab-min-height: ${verticalTab_height + 2}px !important;
  }
  :root[uidensity="compact"] {
      --tab-min-height: ${verticalTab_height}px !important;
  }
  /* vertical tabs */
  #vtb_TabsToolbar {
    max-width: ${verticalTabbar_maxWidth}px !important;
    min-width: ${verticalTabbar_minWidth + 0}px !important;
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
    position: relative;
    /*z-index:99999999;*/
  }

  #vtb_splitter[state="collapsed"] {
    border: 0 solid !important;
    min-width: 1px !important;
    width: 1px !important;
    margin-inline-start: 0 !important;
    margin-inline-end: 0 !important;
  }

  :root[sizemode=normal] #vtb_splitter[state="collapsed"] {
    border: 1 solid !important;
    min-width: 4px !important;
    width: 4px !important;
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
    max-height: ${verticalTab_height + 0}px !important;
    font-size: ${verticalTab_height - 7}px !important;
    padding-inline-start: 0 !important;
    transform: none !important;
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

@media not (prefers-contrast) {
  :root[lwtheme] .tabbrowser-tab[usercontextid] .tab-background[selected]:not([multiselected]) {
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
  /* xxx remeve the following css hack due to crash in customozetoolbar on debug build */
  /* be able to drag scrollbar thumb */
  /*
  scrollbox[part] > scrollbar {
    -moz-window-dragging: no-drag;
  }
  */

#tabbrowser-tabs[orient="vertical"]:has(> #tabbrowser-arrowscrollbox[overflowing]) {
  border-bottom: 1px solid transparent !important;
}
#tabbrowser-arrowscrollbox[orient="vertical"] {
  &[overflowing]:not([scrolledtoend]) {
    mask-image: none !important;
  }
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


  :root[tabsintitlebar][sizemode="maximized"] #toolbar-menubar[autohide="true"][inactive="true"]+#nav-bar{
    padding-top: 0; /*workaround css*/
    border-top: none !important;
  }


  :root[tabsintitlebar]:is([sizemode="maximized"],[sizemode="normal"]) #navigator-toolbox > #nav-bar > .titlebar-buttonbox-container:last-child {
    display: flex !important;
  }
  :root[inFullscreen="true"] #navigator-toolbox > #nav-bar > .titlebar-buttonbox-container:last-child {
    display: flex !important;
  }
  :root[tabsintitlebar]:is([sizemode="maximized"],[sizemode="normal"]) #navigator-toolbox > #nav-bar > #nav-bar-overflow-button+.titlebar-spacer[type="post-tabs"] {
    display: none !important;
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
    padding: 0 2px 0 3px !important;
    margin-inline-start: 1px;
    justify-content: unset !important;
    align-content: center !important;
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

  .tabbrowser-tab:not([tabProtect]) > .tab-stack > .tab-content > .tab-close-button {
    display: flex !important;
  }

  :root:not([uidensity="compact"]) .tabbrowser-tab > .tab-stack > .tab-content > .tab-close-button,
  :root:not([uidensity="compact"]) .tabbrowser-tab:hover > .tab-stack > .tab-content > .tab-close-button {
      margin-inline-end: calc(var(---tab-inline-padding) / -2);
      width: 19px !important;
      height: 23px !important;
      padding: 7px 5px !important; /*[上下][左右]*/
      border-radius: 8px !important;
  }
  :root[uidensity="compact"] .tabbrowser-tab > .tab-stack > .tab-content > .tab-close-button,
  :root[uidensity="compact"] .tabbrowser-tab:hover > .tab-stack > .tab-content > .tab-close-button {
      margin-inline-end: calc(var(--tab-inline-padding) / -2);
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
  .tab-throbber,
  .tab-sharing-icon-overlay,
  .tab-icon-pending,
  .tab-icon-image {
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
  #vtb_TabsToolbar .tabbrowser-tab[pinned] .tab-content::before {
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
  #vtb_TabsToolbar .tabbrowser-tab[pinned] .tab-icon-image {
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
    --tab-inline-padding: 0 !important;
    --tabpanel-background-color: unset !important;
  }

  #TabsToolbar {
    --lwt-tab-line-color: unset !important; /*xxx Bug 1704347*/
  }
  .tab-label:is([selected], [attention]) {
    font-weight: unset !important; /*xxx Bug 1704347*/
  }

  .tabbrowser-tab[image] > .tab-stack > .tab-content[attention]:not([selected]) {
      background-position-x: left 20.5px !important;
  }

  .tabbrowser-tab:not([usercontextid]) .tab-background[selected]:not([multiselected]) {
    outline: 1px solid currentColor !important;
  }
  .tabbrowser-tab[usercontextid] .tab-background[selected]:not([multiselected]) {
    outline: 1px solid var(--identity-icon-color, currentColor) !important;
  }
  #TabsToolbar .tabbrowser-tab:not([dragover])[selected] .tab-background {
    box-shadow: 0 0 4px rgba(0,0,0,0) !important;
  }
  
  .tab-icon-overlay[indicator-replaces-favicon] {
    stroke: black !important;
    color: white !important;
  }
 
/* xxx Bug 1921060 */
*|*.tab-audio-button {
      display: none !important;
}
/**/

  .tab-icon-stack:not([pinned], [sharing], [crashed]):is([soundplaying], [muted], [activemedia-blocked]) > :not(.tab-icon-overlay),
  :is(#toolbar-menubar:hover + #TabsToolbar, #TabsToolbar:hover) .tab-icon-stack:not([pinned], [sharing], [crashed]):is([soundplaying], [muted], [activemedia-blocked]) > :not(.tab-icon-overlay) {
      opacity: 1 !important;
  }

  .tabbrowser-tab:not(:hover) .tab-icon-overlay:not([pinned], [sharing], [crashed]):is([soundplaying], [muted], [activemedia-blocked]) {
   opacity: 1 !important;
 }
 
 #TabsToolbar:not([brighttext]) .tab-icon-overlay:not([crashed])[soundplaying]:hover,
 #TabsToolbar:not([brighttext]) .tab-icon-overlay:not([crashed])[muted]:hover,
 #TabsToolbar:not([brighttext]) .tab-icon-overlay:not([crashed])[activemedia-blocked]:hover {
   filter: invert();
   background-color: color-mix(in srgb, currentColor 15%, currentColor 85%) !important;
 }
 #TabsToolbar[brighttext] .tab-icon-overlay:not([crashed])[soundplaying]:hover,
 #TabsToolbar[brighttext] .tab-icon-overlay:not([crashed])[muted]:hover,
 #TabsToolbar[brighttext] .tab-icon-overlay:not([crashed])[activemedia-blocked]:hover {
    background-color: white !important;
    fill: black !important;
    color: black !important;
  }

  :root[tabsintitlebar]:not(:-moz-window-inactive, [lwtheme]) #vtb_TabsToolbar,
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
:root:not([lwtheme]) #TabsToolbar:not([brighttext]) #tabbrowser-tabs:not([noshadowfortests]) .tabbrowser-tab:is([visuallyselected], [multiselected]) > .tab-stack > .tab-background {
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
      margin-left: 2px;/* xxx Bug 1921060 */
      border: 0.5px solid transparent !important;
  }
  .tab-icon-overlay:is([soundplaying], [muted], [activemedia-blocked]) {
      border-radius: 10px !important;
  }

/* xxx Bug 1921060 */
  .tab-icon-overlay {
    height: 16px !important;
    width: 14px !important;
  }
  #TabsToolbar:not([brighttext]) .tab-icon-overlay[soundplaying],
  #TabsToolbar[brighttext] .tab-icon-overlay[soundplaying]:hover {
        background-image: url("data:image/svg+xml;base64,PCEtLSBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljDQogICAtIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXMNCiAgIC0gZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gLS0+DQo8c3ZnIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0iYmxhY2siIGZpbGwtb3BhY2l0eT0iY29udGV4dC1maWxsLW9wYWNpdHkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPHBhdGggc3Ryb2tlPSJ3aGl0ZSIgZD0iTTcuNSAxLjg4MVYuNTk1QTUuNDk5IDUuNDk5IDAgMCAxIDEyIDZhNS40OTkgNS40OTkgMCAwIDEtNC41IDUuNDA1di0xLjI4NkM5LjM2IDkuNjY2IDEwLjc1IDcuOTk3IDEwLjc1IDZjMC0xLjk5Ny0xLjM5LTMuNjY2LTMuMjUtNC4xMTl6bS0zLjM2Mi0uNTk0TDIuNzkxIDMuNTgxYy0uMDMxLjA1My0uMDUxLjExMS0uMDcxLjE2OUgxYTEgMSAwIDAgMC0xIDF2Mi41YTEgMSAwIDAgMCAxIDFoMS43MmEuOTMuOTMgMCAwIDAgLjA3MS4xNjlsMS4zNDcgMi4yOTRjLjUxNi44NzkgMS44NjIuNTEzIDEuODYyLS41MDdWMS43OTNDNiAuNzc0IDQuNjU0LjQwOCA0LjEzOCAxLjI4N3oiLz4NCiAgICA8cGF0aCBzdHJva2U9IndoaXRlIiBkPSJNNy41IDMuMTkzdjUuNjEzYzEuMTYxLS40MTMgMi0xLjUwNCAyLTIuODA3cy0uODM5LTIuMzkzLTItMi44MDZ6Ii8+DQo8L3N2Zz4=") !important;
}
  #TabsToolbar:not([brighttext]) .tab-icon-overlay[soundplaying]:hover,
  #TabsToolbar[brighttext] .tab-icon-overlay[soundplaying] {
        background-image: url("data:image/svg+xml;base64,PCEtLSBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljDQogICAtIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXMNCiAgIC0gZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gLS0+DQo8c3ZnIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iY29udGV4dC1maWxsLW9wYWNpdHkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPHBhdGggc3Ryb2tlPSJibGFjayIgZD0iTTcuNSAxLjg4MVYuNTk1QTUuNDk5IDUuNDk5IDAgMCAxIDEyIDZhNS40OTkgNS40OTkgMCAwIDEtNC41IDUuNDA1di0xLjI4NkM5LjM2IDkuNjY2IDEwLjc1IDcuOTk3IDEwLjc1IDZjMC0xLjk5Ny0xLjM5LTMuNjY2LTMuMjUtNC4xMTl6bS0zLjM2Mi0uNTk0TDIuNzkxIDMuNTgxYy0uMDMxLjA1My0uMDUxLjExMS0uMDcxLjE2OUgxYTEgMSAwIDAgMC0xIDF2Mi41YTEgMSAwIDAgMCAxIDFoMS43MmEuOTMuOTMgMCAwIDAgLjA3MS4xNjlsMS4zNDcgMi4yOTRjLjUxNi44NzkgMS44NjIuNTEzIDEuODYyLS41MDdWMS43OTNDNiAuNzc0IDQuNjU0LjQwOCA0LjEzOCAxLjI4N3oiLz4NCiAgICA8cGF0aCBzdHJva2U9ImJsYWNrIiBkPSJNNy41IDMuMTkzdjUuNjEzYzEuMTYxLS40MTMgMi0xLjUwNCAyLTIuODA3cy0uODM5LTIuMzkzLTItMi44MDZ6Ii8+DQo8L3N2Zz4=") !important;
}
/**/

  #TabsToolbar:not([brighttext]) .tab-icon-overlay[muted],
  #TabsToolbar[brighttext] .tab-icon-overlay[muted]:hover {
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMiAxMiIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSJjb250ZXh0LWZpbGwiIGZpbGwtb3BhY2l0eT0iY29udGV4dC1maWxsLW9wYWNpdHkiPg0KICA8cGF0aCBmaWxsPSJjb250ZXh0LWZpbGwiIGQ9Ik02LjcgMi42djYuOGMwIC43LS45IDEtMS4zLjVsLTEuNy0ySDIuMmMtLjQgMC0uNy0uMy0uNy0uOFY0LjljMC0uNC4zLS44LjctLjhoMS41bDEuNy0yYy41LS41IDEuMy0uMiAxLjMuNXoiLz4NCjxwYXRoIHN0cm9rZT0icmVkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIGQ9Ik0gMCAwIEwgMTIgMTIiIC8+PC9zdmc+") !important;
  }
  #TabsToolbar[brighttext] .tab-icon-overlay[muted]:not(:hover) {
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMiAxMiIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSJjb250ZXh0LWZpbGwiIGZpbGwtb3BhY2l0eT0iY29udGV4dC1maWxsLW9wYWNpdHkiPg0KICA8cGF0aCBzdHJva2U9IndoaXRlIiBmaWxsPSJ3aGl0ZSIgZD0iTTYuNyAyLjZ2Ni44YzAgLjctLjkgMS0xLjMuNWwtMS43LTJIMi4yYy0uNCAwLS43LS4zLS43LS44VjQuOWMwLS40LjMtLjguNy0uOGgxLjVsMS43LTJjLjUtLjUgMS4zLS4yIDEuMy41eiIvPg0KPHBhdGggc3Ryb2tlPSJyZWQiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgZD0iTSAwIDAgTCAxMiAxMiIgLz48L3N2Zz4=") !important;
  }
  
  .tab-icon-image:not([src],[busy]) {
    display: unset !important;
    fill: #aaaaaa !important;
  }

  .tab-icon-overlay[pictureinpicture="true"]:not([soundplaying]):not([muted]) {
    display: block !important;
    filter: brightness(2.0) !important;
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
  .private-browsing-indicator-with-label2 {
    :root[privatebrowsingmode="temporary"] & {
      display: flex !important;
    }
  }

  `;
  var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(css));
  if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
    sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);

  var ref = /*document.getElementById('SM_toolbox') ||*/
            document.getElementById('sidebar-box') ||
            document.getElementById("tabbrowser-tabbox");
  var vtbTabsToolbar = document.createXULElement('hbox');
  vtbTabsToolbar.setAttribute("id", "vtb_TabsToolbar");
  ref.parentNode.insertBefore(vtbTabsToolbar, ref);
  var tabsToolbar = document.getElementById('TabsToolbar');
  vtbTabsToolbar.appendChild(tabsToolbar);
  //prepare for splitter
  var vtbSplitter = document.createXULElement("splitter");
  vtbSplitter.setAttribute("id", "vtb_splitter");
  vtbSplitter.setAttribute("state", "open");
  vtbSplitter.setAttribute("collapse", "before");
  vtbSplitter.setAttribute("resizebefore", "sibling");
  vtbSplitter.setAttribute("resizeafter", "none");
  ref.parentNode.insertBefore(vtbSplitter, ref);

  tabsToolbar.setAttribute("orient", "vertical");
  tabsToolbar.querySelector(".toolbar-items").setAttribute("orient", "vertical");
  tabsToolbar.querySelector(".toolbar-items").removeAttribute("align");
  tabsToolbar.querySelector("#TabsToolbar-customization-target").setAttribute("orient", "vertical");

  gBrowser.tabContainer.setAttribute("expanded", "true");


  // Bug 1899336 - Position pinned tabs and new tab button for vertical tabs mode
  gBrowser.verticalPinnedTabsContainer.style.setProperty("display", "none", "important");
  //gBrowser.verticalPinnedTabsContainer.nextSibling.style.setProperty("display", "none", "important");

  // disabled verticalMode
	function accessorDescriptor(field, fun) {
	  var desc = { enumerable: true, configurable: true };
	  desc[field] = fun;
	  return desc;
	}
  Object.defineProperty(gBrowser.tabContainer, "verticalMode", accessorDescriptor("get", ()=>{return false}));

  function setMarginForHoverPreview() {
    let panelStyle = document.getElementById("tab-preview-panel").style;
    panelStyle.setProperty("margin-left", verticalTabbar_width+"px", "important");
    panelStyle.setProperty("margin-top", -verticalTab_height+"px", "important");
  }


  // scrollbar
  //gBrowser.tabContainer.setAttribute("orient", "vertical");
  var arrowScrollbox = gBrowser.tabContainer.arrowScrollbox;
  //arrowScrollbox.setAttribute("orient", "vertical");
  var scrollbox = arrowScrollbox.shadowRoot.querySelector("scrollbox");
  scrollbox.setAttribute("orient", "vertical");
  scrollbox.style.setProperty("overflow-y", "auto", "");
  scrollbox.style.setProperty("scrollbar-width", "thin", "");
/*
  var scrollboxClip = arrowScrollbox.shadowRoot.querySelector(".scrollbox-clip");
  scrollboxClip.style.setProperty("contain", "unset", "");
*/
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
  let private = tabsToolbar.querySelector('#private-browsing-indicator-with-label') ||
                tabsToolbar.querySelector('.private-browsing-indicator-with-label');
  let control = tabsToolbar.querySelector('.titlebar-buttonbox-container');
  
  ref = document.getElementById("PanelUI-button");
  ref.parentNode.insertBefore(spacer, ref);
  //ref.parentNode.insertBefore(accessibility, ref);
  ref.parentNode.insertBefore(private, ref).classList.add("private-browsing-indicator-with-label2");
  ref.parentNode.appendChild(control);
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
    if (closebuttons == "") {
      gBrowser.tabContainer.removeAttribute("closebuttons");
    } else {
      gBrowser.tabContainer.setAttribute("closebuttons", "activetab");
    }
    return;
  }

  gBrowser.removeTab_vtb_org = gBrowser.removeTab;
  gBrowser.removeTab = function removeTab(
    aTab,
    {
      animate,
      triggeringEvent,
      skipPermitUnload,
      closeWindowWithLastTab,
      prewarmed,
      skipSessionStore,
    } = {}) {
    try {
      arguments[1].animate = false;
      this.removeTab_vtb_org.apply(this, arguments);
    } catch(e) {
      this.removeTab_vtb_org(
        aTab,
        {
          animate:false,
          triggeringEvent:triggeringEvent,
          skipPermitUnload:skipPermitUnload,
          closeWindowWithLastTab:closeWindowWithLastTab,
          prewarmed:prewarmed,
          skipSessionStore:skipSessionStore,
        });
    }
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
    //console.log(effects);
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
      draggedTab.container._finishMoveTogetherSelectedTabs(draggedTab);
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

  gBrowser.tabContainer.on_dragend = function(event) {

      var dt = event.dataTransfer;
      var draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);

      // Prevent this code from running if a tabdrop animation is
      // running since calling _finishAnimateTabMove would clear
      // any CSS transition that is running.
      if (draggedTab.hasAttribute("tabdrop-samewindow")) {
        return;
      }

      this._finishMoveTogetherSelectedTabs(draggedTab);
      this._finishAnimateTabMove();

      if (
        dt.mozUserCancelled ||
        dt.dropEffect != "none" ||
        this._isCustomizing
      ) {
        delete draggedTab._dragData;
        return;
      }

      // Check if tab detaching is enabled
      if (!Services.prefs.getBoolPref("browser.tabs.allowTabDetach")) {
        return;
      }

      // Disable detach within the browser toolbox
      var eX = event.screenX;
      var eY = event.screenY;
      var wX = window.screenX;var wY = window.screenY;
      // check if the drop point is horizontally within the window
      if (eX > wX && eX < wX + window.outerWidth) {
        // also avoid detaching if the the tab was dropped too close to
        // the tabbar (half a tab)
        let rect = window.windowUtils.getBoundsWithoutFlushing(
          this.arrowScrollbox
        );
        let detachTabThresholdX = window.screenX + rect.left + rect.width + 50;
        if (eX < detachTabThresholdX && eX > window.screenX) {
          return;
        }
      }

      // screen.availLeft et. al. only check the screen that this window is on,
      // but we want to look at the screen the tab is being dropped onto.
      var screen = event.screen;
      var availX = {},
        availY = {},
        availWidth = {},
        availHeight = {};
      // Get available rect in desktop pixels.
      screen.GetAvailRectDisplayPix(availX, availY, availWidth, availHeight);
      availX = availX.value;
      availY = availY.value;
      availWidth = availWidth.value;
      availHeight = availHeight.value;

      // Compute the final window size in desktop pixels ensuring that the new
      // window entirely fits within `screen`.
      let ourCssToDesktopScale =
        window.devicePixelRatio / window.desktopToDeviceScale;
      let screenCssToDesktopScale =
        screen.defaultCSSScaleFactor / screen.contentsScaleFactor;

      // NOTE(emilio): Multiplying the sizes here for screenCssToDesktopScale
      // means that we'll try to create a window that has the same amount of CSS
      // pixels than our current window, not the same amount of device pixels.
      // There are pros and cons of both conversions, though this matches the
      // pre-existing intended behavior.
      var winWidth = Math.min(
        window.outerWidth * screenCssToDesktopScale,
        availWidth
      );
      var winHeight = Math.min(
        window.outerHeight * screenCssToDesktopScale,
        availHeight
      );

      // This is slightly tricky: _dragData.offsetX/Y is an offset in CSS
      // pixels. Since we're doing the sizing above based on those, we also need
      // to apply the offset with pixels relative to the screen's scale rather
      // than our scale.
      var left = Math.min(
        Math.max(
          eX * ourCssToDesktopScale -
            draggedTab._dragData.offsetX * screenCssToDesktopScale,
          availX
        ),
        availX + availWidth - winWidth
      );
      var top = Math.min(
        Math.max(
          eY * ourCssToDesktopScale -
            draggedTab._dragData.offsetY * screenCssToDesktopScale,
          availY
        ),
        availY + availHeight - winHeight
      );

      // Convert back left and top to our CSS pixel space.
      left /= ourCssToDesktopScale;
      top /= ourCssToDesktopScale;

      delete draggedTab._dragData;

      if (gBrowser.tabs.length == 1) {
        // resize _before_ move to ensure the window fits the new screen.  if
        // the window is too large for its screen, the window manager may do
        // automatic repositioning.
        //
        // Since we're resizing before moving to our new screen, we need to use
        // sizes relative to the current screen. If we moved, then resized, then
        // we could avoid this special-case and share this with the else branch
        // below...
        winWidth /= ourCssToDesktopScale;
        winHeight /= ourCssToDesktopScale;

        window.resizeTo(winWidth, winHeight);
        window.moveTo(left, top);
        window.focus();
      } else {
        // We're opening a new window in a new screen, so make sure to use sizes
        // relative to the new screen.
        winWidth /= screenCssToDesktopScale;
        winHeight /= screenCssToDesktopScale;

        let props = { screenX: left, screenY: top, suppressanimation: 1 };
        if (AppConstants.platform != "win") {
          props.outerWidth = winWidth;
          props.outerHeight = winHeight;
        }
        gBrowser.replaceTabsWithWindow(draggedTab, props);
      }
      event.stopPropagation();
    
  }

  let func = gBrowser.tabContainer.on_overflow.toString();
  func = func.replace(
  'event.target != this.arrowScrollbox',
  'event.target != this.arrowScrollbox || event.originalTarget.getAttribute("orient") == "vertical"'
  );
  gBrowser.tabContainer.on_overflow = new Function(
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
    if (CustomizationHandler.isCustomizing()) return;
    let tab = gBrowser.selectedTab;
    if (tab != aTab)
      return;
    let tabContainer = gBrowser.tabContainer;
    if ( tab.screenY + tab.getBoundingClientRect().height + 1 >
           tabContainer.screenY + tabContainer.getBoundingClientRect().height ) {
      tab.scrollIntoView(false);
      setTimeout(() => {
        gBrowser.tabContainer.arrowScrollbox
                .shadowRoot.querySelector("scrollbox").scrollTop=
        gBrowser.tabContainer.arrowScrollbox
                .shadowRoot.querySelector("scrollbox").scrollTop + 3;
      }, 600); // xxx
    } else if ( tab.screenY < tabContainer.screenY && allowScrollUp) {
      tab.scrollIntoView(true);
    }
  }

  // check width only while dragging of splitter
  const resizeObserver = new ResizeObserver(entries => {
    if (CustomizationHandler.isCustomizing()) return;
    for (let entry of entries) {
      if(entry.contentBoxSize) {
        ensureVisibleTab(gBrowser.selectedTab);
        if (vtbSplitter.getAttribute("state") == "dragging" ||
            document.getElementById("SM_splitter")?.getAttribute("state") == "dragging" ||
            SidebarController._splitter.getAttribute("state") == "dragging") {
          let width = vtbTabsToolbar.getBoundingClientRect().width;
          if (verticalTabbar_minWidth <= width) {
            sizeofToolbottun();
            Services.prefs.setIntPref("ucjs.tabWidth", width);
          }
        }
        setMarginForHoverPreview();
      }
    }
  });
  resizeObserver.observe(vtbTabsToolbar);

  // revert bug 1912403
  {
    let alltabsButton = document.querySelector("#alltabs-button");
    alltabsButton.addEventListener("mousedown", (event) => gTabsPanel.showAllTabsPanel(event, 'alltabs-button'));
    alltabsButton.addEventListener("keypress", (event) => gTabsPanel.showAllTabsPanel(event, 'alltabs-button'));
//    alltabsButton.setAttribute("onmousedown", "gTabsPanel.showAllTabsPanel(event, 'alltabs-button');");
//    alltabsButton.setAttribute("onkeypress", "gTabsPanel.showAllTabsPanel(event, 'alltabs-button');");
    document.querySelector("#firefox-view-button").addEventListener("mousedown", () => {FirefoxViewHandler.openTab();});
    document.querySelector("#firefox-view-button").addEventListener("command", () => {FirefoxViewHandler.openTab();});
  }

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

/*  gCustomizeMode.enter_org = gCustomizeMode.enter;
  gCustomizeMode.enter = function() {
    var arrowScrollbox = gBrowser.tabContainer.arrowScrollbox;
    arrowScrollbox.setAttribute("orient", "horizontal");
    
    gCustomizeMode.enter_org.apply(this, arguments);
  }
*/
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
        var arrowScrollbox = gBrowser.tabContainer.arrowScrollbox;
        arrowScrollbox.setAttribute("orient", "vertical");
        //document.getElementById("browser").collapsed = false;
        break;
    }
  });
*/
}
