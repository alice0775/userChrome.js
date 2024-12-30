// ==UserScript==
// @name           saveSpecifiedUrl.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    urlを指定して保存
// @include        main
// @compatibility  Firefox 135
// @author         Alice0775
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2024/12/15 00:00 fix Bug 1898380 - Replace the "unsaved changes" dialog in the PDF viewer with a clearer design
// @version        2023/01/15 00:00 fix Bug 1808115 - Remove the separate EmbedPrompter wrapper, use Prompter directly instead
// @version        2022/07/25 23:00 fix Bug 1766030 take3
// @version        2022/07/25 23:00 fix Bug 1766030
// @version        2020/12/19 15:00 remove refferer
// @version        2020/12/19 00:00 Bug 1641270 - Saving already-loaded images from a webpage yields "not an image".
// @version        2019/05/21 08:30 fix 69.0a1 Bug 1551320 - Replace all createElement calls in XUL documents with createXULElement
// @version        2019/09/26 23:00 60+
// @version        2013/01/19 23:20 Bug 795065 Add privacy status to nsDownload
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2009/12/12
// ==/UserScript==
var saveSpecifiedUrl = {
  init: function() {
    let menuitem = document.createXULElement("menuitem");
    menuitem.setAttribute("id", "menu_saveSpecifiedUrl");
    menuitem.setAttribute("label", "Save Specified Url");
    menuitem.setAttribute("accesskey", "U");
    menuitem.addEventListener("command", () => saveSpecifiedUrl.doSaveSpecifiedUrl());
    //menuitem.setAttribute("oncommand", "saveSpecifiedUrl.doSaveSpecifiedUrl();");
    let ref = document.getElementById("menu_sendLink");
    ref.parentNode.insertBefore(menuitem, ref);
  },

  doSaveSpecifiedUrl: function() {
    var prompts = Components.classes["@mozilla.org/prompter;1"]
                        .getService(Components.interfaces.nsIPromptService);
    var check = {value: false};               // default the checkbox to false
    var input = {value: ""};                  // default the edit field to Bob
    var result = prompts.prompt(null, "Save Specified Url", "Please Input a URL?", input, null, check);
    // result is true if OK is pressed, false if Cancel. input.value holds the value of the edit field if "OK" was pressed.
    if (!result)
      return;

    var url = input.value;
    if (!url)
      return;

    let cookieJarSettings =  gBrowser.selectedBrowser.cookieJarSettings;
    //saveURL(aURL, aOriginalURL, aFileName, aFilePickerTitleKey, aShouldBypassCache,
    //        aSkipPrompt, aReferrer, aCookieJarSettings,
    //        aSourceDocument,
    //        aIsContentWindowPrivate,
    //        aPrincipal,
    //        aSaveCompleteCallback)
    saveURL(
        url,
        null,
        null,
        null,
        true,
        false,
        null,
        null,
        null,
        PrivateBrowsingUtils.isWindowPrivate(window),
        Services.scriptSecurityManager.createNullPrincipal({}),
        null
      );
  }
}


saveSpecifiedUrl.init();
