// ==UserScript==
// @name           clearDataForContainerMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Clear data for this container
// @include        main
// @compatibility  Firefox 135
// @author         Alice0775
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2022/08/26 Bug 1695435 - Remove @@hasInstance for IDL interfaces in chrome context
// @version        2022/01/20
// ==/UserScript==

var clearDataForContainerMenu = {

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
  },
  
  init :function() {

    let template = 
        ["menuitem", {id: "clearDataForContainerMenu", label: "Clear data for this container",
                      /*oncommand: "Services.clearData.deleteDataFromOriginAttributesPattern({userContextId: gBrowser.selectedTab.userContextId}));",*/
                      accesskey:"h"}];
    let contentAreaContextMenu = document.getElementById("contentAreaContextMenu");
    contentAreaContextMenu.appendChild(this.jsonToDOM(template, document, {}));
    document.getElementById("clearDataForContainerMenu").addEventListener("command", () => Services.clearData.deleteDataFromOriginAttributesPattern({userContextId: gBrowser.selectedTab.userContextId}));
  },
}

clearDataForContainerMenu.init();

