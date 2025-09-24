// ==UserScript==
// @name           SidebarModoki
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    SidebarModoki
// @include        main
// @include        chrome://browser/content/places/bookmarksSidebar.xhtml?SM
// @include        chrome://browser/content/places/historySidebar.xhtml?SM
// @include        chrome://browser/content/genai/chat.html?SM
// @async          true
// @author         Alice0775
// @compatibility  140
// @version        2025/09/24 remove redundant header if any
// @version        2025/06/09 remove removal attribute
// @version        2025/05/26 Bug 1967551 - Remove native tabbox rendering.
// @version        2025/04/14 fix register eventListener
// @version        2025/04/14 fix register eventListener
// @version        2025/04/02 fix working within sandbox
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2024/05/05 Bug 1892965 - Rename Sidebar launcher and SidebarUI
// @note           Tree Style Tab がある場合にブックマークと履歴等を別途"サイドバーもどき"で表示
// @note           SidebarModoki.uc.js.css をuserChrome.cssに読み込ませる必要あり
// @version        2024/09/05 Add Chat AI
// @version        2024/03/19 WIP Bug 1884792 - Remove chrome-only :-moz-lwtheme pseudo-class
// @version        2023/07/19 00:00 add padding-top due to Bug 1705215
// @version        2023/07/17 00:00 use ES module imports
// @version        2023/03/09 Bug 1820534 - Move front-end to modern flexbox.
// @version        2022/10/12 Bug 1794630
// @version        2022/09/29 fix Bug 1689816 
// @version        2022/09/28 ordinal position
// @version        2022/09/14 fix Bug 1790299
// @version        2022/09/14 use toolbarspring instead of spacer
// @version        2022/08/26 Bug 1695435 - Remove @@hasInstance for IDL interfaces in chrome context
// @version        2022/04/01 23:00 Convert Components.utils.import to ChromeUtils.import
// @version        2022/03/26 23:00 Bug 1760342 - Remove [lwtheme]-{brighttext,darktext}
// @version        2021/11/21 18:00 Bug 1742111 - Rename internal accentcolor and textcolor properties to be more consistent with the webext theme API
// @version        2021/11/14 13:00 wip change css(Bug 1740230 - moz-lwtheme* pseudo-classes don't get invalidated correctly)
// @version        2021/09/30 22:00 change splitter color
// @version        2021/05/18 20:00 fix margin of tabpanels
// @version        2021/02/09 20:00 Rewrite `X.setAttribute("hidden", Y)` to `X.hidden = Y`
// @version       2020/06/18 fix SidebarModoki position(Bug 1603830 - Remove support for XULElement.ordinal)
// @version       2019/12/11 fix for 73 Bug 1601094 - Rename remaining .xul files to .xhtml in browser
// @version        2019/11/14 03:00 workarround Ctrl+tab/Ctrl+pageUP/Down
// @version        2019/10/20 22:00 fix surplus loading
// @version        2019/10/20 12:30 workaround Bug 1497200: Apply Meta CSP to about:downloads, Bug 1513325 - Remove textbox binding
// @version        2019/09/05 13:00 fix listitem
// @version        2019/08/07 15:00 fix adding key(renamde from key to keyvalue in jsonToDOM)
// @version        2019/07/13 13:00 fix wrong commit
// @version        2019/07/10 10:00 fix 70 Bug 1558914 - Disable Array generics in Nightly
// @version        2019/05/29 16:00 Bug 1519514 - Convert tab bindings
// @version        2018/12/23 14:00 Adjust margin
// @version        2018/12/23 00:00 Add option of SidebarModoki posiotion SM_RIGHT
// @version        2018/05/10 00:00 for 61 wip Bug 1448810 - Rename the Places sidebar files
// @version        2018/05/08 21:00 use jsonToDOM(https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion)
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

if (location.href == "chrome://browser/content/places/bookmarksSidebar.xhtml?SM") {
  document.getElementById("sidebar-panel-header")?.
          style.setProperty("display", "none", "important");
}
if (location.href == "chrome://browser/content/places/historySidebar.xhtml?SM") {
  document.querySelector("#history-panel > #bhTooltip + hbox")?.
          style.setProperty("display", "none", "important");
}
if (location.href == "chrome://browser/content/genai/chat.html?SM") {
  document.getElementById("header")?.
          style.setProperty("display", "none", "important");
}

