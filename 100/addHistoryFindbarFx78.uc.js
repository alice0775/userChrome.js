// ==UserScript==
// @name           addHistoryFindbarFx78.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add History to Findbar
// @include        main
// @compatibility  Firefox 100+
// @author         Alice0775
// @version        2022/03/10 02:00 Bug 1746667 - PathUtils: Make `get{ProfileDir,LocalProfileDir,TempDir}` sync on main thread
// @version        2022/01/20 06:00 Bug 1747461 Remove FileUtils.getFile from browser/
// @version        2021/11/12 21:00 space key open popup
// @version        2021/11/12 16:00 move focus after click the entry
// @version        2021/07/14 06:00 fixes for middleclicking, maxEntriesToShow and show popup after delete item, Marged some patch #64(Thanks sdavidg)
// @version        2020/12/16 22:30 use LIMIT
// @version        2020/12/16 22:00 fix typo
// @version        2020/12/16 09:30 order by last_used
// @version        2020/12/16 01:30 popup before_end
// @version        2020/12/16 01:00 ミドルクリックでヒストリー削除
// @version        2020/12/16 00:00 新しい順
// @version        2020/12/15 17:00 simplify
// ==/UserScript==
const addHistoryFindbar78 = {
  typingSpeed: 1000,
  maxEntriesToShow:10,
    
  init: function() {

    var style = `
      `.replace(/\s+/g, " ");

    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    this.ellipsis = "\u2026";
    try {
      this.ellipsis = Services.prefs.getComplexValue(
        "intl.ellipsis",
        Ci.nsIPrefLocalizedString
      ).data;
    } catch (e) {}

    addHistoryFindbar_storage.initDB();

    gBrowser.tabContainer.addEventListener('TabFindInitialized', this, false);
    gBrowser.tabContainer.addEventListener('TabClose', this, false);
    
    window.addEventListener("find", this, false);
    window.addEventListener("findagain", this, false);
  },

  initFindBar: function() {
    if (/pending/.test(gBrowser.getFindBar.toString()) &&
        typeof gFindBar == "undefined") {
      setTimeout(() => {
        gBrowser.getFindBar().then(findbar => {
          this.addDropMarker(findbar);
        });
      }, 1000); /// xxx workarroundfor Bug 1411707
      return;
    } else {
      gFindBar = gBrowser.getFindBar();
      this.addDropMarker(gFindBar);
     
    }
  },

  addDropMarker: function(findbar) {
    this.kNSXUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    let ref = findbar.getElement("highlight");

    let menu = document.createElementNS(this.kNSXUL, "toolbarbutton");
    ref.parentNode.insertBefore(menu, ref);
    menu.setAttribute("anonid", "historydropmarker");
    menu.setAttribute("type", "menu");
    menu.setAttribute("class", "findBar-history-dropmarker findbar-button tabbable");
    menu.setAttribute("tooltiptext", "Show history");
    menu.setAttribute("label", "▽");
    //menu.setAttribute("accesskey", "h");
    menu.setAttribute("tooltiptext", "Find term History");
    menu.addEventListener("keydown", (event) => {let popup=findbar.getElement("historypopup");if(event.keyCode==KeyEvent.DOM_VK_SPACE)if(popup.state !='open')popup.openPopup(findbar.getElement("historydropmarker"),"before_end");});
    
    let menupopup = document.createElementNS(this.kNSXUL, "menupopup");
    menupopup.setAttribute("onpopupshowing", "addHistoryFindbar78.onpopupshowing(event);");
    menupopup.setAttribute("anonid", "historypopup");
    menupopup.setAttribute("position", "before_end");
    menupopup.setAttribute("oncommand", "addHistoryFindbar78.copyToFindfield(event);");
    menupopup.setAttribute("onclick", "addHistoryFindbar78.onclick(event);");
    menupopup.setAttribute("onmouseup", "addHistoryFindbar78.shouldPreventHide(event);");
    menu.appendChild(menupopup);

    gFindBar._findField.lastInputValue = "";
  },

  uninit: function() {
    addHistoryFindbar_storage.closeDB();
    gBrowser.tabContainer.removeEventListener('TabFindInitialized', this, false);
    gBrowser.tabContainer.removeEventListener('TabClose', this, false);
    window.removeEventListener("find", this, false);
    window.removeEventListener("findagain", this, false);

  },

  handleEvent: function(event){
    //Services.console.logStringMessage(event.type);
    switch (event.type) {
      case 'unload':
        this.uninit();
        break;
      case 'TabFindInitialized':
        this.initFindBar();
        break;
      case 'TabClose':
        break;
      case 'find':
        gFindBar._findField.lastInputValue = "";
      case 'findagain':
        let text = event.detail.query;
        if (gFindBar._findField.lastInputValue != text &&
            text.length > 1) {
          this.addToHistory(text);
          gFindBar._findField.lastInputValue = event.detail.query;
        }
    }
  },

  onclick: function(aEvent) {
    if (aEvent.button != 1)
      return

    let target = aEvent.originalTarget;
    let parentNode = target.parentNode;
    let value  = target.getAttribute("data");
    parentNode.removeChild(target);

    addHistoryFindbar_storage.deleteValue("findbar-history", value);
	  addHistoryFindbar78.onpopupshowing(aEvent, parentNode);
  },

  shouldPreventHide: function(aEvent) {
		const menuitem = event.target;
		if (event.button == 1) 
		{
			menuitem.setAttribute('closemenu', 'none');
			menuitem.parentNode.addEventListener('popuphidden', () => {
				menuitem.removeAttribute('closemenu');
			}, { once: true });
			if (event.ctrlKey)
		  	menuitem.parentNode.hidePopup();
		}
  },

  copyToFindfield: function(aEvent) {
    var target = aEvent.originalTarget;
    //本来のfindbar-textboxに転記して, ダミーイベント送信
    gFindBar._findField.value  = target.getAttribute("data");
    gFindBar._findField.focus();
    gFindBar._findField.removeAttribute('status');
    var evt = document.createEvent("UIEvents");
    evt.initUIEvent("input", true, false, window, 0);
    gFindBar._findField.dispatchEvent(evt);
    return;
  },

  timer: null,
  addToHistory: function(value){
    if (!value)
      return;

    if (this.timer) {
        clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      let fieldname = "findbar-history";
      let count = addHistoryFindbar_storage.getCount("findbar-history", value);
      if (!count) {
        addHistoryFindbar_storage.insert(fieldname, value, 1, new Date().getTime() ) ;
      } else {
        addHistoryFindbar_storage.updateCount(fieldname, value, ++count, new Date().getTime() );
      }
    }, this.typingSpeed);
  },

  clearHistory: function() {
    gFindBar._findField.lastInputValue = "";
    addHistoryFindbar_storage.deleteAll("findbar-history");
  },

  getHistory: function(max) {
    return addHistoryFindbar_storage.getValues("findbar-history", "last_used", true, max);
  },

  onpopupshowing: function(event, menupopup) {
    let results = this.getHistory(this.maxEntriesToShow);
    let popup = menupopup || event.target;
    while(popup.lastChild) {
      popup.removeChild(popup.lastChild);
    }

    for (let entry of results) {
      let text = entry.value;
      let element = document.createElementNS(this.kNSXUL, "menuitem");
      element.setAttribute("data", text);
      
      let maxLabelLength =35;
      if (text.length > maxLabelLength) {
        let truncLength = maxLabelLength;
        let truncChar = text[maxLabelLength].charCodeAt(0);
        if (truncChar >= 0xdc00 && truncChar <= 0xdfff) {
          truncLength++;
        }
        text = text.substr(0, truncLength) + this.ellipsis;
      }
      element.setAttribute("label", text);
      popup.appendChild(element);
    }
    let element = document.createElementNS(this.kNSXUL, "menuseparator");
    popup.appendChild(element);

    element = document.createElementNS(this.kNSXUL, "menuitem");
    let label = "Clear Search History";
    let akey = "H";
    element.setAttribute("label", label);
    element.setAttribute("accesskey", akey);
    element.setAttribute("oncommand", "event.stopPropagation(); addHistoryFindbar78.clearHistory();");

    popup.appendChild(element);
  }
}


