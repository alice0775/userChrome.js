// ==UserScript==
// @name           Patch_XULrubySupport.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    XUL/Ruby Suppot パッチ
// @include        main
// @compatibility  Firefox 3.0
// @author         Alice0775
// @version        LastMod 2009/06/11
// @Note           3.0.2009060901用
// @Note           rubysupport.add.ignore.always       :trueとすることでデフォルトでルビ変換しない
// @Note           rubysupport.add.allowexecute.site   :変換を常に許可するサイトをスペース区切り
// ==/UserScript==
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include        chrome://browser/content/history/history-panel.xul
// @include        chrome://browser/content/web-panels.xul
(function(){
  if(typeof RubyService =='undefined' ) {
      debug('XUL/Ruby Suppot: ','Not found.');
    return;
  }

  try{
    var func = RubyService.processRubyNodes.toSource();
    func = func.replace(
      'if (!aWindow.document) {return false;}',
    <><![CDATA[
       $&
       if (!Patch_XULrubySupport.allowexecute(aWindow))
         return false;
    ]]></>
    );
    eval("RubyService.processRubyNodes = " + func);
    func = RubyService.handleEvent.toSource();
    func = func.replace(
      'case "MozAfterPaint":',
    <><![CDATA[
       $&
       return;
    ]]></>
    );
    eval("RubyService.handleEvent = " + func);
  }catch(e){
    debug('RubyService.processRubyNodes: ','Error, Could not be replace.');
  }
  function debug(aScript, aMsg){
    const Cc = Components.classes;
    Cc['@mozilla.org/consoleservice;1']
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aScript + aMsg);
  }
  debug('RubyService.processRubyNodes: ','Successfully replaced.');

})();



