// ==UserScript==
// @name           moveDownloads2History_with_Library.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Donloads Manager
// @include        chrome://browser/content/places/places.xul
// @compatibility  Firefox 31+
// @author         Alice0775
// @version        2015/02/20 23:00 Clear download button should not delete from history
// ==/UserScript== 
(function() {
	if (document.getElementById("clearDownloadsButton")) {
	  let btn = document.getElementById("clearDownloadsButton");
	  if (btn) {
	    btn.removeAttribute("command");
	    btn.setAttribute("observes", "downloadsCmd_clearDownloads");
	    btn.setAttribute("oncommand", "LibraryDoClearAll();");
	  }
	  window.LibraryDoClearAll = function LibraryDoClearAll()
	  {
	    var places = [];
	    function addPlace(aURI, aTitle, aVisitDate) {
	      places.push({
	        uri: aURI,
	        title: aTitle,
	        visits: [{
	          visitDate: aVisitDate,
	          transitionType: Ci.nsINavHistoryService.TRANSITION_LINK
	        }]
	      });
	    }
	    function moveDownloads2History(d) {
	      var richListBox = document.getElementById("downloadsRichListBox");

	      var cont = richListBox._placesView.result.root;
	      cont.containerOpen = true;
	      for (let i = cont.childCount - 1; i > -1; i--) {
	          let node = cont.getChild(i);
	          let aURI = makeURI(node.uri);
	          let aTitle = node.title;
	          let aVisitDate = node.time;
	          addPlace(aURI, aTitle, aVisitDate)
	      }

	      // Clear List
	      richListBox._placesView.doCommand('downloadsCmd_clearDownloads');

	      if (places.length > 0) {
	        var asyncHistory = Components.classes["@mozilla.org/browser/history;1"]
	                 .getService(Components.interfaces.mozIAsyncHistory);
	          asyncHistory.updatePlaces(places);
	      }
	    }

	    // Clear the section first as it isn't handled correctly if not. The toolbar
	    // was displaying the last selected item.
	    moveDownloads2History(0);
	  }
	}
})();
