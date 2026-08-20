// ==UserScript==
// @name           remove_menuseparator.uc.js
// @namespace
// @description
// @include        main
// @async          true
// @compatibility  Firefox 140
// @author
// @version
// @Note
// ==/UserScript==
(function() {
  let LastTime = 0;
  document.getElementById("contentAreaContextMenu")
    .addEventListener("popupshowing", function (event) {
      const popup = event.originalTarget;        
      popup.style.setProperty("visibility", "hidden", "");
      const now = Date.now();
      window.setTimeout(() => {
        LastTime = now;
        remove_menuseparator(popup);
        popup.style.removeProperty("visibility");
      }, (now - LastTime) > 600000 ? 40: 10);
    }, true
  );
  function remove_menuseparator(popup) {
    // popup 直下の要素のみ取得
    const items = Array.from(popup.children)
        .filter(node =>
            ["menu", "menuitem", "menuseparator", "menugroup"].includes(node.localName)
        );
    // hidden でない最初の要素
    let firstVisible = items.find(node => !node.hidden);
    //console.log("First visible item:", firstVisible);
    if (firstVisible.localName != "menuseparator")
      return;
    firstVisible.hidden = true;
    firstVisible = items.find(node => !node.hidden);
    if (firstVisible.localName != "menuseparator")
      return;
    firstVisible.hidden = true;
  }
})();
