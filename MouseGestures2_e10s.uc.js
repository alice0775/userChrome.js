// ==UserScript==
// @name          Mouse Gestures (with Wheel Gesture and Rocker Gesture)
// @namespace     http://www.xuldev.org/
// @description   Lightweight customizable mouse gestures.
// @include       main
// @author        Gomita, Alice0775 since 2018/09/26
// @compatibility 60
// @version       2018/09/26 20:40 add find command (wip)
// @version       2018/09/26 20:30 fix page scrolled when Wheel Gesture (wip)
// @version       2018/09/26 19:10 fix author; (wip)
// @version       2018/09/26 19:10 fix missing break; (wip)
// @version       2018/09/26 19:00 fix statusinfo (wip)
// @version       2018/09/26 18:30 e10s (wip)
// @original      ver. 1.0.20080201
// @homepage      http://www.xuldev.org/misc/ucjs.php
// ==/UserScript==

var ucjsMouseGestures = {

  // options
  enableWheelGestures: true,  // Wheel Gesturess (Scroll wheel with holding right-click)
  enableRockerGestures: true,  // Rocker Gesturess (Left-click with holding right-click and vice versa)

  _lastX: 0,
  _lastY: 0,
  _directionChain: "",
  _linkdocURLs: [],
  _linkURLs: [],
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
      XULBrowserWindow.statusTextField = val
    }
    return val;
  },

  init: function() {
    this._version = Services.appinfo.version.split(".")[0];
    this._isMac = navigator.platform.indexOf("Mac") == 0;
    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mousedown", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mousemove", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mouseup", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("contextmenu", this, true);
    if (this.enableRockerGestures)
      (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("draggesture", this, true);
    if (this.enableWheelGestures)
      window.addEventListener('wheel', this, true);

     messageManager.addMessageListener("ucjsMouseGestures_linkURL_start", this);
     messageManager.addMessageListener("ucjsMouseGestures_linkURLs_stop", this);
     
     window.addEventListener("unload", this, false);
  },

  uninit: function() {
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mousedown", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mousemove", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mouseup", this, false);
    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("contextmenu", this, true);
    if (this.enableRockerGestures)
      (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("draggesture", this, true);
    if (this.enableWheelGestures)
      window.removeEventListener('wheel', this, true);

     messageManager.removeMessageListener("ucjsMouseGestures_linkURL_start", this);
     messageManager.removeMessageListener("ucjsMouseGestures_linkURLs_stop", this);

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
        break;
    }
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "mousedown": 
        if (event.button == 2) {
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
        if ((this._isMouseDownR && event.button == 2) ||
            (this._isMouseDownR && this._isMac && event.button == 0 && event.ctrlKey)) {
          gBrowser.selectedBrowser.messageManager.sendAsyncMessage("ucjsMouseGestures_mouseup");
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
      case "draggesture": 
        this._isMouseDownL = false;
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
      this.statusinfo = "Gesture: " + this._directionChain;
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
    const dirSeq = "RUL";
    if (this._directionChain.substr(dirSeq.length * -1, dirSeq.length) == dirSeq) {
      setTimeout(() => {
        Services.console.logStringMessage("Any Gesture Sequence " + this._linkURLs);
        for (let i = 0; i < this._linkURLs.length; i++) {
          let docURL = this._linkdocURLs[i];
          let linkURL = this._linkURLs[i];
          if (!linkURL)
            continue;
          try {
            //urlSecurityCheck(linkURL, docURL, Ci.nsIScriptSecurityManager.DISALLOW_SCRIPT);
            gBrowser.loadOneTab(
              linkURL, {
              relatedToCurrent: true,
              inBackground: true,
              referrerURI: makeURI(docURL),
              triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
            });

          } catch(ex) {
          }
        }
      }, 250)
      return;
    }
    // These are the mouse gesture mappings. Customize this as you like.
    switch (this._directionChain) {
      // Back
      case "L":
        document.getElementById("Browser:Back").doCommand();
        break;
      // Forward
      case "R":
        document.getElementById("Browser:Forward").doCommand();
        break;
      // Reload
      case "UD":
        document.getElementById("Browser:Reload").doCommand();
        break;
      // Reload (Skip Cache)
      case "UDU":
        document.getElementById("Browser:ReloadSkipCache").doCommand();
        break;
/*
      // Minimize Window
      case "RUD":
        window.minimize();
        break;
      // Maximize Window or Restore Window Size
      case "RDU":
        window.windowState == 1 ? window.restore() : window.maximize();
        break;
      // Open New Tab
      case "LR":
        document.getElementById("cmd_newNavigatorTab").doCommand();
        break;
*/
      // Close Tab
      case "LD":
        document.getElementById("cmd_close").doCommand();
        break;
      // Undo Close Tab
      case "DRU":
        document.getElementById("History:UndoCloseTab").doCommand();
        break;
      // ひとつ上の階層へ移動
      case "RUL": var uri = gBrowser.currentURI;
        if (uri.pathQueryRef == "/")
          return;
        var pathList = uri.pathQueryRef.split("/");
        if (!pathList.pop())
          pathList.pop();
        loadURI(uri.prePath + pathList.join("/") + "/");
        break;
      // Previous Tab
      case "UL":
        gBrowser.tabContainer.advanceSelectedTab(-1, true);
        break;
      // Next Tab
      case "UR":
        gBrowser.tabContainer.advanceSelectedTab(+1, true);
        break;
      // Scroll Top
      case "RU":
        goDoCommand("cmd_scrollTop");
        break;
      // Scroll Bottom
      case "RD":
        goDoCommand("cmd_scrollBottom");
        break;
      // Page Up
      case "U":
        goDoCommand("cmd_scrollPageUp");
        break;
      // Page Down
      case "D":
        goDoCommand("cmd_scrollPageDown");
        break;
      // Zoom In
      case "W-": 
        document.getElementById("cmd_fullZoomReduce").doCommand();
        break;
      // Zoom Out
      case "W+": 
        document.getElementById("cmd_fullZoomEnlarge").doCommand();
        break;
      // Zoom Out
      case "L<R":
        document.getElementById("cmd_fullZoomReset").doCommand();
        break;
      // Full Screen
      case "LDRU":
       document.getElementById("View:FullScreen").doCommand();
       break;
      // Find selection in page
      case "LU":
        if (gFindBar) {
          gFindBar.hidden? gFindBar.onFindCommand(): gFindBar.close();
        } else {
          gLazyFindCommand("onFindCommand");
        }
        break;
      // Send selected text to Search Bar
      case "DR":
        if (BrowserSearch.searchBar)
          BrowserSearch.searchBar.value = this._selectedTXT;
        break;
      // Find selected text in page
      case "DL":
        if (this._version <= "60") {
          gBrowser.getFindBar();
          gFindBar.onFindCommand();
        } else {
          // 61+
          gBrowser.getFindBar().then(findbar => {findbar.onFindCommand();});
        }
        break;
      // Unknown Gesture
      //case "L>R":
      default:
        throw "Unknown Gesture: " + this._directionChain;
    }
    this._directionChain = "";
  }

};

// エントリポイント
ucjsMouseGestures.init();




let ucjsMouseGestures_framescript = {
  init: function() {


    let framescript = {
      _linkURLs: [],

      init: function() {
        addMessageListener("ucjsMouseGestures_mouseup", this);
        addMessageListener("ucjsMouseGestures_stop", this);
        addEventListener("mousedown", this, false);
        addEventListener("mouseup", this, false);
      },

      receiveMessage: function(message) {
        Services.console.logStringMessage(message.name);
        switch(message.name) {
          case "ucjsMouseGestures_mouseup":
            removeEventListener("mousemove", this, false);
            Services.console.logStringMessage(this._linkURLs);
            let json = {
              linkdocURLs: this._linkdocURLs.join(" "),
              linkURLs: this._linkURLs.join(" ")
            };
            sendSyncMessage("ucjsMouseGestures_linkURLs_stop",
              json
            );
            break;
          case "ucjsMouseGestures_stop":
            removeEventListener("mousemove", this, false);
        }
      },

      handleEvent: function(event) {
        Services.console.logStringMessage(event.type);
        switch(event.type) {
          case "mousedown":
            addEventListener("mousemove", this, false);
            this._linkdocURLs = [];
            this._linkURLs = [];
            let json = {
              docURL: event.target.ownerDocument.location.href,
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
            }
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
      }
    }; // end framescript

    window.messageManager.loadFrameScript(
       'data:application/javascript,'
        + encodeURIComponent(framescript.toSource() + ".init();")
      , true);
  }
}
ucjsMouseGestures_framescript.init();
