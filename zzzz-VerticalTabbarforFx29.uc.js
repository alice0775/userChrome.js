// ==UserScript==
// @name           zzzz-VerticalTabbarforFx29.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    CSS入れ替えまくりバージョン
// @include        main
// @compatibility  Firefox 29-32
// @author         Alice0775
// @note           デフォルトテーマ , zzzz-removeTabMoveAnimation.uc.js が必要
// @version        2014/05/14 15:30 fix color  if tabsintitlebar and menubar is enabled
// @version        2014/05/14 09:50 fix color  if tabsintitlebar is enabled
// @version        2014/05/14 09:00 fix color
// @version        2014/05/14 07:00 fix double click if tabsintitlebar is enabled
// @version        2014/05/14 07:00 fix tabsintitlebar (window control in fullscreen/ margin top of tabbar)
// @version        2014/05/14 00:50 fix text color when browser.tabs.drawInTitlebar=true
// @version        2014/05/10 13:00 remove fog in titlebar, fixed if no titlebar displayed
// @version        2014/05/09 15:30 use sizemodechange event
// @version        2014/05/09 15:30 do not collapse tabbar
// @version        2014/05/09 15:30 make clicable tab at left side of screen when maxmized
// @version        2014/05/09 14:50 remove debug
// @version        2014/05/09 14:30 tweeks scrollbar, splitter width
// @version        2014/05/09 14:20 scroll tabbar by mouse wheel
// @version        2014/05/09 14:20 fix unexpected scroll to top by mouse move
// @version        2014/05/05 19:20 Workaround: hidden tabbar when enter csutomize mode
// @version        2014/05/05 19:15 Workaround: toolbuttun position
// @version        2014/05/05 19:00 Fix Win7 Aero and tab padding(background color)
// @version        2014/05/05 09:00 modified padding-bottom for selcted tab
// @version        2013/11/19 12:30 Australis 
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2012/07/24 14:30 Bug 761723 implement toString of function objects by saving source
// @version        2011/12/19 02:00 toolbarbutton
// @version        2011/10/14 12:00 Bug 690227 - Back out bug 455694 (tab drag/detach animations)
// @version        2010/06/24 23:00 ウインドサイズがおかしくなるので rendering stop/startは止め
// @version        2010/07/22 12:00 tab context
// @version        2010/06/24 23:00 ウインドサイズがおかしくなるので rendering stop/startは止め
// @version        2010/05/04 08:00 選択タブ色
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
      // -----config--------
      // double click on tabbar if tabsintitlebar is enabled
      zzzz_VerticalTabbar.dblclick =
      function(event) {
        if (event.button != 0 || event.originalTarget.localName != "box")
          return;
        BrowserOpenTab(); // open new tab
        event.preventDefault();
      };
      // -----config--------

      // Tab Mix plus
      if("tablib" in window) return;
      // Tree Style tab
      if('TreeStyleTabService' in window) return;

      if (!gPrefService)
        gPrefService = Components.classes["@mozilla.org/preferences-service;1"]
                                     .getService(Components.interfaces.nsIPrefBranch);
      var kTABBAR_WIDTH = "userChrome.verticaltabbar.width";
      // -- config --
      var TABBARWIDTH = 130;
      var TABBARLEFTMERGINE = 1;
      gPrefService.setIntPref("browser.tabs.tabMaxWidth", 250);
      gPrefService.setIntPref("browser.tabs.tabMinWidth", 100);
      gPrefService.setIntPref("browser.tabs.tabClipWidth", 140);
      // close button
      var HIDE_CLOSE_BUTTON_IN_BACKGROUND_TAB = false;
      var HIDE_CLOSE_BUTTON_IN_FOREGROUND_TAB = false;
      // -- config --
      var TOOLBARBUTTON_AS_TAB = false;
      // xxx Bug 380960 - Implement closing tabs animation
      gPrefService.setBoolPref("browser.tabs.animate", false);
      gPrefService.setBoolPref("browser.tabs.autoHide", false);

      //window['piro.sakura.ne.jp'].stopRendering.stop();
      for (var i = 0; i < gBrowser.tabs.length; i++) {
        gBrowser.tabs[i].removeAttribute("maxwidth");
      }

      /*タブ縦置きCSS適用*/
      var style = ' \
        @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
 \
        /*不要なメニュー*/ \
        menuitem[command="cmd_ToggleTabsOnTop"], \
        menuitem[command="cmd_ToggleTabsOnTop"] + menuseparator \
        { \
        visibility:collapse; \
        } \
 \
        #verticalTabToolBox \
        { \
        border-top-width:0px; \
        }\
 \
        /*workaround: hidden when customize mode*/ \
        #TabsToolbar[customizing="true"] \
        { \
          visibility:collapse !important; \
        }\
 \
        #main-window[tabsintitlebar] #TabsToolbar:not(:-moz-lwtheme), \
        #TabsToolbar:not(:-moz-lwtheme), \
        #TabsToolbar \
        { \
        position:fixed; \
        left: 0px; \
        right: 0px; \
        /*top: 80px; \
        bottom: 20px;*/ \
        width: {TABBARWIDTH}px; \
        overflow-x: hidden; \
        overflow-y: hidden; \
        } \
 \
        #tabbrowser-tabs > hbox \
        { \
        pointer-events:none; \
        position:fixed; \
        left: 0px; \
        right: 0px; \
        /*top: 80px; \
        bottom: 20px;*/ \
        width: 5px; \
        overflow-x: hidden; \
        overflow-y: hidden; \
        } \
 \
        #tabbrowser-tabs \
        { \
        /*height: 100% !important;*/ \
        width: 100% !important; \
        -moz-box-orient: vertical !important; \
        /*should delete orient="horizontal"*/ \
        overflow-x:hidden; \
        overflow-y:hidden; \
        } \
 \
        #tabbrowser-tabs > arrowscrollbox \
        { \
        -moz-box-orient: vertical !important; \
        /*should delete orient="horizontal"*/ \
        } \
 \
        #tabbrowser-tabs > arrowscrollbox > scrollbox \
        { \
        overflow-x: hidden; \
        overflow-y: auto; \
        -moz-box-orient: vertical !important; \
        direction: rtl; /*scroll bar position*/ \
        } \
 \
        #tabbrowser-tabs > arrowscrollbox > scrollbox > box \
        { \
        -moz-box-orient: vertical !important; \
        direction: ltr; /*scroll bar position*/ \
        } \
 \
        #tabbrowser-tabs > arrowscrollbox > .scrollbutton-up, \
        #tabbrowser-tabs > arrowscrollbox > .scrollbutton-down \
        { \
        visibility:collapse; \
        } \
 \
        .tabbrowser-tab[pinned], \
        .tabbrowser-tab:not([pinned]) \
        { \
        min-width: 100% !important; \
        max-width: 100% !important; \
        } \
 \
        /*フルスクリーン*/ \
        #verticalTabToolBox[moz-collapsed="true"], \
        #vtb_splitter[moz-collapsed="true"] \
        { \
        visibility:collapse; \
        } \
 \
 \
        /*ポップアップの時*/ \
        #main-window[chromehidden~="extrachrome"] #TabsToolbar, \
        #main-window[chromehidden~="extrachrome"] #verticalTabToolBox, \
        #main-window[chromehidden~="extrachrome"] #vtb_splitter \
        { \
        visibility: collapse; \
        } \
 \
        /*プリントプレビュー*/ \
        #print-preview-toolbar[printpreview="true"] + #navigator-toolbox + #browser  #verticalTabToolBox, \
        #print-preview-toolbar[printpreview="true"] + #navigator-toolbox + #browser  #vtb_splitter \
        { \
        visibility:collapse; \
        } \
 \
        /* splitter */ \
        #vtb_splitter { \
        min-width:4px !important; \
        } \
 \
        #vtb_splitter > grippy { \
        min-width:2px !important; \
        } \
 \
         /*tabs in titlebar/fullscreen要調整*/ \
        #main-window[tabsintitlebar] > #titlebar { \
          /*-moz-appearance: none;*/ \
        } \
        #main-window[tabsintitlebar][sizemode="normal"] > #tab-view-deck { \
         margin-top:  1px; \
        } \
        #main-window[tabsintitlebar] #toolbar-menubar[autohide="true"] ~ #nav-bar, \
        #main-window[sizemode="fullscreen"] #nav-bar { \
         margin-right:80px; \
        } \
        #main-window[sizemode="fullscreen"] #window-controls { \
        display:-moz-box; \
        position: fixed; \
        top:0; \
        right:0; \
        } \
        #main-window[tabsintitlebar][sizemode="normal"][chromehidden~="menubar"] #toolbar-menubar ~ #TabsToolbar, \
        #main-window[tabsintitlebar][sizemode="normal"] #toolbar-menubar[autohide="true"][inactive] ~ #TabsToolbar { \
          margin-top: 0; \
        } \
 \
         /*default theme要調整*/ \
        /* Fx3.7a2*/ \
        toolbarbutton:not([id="back-button"]):not([id="forward-button"]) \
        { \
        /*margin-top:0px; //? */\
        } \
 \
        #TabsToolbar:not(:-moz-lwtheme)::after \
        { \
          display:none !important; \
        } \
 \
        .tabbrowser-tab, \
        .tabbrowser-tab:not([selected="true"]) \
        { \
        -moz-appearance: none !important; \
        min-height: 24px; \
        max-height: 24px; \
        margin: 0 !important; \
        padding: 0 0 0 0 !important; \
 \
        border: 1px solid ThreeDShadow; \
        border-bottom: 1px solid transparent; \
 \
        border-radius-topleft : 0 !important; \
        border-radius-topright : 0 !important; \
        border-radius-bottomleft : 0 !important; \
        border-radius-bottomright : 0 !important; \
        } \
 \
        #main-window[tabsintitlebar] .tabbrowser-tab:not([selected="true"]):-moz-system-metric(windows-classic):not(:-moz-lwtheme) { \
        color: -moz-dialogtext; \
        } \
 \
        .tabbrowser-tab:last-child, \
        .tabbrowser-tab:not([selected="true"]):last-child \
        { \
        border-bottom: 1px solid ThreeDShadow; \
        } \
 \
        .tabbrowser-tab[selected="true"] \
        { \
        padding: 0 0 0 0 !important; \
        } \
 \
        .tabbrowser-tab[pinned] \
        { \
        border-color: ThreeDHighlight; \
        } \
         \
        .tab-throbber[pinned], \
        .tab-icon-image[pinned] { \
          -moz-margin-start: 2px; \
          -moz-margin-end: 3px; \
        } \
        .tab-throbber:not([pinned]), \
        .tab-icon-image:not([pinned]) { \
          -moz-margin-end: 3px; \
        } \
 \
        #TabsToolbar .tab-content:not([pinned]), \
        #TabsToolbar .tab-content[pinned] { \
        -moz-padding-end: 3px !important; \
        -moz-padding-start: 3px !important; \
        } \
 \
        /*toolbarbutton*/ \
	      #TabsToolbar > toolbarbutton[collapsed="true"] \
        { \
        display: none; \
        } \
 \
        #TabsToolbar toolbarbutton, \
        #TabsToolbar toolbarbutton:hover \
        { \
        height: 25px !important; \
        } \
 \
 \
        /* workaround toolbarbutton */ \
        .tabs-newtab-button \
        { \
          display:none !important; \
        } \
        #tabbrowser-tabs:not([overflow="true"]) ~ #alltabs-button, \
        #tabbrowser-tabs:not([overflow="true"]) + #new-tab-button \
        { \
          visibility:visible !important; \
        } \
        /* workaround positioning*/ \
        #TabsToolbar[customizing="true"] > #wrapper-alltabs-button, \
        #alltabs-button, \
        #alltabs-button:hover \
        { \
        position: relative !important; \
        bottom: 11px; !important; \
        } \
      ';

      /* Remove exstra padding with vertical tabs */
      style += ' \
\
        .tab-background, \
        .tabs-newtab-button { \
          /* overlap the tab curves */ \
          -moz-margin-end: 0px; \
          -moz-margin-start: 0px; \
        } \
 \
        .tabbrowser-arrowscrollbox > .arrowscrollbox-scrollbox { \
          -moz-padding-end: 0px; \
          -moz-padding-start: 0px; \
        } \
 \
        .tab-background-start[selected="true"]::after, \
        .tab-background-start[selected="true"]::before, \
        .tab-background-start, \
        .tab-background-end, \
        .tab-background-end[selected="true"]::after, \
        .tab-background-end[selected="true"]::before { \
          min-height: 0px; \
          width: 0px; \
        } \
 \
        .tab-background-middle { \
          border-left: 0px solid transparent; \
          border-right: 0px solid transparent; \
          margin: 0 0px; \
        } \
       ';

      /* Don't show the tab curve with vertical tabs */
      style += ' \
 \
        .tabbrowser-tabs .tab-background-end[selected="true"]::after, \
        .tabbrowser-tabs .tab-background-end[selected="true"]::before, \
        .tabbrowser-tabs .tab-background-start[selected="true"]::after, \
        .tabbrowser-tabs .tab-background-start[selected="true"]::before { \
          content: none; \
        } \
 \
        .tabbrowser-tab:hover > .tab-stack > .tab-background:not([selected="true"]) { \
          background-image: url(chrome://browser/skin/tabbrowser/tab-background-middle.png); \
          background-position: left bottom; \
          background-repeat: no-repeat; \
          background-size: 100% 100%; \
 \
        } \
        .tabbrowser-tabs .tabbrowser-tab { \
          pointer-events: auto; \
        } \
 \
        .tabbrowser-tabs .tab-background-middle { \
          -moz-border-start: none; \
          -moz-border-end: none; \
        } \
       ';

      if (HIDE_CLOSE_BUTTON_IN_FOREGROUND_TAB) {
        style += ' \
          .tabbrowser-tab[selected="true"] .tab-close-button \
          { \
          display: none !important; \
          } \
       ';
      }
      if (HIDE_CLOSE_BUTTON_IN_BACKGROUND_TAB) {
        style += ' \
          .tabbrowser-tab:not([selected="true"]) .tab-close-button \
          { \
          display: none !important; \
          } \
       ';
      }
      if (TOOLBARBUTTON_AS_TAB) {
        style += ' \
          #TabsToolbar > toolbarbutton:not([collapsed="true"]), \
          #TabsToolbar > toolbarbutton:not([hidden="true"]) \
          { \
          width:100% !important; \
          } \
       ';
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

      /* 縦のスクロールバーを細く＆背景着色 */
      style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
      #tabbrowser-tabs > arrowscrollbox * scrollbar[orient="vertical"], \
      #tabbrowser-tabs > arrowscrollbox * scrollbar[orient="vertical"] * { \
      min-width: 12px!important; \
      max-width: 12px!important; \
      } \
      '.replace(/\s+/g, " ");
      var uri = "data:text/css;charset=utf-8," + encodeURIComponent(style);
      Cc["@mozilla.org/content/style-sheet-service;1"]
            .getService(Ci.nsIStyleSheetService)
            .loadAndRegisterSheet(Services.io.newURI(uri, null, null), Ci.nsIStyleSheetService.AGENT_SHEET);


      document.getElementById('alltabs-button').removeAttribute('type');
      document.getElementById('alltabs-button').setAttribute('onclick', "this.firstChild.openPopup(document.getElementById('alltabs-button'))");

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

      // tabs in title bar
      tabsToolbar.addEventListener("dblclick", function(event) {
          if (!TabsInTitlebar.enabled)
            return;
          zzzz_VerticalTabbar.dblclick(event);
      }.bind(gBrowser.tabContainer), true);

      //context menu
      tabbrowsertabs.setAttribute("context", "tabContextMenu");

      //pinned
      gBrowser.tabContainer._positionPinnedTabs = function() {
        /*何もしない*/
      };

      //フルスクリーン
      var func = FullScreen.mouseoverToggle.toString();
      func = func.replace(
      '{',
      ' \
        $& \
        if (!aShow) { \
          verticalTabToolBox.setAttribute("moz-collapsed", "true"); \
          vtbSplitter.setAttribute("moz-collapsed", "true"); \
          document.getElementById("TabsToolbar").setAttribute("moz-collapsed", "true"); \
        } else { \
          verticalTabToolBox.removeAttribute("moz-collapsed"); \
          vtbSplitter.removeAttribute("moz-collapsed"); \
          document.getElementById("TabsToolbar").removeAttribute("moz-collapsed"); \
        } \
        '
      );
      eval("FullScreen.mouseoverToggle = " + func);

      //sidebar
      document.getElementById("sidebar-splitter").setAttribute("resizeafter", "flex");

      //D&Dの調整
      func = gBrowser.tabContainer._setEffectAllowedForDataTransfer.toString();
      func = func.replace(
        /\(sourceNode\.boxObject\.screenX \+[\r]*[\s]*sourceNode\.boxObject\.width\)/,
        'sourceNode.boxObject.screenX + sourceNode.boxObject.width'
      );
      func = func.replace(
        'event.screenX <= sourceNode.boxObject.screenX + sourceNode.boxObject.width',
        ' \
        $& && \
        event.screenY >= sourceNode.boxObject.screenY && \
        event.screenY <= sourceNode.boxObject.screenY + sourceNode.boxObject.height \
        '
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

        var tabStrip = this.mTabstrip;

        // autoscroll the tab strip if we drag over
        //xxx Bug 481904
        if (this.VerticalTabbarOnDragOver(event)) {
          //return;
        }

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
        if (newIndex == null)
          return;
//debug("newIndex "+ newIndex)
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
      gBrowser.tabContainer.addEventListener("dragover", gBrowser.tabContainer._onDragOver, true);

      gBrowser.tabContainer._getDragTargetTab = function(event) {
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

        
        var tab = document.evaluate(
                    'ancestor-or-self::*[local-name()="tab"]',
                    event.originalTarget,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
        return tab;
      };


      gBrowser.tabContainer._getDropIndex = function(aEvent) {
        var tabs = this.childNodes;
        for (let i = 0; i < tabs.length; i++){
          if (aEvent.screenY >= tabs[i].boxObject.screenY -3 &&
              aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height / 2)
            return i;
          if (aEvent.screenY >= tabs[i].boxObject.screenY + tabs[i].boxObject.height / 2 &&
              aEvent.screenY < tabs[i].boxObject.screenY + tabs[i].boxObject.height + 3)
            return i + 1;
        }
        return tabs.length;
      };

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
    window.addEventListener('sizemodechange', windowSizemodechange, false);
    window.addEventListener("aftercustomization", VerticalTabbarOnresized, false);

    function windowSizemodechange() {
      if (!window.fullScreen) {
        tabsToolbar.removeAttribute("moz-collapsed");
        vtbSplitter.removeAttribute("moz-collapsed");
        verticalTabToolBox.removeAttribute("moz-collapsed");
      }
    }

    function VerticalTabbarOnresized() {
         
      resized();
      
      function resized() {
        tabbrowsertabs.setAttribute('overflow', true);

        //幅調整
        if (vtbSplitter.getAttribute('state') == 'collapsed')
          var w = 0;
        else {
          gPrefService.setIntPref(kTABBAR_WIDTH, verticalTabToolBox.boxObject.width);
          w = verticalTabToolBox.boxObject.width - TABBARLEFTMERGINE;
        }
        tabsToolbar.style.width =  w + "px";
        
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
        gBrowser.tabContainer.adjustTabstrip();

        //選択タブが見えるように
        ensureVisibleElement(gBrowser.selectedTab);
      }
    }

    try {
      verticalTabToolBox.style.width = gPrefService.getIntPref(kTABBAR_WIDTH) + "px";
    } catch(e) {}
    VerticalTabbarOnresized();
    setTimeout(function(){VerticalTabbarOnresized();}, 250);
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

    // Scroll Tabbar
    gBrowser.tabContainer.mTabstrip.addEventListener("DOMMouseScroll", function(event){
      if (event.ctrlKey || event.altKey  || event.shiftKey)
        return;
      var arrowscrollbox = gBrowser.tabContainer.mTabstrip;
      var scrollbox = document.getAnonymousElementByAttribute(arrowscrollbox, "class", "arrowscrollbox-scrollbox");
      //userChrome_js.debug(scrollbox.scrollTop);
      scrollbox.scrollTop += (event.detail > 0 ? 1 : -1) * 50;
    });


    //デバッグ用
    function debug(aMsg){
          Cc["@mozilla.org/consoleservice;1"]
            .getService(Ci.nsIConsoleService)
            .logStringMessage(aMsg);
    }
}
zzzz_VerticalTabbar();