var Patch_XULrubySupport = {
  EXECUTEURL:[],

  debug:function(aMsg){
    const Cc = Components.classes;
    Cc['@mozilla.org/consoleservice;1']
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aMsg);
  },

  init: function(){
    const kXULNS =
           "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    Patch_XULrubySupport.addPrefListener(Patch_XULrubySupport.PrefListener); // 登録処理
    Patch_XULrubySupport.initEXECUTEURL();

    var menu = document.createElementNS(kXULNS, "menu");
    menu.setAttribute("id", "Patch_XULrubySupportMenu");
    menu.setAttribute("label", "XHTML Ruby Support\u306e\u8a2d\u5b9a");
    menu.setAttribute("accesskey", "r");
    var optionsitem = document.getElementById("prefSep").nextSibling;
    optionsitem.parentNode.insertBefore(menu, optionsitem);

    var menupopup = document.createElementNS(kXULNS, "menupopup");
    menupopup.setAttribute("onpopupshowing", "Patch_XULrubySupport.setMenuCheck();");
    menupopup.setAttribute("menugenerated", "true");
    menu.appendChild(menupopup);

    var menuitem = document.createElementNS(kXULNS, "menuitem");
    menuitem.setAttribute("id", "Patch_XULrubySupport");
    menuitem.setAttribute("label", "\u30eb\u30d3\u5909\u63db\u3092\u57fa\u672c\u7121\u52b9\u3068\u3059\u308b");
    menuitem.setAttribute("accesskey", "e");
    menuitem.setAttribute("type", "checkbox");
    menuitem.setAttribute("autocheck", "false");
    menuitem.setAttribute("oncommand", "Patch_XULrubySupport.toggle();");
    menupopup.appendChild(menuitem);

    var menuitem = document.createElementNS(kXULNS, "menuitem");
    menuitem.setAttribute("label", "\u30eb\u30d3\u3092\u5e38\u306b\u5909\u63db\u3059\u308b\u30b5\u30a4\u30c8\u767b\u9332");
    menuitem.setAttribute("accesskey", "r");
    menuitem.setAttribute("oncommand", "Patch_XULrubySupport.inputSite();");
    menupopup.appendChild(menuitem);
  },

  uninit: function(){
    Patch_XULrubySupport.removePrefListener(Patch_XULrubySupport.PrefListener); // 登録処理
  },

  toggle:function(){
    var ignore = this.getPref('rubysupport.add.ignore.always','bool', false)
    this.setPref('rubysupport.add.ignore.always', 'bool', !ignore)
  },

  setMenuCheck: function() {
    var ignore = this.getPref('rubysupport.add.ignore.always','bool', false)
    var menuitem = document.getElementById('Patch_XULrubySupport');
    menuitem.setAttribute('checked', ignore);
  },

  initEXECUTEURL: function(){
    this.EXECUTEURL = this.getPref('rubysupport.add.allowexecute.site', 'str', '').split(' ');
    for(aURL in this.EXECUTEURL) {
      if(this.EXECUTEURL[aURL] !==''){
        try{
          this.EXECUTEURL[aURL] = Patch_XULrubySupport.convert2RegExp(this.EXECUTEURL[aURL]);
        }catch(ex){}
      }else
         this.EXECUTEURL[aURL] ='';
    }

  },

  allowexecute: function(w){
    if( !this.getPref('rubysupport.add.ignore.always','bool', false)) return true;
    //this.debug(w.location.href);
    for(aURL in this.EXECUTEURL) {
      if(this.EXECUTEURL[aURL] === '')continue;
      try{
        if (this.EXECUTEURL[aURL].test(w.location.href)) return true;
      }catch(ex){}
    }
    return false;
  },

  inputSite:function(){
    var text =  this.getPref('rubysupport.add.allowexecute.site', 'str', '');
    text = window.prompt('\u30eb\u30d3\u5909\u63db\u3092\u8a31\u53ef\u3059\u308b\u30b5\u30a4\u30c8\u767b\u9332(\u30b9\u30da\u30fc\u30b9\u3067\u533a\u5207\u308b)', text);
    this.setPref('rubysupport.add.allowexecute.site', 'str', text)
  },

  convert2RegExp: function( pattern ) {
    var s = new String(pattern);
    var res = new String('^');

    for (var k = 0 ; k < s.length ; k++) {
      switch(s[k]) {
        case '*' :
          res += '.*';
          break;
        case '.' :
        case '?' :
        case '^' :
        case '$' :
        case '+' :
        case '{' :
        case '[' :
        case '|' :
        case '(' :
        case ')' :
        case ']' :
          res += '\\' + s[k];
          break;
        case '\\' :
          res += '\\\\';
          break;
        case ' ' :
          // Remove spaces from URLs.
          break;
        default :
          res += s[k];
          break;
      }
    }

    // fortunately, we don't need .tld in chrome :)
    return new RegExp(res +'$', 'i');
  },

  getPref: function(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefService);
    try{
      switch (aPrefType){
        case 'str':
          return xpPref.getCharPref(aPrefString).toString(); break;
        case 'int':
          return xpPref.getIntPref(aPrefString); break;
        case 'bool':
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  },
  setPref: function(aPrefString, aPrefType, aValue){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefService);
    try{
      switch (aPrefType){
        case 'str':
          return xpPref.setCharPref(aPrefString, aValue); break;
        case 'int':
          aValue = parseInt(aValue);
          return xpPref.setIntPref(aPrefString, aValue);  break;
        case 'bool':
        default:
          return xpPref.setBoolPref(aPrefString, aValue); break;
      }
    }catch(e){
    }
    return null;
  },
//Thanks Piro.
  // 監視を開始する
  addPrefListener: function(aObserver) {
      try {
          var pbi = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch2);
          pbi.addObserver(aObserver.domain, aObserver, false);
      } catch(e) {}
  },

  // 監視を終了する
  removePrefListener: function(aObserver) {
      try {
          var pbi = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch2);
          pbi.removeObserver(aObserver.domain, aObserver);
      } catch(e) {}
  },

  PrefListener:{
      domain  : 'rubysupport.add',
          //'rubysupport.add.XXX'という名前の設定が変更された場合全てで処理を行う

      observe : function(aSubject, aTopic, aPrefstring) {
          if (aTopic == 'nsPref:changed') {
              // 設定が変更された時の処理
              Patch_XULrubySupport.initEXECUTEURL();
          }
      }
  }
}
Patch_XULrubySupport.init();
window.addEventListener('unload', function(){ Patch_XULrubySupport.uninit(); }, false);

