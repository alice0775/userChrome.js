// ==UserScript==
// @name          patchForBug1765440_Library_Keep_Front.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   workaround Bug 1765440 - Bookmarks and history items opened from the library force the browser window to the front
// @include       chrome://browser/content/places/places.xhtml
// @compatibility Firefox 115
// @author        Alice0775 
// @version       2024/05/29 ちらつくけど
// @note          フォアグラウンドタブで開いた場合でもライブラリを前面にしておきたい場合は, 15行目のコメント記号 [/*] と [*/] を消す. aWhere == "tab" || は残す
// ==/UserScript==
if(!/_openNodeIn_org/.test(PlacesUIUtils._openNodeIn.toString())) {
  PlacesUIUtils._openNodeIn_org = PlacesUIUtils._openNodeIn;
  PlacesUIUtils._openNodeIn = function xxx_openNodeIn(aNode, aWhere, aWindow) {
    this._openNodeIn_org.apply(this, arguments);
    if (( /* aWhere == "tab" || */ aWhere == "tabshifted")) {
      if (aWindow.document.documentElement.getAttribute("windowtype") != "navigator:browser") {
        aWindow.focus();
      }
    }
  }
}