// ==UserScript==
// @name           zzzz-VerticalTabbarforFx8.0.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    CSS入れ替えまくりバージョン
// @include        main
// @compatibility  Nightly9.0a1
// @author         Alice0775
// @note           デフォルトテーマ
// @version        2011/09/16 13:30 resize時の実行方法
// @version        2011/09/16 resize時の実行方法
// @version        2011/09/13 Menu bar非表示の時
// @version        2011/08/20 デタッチ中タブがシフトしてしまう
// @version        2011/08/16 pinnedタブ とりあえず見かけは普通のタブと同じ(ただしボーダのみハイライト))
// @version        2011/08/15 Nightly8.0a1
// @version        2011/04/15 tryserver Bug 455694
// @version        2011/04/22 13:00 Bug 648368 - Add Aurora branding, switch default branding from "Minefield" to "Nightly"
// ==/UserScript==
// @version        2010/07/22 12:00 tab context
// @version        2010/06/24 23:00 ウインドサイズがおかしくなるので rendering stop/startは止め
// @version        2010/05/04 08:00 選択タブ色
// @version        2010/04/28 08:00 Bug 457187  - Make the tabs toolbar customizable
// @version        2010/04/06 18:00  不要なメニュー
// @version        2010/03/24 18:00  tab style
// @version        2010/03/24 00:00  ポップアップの時非表示
// @version        2010/03/22 01:10  D&D
// @version        2010/03/21 18:50  フルスクリーンの時タブバー表示/非表示
// @version        2010/03/20 21:00  マージン
// @version        2010/03/20 15:10  タブのデタッチ範囲
// @version        2010/03/20 15:10  プリントプレビュー時は非表示
// @version        2010/03/20 14:40  splitterリサイズしたときにタブ幅追従するように
// @version        2010/03/20 14:10  grippy追加
// @version        2010/03/20 09:00  D&D
// @version        2010/03/20 07:50  フルスクリーンの時タブバー非表示およびツールバーの状態に応じて大きさの調整
// @version        2010/03/20 07:35  2010/03/20 07:30のリグレッション:リサイズ時にタブが見えるように
// @version        2010/03/20 07:30  サイドバー開いたとき
// @version        2010/03/20 07:00  リサイズ時にタブが見えるように
// @version        2010/03/15 00:00  Minefield/3.7a3pre Bug 347930 -  Tab strip should be a toolbar instead
// @license        The MIT License

