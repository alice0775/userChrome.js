// ==UserScript==
// @name           openTabsWhere_whichTabSelectWhenCloseTab
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @author         OpenTabsWhere(open-tabs-next.uc.js) nanto_vi (TOYAMA Nao), 2006-12-30
// @include        main
// @compatibility  Firefox 2.0, 3.0の検証は未完
// @modified by    Alice0775
// @version        2009/07/19 ついでにD&Dの移動時も未読がどうのこうの
// @version        2009/07/19 未読がどうのこうの
// @version        2008/12/21 mTabを使うように
// @version        2008/07/18 22:00 Tree Style TabやTab Mix Plusがある場合はなにもしない
// @note           browser.tabs.insertRelatedAfterCurrent は false としておくこと
// ==/UserScript==

(function OpenTabsWhere() {
  if('TM_init' in window) return;
  if('TreeStyleTabService' in window) return;
  // --- config ---
  //(asLinkPosition()によるに基づき位置決定 )
  //"LINKONLYNEXT":リンクは右隣, それ以外は最右端,  "NEXT":全部右隣, "FARRIGHT":全部最右端
  const WHERE = "LINKONLYNEXT";
  //"LINKONLYNEXT","NEXT"のとき, 0:いつも直ぐ右隣(C321), 1:順次隣(C123)
  const INCREMENT = 1;
  //コンテンツエリアコンテキストメニュー, ConQueriModoki2およびDragNDropModoki3からの新規タブ位置は, WHEREとする
  const SEARCHfromCONTENTAREA = true;

  //true: asDefaultFocus()による
  //false:すべてブラウザ既定による
  const FORCEFOCUS = true;

  //target="_blank"のリンクについて, browser.link.open_newwindowの値が 3 のときは本スクリプト通りとするか?
  const TREATEQUALLY = true;
  const IGNOREEXT = "(\.wmv|\.wma|\.divx|\.xpi|\.zip|\.rar|\.exe|\.tar|\.jar|\.gzip|\.gz|\.ace|\.bin|\.doc|\.xls|\.mdb|\.ppt|\.iso|\.7z|\.cab|\.arj|\.lzh|\.uue|torrent|\/view=att&disp=attd.*|\/disp=attd&view=att.*|\.php\?attachmentid=.*|\.php\?act=Attach&type=post&id=.*|\/download\.(php|asp)\?.*)$";

  // --- config end ---
  // --- about:config では---
  //userChrome.openTabsWhere.WHERE
  //userChrome.openTabsWhere.INCREMENT
  //userChrome.openTabsWhere.SEARCHfromCONTENTAREA
  //userChrome.openTabsWhere.FORCEFOCUS
  //userChrome.openTabsWhere.TREATEQUALLY
  //userChrome.openTabsWhere.DEBUG
  //
  var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].
                           getService(Components.interfaces.nsISessionStore);
  var loadBookmarksInBackground, loadInBackground, loadDivertedInBackground, loadSearchInBackground, loadUrlInBackground;

  //
  //呼び出し元の判定 FORCEFOCUS=trueのとき, ブラウザ既定ならtrue, 強制フォーカスするならfalse
  //
  function asDefaultFocus(){
    var max =50;
    var caller = arguments.callee.caller;
    while(caller && max>0){
      //debug("asDefaultFocus : "+caller.name+"\n"+caller);
      /*ここから*/
      //強制フォーカスするかどうか呼び出し元メソッド名等で判定する
      if( caller.name == "onclick" || caller.name == "onxblclick"){
        var event =  caller.arguments[0];
        if(event){
          var target = event.target;
          while(target){
            //debug("asDefaultFocus : click : target.nodeName/localName \n"+target.nodeName +" \n"+target.localName);
            //if(target.hasAttribute && target.hasAttribute('id'))debug("target.id \n"+target.getAttribute('id'));
            if(target instanceof HTMLAnchorElement ||
                   target instanceof HTMLAreaElement ||
                   target instanceof HTMLLinkElement) {
              if (target.hasAttribute("href")) return true; //リンクなので, ブラウザ既定
            }
            if(target.hasAttribute && target.hasAttribute('id')){
              if(target.getAttribute('id') == 'home-button') return false;   //FORCEFOCUS
              if(target.getAttribute('id') == 'go-button') return false;     //FORCEFOCUS
              if(target.getAttribute('id') == 'searchbar') return false;     //FORCEFOCUS
              if(target.getAttribute('id') == 'go-menu') return true;            //ブラウザ既定
              if(target.getAttribute('id') == 'history-menu') return true;       //ブラウザ既定
              if(target.getAttribute('id') == 'bookmarks-menu') return true;     //ブラウザ既定
              if(target.getAttribute('id') == 'bookmarksMenu') return true;      //ブラウザ既定
              if(target.getAttribute('id') == 'personal-bookmarks') return true; //ブラウザ既定
            }
            target = target.parentNode;
          }
        }
        return true; //ブラウザ既定
      }

      if( caller.name == "onKeyPress" ){
        var event =  caller.arguments[0];
        if(event){
          var target = event.target;
          while(target){
            //debug("asDefaultFocus : onKeyPress : target.nodeName/localName \n"+target.nodeName +" \n"+target.localName);
            if(target.hasAttribute && target.hasAttribute('id')){
              //if(target.hasAttribute('id'))debug("target.id \n"+target.getAttribute('id'));
              if(target.getAttribute('id') == 'searchbar') return false; //FORCEFOCUS
              if(target.getAttribute('id') == 'urlbar')    return false; //FORCEFOCUS
            }
            target = target.parentNode;
          }
        }
      }
      if( getPref("userChrome.openTabsWhere.SEARCHfromCONTENTAREA", "bool", SEARCHfromCONTENTAREA) ){
        if( caller.name == "oncommand"){
          var event =  caller.arguments[0];
          if(event){
            var target = event.target;
            while(target){
              //debug("asDefaultFocus : oncommand : target.nodeName/localName \n"+target.nodeName +" \n"+target.localName);
              if(target == document.getElementById("contentAreaContextMenu")) return true;//コンテキストメニューはブラウザ既定
              target = target.parentNode;
            }
          }
        }
      }
      if( /conqueryModoki/.test(caller) ) return false;//ConQueriModoki2からの検索はFORCEFOCUS
      if( /\bloadSearch\b/.test(caller) ) return true; //DragNDropModoki4からの検索はDragNDropModoki4の設定

      if( caller.name == "loadSearch") return true;    //DragNDropModoki3からの検索はDragNDropModoki4の設定
      if( caller.name == "ondragdrop")  return true;   //他ウインドウD&D?, サイドバーD&D? DragNDropModoki3/4の設定
      //if( caller.name == "OTN_contentAreaClick") return true;  //リンクtarget_blunk, TREATEQUALLY=trueのとき, ブラウザ既定
      if( caller.name == "openNewTabWith")return true; //DragNDropModoki4等と, target=_blunkでTREATEQUALLY=trueのときブラウザ既定
      //

      /*ここまで*/
      caller = caller.caller;
      max--;
    }
    return true; //外部D&D?またはサイドバークリック?,  ブラウザ既定
  }

  //
  //呼び出し元の判定  WHEREの位置ならtrue, ブラウザ既定ならfalse
  //
  function asLinkPosition(){
    var event;
    var max =50;
    var caller = arguments.callee.caller;
    while(caller && max>0){
      //debug("asLinkPosition : "+caller.name+"\n"+caller);
      /*ここから*/
      //WHEREを適用するかどうか呼び出し元メソッド名等で判定する
      if( caller.name == "onclick" || caller.name == "onxblclick"){
        event =  caller.arguments[0];
        if(event){
          var target = event.target;
          while(target){
            //debug("asLinkPosition : click : target.nodeName/localName \n"+target.nodeName +" \n"+target.localName);
            if(target instanceof HTMLAnchorElement ||
                   target instanceof HTMLAreaElement ||
                   target instanceof HTMLLinkElement) {
              if (target.hasAttribute("href")) return true; //リンクなので WHEREとする
            }
            if(target.hasAttribute && target.hasAttribute('id')){
              if(target.getAttribute('id') == 'home-button') return false;    //ブラウザ既定
              if(target.getAttribute('id') == 'go-button') return false;      //ブラウザ既定
              if(target.getAttribute('id') == 'searchbar') return false;      //ブラウザ既定
              if(target.getAttribute('id') == 'go-menu') return false;        //ブラウザ既定
              if(target.getAttribute('id') == 'history-menu') return false;       //ブラウザ既定
              if(target.getAttribute('id') == 'bookmarks-menu') return false;     //ブラウザ既定
              if(target.getAttribute('id') == 'bookmarksMenu') return false;      //ブラウザ既定
              if(target.getAttribute('id') == 'personal-bookmarks') return false; //ブラウザ既定
            }
            target = target.parentNode;
          }
        }
        return false; //ブラウザ既定
      }

      if( caller.name == "onKeyPress" ){
        event =  caller.arguments[0];
        if(event){
          var target = event.target;
          while(target){
            //debug("asLinkPosition : onKeyPress : target.nodeName/localName \n"+target.nodeName +" \n"+target.localName);
            if(target.hasAttribute && target.hasAttribute('id')){
              if(target.getAttribute('id') == 'searchbar') return false; //ブラウザ既定
              if(target.getAttribute('id') == 'urlbar')    return false; //ブラウザ既定
            }
            target = target.parentNode;
          }
        }
      }
      if( getPref("userChrome.openTabsWhere.SEARCHfromCONTENTAREA", "bool", SEARCHfromCONTENTAREA) ){
        if( caller.name == "oncommand"){
          var event =  caller.arguments[0];
          if(event){
            var target = event.target;
            while(target){
              //debug("asLinkPosition : oncommand : target.nodeName/localName \n"+target.nodeName +" \n"+target.localName);
              if(target == document.getElementById("contentAreaContextMenu")) return true;//コンテキストメニューからはWHEREとする
              target = target.parentNode;
            }
          }
        }
        if( /conqueryModoki/.test(caller) ) return true;//ConQueriModoki2からの検索はWHEREとする
        if( /\bloadSearch\b/.test(caller)) return true; //DragNDropModoki4からの検索はWHEREとする
        if( caller.name == "loadSearch") return true;   //DragNDropModoki3からの検索はWHEREとする
      }
      if( caller.name == "ondragdrop")  return false;   //他ウインドウD&D?またはサイドバーD&D?から ブラウザ既定
      //if( caller.name == "OTN_contentAreaClick")  return true; //リンクtarget_blunk, TREATEQUALLY=trueのとき, WHEREとする
      if( caller.name == "openNewTabWith")return true;  //DragNDropModoki4等と, target=_blunkでTREATEQUALLY=trueのときWHEREとする



      /*ここまで*/
      caller = caller.caller;
      max--;
    }
    return false; //外部D&D?またはサイドバークリック?, ブラウザ既定
  }

  //
  //呼び出し元の判定 何も処理しないならtrueを返す
  //
  function isIgnore(){
    var max =50;
    var caller = arguments.callee.caller;
    while(caller && max>0){
      //debug(caller.name+"\n"+caller);
      /*ここから*/
      //必要に応じて処理しない呼び出し元メソッド名等で判定する
      //※duplicateTabInContextMenu
      if( caller.name == "oncommand" && /duplicateTabInContextMenu/.test(caller) ) return true;
      if( caller.name == "BrowserOpenTab"  ) return true;
      /*ここまで*/
      caller = caller.caller;
      max--;
    }
    return false; //処理する
  }

  //target == "_blank" なリンクの処理を横取り(イベント捕捉バージョン)
  document.getElementById("appcontent").addEventListener("click",
    function OTN_contentAreaClick(event, fieldNormalClicks) {
      if (!getPref("userChrome.openTabsWhere.TREATEQUALLY", "bool", TREATEQUALLY) ) return true;
      if (!(event.button == 0 && !event.ctrlKey && !event.shiftKey &&
           !event.altKey && !event.metaKey)) return true;
      if (!event.isTrusted) {
       return true;
      }

      var target = event.target;
      var linkNode;

      if (target instanceof HTMLAnchorElement ||
           target instanceof HTMLAreaElement ||
           target instanceof HTMLLinkElement) {
        if (target.hasAttribute("href"))
          linkNode = target;

        var parent = target.parentNode;
        while (parent) {
         if (parent instanceof HTMLAnchorElement ||
             parent instanceof HTMLAreaElement ||
             parent instanceof HTMLLinkElement) {
             if (parent.hasAttribute("href"))
               linkNode = parent;
         }
         parent = parent.parentNode;
        }
      } else {
        linkNode = event.originalTarget;
        while (linkNode && !(linkNode instanceof HTMLAnchorElement))
         linkNode = linkNode.parentNode;
        // <a> cannot be nested.  So if we find an anchor without an
        // href, there is no useful <a> around the target
        if (linkNode && !linkNode.hasAttribute("href"))
         linkNode = null;
      }
      var wrapper = null;
      if (linkNode) {
        wrapper = linkNode;
        // javascript links should be executed in the current browser
        if (wrapper.href.substr(0, 11) === "javascript:")
          return true;
        // data links should be executed in the current browser
        if (wrapper.href.substr(0, 5) === "data:")
          return true;
        target = wrapper.getAttribute("target");
        var docWrapper = wrapper.ownerDocument;
        var locWrapper = docWrapper.location;
        if (target == "_blank" && gPrefService.getIntPref("browser.link.open_newwindow") == 3){
          if (!wrapper.href)
            return true;
          var ext = getPref("userChrome.openTabsWhere.IGNOREEXT", "str", IGNOREEXT);
          if((new RegExp(ext,"i").test(wrapper.href)) ) return true;

          if(getVer()<3){
            try {
              urlSecurityCheck(wrapper.href, locWrapper.href);
            }catch(ex) {
              return false;
            }
            openNewTabWith(wrapper.href, locWrapper.href, null, event, false);
          }else{
            try {
              urlSecurityCheck(wrapper.href, wrapper.ownerDocument.nodePrincipal);
            }catch(ex) {
              return false;
            }
            openNewTabWith(wrapper.href, event.target.ownerDocument, null, event, false);
          }
          event.stopPropagation();
          event.preventDefault();
          return false;
        }
      }
      return true;
    } , false);

  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }

  //デバッグ用
  function debug(aMsg){
    //if( !getPref("userChrome.openTabsWhere.DEBUG", "bool", false) ) return
        const Cc = Components.classes;
        const Ci = Components.interfaces;
        Cc["@mozilla.org/consoleservice;1"]
          .getService(Ci.nsIConsoleService)
          .logStringMessage(aMsg);
  }

  gBrowser.tabContainer.addEventListener("TabOpen", function OTN_onTabOpen(aEvent) {
//alert("TabOpen"+aEvent.originalTarget._tPos);
    if(isIgnore()) return;
    var aTab = aEvent.target;
    var aTabpos = aTab._tPos;

    var prefWHERE = getPref("userChrome.openTabsWhere.WHERE", "str", WHERE);
    if( prefWHERE != "FARRIGHT") {
      debug("*LINKONLYNEXT/NEXT asLlink=" + asLinkPosition() +" || "+ (prefWHERE != "LINKONLYNEXT") );
      if( (prefWHERE != "LINKONLYNEXT" || asLinkPosition()) ){
        var pTab = this.mCurrentTab;
        aTabpos = ((getPref("userChrome.openTabsWhere.INCREMENT", "int", INCREMENT)==1)?getMostRightChildTab(pTab):pTab)._tPos + 1;

        if (aTabpos != aTab._tPos) {
          this.moveTabTo(aTab, aTabpos);
        }

        setParentTab(aTab, pTab)
      }
    }

    debug("*FORCEFOCUS=" + !asDefaultFocus() +" && "+ getPref("userChrome.openTabsWhere.FORCEFOCUS", "bool", FORCEFOCUS)  );
    if(getPref("userChrome.openTabsWhere.FORCEFOCUS", "bool", FORCEFOCUS) && !asDefaultFocus() ){
      this.mCurrentTab._selected = false;
      this.selectedTab = this.mTabs[aTabpos];
    }
  }, false);

  function getMostRightChildTab(pTab){
    if( !pTab.hasAttribute("Olinkedpanel")) return pTab;
    var mTabChilds = gBrowser.mTabs;
    var Olinkedpanel = pTab.getAttribute("Olinkedpanel");
    var rTab = pTab;
    for(var i= pTab._tPos+1,len=mTabChilds.length;i<len;i++){
      var aTab = mTabChilds[i];
      if(aTab.hasAttribute("Plinkedpanel")
         && aTab.getAttribute("Plinkedpanel").indexOf(Olinkedpanel) > -1){
        rTab = aTab;
      }else{
        break;
      }
    }
    if(rTab == null ) rTab = pTab;
    return rTab;
  }

  //親子関係セット
  function setParentTab(kTab,pTab){
    var Plinkedpanel, Olinkedpanel;
    if( pTab.hasAttribute("Olinkedpanel")){
      Olinkedpanel = pTab.getAttribute("Olinkedpanel");
    }else{
      Olinkedpanel = pTab.getAttribute("linkedpanel");
      pTab.setAttribute("Olinkedpanel", Olinkedpanel);
      saveForTab(pTab, "Olinkedpanel", Olinkedpanel);
    }
    if( pTab.hasAttribute("Plinkedpanel") )
      Plinkedpanel = Olinkedpanel + " " + pTab.getAttribute("Plinkedpanel");
    else
      Plinkedpanel = Olinkedpanel;
    kTab.setAttribute("Plinkedpanel", Plinkedpanel);
    saveForTab(kTab, "Plinkedpanel", Plinkedpanel);

  }

  //タブの状態保存
  function saveForTab(aTab, tag, value){
      ss.setTabValue(aTab, tag, value);
  }
  //タブの状態復元
  function restoreForTab(aTab){
    var retrievedData = ss.getTabValue(aTab, "Plinkedpanel");
    if(retrievedData)
      aTab.setAttribute("Plinkedpanel",retrievedData);
    var retrievedData = ss.getTabValue(aTab, "Olinkedpanel");
    if(retrievedData)
      aTab.setAttribute("Olinkedpanel",retrievedData);
  }

  //起動時のタブ状態復元
  setTimeout(function(){restoreForTab(gBrowser.mCurrentTab);},0);
  init(0);
  function init(i){
    if(i < gBrowser.mTabs.length){
      var aTab = gBrowser.mTabs[i];
      if(aTab.linkedBrowser.docShell.busyFlags
        || aTab.linkedBrowser.docShell.restoringDocument){
        setTimeout(init,1000,i);
      }else{
        restoreForTab(aTab);
        i++;
        setTimeout(init,0,i);
      }
    }else{
    }
  }

  gBrowser.tabContainer.addEventListener('SSTabRestored', function(event){restoreForTab(event.target);},false);

  function getPref(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
        case 'str':
          return xpPref.getCharPref(aPrefString).toString(); break;
        case 'int':
          return xpPref.getIntPref(aPrefString); break;
        case 'bool':
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){ }
    return aDefault;
  }
})();


