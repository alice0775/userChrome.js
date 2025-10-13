// ==UserScript==
// @name          bookmarksmenu_scrollbar.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   add scrollbar and hide scroll button for bookmarks menu
// @include       main
// @compatibility Firefox 145
// @author        alice0775
// @version       2025/10/04 fix flicker on scroll
// @version       2025/01/04 fix Bug 1913322 - Remove overflow / underflow event usage from arrowscrollbox / tabs.js.
// @version       2024/12/31 fix bug
// @version       2021/12/04
// @version       2021/12/04
// @version       2021/10/25 95 Bug 1737033 Remove workaround for bug 420033. Bug 1671000 - When activating items in menu popups, stay clear of overlapping scroll buttons
// @version       2018/10/04 88
// ==/UserScript==
addEventListener("popupshowing", ({target}) => {
	if (!target?.matches?.("menupopup")) return;
	let {scrollBox} = target;
	if (!scrollBox.dataset["noarrow"]) {
    scrollBox.scrollbox.style.setProperty("overflow-y", "auto", "important");

    scrollBox.scrollbox.style.setProperty("margin-top", "0", "important");
    scrollBox.scrollbox.style.setProperty("margin-bottom", "0", "important");
    scrollBox.scrollbox.style.setProperty("padding-top", "0", "important");
    scrollBox.scrollbox.style.setProperty("padding-bottom", "0", "important");
    scrollBox.scrollbox.style.setProperty("border-top", "0", "important");
    scrollBox.scrollbox.style.setProperty("border-bottom", "0", "important");

    event.originalTarget.addEventListener("DOMMenuItemInactive", function () {
      XULBrowserWindow.setOverLink("");
    });
    event.originalTarget.on_DOMMenuItemActive = function(event) {
      /*
      if (super.on_DOMMenuItemActive) {
        super.on_DOMMenuItemActive(event);
      }
      */
      let elt = event.target;
      if (elt.parentNode != this) {
        return;
      }
      let linkURI;
      if (window.XULBrowserWindow) {
        let placesNode = elt._placesNode;
        if (placesNode && PlacesUtils.nodeIsURI(placesNode)) {
          linkURI = placesNode.uri;
        } else if (elt.hasAttribute("targetURI")) {
          linkURI = elt.getAttribute("targetURI");
        }

        if (linkURI) {
          window.XULBrowserWindow.setOverLink(linkURI);
        }
      }
    }.bind(event.originalTarget);
    scrollBox._scrollButtonUp.style.display = "none";
    scrollBox._scrollButtonDown.style.display = "none";
	}
}, true);