// ==UserScript==
// @name           ucjs_clearfield
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    テキストエリア等,Findbar, Serachbarコンテキストメニューにクリアを追加
// @include        main
// @compatibility  Firefox 2 - 9
// @author         Alice0775
// @version        LastMod 2011/08/29 13:00
// @version        LastMod 2008/05/17 20:00
// @Note
// ==/UserScript==

var ucjs_clearfield = {

  init: function(){
    if (!document.getElementById("clearFileField_contentAreaContextmenu")) {
      var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      UI.charset = "UTF-8";
      var menuitem = document.createElement("menuitem");
      menuitem.setAttribute("id", "ucjs_clearfield_menu");
      var l = "クリア";
      try {l = UI.ConvertToUnicode(l)} catch(e){}
      menuitem.setAttribute("label", l);
      menuitem.setAttribute("hidden", true);
      menuitem.setAttribute("accesskey","X");
      menuitem.setAttribute("oncommand", "gContextMenu.target.value = '';");
      var optionsitem = document.getElementById("context-cut");
      optionsitem.parentNode.insertBefore(menuitem, optionsitem);
      //コンテキストメニューポップアップイベント追加
      var menu = document.getElementById("contentAreaContextMenu");
      if (menu) menu.addEventListener("popupshowing", ucjs_clearfield.popupContextMenu, true);
    }
  },


  popupContextMenu: function(){
    //テキストインプットならucjs_clearfield_menuを表示
    if (gContextMenu){
      gContextMenu.showItem("ucjs_clearfield_menu", gContextMenu.onTextInput);

      if(gContextMenu.target && gContextMenu.target.hasAttribute('nodeName') && gContextMenu.target.nodeName == 'INPUT' && gContextMenu.target.getAttribute('type') != 'text') return;
      if(gContextMenu.target && gContextMenu.target.value =="")
        document.getElementById("ucjs_clearfield_menu").setAttribute("disabled", true);
      else
        document.getElementById("ucjs_clearfield_menu").removeAttribute("disabled");
    }
  },


//////////////////////////////XUL elemnts
  initxul: function(){
    //urlbar,findbar,searchbarコンテキストメニューポップアップイベント追加
    ucjs_clearfield.addxultarget("urlbar");

    if ('historyFindbar' in window) {
      setTimeout(function() {
        ucjs_clearfield.addxultarget("find-field2");
      }, 2000);
    }

    if('gFindBar' in window && 'onFindAgainCommand' in gFindBar ){ // Fx3
      document.getAnonymousElementByAttribute(gFindBar, "anonid", "findbar-textbox").id = "findbar-textbox";
      ucjs_clearfield.addxultarget("findbar-textbox");
    }else if(typeof gFindBar == "object") { //Bon Echo 2.0a3
      ucjs_clearfield.addxultarget("find-field");
    }

    ucjs_clearfield.addxultarget("searchbar");
  },

  //targetにコンテキストメニューポップアップ追加
  addxultarget: function(target){
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    if(!document.getElementById(target)) return;
    document.getElementById(target).addEventListener("popupshowing", function(event){
        if(document.getElementById(target).value == "")
          var cannotCut = "true";
        else
          var cannotCut = "false";
        var menuitem = document.getElementById("ucjs_clearfield_" + target);
        if (!menuitem) {
            menuitem = document.createElement("menuitem");
            menuitem.id = "ucjs_clearfield_" + target;
            var l = "クリア";
            try {l = UI.ConvertToUnicode(l)} catch(e){}
            menuitem.setAttribute("label", l);
            menuitem.setAttribute("accesskey", "X");
            menuitem.setAttribute("oncommand", "document.getElementById(\""+target+"\").value = '';");
            var menupopup = event.originalTarget;
            var refChild = menupopup.getElementsByAttribute("cmd", "cmd_cut")[0];
            menupopup.insertBefore(menuitem, refChild);
        }
        menuitem.setAttribute("disabled", cannotCut);
    }, false);
  }
}

ucjs_clearfield.init();
ucjs_clearfield.initxul();
(function(){
  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }
  //if(getVer()<3){
    document.getElementById("cmd_CustomizeToolbars").addEventListener("DOMAttrModified", function(e) {
      if (e.attrName == "disabled" && !e.newValue)
        ucjs_clearfield.addxultarget("urlbar");
        ucjs_clearfield.addxultarget("searchbar");
    }, false);
  //}
})();