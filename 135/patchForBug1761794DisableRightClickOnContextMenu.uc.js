// ==UserScript==
// @name           patchForBug1761794DisableRightClickOnContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Bug 1761794 - Right-click Registers as Left-Click and directly opens the link with context menu also superimposed
// @include        main
// @async          true
// @compatibility  Firefox 91+
// @author         Alice0775
// @version        2022/03/10 02:00 Bug 1761794 - Right-click Registers as Left-Click and directly opens the link with context menu also superimposed
// ==/UserScript==
// just ignore right mouse up....
document.getElementById("contentAreaContextMenu").addEventListener("mouseup", (event) => {
  if (event.button == 2) event.preventDefault();
}, true);