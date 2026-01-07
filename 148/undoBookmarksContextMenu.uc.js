// ==UserScript==
// @name          undoBookmarksContextMenu.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   add undo menu in Bookmarks Context Menu
// @include       *
// @async          true
// @author        alice0775
// @compatibility  Firefox 148
// @version        2026/01/07 Bug 2008041 - Make XUL disabled / checked attributes html-style boolean attributes.
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version       2022/11/22 Bug 877389 - [meta] Replace calls to Cu.reportError, etc. from browser code, replace with console.error, etc.
// @version       2022/08/26 Bug 1695435 - Remove @@hasInstance for IDL interfaces in chrome context
// @version       2022/6/20 00:00 fix issue #69
// @version       2021/10/02 00:00 do not close popup when middle mouse click on the undo/redo menu
// @version       2019/11/20 23:00 Bug 1553188 - Rename browser.xul to browser.xhtml
// @version       2019/11/20 23:00 fix redeclaration error
// @version       2019/07/10 10:00 fix 70 Bug 1558914 - Disable Array generics in Nightly
// @version       2018/10/04 20:00 remove conflict shortcuts key for main window
// @version       2018/10/04 60+
// ==/UserScript==
if (typeof window.undobookmarksmenu == "undefined") {
  window.undobookmarksmenu = {
    popup: null,

    handleEvent: function(event) {
      switch (event.type) {
        case 'unload':
          this.uninit();
          break;
        case 'popupshown':
          this.popupshown(event);
          break;
      }
    },

    init: function() {
      window.addEventListener('unload', this, false);
      this.popup = document.getElementById("placesContext");
      if (!this.popup)
        return;
      this.popup.addEventListener('popupshown', this, false);
      let template = (location.href == "chrome://browser/content/browser.xhtml"
                     || location.href == "chrome://browser/content/browser.xul") ?
                [
                  ["menuitem", {id: "undobookmarksmenuUndo",
                                disabled: "",
                                label: "Undo",
                                key: "key_undo",
                                //oncommand: "PlacesTransactions.undo().catch(Cu.reportError);",
                                accesskey: "U",
                                selection: "any",
                                //onmouseup: "undobookmarksmenu.shouldPreventHide(event);"
                  }],
                  ["menuitem", {id:"undobookmarksmenuRedo",
                                disabled: "",
                                label: "Redo",
                                key: "key_redo",
                                //oncommand: "PlacesTransactions.redo().catch(Cu.reportError);",
                                accesskey: "R",
                                selection: "any",
                                //onmouseup: "undobookmarksmenu.shouldPreventHide(event);"
                  }]
                ] : [
                  ["menuitem", {id: "undobookmarksmenuUndo",
                                disabled: "",
                                label: "Undo",
                                key: "key_undo",
                                //oncommand: "PlacesTransactions.undo().catch(Cu.reportError);",
                                acceltext: "Ctrl+Z",
                                accesskey: "U",
                                selection: "any",
                                //onmouseup: "undobookmarksmenu.shouldPreventHide(event);"
                  }],
                  ["menuitem", {id:"undobookmarksmenuRedo",
                                disabled: "",
                                label: "Redo",
                                key: "key_redo",
                                //oncommand: "PlacesTransactions.redo().catch(Cu.reportError);",
                                acceltext: "Ctrl+Y",
                                accesskey: "R",
                                selection: "any",
                                //onmouseup: "undobookmarksmenu.shouldPreventHide(event);"
                  }]
                ];

      let ref = document.getElementById("placesContext_deleteSeparator");
      ref.parentNode.insertBefore(this.jsonToDOM(template, document, {}), ref);

      document.getElementById("undobookmarksmenuUndo").addEventListener('command', () => {PlacesTransactions.undo().catch(Cu.reportError)});
      document.getElementById("undobookmarksmenuUndo").addEventListener('mouseup', (event) => undobookmarksmenu.shouldPreventHide(event));
      document.getElementById("undobookmarksmenuRedo").addEventListener('command', () => {PlacesTransactions.redo().catch(Cu.reportError)});
      document.getElementById("undobookmarksmenuRedo").addEventListener('mouseup', (event) => undobookmarksmenu.shouldPreventHide(event));


      
    },

    uninit: function() {
      window.removeEventListener('unload', this, false);
      if (!this.popup)
        return;
      this.popup.removeEventListener('popupshown', this, false);
    },

    popupshown: function(event){
      var menuitem = document.getElementById("undobookmarksmenuUndo");
      if (menuitem)
        menuitem.toggleAttribute('disabled', PlacesTransactions.topUndoEntry == null);
      menuitem = document.getElementById("undobookmarksmenuRedo");
      if (menuitem)
        menuitem.toggleAttribute('disabled', PlacesTransactions.topRedoEntry == null);
    },

    shouldPreventHide: function(event) {
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
                doc.defaultView.Node.isInstance(childElem)
                /*childElem instanceof doc.defaultView.Node*/ ? childElem :
                      Array.isArray(childElem) ? tag.apply(null, childElem) :
                          doc.createTextNode(childElem));
            }
          });
          return elem;
        }
        return tag.apply(null, jsonTemplate);
      }

      return jsonToDOM(jsonTemplate, doc, nodes);
    }
  }


  window.undobookmarksmenu.init();
}