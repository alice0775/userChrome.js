// ==UserScript==
// @name          showParentFolder.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Show Parent Folder
// @include       chrome://browser/content/places/places.xhtml
// @compatibility Firefox 139
// @sandbox       true
// @author        alice0775
// @version       2025/04/04 remove inline style
// @version       2025/04/04 revert the change of 01/24workaround
// @version       2025/04/02 fix working within sandbox
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
// @version       2020/09/04 
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

    let ordinal = Services.prefs.getStringPref('ucjs.showParentFolder.ordinal', "15");
    let width = Services.prefs.getStringPref('ucjs.showParentFolder.width', "100");

    let treecols = document.getElementById("placeContentColumns");
    let treecolpicker = treecols.querySelector("treecolpicker");
    let splitter = document.createXULElement("splitter");
    splitter.setAttribute("class", "tree-splitter");
    splitter.setAttribute("resizeafter", "farthest");
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
            var reverse = Services.prefs.getBoolPref('ucjs.showParentFolder.reverseFolderHierarchy', true);
            var showFolderHierarchy = Services.prefs.getBoolPref('ucjs.showParentFolder.showFolderHierarchy', false);
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

    Services.prefs.setStringPref('ucjs.showParentFolder.ordinal', ordinal);
    Services.prefs.setStringPref('ucjs.showParentFolder.width', width.toString());
    userChrome_js.debug("width="+width);
  }
}
showparentfolder.init();
