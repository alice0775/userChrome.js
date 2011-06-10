(function(){
  var menuitem = document.createElement("menuitem");
  menuitem.setAttribute("label", "Database Vacuum");
  menuitem.setAttribute("accesskey", "V");
  menuitem.setAttribute("oncommand", 'ucjsVacuume();');
  document.getElementById("webConsole").parentNode.insertBefore(menuitem, document.getElementById("webConsole"));
})();



var ucjsVacuumeExecute = {
   run: function() {
     // perform work here that doesn't touch the DOM or anything else that isn't thread safe
     Components.classes["@mozilla.org/browser/nav-history-service;1"]
            .getService(Components.interfaces.nsPIPlacesDatabase)
            .DBConnection
            .executeSimpleSQL("VACUUM");
   }
 }

function ucjsVacuume() {
 var thread = Components.classes["@mozilla.org/thread-manager;1"]
                        .getService(Components.interfaces.nsIThreadManager)
                        .newThread(0);
 thread.dispatch(ucjsVacuumeExecute, thread.DISPATCH_NORMAL);
}