if (location.href == "chrome://browser/content/browser.xhtml")
window.SidebarModoki = {
  // -- config --
  SM_RIGHT: false,  // SidebarModoki position
  SM_WIDTH : 230,
  SM_AUTOHIDE : false,  //F11 Fullscreen
  TAB_SRC : ["chrome://browser/content/places/bookmarksSidebar.xhtml?SM",
             "chrome://browser/content/places/historySidebar.xhtml?SM",
             "chrome://browser/content/downloads/contentAreaDownloadsView.xhtml?SM",
             "chrome://browser/content/genai/chat.html?SM"],
  TAB_LABEL : ["Bookmarks", "History", "DL", "AI"],
  // -- config --

  kSM_Open : "userChrome.SidebarModoki.Open",
  kSM_lastSelectedTabIndex : "userChrome.SidebarModoki.lastSelectedTabIndex",
  kSM_lastSelectedTabWidth : "userChrome.SidebarModoki.lastSelectedTabWidth",
  get ToolBox() {
    return document.getElementById("SM_toolbox");
  },
  get Splitter() {
    return document.getElementById("SM_splitter");
  },
  Button: null,

  get prefs(){
    delete this.prefs;
    return this.prefs = Services.prefs;
  },

  jsonToDOM: function(jsonTemplate, doc, nodes) {
    jsonToDOM.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
    };
    jsonToDOM.defaultNamespace = jsonToDOM.namespaces.xul;
    function jsonToDOM(jsonTemplate, doc, nodes) {
      function namespace(name) {
          var reElemNameParts = /^(?:(.*):)?(.*)$/.exec(name);
          return { namespace: jsonToDOM.namespaces[reElemNameParts[1]], shortName: reElemNameParts[2] };
      }

      // Note that 'elemNameOrArray' is: either the full element name (eg. [html:]div) or an array of elements in JSON notation
      function tag(elemNameOrArray, elemAttr) {
        // Array of elements?  Parse each one...
        if (Array.isArray(elemNameOrArray)) {
          var frag = doc.createDocumentFragment();
          Array.prototype.forEach.call(arguments, function(thisElem) {
            frag.appendChild(tag.apply(null, thisElem));
          });
          return frag;
        }

        // Single element? Parse element namespace prefix (if none exists, default to defaultNamespace), and create element
        var elemNs = namespace(elemNameOrArray);
        var elem = doc.createElementNS(elemNs.namespace || jsonToDOM.defaultNamespace, elemNs.shortName);

        // Set element's attributes and/or callback functions (eg. onclick)
        for (var key in elemAttr) {
          var val = elemAttr[key];
          if (nodes && key == "keyvalue") {  //for later convenient JavaScript access) by giving them a 'keyvalue' attribute; |nodes|.|keyvalue|
              nodes[val] = elem;
              continue;
          }

          var attrNs = namespace(key);
          if (typeof val == "function") {
            // Special case for function attributes; don't just add them as 'on...' attributes, but as events, using addEventListener
            elem.addEventListener(key.replace(/^on/, ""), val, false);
          } else {
            // Note that the default namespace for XML attributes is, and should be, blank (ie. they're not in any namespace)
            elem.setAttributeNS(attrNs.namespace || "", attrNs.shortName, val);
          }
        }

        // Create and append this element's children
        var childElems = Array.prototype.slice.call(arguments, 2);
        childElems.forEach(function(childElem) {
          if (childElem != null) {
            elem.appendChild(
                doc.defaultView.Node.isInstance(childElem)
                /*childElem instanceof doc.defaultView.Node*/ ? childElem :
                    Array.isArray(childElem) ? tag.apply(null, childElem) :
                        doc.createTextNode(childElem));
          }
        });
        return elem;
      }
      return tag.apply(null, jsonTemplate);
    }

    return jsonToDOM(jsonTemplate, doc, nodes);
  },

  init: function() {
    let chromehidden = document.getElementById("main-window").hasAttribute("chromehidden");
    if (chromehidden &&
        document.getElementById("main-window").getAttribute("chromehidden").includes("extrachrome")) {
      return; // do nothing
    }

    let MARGINHACK = this.SM_RIGHT ? "0 0 0 0" : "0 -2px 0 0";
    let style = `
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);

      /* ::::: tabs ::::: */

      #SM_toolbox tabs {
        border-bottom: 1px solid ThreeDShadow;
      }

      /* ::::: tabpanels ::::: */

      #SM_toolbox tabpanels {
        padding: 8px;
      }

      /* ::::: tab ::::: */

      #SM_toolbox tab {
        position: relative;
        border-bottom: 3px solid transparent;
        padding: 3px 0.3em !important;

        &:where(:hover) {
          background-color: color-mix(in srgb, currentColor 15%, transparent);
        }

        &:where(:hover:active, [visuallyselected]) {
          background-color: color-mix(in srgb, currentColor 30%, transparent);
        }

        &:where([visuallyselected]) {
          border-bottom-color: AccentColor;
        }
      }

      #SM_toolbox .tab-text {
        margin: 0 !important;
      }

      #SM_toolbox .tabs-right {
        flex: 1;
      }

      
      /*
      #SM_toolbox
      {
        width: {SM_WIDTH}px;
        background-color: var(--toolbar-bgcolor);
        color: -moz-dialogtext;
        text-shadow: none;
      }
      */
      #SM_toolbox {
        /*background-color: var(--lwt-accent-color);*/
        background-color: var(--toolbar-bgcolor);
/*
        color: var(--lwt-text-color);
*/
      }
      .SM_toolbarspring {
          max-width: unset !important;
      }
      
      /*visibility*/
      #SM_toolbox[collapsed],
      #SM_splitter[collapsed],
      /*フルスクリーン*/
      #SM_toolbox[moz-collapsed="true"],
      #SM_splitter[moz-collapsed="true"]
      {
        visibility:collapse;
      }
      #SM_splitter {
        background-color: var(--toolbar-bgcolor) !important;
        border-inline-start-color: var(--toolbar-bgcolor) !important;
        border-inline-end-color: var(--toolbar-bgcolor) !important;
      }

      #SM_toolbox,
      #SM_splitter {
        /* Make room for the bookmarks toolbar so that it won't actually overlap the
           new tab page and sidebar contents. */
        padding-top: var(--bookmarks-toolbar-height);
      }

      /*ポップアップの時*/
      #main-window[chromehidden~="extrachrome"] #SM_toolbox,
      #main-window[chromehidden~="extrachrome"] #SM_splitter
      {
        visibility: collapse;
      }

      #SM_tabpanels
      { 
        appearance: none !important;
        padding: 0 !important;
        margin: {MARGINHACK}; /*hack*/
        appearance: unset;
        color-scheme: unset !important;
      }

      toolbar[brighttext] #SM_tabbox {
        background-color: var(--toolbar-bgcolor);
      }
      #SM_tabs {
        overflow-x: hidden;
      }
      #SM_tabs tab {
        appearance: none !important;
      }
      #SM_tabs tab:not([selected]) {
        opacity: 0.6 !important;
      }
      #SM_tabs tab {
        color: unset !important;
      }
      
      #SM_Button
      {
        list-style-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4jWNgoAL4z8DA8N/AwAArTQRGFSBBI4YBDHhonC6n3AA1NTUMZ6F5gyQXYFNEsheweWnUBfRyAbmYcgMoAgBFX4a/wlDliwAAAABJRU5ErkJggg==');
      }
      toolbar[brighttext] #SM_Button
      {
        list-style-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANklEQVQ4jWP4TyFg+P///38GBgayMHUNwEdjdTrVDcDnTKJdgEsRSV5ACaBRF9DZBQObFygBAMeIxVdCQIJTAAAAAElFTkSuQmCC');
      }
     `;

  var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style.replace(/\s+/g, " ").replace(/\{SM_WIDTH\}/g, this.SM_WIDTH).replace(/\{MARGINHACK\}/g, MARGINHACK)));
  if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
    sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
