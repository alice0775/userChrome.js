// ==UserScript==
// @name           zzzz-MultiRowTabforFx3.7.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    多段タブもどき実験版 CSS入れ替えまくりバージョン
// @include        main
// @compatibility  Firefox 3.7a3pre
// @author         Alice0775
// @note           CSS checked it only on a defailt theme.
// @version        2010/08/12 Bug 574217 - Land TabCandy on trunk
// @version        2010/03/15 00:00  Minefield/3.7a3pre Bug 347930 -  Tab strip should be a toolbar instead
// @version        2010/03/11 00:00  Minefield/3.7a3pre Bug 481904 -  Tab dragging in tabbar stops scrolling at the tabs position when dragging to first/last tab and back
// @version        2010/03/10 00:00  Minefield/3.7a3pre Bug 508499 -  simplify tab drop indicator code and styling
// ==/UserScript==


zzzz_MultiRowTab();


function zzzz_MultiRowTab(){
      if (!gPrefService)
        gPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                                     .getService(Components.interfaces.nsIPrefBranch);
      // -- config --
      gPrefService.setIntPref("browser.tabs.tabMaxWidth", 250);
      gPrefService.setIntPref("browser.tabs.tabClipWidth", 100);
      //gPrefService.setIntPref("browser.tabs.closeButtons", 0);
      gPrefService.setBoolPref("browser.tabs.autoHide", false);
      function multirowtabH() {
        var H, aNode;
        try {
          var style = window.getComputedStyle(gBrowser.tabs[0], null);
          H = gBrowser.tabs[0].boxObject.height +
              parseInt(style.marginTop, 10) + parseInt(style.marginBottom , 10);
        } catch(e) {}
        //debug(gBrowser.tabs[0].boxObject.height);
        //debug(H);
        return H;
      }
      /*デフォテーマのままのとき*/
      var SCROLLBARWIDTH = 25;
      var ARROWSCROLLBOX_LEFTMARGIN = 3; //調整必要 (マージンやボーダーの分)
      var ARROWSCROLLBOX_MARGIN = 2;     //調整必要 (マージンやボーダーの分)
      var TABBROWSERTABS_MAXHEIGHT = 3 * (multirowtabH() - 1) - 1; /* 3段の場合 */
      // -- config --

      // Tab Mix plus
      if("tablib" in window) return;
      // Tree Style tab
      if('TreeStyleTabService' in window) return;

        /*タブが多い時に多段で表示するCSS適用 インラインを使用しないバージョン*/
        var style = <><![CDATA[
          @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
          .tabbrowser-tabs
          {
            max-height: {TABBROWSERTABS_MAXHEIGHT}px;
            min-height: 0px;

            background-repeat: repeat !important;
            overflow-x: hidden;
            overflow-y: hidden;
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
          .tabbrowser-tabs .scrollbutton-down,
          .tabbrowser-tabs .tabbrowser-arrowscrollbox > .tabs-newtab-button
          {
            display: none;
          }

          /* visible the newtabbutton */
          .tabbrowser-tabs > .tabs-newtab-button
          {
            visibility: visible !important;
          }





          /* Tabs デフォテーマ*/
          .tabbrowser-tabs .tabbrowser-arrowscrollbox > scrollbox
          {
            margin-top: 2px;
            margin-bottom: 0px;
          }

          .tabbrowser-tab {
            margin: 0px 0px 2px ;
            padding: 1px 1px 1px 1px ;
            border: 1px solid ;
            border-right-width: 1px ;
            border-bottom: none ;
            -moz-border-radius-topleft: 4px;
            -moz-border-radius-topright: 4px;
            -moz-border-top-colors: threedshadow;
            -moz-border-right-colors: threedshadow;
            -moz-border-left-colors: threedshadow;
          }

          .tabbrowser-tab:hover{
            margin: 0px 0px 2px ;
            padding: 1px 1px 1px 1px ;
            border: 1px solid ;
            border-bottom: none ;
            -moz-border-top-colors: threedshadow;
            -moz-border-right-colors: threedshadow;
            -moz-border-left-colors: threedshadow;
          }

          .tabbrowser-tab:not([selected="true"]):hover {
            margin: 0px 0px 2px ;
            padding: 1px 1px 1px 1px ;
            border: 1px solid ;
            border-bottom: none ;
            -moz-border-top-colors: threedshadow;
            -moz-border-right-colors: threedshadow;
            -moz-border-left-colors: threedshadow;
          }

          .tabbrowser-tab[selected="true"] {
            margin: 0px 0px 0px ;
            padding: 1px 1px 3px 1px ;
            border: 1px solid ;
            border-bottom: none ;
            -moz-border-top-colors: threedshadow;
            -moz-border-right-colors: threedshadow;
            -moz-border-left-colors: threedshadow;
          }



        ]]></>.toString().replace(/\s+/g, " ").replace("{TABBROWSERTABS_MAXHEIGHT}",TABBROWSERTABS_MAXHEIGHT);

      var sspi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
      );
      document.insertBefore(sspi, document.documentElement);
      sspi.getAttribute = function(name) {
        return document.documentElement.getAttribute(name);
      };


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


      gBrowser.tabContainer._onDragOver = function(event) {
        event.stopPropagation();

        var effects = this._setEffectAllowedForDataTransfer(event);

        var ind = this._tabDropIndicator;
        if (effects == "" || effects == "none") {
          ind.collapsed = true;
          //this._continueScroll(event);
          return;
        }
        event.preventDefault();
        event.stopPropagation();

        var tabStrip = this.mTabstrip;
        var ltr = (window.getComputedStyle(this, null).direction == "ltr");

        // autoscroll the tab strip if we drag over
        //xxx Bug 481904
        if (this.MultiRowTabonDragOver(event))
          return;

        if (effects == "link") {
          let tab = this._getDragTargetTab(event);
          if (tab) {
            if (!this._dragTime)
              this._dragTime = Date.now();
            if (Date.now() >= this._dragTime + this._dragOverDelay)
              this.selectedItem = tab;
            return;
          }
        }

        var newIndex = this._getDropIndex(event);
//debug("newIndex "+ newIndex)
        var scrollRect = tabStrip.scrollClientRect;
        var rect = this.getBoundingClientRect();
        var minMargin = scrollRect.left - rect.left;
        var maxMargin = Math.min(minMargin + scrollRect.width,
                                 scrollRect.right);
        if (!ltr)
          [minMargin, maxMargin] = [this.clientWidth - maxMargin,
                                    this.clientWidth - minMargin];
        var newMargin;

          if (newIndex == this.childNodes.length) {
            let tabRect = this.childNodes[newIndex-1].getBoundingClientRect();
            if (ltr)
              newMargin = tabRect.right - rect.left;
            else
              newMargin = rect.right - tabRect.left;
          }
          else {
            let tabRect = this.childNodes[newIndex].getBoundingClientRect();
            if (ltr)
              newMargin = tabRect.left - rect.left;
            else
              newMargin = rect.right - tabRect.right;
          }
          // ensure we never place the drop indicator beyond our limits
          if (newMargin < minMargin)
            newMargin = minMargin;
          else if (newMargin > maxMargin)
            newMargin = maxMargin;

        ind.collapsed = false;

        newMargin += ind.clientWidth / 2;
        if (!ltr)
          newMargin *= -1;

        ind.style.MozTransform = "translate(" + Math.round(newMargin) + "px)";
        ind.style.MozMarginStart = (-ind.clientWidth) + "px";
        //ind.style.marginTop = (-ind.clientHeight) + "px";

        var _top = /*(-ind.clientHeight)*/
                   + (this.childNodes[newIndex - ((newIndex == this.childNodes.length)? 1: 0)].boxObject.screenY
                    - this.boxObject.screenY);
        if (this.boxObject.height > _top + ind.clientHeight)
          ind.style.MozMarginStart = -1000;
        ind.style.marginTop = _top + 'px';
//debug(ind.style.marginTop + "  " + ind.style.MozTransform)
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
          mShell.scrollElementIntoView(tabs[i]);
          return true;
        }catch(e){}
    };


    //ここからはタブ幅自動調整
      //タブ幅自動調整
      var tabbrowsertabs = gBrowser.mTabContainer;
      var arrowscrollbox = gBrowser.tabContainer.mTabstrip;
      var newtabbutton = document.getAnonymousElementByAttribute(tabbrowsertabs, "anonid", "newtab-button");
      var allTabsbutton = document.getAnonymousElementByAttribute(tabbrowsertabs, "anonid", "alltabs-button");
      var tabsclosebutton = gBrowser.tabContainer.mTabstripClosebutton;


      gBrowser.tabContainer.MultiRowTabIsHidden = function(aTab) {
        return aTab.getAttribute("hidden");
      };

      gBrowser.tabContainer.MultiRowTabNumberOfActiveTab = function() {
        var allTabs = gBrowser.tabs;
        var n =0;
        for (var i=0, len=allTabs.length; i<len; i++) {
          if (!allTabs[i].getAttribute("hidden"))
            n++;
        }
        return n;
      };
      gBrowser.tabContainer.MultiRowTabFirstActiveTab = function() {
        var allTabs = gBrowser.tabs;
        var n =0;
        for (var i=0, len=allTabs.length; i<len; i++) {
          if (!allTabs[i].getAttribute("hidden")) {
            n = i;
            break;
          }
        }
        return allTabs[n];
      };

      window.setTabWidthAutomatically =function(event, addTab, w) {
        var aTab;
        var max_width  = getPref("browser.tabs.tabMaxWidth", "int",250);
        var min_width  = getPref("browser.tabs.tabMinWidth", "int",100);

        if ("TM_init" in window) {
          //Tab Mix Lite CE, タブのドラッグ中box幅が大きくなるのを阻止
          var www = tabbrowsertabs.boxObject.width;
          tabbrowsertabs.maxWidth = www;
        }

        var boxwidth = arrowscrollbox.boxObject.width - ARROWSCROLLBOX_LEFTMARGIN;

        if(w) boxwidth = boxwidth - w;
        var allTabs = gBrowser.tabs;
        if(event && event.type=='TabClose')
          var nTabs =  Math.max(1, gBrowser.tabContainer.MultiRowTabNumberOfActiveTab() - 1);
        else
          var nTabs = gBrowser.tabContainer.MultiRowTabNumberOfActiveTab();

        if(addTab) nTabs++;
        var tabw = (boxwidth - SCROLLBARWIDTH) / nTabs;
        if(tabw > max_width)
          tabw = max_width;
        else if(tabw <  min_width){
          var nn = Math.floor(boxwidth / min_width);
          if(nn<1) nn = 1 ;
          tabw = (boxwidth - SCROLLBARWIDTH) /nn;
        }
        //tab-strip高さ
        tabw = Math.floor(tabw);
        var n = Math.max(1, Math.floor((tabw*nTabs)/(boxwidth - SCROLLBARWIDTH) + 0.99))
        var h = n * multirowtabH();
        arrowscrollbox.height = h + ARROWSCROLLBOX_MARGIN;

        // persona privent unexpected vertical scroll bar
        if (tabbrowsertabs.height > TABBROWSERTABS_MAXHEIGHT) {
          tabbrowsertabs.setAttribute("overflow", true);
        } else {
          tabbrowsertabs.removeAttribute("overflow");
        }

        //このifブロックは, 現在のタブがいつも見えるようにスクロールさせる
        if(event && event.type == 'TabOpen'){
          aTab = event.target;
          if (aTab.selected)
            ensureVisibleElement(aTab);
        } else {
          setTimeout(function(){
            aTab = gBrowser.mCurrentTab;
            ensureVisibleElement(aTab);
          },100);
        }

        //無駄なループをオミット
        if(event && event.type=='resize' && gBrowser.tabContainer.MultiRowTabFirstActiveTab().minWidth == tabw) return;
        if(event && "localName" in event.target &&
           event.target.localName=='tab' && gBrowser.tabContainer.MultiRowTabFirstActiveTab().minWidth == tabw){
          aTab = event.target;
          aTab.maxWidth = tabw;
          aTab.minWidth = tabw;
          aTab.style.width = tabw + "px";
          return;
        }
        for (var i=0, len=allTabs.length; i<len; i++) {
          aTab = allTabs[i];
          if (!gBrowser.tabContainer.MultiRowTabIsHidden(aTab)) {
            aTab.maxWidth = tabw;
            aTab.minWidth = tabw;
            aTab.style.width = tabw + "px";
          }
        }
      }

      window.setTabWidthAutomatically2 =function(event) {
        var max_width  = getPref("browser.tabs.tabMaxWidth", "int",250);
        var min_width  = getPref("browser.tabs.tabMinWidth", "int",100);

        var boxwidth = arrowscrollbox.boxObject.width - ARROWSCROLLBOX_LEFTMARGIN;

        var allTabs = gBrowser.tabs;
        var nTabs = Math.max(1, gBrowser.tabContainer.MultiRowTabNumberOfActiveTab() - 1);

        setTimeout(function(allTabs,nTabs){
          var tabw = (boxwidth - SCROLLBARWIDTH) / nTabs;
          if(tabw > max_width)
            tabw = max_width;
          else if(tabw <  min_width){
            var nn = Math.floor(boxwidth / min_width);
            if(nn<1) nn = 1 ;
            tabw = (boxwidth - SCROLLBARWIDTH) /nn;
          }

        //tab-strip高さ
        tabw = Math.floor(tabw);
        var n = Math.max(1, Math.floor((tabw*nTabs)/(boxwidth - SCROLLBARWIDTH) + 0.99))
        var h = n * multirowtabH();
        arrowscrollbox.height = h + ARROWSCROLLBOX_MARGIN;

          // persona privent unexpected vertical scroll bar
          if (tabbrowsertabs.height > TABBROWSERTABS_MAXHEIGHT) {
            tabbrowsertabs.setAttribute("overflow", true);
          } else {
            tabbrowsertabs.removeAttribute("overflow");
          }

          for (var i=0, len=allTabs.length; i<len; i++) {
            var aTab = allTabs[i];
            if (!gBrowser.tabContainer.MultiRowTabIsHidden(aTab)) {
              aTab.maxWidth = tabw;
              aTab.minWidth = tabw;
              aTab.style.width = tabw + "px";
            }
          }
        },250,allTabs,nTabs);
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
      setTimeout(function(){setTabWidthAutomatically();}, 10);
      window.addEventListener("resize", function(event) {
          setTabWidthAutomatically(event);
      }, false);


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

      //xxx context fx4.0b2pre
      gBrowser.tabContainer.addEventListener('SSTabRestored', tabOpened, false);
      gBrowser.tabContainer.addEventListener('TabOpen', tabOpened,false);
      //起動時のタブ状態復元
      tabinit(0);
      function tabinit(i){
        if(i < gBrowser.mTabs.length){
          var aTab = gBrowser.mTabs[i];
          aTab.setAttribute("context", "tabContextMenu");
        }
      }
      function tabOpened(event) {
        var aTab = event.target;
        aTab.setAttribute("context", "tabContextMenu");
      }

      gBrowser.tabContainer.addEventListener('TabClose', setTabWidthAutomatically2,false);
      gBrowser.tabContainer.addEventListener('SSTabRestored', ensureVisible, false);
      gBrowser.tabContainer.addEventListener('TabOpen', setTabWidthAutomatically,false);

      //ここからは, 現在のタブがいつも見えるようにスクロールさせる
      gBrowser.tabContainer.addEventListener('TabSelect', ensureVisible, false);
      function ensureVisible(event){
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

  //デバッグ用
  function debug(aMsg){
        Cc["@mozilla.org/consoleservice;1"]
          .getService(Ci.nsIConsoleService)
          .logStringMessage(aMsg);
  }
}
