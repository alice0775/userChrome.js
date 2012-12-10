// ==UserScript==
// @name           contextTabContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    右クリックメニューにTab Context Menu
// @include        main
// @compatibility  Firefox 4.0
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2011/05/12 23:00
// ==/UserScript==
(function(){
  const kXULNS =
           "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
  function DOM (xmlns, xml) {
    var doc = (new DOMParser()).parseFromString(
            '<root xmlns="' + xmlns + '">' + xml + "</root>",
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
      '<menuitem id="context-tabcontextmenu" \
                label="Tab Context Menu" \
                accesskey="T" \
                oncommand="setTimeout(function(self){document.popupNode = gBrowser.selectedTab;document.getElementById(\'tabContextMenu\').openPopup(self,-2,-2,true);setTimeout(function(){document.popupNode = null}, 250);}, 0, this);"> \
       </menuitem>'
  );
  var ref = document.getElementById('context-openlink');
  ref.parentNode.insertBefore(self.elem, ref.parentNode.firstChild);
})();