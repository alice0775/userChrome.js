// ==UserScript==
// @name           patchForWebPanel.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Web Panel のコマンドのバグパッチ 戻る/進む/再読込のバグを修正
// @include        chrome://browser/content/web-panels.xul
// @compatibility  Firefox 3.1b3 3.5b4pre 3.6a1pre
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        LastMod 2009/03/17 23:00
// @note           Bug 483919 -  Back/Forward/Reload context menu of the Web Panel were broken.
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

  self.xul = DOM(kXULNS,
    '<command id="Browser:BackOrBackDuplicate" oncommand="getPanelBrowser().webNavigation.goBack(event);" disabled="true"> \
      <observes element="Browser:Back" attribute="disabled"/> \
    </command>'
  );
  document.getElementById('mainCommandset').appendChild(self.xul);
  self.xul = DOM(kXULNS,
    '<command id="Browser:ForwardOrForwardDuplicate" oncommand="getPanelBrowser().webNavigation.goForward(event);" disabled="true"> \
      <observes element="Browser:Forward" attribute="disabled"/> \
    </command>'
  );
  document.getElementById('mainCommandset').appendChild(self.xul);
  self.xul = DOM(kXULNS,
    '<command id="Browser:ReloadOrDuplicate" oncommand="PanelBrowserReload(event)" disabled="true"> \
      <observes element="Browser:Reload" attribute="disabled"/> \
    </command>'
  );
  document.getElementById('mainCommandset').appendChild(self.xul);
})();
