// ==UserScript==
// @name           addOpenChrome
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ツールメニューに"chromeフォルダを開く"を追加する
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version
// @Note
// ==/UserScript==
var ucjsOpenchrome = {
  init: function(){
    if (document.getElementById("OpenchromeFolder"))return;
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "OpenchromeFolder");
    var label = "chromeフォルダを開く";
    try {label = UI.ConvertToUnicode(label)}catch(e){}
    menuitem.setAttribute("label", label);
    menuitem.setAttribute("accesskey", "h");
/*
    menuitem.setAttribute("oncommand", 'Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile).launch();');
    menuitem.setAttribute("onclick", 'if(event.button ==1) Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile).launch();');
*/

    menuitem.setAttribute("oncommand", 'ucjsOpenchrome.run("C:/Program Files/AMA Soft/まめFile５ Second Edition x64/Mame5.exe", [\"' + ucjsOpenchrome.getChomePath().replace(/\\/g, "\\\\") + '\"])');
    menuitem.setAttribute("onclick", 'if(event.button ==1) ucjsOpenchrome.run("C:/Program Files/AMA Soft/まめFile５ Second Edition x64/Mame5.exe", [\"' + ucjsOpenchrome.getChomePath().replace(/\\/g, "\\\\") + '\"])');

    var optionsitem = document.getElementById("menu_preferences");
    optionsitem.parentNode.insertBefore(menuitem, optionsitem);
    dump("Initialized OpenChrome");
  },

  getChomePath: function() {
    return Components.classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties)
        .get("UChrm", Components.interfaces.nsILocalFile).path;
  },

  run: function(aAppPath, args) {
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    aAppPath = aAppPath.replace(/\//g, "\\\\");
    try {
      aAppPath = UI.ConvertToUnicode(aAppPath);
    } catch(e){
    }
    // create an nsILocalFile for the executable
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(aAppPath);
    // create an nsIProcess
    var process = Components.classes["@mozilla.org/process/util;1"]
                            .createInstance(Components.interfaces.nsIProcess);
    process.init(file);

    // Run the process.
    // If first param is true, calling thread will be blocked until
    // called process terminates.
    // Second and third params are used to pass command-line arguments
    // to the process.
    process.run(false, args, args.length);
  }
}
ucjsOpenchrome.init();

