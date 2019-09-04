// ==UserScript==
// @charset        UTF-8
// @name           SidebarBookmarkSearchOpenFolder.uc.js
// @description    ブックマークサイドバーで検索したブックマークのコンテキストメニューに[このブックマークがあるフォルダを開く]を追加します
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include        chrome://browser/content/places/bookmarksSidebar.xul
// @version        2019/01/22
// ==/UserScript==
(function() {
	"use strict";
	const SidebarBookmarkSearchOpenFolder = {
		tree: null,
		searchbox: null,
		menuitem: null,
		separator: null,
	
		init: function() {
			this.tree = document.getElementById("bookmarks-view");
			this.searchbox = document.getElementById("search-box");
			const popup = document.getElementById("placesContext");
			if (!this.tree || !this.searchbox || !popup)
				return;
	
			const insertPos = popup.firstChild;
	
			this.menuitem = this.$C("menuitem", {
				id: "ucjs_openFolderWithThisBookmark",
				label: "このブックマークがあるフォルダを開く",
			}, popup, insertPos);
			this.menuitem.addEventListener("command", this);
	
			this.separator = this.$C("menuseparator", null, popup, insertPos);
	
			this.tree.addEventListener("contextmenu", this);
		},
	
		handleEvent: function(event) {
			switch (event.type) {
			case "contextmenu":
				this.onContextmenu(event);
				break;
			case "command":
				this.onCommand(event);
				break;
			}
		},
	
		onContextmenu: function(event) {
			if (this.searchbox.value !== "") {
				this.menuitem.removeAttribute("hidden");
				this.menuitem.removeAttribute("disabled");
				this.separator.removeAttribute("hidden");
				this.separator.removeAttribute("disabled");
			} else {
				this.menuitem.setAttribute("hidden", true);
				this.separator.setAttribute("hidden", true);
			}
		},
	
		onCommand: function(event) {
			const node = this.tree.selectedNode;
			if (node && node.itemId >= 0) {
				// 検索クリア
				/*this.tree.place = this.tree.place;
				this.searchbox.reset();
				searchBookmarks("");*/
				this.searchbox._clearSearch();

				// ツリーから対象idのノードを探す
				const target = this.findNode(this.tree.view.result.root, node.itemId);
				if (target) {
					setTimeout(() => {
						const tree = this.tree;
						tree.selectNode(target);

						// スクロール位置調整
						const box = tree.treeBoxObject || tree;	// tree.treeBoxObjext: -65, tree: 66-
						const last = box.getLastVisibleRow();
						if (last - 3 <= tree.currentIndex) {
							box.scrollByLines((last - box.getFirstVisibleRow()) / 4);
						}
					}, 0);
				}
			}
		},
	
		findNode: function(node, id) {
			function _find_recursive(node) {
				if (node.itemId === id)
					return node;
	
				if (PlacesUtils.nodeIsContainer(node)) {
					const prevOpen = node.containerOpen;
					node.containerOpen = true;
					try {
						for (let i = 0;  i < node.childCount; i++) {
							const childNode = node.getChild(i);
							if (!PlacesUtils.nodeIsQuery(childNode)) {
								const found = _find_recursive(childNode);
								if (found)
									return found;
							}
						}
					}
					finally {
						node.containerOpen = prevOpen;
					}
				}
				return null;
			}
			return _find_recursive(node);
		},
	
		$C: function(tag, attr, parent, before) {
			const e = document.createElement(tag);
			if (attr) Object.keys(attr).forEach(k => e.setAttribute(k, attr[k]));
			if (parent) parent.insertBefore(e, before);
			return e;
		}
	};
	
	SidebarBookmarkSearchOpenFolder.init();
})();