/*
    style = style.replace(/\s+/g, " ").replace(/\{SM_WIDTH\}/g, this.SM_WIDTH).replace(/\{MARGINHACK\}/g, MARGINHACK);
    let sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };
*/
    // xxxx try-catch may need for 2nd window
    try {
      CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
        id: 'SM_Button',
        type: 'custom',
        defaultArea: CustomizableUI.AREA_NAVBAR,
        class: "toolbarbutton-1 chromeclass-toolbar-additional",
        tooltiptext: "Sidebar Modoki",
        //oncommand: "SidebarModoki.toggle();",
        type: "button",
        label: "Sidebar Modoki",
        onCommand: function(event) {
          event.target.ownerGlobal.SidebarModoki.toggle();
        },
       	onCreated: function(toolbaritem) {
      	  return toolbaritem;
      	}
      });
    }catch(e){}

    // to do, replace with MozXULElement.parseXULToFragment();
    let template = ["command", {id: "cmd_SidebarModoki"/*, oncommand: "SidebarModoki.toggle()"*/}];
    document.getElementById("mainCommandSet").appendChild(this.jsonToDOM(template, document, {}));
    template = ["key", {id: "key_SidebarModoki", key: "B", modifiers: "accel,alt"/*, command: "cmd_SidebarModoki",*/}];
    document.getElementById("mainKeyset").appendChild(this.jsonToDOM(template, document, {}));

    document.getElementById("mainCommandSet").addEventListener("command", event => {
        if (event.target.id == "cmd_SidebarModoki"){SidebarModoki.toggle()}
    });
    document.getElementById("mainKeyset").addEventListener("command", event => {
        if (event.target.id == "key_SidebarModoki"){SidebarModoki.toggle()}
    });

