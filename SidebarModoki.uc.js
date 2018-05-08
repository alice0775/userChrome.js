// ==UserScript==
// @name           SidebarModoki
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TST
// @include        main
// @include        chrome://browser/content/downloads/contentAreaDownloadsView.xul?SM
// @compatibility  Firefox 57
// @author         Alice0775
// @note           Tree Style Tab がある場合にブックマークと履歴等を別途"サイドバーもどき"で表示
// @version        2018/05/08 19:00 get rid loadoverlay
// @version        2017/11/24 19:50 do nothing if window is popup(window.open)
// @version        2017/11/24 19:20 change close button icon style to 57
// @version        2017/11/24 19:10 add key(accel(ctrl)+alt+s) and close button
// @version        2017/11/24 19:00 hack for DL manager
// @version        2017/11/24 15:00 remove unused variable
// @version        2017/11/23 13:10 restore initial tab index/width and more unique id
// @version        2017/11/23 12:30 try catch.  download manager
// @version        2017/11/23 00:30 Make button icon
// @version        2017/11/23 00:00 Make button customizable
// @version        2017/11/22 23:00 fullscreen
// @version        2017/11/22 23:00 DOM fullscreen
// @version        2017/11/22 22:00 F11 fullscreen
// @version        2017/11/15 09:00
// ==/UserScript==

//xxxx download manager hack
if (location.href=="chrome://browser/content/downloads/contentAreaDownloadsView.xul?SM") {
    let style = `
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
      #contentAreaDownloadsView
      {
        padding: 0;
      }
      #downloadsRichListBox > richlistitem.download
      {
        height: auto;
      }
      .downloadTypeIcon,
      .downloadBlockedBadge
      {
        margin-left:0;
        margin-right:1px;
      }
      .downloadButton {
        padding-left:0;
        padding-right:0;
      }
     `;

    style = style.replace(/\s+/g, " ").replace(/\{SM_WIDTH\}/g, this.SM_WIDTH);
    let sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };
    throw 'not an error, just load contentAreaDownloadsView.xul';
}



