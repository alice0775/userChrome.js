// ==UserScript==
// @name           ucjs_stopAutoscrollOnCustomElement.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Workaround Bug 1716883 - Middle-clicking on IMG, SVG <use> wrapped by <a> unexpectedly starts autoscroll
// @author         Alice0775
// @include        main
// @compatibility  91 only
// @version        2021/11/07 14:00
// ==/UserScript==

function ucjs_stopAutoscrollOnCustomElement(event) {
  if(event.button != 1) return;
  let elem = event.originalTarget;
//Services.console.logStringMessage("elem: " + elem.tagName);
  if(!elem.getRootNode()) return;
  if(!elem.getRootNode().host) return;
//Services.console.logStringMessage("elem.getRootNode().host.tagName: " + elem.getRootNode().host.tagName);
  while (elem) {
//Services.console.logStringMessage("elem: " + elem.tagName);
    if (elem.nodeType == elem.ELEMENT_NODE) {
      // Link?
      const XLINK_NS = "http://www.w3.org/1999/xlink";

      if (
        // Be consistent with what hrefAndLinkNodeForClickEvent
        // does in browser.js
        (
          (elem instanceof content.HTMLAnchorElement &&
            elem.href) ||
          (elem instanceof content.SVGAElement &&
            (elem.href || elem.hasAttributeNS(XLINK_NS, "href"))) ||
          (elem instanceof content.HTMLAreaElement && elem.href) ||
          elem instanceof content.HTMLLinkElement ||
          elem.getAttributeNS(XLINK_NS, "type") == "simple")
      ) {
        // Target is a link or a descendant of a link.
        event.preventDefault();
/*
        let event2 = new MouseEvent('click', {
            view: elem.ownerDocument.defaultView,
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            shiftKey: event.shiftKey
          });
        elem.dispatchEvent(event2);
*/
        return;
      }
    }
    elem = elem.flattenedTreeParentNode;
  }
}
window.messageManager.loadFrameScript(
   'data:application/javascript,'
    + encodeURIComponent(ucjs_stopAutoscrollOnCustomElement.toSource().replace(/\n[ ]+/g, "\n "))
    + encodeURIComponent('addEventListener("mousedown", ucjs_stopAutoscrollOnCustomElement, false);')
  , true);
delete ucjs_stopAutoscrollOnCustomElement;
