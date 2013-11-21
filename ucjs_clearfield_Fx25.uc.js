// ==UserScript==
// @name           ucjs_clearfield_Fx25.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    テキストエリア等,Findbar, Serachbarコンテキストメニューにクリアを追加
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 25
// @author         Alice0775
// @version        2013/11/16 12:30 Firefox25
// @Note
// ==/UserScript==

var ucjs_clearfield = {

  init: function(){
    var menu = document.getElementById("contentAreaContextMenu");
    if (menu && !document.getElementById("clearFileField_contentAreaContextmenu")) {
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
      menu.addEventListener("popupshowing", ucjs_clearfield.popupContextMenu, true);
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
    //urlbar, searchbar
    ucjs_clearfield.addxultarget("urlbar");
    ucjs_clearfield.addxultarget("searchbar");

    //findbar
    if ('historyFindbar' in window) {
      setTimeout(function() {
        ucjs_clearfield.addxultarget("find-field2");
      }, 2000);
    }

    //fx25 for existing findbar
    let findBars = document.querySelectorAll("findbar");
    if (findBars.length > 0) {
      Array.forEach(findBars, function (aFindBar) {
        ucjs_clearfield.addxultarget(aFindBar._findField);
      });
    } else if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar)
        ucjs_clearfield.addxultarget(gBrowser.selectedTab._findBar._findField);
    }
    //fx25 for newly created findbar
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
        ucjs_clearfield.addxultarget(event.target._findBar._findField);
      });
    }

  },

  //targetにコンテキストメニューポップアップ追加
  addxultarget: function(target){
    var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    UI.charset = "UTF-8";
    target = (typeof target == "string" ? document.getElementById(target) : target);
    if(!target) return;
      target.addEventListener("popupshowing", function(event) {
        if (/autocomplete-result-popupset/.test(event.originalTarget.classNmae))
          return;
        if (event.target.value == "")
          var cannotCut = "true";
        else
          var cannotCut = "false";
        var menupopup = event.originalTarget;
        var menuitem = menupopup.querySelector(".ucjs_clearfield");;
        if (!menuitem) {
          menuitem = document.createElement("menuitem");
          menuitem.target = event.target
          var l = "クリア";
          try {l = UI.ConvertToUnicode(l)} catch(e){}
          menuitem.setAttribute("label", l);
          menuitem.setAttribute("accesskey", "X");
          menuitem.setAttribute("oncommand", "this.target.value = '';");
          menuitem.classList.add("ucjs_clearfield");
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
  window.addEventListener("aftercustomization",  function(e) {
      ucjs_clearfield.addxultarget("urlbar");
      ucjs_clearfield.addxultarget("searchbar");
  }, false);
})();