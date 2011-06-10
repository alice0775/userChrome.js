// ==UserScript==
// @name           patchForBug646036_sanitizeSessionHistory.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 646036 - To navigate back one page, It is necessary to click two times of back buttons
// @include        main
// @compatibility  Firefox 4.0 5.0 6.0a2
// @author         Alice0775
// @version        2011/04/24
// ==/UserScript==
ucjs_goBack = function () {
  var index = gBrowser.sessionHistory.index;
	var entry = gBrowser.sessionHistory.getEntryAtIndex(index, false)
	            .QueryInterface(Components.interfaces.nsIHistoryEntry)
	            .QueryInterface(Components.interfaces.nsISHEntry);
	var uri = entry.URI;
  for (var i = index - 1; i >= 0; i--) {
    var entry1  = gBrowser.sessionHistory.getEntryAtIndex(i, false)
                  .QueryInterface(Components.interfaces.nsIHistoryEntry)
	                .QueryInterface(Components.interfaces.nsISHEntry);
    gBrowser.webNavigation.gotoIndex(i);
    if (uri != entry1.URI) {
      return;
    }
  }
};

gBrowser.goBack = function() {
	return ucjs_goBack();
  //return this.mCurrentBrowser.goBack();
};

FillHistoryMenu = function FillHistoryMenu(aParent) {
  // Lazily add the hover listeners on first showing and never remove them
  if (!aParent.hasStatusListener) {
    // Show history item's uri in the status bar when hovering, and clear on exit
    aParent.addEventListener("DOMMenuItemActive", function(aEvent) {
      // Only the current page should have the checked attribute, so skip it
      if (!aEvent.target.hasAttribute("checked"))
        XULBrowserWindow.setOverLink(aEvent.target.getAttribute("uri"));
    }, false);
    aParent.addEventListener("DOMMenuItemInactive", function() {
      XULBrowserWindow.setOverLink("");
    }, false);

    aParent.hasStatusListener = true;
  }

  // Remove old entries if any
  var children = aParent.childNodes;
  for (var i = children.length - 1; i >= 0; --i) {
    if (children[i].hasAttribute("index"))
      aParent.removeChild(children[i]);
  }

  var webNav = getWebNavigation();
  var sessionHistory = webNav.sessionHistory;

  var count = sessionHistory.count;
  if (count <= 1) // don't display the popup for a single item
    return false;



  var ent = [];
  var j = [];
  var entry = sessionHistory.getEntryAtIndex(count - 1, false);
  var uri0 = entry.URI;
  ent.push(entry);
  j.push(count - 1)

  for (let i = count - 2; i >= 0; i-- ) {
    entry = sessionHistory.getEntryAtIndex(i, false);
    let uri = entry.URI;
    if (uri != uri0) {
      ent.push(entry);
      j.push(i);
      uri0 = uri
    }
  }
  ent.reverse();
  j.reverse();
  var index = sessionHistory.index;
  entry = sessionHistory.getEntryAtIndex(index, false);
  uri0 = entry.URI;
  count = ent.length;
  for (let i = 0; i < count - 1; i++) {
    if (j[i] < index && index <= j[i + 1] && uri0 == ent[i+1].URI) {
      index = i+1;
      break;
    }
    if (j[i] <= index && index < j[i + 1] && uri0 == ent[i].URI) {
      index = i+1;
      break;
    }
  }

  const MAX_HISTORY_MENU_ITEMS = 15;
  var half_length = Math.floor(MAX_HISTORY_MENU_ITEMS / 2);
  var start = Math.max(index - half_length, 0);
  var end = Math.min(start == 0 ? MAX_HISTORY_MENU_ITEMS : index + half_length + 1, count);
  if (end == count)
    start = Math.max(count - MAX_HISTORY_MENU_ITEMS, 0);

  var tooltipBack = gNavigatorBundle.getString("tabHistory.goBack");
  var tooltipCurrent = gNavigatorBundle.getString("tabHistory.current");
  var tooltipForward = gNavigatorBundle.getString("tabHistory.goForward");

  for (var j = end - 1; j >= start; j--) {
    let item = document.createElement("menuitem");
    let entry = ent[j];
    let uri = entry.URI.spec;

    item.setAttribute("uri", uri);
    item.setAttribute("label", entry.title || uri);
    item.setAttribute("index", j);

    if (j != index) {
      try {
        let iconURL = Cc["@mozilla.org/browser/favicon-service;1"]
                         .getService(Ci.nsIFaviconService)
                         .getFaviconForPage(entry.URI).spec;
        item.style.listStyleImage = "url(" + iconURL + ")";
      } catch (ex) {}
    }

    if (j < index) {
      item.className = "unified-nav-back menuitem-iconic menuitem-with-favicon";
      item.setAttribute("tooltiptext", tooltipBack);
    } else if (j == index) {
      item.setAttribute("type", "radio");
      item.setAttribute("checked", "true");
      item.className = "unified-nav-current";
      item.setAttribute("tooltiptext", tooltipCurrent);
    } else {
      item.className = "unified-nav-forward menuitem-iconic menuitem-with-favicon";
      item.setAttribute("tooltiptext", tooltipForward);
    }

    aParent.appendChild(item);
  }
  return true;
}
