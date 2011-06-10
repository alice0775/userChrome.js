// ==UserScript==
// @name           zzzz-MultiRowTabforFx3.7.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    多段タブもどき実験版 CSS入れ替えまくりバージョン
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0a1
// @author         Alice0775
// @note           CSS checked it only on a defailt theme.
// @version        2011/04/23 css setTabWidthAutomatically
// @version        2011/04/21 dtopIndicator
// @version        2011/04/15 tryserver Bug 455694
// @version        2011/04/13 nightly
// ==/UserScript==


zzzz_MultiRowTab();


function zzzz_MultiRowTab(){
  // -- config --
  var SCROLLBARWIDTH = 25;
  var TABBROWSERTABS_MAXROWS = 3;
  var TAB_HEIGHT = 24;

  var TAB_MIN_WIDTH = 100;
  var TAB_MAX_WIDTH = 250;

  // -- config --

  // Tab Mix plus
  if("tablib" in window) return;
  // Tree Style tab
  if('TreeStyleTabService' in window) return;

  if (!gPrefService)
    gPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                                 .getService(Components.interfaces.nsIPrefBranch);
  gPrefService.setBoolPref("browser.tabs.autoHide", false);
  gPrefService.setBoolPref("browser.tabs.animate", false);

    /*タブが多い時に多段で表示するCSS適用 インラインを使用しないバージョン*/
    var style = <![CDATA[
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
      .tabbrowser-tabs
      {
        max-height: {TAB_HEIGHT}px;
        min-height: 0px;
        background-repeat: repeat !important;
        overflow-x: hidden;
        overflow-y: hidden;
      }
      
      .tabbrowser-tabs > .tabbrowser-tab:not([pinned]) {
        min-width: {TAB_MIN_WIDTH}px;
      }          

      .tabbrowser-tabs > .tabbrowser-tab:not([pinned])[fadein] {
        max-width: {TAB_MAX_WIDTH}px;
      }          
      .tabbrowser-tabs[positionpinnedtabs] > .tabbrowser-tab[pinned] {
        display: -moz-box!important;
        position: static !important;
      }          
      .tabbrowser-tabs .tabbrowser-arrowscrollbox
      {
        /*height: 78px;*/
        overflow: auto;
      }
      .tabbrowser-tabs .tabbrowser-arrowscrollbox > scrollbox
      {
        overflow: visible;
      }
      .tabbrowser-tabs .tabbrowser-arrowscrollbox > scrollbox > box
      {
        display: block;
        overflow: visible;
      }

      /* hide the scroll arrows and alltabs button */
      .tabbrowser-tabs .scrollbutton-up,
      .tabbrowser-tabs .scrollbutton-down
      {
        display: none;
      }

      .tabbrowser-tabs .tabbrowser-arrowscrollbox > .tabs-newtab-button
      {
        display: none;
      }
      #new-tab-button
      {
        visibility: visible !important;
      }

      .closing-tabs-spacer {
        height: 0px !important;
        width: 0px !important;
        display: none !important;
      }



      /* Tabs デフォテーマ*/
      .tabbrowser-tabs .tabbrowser-arrowscrollbox > scrollbox
      {
        margin-top: 0px;
        margin-bottom: 0px;
      }

        .tabbrowser-tab,
        .tabbrowser-tab:not([selected="true"]),
        .tabbrowser-tab[pinned="true"]:not([selected="true"]),
        .tabbrowser-tab[selected="true"],
        .tabbrowser-tab[pinned="true"][selected="true"]
        {
        -moz-appearance: none !important;
        min-height: {TAB_HEIGHT}px !important;
        max-height: {TAB_HEIGHT}px !important;
        margin: 0px !important;
        padding: 0px !important;
        border: 1px solid ThreeDShadow !important;

        -moz-border-radius-topleft : 0 !important;
        -moz-border-radius-topright : 0 !important;
        -moz-border-radius-bottomleft : 0 !important;
        -moz-border-radius-bottomright : 0 !important;
        }

        .tabbrowser-tab:not([selected="true"]):hover
        {
        background-color: ThreeDHighlight;
        }

        .tabbrowser-tab[selected="true"]:hover
        {
        background-color: ThreeDHighlight;
        }
        #TabsToolbar .toolbarbutton-1
        {
        height: 18px;
        }
        #TabsToolbar .toolbarbutton-1:hover
        {
        height: 18px;
        }
    ]]>.toString().replace(/\s+/g, " ")
       .replace(new RegExp("{TABBROWSERTABS_MAXHEIGHT}", "g"), TABBROWSERTABS_MAXROWS*multirowtabH())
       .replace(new RegExp("{TAB_HEIGHT}", "g"), TAB_HEIGHT)
       .replace(new RegExp("{TAB_MIN_WIDTH}", "g"), TAB_MIN_WIDTH)
       .replace(new RegExp("{TAB_MAX_WIDTH}", "g"), TAB_MAX_WIDTH);

  var sspi = document.createProcessingInstruction(
    'xml-stylesheet',
    'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
  );
  document.insertBefore(sspi, document.documentElement);
  sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
  };

  function multirowtabH() {
    var H;
    try {
      var tabs = gBrowser.tabContainer.childNodes;
      for (let i = 0, len = tabs.length; i < len; i++){
        if (!tabs[i].hasAttribute("hidden")) {
          var style = window.getComputedStyle(tabs[i], null);
          H = tabs[i].boxObject.height +
              parseInt(style.marginTop, 10) + parseInt(style.marginBottom , 10);
          break;
        }
      }
    } catch(e) {}
    return H;
  }

  TabView.hide = function() {
        if (!this.isVisible()) {
        return;
    }
    this._window.UI.exit();
    setTabWidthAutomatically({type:"resize"});
    setTimeout(function(){setTabWidthAutomatically({type:"resize"});}, 250);
  }

  //D&Dの調整
  var func = gBrowser.tabContainer._setEffectAllowedForDataTransfer.toString();
  func = func.replace(
    'event.screenX <= sourceNode.boxObject.screenX + sourceNode.boxObject.width',
    <><![CDATA[
    $& &&
    event.screenY > sourceNode.boxObject.screenY &&
    event.screenY < sourceNode.boxObject.screenY + sourceNode.boxObject.height
    ]]></>
  );
  eval("gBrowser.tabContainer._setEffectAllowedForDataTransfer = " + func);

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
      tab_s.removeProperty("border-left-color");
      tab_s.removeProperty("border-right-color");
    }
  };
  gBrowser.tabContainer.addEventListener("drop", gBrowser.tabContainer.clearDropIndicator, true);
  gBrowser.tabContainer.addEventListener("dragleave", gBrowser.tabContainer.clearDropIndicator, true);

  gBrowser.tabContainer._onDragOver = function(event) {
    this.MultiRowTabonDragOver(event);

    //event.stopPropagation();
      this.clearDropIndicator();
    var newIndex = this._getDropIndex(event);
    if (newIndex == null) {
      return;
    }

    if (newIndex < this.childNodes.length) {
      this.childNodes[newIndex].style.setProperty("border-left-color","red","important");
    } else {
      newIndex = gBrowser.tabContainer.lastVisibleTab();
      if (newIndex >= 0)
        this.childNodes[newIndex].style.setProperty("border-right-color","red","important");
    }
  };

  gBrowser.tabContainer.addEventListener("dragover", gBrowser.tabContainer._onDragOver, true);

  gBrowser.tabContainer._getDragTargetTab = function(event) {
    var tab = document.evaluate(
                'ancestor-or-self::*[local-name()="tab"][1]',
                event.originalTarget,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
    return tab;
  };

gBrowser.tabContainer._handleTabDrag = function(event) {
  let draggedTab = event.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0);
  if (!draggedTab.parentNode) // tab was closed during drag
    return;
  event.preventDefault();
  if (this._updateTabDetachState(event))
    return;

  let ltr = (window.getComputedStyle(this).direction == "ltr");
  let ind = this._tabDropIndicator;
  let newIndex = this._getDropIndex(event, draggedTab);
  let tabAtNewIndex = this.childNodes[newIndex > draggedTab._tPos ?
                                      newIndex-1 : newIndex];
  if (tabAtNewIndex.pinned != draggedTab.pinned)
    this._positionDropIndicator(ind, newIndex, 0, ltr);
  else
    ind.collapsed = true;

  // keep the dragged tab visually within the region of like tabs
  let tabs = this.tabbrowser.visibleTabs;
  let numPinned = this.tabbrowser._numPinnedTabs;
  let leftmostTab = draggedTab.pinned ? tabs[0] : tabs[numPinned];
  let rightmostTab = draggedTab.pinned ? tabs[numPinned-1] : tabs[tabs.length-1];
  let tabWidth = draggedTab.getBoundingClientRect().width;
  if (!ltr)
    [leftmostTab, rightmostTab] = [rightmostTab, leftmostTab];
  let left = leftmostTab.boxObject.screenX;
  let right = rightmostTab.boxObject.screenX + tabWidth;
  let transformX = event.clientX - draggedTab.__dragStartX;
  if (!draggedTab.pinned)
    transformX += this.mTabstrip.scrollPosition;
  let tabX = draggedTab.boxObject.screenX + transformX;
  draggedTab.__dragDistX = transformX;
  if (tabX < left)
    transformX += left - tabX;
  // prevent unintended overflow, especially in RTL mode
  else if (tabX + tabWidth > right)
    transformX += right - tabX - tabWidth - (ltr ? 0 : 1);

  if (!ltr)
    tabWidth *= -1;
  tabs.forEach(function(tab) {
    /*
    if (tab == draggedTab)
      tab.style.MozTransform = "translate(" + transformX + "px)";
    else if (tab.pinned != draggedTab.pinned)
      return;
    else if (tab._tPos < draggedTab._tPos && tab._tPos >= newIndex)
      tab.style.MozTransform = "translate(" + tabWidth + "px)";
    else if (tab._tPos > draggedTab._tPos && tab._tPos < newIndex)
      tab.style.MozTransform = "translate(" + -tabWidth + "px)";
    else
    */
      tab.style.MozTransform = "";
  });
}


  gBrowser.tabContainer._getDropIndex = function(aEvent) {
      var tabs = this.childNodes;
      var tab = this._getDragTargetTab(aEvent);
      if (window.getComputedStyle(this, null).direction == "ltr") {
      for (let i = 0; i < tabs.length; i++){
        if (aEvent.screenY > tabs[i].boxObject.screenY &&
            aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height) {
          if (aEvent.screenX > tabs[i].boxObject.screenX &&
              aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width / 2)
            return i;
          if (aEvent.screenX > tabs[i].boxObject.screenX + tabs[i].boxObject.width / 2 &&
              aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width)
            return i + 1;
        }
      }
    } else {
      for (let i = 0; i < tabs.length; i++){
        if (aEvent.screenY > tabs[i].boxObject.screenY &&
            aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height) {
          if (aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width &&
              aEvent.screenX > tabs[i].boxObject.screenX + tabs[i].boxObject.width / 2)
            return i;
          if (aEvent.screenX < tabs[i].boxObject.screenX + tabs[i].boxObject.width / 2 &&
              aEvent.screenX > tabs[i].boxObject.screenX)
            return i + 1;
        }
      }
    }
    return tabs.length;
  };

 gBrowser.tabContainer.MultiRowTabtimer = null;
 gBrowser.tabContainer.MultiRowTabscroll = true;

 gBrowser.tabContainer.MultiRowTabonDragOver = function(event) {
    var tabs = this.childNodes;
    if (tabs.length < 1)
      return false;
    if (!this.MultiRowTabscroll)
      return false;
    this.MultiRowTabscroll = false;
    this.MultiRowTabtimer = setTimeout(function(self){self.MultiRowTabscroll = true;}, 400, this);

    var y;
    if (this.boxObject.screenY + 10 > event.screenY) {
      y = this.boxObject.screenY - 20;
    } else if (this.boxObject.screenY + this.boxObject.height - 13
     < event.screenY) {
      y = this.boxObject.screenY + this.boxObject.height + 20;
    } else {
      return false;
    }

    var tab = null;
    for (var i = 0; i < tabs.length; i++) {
      if (y > tabs[i].boxObject.screenY &&
          y < tabs[i].boxObject.screenY + tabs[i].boxObject.height){
        tab = tabs[i];
        break;
      }
    }
    if (!tab)
    if (y < tabs[0].boxObject.screenY){
      tab = tabs[0]
    } else if (y > tabs[tabs.length - 1].boxObject.screenY
            + tabs[tabs.length - 1].boxObject.height){
      tab = tabs[tabs.length - 1]
    }
    try{
      var mShell = Components.classes["@mozilla.org/inspector/flasher;1"]
               .createInstance(Components.interfaces.inIFlasher);
      mShell.scrollElementIntoView(tab);
      return true;
    }catch(e){}
};


