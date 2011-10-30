// ==UserScript==
// @name           スクロールバー上の右クリックメニューを追加しTop,hereとBottomにスクロール.uc.xul
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    スクロールバー上の右クリックメニューを追加しTop,hereとBottomにスクロール
// @include        main
// @include        chrome://browser/content/web-panels.xul
// @compatibility  Firefox 3.0 3.5 3.6 3.7a1pre
// @author         Alice0775
// @version        2011/10/30 20:00 Bug 684821 - Remove nsIDOMNSHTMLElement
// @version        2009/06/25 00:30 Minefield3.6a1preに対応させた Bug 486990 -  Context Menu can be disabled by stopping propagation (cancelEvent=true or stopPropagation)
// @version        2009/06/14 00:30 xmlに対応させた
// @version        2009/05/17 23:30 Minefield3.6a1preに対応させた
// @version        2009/05/17 20:30 水平スクロールバー上でホイール回転で横スクロール
// @Note           need Sub-Script/Overlay Loader v3.0.20mod
// ==/UserScript==
// @version        2009/02/05 22:30 DIV等にも対応
// @version        2008/06/23 00:30 テキストズームだった時の処理
// @version        2008/06/22 24:00 removeEventListener修正
// @version        2008/06/22 15:00 水平スクロールバーおよび here 追加
// @version        2007/06/10 12:44 垂直スクロールバーにtop bottom 追加
var scrollContextMenu = {
  //--config--
  MOUSEWHEEL: true,
  //--config--

  scrlW :20,
  scrollView: [],
  e:null,

  init: function(){
    if (!document.getElementById("web-panels-browser")) {
      var overlay =
        <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                 xmlns:html="http://www.w3.org/1999/xhtml">
          <popupset id="mainPopupSet">
            <menupopup  id="scrollContextMenuV">
                  <menuitem
                    label="Top"
                    onclick="scrollContextMenu.scrollTop();" />
                  <menuitem
                    label="Here"
                    onclick="scrollContextMenu.scrollHereV(event);" />
                  <menuitem
                    label="Bottom"
                    onclick="scrollContextMenu.scrollBottom();" />
            </menupopup>
            <menupopup  id="scrollContextMenuH">
                  <menuitem
                    label="Left"
                    onclick="scrollContextMenu.scrollLeft();" />
                  <menuitem
                    label="Here"
                    onclick="scrollContextMenu.scrollHereH(event);" />
                  <menuitem
                    label="Right"
                    onclick="scrollContextMenu.scrollRight();" />
            </menupopup>
          </popupset>
        </overlay>;
      overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay.toXMLString());
      window.userChrome_js.loadOverlay(overlay, null);
      gBrowser.mPanelContainer.addEventListener("mouseup", this, true);
      if (this.MOUSEWHEEL)
        gBrowser.mPanelContainer.addEventListener("DOMMouseScroll", this, true);
    }
    if (document.getElementById("web-panels-browser")) {
      if (this.MOUSEWHEEL)
        document.getElementById("web-panels-browser").addEventListener("DOMMouseScroll", this, true);
    }
    window.addEventListener("unload", this, false);
  },

  uninit: function(){
    window.removeEventListener("unload", this, false);
    if (!document.getElementById("web-panels-browser")) {
        gBrowser.mPanelContainer.removeEventListener("mouseup", this, true);
      if (this.MOUSEWHEEL)
        gBrowser.mPanelContainer.removeEventListener("DOMMouseScroll", this, true);
    }
    if (document.getElementById("web-panels-browser")) {
      if (this.MOUSEWHEEL)
        document.getElementById("web-panels-browser").removeEventListener("DOMMouseScroll", this, true);
    }
  },

  get zoom(){
    if (!ZoomManager.useFullZoom)
      return 1;
    else
      return ZoomManager.zoom;
  },

  handleEvent: function (aEvent){
    switch (aEvent.type) {
      case "mouseup":
        this.mouseup(aEvent);
        break;
      case "DOMMouseScroll":
        this.onMouseWheel(aEvent);
        break;
      case "unload":
        this.uninit();
        break;
    }
  },

  mouseup: function(event){
    //window.userChrome_js.debug(event.originalTarget.localName);
    if(event.button==2 && /^(slider|thumb|scrollbarbutton)$/.test(event.originalTarget.localName)) {
      this.e = event;
      this.scrollView = this.getScrollView(event);
      if (this.whichBar(event, 0)=="V"){
        document.getElementById("scrollContextMenuV")
        .showPopup(gBrowser.mPanelContainer, event.screenX, event.screenY,
                   'context', 'bottomleft', 'topleft');
      } else if (this.whichBar(event, 1)=="H"){
        document.getElementById("scrollContextMenuH")
        .showPopup(gBrowser.mPanelContainer, event.screenX, event.screenY,
                   'context', 'bottomleft', 'topleft');
      }
    }
  },

  onMouseWheel: function(event){
    //window.userChrome_js.debug(event.originalTarget.localName);
    if(/^(slider|thumb|scrollbarbutton)$/.test(event.originalTarget.localName)) {
      this.e = event;
      this.scrollView = this.getScrollView(event);
      if (this.whichBar(event, 0)=="V"){
        //this._scrollBy(this.scrollView[0], 0, event.detail*20);
      } else if (this.whichBar(event, 1)=="H"){
        event.preventDefault();
        this._scrollBy(this.scrollView[1], event.detail*20, 0);
      }
    }
  },

  whichBar: function(event, k){
    if (!!this.scrollView[k]){
      if (!("scrollTo" in this.scrollView[k])){
        var x = event.screenX;
        var y = event.screenY;
        try {
          var box = this.scrollView[k].ownerDocument.getBoxObjectFor(this.scrollView[k]);
        } catch(e) {
          var box = window['piro.sakura.ne.jp'].boxObject.getBoxObjectFor(this.scrollView[k]);
        }
        var x1 = box.screenX + box.width;
        var y1 = box.screenY + box.height;
      } else {
        var x = event.clientX;
        var y = event.clientY;
        var x1 = this.scrollView[k].innerWidth;
        var y1 = this.scrollView[k].innerHeight;
      }
      if (x > x1 - this.scrlW / this.zoom && y < y1 - this.scrlW / this.zoom){
        return "V";
      }else if (x < x1 - this.scrlW / this.zoom && y > y1 - this.scrlW / this.zoom){
        return "H";
      }
    }
    return null;
  },

  getScrollView: function (event) {
    var NS, EW, NSEW;
    NS = EW = NSEW = null;
    var _scrollingView = null;

    if (event.originalTarget.ownerDocument.contentType == "application/xml") {
      _scrollingView = event.originalTarget.ownerDocument.defaultView;
      if (_scrollingView.scrollMaxX > 0) {
        if (_scrollingView.scrollMaxY > 0) {
          NSEW = _scrollingView;
          NS = _scrollingView;
        }
        EW = _scrollingView;
      }
      else if (_scrollingView.scrollMaxY > 0) {
        NS = _scrollingView;
      }
      else {
        return [NS, EW, NSEW];
      }
    } else {
      for (_scrollingView = event.originalTarget; _scrollingView; _scrollingView = _scrollingView.parentNode) {
        if (_scrollingView instanceof HTMLElement) {
          if (_scrollingView.localName.toLowerCase() == "select") {
            _scrollingView.parentNode.focus();
            return [NS, EW, NSEW];
          }
          try {
            var doc = _scrollingView.ownerDocument;
            var overflowx = doc.defaultView.getComputedStyle(_scrollingView, "").getPropertyValue("overflow-x");
            var overflowy = doc.defaultView.getComputedStyle(_scrollingView, "").getPropertyValue("overflow-y");
          } catch (ex) {
            var overflowx = "";
            var overflowy = "";
          }
          var horz = _scrollingView.clientWidth !== 0 &&
                     _scrollingView.clientWidth < _scrollingView.scrollWidth;
          var vert = _scrollingView.clientHeight !== 0 &&
                     _scrollingView.clientHeight < _scrollingView.scrollHeight;
          if (horz &&
              overflowx != "hidden" &&
              overflowx != "visible" &&
              vert && overflowy != "hidden" && overflowy != "visible") {
            NSEW = !NSEW ? _scrollingView : NSEW;
          }
          if (horz && overflowx != "hidden" && overflowx != "visible") {
            EW = !EW ? _scrollingView : EW;
          }
          if (vert && overflowy != "hidden" && overflowy != "visible") {
            NS = !NS ? _scrollingView : NS;
          }
          if (_scrollingView.localName.toUpperCase() == "HTML" ||
              _scrollingView.localName.toUpperCase() == "BODY") {
            _scrollingView = _scrollingView.ownerDocument.defaultView;
            if (_scrollingView.scrollMaxX > 0 &&
                _scrollingView.scrollMaxY > 0) {
              NSEW = !NSEW ? _scrollingView : NSEW;
            }
            if (_scrollingView.scrollMaxX > 0) {
              EW = !EW ? _scrollingView : EW;
            }
            if (_scrollingView.scrollMaxY > 0) {
              NS = !NS ? _scrollingView : NS;
              break;
            }
          }
        }
      } //for
    }
    return [NS, EW, NSEW];
  },

  _getWindow: function(event){
    return event.target.ownerDocument.defaultView;
  },

  scrollTop: function(){
    var elm = this.scrollView[0];
    if (!("scrollTo" in elm)){
      this._scrollTo(elm, elm.scrollLeft, 0);
    } else {
      this._scrollTo(elm, elm.pageXOffset, 0);
    }
  },

  scrollHereV: function(event){
    var elm = this.scrollView[0];
    if (!("scrollTo" in elm)){
      try {
        var y = this.e.screenY - elm.ownerDocument.getBoxObjectFor(elm).screenY;
      } catch(e) {
        var y = this.e.screenY - window['piro.sakura.ne.jp'].boxObject.getBoxObjectFor(elm).screenY;
      }
      var y1 = elm.clientHeight - this.scrlW / this.zoom;
    } else {
      var y = this.e.clientY;
      var y1 = elm.innerHeight - this.scrlW / this.zoom;
    }
    if (y < this.scrlW / this.zoom)
      y = 0;
    if (y > y1 - this.scrlW / this.zoom)
      y = y1;
    if (!("scrollTo" in elm)){
      var height = elm.scrollHeight;//doc.height;
      var ofsety = (height - y1) * y / y1;
      this._scrollTo(elm, elm.scrollLeft, ofsety);
    } else {
      var height = Math.max(this.e.target.scrollHeight|0, elm.scrollHeight|0);//doc.height;
      try {
        height = Math.max(width|0, elm.document.body.scrollHeight|0);
      } catch(e){ }
      var ofsety = (height - y1) * y / y1;
      this._scrollTo(elm, elm.pageXOffset, ofsety);
    }
  },

  scrollBottom: function(){
    var elm = this.scrollView[0];
    if (!("scrollTo" in elm)){
      this._scrollTo(elm, elm.scrollLeft, elm.scrollHeight);
    } else {
      var height = Math.max(this.e.target.scrollHeight|0, elm.scrollHeight|0);//doc.height;
      this._scrollTo(elm, elm.pageXOffset, height);
    }
  },

  scrollLeft: function(){
    var elm = this.scrollView[1];
    if (!("scrollTo" in elm)){
      this._scrollTo(elm, 0, elm.scrollTop);
    } else {
      this._scrollTo(elm, 0, elm.pageYOffset);
    }
  },

  scrollHereH: function(event){
    var elm = this.scrollView[1];
    if (!("scrollTo" in elm)){
      try {
        var x = this.e.screenX - elm.ownerDocument.getBoxObjectFor(elm).screenX;
      } catch(e) {
        var x = this.e.screenX - window['piro.sakura.ne.jp'].boxObject.getBoxObjectFor(elm).screenX;
      }
      var x1 = elm.clientWidth - this.scrlW / this.zoom;
    } else {
      var x = this.e.clientX;
      var x1 = elm.innerWidth - this.scrlW / this.zoom;
    }
    if (x < this.scrlW / this.zoom)
      x = 0;
    if (x > x1 - this.scrlW / this.zoom)
      x = x1;
    if (!("scrollTo" in elm)){
      var width = elm.scrollWidth;
      var ofsetx = (width - x1) * x / x1;
      this._scrollTo(elm, ofsetx, elm.scrollTop);
    } else {
      var width = Math.max(this.e.target.scrollWidth|0, elm.scrollWidth|0);
      try {
        width = Math.max(width|0, elm.document.body.scrollWidth|0);
      } catch(e){ }
      var ofsetx = (width - x1) * x / x1;
      this._scrollTo(elm, ofsetx, elm.pageYOffset);
    }
  },

  scrollRight: function(){
    var elm = this.scrollView[1];
    if (!("scrollTo" in elm)){
      this._scrollTo(elm, elm.scrollWidth, elm.scrollTop);
    } else {
      var width = Math.max(this.e.target.scrollWidth|0, elm.scrollWidth|0);
      try {
        width = Math.max(width|0, elm.document.body.scrollWidth|0);
      } catch(e){ }
      this._scrollTo(elm, width, elm.pageYOffset);
    }
  },

  _scrollTo: function(elm, x, y){
    if ("scrollTo" in elm) {
      elm.scrollTo(x, y);
    } else {
      elm.scrollLeft = x;
      elm.scrollTop = y;
    }
  },

  _scrollBy: function(elm, x, y){
    if ("scrollBy" in elm) {
      elm.scrollBy(x, y);
    } else {
      elm.scrollLeft += x;
      elm.scrollTop += y;
    }
  }
}
scrollContextMenu.init();






