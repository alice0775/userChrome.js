// ==UserScript==
// @name          showParentFolder.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Show Parent Folder
// @include       chrome://browser/content/places/places.xhtml
// @compatibility Firefox 110
// @author        alice0775
// @version       2023/01/8  Bug 1820634 - Remove nsTreeColFrame
// @version       2023/01/10 Bug 1382992 - Remove the synchronous getFolderIdForItem()
// @version       2021/05/18 22:00 fix splitter ordinal 
// @version       2021/02/09 20:00 Rewrite `X.setAttribute("hidden", Y)` to `X.hidden = Y`
// @version       2020/09/14 
// @version       2020/09/13 
// @version       2020/09/04 
// @note          ucjs.showParentFolder.showFolderHierarchy
// @note          ucjs.showParentFolder.reverseFolderHierarchy
// @note          Sort column is not implemented.
// ==/UserScript==
// todo: rewrite using PlacesUtils.bookmarks.fetch


  var showparentfolder = {
    
    init: function(){
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
      splitter.setAttribute("style", "-moz-box-ordinal-group: 14;");
      let treecol = document.createXULElement("treecol");
      treecol.setAttribute("ordinal", ordinal);
      treecol.setAttribute("width", width);
      treecols.insertBefore(splitter, treecolpicker);
      treecols.insertBefore(treecol, treecolpicker);
      treecol.setAttribute("id", "placesContentParentFolder");
      treecol.setAttribute("anonid", "parentFolder");
      treecol.setAttribute("label", "Parent Folder");
      treecol.setAttribute("flex", "1");
      treecol.firstChild.setAttribute("value", "Parent Folder");
      treecol.hidden = false;
      treecol.setAttribute("persist", "width hidden ordinal sortActive sortDirection");
      //Bug 196509  Search for bookmark should show parent folder
      PlacesTreeView.prototype.COLUMN_TYPE_PARENTFOLDER = 999;

      var func = PlacesTreeView.prototype._getColumnType.toString();
      func = func.replace(
      'return this.COLUMN_TYPE_TAGS;',
      'return this.COLUMN_TYPE_TAGS;case "parentFolder":return this.COLUMN_TYPE_PARENTFOLDER;'
      );
      PlacesTreeView.prototype._getColumnType = new Function(
             func.match(/\(([^)]*)/)[1],
             func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
      );
      //debug(PlacesTreeView.prototype._getColumnType.toString());

      func = PlacesTreeView.prototype.getCellText.toString();
      func = func.replace(
      "switch (this._getColumnType(aColumn)) {",
      `
      switch (this._getColumnType(aColumn)) {
        case this.COLUMN_TYPE_PARENTFOLDER:
            if (PlacesUtils.nodeIsQuery(node.parent) &&
                 PlacesUtils.asQuery(node.parent).queryOptions.queryType ==
                  Ci.nsINavHistoryQueryOptions.QUERY_TYPE_HISTORY &&
                 node.uri )
              return '';
            var bmsvc = PlacesUtils.bookmarks;
            var rowId = node.itemId;
            try {
              var FolderId;
              var parentFolderId = showparentfolder.getFolderIdForItem(rowId);
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
      PlacesTreeView.prototype.getCellText = new Function(
           func.match(/\((.*)\)\s*\{/)[1],
           func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, '')
      );
      //debug(PlacesTreeView.prototype.getCellText.toString());

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
      PlacesTreeView.prototype.cycleHeader = new Function(
           func.match(/\(([^)]*)/)[1],
           func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
      );
      //debug(PlacesTreeView.prototype.cycleHeader.toString());

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
