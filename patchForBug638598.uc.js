// ==UserScript==
// @name           patchForBug638598.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 638598 Iframe parent window page does not scroll to # anchor by user interaction(click ,enter).
// @include        main
// @compatibility  Firefox 4.0b13pre
// @author         Alice0775
// @version        2011/11/08 06:00 *
// @version        2011/10/03 16:00 same hostのみ
// @version        2011/03/03 13:30
// ==/UserScript==
if (!("bug638598" in window)) {

  window.bug638598 = {
    get ios() {
      delete this.ios;
      return this.ios = Components.classes['@mozilla.org/network/io-service;1']
                        .getService(Components.interfaces.nsIIOService);
    },

    get content() {
      delete this.content;
      return this.content = document.getElementById("appcontent");
    },

    init: function() {
      this.content.addEventListener("click", this, true);
      window.addEventListener("unload", this, false);
    },

    uninit: function() {
      this.content.removeEventListener("click", this, true);
      window.removeEventListener("unload", this, false);
    },

    handleEvent: function(event) {
      switch (event.type) {
        case "click":
          this.click(event);
          break;
        case "unload":
          this.uninit();
          break;
         
      }
    },

    click: function(event) {
      if (event instanceof MouseEvent) {
        if (event.button !=0 ||
            event.altKey || event.ctrlKey || event.shiftKey || event.metaKey)
          return;
      } else {
        if (event.keyCode != KeyEvent.DOM_VK_RETURN ||
            event.altKey || event.ctrlKey || event.shiftKey || event.metaKey)
          return;
      }

      setTimeout(function(self, event) {
        if (event.originalTarget && event.originalTarget.ownerDocument instanceof HTMLDocument) {
          var win = event.originalTarget.ownerDocument.defaultView;
          var wintop= win;
          if (win && win.frameElement) {
            wintop = win.top;
          }

          var linkNode = self.isAnchorElement(event);
          if (!linkNode)
            return;

          if (linkNode.getAttribute("onclick"))
            return;

          if (wintop == win) {
            /*
            /// xxx Bug 662170 - Go to top anchor "#" doesn't work in Firefox 6 and Firefox 7
            {
              var targethref = linkNode.getAttribute("href");
              var baseURI = self.ios.newURI(linkNode.baseURI, null, null);

              var uri = self.ios.newURI(targethref, null, baseURI);
              var hash = uri.spec.match(/#(.*)$/);
              if (!hash || hash.length < 2)
              return;
              if (!hash[1]) {
                win.scrollTo(0, 0);
              }
            }
            */
            return;
          }

          if (win != linkNode.ownerDocument.defaultView)
            return;

          if (win.location.host != wintop.location.host)
            return;

          var targethref = linkNode.getAttribute("href");
          var baseURI = self.ios.newURI(linkNode.baseURI, null, null);

          var uri = self.ios.newURI(targethref, null, baseURI);
          var hash = uri.spec.match(/#(.+)$/);
          if (!hash || hash.length < 2 || !hash[1])
            return;

          var doc = linkNode.ownerDocument;
          var xpath = "//*[@id=" + "'" + hash[1] +"']|//*[@name=" + "'" + hash[1] +"']";
          var elem = self.getElementsByXPath(xpath, doc.body);
          if (elem && elem.length > 0) {
            elem[0].scrollIntoView(true);
          }
        }
      }, 250, this, event);
    },

    isAnchorElement: function(event) {
      var linkNode;
      var target = event.originalTarget;
      while(target) {
        if (target instanceof HTMLAnchorElement ||
            target instanceof HTMLAreaElement ||
            target instanceof HTMLLinkElement) {
          if (target.hasAttribute("href"))
               linkNode = target;
           break;
        }
        target = target.parentNode;
      }
      return linkNode;
    },

    // utilities
    
    getElementsByXPath: function getNodesFromXPath(aXPath, aContextNode) {
      const XULNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
      const XHTMLNS = 'http://www.w3.org/1999/xhtml';
      const XLinkNS = 'http://www.w3.org/1999/xlink';

      // 引数の型チェック。
      if (aXPath) {
        aXPath = String(aXPath);
      }
      else {
        throw 'ERROR: blank XPath expression';
      }
      if (aContextNode) {
        try {
          if (!(aContextNode instanceof Node))
            throw '';
        }
        catch(e) {
          throw 'ERROR: invalid context node';
        }
      }

      const xmlDoc  = aContextNode ? aContextNode.ownerDocument : document ;
      const context = aContextNode || xmlDoc.documentElement;
      const type    = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
      const resolver = {
        lookupNamespaceURI : function(aPrefix)
        {
          switch (aPrefix)
          {
            case 'xul':
              return XULNS;
            case 'html':
            case 'xhtml':
              return XHTMLNS;
            case 'xlink':
              return XLinkNS;
            default:
              return '';
          }
        }
      };

      try {
        var expression = xmlDoc.createExpression(aXPath, resolver);
        var result = expression.evaluate(context, type, null);
      }
      catch(e) {
        return {
          snapshotLength : 0,
          snapshotItem : function()
          {
            return null;
          }
        };
      }
      var arr = [];
      for (let i = 0; i < result.snapshotLength; i++) {
        arr.push(result.snapshotItem(i));
      }

      return arr;
    }
  }
  bug638598.init();
}