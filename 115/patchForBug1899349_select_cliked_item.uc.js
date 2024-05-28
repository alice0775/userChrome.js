// ==UserScript==
// @name          patchForBug1899349_select_cliked_item.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   workaround Bug 1899349 - Shift+Middle button click on a bookmark item in the library window opens the previously selected item instead of the clicked item.
// @include       chrome://browser/content/places/places.xhtml
// @compatibility Firefox 115
// @author        Alice0775 
// @version       2024/05/29 setTimeout
// @version       2024/05/29 
// ==/UserScript==
setTimeout(function() {
  ContentTree.onXXXclick = function onXXXclick(aEvent) {
    if (aEvent.button != 1) return;
    let tree = ContentTree.view;
    let view = tree.view;
    let cell = tree.getCellAt(aEvent.clientX, aEvent.clientY);
    if (cell.row == -1) return;
    view.selection.select(cell.row);
  }
  let tree = ContentTree.view;
  tree.addEventListener("mousedown", ContentTree.onXXXclick, true);
},1000);
