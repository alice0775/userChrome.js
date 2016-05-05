// ==UserScript==
// @name           Scroll Search Engines
// @namespace      http://amb.vis.ne.jp/mozilla/
// @description    Change the selected search engine by scroll wheel on 'Search xxx for yyy' menu and do search by middle-clicking the menu.And Bug 436265 - The "default" search engine is always used in the context menu (or Ctrl/Cmd+K) when the search bar is hidden (auto-hidden by full screen or customized.
// @include        main
// @compatibility  Firefox 4.0
// @author         Gomita
// @permalink      http://amb.vis.ne.jp/mozilla/?p=71
// @contributor    Alice0775
// @Note           http://space.geocities.yahoo.co.jp/gl/alice0775
// @version        2016/05/04 02:00 ignore one off....
// @version        2013/02/09 22:00 Bug 565717
// @version        2013/01/16 12:00 Bug 831008 Disable Mutation Events in chrome/XUL
// @version        2011/03/11 10:00 ellips and update in fullscreen and fix Bug641090 by alice0775
// ==/UserScript==
var scrollSearchEngines = {
  handleEvent: function(event) {
    switch(event.type) {
			case "popupshowing":
			  this.contextMenuPopupshowing(event);
        break;
      case "DOMMouseScroll":
			  this.mouseScrollHandler(event);
        break;
      case "aftercustomization":
        this.customizeToolbarsDone(event);
        break;
      case "unload":
        this.uninit();
        break;
		}
  },

  get searchService() {
    delete this.searchService;
    return this.searchService =Components.classes["@mozilla.org/browser/search-service;1"]
                         .getService(Components.interfaces.nsIBrowserSearchService);
  },

  get searchBar() {
    return BrowserSearch.searchBar;
  },
  
  get searchMenu() {
    delete this.searchMenu;
    return this.searchMenu = document.getElementById("context-searchselect");
  },

  init: function() {
    if (this.searchBar) {
      // enable to change search engine by mouse-wheel on engine button
      try {
        document.getAnonymousElementByAttribute(this.searchBar, "anonid", "searchbar-engine-button")
          .addEventListener("DOMMouseScroll", this, false);
      } catch(ex) {}
    }
    if(this.searchMenu) {
      // enables to change search engine by mouse-wheel on context menu
      this.searchMenu.addEventListener("DOMMouseScroll", this, false);
      // ready to show icon in search menu
      this.searchMenu.className = "menuitem-iconic";
    }
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this, false);
    window.addEventListener("aftercustomization", this, false);

    if(this.searchMenu) {
      this.searchMenu.setAttribute("onclick", "scrollSearchEngines.menuClick(event);");
      this.searchMenu.setAttribute("oncommand", "this.loadSearch(getBrowserSelection(), true, this.engine);");
      this.searchMenu.loadSearch = function(searchText, useNewTab, engine) {
        var ss = Cc["@mozilla.org/browser/search-service;1"].
                 getService(Ci.nsIBrowserSearchService);
        if (typeof engine == "undefined"){
          // If the search bar is visible, use the current engine, otherwise, fall
          // back to the default engine.
          //if (isElementVisible(this.searchBar))
            engine = ss.currentEngine;
          //else
          //  engine = ss.defaultEngine;
        }
        var submission = engine.getSubmission(searchText, null); // HTML response

        // getSubmission can return null if the engine doesn't have a URL
        // with a text/html response type.  This is unlikely (since
        // SearchService._addEngineToStore() should fail for such an engine),
        // but let's be on the safe side.
        if (!submission)
          return;

        openLinkIn(submission.uri.spec,
                 useNewTab ? "tab" : "current",
                 { postData: submission.postData,
                   relatedToCurrent: true });
         return;
      }
    }
  },

  uninit: function() {
    if (this.searchBar) {
        // enable to change search engine by mouse-wheel on engine button
      document.getAnonymousElementByAttribute(this.searchBar, "anonid", "searchbar-engine-button")
          .removeEventListener("DOMMouseScroll", this, false);
    }
    if(this.searchMenu) {
      // enables to change search engine by mouse-wheel on context menu
      this.searchMenu.removeEventListener("DOMMouseScroll", this, false);
    }
    document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
    window.removeEventListener("aftercustomization", this, false);
  },

  customizeToolbarsDone: function(event) {
    if (event.attrName == "disabled" && !event.newValue){
      if(this.searchBar)
        document.getAnonymousElementByAttribute(this.searchBar, "anonid", "searchbar-engine-button")
                .addEventListener("DOMMouseScroll", this, false);
    }
  },

  index: null,
  timer: null,
  
  mouseScrollHandler: function(event) {
    var engineName, flg;
    var engines = this.searchService.getVisibleEngines({ });
    // make sure that search bar is visible
    //if (!searchBar)
    //    return;
    event.stopPropagation();
    // Find the new index
    if(!this.index)
       this.index = engines.indexOf(this.searchService.currentEngine);
    // change search engine
    var i = this.index;
    if(event.detail > 0){
      do{
        i = i + 1;
        if(i >= engines.length) {
          i= this.index;
          break;
        }
        engineName = engines[i].name;
        flg = engineName.match(/-{2,}|\u2015{2,}/)
              || (engineName.match(/^{/) && !engineName.match(/}/))
              || (engineName.match(/}/)  && !engineName.match(/{/))
      }while(flg)
    }else{
      do{
        i = i - 1;
        if(i < 0 ) {
          i= this.index;
          break;
        }
        engineName = engines[i].name;
        flg = engineName.match(/-{2,}|\u2015{2,}/)
              || (engineName.match(/^{/) && !engineName.match(/}/))
              || (engineName.match(/}/)  && !engineName.match(/{/))
      }while(flg)
    }
    this.index = i;
    if(!gContextMenu){
      this.searchService.currentEngine = engines[i];  //指示されたエンジンにする
      return;
    }
    // update context menu label
    if(this.timer) clearTimeout(this.timer);
    engineName = engines[i].name;

    var selectedText = this.getSearchTextForLabel();
    if (!selectedText)
      return false;

    // xxxx Bug 565717
    try {
      var label = gNavigatorBundle.getFormattedString("contextMenuSearchText", [engineName, selectedText]);
    } catch(e) {
      var label = gNavigatorBundle.getFormattedString("contextMenuSearch", [engineName, selectedText]);
    }
    var menuitem = event.originalTarget;
    menuitem.engine = engines[i];
    menuitem.setAttribute("label", label);
    // update context menu icon
    this.timer = setTimeout(function(){
      var iconURI = menuitem.engine.iconURI;
      if (iconURI)
          menuitem.setAttribute("src", iconURI.spec);
      else
          menuitem.removeAttribute("src");
    },100);
  },

  getSearchTextForLabel: function() {
   var selectedText = getBrowserSelection(16);

   if (!selectedText)
     return false;

   if (selectedText.length > 15) {
     var ellipsis = "\u2026";
     try {
       var ellipsis = gPrefService.getComplexValue("intl.ellipsis",
                                   Components.interfaces.nsIPrefLocalizedString).data;
     } catch (e) { }
     selectedText = selectedText.substr(0,15) + ellipsis;
    }
    return selectedText;
  },

  contextMenuPopupshowing: function(event) {
    if(event.originalTarget != document.getElementById('contentAreaContextMenu'))
      return;

    var selectedText = this.getSearchTextForLabel();
    if (!selectedText)
      return false;
    // update context menu icon
    var menuitem = this.searchMenu;
    menuitem.engine = this.searchService.currentEngine;
    var iconURI = menuitem.engine.iconURI;
    if (iconURI)
        menuitem.setAttribute("src", iconURI.spec);
    else
        menuitem.removeAttribute("src");


    // format "Search <engine> for <selection>" string to show in menu
    // update icon
    var iconURI = menuitem.engine.iconURI;
    if (iconURI)
        menuitem.setAttribute("src", iconURI.spec);
    else
        menuitem.removeAttribute("src");

    // update label
    // xxxx Bug 565717
    try {
      var menuLabel = gNavigatorBundle.getFormattedString("contextMenuSearchText", [menuitem.engine.name, selectedText]);
    } catch(e) {
      var menuLabel = gNavigatorBundle.getFormattedString("contextMenuSearch", [menuitem.engine.name, selectedText]);
    }
                                                           
    menuitem.label = menuLabel;
    // xxxx Bug 565717
    try {
      menuitem.accessKey =
               gNavigatorBundle.getString("contextMenuSearchText.accesskey"); 
    } catch(e) {
      menuitem.accessKey =
               gNavigatorBundle.getString("contextMenuSearch.accesskey"); 
    }
  },

  menuClick: function(event) {
    if (event.button == 1) {
        this.searchMenu.loadSearch(getBrowserSelection(), true, this.searchMenu.engine);
        event.stopPropagation();
        event.originalTarget.parentNode.hidePopup();
    }
  }
};
scrollSearchEngines.init();
