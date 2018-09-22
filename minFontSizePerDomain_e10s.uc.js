// ==UserScript==
// @name           minFontSizePerDomain_e10s.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Min Font Size Per Domain
// @include        main
// @compatibility  Firefox 60+
// @author         Alice0775
// @version        2018/09/23 01:00 fix bug
// @version        2018/09/21 19:00 remove loadoverlay. And change ProgressListener to TabsProgressListener
// @version        2014/10/15 12:00 36
// @version        2014/10/15 12:00 fixed local file
// @version        2014/10/10 00:00 e10s (eliminates docShell)
// @version        2014/10/09 12:00 use sqlite istead of prefs.js
// @version        2014/10/08 11:00 add acceskey, persist local directory
// @version        2014/10/07 20:00
// ==/UserScript==


var minFontSizePerDomain = {
  // ==config==
  defaultMinSize: 9,    // default min font size
  
  // regular expression, or strings wild card * ? +
  SITEINFO: [
    {url: /^https?:\/\/min\.size\.(com|co\.jp)./ , size: 20}, // ex. regular expression
    {url: "https?://min.size.(com|co.jp)*" , size: 20},       // ex. strings wild card: * ? +
    {url: "https?://docs.google.(com|co.jp)*" , size: 0},
    {url: "about:*" , size: 0}, // maybe not change
  ],
  // ==/config==
  

  aUrlMinSize: [],
  getParam: function() {
    return minFontSizePerDomain_storage.getAllminFontSizeData();
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
      case "TabSelect":
        // mmm
        this.setMinFontSize(event.target);
        break;
    }
  },

  init: function() {
    minFontSizePerDomain_storage.initDB();

    // cache to minimize accessing sqlite db
    this.initCache();

    // convert to regexp
    for (let i = 0; i < this.SITEINFO.length; i++) {
      let info = this.SITEINFO[i];
      let re = info.url;
      if (typeof re == "string") {
        re = new RegExp("^" + re.replace(/\./g, "\\.").replace(/\*/g, "."));
      this.SITEINFO[i].url = re;
      }
    }

    // frame script
    function content_setMinFontSize() {
      let { interfaces: Ci, utils: Cu } = Components;
      /*
      Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
      let wp = docShell.QueryInterface(Ci.nsIWebProgress);
      */
      addMessageListener("minFontSizePerDomain:setMinFontSize",
         function(msg) {
           /*
           let docShell =  content
				                  .QueryInterface(Ci.nsIInterfaceRequestor)
				                  .getInterface(Ci.nsIWebNavigation)
				                  .QueryInterface(Ci.nsIDocShell);
           */
           docShell.contentViewer.minFontSize = Math.floor(msg.data.minFontSize / 0.016674);
         }
      )
    }
    window.messageManager.loadFrameScript("data:,(" + content_setMinFontSize.toString() + ")();", true);

    // Listeners
    window.addEventListener("unload", this, false);
    gBrowser.addTabsProgressListener(this);

    // mmm for already loaded page
    this.setMinFontSize(gBrowser.selectedBrowser);
    // mmm
    gBrowser.tabContainer.addEventListener('TabSelect', this, false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    gBrowser.removeTabsProgressListener(this);
    gBrowser.tabContainer.removeEventListener('TabSelect', this, false);
    minFontSizePerDomain_storage.closeDB();
  },

  initCache: function() {
    this.aUrlMinSize = this.getParam();
    this.defaultMinSize = minFontSizePerDomain_storage.getSizeByUrl("default_min_size") || this.defaultMinSize;
  },

  getDefaultSize: function() {
    return this.defaultMinSize;
  },

  getMinFontSize: function(aURI) {
    try {
      if (!/https?|ftp|file/.test(aURI.scheme)) {
        return 0;
      }
    } catch(e) {
      return 0;
    }

    try {
      var url = aURI.host;
      if (!url) {
        if (/^file:/i.test(aURI.spec)) {
          let tmp = aURI.spec.split('/');
          tmp.pop();
          url = tmp.join('/');
          url = ioService.newURI(url, null, null).spec;
        }
      }
    } catch(e) {
      return null;
    }

    //userChrome_js.debug(encodeURIComponent(url));
    let minFontSize = this.aUrlMinSize[encodeURIComponent(url)];
    if (typeof minFontSize != "undefined") {
       //userChrome_js.debug(minFontSize);
       return minFontSize;
    }
    
    for (let i = 0; i < this.SITEINFO.length; i++) {
      let info = this.SITEINFO[i];
      let re = info.url;
      if (re.test(url)) {
        minFontSize = info.size;
        //userChrome_js.debug(minFontSize);
        return minFontSize;
      }
    }

    return this.defaultMinSize;
  },

  setMinFontSize: function(browser) {
    if (!browser.currentURI)
      return;
    let minFontSize = this.getMinFontSize(browser.currentURI);
    if (!minFontSize)
      return

    if (!browser.getAttribute("remote"))
      browser.markupDocumentViewer.minFontSize = Math.floor(minFontSize / 0.016674);
    else
	    browser.messageManager.sendAsyncMessage("minFontSizePerDomain:setMinFontSize", {
	      minFontSize : minFontSize
	    });
  },

  onStateChange: function(aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {
  },

  onLocationChange: function(aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {
    // Filter out location changes in sub documents.
    if (!aWebProgress.isTopLevel)
      return;

    if (aBrowser)
      this.setMinFontSize(aBrowser);
  },
}



var minFontSizePerDomain_storage = {
  db: null,
  initDB: function() {
    let file = FileUtils.getFile("UChrm", ["minfontdize.sqlite"]);
    if (!file.exists()) {
      this.db = Services.storage.openDatabase(file);
      let stmt = this.db.createStatement(
        "CREATE TABLE minfontsize (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, size INTEGER)"
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

  getAllminFontSizeData: function(url) {
    let aUrlMinSize = [];

    let stmt = this.db.createStatement(
      "SELECT url, size FROM minfontsize"
    );
    try {
      while (stmt.executeStep()) {
        let url         = stmt.row.url;
        let minFontSize = stmt.row.size;
        if (!!url)
          aUrlMinSize[url] = minFontSize;
      }
    } finally {
      stmt.finalize();
    }
    return aUrlMinSize;
  },

  getSizeByUrl: function(url) {
    let minfontsize = null;
    let stmt = this.db.createStatement(
      "SELECT size FROM minfontsize WHERE url = :url"
    );
    stmt.params['url'] = url;
    try {
      while (stmt.executeStep()) {
        minfontsize = stmt.row.size;
        break;
      }
    } finally {
      stmt.finalize();
    }
    return minfontsize;
  },

  setSizeByUrl: function(url, minFontSize) {
    if(this.getSizeByUrl(url) == null)
      this.insertSizeByUrl(url, minFontSize);
    else
      this.updateSizeByUrl(url, minFontSize);
  },

  insertSizeByUrl: function(url, minFontSize) {
    let stmt = this.db.createStatement(
      "INSERT INTO minFontSize (url, size) VALUES (:url, :size)"
    );
    stmt.params['url'] = url;
    stmt.params['size'] = minFontSize;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  updateSizeByUrl: function(url, minFontSize) {
    let stmt = this.db.createStatement(
      "UPDATE minFontSize SET size = :size WHERE url = :url"
    );
    stmt.params['size'] = minFontSize;
    stmt.params['url'] = url;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  deleteByUrl: function(url) {
    let stmt = this.db.createStatement(
      "DELETE FROM minFontSize WHERE url = :url"
    );
    stmt.params['url'] = url;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  }
}



var minFontSizePerDomain_menu = {

  jsonToDOM: function(jsonTemplate, doc, nodes) {
    jsonToDOM.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
    };
    jsonToDOM.defaultNamespace = jsonToDOM.namespaces.xul;
    function jsonToDOM(jsonTemplate, doc, nodes) {
      function namespace(name) {
          var reElemNameParts = /^(?:(.*):)?(.*)$/.exec(name);
          return { namespace: jsonToDOM.namespaces[reElemNameParts[1]], shortName: reElemNameParts[2] };
      }

      // Note that 'elemNameOrArray' is: either the full element name (eg. [html:]div) or an array of elements in JSON notation
      function tag(elemNameOrArray, elemAttr) {
        // Array of elements?  Parse each one...
        if (Array.isArray(elemNameOrArray)) {
          var frag = doc.createDocumentFragment();
          Array.forEach(arguments, function(thisElem) {
            frag.appendChild(tag.apply(null, thisElem));
          });
          return frag;
        }

        // Single element? Parse element namespace prefix (if none exists, default to defaultNamespace), and create element
        var elemNs = namespace(elemNameOrArray);
        var elem = doc.createElementNS(elemNs.namespace || jsonToDOM.defaultNamespace, elemNs.shortName);

        // Set element's attributes and/or callback functions (eg. onclick)
        for (var key in elemAttr) {
          var val = elemAttr[key];
          if (nodes && key == "key") {
              nodes[val] = elem;
              continue;
          }

          var attrNs = namespace(key);
          if (typeof val == "function") {
            // Special case for function attributes; don't just add them as 'on...' attributes, but as events, using addEventListener
            elem.addEventListener(key.replace(/^on/, ""), val, false);
          } else {
            // Note that the default namespace for XML attributes is, and should be, blank (ie. they're not in any namespace)
            elem.setAttributeNS(attrNs.namespace || "", attrNs.shortName, val);
          }
        }

        // Create and append this element's children
        var childElems = Array.slice(arguments, 2);
        childElems.forEach(function(childElem) {
          if (childElem != null) {
            elem.appendChild(
                childElem instanceof doc.defaultView.Node ? childElem :
                    Array.isArray(childElem) ? tag.apply(null, childElem) :
                        doc.createTextNode(childElem));
          }
        });
        return elem;
      }
      return tag.apply(null, jsonTemplate);
    }

    return jsonToDOM(jsonTemplate, doc, nodes);
  },

  init :function() {
    minFontSizePerDomain.init();
    
    let template = 
        ["menu", {id: "minFontSizePerDomain", label: "Minimum Font Size", accesskey:"M"},
          ["menupopup", {id :"minFontSizePerDomainMenupopup",
                         onpopupshowing: "minFontSizePerDomain_menu.onpopupshowing();"},
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain26", label: "26",
                          oncommand: "minFontSizePerDomain_menu.setSize(26);",
                          accesskey:"d"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain24", label: "24",
                          oncommand: "minFontSizePerDomain_menu.setSize(24);",
                          accesskey:"c"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain22", label: "22",
                          oncommand: "minFontSizePerDomain_menu.setSize(22);",
                          accesskey:"b"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain20", label: "20",
                          oncommand: "minFontSizePerDomain_menu.setSize(20);",
                          accesskey:"a"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain18", label: "18",
                          oncommand: "minFontSizePerDomain_menu.setSize(18);",
                          accesskey:"8"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain17", label: "17",
                          oncommand: "minFontSizePerDomain_menu.setSize(17);",
                          accesskey:"7"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain16", label: "16",
                          oncommand: "minFontSizePerDomain_menu.setSize(16);",
                          accesskey:"6"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain15", label: "15",
                          oncommand: "minFontSizePerDomain_menu.setSize(15);",
                          accesskey:"5"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain14", label: "14",
                          oncommand: "minFontSizePerDomain_menu.setSize(14);",
                          accesskey:"4"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain13", label: "13",
                          oncommand: "minFontSizePerDomain_menu.setSize(13);",
                          accesskey:"3"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain12", label: "12",
                          oncommand: "minFontSizePerDomain_menu.setSize(12);",
                          accesskey:"2"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain11", label: "11",
                          oncommand: "minFontSizePerDomain_menu.setSize(11);",
                          accesskey:"1"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain10", label: "10",
                          oncommand: "minFontSizePerDomain_menu.setSize(10);",
                          accesskey:"0"}],
            ["menuitem", {type: "radio", name: "minFontSizePerDomain",
                          id: "minFontSizePerDomain9", label: "9",
                          oncommand: "minFontSizePerDomain_menu.setSize(9);",
                          accesskey:"9"}],
            ["menuseparator",  {id: "minFontSizePerDomainMenuseparator2"}],
            ["menuitem", {id:"minFontSizePerDomainDefault", label:"Change Default",
                          oncommand: "minFontSizePerDomain_menu.changeDefaultSize();",
                          accesskey: "t"}]
          ]
        ];
    let contentAreaContextMenu = document.getElementById("contentAreaContextMenu");
    contentAreaContextMenu.appendChild(this.jsonToDOM(template, document, {}));
  },

  onpopupshowing: function() {
    let size = minFontSizePerDomain.getMinFontSize(gBrowser.currentURI) || 0;
    let menuitem = document.getElementById("minFontSizePerDomain" + size);
    if(menuitem)
      menuitem.setAttribute('checked',true);
  },

  setSize: function(val) {
    try {
      var url = encodeURIComponent(gBrowser.currentURI.host);
      if (!url) {
        if (/^file:/i.test(gBrowser.currentURI.spec)) {
          let tmp = gBrowser.currentURI.spec.split('/');
          tmp.pop();
          url = tmp.join('/');
          url = encodeURIComponent(ioService.newURI(url, null, null).spec);
        }
      }
    } catch(e) {
      return;
    }

    minFontSizePerDomain.aUrlMinSize[url] = val;
    if (val == 0) {
      delete minFontSizePerDomain.aUrlMinSize[url];
      minFontSizePerDomain_storage.deleteByUrl(url);
    } else
      minFontSizePerDomain_storage.setSizeByUrl(url, val);

    minFontSizePerDomain.setMinFontSize(gBrowser.selectedBrowser);
    this.broadcast(false);
  },

  changeDefaultSize: function() {
    let size = minFontSizePerDomain.defaultMinSize;
    
    let prompts = Services.prompt;
    let check = {value: false};                 // default the checkbox to false
    let input = {value: size};                  // default the edit field to size
    let result = prompts.prompt(null, "Min Font Size", "Default Min Font Size?", input, null, check);
    // result is true if OK is pressed, false if Cancel. input.value holds the value of the edit field if "OK" was pressed.
    if (result && input.value >= 0) {
      minFontSizePerDomain.defaultMinSize = input.value;
      minFontSizePerDomain_storage.setSizeByUrl("default_min_size", minFontSizePerDomain.defaultMinSize);
      this.broadcast(true);
    }
  },
  
  broadcast: function(allwindow) {
    let wm = Services.wm;
    let enumerator = wm.getEnumerator("navigator:browser");
    while(enumerator.hasMoreElements()) {
      let win = enumerator.getNext();
      // win is [Object ChromeWindow] (just like window), do something with it
      if (allwindow || win != window) {
        win.minFontSizePerDomain.initCache();
        win.minFontSizePerDomain.setMinFontSize(win.gBrowser.selectedBrowser);
      }
    }
  }
}

minFontSizePerDomain_menu.init();

