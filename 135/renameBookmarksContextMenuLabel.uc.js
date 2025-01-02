// ==UserScript==
// @name          renameBookmarksContextMenuLabel.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   add undo menu in Bookmarks Context Menu
// @include       *
// @async          true
// @compatibility Firefox 91
// @author        alice0775
// @version       2022/06/06 00:00
// @version       2021/05/09 23:00
// ==/UserScript==
if (typeof window.renameBookmarksContextMenuLabel == "undefined") {
  window.renameBookmarksContextMenuLabel = {
    popup: null,

    handleEvent: function(event) {
      switch (event.type) {
        case 'unload':
          this.uninit();
          break;
        case 'popupshowing':
          this.popupshowing(event);
          break;
      }
    },

    init: function() {
      window.addEventListener('unload', this, false);
      this.popup = document.getElementById("placesContext");
      if (!this.popup)
        return;
      this.popup.addEventListener('popupshowing', this, false);
    },

    uninit: function() {
      window.removeEventListener('unload', this, false);
      if (!this.popup)
        return;
      this.popup.removeEventListener('popupshowing', this, false);
    },

    popupshowing: function(event){
      try {
      //document.getElementById("placesContext_deleteFolder").removeAttribute("data-l10n-id");
      //document.getElementById("placesContext_deleteBookmark").removeAttribute("data-l10n-id");
      //document.getElementById("placesContext_deleteFolder").label="Delete";
      //document.getElementById("placesContext_deleteFolder").accessKey="d";
      //document.getElementById("placesContext_deleteBookmark").label="Delete";
      //document.getElementById("placesContext_deleteBookmark").accessKey="d";
      document.getElementById("placesContext_show_folder:info").accessKey="e";
      document.getElementById("placesContext_show_bookmark:info").accessKey="e";


      this.popup.insertBefore(
                 document.getElementById("placesContext_sortBy:name"),
                 document.getElementById("placesContext_show_bookmark:info"));

      } catch(e) {}
    }
  }


  window.renameBookmarksContextMenuLabel.init();
}