var SidebarModoki = {
  // -- config --
  SM_WIDTH : 130,
  SM_AUTOHIDE : false,  //F11 Fullscreen
  TAB0_SRC   : "chrome://browser/content/bookmarks/bookmarksPanel.xul",
  TAB0_LABEL : "Bookmarks",
  TAB1_SRC   : "chrome://browser/content/history/history-panel.xul",
  TAB1_LABEL : "History",
  TAB2_SRC   : "chrome://browser/content/downloads/contentAreaDownloadsView.xul?SM",
  TAB2_LABEL : "DL",
  // -- config --

  kSM_Open : "userChrome.SidebarModoki.Open",
  kSM_lastSelectedTabIndex : "userChrome.SidebarModoki.lastSelectedTabIndex",
  kSM_lastSelectedTabWidth : "userChrome.SidebarModoki.lastSelectedTabWidth",
  ToolBox: null,
  Button: null,

  get prefs(){
    delete this.prefs;
    return this.prefs = Services.prefs;
  },

  createElement: function(name, attr) {
  	var el = document.createElement(name);
  	if (attr) {
      Object.keys(attr).forEach(function(n){ el.setAttribute(n, attr[n])});
    }
  	return el;
  },

  init: function() {
    let chromehidden = document.getElementById("main-window").hasAttribute("chromehidden");
    if (chromehidden &&
        document.getElementById("main-window").getAttribute("chromehidden").includes("extrachrome")) {      return; // do nothing
    }

    let style = `
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
      #SM_toolbox
      {
        width: {SM_WIDTH}px;
        background-color: -moz-dialog;
        color: -moz-dialogtext;
        text-shadow: none;
      }

      /*フルスクリーン*/
      #SM_toolbox[moz-collapsed="true"],
      #SM_splitter[moz-collapsed="true"]
      {
        visibility:collapse;
      }

      /*ポップアップの時*/
      #main-window[chromehidden~="extrachrome"] #SM_toolbox,
      #main-window[chromehidden~="extrachrome"] #SM_splitter
      {
        visibility: collapse;
      }

      /*プリントプレビュー*/
      #print-preview-toolbar[printpreview="true"] + #navigator-toolbox + #browser #SM_toolbox,
      #print-preview-toolbar[printpreview="true"] + #navigator-toolbox + #browser #SM_splitter
      {
        visibility:collapse;
      }
      #SM_tabpanels
      { 
        padding: 0;
        margin:-4px; /*hack*/
      }


      #SM_Button,
      #SM_Button:-moz-lwtheme-darktext
      {
        list-style-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4jWNgoAL4z8DA8N/AwAArTQRGFSBBI4YBDHhonC6n3AA1NTUMZ6F5gyQXYFNEsheweWnUBfRyAbmYcgMoAgBFX4a/wlDliwAAAABJRU5ErkJggg==');
      }
      #SM_Button:-moz-lwtheme-brighttext
      {
        list-style-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANklEQVQ4jWP4TyFg+P///38GBgayMHUNwEdjdTrVDcDnTKJdgEsRSV5ACaBRF9DZBQObFygBAMeIxVdCQIJTAAAAAElFTkSuQmCC');
      }

     `;

    style = style.replace(/\s+/g, " ").replace(/\{SM_WIDTH\}/g, this.SM_WIDTH);
    let sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    Components.utils.import("resource:///modules/CustomizableUI.jsm");
    // xxxx try-catch may need for 2nd window
    try {
      CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
        id: 'SM_Button',
        type: 'custom',
        defaultArea: CustomizableUI.AREA_NAVBAR,
        onBuild: function(aDocument) {
          var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
          var props = {
            id: "SM_Button",
            class: "toolbarbutton-1 chromeclass-toolbar-additional",
            tooltiptext: "Sidebar Modoki",
            oncommand: "SidebarModoki.toggle();",
            type: "checkbox",
            label: "Sidebar Modoki",
            autoCheck: "false",
            removable: "true"
          };
          for (var p in props) {
            toolbaritem.setAttribute(p, props[p]);
          }
          
          return toolbaritem;
        }
      });
    }catch(e){}

    document.getElementById("mainCommandSet").appendChild(
      this.createElement("command", { id: "cmd_SidebarModoki", oncommand: "SidebarModoki.toggle()" })
    );
    document.getElementById("mainKeyset").appendChild(
      this.createElement("key", { id: "key_SidebarModoki", key: "s", modifiers: "accel,alt", command: "cmd_SidebarModoki" })
    );

    let sidebar = document.getElementById("sidebar-box");
    let SM_toolbox = sidebar.parentNode.insertBefore(this.createElement("vbox", { id: "SM_toolbox", ordinal: "0"}), sidebar);
    let SM_header = SM_toolbox.appendChild(this.createElement("hbox", { id: "SM_header", align: "center"}));
    SM_header.appendChild(this.createElement("label", null)).textContent = "SidebarModoki";
    SM_header.appendChild(this.createElement("spacer", { flex: "1000"}));
    SM_header.appendChild(this.createElement("toolbarbutton", { id: "SM_closeButton",  class: "close-icon tabbable", tooltiptext: "Close SidebarModoki", oncommand: "SidebarModoki.close();"}));

    let tabbox = SM_toolbox.appendChild(this.createElement("tabbox", { flex: "1"}));
    let SM_tabs = tabbox.appendChild(this.createElement("tabs", { id: "SM_tabs"}));
    SM_tabs.appendChild(this.createElement("tab", { id: "SM_tab0",  label: this.TAB0_LABEL}));
    SM_tabs.appendChild(this.createElement("tab", { id: "SM_tab1",  label: this.TAB1_LABEL}));
    SM_tabs.appendChild(this.createElement("tab", { id: "SM_tab2",  label: this.TAB2_LABEL}));

    let SM_tabpanels = tabbox.appendChild(this.createElement("tabpanels", { id: "SM_tabpanels", flex: "1", style: "border: none;"}));
    let tabpanel = SM_tabpanels.appendChild(this.createElement("tabpanel", { id: "SM_tab0-container", flex: "1", orient: "vertical"}));
    tabpanel.appendChild(this.createElement("browser", { id: "SM_tab0-browser", flex: "1", autoscroll: "false", src: this.TAB0_SRC}));

    tabpanel = SM_tabpanels.appendChild(this.createElement("tabpanel", { id: "SM_tab1-container", flex: "1", orient: "vertical"}));
    tabpanel.appendChild(this.createElement("browser", { id: "SM_tab1-browser", flex: "1", autoscroll: "false", src: this.TAB1_SRC}));

    tabpanel = SM_tabpanels.appendChild(this.createElement("tabpanel", { id: "SM_tab2-container", flex: "1", orient: "vertical"}));
    tabpanel.appendChild(this.createElement("browser", { id: "SM_tab2-browser", flex: "1", autoscroll: "false", src: this.TAB2_SRC}));


    let SM_splitter = sidebar.parentNode.insertBefore(this.createElement("splitter", { id: "SM_splitter", ordinal: "0", state: "open", collapse: "before", resizebefore: "closest", resizeafter: "closest"}), sidebar);
    SM_splitter.appendChild(this.createElement("grippy", null));

    setTimeout(function(){this.observe();}.bind(this), 0);

    //F11 fullscreen
    FullScreen.showNavToolbox_org = FullScreen.showNavToolbox;
    FullScreen.showNavToolbox = function(trackMouse = true) {
      FullScreen.showNavToolbox_org(trackMouse);
      if (!!SidebarModoki.ToolBox) {
        SidebarModoki.ToolBox.removeAttribute("moz-collapsed"); 
        SidebarModoki.Splitter.removeAttribute("moz-collapsed");
      }
    }
    FullScreen.hideNavToolbox_org = FullScreen.hideNavToolbox;
    FullScreen.hideNavToolbox = function(aAnimate = false) {
      FullScreen.hideNavToolbox_org(aAnimate);
      if (SidebarModoki.SM_AUTOHIDE && !!SidebarModoki.ToolBox) {
        SidebarModoki.ToolBox.setAttribute("moz-collapsed", "true");
        SidebarModoki.Splitter.setAttribute("moz-collapsed", "true");
      }
    }

    //DOM fullscreen
    window.addEventListener("MozDOMFullscreen:Entered", this,
                            /* useCapture */ true,
                            /* wantsUntrusted */ false);
    window.addEventListener("MozDOMFullscreen:Exited", this,
                            /* useCapture */ true,
                            /* wantsUntrusted */ false);
    
  },


  observe: function() {
    this.ToolBox = document.getElementById("SM_toolbox");
    this.Splitter = document.getElementById("SM_splitter");

    if (this.getPref(this.kSM_Open, "bool", true)) {
      this.toggle(true);
    } else {
      this.close();
    }
    document.getElementById("SM_tabs").setAttribute("onselect", "SidebarModoki.onSelect();");
    window.addEventListener("aftercustomization", this, false);

    // xxxx native sidebar changes ordinal when change position of the native sidebar and open/close
    this.SM_Observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.attributeName) {
          case "ordinal":
            this.ToolBox.setAttribute("ordinal", "0");
            this.Splitter.setAttribute("ordinal", "0");
            break;
        }
      }.bind(this));
    }.bind(this));
    // pass in the target node, as well as the observer options
    this.SM_Observer.observe(document.getElementById("appcontent"),
                             {attribute: true, attributeFilter: ["ordinal"]});
  },

  onSelect: function() {
    let aIndex = document.getElementById("SM_tabpanels").selectedIndex;
    this.prefs.setIntPref(this.kSM_lastSelectedTabIndex, aIndex);
    width = this.getPref(this.kSM_lastSelectedTabWidth + aIndex, "int", this.SM_WIDTH);
    document.getElementById("SM_toolbox").width = width;
  },
  
  toggle: function(forceopen) {
    this.Button = document.getElementById("SM_Button");
    if (!this.Button.hasAttribute("checked") || forceopen) {
      this.Button.setAttribute("checked", true);
      this.ToolBox.style.removeProperty("visibility");
      this.Splitter.style.removeProperty("visibility");
      let index = this.getPref(this.kSM_lastSelectedTabIndex, "int", 0);
      document.getElementById("SM_tabs").selectedIndex = index;
      width = this.getPref(this.kSM_lastSelectedTabWidth + index, "int", this.SM_WIDTH);
      document.getElementById("SM_toolbox").width = width;
     this.prefs.setBoolPref(this.kSM_Open, true)
     addEventListener("resize", this, false);
    } else {
      this.close();
    }
  },

  close: function() {
    removeEventListener("resize", this, false);
    this.Button = document.getElementById("SM_Button");
    this.Button.removeAttribute("checked");
    this.ToolBox.style.setProperty("visibility", "collapse", "");
    this.Splitter.style.setProperty("visibility", "collapse", "");
    this.prefs.setBoolPref(this.kSM_Open, false)
  },


  //ここからは, 大きさの調整
  onResize: function(event) {
     let width = this.ToolBox.getBoundingClientRect().width;
     let aIndex = document.getElementById("SM_tabs").selectedIndex;
     this.prefs.setIntPref(this.kSM_lastSelectedTabWidth + aIndex, width);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case 'resize':
        this.onResize(event);
        break;
      case 'MozDOMFullscreen:Entered':
        if (!!this.ToolBox) {
          this.ToolBox.setAttribute("moz-collapsed", "true");
          this.Splitter.setAttribute("moz-collapsed", "true");
        }
        break;
      case 'MozDOMFullscreen:Exited':
        if (!!this.ToolBox) {
          this.ToolBox.removeAttribute("moz-collapsed"); 
          this.Splitter.removeAttribute("moz-collapsed");
        }
        break;
      case 'aftercustomization':
        if (this.getPref(this.kSM_Open, "bool", true)) {
          this.Button.setAttribute("checked", true);
        }
        break;
     }
  },

  //pref読み込み
  getPref: function(aPrefString, aPrefType, aDefault) {
    try{
      switch (aPrefType){
        case "str":
          return this.prefs.getCharPref(aPrefString).toString(); break;
        case "int":
          return this.prefs.getIntPref(aPrefString); break;
        case "bool":
        default:
          return this.prefs.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  }

}

SidebarModoki.init();
