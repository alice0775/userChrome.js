// ==UserScript==
// @name           contextopenlinkForWebPanel.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Web Panel 右クリックメニュー
// @include        chrome://browser/content/web-panels.xul
// @compatibility  Firefox 3.1b3 3.5b4pre 3.6a1pre
// @author         Alice0775
// @version        LastMod 2009/03/17 23:00
// ==/UserScript==
(function(){
  const kXULNS =
           "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
  function DOM (xmlns, xml) {
    var doc = (new DOMParser()).parseFromString(
            '<root xmlns="' + xmlns + '">' + xml.toXMLString() + "</root>",
            "application/xml"
    );
    var imported = document.importNode(doc.documentElement, true);
    var range = document.createRange();
    range.selectNodeContents(imported);
    var fragment = range.extractContents();
    range.detach();
    return fragment.childNodes.length > 1 ? fragment : fragment.firstChild;
  }

  self.elem = DOM(kXULNS,
      <menuitem id="context-openlinkInWebPanel"
                label="Open Link in Web Panel"
                accesskey="O"
                oncommand="loadWebPanel(gContextMenu.linkURL)"
                observes="gContextMenu.onLink"/>
  );
  var ref = document.getElementById('context-openlink');
  ref.parentNode.insertBefore(self.elem, ref);
})();