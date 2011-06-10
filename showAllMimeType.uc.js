// ==UserScript==
// @name           showAllMimeType.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    アップリケーションリストのMime Typeが省略されないように, および拡張子を表示, 検索対象にも
// @include        chrome://browser/content/preferences/preferences.xul
// @compatibility  Fx3.0 3.5 3.6
// @author         Alice0775
// @version        2009/07/07 19:00 Fx3.0 3.1 拡張子追加
// @version        2008/12/02 09:20 Fx3.0 3.1
// ==/UserScript==
var addTypeColumn = {
  handleEvent :function(event) {
    switch(event.type) {
      case "paneload" :
        document.getElementById("paneApplications").removeEventListener("paneload", this, false);
        this.patch();
        break;
      case "unload":
        document.getElementById("paneApplications").removeEventListener("paneload", this, false);
        window.removeEventListener("unload", addTypeColumn, false);
        break;
    }
  },

  init: function() {
    window.addEventListener("unload", addTypeColumn, false);
    if (document.getElementById("actionColumn")) {
      this.patch();
      gApplicationsPane._rebuildView();
    } else {
      document.getElementById("paneApplications").addEventListener("paneload", addTypeColumn, false);
    }
  },

  patch: function(mimeTypeColumn) {
    var func = gApplicationsPane._rebuildView.toString();
    func = func.replace(
      'item.setAttribute("typeDescription", this._describeType(visibleType));',
      <><![CDATA[
      if (this._describeType(visibleType).indexOf("("+ visibleType.type+ ")") > -1)
        item.setAttribute("typeDescription", this._describeType(visibleType));
      else
        item.setAttribute("typeDescription", this._describeType(visibleType) + " ("+ visibleType.type+ ")");
      var exts = this._handledTypes[visibleType.type].wrappedHandlerInfo instanceof Ci.nsIMIMEInfo ?
                this._handledTypes[visibleType.type].wrappedHandlerInfo.getFileExtensions() :
                null;
      var ext =[]
      while (exts && exts.hasMore()) {
        ext.push(exts.getNext());
      }
      if (ext.length > 0)
        item.setAttribute("typeDescription", item.getAttribute("typeDescription") + "[" + ext.join(";") + "]");
      ]]></>
    );
    eval("gApplicationsPane._rebuildView = " + func);

    func = gApplicationsPane._matchesFilter.toString();
    func = func.replace(
      '{',
      <><![CDATA[
       {
      var exts = this._handledTypes[aType.type].wrappedHandlerInfo instanceof Ci.nsIMIMEInfo ?
                this._handledTypes[aType.type].wrappedHandlerInfo.getFileExtensions() :
                null;
      var ext =[]
      while (exts && exts.hasMore()) {
        ext.push(exts.getNext());
      }
      ]]></>
    );
    func = func.replace(
      'this._describePreferredAction(aType).toLowerCase().indexOf(filterValue) != -1;',
      <><![CDATA[
       this._describePreferredAction(aType).toLowerCase().indexOf(filterValue) != -1 ||
       aType.type.toLowerCase().indexOf(filterValue) != -1 ||
       ext.join(";").toLowerCase().indexOf(filterValue) != -1;
      ]]></>
    );
    eval("gApplicationsPane._matchesFilter = " + func);
  },
}
addTypeColumn.init();
