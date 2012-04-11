// ==UserScript==
// @name           contextPopupBookmarksFolder_Fx37.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    任意のブックマークフォルダをコンテキストメニューやホットメニューに表示
// @include        main
// @compatibility  Firefox 3.7 13 14
// @author         Alice0775
// @version        2012/04/11 12:00 Bug 739451 Don't rely on XPConnect-magic for getting the owner window of a places view
// @version        2012/03/05 12:00 remove deprecated code(PlacesUtils.nodeIsLivemarkItem)
// @version        2010/04/17 23:00 後処理追加
// @version        2009/01/15 21:20
// @Note           Sub-Script/Overlay Loader v3.0.20mod
// @Note           マウスジェスチャ等から使う場合は, contextPopupBookmarksFolder.showHotMenu(event.target, event.screenX, event.screenY);
// ==/UserScript==
var contextPopupBookmarksFolder = {
  // -- config --
  // place:folder=BOOKMARKS_MENU, place:type=6&sort=14,
  // place:terms=ヤフ&folder=BOOKMARKS_MENU&folder=TOOLBAR&folder=UNFILED_BOOKMARKS&type=7&queryType=1 とか
  // (expandQueriesやexcludeItemsは扱いSPEC留意)
  //ブックマークに登録済みのフォルダの名称(最初に見つかったものになる) "" の場合はkPLACE_QUERYで直接指定
  kPLACE_FolderName: "ブックマークレット",
  //kPLACE_FolderNameが""の場合はこちらを使う idは Patch For LibraryやSQLite Manager等で調べる(この方法の場合はidが変わることあるのでその点留意)
  kPLACE_QUERY     : "place:folder=1",
  //メニューの表示ラベル(任意の文字列)
  kPLACE_LABEL     : "Popup Tag",
  //コンテキストメニューのこのIDの次のところにメニューが挿入される
  kINSERTPOINT     : "context-back",
  // -- config --
  //about:configでも kPLACE_FolderName または kPLACE_QUERY を設定できる
  PREF: 'userChrome.contextPopupBookmarksFolder.PLACE_QUERY',

  init: function() {
    var overlay =
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
               xmlns:html="http://www.w3.org/1999/xhtml">
        <menupopup id="contentAreaContextMenu">
          <menu id="contextPopupBookmarksFolderMenu"
                insertafter={ this.kINSERTPOINT }
                label={ this.kPLACE_LABEL } >
            <menupopup  id="contextPopupBookmarksFolderPopup"
                        context="placesContext"
                        openInTabs="children"
                        oncommand="BookmarksEventHandler.onCommand(event, this.parentNode._placesView);"
                        onclick="if(event.button==2){event.preventDefault();event.stopPropagation();}else BookmarksEventHandler.onClick(event, this.parentNode._placesView);"
                        onpopupshowing="if (!document.getElementById('contextPopupBookmarksFolderMenu')._placesView) new PlacesMenu(event, '{ this.kPLACE_QUERY }');"/>
          </menu>
        </menupopup>

        <popupset id="mainPopupSet">
          <menupopup  id="contextPopupBookmarksFolderhotMenuPopup"
                      context="placesContext"
                      openInTabs="children"
                      oncommand="BookmarksEventHandler.onCommand(event, this.parentNode._placesView);"
                      onclick="if(event.button==2){event.preventDefault();event.stopPropagation();}else BookmarksEventHandler.onClick(event, this.parentNode._placesView);"
                      onpopupshowing="if (!document.getElementById('contextPopupBookmarksFolderhotMenuPopup')._placesView) new PlacesMenu(event, '{ this.kPLACE_QUERY }');"/>
        </popupset>
      </overlay>;
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay.toXMLString());
    window.userChrome_js.loadOverlay(overlay, contextPopupBookmarksFolder);
  },

  observe: function(){
    window.addEventListener("unload", this, false);
    this.addPrefListener(this.PrefListener); // 登録処理
    this.initPref();
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    this.removePrefListener(this.PrefListener); // 解除処理
  },

  initPref: function() {
    var place;
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    this.kPLACE_QUERY = this.getPref(this.PREF, 'str', this.kPLACE_QUERY);
    if (/^place:/.test(this.kPLACE_QUERY) && !this.kPLACE_FolderName) {
      try {place = UI.ConvertToUnicode(this.kPLACE_QUERY);}
      catch(e) {place = this.kPLACE_QUERY;}
    } else {
      this.kPLACE_FolderName = this.getPref(this.PREF, 'str', this.kPLACE_FolderName);

      try {var id = this.getFolderId(1, UI.ConvertToUnicode(this.kPLACE_FolderName));}
      catch(e) {id = this.getFolderId(1, this.kPLACE_FolderName);}
      if (!id)
        return;
      place = "place:folder="+id;
    }

    var bm = document.getElementById("contextPopupBookmarksFolderPopup");
    if (bm) {
      bm.setAttribute('onpopupshowing', "if (!document.getElementById('contextPopupBookmarksFolderMenu')._placesView) new PlacesMenu(event, '" + place + "');");
    }

    bm = document.getElementById("contextPopupBookmarksFolderhotMenuPopup");
    if (bm) {
      bm.setAttribute('onpopupshowing', "if (!document.getElementById('contextPopupBookmarksFolderhotMenuPopup')._placesView) new PlacesMenu(event, '" + place + "');");
    }
  },

  getFolderId : function(aItemId, folderName){
    var rootNode = PlacesUtils.getFolderContents(aItemId).root;
    for (var i = 0; i < rootNode.childCount; i++) {
      var node = rootNode.getChild(i);
      if (node.type == 5 || node.type == 6){
        if (node.title == folderName){
          return node.itemId;
        }else
        if (PlacesUtils.nodeIsFolder(node)
           && !PlacesUtils.annotations.itemHasAnnotation(node.itemId, PlacesUtils.LMANNO_FEEDURI)){
          var hoge = arguments.callee(node.itemId, folderName);
          if (hoge)
            return hoge;
        }
      }
    }
    return null;
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case 'unload':
        this.uninit();
        break;
    }
  },

  showHotMenu: function(node, x, y){
    popup = document.getElementById("contextPopupBookmarksFolderhotMenuPopup");
    setTimeout(function(){popup.showPopup(getBrowser(), x+10, y+5, "context","bottomleft","topleft");},500);
  },

  //prefを読み込み
  getPref: function(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
        case 'str':
          return xpPref.getCharPref(aPrefString).toString(); break;
        case 'int':
          return xpPref.getIntPref(aPrefString); break;
        case 'bool':
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  },
//Thanks Piro.
  // 監視を開始する
  addPrefListener: function(aObserver) {
      try {
          var pbi = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch2);
          pbi.addObserver(aObserver.domain, aObserver, false);
      } catch(e) {}
  },

  // 監視を終了する
  removePrefListener: function(aObserver) {
      try {
          var pbi = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch2);
          pbi.removeObserver(aObserver.domain, aObserver);
      } catch(e) {}
  },

  PrefListener:{
      domain  : 'userChrome.contextPopupBookmarksFolder',
          //'userChrome.contextPopupBookmarksFolder.XXX'という名前の設定が変更された場合全てで処理を行う

      observe : function(aSubject, aTopic, aPrefstring) {
          if (aTopic == 'nsPref:changed') {
              // 設定が変更された時の処理
              contextPopupBookmarksFolder.initPref();
          }
      }
  }
};


contextPopupBookmarksFolder.init();
