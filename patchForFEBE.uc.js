// ==UserScript==
// @name           patchForFEBE.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    FEBEのBrowsingHistoryの復元を高速化するパッチ
// @include        main
// @compatibility  Firefox 3.0 3.5
// @author         Alice0775
// @version        2009/07/27 00:00 febe 6.2 修正
// @version        2009/06/09 00:00 Fx3.5のDm構造変更似よる last_visit_date 修正
// @version        2008/9/12 19:00
// @Note           febe 6.2
// ==/UserScript==
// @version        2008/9/03 00:00
if (typeof window.febeBackupBrowserHistory !='undefined'){

  var func = window.febeBackupBrowserHistory.toString();
  func = func.replace(
    'var obj = {aURI: childNode.uri, aTitle: childNode.title, aLastVisited: childNode.time};',
    <><![CDATA[
     var obj = {aURI: childNode.uri, aTitle: childNode.title, aLastVisited: childNode.time, accessCount: childNode.accessCount};
    ]]></>
    );
  eval("window.febeBackupBrowserHistory = " + func);

  var func = window.febeRestoreBrowserHistory.toString();
  func = func.replace(
    'do {',
    <><![CDATA[
     window.febe_nodes = [];
     window.febe_ErrorNode = [];
     do {
    ]]></>
    );

  func = func.replace(
    "var uri = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService).newURI(histObj.aURI, null, null);",
    <><![CDATA[
    try {
      $&
    }catch(ex){
      continue;
    }
    ]]></>
    );

  func = func.replace(
    'bh.addPageWithDetails(uri, histObj.aTitle, histObj.aLastVisited)',
    <><![CDATA[
     window.febe_nodes.push(histObj);
    ]]></>
    );

  func = func.replace(
     'cis.close();',
     ''
    );
  func = func.replace(
     'fis.close();',
     ''
    );

  func = func.replace(
     ' } while (hasmore);',
    <><![CDATA[
       } while (hasmore);
      cis.close();
      fis.close();
      febe_PrepDB();
      febe_HistoryAddition(0);
    ]]></>
    );

  func = func.replace(
     /febeWin\.close\(\);/g,
    <><![CDATA[
     if (febeWin && typeof febeWin.close == "function") {
       febeWin.close();
     }
    ]]></>
    );

  eval("window.febeRestoreBrowserHistory = " + func);

  function febe_PrepDB(){
    if (window.febe_dFile !== void(0))
      return window.febe_dFile;

    window.febe_dFile = null;

    // Firefox 3.1 provides a way to get directly at the database
    if (Ci.nsPIPlacesDatabase)
      window.febe_dFile = Cc["@mozilla.org/browser/nav-history-service;1"].
           getService(Ci.nsPIPlacesDatabase).DBConnection;
    // For Firefox 3, grab the places.sqlite file and open it
    else {
      var places = Cc["@mozilla.org/file/directory_service;1"].
                   getService(Ci.nsIProperties).
                   get("ProfD", Ci.nsIFile);
      places.append("places.sqlite");

      // Grab all possible pages incase we remove some
      window.febe_dFile = Cc["@mozilla.org/storage/service;1"].
           getService(Ci.mozIStorageService).
           openDatabase(places);
    }

    return window.febe_dFile;
  }


window.febe_HistoryAddition = function febe_HistoryAddition(l){
    var rowid, revhost;
    var Cc = Components.classes;
    var Ci = Components.interfaces;
    const ioService = Components.classes['@mozilla.org/network/io-service;1'].
                                         getService(Components.interfaces.nsIIOService);

    const historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"].
                    getService(Components.interfaces.nsINavHistoryService);
    if (!l && window.febe_dFile != null && !window.febe_dFile.transactionInProgress) {
      window.febe_OurTransaction = true;
      window.febe_dFile.beginTransactionAs(window.febe_dFile.TRANSACTION_DEFERRED);
    }

    for(var i = l; i < window.febe_nodes.length && i < l+1; i++){
      var k =i;
      var node = window.febe_nodes[i];
      if (!node.accessCount) node.accessCount = 1;

      try {
        var uri = PlacesUtils._uri(node.aURI);
      } catch(ex) {
        continue;
      }
      if(window.febe_dFile != null){
        rowid = null;
        var sql = "SELECT id FROM moz_places WHERE url = ?1";
        var statement = window.febe_dFile.createStatement(sql);
        try {
          statement.bindStringParameter(0, node.aURI);
          while (statement.executeStep()) {
            rowid = statement.getInt32(0);
            break;
          }
        } catch(e){
        } finally {
          statement.reset();
          statement.finalize();
        }
        var count = 1;
        try {
          count = Math.min(Math.float(node.accessCount), 10000);
        } catch (e) {
        }
        if (!rowid){
          if (febe_getVer() >= 3.5)
            var sql = "INSERT INTO moz_places (url, title, rev_host, visit_count, typed, frecency, last_visit_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)";
          else
            var sql = "INSERT INTO moz_places (url, title, rev_host, visit_count, typed, frecency) VALUES (?1, ?2, ?3, ?4, ?5, ?6)";
          revhost = "";
          try {
            revhost = uri.host.match(/./g).reverse().join("") + ".";
          } catch (ex){
            try {
              if (/^file:/i.test(uri.host))
                revhost =  ".";
            } catch (ex){}
          }
          var statement = window.febe_dFile.createStatement(sql);
          try {
            statement.bindStringParameter(0, node.aURI);
            statement.bindStringParameter(1, node.aTitle);
            statement.bindStringParameter(2, revhost);
            statement.bindInt32Parameter(3, count < 0 ? 0 : count);
            statement.bindInt32Parameter(4, 1);
            statement.bindInt32Parameter(5, 100);
            if (febe_getVer() >= 3.5)
              statement.bindInt64Parameter(6, node.aLastVisited);
            statement.execute();
            rowid = window.febe_dFile.lastInsertRowID;
          } catch(e){
          } finally {
            statement.reset();
            statement.finalize();
          }
        }
        if (rowid) {
          febe_addErrorNode(node);
          var sql = "INSERT INTO moz_historyvisits (place_id, from_visit, visit_date, visit_type, session) VALUES (?1, ?2, ?3 , ?4, ?5)";
          var statement = window.febe_dFile.createStatement(sql);
          try {
            statement.bindInt32Parameter(0, rowid);
            statement.bindInt32Parameter(1, 0);
            statement.bindInt64Parameter(2, node.aLastVisited);
            statement.bindInt32Parameter(3, 1);
            statement.bindInt32Parameter(4, 0);
            statement.execute();
          } catch(e){
            febe_addErrorNode(node);
          } finally {
            statement.reset();
            statement.finalize();
          }
        }
      } else {
        febe_addErrorNode(node);
      }
    }

    if (k + 1 < window.febe_nodes.length) {
      setTimeout(function(self){febe_HistoryAddition(k+1);},0 ,this);
    } else {
      if (window.febe_OurTransaction){
        window.febe_dFile.commitTransaction();
      }
      if (window.febe_ErrorNode.length){
        febe_ErrorRecover(0);
        return;
      }
    }
  }

 function febe_addErrorNode(node){
      window.febe_ErrorNode.push({"uri": node.aURI, "title":node.aTitle,
                    "time": node.aLastVisited, "accessCount":node.accessCount});
 }

 function febe_ErrorRecover(l){
    var Cc = Components.classes;
    var Ci = Components.interfaces;
    const ioService = Components.classes['@mozilla.org/network/io-service;1'].
                                         getService(Components.interfaces.nsIIOService);
    const historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"].
                    getService(Components.interfaces.nsINavHistoryService);
    const BMhistoryService = Components.classes["@mozilla.org/browser/nav-history-service;1"].
                    getService(Components.interfaces.nsIBrowserHistory);

    for(var i = l; i < window.febe_ErrorNode.length && i < l+5; i++) {
      var k =i;
      var node = window.febe_ErrorNode[i];
      try {
        var uri = ioService.newURI(node.aURI, null, null);
      } catch(ex) {
        continue;
      }
      BMhistoryService.addPageWithDetails(uri, node.aTitle, node.aLastVisited);
      for (var j = 1; j < node.accessCount; j++){
         historyService.addVisit(uri, node.aLastVisited, null, 1, false, 0);
      }
    }
    if (k + 1 < window.febe_ErrorNode.length) {
      setTimeout(function(self){febe_ErrorRecover(k+1);},500, this);
    }
  }
  //Fxのバージョン
  function febe_getVer(){
    var info = Components.classes["@mozilla.org/xre/app-info;1"]
               .getService(Components.interfaces.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }
}
