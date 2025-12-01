// ==UserScript==
// @name           remove_menuseparator.uc.js
// @namespace
// @description    時々コンテキストメニューの上端にセパレーターが一瞬表示される場合があるので, なんとかしたい
// @include        main
// @async          true
// @compatibility  Firefox 140
// @author
// @version
// @Note
// ==/UserScript==
document.getElementById("contentAreaContextMenu")
  .addEventListener("popupshowing", function (event) {
    const popup = event.originalTarget;        
    popup.style.setProperty("visibility", "hidden", "");
    window.setTimeout((popup) => {popup.style.removeProperty("visibility");}, 30, popup);

    remove_menuseparator(popup);
    //window.setTimeout((popup) => {remove_menuseparator(popup);}, 0, popup);
    window.setTimeout((popup) => {remove_menuseparator(popup);}, 20, popup);
  }, true
);
function remove_menuseparator(popup) {
  // popup 直下の要素のみ取得
  const items = Array.from(popup.children)
      .filter(node =>
          ["menu", "menuitem", "menuseparator, menugroup"].includes(node.localName)
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