function zzzz_VerticalTabbar(){
      if (!gPrefService)
        gPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                                     .getService(Components.interfaces.nsIPrefBranch);
      // -- config --
      var TABBARWIDTH = 80;
      var TABBARLEFTMERGINE = 1;
      gPrefService.setIntPref("browser.tabs.tabMaxWidth", 250);
      gPrefService.setIntPref("browser.tabs.tabMinWidth", 0);
      gPrefService.setIntPref("browser.tabs.tabClipWidth", 40);
      // -- config --

      var TOOLBARBUTTON_AS_TAB = true;
      // xxx Bug 380960 - Implement closing tabs animation
      gPrefService.setBoolPref("browser.tabs.animate", false);
      gPrefService.setBoolPref("browser.tabs.autoHide", false);

     // Tab Mix plus
      if("tablib" in window) return;
      // Tree Style tab
      if('TreeStyleTabService' in window) return;

      //window['piro.sakura.ne.jp'].stopRendering.stop();

      for (var i = 0; i < gBrowser.tabs.length; i++) {
        gBrowser.tabs[i].removeAttribute("maxwidth");
      }

      /*タブ縦置きCSS適用*/
      var style = <![CDATA[
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);

        /*不要なメニュー*/
        menuitem[command="cmd_ToggleTabsOnTop"],
        menuitem[command="cmd_ToggleTabsOnTop"] + menuseparator
        {
        visibility:collapse;
        }

        #TabsToolbar
        {
        position:fixed;
        left: 0px;
        right: 0px;
        /*top: 80px;
        bottom: 20px;*/
        width: {TABBARWIDTH}px;
        overflow-x: hidden;
        overflow-y: hidden;
        }

        /*xxx Bug 574434*/
        #navigator-toolbox[tabsontop="true"] > #toolbar-menubar[autohide="true"] ~ #nav-bar
        {
         -moz-padding-start: 10em !important;
        }
        #navigator-toolbox[tabsontop="true"] > #toolbar-menubar[autohide="true"] ~ #TabsToolbar
        {
         -moz-padding-start: 0em !important;
        }

        #tabbrowser-tabs > hbox
        {
        position:fixed;
        left: 0px;
        right: 0px;
        /*top: 80px;
        bottom: 20px;*/
        width: 5px;
        overflow-x: hidden;
        overflow-y: hidden;
        }

        #tabbrowser-tabs
        {
        /*height: 100% !important;*/
        width: 100% !important;
        -moz-box-orient: vertical !important;
        /*should delete orient="horizontal"*/
        overflow-x:hidden;
        }

        #tabbrowser-tabs > arrowscrollbox
        {
        -moz-box-orient: vertical !important;
        /*should delete orient="horizontal"*/
        }

        #tabbrowser-tabs > arrowscrollbox > scrollbox
        {
        overflow-y: auto;
        -moz-box-orient: vertical !important;

        }

        #tabbrowser-tabs > arrowscrollbox > scrollbox > box
        {

        -moz-box-orient: vertical !important;
        }

        #tabbrowser-tabs > arrowscrollbox > .scrollbutton-up,
        #tabbrowser-tabs > arrowscrollbox > .scrollbutton-down
        {
        visibility:collapse;
        }

        .tabbrowser-tab[pinned],
        .tabbrowser-tab:not([pinned])
        {
        min-width: 100% !important;
        max-width: 100% !important;
        }

        /*タブのアニメーションoff*/
        .tabbrowser-tabs[drag=detach] > .tabbrowser-tab[dragged]:not(:only-child) {
          min-width: 100% !important;
          max-width: 100% !important;
          -moz-transition: max-width 0ms ease-out !important;
        }

        .tabbrowser-tabs[drag=move] > .tabbrowser-tab[fadein]:not([dragged]) {
          -moz-transition: -moz-transform 0ms ease-out !important;
        }

        .tabbrowser-tabs[drag=finish] > .tabbrowser-tab[dragged][fadein] {
          -moz-transition: -moz-transform 0ms ease-out !important;
        } 


        /*フルスクリーン*/
        #verticalTabToolBox[moz-collapsed="true"],
        #vtb_splitter[moz-collapsed="true"]
        {
        visibility:collapse;
        }


        /*ポップアップの時*/
        #main-window[chromehidden~="extrachrome"] #TabsToolbar,
        #main-window[chromehidden~="extrachrome"] #verticalTabToolBox,
        #main-window[chromehidden~="extrachrome"] #vtb_splitter
        {
        visibility: collapse;
        }

        /*プリントプレビュー*/
        #print-preview-toolbar[printpreview="true"] ~ #browser #verticalTabToolBox,
        #print-preview-toolbar[printpreview="true"] ~ #browser #vtb_splitter
        {
        visibility:collapse;
        }

         /*default theme要調整*/
        /* Fx3.7a2*/
        toolbarbutton:not([id="back-button"]):not([id="forward-button"])
        {
        margin-top:0px; //?
        }

        .tabbrowser-tab,
        .tabbrowser-tab:not([selected="true"])
        {
        -moz-appearance: none !important;
        min-height: 24px;
        max-height: 24px;
        margin: 0 !important;
        padding: 1px 0 2px 0 !important;

        border: 1px solid ThreeDShadow;
        border-bottom: 1px solid transparent;

        -moz-border-radius-topleft : 0 !important;
        -moz-border-radius-topright : 0 !important;
        -moz-border-radius-bottomleft : 0 !important;
        -moz-border-radius-bottomright : 0 !important;

        /*background-image: url("chrome://browser/skin/tabbrowser/tab-bkgnd.png");*/
        }

        .tabbrowser-tab:last-child,
        .tabbrowser-tab:not([selected="true"]):last-child
        {
        border-bottom: 1px solid ThreeDShadow;
        }

        .tabbrowser-tab[selected="true"]
        {
        padding: 0px 0 2px 0 !important;
        /*background-image: url("chrome://browser/skin/tabbrowser/tab-active-bkgnd.png");*/
        /*background-color: ThreeDHighlight;*/
        }

        .tabbrowser-tab[pinned]
        {
        border-color: ThreeDHighlight;
        }

        .tabbrowser-tab:not([selected="true"]):hover
        {
        background-color: ThreeDHighlight;
        }

        .tabbrowser-tab[selected="true"]:hover
        {
        background-color: ThreeDHighlight;
        }



        #TabsToolbar > toolbarbutton[collapsed="true"],
        #TabsToolbar > toolbarbutton[hidden="true"]
        {
        display:none;
        }
        #TabsToolbar > toolbarbutton
        {
        height: 18px;
        }

        #TabsToolbar > toolbarbutton:hover
        {
        height: 18px;
        }

      ]]>.toString();
      if (TOOLBARBUTTON_AS_TAB) {
        style += <![CDATA[
          #TabsToolbar > toolbarbutton:not([collapsed="true"]),
          #TabsToolbar > toolbarbutton:not([hidden="true"])
          {
          width:100% !important;
          }
       ]]>.toString();

      }
      style = style.replace(/\s+/g, " ")
      .replace("{TABBARWIDTH+TABBARLEFTMERGINE}", TABBARWIDTH + TABBARLEFTMERGINE)
      .replace(/\{TABBARWIDTH\}/g, TABBARWIDTH);
      var sspi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
      );

      document.insertBefore(sspi, document.documentElement);
      sspi.getAttribute = function(name) {
        return document.documentElement.getAttribute(name);
      };

      var tabsToolbar = document.getElementById('TabsToolbar');
      var tabbrowsertabs = gBrowser.mTabContainer;
      var indicatorbox = gBrowser.tabContainer._tabDropIndicator.parentNode;
      var arrowscrollbox = gBrowser.tabContainer.mTabstrip;
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

      //pinned
      gBrowser.tabContainer._positionPinnedTabs = function() {
        /*何もしない*/
      };

      //フルスクリーン
      var func = FullScreen.mouseoverToggle.toString();
      func = func.replace(
      /\{/,
      <><![CDATA[
        $&
        if (!aShow) {
          verticalTabToolBox.setAttribute("moz-collapsed", 'true');
          vtbSplitter.setAttribute("moz-collapsed", 'true');
          document.getElementById('TabsToolbar').setAttribute("moz-collapsed", 'true');
        } else {
          verticalTabToolBox.removeAttribute("moz-collapsed");
          vtbSplitter.removeAttribute("moz-collapsed");
          document.getElementById('TabsToolbar').removeAttribute("moz-collapsed");
        }
        ]]></>
      );
      eval("FullScreen.mouseoverToggle = " + func);

      //xxx context fx4.0b2pre
      gBrowser.tabContainer.addEventListener('TabOpen', tabOpened, false);
      gBrowser.tabContainer.addEventListener('SSTabRestored', tabOpened, false);
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

       gBrowser.tabContainer.VerticalTabbarTabtimer = null;
       gBrowser.tabContainer.VerticalTabbarTabscroll = true;

       gBrowser.tabContainer.VerticalTabbarOnDragOver = function(event) {
          var tabs = this.childNodes;
          if (tabs.length < 1)
            return false;
          if (!this.VerticalTabbarTabscroll)
            return false;
          this.VerticalTabbarTabscroll = false;
          this.VerticalTabbarTabtimer = setTimeout(function(self){self.VerticalTabbarTabscroll = true;}, 400, this);

          var y;
          var box = this.mTabstrip;
          if (box.boxObject.screenY + 20 > event.screenY) {
            y = box.boxObject.screenY - 20;
          } else if (box.boxObject.screenY + box.boxObject.height - 13 < event.screenY) {
            y = box.boxObject.screenY + box.boxObject.height + 20;
          } else {
            return false;
          }

          var tab = null;
          for (var i = 0; i < tabs.length; i++) {
            if (y >= tabs[i].boxObject.screenY &&
                y <= tabs[i].boxObject.screenY + tabs[i].boxObject.height){
              tab = tabs[i];
              break;
            }
          }
          if (!tab)
          if (y <= tabs[0].boxObject.screenY){
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

      //D&Dの調整
      var func = gBrowser.tabContainer._handleTabDrag.toString();
      /*
      func = func.replace(
      '{',
      '{if ("userChrome_js" in window) userChrome_js.debug("_handleTabDrag");'
      )
      */
      func = func.replace(
      'draggedTab.style.MozTransform = "translate(" + transformX + "px)";',
      'draggedTab.style.MozTransform = "";'
      )
      func = func.replace(
      'tab.style.MozTransform = "translate(" + tabWidth + "px)";',
      'tab.style.MozTransform = "";'
      )
      func = func.replace(
      'tab.style.MozTransform = "translate(" + -tabWidth + "px)";',
      'tab.style.MozTransform = "";'
      )
      func = func.replace(
      'tab.style.MozTransform = "translate(" + - tabWidth + "px)";',
      'tab.style.MozTransform = "";'
      )
      
      gBrowser.tabContainer._handleTabDrag = new Function(
         func.match(/\((.*)\)\s*\{/)[1],
         func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
      );
/*      
      func = gBrowser.tabContainer._slideTab.toString();
      func = func.replace(
      'let destination = "translate(" + displacement + "px)";',
      'let destination = "translate(0px)";'
      )
      
      gBrowser.tabContainer._slideTab = new Function(
         func.match(/\((.*)\)\s*\{/)[1],
         func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
      );
*/

      func = gBrowser.tabContainer._handleTabDrop.toString();
      func = func.replace(
      '{',
      '{if ("userChrome_js" in window) userChrome_js.debug("_handleTabDrop");'
      )
      gBrowser.tabContainer._handleTabDrop = new Function(
         func.match(/\((.*)\)\s*\{/)[1],
         func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
      );







      gBrowser.tabContainer._positionDropIndicator = function _positionDropIndicator(event, scrollOnly) {
        var effects = event.dataTransfer ? this._setEffectAllowedForDataTransfer(event) : "";
//debug("effects "+ effects);

        var ind = this._tabDropIndicator;
        if (effects == "none") {
          ind.collapsed = true;
          return;
        }
        event.preventDefault();
        event.stopPropagation();

        var ind = this._tabDropIndicator;
        var tabStrip = this.mTabstrip;

        // autoscroll the tab strip if we drag over
        //xxx Bug 481904
        if (this.VerticalTabbarOnDragOver(event)) {
          //return;
        }
//debug("scrollOnly " + scrollOnly);
/*
        if (scrollOnly) {
          ind.collapsed = true;
          return;
        }
*/
        if (effects == "link") {
          let tab = this._getDragTargetTab(event);
          if (tab) {
            if (!this._dragTime)
              this._dragTime = Date.now();
            if (Date.now() >= this._dragTime + this._dragOverDelay)
              this.selectedItem = tab;
            ind.collapsed = true;
            return;
          }
        }

        var newIndex = this._getDropIndex(event);
//debug("newIndex "+ newIndex);
        if (newIndex == null)
          return;
        var scrollRect = tabStrip.scrollClientRect;
        var rect = this.getBoundingClientRect();
        var minMargin = scrollRect.left - rect.left;
        var maxMargin = Math.min(minMargin + scrollRect.width,
                                 scrollRect.right);

        ind.collapsed = false;

        var newMargin = 8;

        ind.style.MozTransform = "translate(" + Math.round(newMargin) + "px)";
        ind.style.MozMarginStart = (-ind.clientWidth) + "px";
        if (newIndex < this.childNodes.length)
          var _top = (-ind.clientHeight*0.3)
                      + (this.childNodes[newIndex].boxObject.screenY
                      - this.boxObject.screenY);
        else
          var _top = (-ind.clientHeight*0.3)
                      + (this.childNodes[newIndex - 1].boxObject.screenY
                      + this.childNodes[newIndex - 1].boxObject.height
                      - this.boxObject.screenY);
        //if (this.boxObject.height > _top + ind.clientHeight)
        //  ind.style.MozMarginStart = -1000;
        ind.style.marginTop = _top + 'px';
        ind.removeAttribute('collapsed');
        indicatorbox.style.width = '5px';
      };

      gBrowser.tabContainer._getDragTargetTab = function _getDragTargetTab(event) {
          let tab = event.target.localName == "tab" ? event.target : null;
          if (tab &&
              (event.type == "drop" || event.type == "dragover") &&
              event.dataTransfer.dropEffect == "link") {
            let boxObject = tab.boxObject;
            if (event.screenY < boxObject.screenY + boxObject.height * .25 ||
                event.screenY > boxObject.screenY + boxObject.height * .75)
              return null;
          }
          return tab;
      };

      gBrowser.tabContainer._getDropIndex = function _getDropIndex(event, draggedTab) {
        var tabs = this.childNodes;
        var index = tabs.length;
        for (let i = 0; i < tabs.length; i++){
          if (event.screenY >= tabs[i].boxObject.screenY &&
              event.screenY <= tabs[i].boxObject.screenY + tabs[i].boxObject.height / 2) {
            index = i;
          }
          if (event.screenY > tabs[i].boxObject.screenY + tabs[i].boxObject.height / 2 &&
              event.screenY <= tabs[i].boxObject.screenY + tabs[i].boxObject.height) {
            index = i + 1;
          }
        }
        //userChrome_js.debug(index);
        return index;
      }


    if (!("bug489729_onDragOverTimer" in gBrowser.tabContainer)) {
      //ここからはタブのデタッチ
      gBrowser.tabContainer._onDragEnd = function(event) {
        // Note: while this case is correctly handled here, this event
        // isn't dispatched when the tab is moved within the tabstrip,
        // see bug 460801.

        // * mozUserCancelled = the user pressed ESC to cancel the drag
        var dt = event.dataTransfer;
        if (dt.mozUserCancelled || dt.dropEffect != "none")
          return;

        // Disable detach within the browser toolbox
        var eX = event.screenX;
        var wX = window.screenX;
        var eY = event.screenY;
        var wY = window.screenY;
        var tabbar = this.mTabstrip.boxObject;
        var contentArea = document.getElementById("appcontent").boxObject;

        // xxx Bug 493978 -  Disable tab-detach when the tab is dropped very close to the tabbar
        const TLERANCE = 15; //15x is enough.
        var side = {
                    "TOP"   :contentArea.screenY,
                    "BOTTOM":contentArea.screenY + contentArea.height,
                    "LEFT"  :contentArea.screenX,
                    "RIGHT" :contentArea.screenX + contentArea.width
                    }
        if (tabbar.screenY + tabbar.height <= contentArea.screenY)
          side["TOP"] += TLERANCE;
        else if (tabbar.screenY >= contentArea.screenY + contentArea.height)
          side["BOTTOM"] -= TLERANCE;
        else if (tabbar.screenX + tabbar.width <= contentArea.screenX)
          side["LEFT"] += TLERANCE;
        else
          side["RIGHT"] -= TLERANCE;
        //debug(side["TOP"] + " " + side["BOTTOM"] + " " + side["LEFT"] + " " + side["RIGHT"])
        // check if the drop point is not (within contentArea or outside the window)
        // eq. dropped too close to the tabbar or toolbox and statusbar(incl. findbar)
        if (!(side["TOP"] < eY && eY < side["BOTTOM"] &&
              side["LEFT"] < eX && eX < side["RIGHT"] ||
              eY < wY || wY + window.outerHeight < eY ||
              eX < wX || wX + window.outerWidth < eX )) {
          return;
        }

        var draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
        this.tabbrowser.replaceTabWithWindow(draggedTab);
        event.stopPropagation();
      }
      gBrowser.tabContainer.addEventListener("dragend", gBrowser.tabContainer._onDragEnd, true);
    }


    //ここからは, ツールバーの表示非表示によるタブーバーの位置, 大きさの調整

    verticalTabToolBox.style.width = TABBARWIDTH + TABBARLEFTMERGINE + "px";
    window.addEventListener('resize', VerticalTabbarOnresized, false);

    var resizeTimer1 = null;
    var resizeTimer2 = null;
    function VerticalTabbarOnresized() {
      if (resizeTimer2)
        clearTimeout(resizeTimer2);
      resizeTimer2 = setTimeout(function() {
        resized();
        resizeTimer1 = null;
      }, 250);
      if (!!resizeTimer1)
        return;

      resized();
      
      function resized() {
        resizeTimer1 = true;
        tabbrowsertabs.setAttribute('overflow', true);

        //幅調整
        tabsToolbar.collapsed = vtbSplitter.getAttribute('state') == 'collapsed';
        tabsToolbar.style.width = verticalTabToolBox.boxObject.width - TABBARLEFTMERGINE + "px";
        //高さ調整
        var toolbuttonH = 0;
        if (!TOOLBARBUTTON_AS_TAB) {
          var newtabbutton = document.getElementById("new-tab-button");
          if (newtabbutton)
            toolbuttonH = newtabbutton.boxObject.height;
          var alltabsbutton = document.getElementById("alltabs-button");
          if (alltabsbutton)
            toolbuttonH = Math.max(toolbuttonH, alltabsbutton.boxObject.height);
        } else {
          var toolbutton = tabbrowsertabs.nextSibling;
          while (toolbutton) {
            if (toolbutton.localName == "toolbarbutton" ||
                toolbutton.localName == "toolbarpaletteitem") {
              toolbuttonH += toolbutton.boxObject.height;
            }
            toolbutton = toolbutton.nextSibling;
          }
        }

        tabsToolbar.style.left = sidebarbox.boxObject.width + sidebarsplitter.boxObject.width + "px";
        tabsToolbar.style.top = gBrowser.boxObject.y + "px";
        tabsToolbar.style.bottom = browserbottombox.boxObject.height + "px";

        tabbrowsertabs.style.height = tabsToolbar.boxObject.height - toolbuttonH + "px";

        indicatorbox.style.left = sidebarbox.boxObject.width + sidebarsplitter.boxObject.width + "px";
        indicatorbox.style.top = -5 + gBrowser.boxObject.y + "px";
        indicatorbox.style.bottom = browserbottombox.boxObject.height + "px";

        //選択タブが見えるように
        ensureVisibleElement(gBrowser.selectedTab);
      }
    }

    VerticalTabbarOnresized();
    setTimeout(function(){VerticalTabbarOnresized();}, 250);

    /*Print Preview を 抜けたとき*/
    zzzz_VerticalTabbar.VerticalTabbarOnresized = VerticalTabbarOnresized;
    func = PrintPreviewListener.onExit.toString();
    func = func.replace(
    /}$/,
    'zzzz_VerticalTabbar.VerticalTabbarOnresized(); }'
    );
    PrintPreviewListener.onExit = new Function(
       func.match(/\((.*)\)\s*\{/)[1],
       func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
    );


    
    //window['piro.sakura.ne.jp'].stopRendering.start();

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

    //デバッグ用
    function debug(aMsg){
          Cc["@mozilla.org/consoleservice;1"]
            .getService(Ci.nsIConsoleService)
            .logStringMessage(aMsg);
    }
}


zzzz_VerticalTabbar();
