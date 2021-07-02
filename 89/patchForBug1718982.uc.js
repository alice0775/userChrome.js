// ==UserScript==
// @name          patchForBug1718982.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1718982 - ESC key should not save modified data in `Edit bookmark` and `Edit bookmark folder` dialog
// @include       chrome://browser/content/places/bookmarkProperties.xhtml
// @compatibility Firefox 89
// @author        alice0775
// @version       2021/07/3 00:00 
// ==/UserScript==
{
  function patchForBug1718982onkeyDown(event) {
    if (event.keyCode == KeyEvent.DOM_VK_ESCAPE) {
      event.preventDefault();
      event.stopPropagation();
      let cancelButton = document
           .getElementById("bookmarkpropertiesdialog")
           .getButton("cancel");
       cancelButton.click();
    }
  }
  document.addEventListener('keydown', patchForBug1718982onkeyDown, true);

}