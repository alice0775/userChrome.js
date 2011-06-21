// ==UserScript==
// @name           patchForBug526163_AttachmentIcon.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Thunderbird3 -win, メッセージ作成ウインドウにおいて添付ファイルのアイコンが不正になるのを修正(マルチバイト文字を含むパスの場合は拡張子に応じたアイコンにする)( Bug 526163 -  Compose Window: Attachment icons inconsistent (wrong icon for attached files with umlauts äöü in filename/filepath)  )
// @include        chrome://messenger/content/messengercompose/messengercompose.xul
// @compatibility  Thunderbird3 only
// @author         Alice0775
// @version        2009/12/16
// ==/UserScript==
// 1.9.1 and over, but below 1.9.2
(function(){

  if (geckoVersionCompare("1.9.1") > 0  || geckoVersionCompare("1.9.2") < 1 )
  return;

  /**
    * 指定したバージョン文字列と現在の Gecko のバージョンを比較する
    * @param {String} aVersion バージョン文字列(e.g. "1.8" "1.7.5")
    * @return {Number}
    * 実際のバージョンより指定したバージョンの方が新しければ 1、同じなら 0、古ければ -1
    * @see nsIVersionComparator
    * 例Gecko 1.9.0の環境で geckoVersionCompare("1.9.1") とすれば1
    * 例Gecko 1.9.0の環境で geckoVersionCompare("1.8.5") とすれば-1が返される
  */
  function geckoVersionCompare(aVersion) {
    var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                            .getService(Components.interfaces.nsIVersionComparator);
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                  .getService(Components.interfaces.nsIXULAppInfo);
    return versionComparator.compare(aVersion, appInfo.platformVersion);
  }


  var func = AddUrlAttachment.toString();
  func = func.replace(
    'item.setAttribute("image", "moz-icon:" + attachment.url);',
    <><![CDATA[
    $&
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    var aExtension;
    //alert(attachment.url)
    try {
      var dec = decodeURIComponent(attachment.url);
      var utf8 = UI.ConvertFromUnicode(dec);
      var uni = UI.ConvertToUnicode(utf8);
      if (utf8 != uni) {
        attachment.url.match(/(\..+)$/);
        if (RegExp.$1)
          item.setAttribute("image", "moz-icon:" + RegExp.$1);
      }
    } catch (ex) {}
    ]]></>
  );

  eval("AddUrlAttachment = " + func);
})();