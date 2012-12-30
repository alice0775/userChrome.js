// ==UserScript==
// @name           moveDonloads2History.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    move Donloads to History(New Downloads Viewに溜まったものを履歴だけにする)
// @include        main
// @compatibility  Firefox 20
// @author         Alice0775
// @version        2012/12/31 00:00 
// @version        2012/12/29 00:00 
// ==/UserScript==
var moveDonloads2History = {
  get db()
  {
    delete this.db;
    // Firefox 3.1 provides a way to get directly at the database
    return this.db = Components.classes["@mozilla.org/browser/nav-history-service;1"].
                       getService(Components.interfaces.nsPIPlacesDatabase).DBConnection;
  },

   init: function() {
    const MAXDATE = 1; // MAXDATE間のリストはNew Downloads Viewに残してやる
    var db = this.db;
    var sql = "UPDATE moz_historyvisits SET visit_type = 1 WHERE visit_type = 7 AND visit_date < :date";
    var statement = db.createStatement(sql);
    try {
      statement.params.date = (new Date()).getTime()*1000 - MAXDATE*24*3600*1000000;
      statement.execute();
    } catch(ex){
    } finally {
      statement.reset();
    }
  },

  timer: null,
  delayedInit: function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator("navigator:browser");
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.moveDonloads2History.timer)
        clearTimeout(win.moveDonloads2History.timer);
    }

    if (this.timer)
      clearTimeout(this.timer);
    this.timer = setTimeout(function(that){that.init();}, 1000, this);
  }
}
moveDonloads2History.delayedInit();