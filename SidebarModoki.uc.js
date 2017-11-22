// ==UserScript==
// @name           SidebarModoki
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TST
// @include        main
// @compatibility  Firefox 57
// @author         Alice0775
// @note           Tree Style Tab がある場合にブックマークと履歴等を別途"サイドバーもどき"で表示
// @version        2017/11/22 23:00 DOM fullscreen
// @version        2017/11/22 22:00 F11 fullscreen
// @version        2017/11/15 09:00
// ==/UserScript==


var SidebarModoki = {
  // -- config --
  SM_WIDTH : 130,
  SM_AUTOHIDE : false,  //F11 Fullscreen
  TAB0_SRC   : "chrome://browser/content/bookmarks/bookmarksPanel.xul",
  TAB0_LABEL : "Bookmarks",
  TAB1_SRC   : "chrome://browser/content/history/history-panel.xul",
  TAB1_LABEL : "History",
  TAB2_SRC   : "",
  TAB2_LABEL : "none",
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

  init: function() {

    let style = `
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
      #SM_toolbox
      {
        width: {SM_WIDTH}px;
      }

      /*フルスクリーン*/
      #SM_toolbox[moz-collapsed="true"],
      #SM_splitter[moz-collapsed="true"],
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
      #SM-tabpanels
      { 
        padding: 0;
        border: hidden !important;
      }


      #SM_Button
      {
        list-style-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADQklEQVQ4jZ2US28TVxiG3f+QDW5JlYrGG0pbVWAoJvcqdhw7TvAY23OJJ449t0ziyYydcRxfGAI4yCotUhdVxIIlQmxYwAI2CKSoYhEkJKRs0gXSGQuHCV0QKauXTWKXCqmCV3oW5xzpWZzv0+ty/SsAvvgUXP8NgC4A7s+k61DiDkbZqZ4TZ/76+vjpvZ7vzuwd+8GH/+ObE2fR8/3Pm6HY9HkAbhcA97c/9r/yjZ53RifZ1hQr7fQFEwjGZj5gjOIxRvHtcyCaQl+AguengVZbdGoo/E+MV5t0ViPp+aI9nsiCEfQ28dkclHytqeRrzfhsDoygg84uIsarOD0yibbIF7zgMKJOGFEnswslezwpgJUMsJIBRtQRpgW8eLl198XLrbthWgAj6u33gVCyI+ofTzicXCCcXCDCYtkOMxIYyUAio2EqNQdBL28DEAAIgl7enkrNIZHRwEgGhibojmggRDsptUhSapFIRtUOMzLEfO3tnXsPnmw8e/5o583uTQDnAJzbebN7c+PZ80d37j14IuZrbwcnmI5ocIJx0gslkl4oETlv2WFGhmxUt/b29wsAOABeAMcO8ALg9vb3C7JR3RoKswDwpQuAeyQy7WS0CsloFaKYq3aEUxFKCvD5qYfNZtMLoBvAVwd0N5tNr89PPQwlBQxPTgPAURcA9y/RlCMYFhEMi8yv1O1oWgMnL6EvGAfFiiUAvQdL2wWgl2LFUl8wDk5ewig10xH5qVlHNleJbK6Sxeo1O57NQypcQoRVsH7rtgWgu9VqeVqtlgdA9/qt21aEVSAVLmEsnumIAvGso5bqRC3ViXHxVzshmVBX1hBNa3j8dIO2rlw/23uyf7P3ZP9moXJ58PHTDTqa1qCurCGYFDt/NJbI7uYqDZKrNEhh9YbNzC0jV22AVkwEKP7+qZHIu1FqBv5YGt6RyXcBir9PKyZy1QbGabkztWBC/FstX7MXreukWP/D5ubL0K3fIJtXQEtL4OaWoRSvQileBacug5aXIJmXMV9uIMQoO4eiI2s31vMXpMI2r1VbvHbxdVq3kNYt8FoNqVwVvFbDx+6SkunUf//TBHDksAE8AIYB+D+RYQCej/XSZxfbe0aP+PckvphDAAAAAElFTkSuQmCC');
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


    let overlay = `
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                 xmlns:html="http://www.w3.org/1999/xhtml">
        <hbox id="nav-bar-customization-target">
          <toolbarbutton id = "SM_Button"
                         label ="Sidebar Modoki"
                         tooltiptext = "Sidebar Modoki"
                         class = "toolbarbutton-1 chromeclass-toolbar-additional"
                         oncommand="SidebarModoki.toggle()"
                         type="checkbox"
                         autoCheck="false">
          </toolbarbutton>
        </hbox>
    </overlay>
    `;

    overlay = overlay.replace(/\s+/g, " ");
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, null);

    overlay = `
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                 xmlns:html="http://www.w3.org/1999/xhtml">
      <hbox id="browser">
      <tabbox id="SM_toolbox"
            ordinal="0"
            insertBefore="sidebar-box"
            command="SidebarModoki">
        <tabs id="tabs" onselect="SidebarModoki.onSelect(this);">
          <tab id="tab0" label="{tab0-label}"/>
          <tab id="tab1" label="{tab1-label}"/>
          <tab id="tab2" label="{tab2-label}"/>
        </tabs>
        <tabpanels id="SM-tabpanels" flex="1" style="border: none;">
          <tabpanel id="tab0-container" orient="vertical" flex="1">
            <browser id="tab0-browser" flex="1" autoscroll="false" src="{tab0-src}"/>
          </tabpanel>
          
          <tabpanel id="tab1-container" orient="vertical" flex="1">
            <browser id="tab1-browser" flex="1" autoscroll="false" src="{tab1-src}"/>
          </tabpanel>
          
          <tabpanel id="tab2-container" orient="vertical" flex="1">
            <browser id="tab2-browser" flex="1" autoscroll="false" src="{tab2-src}"/>
          </tabpanel>
        </tabpanels>
      </tabbox>
      <splitter ordinal="1"
                id = "SM_splitter"
                state = "open"
                collapse = "before"
                resizebefore = "closest"
                resizeafter = "closest" >

        <grippy></grippy>
      </splitter>
      </hbox>
    </overlay>
    `;

    overlay = overlay.replace(/\{tab0-src\}/g, this.TAB0_SRC)
                     .replace(/\{tab1-src\}/g, this.TAB1_SRC)
                     .replace(/\{tab2-src\}/g, this.TAB2_SRC)
                     .replace(/\{tab0-label\}/g, this.TAB0_LABEL)
                     .replace(/\{tab1-label\}/g, this.TAB1_LABEL)
                     .replace(/\{tab2-label\}/g, this.TAB2_LABEL)
                     .replace(/\s+/g, " ");
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, this);

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

    let index = this.getPref(this.kSM_lastSelectedTabIndex, "int", 0);
		document.getElementById("tabs").selectedIndex = index;
    addEventListener("resize", this, false);
    if (this.getPref(this.kSM_Open, "bool", true)) {
      this.toggle(true);
    } else {
      this.close();
    }

    this.SM_Observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.attributeName) {
          case "ordinal":
            this.ToolBox.setAttribute("ordinal", "0");
            this.Splitter.setAttribute("ordinal", "1");
            break;
        }
      }.bind(this));
    }.bind(this));
    // configuration of the observer:
    var config = { attributes: true, subtree: false};
    // pass in the target node, as well as the observer options
    this.SM_Observer.observe(document.getElementById("appcontent"),
                             {attribute: true, attributeFilter: ["ordinal"]});
  },

  onSelect: function(aTab) {
    let aIndex = aTab.selectedIndex;
    document.getElementById("SM-tabpanels").selectedIndex = aIndex;
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
      this.prefs.setBoolPref(this.kSM_Open, true)
    } else {
      this.close();
    }
  },

  close: function() {
    this.Button = document.getElementById("SM_Button");
    this.Button.removeAttribute("checked");
    this.ToolBox.style.setProperty("visibility", "collapse", "");
    this.Splitter.style.setProperty("visibility", "collapse", "");
    this.prefs.setBoolPref(this.kSM_Open, false)
  },


  //ここからは, 大きさの調整
  onResize: function(event) {
     let width = this.ToolBox.getBoundingClientRect().width;
     let aIndex = document.getElementById("tabs").selectedIndex;
     this.prefs.setIntPref(this.kSM_lastSelectedTabWidth + aIndex, width);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case 'resize':
        this.onResize(event);
        break;
      case 'MozDOMFullscreen:Entered':
        if (!!SidebarModoki.ToolBox) {
          SidebarModoki.ToolBox.setAttribute("moz-collapsed", "true");
          SidebarModoki.Splitter.setAttribute("moz-collapsed", "true");
        }
        break;
      case 'MozDOMFullscreen:Exited':
        if (!!SidebarModoki.ToolBox) {
          SidebarModoki.ToolBox.removeAttribute("moz-collapsed"); 
          SidebarModoki.Splitter.removeAttribute("moz-collapsed");
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