//to do xxx ordinal=xx shoud be replaced with style="-moz-box-ordinal-group: xx;"
    template =
      ["vbox", {id: "SM_toolbox", style: this.SM_RIGHT ? "/*-moz-box-ordinal-group:10;*/ order: 10;" : "/*-moz-box-ordinal-group:0;*/ order: -1;", collapsed: "true"},  /*Bug 1820534*/
        ["hbox", {id: "SM_header", align: "center"},
          ["label", {}, "SidebarModoki"],
          ["toolbarspring", {class: "SM_toolbarspring", flex: "1000"}],
          ["toolbarbutton", {id: "SM_closeButton", class: "close-icon tabbable", tooltiptext: "Close SidebarModoki"/*, oncommand: "SidebarModoki.close();"*/}]
        ],
        ["tabbox", {id:"SM_tabbox", flex: "1", handleCtrlPageUpDown: false, handleCtrlTab: false},
          ["tabs", {id: "SM_tabs"},
            ["tab", {id: "SM_tab0", accesskey: "B", label: this.TAB_LABEL[0]}],
            ["tab", {id: "SM_tab1", accesskey: "H", label: this.TAB_LABEL[1]}],
            ["tab", {id: "SM_tab2", accesskey: "D", label: this.TAB_LABEL[2]}],
            ["tab", {id: "SM_tab3", accesskey: "A", label: this.TAB_LABEL[3]}]
          ],
          ["tabpanels", {id: "SM_tabpanels", flex: "1", style: "border: none;"},
            ["tabpanel", {id: "SM_tab0-container", orient: "vertical", flex: "1"},
              ["browser", {id: "SM_tab0-browser", flex: "1", autoscroll: "false", src: ""}]
            ],
            ["tabpanel", {id: "SM_tab1-container", orient: "vertical", flex: "1"},
              ["browser", {id: "SM_tab1-browser", flex: "1", autoscroll: "false", src: ""}]
            ],
            ["tabpanel", {id: "SM_tab2-container", orient: "vertical", flex: "1"},
              ["browser", {id: "SM_tab2-browser", flex: "1", autoscroll: "false", src: ""}]
            ],
            ["tabpanel", {id: "SM_tab3-container", orient: "vertical", flex: "1"},
              ["browser", {id: "SM_tab3-browser", flex: "1", autoscroll: "false", src: ""}]
            ]
          ]
        ]
      ];
    let sidebar = document.getElementById("sidebar-box");
    sidebar.parentNode.insertBefore(this.jsonToDOM(template, document, {}), sidebar);
    document.getElementById("SM_closeButton").addEventListener("command", () => SidebarModoki.close());

    template =
      ["splitter", {id: "SM_splitter", style: this.SM_RIGHT ? "/*-moz-box-ordinal-group:9;*/ order: 9;" : "/*-moz-box-ordinal-group:0;*/ order: -1;", state: "open", collapse: this.SM_RIGHT ? "after" :"before", resizebefore:"sibling", resizeafter:"none", collapsed: "true"}, /*Bug 1820534*/
        ["grippy", {}]
      ];
    sidebar.parentNode.insertBefore(this.jsonToDOM(template, document, {}), sidebar);

    //xxx 69 hack
    let tabbox = document.getElementById("SM_tabbox");
    tabbox.handleEvent = function handleEvent(event) {
      if (!event.isTrusted) {
        // Don't let untrusted events mess with tabs.
        return;
      }

      // Skip this only if something has explicitly cancelled it.
      if (event.defaultCancelled) {
        return;
      }

      // Don't check if the event was already consumed because tab
      // navigation should always work for better user experience.
      const lazy = {};

      ChromeUtils.defineESModuleGetters(lazy, {
        ShortcutUtils: "resource://gre/modules/ShortcutUtils.sys.mjs",
      });

      switch (lazy.ShortcutUtils.getSystemActionForEvent(event)) {
        case lazy.ShortcutUtils.CYCLE_TABS:
          if (this.tabs && this.handleCtrlTab) {
            this.tabs.advanceSelectedTab(event.shiftKey ? -1 : 1, true);
            event.preventDefault();
          }
          break;
        case lazy.ShortcutUtils.PREVIOUS_TAB:
          if (this.tabs && this.handleCtrlPageUpDown) {
            this.tabs.advanceSelectedTab(-1, true);
            event.preventDefault();
          }
          break;
        case lazy.ShortcutUtils.NEXT_TAB:
          if (this.tabs && this.handleCtrlPageUpDown) {
            this.tabs.advanceSelectedTab(1, true);
            event.preventDefault();
          }
          break;
      }
    };

    let index = document.getElementById("SM_tabpanels").selectedIndex;
    let tb0 = document.getElementById("SM_tab0");
    let tb1 = document.getElementById("SM_tab1");
    let tb2 = document.getElementById("SM_tab2");
    let tb3 = document.getElementById("SM_tab3");
    tb0.parentNode.insertBefore(tb0, tb1);
    tb0.parentNode.insertBefore(tb1, tb2);
    tb0.parentNode.insertBefore(tb2, tb3);
    document.getElementById("SM_tabs").selectedIndex = index;

    setTimeout(function(){this.observe();}.bind(this), 0);

    //F11 fullscreen
    FullScreen.showNavToolbox_org = FullScreen.showNavToolbox;
    FullScreen.showNavToolbox = function(trackMouse = true) {
      this.showNavToolbox_org.apply(this, arguments);
      if (!!SidebarModoki.ToolBox) {
        SidebarModoki.ToolBox.removeAttribute("moz-collapsed"); 
        SidebarModoki.Splitter.removeAttribute("moz-collapsed");
      }
    }
    FullScreen.hideNavToolbox_org = FullScreen.hideNavToolbox;
    FullScreen.hideNavToolbox = function(aAnimate = false) {
      this.hideNavToolbox_org.apply(this, arguments);
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
/*
    SidebarController.setPosition_org = SidebarController.setPosition;
    SidebarController.setPosition = function() {
      SidebarController.setPosition_org.apply(this, arguments);
      if (SidebarModoki && SidebarModoki.ToolBox) 
      SidebarModoki.ToolBox.style.setProperty("-moz-box-ordinal-group", SidebarModoki.SM_RIGHT ? "10" : "0", "");
      if (SidebarModoki && SidebarModoki.Splitter) 
      SidebarModoki.Splitter.style.setProperty("-moz-box-ordinal-group", SidebarModoki.SM_RIGHT ? "9" : "0", "");
    };
*/
  },

  observe: function() {
/*
    this.Splitter.addEventListener("dblclick", () => {;
      if (this.Splitter.getAttribute("state") == "open") {
        this.Splitter.setAttribute("state", "collapsed");
      } else {
        this.Splitter.setAttribute("state", "open");
      }
    }, true);
*/
    /*this.ToolBox.style.setProperty("-moz-box-ordinal-group", this.SM_RIGHT ? "10" : "0", "");*/ /*Bug 1820534*/
    this.ToolBox.style.setProperty("order", this.SM_RIGHT ? "10" : "-1", "");
    /*this.Splitter.style.setProperty("-moz-box-ordinal-group", this.SM_RIGHT ? "9" : "0", "");*/ /*Bug 1820534*/
    this.Splitter.style.setProperty("order", this.SM_RIGHT ? "9" : "-1", "");

    if (this.getPref(this.kSM_Open, "bool", true)) {
      this.toggle(true);
    } else {
      this.close();
    }
    document.getElementById("SM_tabs").addEventListener("focus", this, true);
    window.addEventListener("aftercustomization", this, false);

    // xxxx native sidebar changes ordinal when change position of the native sidebar and open/close
    this.SM_Observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.attributeName) {
          case "collapsed":
          case "hidden":
          case "positionend":
            setTimeout(() => {
              /*this.ToolBox.style.setProperty("-moz-box-ordinal-group", this.SM_RIGHT ? "10" : "0", "");*/ /*Bug 1820534*/
              this.ToolBox.style.setProperty("order", this.SM_RIGHT ? "10" : "-1", "");
              /*this.Splitter.style.setProperty("-moz-box-ordinal-group", this.SM_RIGHT ? "9" : "0", "");*/ /*Bug 1820534*/
              this.Splitter.style.setProperty("order", this.SM_RIGHT ? "9" : "-1", "");
            }, 0);
            break;
        }
      }.bind(this));
    }.bind(this));
    // pass in the target node, as well as the observer options
    this.SM_Observer.observe(document.getElementById("sidebar-box"),
                             {attribute: true, attributeFilter: ["collapsed", "hidden", "positionend"]});
  },

  onSelect: function(event) {
    let aIndex = document.getElementById("SM_tabpanels").selectedIndex;
    this.prefs.setIntPref(this.kSM_lastSelectedTabIndex, aIndex);
    width = this.getPref(this.kSM_lastSelectedTabWidth + aIndex, "int", this.SM_WIDTH);
    if (document.getElementById("SM_tab" + aIndex +"-browser").src == "" ) {
      document.getElementById("SM_tab" + aIndex +"-browser").src = this.TAB_SRC[aIndex];
    }
    document.getElementById("SM_toolbox").style.setProperty("width", width + "px", "");
  },
  
  toggle: function(forceopen) {
    Services.console.logStringMessage(window.SidebarModoki === this);
    Services.console.logStringMessage(this.kSM_lastSelectedTabIndex);
    this.Button = document.getElementById("SM_Button");
    if (!this.Button.hasAttribute("checked") || forceopen) {
      this.Button.setAttribute("checked", true);
      this.ToolBox.collapsed= false;
      this.Splitter.collapsed= false;
      let index = this.getPref(this.kSM_lastSelectedTabIndex, "int", 0);
      document.getElementById("SM_tabs").selectedIndex = index;
      width = this.getPref(this.kSM_lastSelectedTabWidth + index, "int", this.SM_WIDTH);
      document.getElementById("SM_toolbox").style.setProperty("width", width + "px", "");
      this.prefs.setBoolPref(this.kSM_Open, true)
      this.onSelect({});
      addEventListener("resize", this, false);
    } else {
      this.close();
    }
  },

  close: function() {
    removeEventListener("resize", this, false);
    this.Button = document.getElementById("SM_Button");
    this.Button.removeAttribute("checked");
    this.ToolBox.collapsed = true;
    this.Splitter.collapsed = true;
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
      case 'focus':
        this.onSelect(event);
        break;
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

if (location.href == "chrome://browser/content/browser.xhtml")
  SidebarModoki.init();
