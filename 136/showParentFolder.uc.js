// ==UserScript==
// @name          showParentFolder.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Show Parent Folder
// @include       chrome://browser/content/places/places.xhtml
// @compatibility Firefox 136
// @author        alice0775
// @version       2025/01/24 Workaround for `blocking Function()` and remove inline style
// @version       2023/06/18 null check node.parent
// @version       2023/03/10 Bug 1820534 - Move front-end to modern flexbox.
// @version       2023/03/10 fix column ordinal / -moz-box-ordinal-group
// @version       2023/01/10 Bug 1382992 - Remove the synchronous getFolderIdForItem()
// @version       2023/01/8  Bug 1820634 - Remove nsTreeColFrame
// @version       2023/01/10 Bug 1382992 - Remove the synchronous getFolderIdForItem()
// @version       2021/05/18 22:00 fix splitter ordinal 
// @version       2021/02/09 20:00 Rewrite `X.setAttribute("hidden", Y)` to `X.hidden = Y`
// @version       2020/09/14 
// @version       2020/09/13 
// @version       2020/09/04 Bug 469421
// @note          ucjs.showParentFolder.showFolderHierarchy
// @note          ucjs.showParentFolder.reverseFolderHierarchy
// @note          Sort column is not implemented.
// ==/UserScript==
// todo: rewrite using PlacesUtils.bookmarks.fetch


