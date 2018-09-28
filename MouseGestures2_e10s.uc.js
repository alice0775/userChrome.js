// ==UserScript==
// @name          Mouse Gestures (with Wheel Gesture and Rocker Gesture)
// @namespace     http://www.xuldev.org/
// @description   Lightweight customizable mouse gestures.
// @include       main
// @charset       UTF-8
// @author        Gomita, Alice0775 since 2018/09/26
// @compatibility 60
// @version       2018/09/28 19:00 fix typo(wip)
// @version       2018/09/28 18:50 fix gestures command(wip)
// @version       2018/09/28 18:30 change gestures command(wip)
// @version       2018/09/28 06:30 fix regression (wip)
// @version       2018/09/28 06:30 add/modify some gesture (wip)
// @version       2018/09/28 06:00 add library(ucjsMouseGestures_helper.hogehoge) (wip)
// @version       2018/09/27 22:00 add outline for hover links (wip)
// @version       2018/09/27 16:00 fix rocker gesture etc (wip)
// @version       2018/09/26 20:40 fix statusinfo in fx60 (wip)
// @version       2018/09/26 20:40 add find command (wip)
// @version       2018/09/26 20:30 fix page scrolled when Wheel Gesture (wip)
// @version       2018/09/26 19:10 fix author; (wip)
// @version       2018/09/26 19:10 fix missing break; (wip)
// @version       2018/09/26 19:00 fix statusinfo (wip)
// @version       2018/09/26 18:30 e10s (wip)
// @original      ver. 1.0.20080201
// @homepage      http://www.xuldev.org/misc/ucjs.php
// ==/UserScript==

// @note          Linux and Mac are not supported.

