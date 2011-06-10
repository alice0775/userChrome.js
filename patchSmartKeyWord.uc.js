// ==UserScript==
// @name					 patchSmartKeyWord.uc.js
// @namespace 		 http://space.geocities.yahoo.co.jp/gl/alice0775
// @description 	 SmartKeyWord において +をエンコードする
// @include 			 main
// @compatibility  Firefox 2.0 3.0
// @author				 Alice0775
// @version 			 LastMod 2007/08/26 14:30
// @Note					 Bug 359809 - Bookmark Keyword searches are not encoded properly (though keyword.URL is)
// ==/UserScript==

(function(){
	var func = getShortcutOrURI.toSource();
	//Fx2
	func = func.replace(/encodedText = escape\(convertFromUnicode\(charset, text\)\);/,"encodedText = escape(convertFromUnicode(charset, text)).replace(/\\+/g,'%2B');");

	//Fx3
	func = func.replace(/encodedParam = escape\(convertFromUnicode\(charset, param\)\);/,"encodedParam = escape(convertFromUnicode(charset, param)).replace(/\\+/g,'%2B');");

	eval('getShortcutOrURI = ' + func);

})();
