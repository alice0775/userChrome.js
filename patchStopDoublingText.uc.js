// ==UserScript==
// @name           patchStopDoublingText.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    確定しないでAlt+Enterで新しいタブで開こうとすると文字列が二重になるのを修正
// @include        main
// @compatibility  Firefox 2.0 3.0 3.5
// @author         Alice0775
// @version        2009/05/14 00:00 isempty
// @version        2008/03/16 16:00 Fx3修正 3.6a1pre以降は不要
// ==/UserScript==
// @version        2008/01/31 20:00
(function(){
  var func = document.getElementById("searchbar").handleSearchCommand.toSource();

  if (getVer() == 2.0){
    //Fx2 + secondSearch
    func = func.replace(
      'this.doSearch(textValue, newTab, aOverride);',
      <><![CDATA[
        var self = this;
        if (aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_RETURN){
          textBox.value = "";
          setTimeout(function(){
            textBox.value = textValue;
            if (textValue != "") self.removeAttribute("empty");
            else {self.setAttribute("empty","true");
            self._textbox._displayCurrentEngine();}
          },100);
        }
        setTimeout(function(){self.doSearch(textValue, newTab, aOverride);},0);
      ]]></>
    );
    //Fx2
    func = func.replace(
      'this.doSearch(textValue, newTab);',
      <><![CDATA[
        var self = this;
        if (aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_RETURN){
          textBox.value = "";
          setTimeout(function(){
            textBox.value = textValue;
            if (textValue != "") self.removeAttribute("empty");
            else {self.setAttribute("empty","true");
            self._textbox._displayCurrentEngine();}
          },100);
        }
        setTimeout(function(){self.doSearch(textValue, newTab);},0);
      ]]></>
    );
  }

  if (getVer() == 3.0){
    //Fx3.0 フォーカス
    func = func.replace(
    /}$/,
    'aEvent.preventDefault();  aEvent.stopPropagation();  focusElement(content);}'
    );
  }

  if (getVer() >= 3.0 && getVer() < 3.6){

    //Fx3 + secondSearch
    func = func.replace(
      'this.doSearch(textValue, where, aOverride)',
       <><![CDATA[
        if (aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_RETURN)
          textBox.value = "";
        var self = this;
        self.doSearch(textValue, where, aOverride);
        if (aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_RETURN)
        setTimeout(function(){
          textBox.value = textValue;
          if (textValue != "") {
            self.textbox.removeAttribute("isempty");
            self.removeAttribute("empty");
          }
          else {
            self.textbox.setAttribute("isempty");
            self.setAttribute("empty","true");
          }
        },100);
      ]]></>
    );
    //Fx3
    func = func.replace(
      'this.doSearch(textValue, where)',
       <><![CDATA[
        if (aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_RETURN)
          textBox.value = "";
        var self = this;
        self.doSearch(textValue, where);
        if (aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_RETURN)
        setTimeout(function(){
          textBox.value = textValue;
          if (textValue != "") {
            self.textbox.removeAttribute("isempty");
            self.removeAttribute("empty");
          }
          else {
            self.textbox.setAttribute("isempty");
            self.setAttribute("empty","true");
          }
        },100);
      ]]></>
    );
  }

  //TMP
  func = func.replace(
    'TMP_SearchLoadURL(textValue, aEvent, true)',
    <><![CDATA[
    var self = this;
    if (aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_RETURN){
      textBox.value = "";
      setTimeout(function(){
        textBox.value = textValue;
        if (textValue != "") self.removeAttribute("empty");
        else {self.setAttribute("empty","true");
        self._textbox._displayCurrentEngine();}
      },100);
    }
    setTimeout(function(){TMP_SearchLoadURL(textValue, aEvent, true)},0);
    ]]></>
  );

  eval('document.getElementById("searchbar").handleSearchCommand = ' + func);

  //Fxのバージョン
  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }
})();
