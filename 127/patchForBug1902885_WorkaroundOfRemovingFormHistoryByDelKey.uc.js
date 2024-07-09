// ==UserScript==
// @name        patchForBug1902885_WorkaroundOfRemovingFormHistoryByDelKey.uc.js
// @description 検索バーの検索履歴をDelキーでデータベースからも削除
// @include     main
// @charset     UTF-8
// @version     2024/06/17 00:00
// ==/UserScript==
(function(){
  const lazy = {};

  ChromeUtils.defineESModuleGetters(lazy, {
    FormHistory: "resource://gre/modules/FormHistory.sys.mjs",
  });

	let bar = document.getElementById('searchbar');
	let PSAC = document.getElementById('PopupSearchAutoComplete');


	function remove2(event){ 
    if (PSAC.selectedIndex < 0) return;
		let controller = PSAC.view.QueryInterface(Components.interfaces.nsIAutoCompleteController);
		let search = controller.getValueAt(PSAC.selectedIndex);
    let originaltype = PSAC._richlistbox.selectedItem.getAttribute("originaltype");
    if (originaltype === "fromhistory" &&
      event.keyCode == KeyEvent.DOM_VK_DELETE &&
      bar.value == search
    ) {
		  lazy.FormHistory.update({op: 'remove', fieldname: 'searchbar-history', value: bar.value});
    }
	}

  bar.addEventListener('keydown', remove2, true);
})()