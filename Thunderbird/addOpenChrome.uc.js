//ツールメニューに"chromeフォルダを開く"を追加する
//
var ucjsOpenchrome = {
	init: function(){
		if (document.getElementById("OpenchromeFolder"))return;
		var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
				createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		UI.charset = "UTF-8";
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("id", "OpenchromeFolder");
		menuitem.setAttribute("label", UI.ConvertToUnicode("chromeフォルダを開く"));
		menuitem.setAttribute("accesskey", "h");
		menuitem.setAttribute("oncommand", 'Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile).launch();');
		
		var optionsitem = document.getElementById("menu_preferences");
		optionsitem.parentNode.insertBefore(menuitem, optionsitem);
		dump("Initialized OpenChrome");
	}
}
ucjsOpenchrome.init();

