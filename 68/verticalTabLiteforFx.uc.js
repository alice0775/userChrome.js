// ==UserScript==
// @name           verticalTabLiteforFx.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    CSS入れ替えまくりLiteバージョン
// @include        main
// @compatibility  Firefox 68ESR
// @author         Alice0775
// @note           not dupport pinned tab
// @version        2019/10/23 00:00 68ESR fix multiselect mark
// @version        2019/10/22 00:00 68ESR
// ==/UserScript==
"user strict";
verticalTabLiteforFx();
function verticalTabLiteforFx() {
  let verticalTabbar_width = 100;  /* タブバーの横幅 px */
  let verticalTab_height = 24;  /* タブの高さ px */
  let verticalTabPinned_width = 27; /* ピン留めタブの横幅 px */
  let verticalScrollbar_width = 11; /* スクロールバー幅 px */

  let style =`
  #main-window[windowtype="navigator:browser"]:not([inFullscreen]):not([printpreview]):not([chromehidden*="toolbar"]) {
    margin-left: ${verticalTabbar_width}px !important;
  }
  #TabsToolbar {
    width: ${verticalTabbar_width}px !important;
    position:fixed !important;
    left: 0 !important;
    top: 0 !important;
    padding-bottom: calc(${verticalTab_height}px * 2) !important;
  }

  /*background-color*/
  :root:not(:-moz-lwtheme)  #TabsToolbar{
    background-color: hsl(0, 0%, 78%);
  }
  :root:-moz-lwtheme #TabsToolbar {
    background-color: var(--lwt-accent-color);
  }
  :root:-moz-lwtheme:-moz-window-inactive #TabsToolbar {
    background-color: var(--lwt-accent-color-inactive, var(--lwt-accent-color));
  }
  :root[tabsintitlebar]:not(:-moz-window-inactive):not(:-moz-lwtheme) #TabsToolbar,
  :root[tabsintitlebar]:not(:-moz-window-inactive)[lwt-default-theme-in-dark-mode] #TabsToolbar {
    background-color: -moz-win-accentcolor;
  }

  /*pennding tab*/
  #TabsToolbar[brighttext] .tabbrowser-tab[pending="true"] {
      color: #bce2e8 !important;
  }

  /*printpreview*/
  #main-window[printpreview] #TabsToolbar,
  #main-window[printpreview] #TabsToolbar * {
    visibility: hidden !important;
  }

  /*FullScreen*/
  #main-window[inFullscreen] #TabsToolbar:not(:hover) {
    width: 1px !important;
    opacity: 0 !important;
    transition: .5s !important;
  }
  #main-window[inFullscreen] #TabsToolbar:hover {
    width: ${verticalTabbar_width}px !important;
    transition: .2s !important;
  }

  /*not yet*/
  #main-window[tabsintitlebar] #tabbrowser-tabs,
  #main-window[tabsintitlebar] #content-deck {
    -moz-window-dragging: no-drag !important;
  }

  .tabbrowser-arrowscrollbox > .arrowscrollbox-scrollbox {
    overflow: visible !important;
    padding: 0 !important;
  }
  .tabbrowser-arrowscrollbox > .arrowscrollbox-scrollbox > .scrollbox-innerbox {
    display: block !important;
  }
  #tabbrowser-tabs {
    height: calc(100vh - 2 * ${verticalTab_height}px) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }

  /*WIP pinned tab*/
  .tabbrowser-tab:not([pinned]) {
    width:100% !important;
  }
  .tabbrowser-tab[pinned] {
    width:100% !important;
  }
  .tab-throbber,
  .tab-sharing-icon-overlay,
  .tab-icon-pending,
  .tab-icon-image {
    margin-inline-end: 6px;
  }
/*
  .tabbrowser-tab[pinned] {
    width: ${verticalTabPinned_width}px !important;
  }

  .tab-content[pinned] {
      padding: 0 0 0 7px !important;
  }
  .tab-content[pinned] .tab-text {
      display: none !important;
  }
*/

  .tabbrowser-tab[multiselected="true"] .tab-content::before {
    display: none !important;
  }

  .tabbrowser-tab::after {
    display: none !important;
  }

  .tabbrowser-tab {
    -moz-box-align: unset !important;
    min-height: ${verticalTab_height}px !important;
    max-height: ${verticalTab_height}px !important;
    vertical-align: top !important;
    font-size: calc(${verticalTab_height}px - 9px) !important;
  }
  .tabs-newtab-button {
    display: none !important;
  }

  /*button*/
  #new-tab-button,
  #alltabs-button {
    min-height: ${verticalTab_height}px !important;
    max-height: ${verticalTab_height}px !important;
  }
  #new-tab-button:not([disabled="true"]):not([checked]):not([open]):not(:active):hover,
  #alltabs-button:not([disabled="true"]):not([checked]):not([open]):not(:active):hover {
    background-color:  var(--toolbarbutton-hover-background) !important;
  }
  #new-tab-button:not([disabled="true"]):-moz-any([open], [checked], :hover:active),
  #alltabs-button:not([disabled="true"]):-moz-any([open], [checked], :hover:active) {
    background-color: var(--toolbarbutton-active-background) !important;
  }
  #new-tab-button .toolbarbutton-icon,
  #alltabs-button .toolbarbutton-badge-stack {
    background-color: transparent !important;
  }


  /*DOM FullScreen*/
  #main-window:not([inDOMFullscreen="true"]) #TabsToolbar > .toolbarbutton-1 {
    visibility: visible !important;
    width: 100% !important;
    background: #a9a9a9;
    margin: 0 0 !important;
    padding: 4px 0 !important;
  }
 

  .tab-drop-indicator {
    display: none !important;
  }



  .tab-label-container[textoverflow][labeldirection=ltr]:not([pinned]),
  .tab-label-container[textoverflow]:not([labeldirection]):not([pinned]):-moz-locale-dir(ltr) {
    direction: ltr;
    mask-image: linear-gradient(to left, transparent, black 0.05em) !important;
  }

  .tab-label-container[textoverflow][labeldirection=rtl]:not([pinned]),
  .tab-label-container[textoverflow]:not([labeldirection]):not([pinned]):-moz-locale-dir(rtl) {
    direction: rtl;
    mask-image: linear-gradient(to right, transparent, black 0.05em) !important;
  }
  
  .tab-content {
      padding: 0 3px !important;  /* 両サイドの明きを少し減らした 6px -> 3px*/
  }

  /* 縦のスクロールバーを左に、細く */
  #tabbrowser-tabs {
    direction: rtl; /*scroll bar position*/
  }
  #tabbrowser-tabs > arrowscrollbox > scrollbox {
    direction: ltr; /*scroll bar position*/
  }
  #tabbrowser-tabs scrollbar[orient="vertical"],
  #tabbrowser-tabs scrollbar[orient="vertical"] * {
    min-width: ${verticalScrollbar_width}px !important;
    max-width: ${verticalScrollbar_width}px !important;
  }
  `;
  var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  let newURIParam = {
      aURL: 'data:text/css,' + encodeURIComponent(style),
      aOriginCharset: null,
      aBaseURI: null
  }
  let cssUri = Services.io.newURI(newURIParam.aURL,
                                  newURIParam.aOriginCharset,
                                  newURIParam.aBaseURI);
  sss.loadAndRegisterSheet(cssUri, sss.AGENT_SHEET);

/*
    var tabsToolbar = document.getElementById('TabsToolbar');
    var tabbrowsertabs = gBrowser.mTabContainer;
    var indicatorbox = gBrowser.tabContainer._tabDropIndicator.parentNode;
    var arrowscrollbox =  gBrowser.tabContainer.arrowScrollbox;
    var contents = document.getElementById('content');
    var sidebarbox = document.getElementById('sidebar-box');
    var sidebarsplitter = document.getElementById('sidebar-splitter');

    var navigatortoolbox = document.getElementById('navigator-toolbox');
    var browserbottombox = document.getElementById('browser-bottombox');

    //prepare for toolbox
    var verticalTabToolBox = navigatortoolbox.cloneNode(false);
    verticalTabToolBox.setAttribute("id","verticalTabToolBox");

    //prepare for splitter
    var vtbSplitter = document.createElement("splitter");
    vtbSplitter.setAttribute("id", "vtb_splitter");

    var grippy = document.createElement("grippy");
    vtbSplitter.appendChild(grippy);

    document.getElementById("browser").insertBefore(
      verticalTabToolBox, document.getElementById("appcontent")
    );
    document.getElementById("browser").insertBefore(
      vtbSplitter, document.getElementById("appcontent")
    );
    vtbSplitter.setAttribute('collapse', 'before');


    tabbrowsertabs.setAttribute('overflow', true);
    tabbrowsertabs.removeAttribute('orient');
    arrowscrollbox.removeAttribute('orient');
*/
var tabbrowsertabs = gBrowser.tabContainer;
tabbrowsertabs.setAttribute('orient', 'vertical');
var customizationTarget = document.getElementById("TabsToolbar-customization-target")
customizationTarget.setAttribute('orient', 'vertical');
var arrowscrollbox = gBrowser.tabContainer.arrowScrollbox;
var scrollbox = gBrowser.tabContainer.arrowScrollbox.scrollbox;
scrollbox.setAttribute('orient', 'vertical');
document.getElementById("new-tab-button").style.setProperty("visibility", "visible", "important")
document.getElementById("alltabs-button").style.setProperty("visibility", "visible", "important")


  gBrowser.tabContainer._getDropEffectForTabDrag = function(event){return "";}; // default "dragover" handler does nothing
  gBrowser.tabContainer.lastVisibleTab = function() {
    var tabs = this.childNodes;
    for (let i = tabs.length - 1; i >= 0; i--){
      if (!tabs[i].hasAttribute("hidden"))
        return i;
    }
    return -1;
  };
  gBrowser.tabContainer.clearDropIndicator = function() {
    var tabs = this.childNodes;
    for (let i = 0, len = tabs.length; i < len; i++){
      let tab_s= tabs[i].style;
      tab_s.removeProperty("box-shadow");
    }
  };
  gBrowser.tabContainer.addEventListener("drop",function(event){this.onDrop(event);},true);
  gBrowser.tabContainer.addEventListener("dragleave",function(event){this.clearDropIndicator(event);},true);
  gBrowser.tabContainer._onDragOver = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.clearDropIndicator();
    var newIndex = this._getDropIndex(event);
    if (newIndex == null)
      return;
    if (newIndex < this.childNodes.length) {
      if (this.childNodes[newIndex].pinned)
        this.childNodes[newIndex].style.setProperty("box-shadow","4px 0px 0px 0px #f00 inset","important");
      else
        this.childNodes[newIndex].style.setProperty("box-shadow","0px 2px 0px 0px #f00 inset, 0px -2px 0px 0px #f00","important");
    } else {
      newIndex = gBrowser.tabContainer.lastVisibleTab();
      if (newIndex >= 0)
      if (this.childNodes[newIndex].pinned)
        this.childNodes[newIndex].style.setProperty("box-shadow","-4px 0px 0px 0px #f00 inset","important");
      else
        this.childNodes[newIndex].style.setProperty("box-shadow","0px -2px 0px 0px #f00 inset, 0px 2px 0px 0px #f00","important");
    }
  };
  gBrowser.tabContainer.addEventListener("dragover", gBrowser.tabContainer._onDragOver, true);
  gBrowser.tabContainer._getDropIndex = function(aEvent, isLink) {
    var tabs = this.childNodes;
    for (let i = 0; i < tabs.length; i++){
      if(tabs[i].pinned) {
        if (aEvent.screenX >= tabs[i].boxObject.screenX &&
            aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width / 2 &&
            aEvent.screenY >= tabs[i].boxObject.screenY &&
            aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height)
          return i;
        if (aEvent.screenX >= tabs[i].boxObject.screenX + tabs[i].boxObject.width / 2 &&
            aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width &&
            aEvent.screenY >= tabs[i].boxObject.screenY &&
            aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height)
          return i + 1;
      }
    }
    for (let i = 0; i < tabs.length; i++){
      if(!tabs[i].pinned) {
        if (aEvent.screenY >= tabs[i].boxObject.screenY &&
            aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height / 2)
          return i;
        if (aEvent.screenY >= tabs[i].boxObject.screenY + tabs[i].boxObject.height / 2 &&
            aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height)
          return i + 1;
      }
    }
    return tabs.length;
  };
  gBrowser.tabContainer.onDrop = function(event) {
    var newIndex;
    this.clearDropIndicator();
    var dt = event.dataTransfer;
    var dropEffect = dt.dropEffect;
    var draggedTab;
    if (dt.mozTypesAt(0)[0] == TAB_DROP_TYPE) {
      draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
      if (!draggedTab)
        return;
    }
    if (draggedTab && dropEffect == "copy") {
    } else if (draggedTab && draggedTab.parentNode == this) {
      newIndex = this._getDropIndex(event, false);
      if (newIndex > draggedTab._tPos)
        newIndex--;
      gBrowser.moveTabTo(draggedTab, newIndex);
    }
    if (draggedTab && typeof draggedTab._dragData != "undefined") {
      delete draggedTab._dragData;
    }
  };
  
  gBrowser.tabContainer.addEventListener('SSTabRestoring', ensureVisible, false);
  gBrowser.tabContainer.addEventListener('TabSelect', ensureVisible, false);
  window.addEventListener('resize', ensureVisible, false);
  function ensureVisible(event) {
    let tab = gBrowser.selectedTab;
    let tabContainer = gBrowser.tabContainer;
    if ( tab.boxObject.screenY + tab.boxObject.height + 1 >
           tabContainer.boxObject.screenY + tabContainer.boxObject.height )
      tab.scrollIntoView(false);
    else if ( tab.boxObject.screenY < tabContainer.boxObject.screenY )
      tab.scrollIntoView(true);
  }

  PrintPreviewListener._toggleAffectedChrome_org = PrintPreviewListener._toggleAffectedChrome
  PrintPreviewListener._toggleAffectedChrome = function() {
    PrintPreviewListener._toggleAffectedChrome_org();
    if (!gInPrintPreviewMode)
      document.getElementById("main-window").removeAttribute("printpreview");
    else
      document.getElementById("main-window").setAttribute("printpreview", "true");

  };

  // width should be adjusted if parrent(#tabbrowser-tabs) container is overflowd
  gBrowser.tabContainer.addEventListener("overflow", function(event){
    let tabContainer = gBrowser.tabContainer;
    let arrowscrollbox =  tabContainer.arrowScrollbox;
    arrowscrollbox.style.setProperty("width",
                   (verticalTabbar_width - verticalScrollbar_width) + "px", "");
    tabContainer.style.setProperty("width", verticalTabbar_width + "px", "");
    tabContainer.style.removeProperty("--tab-min-width");
  }, false);
  
  gBrowser.tabContainer.addEventListener("underflow", function(event){
    let tabContainer = gBrowser.tabContainer;
    let arrowscrollbox =  tabContainer.arrowScrollbox;
    arrowscrollbox.style.setProperty("width", verticalTabbar_width + "px", "");
    tabContainer.style.setProperty("width", verticalTabbar_width + "px", "");
    tabContainer.style.removeProperty("--tab-min-width");
  }, false);


  // scroll with wheel
  document.getElementById("TabsToolbar").addEventListener("wheel",
    function MultiRowTabsScroll(event) {
      if (event.ctrlKey || event.altKey  || event.shiftKey)
        return;
      gBrowser.tabContainer.scrollTop += (event.deltaY > 0 ? 1 : -1) * verticalTab_height;
    }, true);

}