var ucjsMouseGestures = {
  // == config ==
  // options
  enableWheelGestures: true,  // Wheel Gestures (Scroll wheel with holding right-click)
  enableRockerGestures: true,  // Rocker Gestures (Left-click with holding right-click and vice versa)
  // These are the mouse gesture mappings. Customize this as you like. 
  // Gesture Sequence,  UDRL: right-click then move to up down right left
  // Wheel Gestures,    W+ : right-click then wheel turn down , W- : left-click then wheel turn up
  // Rocker Gestures,   L<R : right-click then left-click , L>R : left-click then right-click
  // Any Gesture Sequence,  *hogehoge :  Gesture Sequence following that any faesture
  // ucjsMouseGestures._lastX, ucjsMouseGestures._lastY  : start coordinates
  // ucjsMouseGestures._linkURLs ,ucjsMouseGestures._linkdocURLs : link url hover, ownerDocument url
  // ucjsMouseGestures._selLinkURLs ,ucjsMouseGestures._selLinkdocURLs: link url in selected, ownerDocument url
  // ucjsMouseGestures._docURL : ownerDocument url
  // ucjsMouseGestures._linkURL ,ucjsMouseGestures._linkTXT : ownerDocument url : link url, ownerDocument url
  // ucjsMouseGestures._imgSRC ,ucjsMouseGestures._mediaSRC : image src, nedia src
  // ucjsMouseGestures._selectedTXT : selected text
  // ucjsMouseGestures._version : browser major version
  commands : 
   [
     ['L', '戻る', function(){ document.getElementById("Browser:Back").doCommand(); } ],
     ['R', '進む', function(){ document.getElementById("Browser:Forward").doCommand(); } ],

     ['RULD', 'ひとつ上の階層へ移動', function(){ ucjsMouseGestures_helper.goUpperLevel(); } ],
     ['ULDR', '数値を増やして移動', function(){ ucjsMouseGestures_helper.goNumericURL(+1); } ],
     ['DLUR', '数値を減らして移動', function(){ ucjsMouseGestures_helper.goNumericURL(-1); } ],

     ['UD', 'リロード', function(){ document.getElementById("Browser:Reload").doCommand(); } ],
     ['UDU', 'リロード(キャッシュ無視)', function(){ document.getElementById("Browser:ReloadSkipCache").doCommand(); } ],
     ['', 'すべてタブをリロード', function(){ gBrowser.reloadAllTabs(gBrowser.selectedTab); } ],


     ['', 'リンクを新しいタブに開く', function(){ ucjsMouseGestures_helper.openURLsInSelection(); } ],
     ['*RDL', '選択範囲のリンクをすべてタブに開く', function(){ ucjsMouseGestures_helper.openSelectedLinksInTabs(); } ],
     ['*RUL', '通過したリンクをすべてタブに開く', function(){ ucjsMouseGestures_helper.openHoverLinksInTabs(); } ],

     ['', '選択したリンクを保存', function(){ ucjsMouseGestures_helper.saveHoverLinks(); } ],
     ['', '通過したリンクを保存', function(){ ucjsMouseGestures_helper.saveHoverLinks(); } ],

     ['', 'コピー', function(){ ucjsMouseGestures_helper.copyText(ucjsMouseGestures.selectedTXT); } ],
     ['', '通過したリンクをコピー', function(){ ucjsMouseGestures_helper.copyHoverLinks(); } ],
     ['', '選択したリンクをコピー', function(){ ucjsMouseGestures_helper.copySelectedLinks(); } ],

     ['UL', '前のタブ', function(){ gBrowser.tabContainer.advanceSelectedTab(-1, true); } ],
     ['UR', '次のタブ', function(){ gBrowser.tabContainer.advanceSelectedTab(+1, true); } ],
     ['', '新しいタブを開く', function(){ document.getElementById("cmd_newNavigatorTab").doCommand(); } ],
     ['', 'タブをピン留めトグル',
			 function(){ var tab = gBrowser.selectedTab;
			 	   tab.pinned ? gBrowser.unpinTab(tab) : gBrowser.pinTab(tab);
       } ],
     ['', 'タブを複製',
			 function(){ 
           var orgTab = gBrowser.selectedTab;
			 	   var newTab = gBrowser.duplicateTab(orgTab);
				   gBrowser.moveTabTo(newTab, orgTab._tPos + 1);
       } ],
     ['LD', 'タブを閉じる', function(){ document.getElementById("cmd_close").doCommand(); } ],
     ['', '左側のタブをすべて閉じる', function(){ ucjsMouseGestures_helper.closeMultipleTabs("left"); } ],
     ['', '右側のタブをすべて閉じる', function(){ ucjsMouseGestures_helper.closeMultipleTabs("right"); } ],
     ['', '他のタブをすべて閉じる', function(){ gBrowser.removeAllTabsBut(gBrowser.mCurrentTab); } ],
     ['', '閉じたタブを元に戻す', function(){ ocument.getElementById("History:UndoCloseTab").doCommand(); } ],

     ['', '最小化', function(){ window.minimize(); } ],
     ['', '最大化/元のサイズ', function(){ window.windowState == 1 ? window.restore() : window.maximize(); } ],
     ['', 'フルスクリーン', function(){ document.getElementById("View:FullScreen").doCommand(); } ],

     ['RU', '上端へスクロール', function(){ goDoCommand("cmd_scrollTop"); } ],
     ['RD', '下端へスクロール', function(){ goDoCommand("cmd_scrollBottom"); } ],
     ['U', '上へスクロール', function(){ goDoCommand("cmd_scrollPageUp"); } ],
     ['D', '下へスクロール', function(){ goDoCommand("cmd_scrollPageDown"); } ],

     ['W-', 'ズームイン', function(){ document.getElementById("cmd_fullZoomReduce").doCommand(); } ],
     ['W+', 'ズームアウト', function(){ document.getElementById("cmd_fullZoomEnlarge").doCommand(); } ],
     ['L<R', 'ズームリセット', function(){ document.getElementById("cmd_fullZoomReset").doCommand(); } ],

     ['DL', 'ページ内検索バー',
       function(){
         if (ucjsMouseGestures._version <= "60") {
           if (gBrowser.getFindBar()) {
             gFindBar.hidden? gFindBar.onFindCommand(): gFindBar.close();
           } else {
             gLazyFindCommand("onFindCommand");
           }
         } else {
           // 61+
           gBrowser.getFindBar().then(findbar => {
             findbar.hidden? findbar.onFindCommand(): findbar.close();
           });
         }
       } ],

     ['', '選択テキストで検索',
       function(){
         BrowserSearch.loadSearchFromContext(ucjsMouseGestures._selectedTXT,
                Services.scriptSecurityManager.createNullPrincipal({}));
       } ],
     ['DRD', '選択テキストで検索(検索エンジンポップアップ)', function(){ ucjsMouseGestures_helper.webSearchPopup(); } ],
     ['DR', '選択テキストを検索バーにコピー',
       function(){ 
         if (BrowserSearch.searchBar)
           BrowserSearch.searchBar.value = ucjsMouseGestures._selectedTXT || ucjsMouseGestures._linkTXT;
       } ],

     ['', '再起動', function(){ ucjsMouseGestures_helper.restart(); } ],
     ['', 'ブラウザーコンソール', function(){ ucjsMouseGestures_helper.openBrowserConsole(); } ],
   ],
  // == /config ==


  _lastX: 0,
  _lastY: 0,
  _directionChain: "",
  _linkdocURLs: [],
  _linkURLs: [],
  _selLinkdocURLs: [],
  _selLinkURLs: [],
  _docURL: "",
  _linkURL: "",
  _linkTXT: "",
  _imgSRC: "",
  _mediaSRC: "",
  _selectedTXT: "",
  _version: "",

  _isMac: false,  // for Mac

  set statusinfo(val) {
    if ("StatusPanel" in window) {
      // fx61+
      StatusPanel._label = val;
    } else {
      XULBrowserWindow.statusTextField.label = val
    }
    return val;
  },

  init: function() {
    this._version = Services.appinfo.version.split(".")[0];
    this._isMac = navigator.platform.indexOf("Mac") == 0;
    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mousedown", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mouseup", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("contextmenu", this, true);
    if (this.enableWheelGestures)
      window.addEventListener('wheel', this, true);

     messageManager.addMessageListener("ucjsMouseGestures_linkURL_start", this);
     messageManager.addMessageListener("ucjsMouseGestures_linkURLs_stop", this);
     messageManager.addMessageListener("ucjsMouseGestures_linkURL_dragstart", this);

     window.addEventListener("unload", this, false);
  },

  uninit: function() {
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mousedown", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mousemove", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mouseup", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("contextmenu", this, true);
    if (this.enableWheelGestures)
      window.removeEventListener('wheel', this, true);

     messageManager.removeMessageListener("ucjsMouseGestures_linkURL_start", this);
     messageManager.removeMessageListener("ucjsMouseGestures_linkURLs_stop", this);
     messageManager.removeMessageListener("ucjsMouseGestures_linkURL_dragstart", this);

     window.removeEventListener("unload", this, false);
  },

  _isMouseDownL: false,
  _isMouseDownR: false,
  _suppressContext: false,
  _shouldFireContext: false,  // for Linux

  receiveMessage: function(message) {
    Services.console.logStringMessage("message from framescript: " + message.name);
    switch(message.name) {
      case "ucjsMouseGestures_linkURL_start":
        this._docURL = message.data.docURL;
        this._docCHARSET = message.data.docCHARSET;
        this._linkURL = message.data.linkURL;
        this._linkTXT = message.data.linkTXT;
        this._imgSRC = message.data.imgSRC;
        this._mediaSRC = message.data.mediaSRC;
        this._selectedTXT = message.data.selectedTXT;
        break;
      case "ucjsMouseGestures_linkURLs_stop":
        Services.console.logStringMessage("message from framescript: " + message.data.linkURLs);
        this._linkdocURLs = message.data.linkdocURLs.split(" ");
        this._linkURLs = message.data.linkURLs.split(" ");
        this._selLinkdocURLs = message.data.selLinkdocURLs.split(" ");
        this._selLinkURLs = message.data.selLinkURLs.split(" ");
        break;
      case "ucjsMouseGestures_linkURL_dragstart":
        if (this.enableRockerGestures)
          this._isMouseDownL = false;
        break;
    }
    return {};
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "mousedown": 
        if (event.button == 2) {
          (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mousemove", this, false);
          this._isMouseDownR = true;
          this._suppressContext = false;
          this._startGesture(event);
          if (this.enableRockerGestures && this._isMouseDownL) {
            this._isMouseDownR = false;
            this._suppressContext = true;
            this._directionChain = "L>R";
            this._stopGesture(event);
          }
        } else if (this.enableRockerGestures && event.button == 0) {
          this._isMouseDownL = true;
          if (this._isMouseDownR) {
            this._isMouseDownL = false;
            this._suppressContext = true;
            this._directionChain = "L<R";
            this._stopGesture(event);
          }
        }
        break;
      case "mousemove": 
        if (this._isMouseDownR) {
          this._progressGesture(event);
        }
        break;
      case "mouseup": 
        gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsMouseGestures_mouseup");
        (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mousemove", this, false);
        if ((this._isMouseDownR && event.button == 2) ||
            (this._isMouseDownR && this._isMac && event.button == 0 && event.ctrlKey)) {
          this._isMouseDownR = false;
          if (this._directionChain)
            this._suppressContext = true;
          this._stopGesture(event);
          if (this._shouldFireContext) {
            this._shouldFireContext = false;
            this._displayContextMenu(event);
          }
        } else if (this.enableRockerGestures && event.button == 0 && this._isMouseDownL) {
          this._isMouseDownL = false;
        }
        break;
      case "contextmenu": 
        if (this._suppressContext || this._isMouseDownR) {
          this._suppressContext = false;
          event.preventDefault();
          event.stopPropagation();
          if (this._isMouseDownR) {
            this._shouldFireContext = true;
          }
        }
        break;
      case "wheel": 
        if (this.enableWheelGestures && this._isMouseDownR) {
          //Cancel scrolling
          event.preventDefault();
          event.stopPropagation();
          this._suppressContext = true;
          this._directionChain = "W" + (event.deltaY > 0 ? "+" : "-");
          this._stopGesture(event);
        }
        break;
    }
  },

  _displayContextMenu: function(event) {
    var evt = event.originalTarget.ownerDocument.createEvent("MouseEvents");
    evt.initMouseEvent(
      "contextmenu", true, true, event.originalTarget.defaultView, 0,
      event.screenX, event.screenY, event.clientX, event.clientY,
      false, false, false, false, 2, null
    );
    event.originalTarget.dispatchEvent(evt);
  },

  _startGesture: function(event) {
    this._lastX = event.screenX;
    this._lastY = event.screenY;
    this._directionChain = "";
    this._linkdocURLs = [];
    this._linkURLs = [];
    this._selLinkdocURLs = [];
    this._selLinkURLs = [];
  },

  _progressGesture: function(event) {
    var x = event.screenX;
    var y = event.screenY;
    var distanceX = Math.abs(x - this._lastX);
    var distanceY = Math.abs(y - this._lastY);
    // minimal movement where the gesture is recognized
    const tolerance = 10;
    if (distanceX < tolerance && distanceY < tolerance)
      return;
    // determine current direction
    var direction;
    if (distanceX > distanceY)
      direction = x < this._lastX ? "L" : "R";
    else
      direction = y < this._lastY ? "U" : "D";
    // compare to last direction
    var lastDirection = this._directionChain.charAt(this._directionChain.length - 1);
    if (direction != lastDirection) {
      this._directionChain += direction;
      let commandName = "";
      for (let command of this.commands) {
        if (command[0].substring(0, 1) == "*") {
          let cmd = command[0].substring(1);
          if (cmd == this._directionChain.substring(this._directionChain.length - cmd.length)) {
            commandName = command[1];
            break;
          }
        }
      }
      if (!commandName)
        for (let command of this.commands) {
          if (!!command[0] && command[0] == this._directionChain){
            commandName = command[1];
            break;
          }
        }
      this.statusinfo = "Gesture: " + this._directionChain + " " + commandName;
    }
/*
    // ホバーしたリンクのURLを記憶
    var linkURL = this._getLinkURL(event.target);
    if (linkURL && this._linkURLs.indexOf(linkURL) == -1)
      this._linkURLs.push(linkURL);
*/
    // save current position
    this._lastX = x;
    this._lastY = y;
  },
/*
  _getLinkURL: function(aNode)
  {
    while (aNode) {
      if ((aNode instanceof HTMLAnchorElement || aNode instanceof HTMLAreaElement) && aNode.href)
        return aNode.href;
      aNode = aNode.parentNode;
    }
    return null;
  },
*/
  _stopGesture: function(event) {
    gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsMouseGestures_linkURLs_request");
    try {
      if (this._directionChain)
        this._performAction(event);
      this.statusinfo = "";
    }
    catch(ex) {
      this.statusinfo = ex;
    }
/*
    this._directionChain = "";
    this._linkURLs = null;
*/
  },

  _performAction: function(event) {
    Services.console.logStringMessage(this._directionChain);
    // Any Gesture Sequence
    for (let command of this.commands) {
      if (command[0].substring(0, 1) == "*") {
        let cmd = command[0].substring(1);
        if (cmd == this._directionChain.substring(this._directionChain.length - cmd.length)) {
          command[2]();
          this._directionChain = "";
          return;
        }
      }
    }
    // These are the mouse gesture mappings.
    for (let command of this.commands) {
      if (command[0] == this._directionChain) {
        command[2]();
        this._directionChain = "";
        return;
      }
    }
    // Unknown Gesture
    throw "Unknown Gesture: " + this._directionChain;

    this._directionChain = "";
  }

};

// エントリポイント
ucjsMouseGestures.init();






let ucjsMouseGestures_framescript = {
  init: function() {


    let framescript = {
      _linkURLs: [],
      _linkElts: [],

      init: function(isMac) {
        this._isMac = isMac;
        addMessageListener("ucjsMouseGestures_mouseup", this);
        addMessageListener("ucjsMouseGestures_linkURLs_request", this);
        addEventListener("mousedown", this, false);
      },

      receiveMessage: function(message) {
        Services.console.logStringMessage(message.name);
        switch(message.name) {
          case "ucjsMouseGestures_mouseup":
            removeEventListener("mousemove", this, false);
            this.clearStyle();
            break;
          case "ucjsMouseGestures_linkURLs_request":
            this.clearStyle();
            let [selLinkURLs, selLinkdocURLs] = this.gatherLinkURLsInSelection();
            let json = {
              linkdocURLs: this._linkdocURLs.join(" "),
              linkURLs: this._linkURLs.join(" "),
              selLinkdocURLs: selLinkdocURLs.join(" "),
              selLinkURLs: selLinkURLs.join(" ")
            };
            sendSyncMessage("ucjsMouseGestures_linkURLs_stop",
              json
            );
            break;
        }
        return {};
      },

      handleEvent: function(event) {
        Services.console.logStringMessage(event.type);
        switch(event.type) {
          case "mousedown":
            if (event.button == 2) {
              addEventListener("mousemove", this, false);
            }
            addEventListener("dragstart", this, true);
            this._linkdocURLs = [];
            this._linkURLs = [];
            this._linkElts = [];
            this._selLinkdocURLs = [];
            this._selLinkURLs = [];

            let json = {
              docURL: event.target.ownerDocument.location.href,
              docCHARSET: event.target.ownerDocument.charset,
              linkURL: this._getLinkURL(event.target),
              linkTXT: this._getLinkTEXT(this.link),
              imgSRC: this._getImgSRC(event.target),
              mediaSRC: this._getMediaSRC(event.target),
              selectedTXT: content.getSelection().toString()
            };
            sendSyncMessage("ucjsMouseGestures_linkURL_start",
              json
            );
            break;
          case "mousemove":
                // ホバーしたリンクのURLを記憶
            let linkURL = this._getLinkURL(event.target);
            if (linkURL && this._linkURLs.indexOf(linkURL) == -1) {
              this._linkdocURLs.push(event.target.ownerDocument.location.href);
              this._linkURLs.push(linkURL);
              this._linkElts.push(event.target);
              event.target.style.outline = "1px dashed darkorange";
            }
            break;
          case "dragstart":
            sendSyncMessage("ucjsMouseGestures_linkURL_dragstart",{});
            removeEventListener("mousemove", this, false);
            removeEventListener("dragstart", this, true);
            break;
        }
      },

      _getLinkURL: function(aNode) {
        this.link = null;
        while (aNode) {
          if ((aNode instanceof content.HTMLAnchorElement || aNode instanceof content.HTMLAreaElement) && aNode.href) {
            this.link = aNode;
            return aNode.href;
          }
          try {
            aNode = aNode.parentNode;
          }catch(e){
            return null;
          }
        }
        return null;
      },

      _getImgSRC: function(aNode) {
        while (aNode) {
          if (aNode instanceof content.HTMLImageElement && aNode.src) {
            return aNode.src;
          }
          aNode = aNode.parentNode;
        }
        return null;
      },

      _getMediaSRC: function(aNode) {
        while (aNode) {
          if (aNode instanceof content.HTMLMediaElement && aNode.src) {
            return aNode.src;
          }
          aNode = aNode.parentNode;
        }
        return null;
      },

      _getLinkTEXT: function(aNode) {
        if (!aNode)
          return "";
        let text = this._gatherTextUnder(aNode);
        if (!text || !text.match(/\S/)) {
          text = this.context.link.getAttribute("title");
          if (!text || !text.match(/\S/)) {
            text = this.context.link.getAttribute("alt");
            if (!text || !text.match(/\S/)) {
              text = this._getLinkURL(aNode);
            }
          }
        }
        return text;
      },
      
      _gatherTextUnder: function(root) {
        let text = "";
        let node = root.firstChild;
        let depth = 1;
        while (node && depth > 0) {
          // See if this node is text.
          if (node.nodeType == node.TEXT_NODE) {
            // Add this text to our collection.
            text += " " + node.data;
          } else if (node instanceof content.HTMLImageElement) {
            // If it has an "alt" attribute, add that.
            let altText = node.getAttribute( "alt" );
            if ( altText && altText != "" ) {
              text += " " + altText;
            }
          }
          // Find next node to test.
          // First, see if this node has children.
          if (node.hasChildNodes()) {
            // Go to first child.
            node = node.firstChild;
            depth++;
          } else {
            // No children, try next sibling (or parent next sibling).
            while (depth > 0 && !node.nextSibling) {
              node = node.parentNode;
              depth--;
            }
            if (node.nextSibling) {
              node = node.nextSibling;
            }
          }
        }

        // Strip leading and tailing whitespace.
        text = text.trim();
        // Compress remaining whitespace.
        text = text.replace(/\s+/g, " ");
        return text;
      },

      clearStyle: function() {
        this._linkElts.forEach((aElt) => {
          aElt.style.outline = "";
        });
      },

      gatherLinkURLsInSelection: function() {
        var win = content;
        var sel = win.getSelection();
        if (!sel || sel.isCollapsed)
          return [[], []];
        var doc = win.document;
        var linkdocURLs = [];
        var linkURLs = [];
        for (var i = 0; i < sel.rangeCount; i++) {
          var range = sel.getRangeAt(i);
          var fragment = range.cloneContents();
          var treeWalker = fragment.ownerDocument.createTreeWalker(fragment,
                           content.NodeFilter.SHOW_ELEMENT, null, true);
          while (treeWalker.nextNode()) {
            var node = treeWalker.currentNode;
            if ((node instanceof content.HTMLAnchorElement ||
                 node instanceof content.HTMLAreaElement) && node.href) {
              try {
                linkdocURLs.push(fragment.ownerDocument.location.href);
                linkURLs.push(node.href);
              }
              catch(ex) {
              }
            }
          }
        }
        return [linkURLs, linkdocURLs]
      }

    }; // end framescript

    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource() + ".init(" + navigator.platform.indexOf("Mac") + ");")
      , true);
  }
}
ucjsMouseGestures_framescript.init();














