// ==UserScript==
// @name           moveDownloads2History.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    move Donloads to History(New Downloads Viewに溜まったものを履歴だけにする)
// @include        main
// @compatibility  Firefox 20
// @author         Alice0775
// @version        2013/12/02 00:00 
// @version        2012/12/31 00:00 
// @version        2012/12/29 00:00 
// ==/UserScript==
var moveDownloads2History = {
  get db()
  {
    delete this.db;
    // Firefox 3.1 provides a way to get directly at the database
    return this.db = Components.classes["@mozilla.org/browser/nav-history-service;1"].
                       getService(Components.interfaces.nsPIPlacesDatabase).DBConnection;
  },

  clearDownloads: function() {
    this.moveDownloads2History(0);
    try {
      Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager).cleanUp();
    } catch(ex){}
  },

  moveDownloads2History: function(d) {
    var db = this.db;
    var sql = "UPDATE moz_historyvisits SET visit_type = 1 WHERE visit_type = 7";
    if (d > 0)
      sql += " AND visit_date <= :date";
    var statement = db.createStatement(sql);
    try {
      if (d > 0)
        statement.params.date = (new Date()).getTime()*1000 - d*24*3600*1000000;
      statement.execute();
    } catch(ex){
    } finally {
      statement.reset();
    }
  },

   delayedInit: function(d) {
    this.moveDownloads2History(d);
  },

  timer: null,
  init: function() {
    const MAXDATE = 0; // MAXDATE間のリストはNew Downloads Viewに残してやる
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator("navigator:browser");
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.moveDownloads2History.timer)
        win.clearTimeout(win.moveDownloads2History.timer);
    }

    if (this.timer)
      clearTimeout(this.timer);
    this.timer = setTimeout(function(that){that.delayedInit(MAXDATE);}, 1000, this);

    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
          <menupopup  id="menu_ToolsPopup"> \
                <menuitem \
                  insertbefore="menu_openDownloads" \
                  label="Clear Downloads" \
                  accesskey="C" \
                  oncommand="moveDownloads2History.clearDownloads();" /> \
          </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, null);
  }
}
moveDownloads2History.init();
