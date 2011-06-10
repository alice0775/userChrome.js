// ==UserScript==
// @name           fixF7keyWarningDialog.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    「今後このダイアログを表示しない」を,いいえを押した場合も記憶する
// @description    もう一度,ダイアログを出したい時はabout:configでaccessibility.warn_on_browsewithcaretをtrueにする
// @description    alt+F7 で トグル
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        LastMod 2007/06/26 19:00
// @Note           Session Managerに対応
// ==/UserScript==
(function(){
  function fixF7keyWarningDialog(event){
    //try{debug("bbb"+event.type);}catch(e){debug("aaa");}
    if(!event){
      var max =  gBrowser.mPanelContainer.childNodes.length;;
      for(var i = 0; i < max; i++){
        gBrowser.getBrowserAtIndex(i).setAttribute("onkeypress", "this.onkeypress(event);");
        gBrowser.getBrowserAtIndex(i).onkeypress = onkeypress;
      }
    }else{
      var browser = event.originalTarget.linkedBrowser;
      browser.setAttribute("onkeypress", "this.onkeypress(event);");
      browser.onkeypress = onkeypress;
    }

    function onkeypress(event){
      if (event.getPreventDefault() || !event.isTrusted)
        return;
      if(event.keyCode == KeyEvent.DOM_VK_F7 && !event.altKey){
        try {
          var isEnabled = this.mPrefs.getBoolPref("accessibility.browsewithcaret_shortcut.enabled");
          if (!isEnabled)
            return;
        } catch (ex) { }

        event.preventDefault()
        event.stopPropagation();

        // Toggle browse with caret mode
        var browseWithCaretOn = false;
        var warn = true;

        try {
          warn = this.mPrefs.getBoolPref("accessibility.warn_on_browsewithcaret");
        } catch (ex) {
        }
        try {
          browseWithCaretOn = this.mPrefs.getBoolPref("accessibility.browsewithcaret");
        } catch (ex) {
        }
        if (warn) {
          var checkValue = {value:false};
          promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

          var buttonPressed = promptService.confirmEx(window,
            this.mStrBundle.GetStringFromName('browsewithcaret.checkWindowTitle'),
            this.mStrBundle.GetStringFromName('browsewithcaret.checkLabel'),
            (promptService.BUTTON_TITLE_YES * promptService.BUTTON_POS_0) +
            (promptService.BUTTON_TITLE_NO * promptService.BUTTON_POS_1),
            null, null, null, this.mStrBundle.GetStringFromName('browsewithcaret.checkMsg'),
            checkValue);
          if (buttonPressed == 0){
            try {
              this.mPrefs.setBoolPref("accessibility.browsewithcaret",true);
            } catch (ex) {
            }
          }else{
            try {
              this.mPrefs.setBoolPref("accessibility.browsewithcaret",false);
            } catch (ex) {
            }
          }
          if (checkValue.value) {
            try {
              this.mPrefs.setBoolPref("accessibility.warn_on_browsewithcaret", false);
            }
            catch (ex) {
            }
          }
        }
      }else if(event.keyCode == KeyEvent.DOM_VK_F7 && event.altKey){
        try {
          var isEnabled = this.mPrefs.getBoolPref("accessibility.browsewithcaret_shortcut.enabled");
          if (!isEnabled)
            return;
        } catch (ex) { }

        event.preventDefault()
        event.stopPropagation();

        try {
          browseWithCaretOn = this.mPrefs.getBoolPref("accessibility.browsewithcaret");
        } catch (ex) {
        }

        // Toggle the pref
        try {
          this.mPrefs.setBoolPref("accessibility.browsewithcaret",!browseWithCaretOn);
        }
        catch (ex) {
        }
      }
    }
    function debug(aMsg){
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      Cc["@mozilla.org/consoleservice;1"]
        .getService(Ci.nsIConsoleService)
        .logStringMessage(aMsg);
    }
  }
  //最初に既にあるタブに対して
  fixF7keyWarningDialog()
  //新たなタブに対して
  gBrowser.tabContainer.addEventListener("TabOpen", fixF7keyWarningDialog, false);
  //復元されたタブに対して
  gBrowser.tabContainer.addEventListener("SSTabRestored", fixF7keyWarningDialog, false);
})();
