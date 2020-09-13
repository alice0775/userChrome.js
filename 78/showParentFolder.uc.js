// ==UserScript==
// @name          showParentFolder.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Show Parent Folder
// @include       chrome://browser/content/places/places.xhtml
// @compatibility Firefox 78
// @author        alice0775
// @version       2020/09/04 
// @note          ucjs.showParentFolder.showFolderHierarchy
// @note          ucjs.showParentFolder.reverseFolderHierarchy
// ==/UserScript==
  var showparentfolder = {
    
    init: function(){
      window.addEventListener('unload', showparentfolder.uninit,false);

      let xpref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefService);
      let ordinal = xpref.getStringPref('ucjs.showParentFolder.ordinal', "14");
      let width = xpref.getStringPref('ucjs.showParentFolder.width', "100");

      let treecols = document.getElementById("placeContentColumns");
      let treecolpicker = treecols.querySelector("treecolpicker");
      let splitter = document.createXULElement("splitter");
      splitter.setAttribute("class", "tree-splitter");
      splitter.setAttribute("resize", "after");
      let treecol = document.createXULElement("treecol");
      treecol.setAttribute("ordinal", ordinal);
      treecol.setAttribute("width", width);
      treecols.insertBefore(splitter, treecolpicker);
      treecols.insertBefore(treecol, treecolpicker);
      treecol.setAttribute("id", "placesContentParentFolder");
      treecol.setAttribute("anonid", "parentFolder");
      treecol.setAttribute("label", "Parent Folder");
      treecol.setAttribute("flex", "1");
      treecol.setAttribute("hidden", "false");
      treecol.setAttribute("persist", "width hidden ordinal");
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
              var parentFolderId = bmsvc.getFolderIdForItem(rowId);
              var folderTitle = bmsvc.getItemTitle(parentFolderId);
              if (this.getLocalizedTitle2(folderTitle + "_____"))
                folderTitle = this.getLocalizedTitle2(folderTitle + "_____")
              var xpref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefService);
              var reverse = xpref.getBoolPref('ucjs.showParentFolder.reverseFolderHierarchy', true);
              var showFolderHierarchy = xpref.getBoolPref('ucjs.showParentFolder.showFolderHierarchy', false);
              if (showFolderHierarchy){
                while (FolderId = bmsvc.getFolderIdForItem(parentFolderId)){
                  if (FolderId == parentFolderId)
                    break;
                  parentFolderId = FolderId;
                  var text = bmsvc.getItemTitle(parentFolderId);
                  if (this.getLocalizedTitle2(text + "_____"))
                    text = this.getLocalizedTitle2(text + "_____")

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
      ' \
      switch (this._getColumnType(aColumn)) { \
        case this.COLUMN_TYPE_PARENTFOLDER: \
          return; \
      '
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

    uninit: function(){
      window.removeEventListener("unload",showparentfolder.uninit,false);
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
