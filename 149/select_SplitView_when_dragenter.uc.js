// ==UserScript==
// @name           select_SplitView_when_dragenter.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @charset        UTF-8
// @description    スプリットビュー間でドラッグ&ドロップをできるように
// @include        main
// @async          true
// @compatibility  Firefox 149
// @author         Alice0775
// @version        2026/03/26
// @Note           BSTweakerさんのDNGGestureDefinitions.jsファイルの /*=== From external browser / window ===*/ セクションを以下のようにしておく(行先頭の//は無視)
//
//    {dir:'', modifier:'',name:'新しいタブ前面に開く',obj:'link, textlink',},
//    {dir:'', modifier:'',name:'新しいタブで画像を開く',obj:'image',},
//    
// ==/UserScript==
gBrowser.tabpanels.addEventListener("dragenter", (event) => {
  switch(event.type) {
    case "dragenter":
    console.log(event.originalTarget);
      const browser = event.originalTarget.closest("browser");
      const tab = gBrowser.getTabForBrowser(browser);
      if (tab) {
    console.log("tab " , tab);
        gBrowser.selectedTab = tab; 
      }
    break;
  }
}, false);