(function whichTabSelectWhenCloseTab() {
  if('TM_init' in window) return;
  //if('TreeStyleTabService' in window) return;
  // --- config ---
  //"LAST":カレントタブをクローズしたとき, 直前に選択されていたタブを前面にする。
  //"OPENER":カレントタブをクローズしたとき, リンク元タブを前面にする。
  //"LEFT": カレントタブをクローズしたとき, 左のタブを前面にする。
  //上記以外: ブラウザデフォルト
  const SELECTED = "LAST";

  //"OPENER"のとき: リンク元(親)が無い場合, true: 先祖を遡る, false 親のみとする
  const GOTRACEBACK = true;
  //"OPENER"のとき: リンク元(親,先祖)が無い場合, "LAST", "LEFT", 左記以外 (SELECTEDと同等)
  const NOOPENER = "LAST";
  // --- config end ---
  // --- about:config では---
  //userChrome.whichTabSelectWhenCloseTab.SELECTED
  //userChrome.whichTabSelectWhenCloseTab.GOTRACEBACK
  //userChrome.whichTabSelectWhenCloseTab.NOOPENER
  //

  if (getVer() > 2){
    gBrowser.getPref = getPref;
    // フォルダを開いたとき最後に開いたたタブを選択?
    /*
    var func = gBrowser.loadTabs.toString();
    func = func.replace('let tab = this.addTab(aURIs[i]);','$& var lastTabAdded = tab;');
    func = func.replace('this.selectedTab = firstTabAdded;','var prefSELECTED = gBrowser.getPref("userChrome.whichTabSelectWhenCloseTab.SELECTED", "str", SELECTED);if( prefSELECTED == "LAST"){ this.selectedTab = lastTabAdded;} else {this.selectedTab = firstTabAdded;}');
    eval("gBrowser.loadTabs = "+ func);
    */

    // 未読がどうのこうの
    var func = gBrowser.moveTabTo.toString();
    func = func.replace(
    'this.mCurrentTab._selected = false;',
    <><![CDATA[
    for (var i = 0; i <  this.mTabContainer.childNodes.length; i++) {
      var tab = this.mTabContainer.childNodes[i];
      tab.removeAttribute("aaabakup");
      if (tab.hasAttribute("selected"))
        tab.setAttribute("aaabakup", tab.selected );
    }
    $&
    ]]></>
    );
    func = func.replace(
    'this.mCurrentTab._selected = true;',
    <><![CDATA[
    for (var i = 0; i <  this.mTabContainer.childNodes.length; i++) {
      var tab = this.mTabContainer.childNodes[i];
      if (tab.hasAttribute("aaabakup")) {
        tab.setAttribute("selected", tab.selected);
      } else
        tab.removeAttribute("selected");
    }
    $&
    ]]></>
    );
    eval("gBrowser.moveTabTo = "+ func);
  }

  gBrowser.tabContainer.addEventListener("TabClose", OTN_onTabClose, false);
  function OTN_onTabClose(aEvent) {
    debug("TabClose");
    //カレントタブ?
    if(aEvent.originalTarget != gBrowser.selectedTab)
      return;

    var mTabChilds = gBrowser.mTabs;
    var prefSELECTED = getPref("userChrome.whichTabSelectWhenCloseTab.SELECTED", "str", SELECTED);
    debug(prefSELECTED);
    switch (prefSELECTED){
      case "LAST":
        if(typeof ucjsNavigation !='undefined' && ucjsNavigation.tabFocusManager)
          ucjsNavigation.tabFocusManager.focusLastSelectedTab();
        break;
      case "LEFT":
        if(aEvent.originalTarget._tPos>0)
          gBrowser.mTabContainer.advanceSelectedTab(-1, false);
        break;
      case "OPENER":
        var aTab = gBrowser.mCurrentTab;
        if(!aTab.hasAttribute("Plinkedpanel"))
          return;
        var arr = aTab.getAttribute("Plinkedpanel").split(" ");
        if(arr && arr.length < 1)
          return;
        //親,祖父母...と順にOPENERを検索, 見つかればそれを前面にする
        var prefGOTRACEBACK = getPref("userChrome.whichTabSelectWhenCloseTab.GOTRACEBACK", "bool", GOTRACEBACK);
        for(var p=0,plen=prefGOTRACEBACK?arr.length:1;p<plen;p++){
          var Plinkedpanel = arr[p];
          for(var i= 0,len=mTabChilds.length;i<len;i++){
            var pTab = mTabChilds[i];
            if(pTab.hasAttribute("Olinkedpanel")
               && pTab.getAttribute("Olinkedpanel").indexOf(Plinkedpanel) > -1){
              gBrowser.mCurrentTab = pTab;
              return;
            }
          }
        }
        //親,祖父母...が無い
        var prefNOOPENER = getPref("userChrome.whichTabSelectWhenCloseTab.NOOPENER", "str", NOOPENER);
        switch (prefNOOPENER){
          case "LAST":
            if(typeof ucjsNavigation !='undefined' && ucjsNavigation.tabFocusManager)
              ucjsNavigation.tabFocusManager.focusLastSelectedTab();
            break;
          case  "LEFT":
            if(aEvent.originalTarget._tPos>0)
              gBrowser.mTabContainer.advanceSelectedTab(-1, false);
            break;
        }
        break;
    }
    //いずれにも該当しないので,何もしない(ブラウザデフォルト)
  }

  function getPref(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      switch (aPrefType){
        case 'complex':
          return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile); break;
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
  }

  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }

  function debug(aMsg){
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      Cc["@mozilla.org/consoleservice;1"]
        .getService(Ci.nsIConsoleService)
        .logStringMessage(aMsg);
  }

})();
