// ==UserScript==
// @name           vacuum.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    remove tab move animation
// @include        main
// @compatibility  Firefox29+
// @author         Alice0775
// @version        2014/06/07 20:30 async for Fx29
// ==/UserScript==
(function(){
  var menuitem = document.createElement("menuitem");
  menuitem.setAttribute("label", "Database Vacuum");
  menuitem.setAttribute("accesskey", "V");
  menuitem.setAttribute("oncommand", 'ucjsVacuume();');
  document.getElementById("menuWebDeveloperPopup").appendChild(menuitem);
})();



function ucjsVacuumeExecute() {
  let db = PlacesUtils.history.QueryInterface(Ci.nsPIPlacesDatabase).DBConnection;
  let stmt = db.createAsyncStatement("VACUUM");
  ucjsVacuumeAlerts("Start VACUUM, Do not close browser!");
  stmt.executeAsync({
    handleResult: function(aResultSet) {
    },
    handleError: function(aError) {
      ucjsVacuumeAlerts("Unexpected error (" + aError.result + "): " + aError.message);
      throw "Unexpected error (" + aError.result + "): " + aError.message;
    },
    handleCompletion: function(aReason) {
      ucjsVacuumeAlerts("Done!");
    }
  });
  stmt.finalize();
}

function ucjsVacuumeAlerts(str) {
  var alerts = Components.classes["@mozilla.org/alerts-service;1"].
                       getService(Components.interfaces.nsIAlertsService);
  alerts.showAlertNotification(null, "Database Vacuum", str, false, "", null);
}

function ucjsVacuume() {
  Services.tm.currentThread.dispatch(ucjsVacuumeExecute, Ci.nsIThread.DISPATCH_NORMAL);
}