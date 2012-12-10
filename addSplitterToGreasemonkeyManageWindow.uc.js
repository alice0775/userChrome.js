// ==UserScript==
// @name           addSplitterToGreasemonkeyManageWindow.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add Splitter To Greasemonkey Manage Window
// @include        chrome://greasemonkey/content/manage.xul
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2008/04/21
// @Note
setTimeout(function(){
      var style = " \
      #col_left, \
      #col_right \
      { \
        min-width: 100px !important; \
        max-width: 1000px !important; \
      } \
      ".replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
    return document.documentElement.getAttribute(name);
    };

    var aNode = document.getElementById("col_right");
    aNode.parentNode.insertBefore(document.createElement("splitter"),aNode);

    var listbox = document.getElementById("lstScripts");
    //listbox.appendItem(' ')
    listbox.nextSibling.removeAttribute('flex');
    listbox.removeAttribute('flex');
    listbox.setAttribute('flex', "6");

    //patch for Listbox (greasemonkey-0.8.20080415.0)
    // xxx Bug 413336  - listbox scrolling behaves badly when flexed and followed by a line-wrapped label
    window.populateChooser = function populateChooser() {
      var scripts = config.scripts;
      for (var i = 0, script = null; (script = scripts[i]); i++)
        addListitem(script, i);
      var listbox = document.getElementById("lstScripts");
     // listbox.appendItem(' ');
    };

    window.populateChooser = function chooseScript(index) {
      listbox.selectedIndex = index;
      listbox.ensureIndexIsVisible( index )
      listbox.nextSibling.removeAttribute('flex');
      listbox.removeAttribute('flex');
      listbox.setAttribute('flex', "6");
      listbox.focus();
    }
},500);