var addHistoryFindbar_storage = {
  db: null,
  initDB: async function() {
    //let file = FileUtils.getFile("UChrm", ["HistoryFindbar1.sqlite"]);
     let targetPath = PathUtils.join(
        PathUtils.profileDir,
        "chrome", "HistoryFindbar1.sqlite"
      );
      let file = new FileUtils.File(targetPath);
      if (!file.exists()) {
      this.db = Services.storage.openDatabase(file);
      let stmt = this.db.createStatement(
        "CREATE TABLE HistoryFindbar (id INTEGER PRIMARY KEY AUTOINCREMENT, fieldname TEXT NOT NULL, value TEXT NOT NULL, count INTEGER, last_used TIMESTAMP)"
      );
      try {
        stmt.execute();
      } finally {
        stmt.finalize();
      }
    } else {
      this.db = Services.storage.openDatabase(file);
    }
  },

  closeDB: function() {
    try {
      this.db.close();
    } catch(e) {}
  },

  getValues: function(fieldname, order = "", desc = false, max) {
    let orderBy = "";
    if (order == "id") {
      orderBy = "ORDER BY id";
    } else if (order == "value"){
      orderBy = "ORDER BY value";
    } else if (order == "count"){
      orderBy = "ORDER BY count";
    } else if (order == "last_used"){
      orderBy = "ORDER BY last_used";
    }
    if (desc)
      orderBy += " DESC"

    let results = [];
    let sql = "SELECT value, count, last_used FROM HistoryFindbar WHERE fieldname = :fieldname " + orderBy;

    if (typeof max == "number" && max >=0)
      sql += " LIMIT " + max;
    
    let stmt = this.db.createStatement(sql);
    stmt.params['fieldname'] = fieldname;
    try {
      while (stmt.executeStep()) {
        let value = stmt.row.value;
        let count = stmt.row.count;
        let last_used = stmt.row.last_used;
        results.push({fieldname: fieldname, value: value, count: count, last_used: last_used});
      }
    } finally {
      stmt.finalize();
    }
    return results;
  },

  getCount: function(fieldname, value) {
    if (typeof fieldname != "string" || !fieldname)
      return;
    if (typeof value != "string" || !value)
      return;

    let count = 0;
    let stmt = this.db.createStatement(
      "SELECT count FROM HistoryFindbar WHERE fieldname = :fieldname AND value = :value"
    );
    stmt.params['fieldname'] = fieldname;
    stmt.params['value'] = value;
    try {
      while (stmt.executeStep()) {
        count = stmt.row.count;
        break;
      }
    } finally {
      stmt.finalize();
    }
    return count;
  },

  insert: function(fieldname, value, count, last_used) {
    if (typeof fieldname != "string" || !fieldname)
      return;
    if (typeof value != "string" || !value)
      return;
    if (typeof count != "number")
      return;
    if (typeof last_used != "number")
      return;

    let stmt = this.db.createStatement(
      "INSERT INTO HistoryFindbar (fieldname, value, count, last_used) VALUES (:fieldname, :value, :count, :last_used)"
    );
    stmt.params['fieldname'] = fieldname;
    stmt.params['value'] = value;
    stmt.params['count'] = count;
    stmt.params['last_used'] = last_used;
    try {
      stmt.execute();
    } catch(ex) {
    } finally {
      stmt.finalize();
    }

  },

  updateCount: function(fieldname, value, count, last_used) {
    if (typeof fieldname != "string" || !fieldname)
      return;
    if (typeof value != "string" || !value)
      return;

    let stmt = this.db.createStatement(
      "UPDATE HistoryFindbar SET count = :count, last_used = :last_used WHERE fieldname = :fieldname AND value = :value"
    );
    stmt.params['fieldname'] = fieldname;
    stmt.params['value'] = value;
    stmt.params['count'] = count;
    stmt.params['last_used'] = last_used;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  deleteValue: function(fieldname, value) {
    if (typeof fieldname != "string" || !fieldname)
      return;
    if (typeof value != "string" || !value)
      return;

    let stmt = this.db.createStatement(
      "DELETE FROM HistoryFindbar WHERE fieldname = :fieldname AND value = :value"
    );
    stmt.params['fieldname'] = fieldname;
    stmt.params['value'] = value;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  deleteAll: function(fieldname) {
    if (typeof fieldname != "string" || !fieldname)
      return;

    let stmt = this.db.createStatement(
      "DELETE FROM HistoryFindbar WHERE fieldname = :fieldname"
    );
    stmt.params['fieldname'] = fieldname;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  deleteAllData: function() {
    let stmt = this.db.createStatement(
      "DELETE FROM HistoryFindbar"
    );
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  }
}


addHistoryFindbar78.init();
