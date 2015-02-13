// ==UserScript==
// @name           patchForBug628086_stopSelection.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 628086 - Text in the input box would not scroll if drag was starting on border even if mouse pointer is I-beam pointer. And drag selection don't stop till i click elsewhere
// @include        *
// @compatibility  Firefox
// @author         alice0775
// @version        2015/01/15 nsIDOMXULTextBoxElement
// @version        2014/07/10 fx34 Bug 1036694 - merge nsIMarkupDocumentViewer into nsIContentViewer
// @version        2011/04/28
// ==/UserScript==

var stopSelection = {

  get domWindowUtils() {
    delete this.domWindowUtils;
    return this.domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                 .getInterface(Components.interfaces.nsIDOMWindowUtils);
  },

  win: null,
  init :function(){
    this.win = document.getElementById("appcontent") || window;
    window.addEventListener('unload', this, false);
    this.win.addEventListener('mousedown', this, false);
  },

  uninit :function(){
    window.removeEventListener('unload', this, false);
    this.win.removeEventListener('mousedown', this, false);
  },

  mousedown :function(event){
    if (event.button == 0) {
      var node = event.originalTarget;
      if (node instanceof HTMLInputElement ||
          node instanceof HTMLTextAreaElement ||
          node instanceof Components.interfaces.nsIDOMXULTextBoxElement) {

        var boxObject = window['piro.sakura.ne.jp'].boxObject;

        var style = boxObject._getComputedStyle(node);
        var border_top    = boxObject._getPropertyPixelValue(style, 'border-top-width');
        var border_left   = boxObject._getPropertyPixelValue(style, 'border-left-width');
        var border_bottom = boxObject._getPropertyPixelValue(style, 'border-bottom-width');
        var border_right  = boxObject._getPropertyPixelValue(style, 'border-right-width');
                        
        var box = boxObject.getBoxObjectFor(node);
				var _top    = box.screenY + border_top;
        var _left   = box.screenX + border_left;
				var _bottom = box.screenY + box.height - border_bottom;
        var _right  = box.screenX + box.width - border_right;

        userChrome_js.debug("down input");
        if (event.screenX < _left  || event.screenY < _top ||
            event.screenX > _right || event.screenY > _bottom) {
          event.preventDefault();
          //event.stopPropagation();
        }
      }
    }
  },

  handleEvent: function(event){
    switch (event.type) {
      case "mousedown":
        this.mousedown(event);
        break;
      case "mouseup":
        this.mouseup(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  }
}
stopSelection.init();

/*
 "getBoxObjectFor()" compatibility library for Firefox 3.6 or later

 Usage:
   // use instead of HTMLDocument.getBoxObjectFor(HTMLElement)
   var boxObject = window['piro.sakura.ne.jp']
                         .boxObject
                         .getBoxObjectFor(HTMLElement);

 license: The MIT License, Copyright (c) 2009-2010 SHIMODA "Piro" Hiroshi
   http://github.com/piroor/fxaddonlibs/blob/master/license.txt
 original:
   http://github.com/piroor/fxaddonlibs/blob/master/boxObject.js
   http://github.com/piroor/fxaddonlibs/blob/master/boxObject.test.js
   http://github.com/piroor/fxaddonlibs/blob/master/fixtures/box.html
*/

/* To work as a JS Code Module */
if (typeof window == 'undefined' ||
	(window && typeof window.constructor == 'function')) {
	this.EXPORTED_SYMBOLS = ['boxObject'];

	// If namespace.jsm is available, export symbols to the shared namespace.
	// See: http://github.com/piroor/fxaddonlibs/blob/master/namespace.jsm
	try {
		let ns = {};
		Components.utils.import('resource://my-modules/namespace.jsm', ns);
		/* var */ window = ns.getNamespaceFor('piro.sakura.ne.jp');
	}
	catch(e) {
		window = {};
	}
}

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

		Prefs : Cc['@mozilla.org/preferences;1']
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
			try {
	      var markupDocumentViewer = aFrame.top
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShell)
					.contentViewer
					.QueryInterface(Ci.nsIMarkupDocumentViewer);
      } catch(ee) { //Bug 1036694 - merge nsIMarkupDocumentViewer into nsIContentViewer
         markupDocumentViewer = aFrame.top
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShell)
					.contentViewer;
      }
			return markupDocumentViewer.fullZoom;
		}

	};
})();

if (window != this) { // work as a JS Code Module
	this.boxObject = window['piro.sakura.ne.jp'].boxObject;
}
