// ==UserScript==
// @name           addMiddleClickToContextViewMedia.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Added  middle-clicking to "Open In New Tab" to open it with "tabshifted"
// @include        main
// @compatibility  Firefox 91+
// @author         Alice0775
// @version        2021/11/06 19:30
// ==/UserScript== 
function viewMedia_init() {
  let func = nsContextMenu.prototype.viewMedia.toString();
  if (func.includes('if (e.button == 1) { where = "tabshifted"; }'))
    return;
  func = func.replace(
    `let referrerInfo = this.contentData.referrerInfo;`,
    `if (e.button == 1) { where = "tabshifted"; }
     let referrerInfo = this.contentData.referrerInfo;`
  );
  nsContextMenu.prototype.viewMedia = new Function(
     func.match(/\(([^)]*)/)[1],
     func.replace(func.match(/[^)]*/)+")","").replace(/[^{]*\{/,"")
         .replace(/}$/, '')
  );
}

document.getElementById("contentAreaContextMenu")
        .addEventListener("popupshowing", viewMedia_init,
        {useCapture: false, once: true});