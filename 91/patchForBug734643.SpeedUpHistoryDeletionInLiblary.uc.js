// ==UserScript==
// @name          patchForBug734643.SpeedUpHistoryDeletionInLiblary.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   speed up history deletion in Liblary (workaroud Bug 734643 - Extremely slow deleting from history (seems some O(n^2) algorithm is there))
// @include       chrome://browser/content/places/places.xhtml
// @compatibility Firefox 91
// @author        alice0775
// @version       2021/11/10 17:00 wait for init
// @version       2021/11/10
// ==/UserScript==
let patchForBug734643 = false;
let patchForBug734643_timer = setInterval(() => {
  if (document.getElementById("placeContent")?._controller?._view?.place) {
    clearInterval(patchForBug734643_timer);
    patchForBug734643 = true;
    document.getElementById("placeContent")._controller._removeRowsFromHistory =
      async function _removeRowsFromHistory() {
        let nodes = this._view.selectedNodes;
        let URIs = new Set();
        for (let i = 0; i < nodes.length; ++i) {
          let node = nodes[i];
          if (PlacesUtils.nodeIsURI(node)) {
            URIs.add(node.uri);
          } else if (
            PlacesUtils.nodeIsQuery(node) &&
            PlacesUtils.asQuery(node).queryOptions.queryType ==
              Ci.nsINavHistoryQueryOptions.QUERY_TYPE_HISTORY
          ) {
            await this._removeHistoryContainer(node).catch(Cu.reportError);
          }
        }

        if (URIs.size) {
          if (this._view.place) {
            // de-selection
            this._view.place = this._view.place;
          }
          await PlacesUtils.history.remove([...URIs]);
        }
      }
    return;
  }
}, 1000)
