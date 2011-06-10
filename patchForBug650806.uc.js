// ==UserScript==
// @name           patchForBug650806.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 650806 - javascript:links may operate on the wrong document
// @include        main
// @compatibility  Firefox 4.0
// @author         Alice0775
// @version        2011/04/19 13:20
// ==/UserScript==
var func = contentAreaClick.toString();
func = func.replace(
	'if (isPanelClick && mainTarget) {',
	<><![CDATA[
	$&
    if (linkNode.getAttribute("onclick") ||
        href.substr(0, 11) === "javascript:" ||
        href.substr(0, 5) === "data:") {
    	let docLinknode = linkNode.ownerDocument;
    	let browserLinknode = gBrowser.getBrowserForDocument(docLinknode);
    	let tabLinknode = gBrowser._getTabForContentWindow(docLinknode.defaultView);
      function getCurrentURIOfTab(aTab) {
        if (aTab.getAttribute('ontap') == 'true') {
          // If BarTap ( https://addons.mozilla.org/firefox/addon/67651 ) is installed,
          // currentURI is possibly 'about:blank'. So, we have to get correct URI
          // from the attribute or the session histrory.
          var b = aTab.linkedBrowser;
          try {
            if (b.hasAttribute(kBARTAP_URI))
              return makeURIFromSpec(b.getAttribute(kBARTAP_URI));
          }
          catch(e) {
          }
          try {
            var h = b.sessionHistory;
            var entry = h.getEntryAtIndex(h.index, false);
            return entry.URI;
          }
          catch(e) {
          }
        }
        // Firefox 4.0-
        if (aTab.linkedBrowser.__SS_needsRestore) {
          let data = aTab.linkedBrowser.__SS_data;
          let entry = data.entries[Math.max(data.index, data.entries.length-1)];
          return makeURIFromSpec(entry.url);
        }
        return aTab.linkedBrowser.currentURI;
      }
      function makeURIFromSpec(aURI) {
        var newURI;
        aURI = aURI || '';
        if (aURI && String(aURI).indexOf('file:') == 0) {
          var fileHandler = IOService
                            .getProtocolHandler('file')
                            .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
          var tempLocalFile = fileHandler.getFileFromURLSpec(aURI);
          newURI = IOService.newFileURI(tempLocalFile);
        }
        else {
          newURI = IOService.newURI(aURI, null, null);
        }
        return newURI;
      }
    	if (tabLinknode.hasAttribute('busy')
    	    || browserLinknode.docShell.busyFlags
    	    || browserLinknode.docShell.restoringDocument
    	    || !browserLinknode.webNavigation.currentURI
    	    || getCurrentURIOfTab(tabLinknode).spec == 'about:blank'
    	    || tabLinknode.getAttribute('ontap') == 'true') { alert(1)
        event.preventDefault();
        return true;
    	}
    }
	]]></>
);
eval("contentAreaClick = "+ func);