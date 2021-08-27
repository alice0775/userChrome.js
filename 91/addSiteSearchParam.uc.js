// ==UserScript==
// @name           addSiteSearchParam.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add Site Search Param site:url
// @include        main
// @compatibility  Firefox 91
// @author         Alice0775
// @version        2021/08/28 06:00
// @version        2021/08/21 12:00
// ==/UserScript==
var addSiteSearchParam = {

  init: async function() {
    if (!Services.search.isInitialized) {
      await Services.search.init();
    }
    this.searchBarMenu();
    window.addEventListener('aftercustomization', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    window.removeEventListener('aftercustomization', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
    window.removeEventListener('unload', this, false);
  },

  searchBarMenu: function() {
    let addSiteSearch = document.createXULElement("menuitem");
    addSiteSearch.id = "addSiteSearch";
    addSiteSearch.setAttribute("label", "Add site:url option");
    addSiteSearch.setAttribute("anonid", "addSiteSearch");
    addSiteSearch.addEventListener("command", (event) => {

      let site = this.goUpperLevel(gBrowser.selectedBrowser.documentURI);
      let str = searchbar.value;
      let idx = str.indexOf(" site:");
      if (idx < 0)
        idx = str.length;
      str = str.slice(0, idx);
      searchbar.value = str + " site:"
                 + site.host + site.filePath;
      //BrowserSearch.searchBar.handleSearchCommand(event);

    });

    let contextMenu = searchbar.querySelector(".textbox-contextmenu");
    if (!contextMenu)
      return;

    contextMenu.addEventListener("popupshowing", () => {
      if (!contextMenu.querySelector("#addSiteSearch")) {
        let insert = contextMenu.querySelector('[cmd="cmd_selectAll"]');
        insert.insertAdjacentElement("afterend", addSiteSearch);
      }
    }, {once: true});
  },

	goUpperLevel: function(uri) {
		if (uri.schemeIs("about")) {
			return uri;
		}
		let path = uri.spec.slice(uri.prePath.length)
		if (path == "/") {
			if (/:\/\/[^\.]+\.([^\.]+)\./.test(uri.prePath))
      return Services.io.newURI(RegExp.leftContext + "://" + RegExp.$1 + "." + RegExp.rightContext);
		}
		let pathList = path.split("/");
		if (!pathList.pop())
			pathList.pop();
		return Services.io.newURI(uri.prePath + pathList.join("/"));
	},

  observe(aSubject, aTopic, aPrefstring) {
    if (aTopic == 'nsPref:changed') {
      // 設定が変更された時の処理
      setTimeout(() => {this.searchBarMenu();}, 0);
    }
  },

  handleEvent: function(event){
    switch (event.type) {
      case "aftercustomization":
        this.searchBarMenu();
        break;
      case 'unload':
        this.uninit();
        break;
    }
  }
}


// We should only start the redirection if the browser window has finished
// starting up. Otherwise, we should wait until the startup is done.
if (gBrowserInit.delayedStartupFinished) {
  addSiteSearchParam.init();
} else {
  let delayedStartupFinished = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" &&
        subject == window) {
      Services.obs.removeObserver(delayedStartupFinished, topic);
      addSiteSearchParam.init();
    }
  };
  Services.obs.addObserver(delayedStartupFinished,
                           "browser-delayed-startup-finished");
}
