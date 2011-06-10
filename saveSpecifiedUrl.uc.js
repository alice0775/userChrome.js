// ==UserScript==
// @name           saveSpecifiedUrl.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    urlを指定して保存
// @include        main
// @compatibility  Firefox 3.0 more
// @author         Alice0775
// @version        2009/12/12
// ==/UserScript==
var saveSpecifiedUrl = {
  init: function() {
    var overlay =
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
               xmlns:html="http://www.w3.org/1999/xhtml">
        <menupopup id="menu_FilePopup">
          <menuitem id="menu_saveSpecifiedUrl"
                    label="Save Specified Url"
                    accesskey="U"
                    oncommand="saveSpecifiedUrl.doSaveSpecifiedUrl();"
                    insertbefore="menu_sendLink"/>
        </menupopup>
      </overlay>;
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay.toXMLString());
    window.userChrome_js.loadOverlay(overlay, null);
  },

  doSaveSpecifiedUrl: function() {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
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

    saveURL(url, null, null, true, false, null)
  }
}


saveSpecifiedUrl.init();
