// ==UserScript==
// @name           webPanelAutocomplete.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Web PanelにもAutocomplete
// @include        chrome://browser/content/web-panels.xul
// @compatibility  Firefox 3.0
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        LastMod 2009/03/17 23:00
// @Note           Sub-Script/Overlay Loader v3.0.20mod
// ==/UserScript==
(function() {
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

  self.panel = DOM(kXULNS,
          '<panel ignorekeys="true" \
                 level="top" \
                 type="autocomplete" \
                 chromedir="ltr" \
                 id="PopupAutoComplete" \
                 noautofocus="true"/>'
  );
  document.getElementById('mainPopupSet').appendChild(self.panel);
  document.getElementById('web-panels-browser').setAttribute("autocompletepopup","PopupAutoComplete");
  document.getElementById('web-panels-browser').attachFormFill();
})();