/*
 "getBoxObjectFor()" compatibility library for Firefox 3.6 or later

 Usage:
   // use instead of HTMLDocument.getBoxObjectFor(HTMLElement)
   var boxObject = window['piro.sakura.ne.jp']
                         .boxObject
                         .getBoxObjectFor(HTMLElement);

 lisence: The MIT License, Copyright (c) 2009-2010 SHIMODA "Piro" Hiroshi
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/license.txt
 original:
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/boxObject.js
*/
(function() {
  const currentRevision = 6;

  if (!('piro.sakura.ne.jp' in window)) window['piro.sakura.ne.jp'] = {};

  var loadedRevision = 'boxObject' in window['piro.sakura.ne.jp'] ?
      window['piro.sakura.ne.jp'].boxObject.revision :
      0 ;
  if (loadedRevision && loadedRevision > currentRevision) {
    return;
  }

  var Cc = Components.classes;
  var Ci = Components.interfaces;

  window['piro.sakura.ne.jp'].boxObject = {
    revision : currentRevision,

    getBoxObjectFor : function(aNode, aUnify)
    {
      return ('getBoxObjectFor' in aNode.ownerDocument) ?
          this.getBoxObjectFromBoxObjectFor(aNode, aUnify) :
          this.getBoxObjectFromClientRectFor(aNode, aUnify) ;
    },

    getBoxObjectFromBoxObjectFor : function(aNode, aUnify)
    {
      var boxObject = aNode.ownerDocument.getBoxObjectFor(aNode);
      var box = {
          x       : boxObject.x,
          y       : boxObject.y,
          width   : boxObject.width,
          height  : boxObject.height,
          screenX : boxObject.screenX,
          screenY : boxObject.screenY,
          element : aNode
        };
      if (!aUnify) return box;

      var style = this._getComputedStyle(aNode);
      box.left = box.x - this._getPropertyPixelValue(style, 'border-left-width');
      box.top = box.y - this._getPropertyPixelValue(style, 'border-top-width');
      if (style.getPropertyValue('position') == 'fixed') {
        box.left -= frame.scrollX;
        box.top  -= frame.scrollY;
      }
      box.right  = box.left + box.width;
      box.bottom = box.top + box.height;

      return box;
    },

    getBoxObjectFromClientRectFor : function(aNode, aUnify)
    {
      var box = {
          x       : 0,
          y       : 0,
          width   : 0,
          height  : 0,
          screenX : 0,
          screenY : 0,
          element : aNode
        };
      try {
        var zoom = this.getZoom(aNode.ownerDocument.defaultView);

        var rect = aNode.getBoundingClientRect();
        if (aUnify) {
          box.left   = rect.left;
          box.top    = rect.top;
          box.right  = rect.right;
          box.bottom = rect.bottom;
        }

        var style = this._getComputedStyle(aNode);
        var frame = aNode.ownerDocument.defaultView;

        // "x" and "y" are offset positions of the "padding-box" from the document top-left edge.
        box.x = rect.left + this._getPropertyPixelValue(style, 'border-left-width');
        box.y = rect.top + this._getPropertyPixelValue(style, 'border-top-width');
        if (style.getPropertyValue('position') != 'fixed') {
          box.x += frame.scrollX;
          box.y += frame.scrollY;
        }

        // "width" and "height" are sizes of the "border-box".
        box.width  = rect.right - rect.left;
        box.height = rect.bottom - rect.top;

        box.screenX = rect.left * zoom;
        box.screenY = rect.top * zoom;

        box.screenX += frame.mozInnerScreenX * zoom;
        box.screenY += frame.mozInnerScreenY * zoom;
      }
      catch(e) {
      }

      'x,y,screenX,screenY,width,height,left,top,right,bottom'
        .split(',')
        .forEach(function(aProperty) {
          if (aProperty in box)
            box[aProperty] = Math.round(box[aProperty]);
        });

      return box;
    },

    _getComputedStyle : function(aNode)
    {
      return aNode.ownerDocument.defaultView.getComputedStyle(aNode, null);
    },

    _getPropertyPixelValue : function(aStyle, aProperty)
    {
      return parseInt(aStyle.getPropertyValue(aProperty).replace('px', ''));
    },

    Prefs : Cc['@mozilla.org/preferences-service;1']
      .getService(Ci.nsIPrefBranch)
      .QueryInterface(Ci.nsIPrefBranch2),

    getZoom : function(aFrame)
    {
      try {
        if (!this.Prefs.getBoolPref('browser.zoom.full'))
          return 1;
      }
      catch(e) {
        return 1;
      }
      var markupDocumentViewer = aFrame.top
          .QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIWebNavigation)
          .QueryInterface(Ci.nsIDocShell)
          .contentViewer
          .QueryInterface(Ci.nsIMarkupDocumentViewer);
      return markupDocumentViewer.fullZoom;
    }

  };
})();
