// ==UserScript==
// @name           patchForBug638598.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 638598 Iframe parent window page does not scroll to # anchor by user interaction(click ,enter).
// @include        main
// @compatibility  Firefox 4.0b13pre
// @author         Alice0775
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

      setTimeout(function(self, event){self.delayedClick(event);}, 250, this, event);
    },

    delayedClick: function(event) {
      if (event.originalTarget && event.originalTarget.ownerDocument instanceof HTMLDocument) {
        var win = event.originalTarget.ownerDocument.defaultView;
        var wintop= win;
        if (win && win.frameElement) {
          wintop = win.top;
        }

        var linkNode = this.isAnchorElement(event);
        if (!linkNode)
          return;

        if (linkNode.getAttribute("onclick"))
          return;

        if (wintop == win) {
          /*
          /// xxx Bug 662170 - Go to top anchor "#" doesn't work in Firefox 6 and Firefox 7
          {
            var targethref = linkNode.getAttribute("href");
            var baseURI = this.ios.newURI(linkNode.baseURI, null, null);

            var uri = this.ios.newURI(targethref, null, baseURI);
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

        var targethref = linkNode.getAttribute("href");
        var baseURI = this.ios.newURI(linkNode.baseURI, null, null);

        var uri = this.ios.newURI(targethref, null, baseURI);
        var hash = uri.spec.match(/#(.+)$/);
        if (!hash || hash.length < 2 || !hash[1])
          return;

        var doc = linkNode.ownerDocument;
        var xpath = "//a[@id=" + "'" + hash[1] +"']|//a[@name=" + "'" + hash[1] +"']";
        var elem = this.getFirstElementByXPath(xpath, doc.body);

        if (elem) {
          elem.scrollIntoView(true);
        }
      }
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
    
    getFirstElementByXPath: function(xpath, node, css) {
      if (typeof css != 'undefined' && css) {
        if (!node || !(querySelector in node))
          node = document;
        return  node.querySelector(xpath);
      } else {
        var result = this.getXPathResult(xpath, node,
            XPathResult.FIRST_ORDERED_NODE_TYPE);
        return result.singleNodeValue;
      }
    },

    getXPathResult: function(xpath, node, resultType) {
        var node = node || document;
        var doc = node.ownerDocument || node;
        var resolver = doc.createNSResolver(node.documentElement || node);
        var defaultNS = node.lookupNamespaceURI(null);
        if (defaultNS) {
            const defaultPrefix = '__default__';
            xpath = this.addDefaultPrefix(xpath, defaultPrefix);
            var defaultResolver = resolver;
            resolver = function (prefix) {
                return (prefix == defaultPrefix)
                    ? defaultNS : defaultResolver.lookupNamespaceURI(prefix);
            };
        }
        return doc.evaluate(xpath, node, resolver, resultType, null);
    },

    addDefaultPrefix: function(xpath, prefix) {
        const tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g;
        const TERM = 1, OPERATOR = 2, MODIFIER = 3;
        var tokenType = OPERATOR;
        prefix += ':';
        function replacer(token, identifier, suffix, term, operator, modifier) {
            if (suffix) {
                tokenType =
                    (suffix == ':' || (suffix == '::' &&
                     (identifier == 'attribute' || identifier == 'namespace')))
                    ? MODIFIER : OPERATOR;
            }
            else if (identifier) {
                if (tokenType == OPERATOR && identifier != '*') {
                    token = prefix + token;
                }
                tokenType = (tokenType == TERM) ? OPERATOR : TERM;
            }
            else {
                tokenType = term ? TERM : operator ? OPERATOR : MODIFIER;
            }
            return token;
        }
        return xpath.replace(tokenPattern, replacer);
    }
   }
  bug638598.init();
}