var showparentfolder = {
  db: null,
  
  init: function() {
    window.addEventListener('unload', showparentfolder.uninit,false);
    this.db = this.openDB();

    let xpref = Components.classes['@mozilla.org/preferences-service;1']
                .getService(Components.interfaces.nsIPrefService);
    let ordinal = xpref.getStringPref('ucjs.showParentFolder.ordinal', "15");
    let width = xpref.getStringPref('ucjs.showParentFolder.width', "100");

    let treecols = document.getElementById("placeContentColumns");
    let treecolpicker = treecols.querySelector("treecolpicker");
    let splitter = document.createXULElement("splitter");
    splitter.setAttribute("class", "tree-splitter");
    splitter.setAttribute("resizeafter", "farthest");
    //splitter.setAttribute("style", "/*-moz-box-ordinal-group: 14;*/ order: " + (ordinal - 1) + ";"); /*Bug 1820534*/
    splitter.style.setProperty("order", (ordinal - 1), "");
    splitter.setAttribute("ordinal", (ordinal - 1));
    let treecol = document.createXULElement("treecol");
    treecol.setAttribute("ordinal", ordinal);
    treecol.setAttribute("width", width);
    //treecol.setAttribute("flex", "1");/*Bug 1820534*/
    treecol.style.setProperty("flex", "4 auto", "");
    //treecol.style.setProperty("width", width+"px", "");
    treecol.style.setProperty("order", ordinal, "");
    treecols.insertBefore(splitter, treecolpicker);
    treecols.insertBefore(treecol, treecolpicker);
    treecol.setAttribute("id", "placesContentParentFolder");
    treecol.setAttribute("anonid", "parentFolder");
    treecol.setAttribute("label", "Parent Folder");
    treecol.firstChild.setAttribute("value", "Parent Folder");
    treecol.hidden = false;
    treecol.setAttribute("persist", "width hidden ordinal sortActive sortDirection");
    //Bug 196509  Search for bookmark should show parent folder
    PlacesTreeView.prototype.COLUMN_TYPE_PARENTFOLDER = 999;
    let l = treecols.childNodes.length;
    for (let i = 0; i < 13 ;i++) {
      let elm = treecols.childNodes[i];
      let o = parseInt(elm.getAttribute("ordinal"));
      if (o >= ordinal -1) {
        elm.setAttribute("ordinal", o + 2);
        elm.style.setProperty("order", o + 2, "");
      }
    }

    var func = PlacesTreeView.prototype._getColumnType.toString();
    func = func.replace(
    'return this.COLUMN_TYPE_TAGS;',
    'return this.COLUMN_TYPE_TAGS;case "parentFolder":return this.COLUMN_TYPE_PARENTFOLDER;'
    );
    //Services.console.logStringMessage(func);
    PlacesTreeView.prototype._getColumnType = function PTV__getColumnType(aColumn) {
      let columnType = aColumn.element.getAttribute("anonid") || aColumn.id;

      switch (columnType) {
        case "title":
          return this.COLUMN_TYPE_TITLE;
        case "url":
          return this.COLUMN_TYPE_URI;
        case "date":
          return this.COLUMN_TYPE_DATE;
        case "visitCount":
          return this.COLUMN_TYPE_VISITCOUNT;
        case "dateAdded":
          return this.COLUMN_TYPE_DATEADDED;
        case "lastModified":
          return this.COLUMN_TYPE_LASTMODIFIED;
        case "tags":
          return this.COLUMN_TYPE_TAGS;case "parentFolder":return this.COLUMN_TYPE_PARENTFOLDER;
      }
      return this.COLUMN_TYPE_UNKNOWN;
    }
/*    PlacesTreeView.prototype._getColumnType = new Function(
           func.match(/\(([^)]*)/)[1],
           func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
    );
*/

    func = PlacesTreeView.prototype.getCellText.toString();
    func = func.replace(
    "switch (this._getColumnType(aColumn)) {",
    `
    switch (this._getColumnType(aColumn)) {
      case this.COLUMN_TYPE_PARENTFOLDER:
          if (node.parent && PlacesUtils.nodeIsQuery(node.parent) &&
               PlacesUtils.asQuery(node.parent).queryOptions.queryType ==
                Ci.nsINavHistoryQueryOptions.QUERY_TYPE_HISTORY &&
               node.uri )
            return '';
          var bmsvc = PlacesUtils.bookmarks;
          var rowId = node.itemId;
          try {
            var FolderId;
            var parentFolderId = showparentfolder.getFolderIdForItem(rowId);
            //  Services.console.logStringMessage(parentFolderId);
            var folderTitle = bmsvc.getItemTitle(parentFolderId);
            var txt = (folderTitle + "____________").substr(0, 12);
            if (this.getLocalizedTitle2(txt))
              folderTitle = this.getLocalizedTitle2(txt)
            var xpref = Components.classes['@mozilla.org/preferences-service;1']
                .getService(Components.interfaces.nsIPrefService);
            var reverse = xpref.getBoolPref('ucjs.showParentFolder.reverseFolderHierarchy', true);
            var showFolderHierarchy = xpref.getBoolPref('ucjs.showParentFolder.showFolderHierarchy', false);
            if (showFolderHierarchy){

              while (FolderId = showparentfolder.getFolderIdForItem(parentFolderId)){
                if (FolderId == parentFolderId)
                  break;
                parentFolderId = FolderId;
                var text = bmsvc.getItemTitle(parentFolderId);
                var txt = (text + "____________").substr(0, 12);
                if (this.getLocalizedTitle2(txt))
                  text = this.getLocalizedTitle2(txt)

                if (!text)
                  break;
                if (!reverse)
                  folderTitle = text + ' /'+ folderTitle;
                else
                  folderTitle = folderTitle + '<'+ text;
              }
              folderTitle = folderTitle.replace(/^\s/,'');
            }
          } catch(ex) {
            var folderTitle = '';
          }
          return folderTitle;
    `
    );
    //Services.console.logStringMessage(func);

    PlacesTreeView.prototype.getCellText = function PTV_getCellText(aRow, aColumn) {
        let node = this._getNodeForRow(aRow);
        
        switch (this._getColumnType(aColumn)) {
          case this.COLUMN_TYPE_PARENTFOLDER:
              if (node.parent && PlacesUtils.nodeIsQuery(node.parent) &&
                   PlacesUtils.asQuery(node.parent).queryOptions.queryType ==
                    Ci.nsINavHistoryQueryOptions.QUERY_TYPE_HISTORY &&
                   node.uri )
                return '';
              var bmsvc = PlacesUtils.bookmarks;
              var rowId = node.itemId;
              try {
                var FolderId;
                var parentFolderId = showparentfolder.getFolderIdForItem(rowId);
                //  Services.console.logStringMessage(parentFolderId);
                var folderTitle = bmsvc.getItemTitle(parentFolderId);
                var txt = (folderTitle + "____________").substr(0, 12);
                if (this.getLocalizedTitle2(txt))
                  folderTitle = this.getLocalizedTitle2(txt)
                var xpref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefService);
                var reverse = xpref.getBoolPref('ucjs.showParentFolder.reverseFolderHierarchy', true);
                var showFolderHierarchy = xpref.getBoolPref('ucjs.showParentFolder.showFolderHierarchy', false);
                if (showFolderHierarchy){

                  while (FolderId = showparentfolder.getFolderIdForItem(parentFolderId)){
                    if (FolderId == parentFolderId)
                      break;
                    parentFolderId = FolderId;
                    var text = bmsvc.getItemTitle(parentFolderId);
                    var txt = (text + "____________").substr(0, 12);
                    if (this.getLocalizedTitle2(txt))
                      text = this.getLocalizedTitle2(txt)

                    if (!text)
                      break;
                    if (!reverse)
                      folderTitle = text + ' /'+ folderTitle;
                    else
                      folderTitle = folderTitle + '<'+ text;
                  }
                  folderTitle = folderTitle.replace(/^s/,'');
                }
              } catch(ex) {
                var folderTitle = '';
              }
              return folderTitle;
        
          case this.COLUMN_TYPE_TITLE:
            // normally, this is just the title, but we don't want empty items in
            // the tree view so return a special string if the title is empty.
            // Do it here so that callers can still get at the 0 length title
            // if they go through the "result" API.
            if (PlacesUtils.nodeIsSeparator(node)) {
              return "";
            }
            return PlacesUIUtils.getBestTitle(node, true);
          case this.COLUMN_TYPE_TAGS:
            return node.tags?.replace(",", ", ");
          case this.COLUMN_TYPE_URI:
            if (PlacesUtils.nodeIsURI(node)) {
              return node.uri;
            }
            return "";
          case this.COLUMN_TYPE_DATE:
            let nodeTime = node.time;
            if (nodeTime == 0 || !PlacesUtils.nodeIsURI(node)) {
              // hosts and days shouldn't have a value for the date column.
              // Actually, you could argue this point, but looking at the
              // results, seeing the most recently visited date is not what
              // I expect, and gives me no information I know how to use.
              // Only show this for URI-based items.
              return "";
            }

            return this._convertPRTimeToString(nodeTime);
          case this.COLUMN_TYPE_VISITCOUNT:
            return node.accessCount;
          case this.COLUMN_TYPE_DATEADDED:
            if (node.dateAdded) {
              return this._convertPRTimeToString(node.dateAdded);
            }
            return "";
          case this.COLUMN_TYPE_LASTMODIFIED:
            if (node.lastModified) {
              return this._convertPRTimeToString(node.lastModified);
            }
            return "";
        }
        return "";
      }
/*    PlacesTreeView.prototype.getCellText = new Function(
         func.match(/\((.*)\)\s*\{/)[1],
         func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
    );
*/

    //xxx Parentfolder column sort will do nothing.
    func = PlacesTreeView.prototype.cycleHeader.toString();
    func = func.replace(
    'switch (this._getColumnType(aColumn)) {',
    `
    switch (this._getColumnType(aColumn)) {
      case this.COLUMN_TYPE_PARENTFOLDER:
      if (oldSort == 23 /*ASCENDING*/) {
        newSort = 24 /*DESCENDING*/;
      } else if (allowTriState && oldSort == 24/*DESCENDING*/) {
        newSort = 0 /*NONE*/;
      } else {
        newSort = 23 /*ASCENDING*/;
      }
      return;
    `
    );
    //Services.console.logStringMessage(func);
    PlacesTreeView.prototype.cycleHeader = function PTV_cycleHeader(aColumn) {
        if (!this._result) {
          throw Components.Exception("", Cr.NS_ERROR_UNEXPECTED);
        }

        // Sometimes you want a tri-state sorting, and sometimes you don't. This
        // rule allows tri-state sorting when the root node is a folder. This will
        // catch the most common cases. When you are looking at folders, you want
        // the third state to reset the sorting to the natural bookmark order. When
        // you are looking at history, that third state has no meaning so we try
        // to disallow it.
        //
        // The problem occurs when you have a query that results in bookmark
        // folders. One example of this is the subscriptions view. In these cases,
        // this rule doesn't allow you to sort those sub-folders by their natural
        // order.
        let allowTriState = PlacesUtils.nodeIsFolderOrShortcut(this._result.root);

        let oldSort = this._result.sortingMode;
        let newSort;
        const NHQO = Ci.nsINavHistoryQueryOptions;
        
        switch (this._getColumnType(aColumn)) {
          case this.COLUMN_TYPE_PARENTFOLDER:
          if (oldSort == 23 /*ASCENDING*/) {
            newSort = 24 /*DESCENDING*/;
          } else if (allowTriState && oldSort == 24/*DESCENDING*/) {
            newSort = 0 /*NONE*/;
          } else {
            newSort = 23 /*ASCENDING*/;
          }
          return;
        
          case this.COLUMN_TYPE_TITLE:
            if (oldSort == NHQO.SORT_BY_TITLE_ASCENDING) {
              newSort = NHQO.SORT_BY_TITLE_DESCENDING;
            } else if (allowTriState && oldSort == NHQO.SORT_BY_TITLE_DESCENDING) {
              newSort = NHQO.SORT_BY_NONE;
            } else {
              newSort = NHQO.SORT_BY_TITLE_ASCENDING;
            }

            break;
          case this.COLUMN_TYPE_URI:
            if (oldSort == NHQO.SORT_BY_URI_ASCENDING) {
              newSort = NHQO.SORT_BY_URI_DESCENDING;
            } else if (allowTriState && oldSort == NHQO.SORT_BY_URI_DESCENDING) {
              newSort = NHQO.SORT_BY_NONE;
            } else {
              newSort = NHQO.SORT_BY_URI_ASCENDING;
            }

            break;
          case this.COLUMN_TYPE_DATE:
            if (oldSort == NHQO.SORT_BY_DATE_ASCENDING) {
              newSort = NHQO.SORT_BY_DATE_DESCENDING;
            } else if (allowTriState && oldSort == NHQO.SORT_BY_DATE_DESCENDING) {
              newSort = NHQO.SORT_BY_NONE;
            } else {
              newSort = NHQO.SORT_BY_DATE_ASCENDING;
            }

            break;
          case this.COLUMN_TYPE_VISITCOUNT:
            // visit count default is unusual because we sort by descending
            // by default because you are most likely to be looking for
            // highly visited sites when you click it
            if (oldSort == NHQO.SORT_BY_VISITCOUNT_DESCENDING) {
              newSort = NHQO.SORT_BY_VISITCOUNT_ASCENDING;
            } else if (
              allowTriState &&
              oldSort == NHQO.SORT_BY_VISITCOUNT_ASCENDING
            ) {
              newSort = NHQO.SORT_BY_NONE;
            } else {
              newSort = NHQO.SORT_BY_VISITCOUNT_DESCENDING;
            }

            break;
          case this.COLUMN_TYPE_DATEADDED:
            if (oldSort == NHQO.SORT_BY_DATEADDED_ASCENDING) {
              newSort = NHQO.SORT_BY_DATEADDED_DESCENDING;
            } else if (
              allowTriState &&
              oldSort == NHQO.SORT_BY_DATEADDED_DESCENDING
            ) {
              newSort = NHQO.SORT_BY_NONE;
            } else {
              newSort = NHQO.SORT_BY_DATEADDED_ASCENDING;
            }

            break;
          case this.COLUMN_TYPE_LASTMODIFIED:
            if (oldSort == NHQO.SORT_BY_LASTMODIFIED_ASCENDING) {
              newSort = NHQO.SORT_BY_LASTMODIFIED_DESCENDING;
            } else if (
              allowTriState &&
              oldSort == NHQO.SORT_BY_LASTMODIFIED_DESCENDING
            ) {
              newSort = NHQO.SORT_BY_NONE;
            } else {
              newSort = NHQO.SORT_BY_LASTMODIFIED_ASCENDING;
            }

            break;
          case this.COLUMN_TYPE_TAGS:
            if (oldSort == NHQO.SORT_BY_TAGS_ASCENDING) {
              newSort = NHQO.SORT_BY_TAGS_DESCENDING;
            } else if (allowTriState && oldSort == NHQO.SORT_BY_TAGS_DESCENDING) {
              newSort = NHQO.SORT_BY_NONE;
            } else {
              newSort = NHQO.SORT_BY_TAGS_ASCENDING;
            }

            break;
          default:
            throw Components.Exception("", Cr.NS_ERROR_INVALID_ARG);
        }
        this._result.sortingMode = newSort;
      }
/*
    PlacesTreeView.prototype.cycleHeader = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
    );
*/

    PlacesTreeView.prototype.getLocalizedTitle2 = function(guid) {
      switch (guid) {
        case PlacesUtils.bookmarks.toolbarGuid:
          return PlacesUtils.getString("BookmarksToolbarFolderTitle");
        case PlacesUtils.bookmarks.menuGuid:
          return PlacesUtils.getString("BookmarksMenuFolderTitle");
        case PlacesUtils.bookmarks.unfiledGuid:
          return PlacesUtils.getString("OtherBookmarksFolderTitle");
        case PlacesUtils.bookmarks.mobileGuid:
          return PlacesUtils.getString("MobileBookmarksFolderTitle");
        default:
          return null;
      }
    }
  },

  getFolderIdForItem: function(aItemId) {
    let sql = `SELECT b.id, h.url, b.title, b.position, b.fk, b.parent AS folderId, b.type, 
               b.dateAdded, b.lastModified, b.guid, t.guid, t.parent, 
               b.syncStatus 
               FROM moz_bookmarks b 
               LEFT JOIN moz_bookmarks t ON t.id = b.parent 
               LEFT JOIN moz_places h ON h.id = b.fk 
               WHERE b.id = :item_id`;
    let stmt = this.db.createStatement(sql);
    stmt.params['item_id'] = aItemId;
    let FolderId = null;
    try {
      while (stmt.executeStep()) {
        FolderId = stmt.row.folderId;
      }
    } finally {
      stmt.finalize();
    }
    return FolderId;
  },

  openDB: function() {
    /*
    let targetPath = PathUtils.join(
      PathUtils.profileDir,
      "places.sqlite"
    );
    let file = new FileUtils.File(targetPath);
    return Services.storage.openDatabase(file);
    */
    return PlacesUtils.history.DBConnection;
  },

  uninit: function(){
    window.removeEventListener("unload",showparentfolder.uninit,false);
    //this.db.close();
    let treecol = document.getElementById("placesContentParentFolder");
    let ordinal = treecol.getAttribute("ordinal");
    let width = treecol.getAttribute("width");
    let xpref = Components.classes['@mozilla.org/preferences-service;1']
                .getService(Components.interfaces.nsIPrefService);
    xpref.setStringPref('ucjs.showParentFolder.ordinal', ordinal);
    xpref.setStringPref('ucjs.showParentFolder.width', width.toString());
    userChrome_js.debug("width="+width);
  }
}
showparentfolder.init();
