// ==UserScript==
// @name           textZoomPerDomain_e10s.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Text Zoom Per Domain
// @include        main
// @compatibility  Firefox 66+
// @author         Alice0775
// @version        2019/07/10 10:00 fix 70 Bug 1558914 - Disable Array generics in Nightly
// @version        2019/03/30 19:00 Fx67+
// @version        2019/01/22 19:00 Bug 1521137 - The pres context's base min font size is dead code 、なのでminFontSizePerDomain_e10s.uc.jsの代わりに、仕方なく……
// ==/UserScript==


var textZoomPerDomain = {
  // ==config==
  defaultTextZoom: 100,    // default text zoom
  
  // regular expression, or strings wild card * ? +
  SITEINFO: [
    {url: /^https?:\/\/min\.size\.(com|co\.jp)./ , textZoom: 120}, // ex. regular expression
    {url: "https?://min.size.(com|co.jp)*" , textZoom: 120},       // ex. strings wild card: * ? +
    {url: "https?://docs.google.(com|co.jp)*" , textZoom: 100},
    {url: "about:*" , textZoom: 100}, // maybe not change
  ],
  // ==/config==
  

  aUrlTextZoom: [],
  getParam: function() {
    return textZoomPerDomain_storage.getAllTextZoomData();
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "unload":
        this.uninit();
        break;
    }
  },

  init: function() {
    ZoomManager.setZoomForBrowser = function ZoomManager_setZoomForBrowser(aBrowser, aVal) {
      if (aVal < this.MIN || aVal > this.MAX)
        throw Cr.NS_ERROR_INVALID_ARG;

      if (this.useFullZoom || aBrowser.isSyntheticDocument) {

        let textZoom = textZoomPerDomain.getTextZoom(aBrowser.currentURI);
        if (textZoom == null)
          textZoom = 100;
        // fall back
        if (textZoom < 0)
          textZoom = 100;

        aBrowser.textZoom = textZoom / 100;
        aBrowser.fullZoom = aVal;
      } else {
        aBrowser.textZoom = aVal;
        aBrowser.fullZoom = 1;
      }
    };

    textZoomPerDomain_storage.initDB();
    this.ioService = Cc["@mozilla.org/network/io-service;1"]
                      .getService(Ci.nsIIOService);

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
    function content_setTextZoom() {
      let { interfaces: Ci, utils: Cu } = Components;
      /*
      Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
      let wp = docShell.QueryInterface(Ci.nsIWebProgress);
      */
      addMessageListener("textZoomPerDomain:setTextZoom",
         function(msg) {
           /*
           let docShell =  content
				                  .QueryInterface(Ci.nsIInterfaceRequestor)
				                  .getInterface(Ci.nsIWebNavigation)
				                  .QueryInterface(Ci.nsIDocShell);
           */
           docShell.contentViewer.textZoom = msg.data.textZoom / 100;
         }
      )
    }
    window.messageManager.loadFrameScript("data:,(" + content_setTextZoom.toString() + ")();", true);

    // Listeners
    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    textZoomPerDomain_storage.closeDB();
  },

  initCache: function() {
    this.aUrlTextZoom = this.getParam();
    this.defaultTextZoom = textZoomPerDomain_storage.getTextZoomByUrl("default_text_zoom") || this.defaultTextZoom;
  },

  getDefaultSize: function() {
    return this.defaultTextZoom;
  },

  /*
  return null if error
  return defaultTextZoom if url is not match DB/SITEINFO
  return textZoom
  */
  getTextZoom: function(aURI) {
    try {
      if (!/https?|ftp|file/.test(aURI.scheme)) {
        return null;
      }
    } catch(e) {
      return null;
    }

    try {
      var url = aURI.host;
      if (!url) {
        if (/^file:/i.test(aURI.spec)) {
          let tmp = aURI.spec.split('/');
          tmp.pop();
          url = tmp.join('/');
          url = this.ioService.newURI(url, null, null).spec;
        }
      }
    } catch(e) {
      return null;
    }

    //userChrome_js.debug(encodeURIComponent(url));
    let textZoom = this.aUrlTextZoom[encodeURIComponent(url)];
    if (typeof textZoom != "undefined") {
       //userChrome_js.debug(TextZoom);
       return textZoom;
    }
    
    for (let i = 0; i < this.SITEINFO.length; i++) {
      let info = this.SITEINFO[i];
      let re = info.url;
      if (re.test(url)) {
        textZoom = info.textZoom;
        //userChrome_js.debug(TextZoom);
        return textZoom;
      }
    }

    return this.defaultTextZoom;
  },

  setTextZoom: function(browser) {
    if (!browser.currentURI)
      return;

    let textZoom = this.getTextZoom(browser.currentURI);
    // error (not https?|ftp|file or not valid url)
    if (textZoom == null)
      textZoom = 100;
    // fall back
    if (textZoom < 0)
      textZoom = 100;

    //userChrome_js.debug(textZoom);
    if (!browser.getAttribute("remote"))
      browser.markupDocumentViewer.textZoom = textZoom / 100;
    else
	    browser.messageManager.sendAsyncMessage("textZoomPerDomain:setTextZoom", {
	      textZoom : textZoom
	    });
  }
}



