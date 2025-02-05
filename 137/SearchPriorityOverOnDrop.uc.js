// ==UserScript==
// @name			SearchPriorityOverOnDrop.uc.js
// @description		検索バーやページ内検索バーにリンクをドロップした場合リンク文字列を優先する
// @include			chrome://browser/content/browser.xhtml
// @async          true
// @charset			UTF-8
// @compatibility  Firefox 137
// @version        2025/02/04 23:00 Bug 1880913 - Move BrowserSearch out of browser.js
// @version     2021/08/25
// ==/UserScript==
(function(){
	// 検索バーにドロップした時点で検索する
	const SEARCH_ON_DROP = false;
	// ページ内検索バーにドロップした時点で検索する
	const FIND_ON_DROP = true;
	
	window.addEventListener('unload', function uninit() {
		document.removeEventListener('drop', drop, true);
		window.removeEventListener('unload', uninit, false);
	}, false);
	document.addEventListener('drop', drop, true);
	function drop(e){
		if(!e.target.closest('#searchbar') && !e.target.closest('findbar')) return;
		let text = e.dataTransfer.getData('text/x-moz-url').split(/\r\n|\n/)[1];
			text = text? text : e.dataTransfer.getData('text/plain');
		// タブをドロップした場合はタブのラベル
		const TAB_DROP_TYPE = "application/x-moz-tabbrowser-tab";
		if(e.dataTransfer.mozTypesAt(0)[0] == TAB_DROP_TYPE){
			draggedTab = e.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0);
			text = draggedTab.getAttribute('label');
		}
		if(e.target.closest('#searchbar')){
			e.stopPropagation();
			e.preventDefault();
			document.getElementById("searchbar").value = text;
			SEARCH_ON_DROP
			? document.getElementById("searchbar").querySelector(".search-go-button").click()
      : document.getElementById("searchbar").updateGoButtonVisibility();
		}else{
			e.stopPropagation();
			e.preventDefault();
			gFindBar._findField.value = text;
			FIND_ON_DROP? gFindBar.onFindAgainCommand(true) : null;
		}
	}
})()