let ucjsMouseGestures_helper = {

  // Web search selected text with search engins popup
  webSearchPopup: function(aText, screenX, screenY) {
    Services.search.init(rv => {
      if (Components.isSuccessCode(rv)) {
        this._webSearchPopupBuild(aText, screenX, screenY);
      }
    });
  },
  _webSearchPopupBuild: function(aText, screenX, screenY) {
    this.text = aText;
    let that = ucjsMouseGestures;

    if (typeof screenX == "undefined")
      screenX = that._lastX;
    if (typeof screenY == "undefined")
      screenY = that._lastY;
    let searchSvc = Services.search;
		let engines = searchSvc.getVisibleEngines({});
		if (engines.length < 1)
			throw "No search engines installed.";

    if(document.getElementById("ucjsMouseGestures_popup")) {
      document.getElementById("mainPopupSet").
               removeChild(document.getElementById("ucjsMouseGestures_popup"));
    }
    let popup = document.createElement("menupopup");
    document.getElementById("mainPopupSet").appendChild(popup);
    popup.setAttribute("id", "ucjsMouseGestures_popup");
    popup.setAttribute("oncommand", "ucjsMouseGestures_helper._loadSearch(event);");
    popup.setAttribute("onclick", "checkForMiddleClick(this, event);");

		for (let i = engines.length - 1; i >= 0; --i) {
			let menuitem = document.createElement("menuitem");
			menuitem.setAttribute("label", engines[i].name);
			menuitem.setAttribute("class", "menuitem-iconic searchbar-engine-menuitem menuitem-with-favicon");
			if (engines[i].iconURI)
				menuitem.setAttribute("src", engines[i].iconURI.spec);
			popup.insertBefore(menuitem, popup.firstChild);
			menuitem.engine = engines[i];
		}

		let ratio = 1;
		let os = Cc["@mozilla.org/system-info;1"].getService(Ci.nsIPropertyBag2).getProperty("name");
		if (os == "Darwin") {
			ratio = popup.ownerDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
		            getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
		}
		popup.openPopupAtScreen(screenX * ratio, screenY * ratio, false);
  },
  _loadSearch: function(event) {
		let engine = event.target.engine;
		if (!engine)
			return;
		let submission = engine.getSubmission(this.text, null);
		if (!submission)
			return;

		gBrowser.loadOneTab(submission.uri.spec, {
			postData: submission.postData,
			relatedToCurrent: true,
			inBackground: (event.button == 1 || event.ctrlKey) ? true: false,
      triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
		});
  },

  // 再起動
  restart: function() {
    let cancelQuit = Cc["@mozilla.org/supports-PRBool;1"].
                     createInstance(Ci.nsISupportsPRBool);
    Services.obs.notifyObservers(cancelQuit, "quit-application-requested", "restart");
    if (cancelQuit.data)
      return;
    let XRE = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
    if (typeof XRE.invalidateCachesOnRestart == "function")
      XRE.invalidateCachesOnRestart();
    let appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].
                     getService(Ci.nsIAppStartup);
    appStartup.quit(Ci.nsIAppStartup.eAttemptQuit |  Ci.nsIAppStartup.eRestart);
  },

  // ブラウザコンソールを開く
  openBrowserConsole: function() {
    document.getElementById("menu_browserConsole").doCommand();
  },

  // ホバーしたリンクをすべて保存
  saveHoverLinks: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      this.saveLinks(that._linkURLs, that._linkdocURLs)
		}, 500);
  },
  
  // 選択範囲のリンクをすべて保存
  saveHoverLinks: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      this.saveLinks(that._selLinkURLs, that._selLinkdocURLs)
		}, 500);
  },

  // リンクをすべて保存
  saveLinks: function(linkURLs, linkdocURLs) {
    let delay = 0;
    let refURI = null;
    for (let i = 0; i < linkURLs.length; i++) {
      let docURL = linkdocURLs[i];
      try {
        refURI =  makeURI(docURL);
      } catch(e) {
      }
      let linkURL = linkURLs[i];
      if (!linkURL)
        continue;
      setTimeout(() => {
        try {
          //saveURL(aURL, aFileName, aFilePickerTitleKey, aShouldBypassCache,
          //        aSkipPrompt, aReferrer, aSourceDocument,
          //        aIsContentWindowPrivate,
          //        aPrincipal)
          saveURL(linkURL, null, null, false,
                  true, refURI, null,
                  PrivateBrowsingUtils.isWindowPrivate(window),
                  Services.scriptSecurityManager.createNullPrincipal({}));
        } catch(ex) {
        }
      }, delay);
      delay += 1000;
    }
  },


  // textをクリップボードにコピー
  copyText: function(text) {
    let clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
    clipboard.copyString(text);
  },

  // ホバーしたリンクをすべてクリップボードにコピー
  copyHoverLinks: function() {
    let that = ucjsMouseGestures;
    let newLine = navigator.platform.indexOf("Win") ? "\r\n" : "\n";
    setTimeout(() => {
  		let urls = that._linkURLs.join(newLine);
  		if (that._linkURLs.length > 1)
  			urls += newLine;
  		let clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
  		clipboard.copyString(urls);
		}, 500);
  },

  // 選択範囲のリンクをすべてクリップボードにコピー
  copySelectedLinks: function() {
    let that = ucjsMouseGestures;
    let newLine = navigator.platform.indexOf("Win") ? "\r\n" : "\n";
    setTimeout(() => {
  		let urls = that._selLinkURLs.join(newLine);
  		if (that._selLinkURLs.length > 1)
  			urls += newLine;
  		let clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
  		clipboard.copyString(urls);
		}, 500);
  },

  // ひとつ上の階層へ移動
	goUpperLevel: function() {
		let uri = gBrowser.currentURI;
		if (uri.schemeIs("about")) {
			loadURI("about:about", null, null, false, null,
			        null, null, false,
			        Services.scriptSecurityManager.getSystemPrincipal(), false);
			return;
		}
		let path = uri.spec.slice(uri.prePath.length)
		if (path == "/") {
			if (/:\/\/[^\.]+\.([^\.]+)\./.test(uri.prePath))
				loadURI(RegExp.leftContext + "://" + RegExp.$1 + "." + RegExp.rightContext + "/",
				        null, null, false, null,
			          null, null, false,
			          Services.scriptSecurityManager.createNullPrincipal({}), false);
			return;
		}
		let pathList = path.split("/");
		if (!pathList.pop())
			pathList.pop();
		loadURI(uri.prePath + pathList.join("/") + "/",
		        null, null, false, null,
	          null, null, false,
	          Services.scriptSecurityManager.createNullPrincipal({}), false);
	},

  // 数値を増減して移動
	goNumericURL: function(aIncrement) {
		let url = gBrowser.currentURI.spec;
		if (!url.match(/(\d+)(\D*)$/))
			throw "No numeric value in URL";
		let num = RegExp.$1;
		let digit = (num.charAt(0) == "0") ? num.length : null;
		num = parseInt(num, 10) + aIncrement;
		if (num < 0)
			throw "Cannot decrement number in URL anymore";
		num = num.toString();
		digit = digit - num.length;
		for (let i = 0; i < digit; i++)
			num = "0" + num;
		loadURI(RegExp.leftContext + num + RegExp.$2,
		        null, null, false, null,
	          null, null, false,
	          Services.scriptSecurityManager.createNullPrincipal({}), false);
	},

  // 選択範囲のテキストリンクをすべてタブに開く(選択範囲にリンク文字が無い場合は規定の検索エンジンで検索)
	openURLsInSelection: function() {
    let that = ucjsMouseGestures;
		let sel = that._selectedTXT;
		if (!sel)
			throw "No selection";
		let URLs = [];
		sel.split("\n").forEach((str) => {
			str = str.match(/([\w\+\-\=\$;:\?\.%,!#~\*\/@&]{8,})/);
			if (!str || str[1].indexOf(".") < 0)
				return;
			if (str[1].split("/").length < 3 && str[1].split(".").length < 3)
				return;
			str = str[1];
			if (str.indexOf("ttp://") == 0 || str.indexOf("ttps://") == 0)
				str = "h" + str;
			URLs.push(str);
		});
		if (URLs.length > 0)
			this.openURLs(URLs);
		else
      BrowserSearch.loadSearchFromContext(sel,
                Services.scriptSecurityManager.createNullPrincipal({}));
	},

  // ホバーしたリンクをすべてタブで開く
  openHoverLinksInTabs: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      ucjsMouseGestures_helper.openURLsInTabs(that._linkURLs, that._linkdocURLs);
    }, 500);
  },

  // 選択範囲のリンクをすべてタブに開く
  openSelectedLinksInTabs: function() {
    let that = ucjsMouseGestures;
    setTimeout(() => {
      ucjsMouseGestures_helper.openURLsInTabs(that._selLinkURLs, that._selLinkdocURLs);
    }, 500);
  },

  // リンクをすべてタブに開く
  openURLsInTabs: function(linkURLs, linkdocURLs) {
      for (let i = 0; i < linkURLs.length; i++) {
        let docURL = linkdocURLs[i];
        let linkURL = linkURLs[i];
        let refURI = null
        if (!linkURL)
          continue;
        try {
          refURI = makeURI(docURL);
        } catch(e) {
        }
        try {
          gBrowser.loadOneTab(
            linkURL, {
            relatedToCurrent: true,
            inBackground: true,
            referrerURI: refURI,
            triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
          });

        } catch(ex) {
        }
      }
  },

  // リンクをタブに開く
	openURLs: function(aURLs, aReferer, aCharset) {
		for (let aURL of aURLs) {
			gBrowser.loadOneTab(aURL, {
				referrerURI: aReferer, charset: aCharset, 
				inBackground: true, relatedToCurrent: true,
				triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
			});
		}
	},

  // 左側または右側のタブをすべて閉じる
	closeMultipleTabs: function(aLeftRight) {
		let tabs = gBrowser.visibleTabs.filter((tab) => !tab.pinned);
		let pos = tabs.indexOf(gBrowser.selectedTab);
		let start = aLeftRight == "left" ? 0   : pos + 1;
		let stop  = aLeftRight == "left" ? pos : tabs.length;
		tabs = tabs.slice(start, stop);
		let shouldPrompt = Services.prefs.getBoolPref("browser.tabs.warnOnCloseOtherTabs");
		if (shouldPrompt && tabs.length > 1) {
			let ps = Services.prompt;
			let bundle = gBrowser.mStringBundle;
			let message = PluralForm.get(tabs.length, bundle.getString("tabs.closeWarningMultiple")).
			              replace("#1", tabs.length);
			window.focus();
			let ret = ps.confirmEx(
				window, bundle.getString("tabs.closeWarningTitle"), message, 
				ps.BUTTON_TITLE_IS_STRING * ps.BUTTON_POS_0 + ps.BUTTON_TITLE_CANCEL * ps.BUTTON_POS_1, 
				bundle.getString("tabs.closeButtonMultiple"), 
				null, null, null, {}
			);
			if (ret != 0)
				return;
		}
		tabs.reverse().forEach((tab) => gBrowser.removeTab(tab));
	},

}