var textZoomPerDomain_storage = {
  db: null,
  initDB: function() {
    let file = FileUtils.getFile("UChrm", ["textZoom.sqlite"]);
    if (!file.exists()) {
      this.db = Services.storage.openDatabase(file);
      let stmt = this.db.createStatement(
        "CREATE TABLE TextZoom (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, textZoom INTEGER)"
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

  getAllTextZoomData: function(url) {
    let aUrlTextZoom = [];

    let stmt = this.db.createStatement(
      "SELECT url, textZoom FROM TextZoom"
    );
    try {
      while (stmt.executeStep()) {
        let url         = stmt.row.url;
        let textZoom = stmt.row.textZoom;
        if (!!url)
          aUrlTextZoom[url] = textZoom;
      }
    } finally {
      stmt.finalize();
    }
    return aUrlTextZoom;
  },

  getTextZoomByUrl: function(url) {
    let textZoom = null;
    let stmt = this.db.createStatement(
      "SELECT textZoom FROM TextZoom WHERE url = :url"
    );
    stmt.params['url'] = url;
    try {
      while (stmt.executeStep()) {
        textZoom = stmt.row.textZoom;
        break;
      }
    } finally {
      stmt.finalize();
    }
    return textZoom;
  },

  setTextZoomByUrl: function(url, textZoom) {
//userChrome_js.debug("setTextZoomByUrl: " + url);
//userChrome_js.debug("setTextZoomByUrl: " + textZoom);
//userChrome_js.debug("this.getTextZoomByUrl(url): " + this.getTextZoomByUrl(url));
    if(this.getTextZoomByUrl(url) == null) {
      this.insertTextZoomByUrl(url, textZoom);
    } else {
      this.updateTextZoomByUrl(url, textZoom);
    }
  },

  insertTextZoomByUrl: function(url, textZoom) {
    if (typeof url != "string" || !url)
      return;
    if (typeof textZoom != "number")
      return;

//userChrome_js.debug("insertTextZoomByUrl: " + url);
//userChrome_js.debug("insertTextZoomByUrl: " + textZoom);

    let stmt = this.db.createStatement(
      "INSERT INTO TextZoom (url, textZoom) VALUES (:url, :textZoom)"
    );
    stmt.params['url'] = url;
    stmt.params['textZoom'] = textZoom;
    try {
      stmt.execute();
//userChrome_js.debug("insertTextZoomByUrl: done");
    } catch(ex) {
//userChrome_js.debug("insertTextZoomByUrl: error" + ex);
    } finally {
      stmt.finalize();
    }

  },

  updateTextZoomByUrl: function(url, textZoom) {
    if (typeof url != "string" || !url)
      return;
    if (typeof textZoom != "number")
      return;

    let stmt = this.db.createStatement(
      "UPDATE TextZoom SET textZoom = :textZoom WHERE url = :url"
    );
    stmt.params['textZoom'] = textZoom;
    stmt.params['url'] = url;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  },

  deleteByUrl: function(url) {
    if (typeof url != "string" || !url)
      return;

    let stmt = this.db.createStatement(
      "DELETE FROM TextZoom WHERE url = :url"
    );
    stmt.params['url'] = url;
    try {
      stmt.execute();
    } finally {
      stmt.finalize();
    }
  }
}



var textZoomPerDomain_menu = {

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
          Array.prototype.forEach.call(arguments, function(thisElem) {
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
        var childElems = Array.prototype.slice.call(arguments, 2);
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
    textZoomPerDomain.init();
    this.ioService = Cc["@mozilla.org/network/io-service;1"]
                      .getService(Ci.nsIIOService);

    let template = 
        ["menu", {id: "textZoomPerDomain", label: "Text Zoom Level", accesskey:"Z"},
          ["menupopup", {id :"textZoomPerDomainMenupopup",
                         onpopupshowing: "textZoomPerDomain_menu.onpopupshowing();"},
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain200", label: "200",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(200);",
                          accesskey:"-"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain190", label: "190",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(190);",
                          accesskey:"9"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain180", label: "180",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(180);",
                          accesskey:"8"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain170", label: "170",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(170);",
                          accesskey:"7"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain160", label: "160",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(160);",
                          accesskey:"6"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain150", label: "150",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(150);",
                          accesskey:"5"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain140", label: "140",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(140);",
                          accesskey:"4"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain130", label: "130",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(130);",
                          accesskey:"3"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain120", label: "120",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(120);",
                          accesskey:"2"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain110", label: "110",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(110);",
                          accesskey:"1"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain100", label: "100",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(100);",
                          accesskey:"0"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain90", label: "90",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(90);",
                          accesskey:"a"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain80", label: "80",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(80);",
                          accesskey:"b"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain70", label: "70",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(70);",
                          accesskey:"c"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain60", label: "60",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(60);",
                          accesskey:"d"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain50", label: "50",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(50);",
                          accesskey:"e"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain40", label: "40",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(40);",
                          accesskey:"f"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomain30", label: "30",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(30);",
                          accesskey:"g"}],
            ["menuseparator",  {id: "textZoomPerDomainMenuseparator2"}],
            ["menuitem", {type: "radio", name: "textZoomPerDomain",
                          id: "textZoomPerDomainnDefault", label: "Default",
                          oncommand: "textZoomPerDomain_menu.setTextZoom(textZoomPerDomain.defaultTextZoom);",
                          accesskey:"u"}],
            ["menuitem", {id:"textZoomPerDomainChangeDefault", label:"Change Default",
                          oncommand: "textZoomPerDomain_menu.changeDefaultSize();",
                          accesskey: "t"}]
          ]
        ];
    let contentAreaContextMenu = document.getElementById("contentAreaContextMenu");
    contentAreaContextMenu.appendChild(this.jsonToDOM(template, document, {}));
  },

  onpopupshowing: function() {
    let textZoom = textZoomPerDomain.getTextZoom(gBrowser.currentURI) || 0;
    let menuitem = document.getElementById("textZoomPerDomain" + textZoom);
    if(menuitem)
      menuitem.setAttribute('checked',true);
  },

  setTextZoom: function(val) {
    try {
      var url = encodeURIComponent(gBrowser.currentURI.host);
      if (!url) {
        if (/^file:/i.test(gBrowser.currentURI.spec)) {
          let tmp = gBrowser.currentURI.spec.split('/');
          tmp.pop();
          url = tmp.join('/');
          url = encodeURIComponent(this.ioService.newURI(url, null, null).spec);
        }
      }
    } catch(e) {
      return;
    }

    textZoomPerDomain.aUrlTextZoom[url] = val;
    if (val == null || val == textZoomPerDomain.defaultTextZoom) {
      // delete DB, use default
      delete textZoomPerDomain.aUrlTextZoom[url];
      textZoomPerDomain_storage.deleteByUrl(url);
    } else
      textZoomPerDomain_storage.setTextZoomByUrl(url, val);

    textZoomPerDomain.setTextZoom(gBrowser.selectedBrowser);
    this.broadcast(false);
  },

  changeDefaultSize: function() {
    let textZoom = textZoomPerDomain.defaultTextZoom;
    
    let prompts = Services.prompt;
    let check = {value: false};                 // default the checkbox to false
    let input = {value: textZoom};                  // default the edit field to size
    let result = prompts.prompt(null, "Min Font Size", "Default Text Zoom?", input, null, check);
    // result is true if OK is pressed, false if Cancel. input.value holds the value of the edit field if "OK" was pressed.
//userChrome_js.debug(result);
//userChrome_js.debug(input.value >= 0);
    if (result && input.value >= 0) {
      textZoomPerDomain.defaultTextZoom = parseInt(input.value);
      textZoomPerDomain_storage.setTextZoomByUrl("default_text_zoom", textZoomPerDomain.defaultTextZoom);
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
        win.textZoomPerDomain.initCache();
        win.textZoomPerDomain.setTextZoom(win.gBrowser.selectedBrowser);
      }
    }
  }
}

textZoomPerDomain_menu.init();

