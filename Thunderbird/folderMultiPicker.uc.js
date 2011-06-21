// ==UserScript==
// @name          folderMultiPicker.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Multiple folder picker with Shift + Click
// @include       chrome://messenger/content/virtualFolderListDialog.xul
// @compatibility Thunderbird 3.0
// @author        Alice0775
// @version       2009/12/18 16:00 一番目を先に選んだ場合に動かないのを修正
// @version       2009/12/18
// ==/UserScript==


document.getElementById("folderPickerTree").setAttribute("onclick", "selectFolderTreeOnClick2(event);");

var startRow = false;

function selectFolderTreeOnClick2(event) {
  // we only care about button 0 (left click) events
  if (event.button != 0 || event.originalTarget.localName != "treechildren")
   return;

  var row = {}, col = {}, obj = {};
  gFolderPickerTree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, obj);
  if (row.value == -1 || row.value > (gFolderPickerTree.view.rowCount - 1))
    return;

  if (event.detail == 2) {
    // only toggle the search folder state when double clicking something
    // that isn't a container
    if (!gFolderPickerTree.view.isContainer(row.value)) {
      if (event.shiftKey && startRow !== false) {
        var start = {}, end = {};
        var numRanges = gFolderPickerTree.view.selection.getRangeCount();
        for (var t = 0; t < numRanges; t++){
          gFolderPickerTree.view.selection.getRangeAt(t, start, end);
          for (var v = start.value; v <= end.value; v++) {
            if (startRow != v) {
              ReverseStateFromNode(v);
            }
          }
        }
        startRow = false;
      } else {
        startRow = row.value;
        ReverseStateFromNode(row.value);
      }
      return;
    }
  }
  else if (event.detail == 1) {
    if (obj.value != "twisty" && col.value.id == "selectedColumn") {
      if (event.shiftKey && startRow !== false) {
        var start = {}, end = {};
        var numRanges = gFolderPickerTree.view.selection.getRangeCount();
        for (var t = 0; t < numRanges; t++){
          gFolderPickerTree.view.selection.getRangeAt(t, start, end);
          for (var v = start.value; v <= end.value; v++) {
            if (startRow != v) {
              ReverseStateFromNode(v);
            }
          }
        }
        startRow = false;
      } else {
        startRow = row.value;
        ReverseStateFromNode(row.value)
      }
    }
  }
}