//ここからはタブ幅自動調整
  gBrowser.tabContainer._positionPinnedTabs = function() {
    this.mTabstrip.ensureElementIsVisible(this.selectedItem, false);
    return;
  }

  //タブ幅自動調整
  var tabbrowsertabs = gBrowser.mTabContainer;
  var arrowscrollbox = gBrowser.tabContainer.mTabstrip;
  var scrollbox = document.getAnonymousElementByAttribute(arrowscrollbox, "class", "arrowscrollbox-scrollbox");
  var newtabbutton = document.getAnonymousElementByAttribute(tabbrowsertabs, "anonid", "newtab-button");
  var allTabsbutton = document.getAnonymousElementByAttribute(tabbrowsertabs, "anonid", "alltabs-button");
  var tabsclosebutton = gBrowser.tabContainer.mTabstripClosebutton;

  window.setTabWidthAutomatically =function(event) {


    var allTabs = gBrowser.tabs; 
    var w1 = w2 =0, n = 0;
    for (let i=0, len=allTabs.length; i<len; i++) {
      if (!allTabs.item(i).getAttribute("hidden")) {
        if (allTabs[i].getAttribute("pinned")) {
          w1 += allTabs[i].boxObject.width;
        } else {
          w2 +=  TAB_MIN_WIDTH;
          n++;
        }
      }
    }

    if (event &&
        event.type=="TabOpen") {
      arrowscrollbox.style.setProperty("height", arrowscrollbox.boxObject.height + "px", "");
    }

    if (event &&
        event.type=="TabClose") {
      w2 -=  TAB_MIN_WIDTH;
      n--;
    }

    var remain = scrollbox.boxObject.width - w1;
    //userChrome_js.debug("r= "+remain);
    //userChrome_js.debug("n= "+n);
    var flg = false;
    if (n > 0) {
      let w = Math.floor(remain / n);
      if (w > TAB_MIN_WIDTH) {
        flg = true;
        w = Math.min(w, TAB_MAX_WIDTH);
        for (let i=0, len=allTabs.length; i<len; i++) {
          if (!allTabs[i].getAttribute("pinned") && 
              !allTabs[i].getAttribute("hidden")) {
            allTabs[i].style.setProperty("min-width", w+"px", "");
          }
        }
      } else {
        for (let i=0, len=allTabs.length; i<len; i++) {
          if (!allTabs[i].getAttribute("pinned")) {
            allTabs[i].style.removeProperty("min-width");
          }
        }
      }
    }

    var bottom = m = 0;
    n = 0;
    for(let i = 0; i < gBrowser.mTabs.length; i++) {
      let aTab = gBrowser.mTabs[i];
      aTab.style.removeProperty("-moz-margin-start");
      aTab.setAttribute("context", "tabContextMenu");
      maxbottom = aTab.boxObject.y + aTab.boxObject.height;
      if (bottom < maxbottom) {
        bottom = maxbottom
        n++;
        m = 1;
      } else {
        m = 0;
      }
    }
    
    gBrowser.tabContainer.style.removeProperty("-moz-margin-start");
    // persona privent unexpected vertical scroll bar
    if (scrollbox.boxObject.height > TABBROWSERTABS_MAXROWS * multirowtabH()) {
      arrowscrollbox.style.setProperty("overflow-y", "auto", "important")
    } else {
      arrowscrollbox.style.setProperty("overflow-y", "hidden", "important");
    }

    if (event && event.type=="resize") {
      arrowscrollbox.style.setProperty("height", (n) * multirowtabH() + "px", "");
      setTimeout(function(){arrowscrollbox.style.setProperty("height", scrollbox.boxObject.height + "px", "");}, 250);
    } else if (event && event.type=="TabClose" && m == 1) {
      arrowscrollbox.style.setProperty("height", (n - 1) * multirowtabH() + "px", "");
      setTimeout(function(){arrowscrollbox.style.setProperty("height", scrollbox.boxObject.height + "px", "");}, 250);
    } else if (!flg) {
      arrowscrollbox.style.setProperty("height", scrollbox.boxObject.height + "px", "");
    } else {
      arrowscrollbox.style.removeProperty("height");
    }
    gBrowser.mTabContainer.style.setProperty("max-height", TABBROWSERTABS_MAXROWS * multirowtabH()+"px", "");
  };
  
  window.setTabWidthAutomatically2 =function(event) {
    if (event.target.getAttribute("selected") != "true")
      setTabWidthAutomatically(event);
    else
      setTimeout(function(){setTabWidthAutomatically(event);}, 250);
  }

  //pref読み込み
  function getPref(aPrefString, aPrefType, aDefault) {
    var xpPref = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    try{
      switch (aPrefType){
        case "str":
          return xpPref.getCharPref(aPrefString).toString(); break;
        case "int":
          return xpPref.getIntPref(aPrefString); break;
        case "bool":
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  }

  //以下はタブ幅自動調整のためのイベント登録
  setTimeout(function(){setTabWidthAutomatically({type:"resize"});}, 10);
  window.addEventListener("resize", function(event) {
    if(event.originalTarget==window)
      setTabWidthAutomatically(event);
  }, true);


  //初回起動時ダミーイベント
  setTimeout(function(){
      var event = document.createEvent("Events");
      event.initEvent("resize", true, false);
      window.dispatchEvent(event);
  }, 800);
  setTimeout(function(){
      var event = document.createEvent("Events");
      event.initEvent("resize", true, false);
      window.dispatchEvent(event);
  }, 2000);

  gBrowser.tabContainer.addEventListener('TabClose', setTabWidthAutomatically2,false);
  gBrowser.tabContainer.addEventListener('TabOpen', setTabWidthAutomatically,false);

  //ここからは, 現在のタブがいつも見えるようにスクロールさせる
  gBrowser.tabContainer.addEventListener('TabSelect', ensureVisible, false);
  function ensureVisible(event){
    setTimeout(function(){setTabWidthAutomatically({type:"resize"});}, 250);
    if (event.target.selected)
      ensureVisibleElement(event.target);
  }
  function ensureVisibleElement(aTab){
    try{
      var mShell = Components.classes["@mozilla.org/inspector/flasher;1"]
               .createInstance(Components.interfaces.inIFlasher);
      mShell.scrollElementIntoView(aTab);
    }catch(e){}
  }
  gBrowser.tabContainer.mTabstrip.ensureElementIsVisible = ensureVisibleElement;


  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }

}
