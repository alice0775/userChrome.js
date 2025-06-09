// ==UserScript==
// @name           show_SearchBar_Histrory_Dropmarker.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Show Searchbar Histrory Dropmarker
// @include        main
// @compatibility  Firefox 137
// @version        2025/06/07 00:00 add margin
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version        2023/11/22 18:00 remove appearance for dropmarker icon
// @version        2023/02/26 21:00 wip dropmarker icon
// @version        2022/10/18 10:00 fix Bug 1790616
// @version        2021/07/22 -moz-context-properties seems do not work in 91+
// @version        2021/07/08 fix drop-down svg
// @version        2021/04/26 Bug 1620467 - Support standard 'appearance' CSS property unprefixed
// @version        2020/01/26 22:00 fix typo & simplify
// @version        2020/01/26 20:00 fox after DOM fullscreen
// @version        2019/11/22 00:00 workaround delayed initialize using gBrowserInit.delayedStartupFinished instead async Services.search.init()
// @version        2019/07/13 01:00 Fix 68 Bug 1556561 - Remove children usage from autocomplete binding
// @version        2019/06/10 01:00 Fix 67.0a1 Bug 1492475 The search service init() method should simply return a Promise
// @version        2019/05/24 11:00 Fix overflowed/underflowed
// @version        2018-09-16 fix button click
// @version        2018-07-21 add button toggle popup when click
// @version        2018-07-21 add button style open state
// @version        1.0
// @original       https://u6.getuploader.com/script/download/1670
// ==/UserScript==
var showSearchBarHistroryDropmarker = {
  init2: function(topic) {
    Services.console.logStringMessage("showSearchBarHistroryDropmarker "+topic);
    const kNSXUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    let bar = document.getElementById("searchbar");
    if (!bar)
      return;
    let ref = bar.querySelector(".search-go-container");
    if (ref.parentNode.querySelector(".searchBar-history-dropmarker"))
      return;
    Services.console.logStringMessage("showSearchBarHistroryDropmarker "+topic +" done");
    let btn = document.createElementNS(kNSXUL, "dropmarker");
    btn.setAttribute("anonid", "historydropmarker");
    btn.setAttribute("class", "searchBar-history-dropmarker chromeclass-toolbar-additional");
    btn.setAttribute("tooltiptext", "Show history");
    btn.setAttribute("inherits", "open,parentfocused=focused,usertyping");
    btn.setAttribute("ordinal", "99");
    btn.setAttribute("type", "checkbox");
    btn.setAttribute("autoCheck", "false");
    this.btn = ref.parentNode.insertBefore(btn, ref);
    btn.addEventListener("click", this, false);
    btn.addEventListener("mousedown", this, false);
  },

  init: async function() {
    if (!Services.search.isInitialized) {
      await Services.search.init();
    }
    window.addEventListener("unload", this, false);
    window.addEventListener('aftercustomization', this, false);
    window.addEventListener('MozDOMFullscreen:Exited', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    window.addEventListener("resize", this, false);
    this.popup = document.getElementById("PopupSearchAutoComplete");
    this.popup.addEventListener("popupshown", this, false);
    this.popup.addEventListener("popuphidden", this, false);
    this.init2("init");
    let style = `
      .search-go-container {
        /* -moz-box-ordinal-group:500; */  /* V-> */
      }
      .searchBar-history-dropmarker {
        /*appearance: none;*/
        list-style-image: url('chrome://devtools/skin/images/arrow-dropdown-12.svg');
        opacity: 0.6;
        margin: 0 0 0 0;
        padding: 9px 10px 9px 10px;
      }
      :root[uidensity="compact"] .searchBar-history-dropmarker {
        padding: 6px 10px 6px 10px;
      }
      :root[uidensity="touch"] .searchBar-history-dropmarker {
        padding: 10px 10px 10px 10px;
      }
      .searchBar-history-dropmarker:active,
      .searchBar-history-dropmarker[checked] {
        background-color: var(--toolbarbutton-active-background);
        opacity: 1;
      }
      .searchBar-history-dropmarker:hover {
        background-color: var(--urlbar-box-hover-bgcolor);
        opacity: 1;
      }
      toolbar[brighttext] .searchBar-history-dropmarker {
        list-style-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="rgb(251, 251, 254)" fill-opacity="1.0" d="M6 9a1 1 0 0 1-.707-.293l-3-3a1 1 0 0 1 1.414-1.414L6 6.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-3 3A1 1 0 0 1 6 9z"/></svg>');
        /*seems does not work on 91+ 
        -moz-context-properties: fill, fill-opacity;
        fill: currentColor;
        fill-opacity: var(--toolbarbutton-icon-fill-opacity);
        */
      }
      /*Bug 1936648*/
      *|input::-moz-search-clear-button {
        background-size:14px !important;
        opacity:0.6 !important;
        padding-inline: 1px !important;
      }
      *|input::-moz-search-clear-button:hover {
        opacity:1 !important;
        background-color: transparent !important;
      }
      *|input::-moz-reveal {
        background-size:14px !important;
        opacity:0.6 !important;
        padding-inline: 1px !important;
      }

      `.replace(/\s+/g, " ");

    let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
    let uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(style));
    if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    window.removeEventListener('aftercustomization', this, false);
    window.removeEventListener('MozDOMFullscreen:Exited', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
    window.removeEventListener("resize", this, false);
  },

  showHistory: function(event) {
    event.stopPropagation();
  	let bar = document.getElementById("searchbar");
    if (event.target.hasAttribute("checked")) {
      bar._textbox.closePopup();
      return;
    }
  	let v = '';
		if(bar._textbox.value)
		  v = bar._textbox.value;
		bar._textbox.value = '';
		bar._textbox.showHistoryPopup();
		bar._textbox.value = v;
	},

  popupshown: function(event) {
    this.btn.setAttribute("checked", true);
  },

  popuphidden: function(event) {
    setTimeout(function(){this.btn.removeAttribute("checked");}.bind(this), 0);
  },
  
  observe(aSubject, aTopic, aPrefstring) {
      if (aTopic == 'nsPref:changed') {
        // 設定が変更された時の処理
        setTimeout(function(){showSearchBarHistroryDropmarker.init2(aTopic);}, 0);
      }
  },

  _timer: null,
  handleEvent: function(event) {
    switch(event.type) {
      case "MozDOMFullscreen:Exited":
        setTimeout(() => {this.init2(event.type);}, 1000);
        break;
      case "aftercustomization":
        this.init2(event.type);
        break;
      case "mousedown":
        if (event.button == 0)
          this.showHistory(event);
        break;
      case "click":
        if (event.button == 0) {
          //event.stopPropagation();
          //event.preventDefault();
        }
        break;
      case "popupshown":
        this.popupshown(event);
        break;
      case "popuphidden":
        this.popuphidden(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  }
}

// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  showSearchBarHistroryDropmarker.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      showSearchBarHistroryDropmarker.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
