// ==UserScript==
// @name           SidebarModoki
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TST
// @include        main
// @compatibility  Firefox 73+
// @author         Alice0775
// @note           Tree Style Tab がある場合にブックマークと履歴等を別途"サイドバーもどき"で表示
// @note           SidebarModoki.uc.js.css をuserChrome.cssに読み込ませる必要あり
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


var SidebarModoki = {
  // -- config --
  SM_RIGHT: false,  // SidebarModoki position
  SM_WIDTH : 130,
  SM_AUTOHIDE : false,  //F11 Fullscreen
  TAB0_SRC   : "chrome://browser/content/places/bookmarksSidebar.xhtml",
  TAB0_LABEL : "Bookmarks",
  TAB1_SRC   : "chrome://browser/content/places/historySidebar.xhtml",
  TAB1_LABEL : "History",
  TAB2_SRC   : "chrome://browser/content/downloads/contentAreaDownloadsView.xhtml?SM",
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
                childElem instanceof doc.defaultView.Node ? childElem :
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
        document.getElementById("main-window").getAttribute("chromehidden").includes("extrachrome")) {      return; // do nothing
    }

    let MARGINHACK = this.SM_RIGHT ? "0 -4px 0 0" : "0 -6px 0 -4px";
    let style = `
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
      #SM_toolbox
      {
        width: {SM_WIDTH}px;
        background-color: -moz-dialog;
        color: -moz-dialogtext;
        text-shadow: none;
      }
      #SM_toolbox:not(.titlebar-color) {
          width: 130px;
          background-color: var(--toolbar-bgcolor);
          color: var(--toolbar-color);
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
        margin: {MARGINHACK}; /*hack*/
      }
      #SM_tabpanels:not(.titlebar-color) {
          background-color: var(--toolbar-bgcolor);
          color: var(--toolbar-color);
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

    style = style.replace(/\s+/g, " ").replace(/\{SM_WIDTH\}/g, this.SM_WIDTH).replace(/\{MARGINHACK\}/g, MARGINHACK);
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
            type: "button",
            label: "Sidebar Modoki",
            removable: "true"
          };
          for (var p in props) {
            toolbaritem.setAttribute(p, props[p]);
          }
          
          return toolbaritem;
        }
      });
    }catch(e){}

    // to do, replace with MozXULElement.parseXULToFragment();
    let template = ["command", {id: "cmd_SidebarModoki", oncommand: "SidebarModoki.toggle()"}];
    document.getElementById("mainCommandSet").appendChild(this.jsonToDOM(template, document, {}));

    template = ["key", {id: "key_SidebarModoki", key: "B", modifiers: "accel,alt", command: "cmd_SidebarModoki",}];
    document.getElementById("mainKeyset").appendChild(this.jsonToDOM(template, document, {}));

    template =
      ["vbox", {id: "SM_toolbox", ordinal: this.SM_RIGHT ? "10" : "0"},
        ["hbox", {id: "SM_header", align: "center"},
          ["label", {}, "SidebarModoki"],
          ["spacer", {flex: "1000"}],
          ["toolbarbutton", {id: "SM_closeButton", class: "close-icon tabbable", tooltiptext: "Close SidebarModoki", oncommand: "SidebarModoki.close();"}]
        ],
        ["tabbox", {id:"SM_tabbox", flex: "1", handleCtrlPageUpDown: false, handleCtrlTab: false},
          ["tabs", {id: "SM_tabs"},
            ["tab", {id: "SM_tab0", label: this.TAB0_LABEL}],
            ["tab", {id: "SM_tab1", label: this.TAB1_LABEL}],
            ["tab", {id: "SM_tab2", label: this.TAB2_LABEL}]
          ],
          ["tabpanels", {id: "SM_tabpanels", flex: "1", style: "border: none;"},
            ["tabpanel", {id: "SM_tab0-container", orient: "vertical", flex: "1"},
              ["browser", {id: "SM_tab0-browser", flex: "1", autoscroll: "false", src: this.TAB0_SRC}]
            ],
            ["tabpanel", {id: "SM_tab1-container", orient: "vertical", flex: "1"},
              ["browser", {id: "SM_tab1-browser", flex: "1", autoscroll: "false", src: this.TAB1_SRC}]
            ],
            ["tabpanel", {id: "SM_tab2-container", orient: "vertical", flex: "1"},
              ["browser", {id: "SM_tab2-browser", flex: "1", autoscroll: "false", src: this.TAB2_SRC}]
            ]
          ]
        ]
      ];
    let sidebar = document.getElementById("sidebar-box");
    sidebar.parentNode.insertBefore(this.jsonToDOM(template, document, {}), sidebar);

    template =
      ["splitter", {id: "SM_splitter", ordinal: this.SM_RIGHT ? "9" : "0", state: "open", collapse: this.SM_RIGHT ? "after" :"before", resizebefore: "closest", resizeafter: "closest"},
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
      let imports = {};
      ChromeUtils.defineModuleGetter(
        imports,
        "ShortcutUtils",
        "resource://gre/modules/ShortcutUtils.jsm"
      );
      const { ShortcutUtils } = imports;

      switch (ShortcutUtils.getSystemActionForEvent(event)) {
        case ShortcutUtils.CYCLE_TABS:
          if (this.tabs && this.handleCtrlTab) {
            this.tabs.advanceSelectedTab(event.shiftKey ? -1 : 1, true);
            event.preventDefault();
          }
          break;
        case ShortcutUtils.PREVIOUS_TAB:
          if (this.tabs && this.handleCtrlPageUpDown) {
            this.tabs.advanceSelectedTab(-1, true);
            event.preventDefault();
          }
          break;
        case ShortcutUtils.NEXT_TAB:
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
    tb0.parentNode.insertBefore(tb0, tb1);
    tb0.parentNode.insertBefore(tb1, tb2);
    document.getElementById("SM_tabs").selectedIndex = index;

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
    document.getElementById("SM_tabs").addEventListener("focus", this, true);
    window.addEventListener("aftercustomization", this, false);

    // xxxx native sidebar changes ordinal when change position of the native sidebar and open/close
    this.SM_Observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.attributeName) {
          case "ordinal":
            this.ToolBox.setAttribute("ordinal", this.SM_RIGHT ? "10" : "0");
            this.Splitter.setAttribute("ordinal", this.SM_RIGHT ? "9" : "0");
            break;
        }
      }.bind(this));
    }.bind(this));
    // pass in the target node, as well as the observer options
    this.SM_Observer.observe(document.getElementById("appcontent"),
                             {attribute: true, attributeFilter: ["ordinal"]});
  },

  onSelect: function(event) {
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

SidebarModoki.init();
