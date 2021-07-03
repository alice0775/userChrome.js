// ==UserScript==
// @name          patchForBug1718766.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1718766 - [non-Fission] Back/Forward dropdown history list does not pop up. and Bug 1704718 - Crash in [@ nsSHistory::InitiateLoad]
// @include       main
// @compatibility Firefox 88
// @author        alice0775
// @version       2021/07/4 00:00 
// ==/UserScript==

function patchForBug1718766_init() {
  if (Services.prefs.getBoolPref("fission.autostart"))
    return;

  window.FillHistoryMenu = function FillHistoryMenu(aParent) {
    // Lazily add the hover listeners on first showing and never remove them
    if (!aParent.hasStatusListener) {
      // Show history item's uri in the status bar when hovering, and clear on exit
      aParent.addEventListener("DOMMenuItemActive", function(aEvent) {
        // Only the current page should have the checked attribute, so skip it
        if (!aEvent.target.hasAttribute("checked")) {
          XULBrowserWindow.setOverLink(aEvent.target.getAttribute("uri"));
        }
      });
      aParent.addEventListener("DOMMenuItemInactive", function() {
        XULBrowserWindow.setOverLink("");
      });

      aParent.hasStatusListener = true;
    }

    // Remove old entries if any
    let children = aParent.children;
    for (var i = children.length - 1; i >= 0; --i) {
      if (children[i].hasAttribute("index")) {
        aParent.removeChild(children[i]);
      }
    }

    const MAX_HISTORY_MENU_ITEMS = 15;

    const tooltipBack = gNavigatorBundle.getString("tabHistory.goBack");
    const tooltipCurrent = gNavigatorBundle.getString("tabHistory.current");
    const tooltipForward = gNavigatorBundle.getString("tabHistory.goForward");

    function updateSessionHistory(sessionHistory, initial) {
      let count = sessionHistory.entries.length;

      if (!initial) {
        if (count <= 1) {
          // if there is only one entry now, close the popup.
          aParent.hidePopup();
          return;
        } else if (aParent.id != "backForwardMenu" && !aParent.parentNode.open) {
          // if the popup wasn't open before, but now needs to be, reopen the menu.
          // It should trigger FillHistoryMenu again. This might happen with the
          // delay from click-and-hold menus but skip this for the context menu
          // (backForwardMenu) rather than figuring out how the menu should be
          // positioned and opened as it is an extreme edgecase.
          aParent.parentNode.open = true;
          return;
        }
      }

      let index = sessionHistory.index;
      let half_length = Math.floor(MAX_HISTORY_MENU_ITEMS / 2);
      let start = Math.max(index - half_length, 0);
      let end = Math.min(
        start == 0 ? MAX_HISTORY_MENU_ITEMS : index + half_length + 1,
        count
      );
      if (end == count) {
        start = Math.max(count - MAX_HISTORY_MENU_ITEMS, 0);
      }

      let existingIndex = 0;

      for (let j = end - 1; j >= start; j--) {
        let entry = sessionHistory.entries[j];
        // Explicitly check for "false" to stay backwards-compatible with session histories
        // from before the hasUserInteraction was implemented.
        if (
          BrowserUtils.navigationRequireUserInteraction &&
          entry.hasUserInteraction === false &&
          // Always allow going to the first and last navigation points.
          j != end - 1 &&
          j != start
        ) {
          continue;
        }
        let uri = entry.url;

        let item =
          existingIndex < children.length
            ? children[existingIndex]
            : document.createXULElement("menuitem");

        item.setAttribute("uri", uri);
        item.setAttribute("label", entry.title || uri);
        item.setAttribute("index", j);

        // Cache this so that gotoHistoryIndex doesn't need the original index
        item.setAttribute("historyindex", j - index);

        if (j != index) {
          // Use list-style-image rather than the image attribute in order to
          // allow CSS to override this.
          item.style.listStyleImage = `url(page-icon:${uri})`;
        }

        if (j < index) {
          item.className =
            "unified-nav-back menuitem-iconic menuitem-with-favicon";
          item.setAttribute("tooltiptext", tooltipBack);
        } else if (j == index) {
          item.setAttribute("type", "radio");
          item.setAttribute("checked", "true");
          item.className = "unified-nav-current";
          item.setAttribute("tooltiptext", tooltipCurrent);
        } else {
          item.className =
            "unified-nav-forward menuitem-iconic menuitem-with-favicon";
          item.setAttribute("tooltiptext", tooltipForward);
        }

        if (!item.parentNode) {
          aParent.appendChild(item);
        }

        existingIndex++;
      }

      if (!initial) {
        let existingLength = children.length;
        while (existingIndex < existingLength) {
          aParent.removeChild(aParent.lastElementChild);
          existingIndex++;
        }
      }
    }

    let sessionHistory = SessionStore.getSessionHistory(
      gBrowser.selectedTab,
      updateSessionHistory
    );
    if (!sessionHistory) {
      return false;
    }

    // don't display the popup for a single item
    if (sessionHistory.entries.length <= 1) {
      return false;
    }

    updateSessionHistory(sessionHistory, true);
    return true;
  }
}


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  patchForBug1718766_init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
     patchForBug1718766_init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
