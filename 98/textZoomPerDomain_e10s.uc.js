// ==UserScript==
// @name           textZoomPerDomain_e10s.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Text Zoom Per Domain
// @include        main
// @compatibility  Firefox 87+
// @author         Alice0775
// @version        2021/07/16 15:00 add textZoomPerDomain_menu.enlargeTextZoom(), reduceTextZoom, resetTextZoom
// @version        2021/02/09 20:00 RBug 1691274 - Rewrite `X.setAttribute("hidden", Y)` to `X.hidden = Y` in browser/
// @version        2020/06/23 10:00 remove content script
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
    if (!ZoomManager.useFullZoom)
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
    else {
      let fullZoomVal = ZoomManager.getZoomForBrowser(browser);
      ZoomManager.setZoomForBrowser(browser, fullZoomVal);
    }
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
  
  zoomFactor: [200, 190, 180, 170, 160, 150, 140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30],
  zoomAaccesskey: ["-", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0", "a", "b", "c", "d", "e", "f", "g"],
  menuinit: false,
  
  init :function() {
    textZoomPerDomain.init();
    this.ioService = Cc["@mozilla.org/network/io-service;1"]
                      .getService(Ci.nsIIOService);

    let template = 
        ["menu", {id: "textZoomPerDomain", label: "Text Zoom Level", accesskey:"Z"},
          ["menupopup", {id :"textZoomPerDomainMenupopup",
                         onpopupshowing: "textZoomPerDomain_menu.onpopupshowing();"},
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
    contentAreaContextMenu.addEventListener("popupshowing", (event) => {document.getElementById("textZoomPerDomain").hidden = !ZoomManager.useFullZoom;}, true);
  },

  onpopupshowing: function() {
    if (!this.menuinit) {
      this.menuinit = true;
      let ref = document.getElementById("textZoomPerDomainMenuseparator2");
      for (let i = 0; i < this.zoomFactor.length; i++) {
        let menuitem = document.createXULElement("menuitem");
        menuitem.setAttribute("type", "radio");
        menuitem.setAttribute("name", "textZoomPerDomain");
        menuitem.setAttribute("id", "textZoomPerDomain" + this.zoomFactor[i]);
        menuitem.setAttribute("label", this.zoomFactor[i].toString());
        menuitem.setAttribute("oncommand", "textZoomPerDomain_menu.setTextZoom(" + this.zoomFactor[i] + ")");
        menuitem.setAttribute("accesskey", this.zoomAaccesskey[i]);
        ref.parentNode.insertBefore(menuitem, ref);
      }
    }
    let textZoom = textZoomPerDomain.getTextZoom(gBrowser.currentURI) || 0;
    let menuitem = document.getElementById("textZoomPerDomain" + textZoom);
    if(menuitem)
      menuitem.setAttribute('checked',true);
  },

  enlargeTextZoom: function() {
    let textZoom = textZoomPerDomain.getTextZoom(gBrowser.currentURI) || 0;
    let index = this.zoomFactor.indexOf(textZoom);
    index++;
    if (index < this.zoomFactor.length) {
      textZoomPerDomain_menu.setTextZoom(this.zoomFactor[index]);
    }
  },

  reduceTextZoom: function() {
    let textZoom = textZoomPerDomain.getTextZoom(gBrowser.currentURI) || 0;
    let index = this.zoomFactor.indexOf(textZoom);
    index--;
    if (index >= 0) {
      textZoomPerDomain_menu.setTextZoom(this.zoomFactor[index]);
    }
  },

  resetTextZoom: function() {
    textZoomPerDomain_menu.setTextZoom(textZoomPerDomain.defaultTextZoom);
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

