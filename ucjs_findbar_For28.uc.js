// ==UserScript==
// @name           ucjs_findbar_For28
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Findbarページ内検索結果を画面中央に表示 XMigemo 0.4.10(Forked)以上対応
// @include        main
// @include        chrome://global/content/viewSource.xul
// @include        chrome://global/content/viewPartialSource.xul
// @compatibility  Firefox 28+
// @version        2015/01/15 12:00 Fixed strictmode
// @version        2014/07/10 fx34 Bug 1036694 - merge nsIMarkupDocumentViewer into nsIContentViewer
// @version        2014/05/29 00:00 Bug 1018324 - Remove inIFlasher
// @version        2013/11/21 12:05 Bug 856437 Remove Components.lookupMethod
// @author         Alice0775
// @version        2014/04/12 12:00 remove vertical scroll
// @version        2011/10/30 12:00 Bug 684821 - Remove nsIDOMNSHTMLElement
// @version        2010/04/05 12:00 Firefox3.7以上 Bug 396392 - Support for getClientRects and getBoundingClientRect in DOM Range
// @version        2009/08/06 12:00 gBrowser.tabContainerエラーとなるのを修正
// @version        2009/08/05 12:00 xxxx なぜか elem.getBoundingClientRect().top等 を取得できないバグがある
// @version        2009/08/04 17:00 Firefox2削除
// @version        2009/07/18 17:00 なぜかハイライトが失われるので  mmm revert Selection,  backout 06/11
// @version        2009/06/11 00:00 Minefield3.6a1pre以上の場合 親要素を一塊としてスクロールにした。mmm
// @version        2009/06/10 00:00 frame.document.body.normalize();
// @version        2009/05/21 00:00 tableのborder-widthを考慮してみた
// ==/UserScript==
// @version        2009/05/18 23:00 DIV要素にも適用(MSDN ライブラリ等)
// @version        2009/05/13 12:00 xulドキュメントのときスクロールしていなかったのを修正, frameの処理改善
// @version        2009/05/12 05/11の微調整。
// @version        2009/05/11 画面幅-SCROLL_PADDINGより左側に結果があるときは横方向のスクロールしないようにした。
// @version        2009/04/10 styleの定義が抜けていた
// @version        2009/04/09 getBoundingClientRectのtopとbottom同じ値しか返さないのはなぜ?
// @version        2009/04/08 描画が遅いマシンやスタイルのため スムーススクロールもどきは100msで足きりするようにした
// @version        2009/04/04 Firefox3 & XUL/Migemo の場合は ucjs_findbar を優先するようにした
// @version        2009/03/30 getBoxObjectForが使えなくなったので修正 Bug 340571 -  getBoxObjectFor leaking-onto-the-Web disaster
// @version        2009/03/25 frame処理を変更
// @version        2009/03/03 XUL/Migemo 0.11.11の結果を画面の中央付近に表示がぶっ壊れているので, こちらで仮対応。
// @version        2008/12/21 mTabを使うように
// @version        2008/09/26 18:00 XUL/Migemoがある時は何もしないようにした
// @version        2008/09/12 18:00 可能ならブロック要素を一塊としてスクロール
// @version        2008/09/09 01:00 rangeの包み込みがおかしかったのを修正
// @version        2008/09/08 12:00 スクロールの調整
// @version        2008/09/07 16:00 Piro氏の画面内スクロールの処理を輸入
// @version        2008/07/04 19:00 例外回避
// @version        2008/06/18 23:00 XMigemo 0.8.13以上対応2
// @version        2008/05/16 00:00 ツールバーカスタマイズ後, SearchWP2.1の折り返し時にエラーとなるのを修正
// @version        2008/05/11 15:00 XMigemo 0.8.8以上対応
// @version        2008/05/02 10:20 XMigemo 0.8以上対応
// @version        2008/04/21 10:20 Migemo無いときの処理忘れと デフォ折り返し時の確認ダイアログ無効に
// @version        2008/04/21 10:00 Migemo時は折り返し時の確認ダイアログでないように
// @version        2008/04/18 18:00 SearchWP2.1
// @version        2008/03/24 01:00 SearchWP2.0 折り返し時の確認ダイアログ, Fx3b5対応
// @version        2008/02/07 20:00 SearchWP1.0 折り返し時の確認ダイアログ対応
// @version        2008/01/20 20:00 SearchWP1.1b2仮対応
// @Note           userChrome.alert.find.wrapped , true:折り返したときに確認ダイアログ表示
//
// [既知の不具合]
// 1.Google Reader では, 検索位置がハイライトされない(Firefoxのバグ) 一旦全て強調表示にするか,
//   XUL/Migemoのサファリ風強調表示とすれば表示される。 (Google Chromeでも同様のバグあり)
// 2.全て強調表示またはSCROLL_PARENT_BLOCK=trueの時,overfllow hiddenなブロック要素では
//   適切にスクロールできない(Firefoxのバグ?),  XUL/Migemoのサファリ風強調表示とすれば表示される。
// 3.getBoundingClientRectで座標の取得が出来ない場合があり, 適切にスクロールできない(Firefoxのバグ?)
// 4.overfllow hiddenなブロック要素がスクロールした場合, 検索バーを閉じるかタブを選択するまで,
//   ブロック要素のスクロールが解除されない。(Google Chromeはこの当たりの処理が巧い)
//
/* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* Alternatively, the contents of this file may be used under the
* terms of the GNU General Public License Version 2 or later (the
* "GPL"), in which case the provisions of the GPL are applicable
* instead of those above.
*
* The Original Code.
* Alice0775
* http://space.geocities.yahoo.co.jp/gl/alice0775
* (2007/02/21)
*
* ***** END LICENSE BLOCK ***** */
var findcenter = {
// -- config --
  SCROLL_SMOOTH: true,      //スムーススクロールもどき, スクロールするときちょっとだけなめらかにする
  SCROLL_PADDING:10,         //スクロールするときのマージン(%)
  SCROLL_PARENT_BLOCK: false, //可能ならブロック要素を一塊としてスクロール
  //about:config で extensions.findcenter.alert.find.wrapped , true:折り返したときに確認ダイアログ表示
  //about:config で extensions.findcenter.scroll_smooth.find , true: SCROLL_SMOOTH を上書き設定
  //about:config で extensions.findcenter.scroll_smooth.steps , 6: SCROLL_SMOOTHのステップ数
  //about:config で extensions.findcenter.scroll_smooth.limits , 100: SCROLL_SMOOTHをmsで足きりする
  //about:config で extensions.findcenter.scroll.padding , 10: スクロールするときのマージン(%)
// -- config --
  kSCROLL_WRAPPED      :'extensions.findcenter.alert.find.wrapped',
  kSCROLL_SMOOTH_FIND  :'extensions.findcenter.scroll_smooth.find',
  kSCROLL_SMOOTH_STEPS :'extensions.findcenter.scroll_smooth.steps',
  kSCROLL_SMOOTH_LIMITS :'extensions.findcenter.scroll_smooth.limits',
  kSCROLL_PADDING      :'extensions.findcenter.scroll.padding',
  _timer: null,
  get browser() {
    return document.getElementById('content') || // Firefox
      document.getElementById('messagepane') || // Thunderbird
      document.getElementById('help-content'); // Help
  },

  get activeBrowser() {
    return ('SplitBrowser' in window && SplitBrowser.activeBrowser) || this.browser;
  },

  getVer: function(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  },

  debug: function(aMsg){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    Cc["@mozilla.org/consoleservice;1"]
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aMsg);
  },

  init: function(){

    if (!document.getElementById("FindToolbar") &&
        typeof gFindBarInitialized != 'undefined' &&
        !gFindBarInitialized) {
      //window.watch('gFindBarInitialized', function() { findcenter.init(); });
      gFindBar;
      //return;
    }

    if (!("gFindBar" in window)) {
      window.gFindBar = document.getElementById("FindToolbar");
    }

    if ('XMigemoFind' in window) {
      this.setPrefValue('xulmigemo.scrollSelectionToCenter', 'bool', false)

      if (this.getVer() >= 3.0) { //Fx3.0 3.5
        this.debug('Firefox 3 W/ XUL/Migemo');

        try {
          eval('gFindBar._updateStatusUI = gFindBar.updateStatus = '+gFindBar._updateStatusUI.toString()
            .replace('{', '$&findcenter._dispSelectionCenter(res);')
          );
        } catch(ex) {
        }

      }

    } else { // without XUL/Migemo

      if (this.getVer() >= 3.0) { //Fx3.0 3.5
        this.debug('Firefox 3');
        try {
          eval('gFindBar._updateStatusUI = '+gFindBar._updateStatusUI.toSource()
            .replace('{', '$&findcenter._dispSelectionCenter(res);')
          );
        } catch(ex) {
        }
      }

    }

    //searchWp 1.0
    if (typeof gSearchWPTermsToolbar != 'undefined') {
      this.debug('SearchWP');
      try{
        var func = gSearchWPTermsToolbar._doSearch.toString();
        //var exp = new RegExp(/}$/);
        func = func.replace('if (result && prevRange) {', 'findcenter._dispSelectionCenter();if (result && prevRange) {');
        eval("gSearchWPTermsToolbar._doSearch = " + func);
        //this.debug(func);
      }catch(ex){
      }
      //alert if find wrapped.
      document.getElementById("statusbar-display").addEventListener("DOMAttrModified", function(e) {
        if (!e.newValue) return;
          if(findcenter.getPrefValue(findcenter.kSCROLL_WRAPPED, 'bool', false)){
            var bundle = document.getElementById("bundle_searchwp");
            var status = e.target;
            if(findcenter._timer) clearTimeout(findcenter._timer);
            findcenter._timer = setTimeout(function(){
              if( status.getAttribute('label') == bundle.getString("wrappedToTop")
                 || status.getAttribute('label') == bundle.getString("wrappedToBottom") ){
                alert(status.getAttribute('label'));
              }
            },200);
          }
      }, false);
    }
    if (typeof searchwp != 'undefined'){
      //alert if find wrapped.
      document.getElementById("statusbar-display").addEventListener("DOMAttrModified", function(e) {
        if (!e.newValue) return;
          var status = e.target;
          if(findcenter._timer) clearTimeout(findcenter._timer);
            findcenter._timer = setTimeout(function(){
            if(findcenter.getPrefValue(findcenter.kSCROLL_WRAPPED, 'bool', false)){
              var textboxWP = document.getAnonymousElementByAttribute(document.getElementById("searchbar"),
                      "anonid", "searchbar-textbox");
              var bundleWP = document.getAnonymousElementByAttribute(textboxWP, "anonid", "searchwp-stringbundle");

              if( status.getAttribute('label') == bundleWP.getString("wrappedToTop")
                 || status.getAttribute('label') == bundleWP.getString("wrappedToBottom") ){
                alert(status.getAttribute('label'));
              }
            }
          },200);
      }, false);
      this.debug('SearchWP 2.0');
    }
    //all in one search button 1.67
    if (typeof ObjAllinonesearch != 'undefined'){
      dump('Allinonesearch');
      try{
        var func = ObjAllinonesearch.doselection.toString();
        var exp = new RegExp(/}$/);
        func = func.replace('selection.addRange(allinonesearch_range);', 'selection.addRange(allinonesearch_range);findcenter._dispSelectionCenter();return;');
        eval("ObjAllinonesearch.doselection = " + func);
      }catch(ex){
      }
    }

    //Googlebar Lite 4.6.9
    if ('GBL_FindInPage' in window) {
      try{
        var func = GBL_FindInPage.toString();
        func = func.replace('found = findInst.findNext();', '$&findcenter._dispSelectionCenter();');
        eval("GBL_FindInPage = " + func);
      }catch(ex){
      }
    }

    //Google Toolbar for Firefox 3.1.20090119W
    if ('GTB_getToolbar' in window && typeof GTB_getToolbar().highlighter == 'object') {
      try{
        var func = GTB_getToolbar().highlighter.findTermText.toString();
        func = func.replace(/findBar\.findNext\(\);/g, '$&findcenter._dispSelectionCenter();');
        func = func.replace(/findBar\.findPrevious\(\);/g, '$&findcenter._dispSelectionCenter();');
        eval("GTB_getToolbar().highlighter.findTermText = " + func);
      }catch(ex){
      }
      try{
        var func = GTB_getToolbar().highlighter._unhighlightWindow.toString();
        func = func.replace(/return result/g, 'doc.body.normalize();$&');
        eval("GTB_getToolbar().highlighter._unhighlightWindow = " + func);
      }catch(ex){
      }
      //Google Toolbar for Firefox 5.0.20090324W
      try{
        var func = GTB_getToolbar().highlighter.findTermText.toString();
        func = func.replace(/c\.gFindBar\._findAgain\(false\);/g, '$&findcenter._dispSelectionCenter();');
        func = func.replace(/c\.gFindBar\._findAgain\(true\);/g, '$&findcenter._dispSelectionCenter();');
        eval("GTB_getToolbar().highlighter.findTermText = " + func);
      }catch(ex){
      }
    }



    if (this.getVer() >= 3.0) { //Fx3.0 3.5
     //alert if find wrapped.
      gFindBar.addEventListener("DOMAttrModified", function(e) {
        if(e.newValue != 'wrapped') return;
          var MigemoON =  false;
          if(document.getElementById("find-migemo-mode")){
            MigemoON =  document.getElementById("find-migemo-mode").checked;
          }else if(document.getElementById("find-mode-selector")){
            MigemoON =  document.getElementById("find-mode-selector").value == 1;
          }
        if(findcenter.getPrefValue(findcenter.kSCROLL_WRAPPED, 'bool', false) &&
           !MigemoON )
        {
          var bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
                      .getService(Components.interfaces.nsIStringBundleService)
                      .createBundle("chrome://global/locale/findbar.properties");
          if(findcenter._timer) clearTimeout(findcenter._timer);
          findcenter._timer = setTimeout(function(){
            var status = document.getAnonymousElementByAttribute(gFindBar, "anonid", "find-status");
            if( status.textContent == bundle.GetStringFromName("WrappedToTop")
               || status.textContent == bundle.GetStringFromName("WrappedToBottom") ){
              alert(status.textContent);
            }
          },100);
        }
      }, false);
    }
    window.addEventListener('unload', this, false);
    //Findbarの表示状態を監視
    gFindBar.addEventListener("DOMAttrModified", this, false);
    if ("gBrowser" in window && "tabContainer" in gBrowser)
      gBrowser.tabContainer.addEventListener('TabSelect', this, false);
    var findcenter_init = true;
  },


  setPrefValue: function(aPrefString, aPrefType, aValue) {
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    try {
      switch (aPrefType) {
        case 'complex':
          return xpPref.setComplexValue(aPrefString, Components.interfaces.nsILocalFile, aValue); break;
        case 'str':
          return xpPref.setCharPref(aPrefString, aValue); break;
        case 'int':
          aValue = parseInt(aValue);
          return xpPref.setIntPref(aPrefString, aValue);  break;
        case 'bool':
        default:
          return xpPref.setBoolPref(aPrefString, aValue); break;
      }
    } catch(e) { }
    return null;
  },

  getPrefValue: function(aPrefString, aPrefType, aDefault) {
    var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                  .getService(Components.interfaces.nsIPrefBranch2);
    if (xpPref.getPrefType(aPrefString) == xpPref.PREF_INVALID) {
      return aDefault;
    }
    try {
      switch (aPrefType) {
        case "str":
          return xpPref.getCharPref(aPrefString).toString(); break;
        case "int":
          return xpPref.getIntPref(aPrefString); break;
        case "bool":
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    } catch(e) { }
    return aDefault;
  },

  //-------------------------------------------------------------------
  // overflow hiddenな要素で見えないのを強制的にスクロールして見えるように
  // SCROLL_PARENT_BLOCKがONの場合(highlight allの時の強制ONも) うまくいかない
  prevelement: null,
  prevelementScrollTop:0,
  prevelementScrollLeft:0,
  ensureVisibleElement: function ensureVisibleElement(aNode){
    if (aNode instanceof Range) {
      var selCon = this._getSelectionController(aNode.startContainer.ownerDocument.defaultView);
      if (selCon) {
        // いつでも見えるように
        selCon.scrollSelectionIntoView(selCon.SELECTION_NORMAL,
                                             selCon.SELECTION_ANCHOR_REGION,
                                             true);
      }
      return
    }

    var target0 = null;
    var target0ScrollTop = 0;
    var target0ScrollLeft = 0;
    var target = aNode;
    while(target) {
      var style = this._getComputedStyle(target);
      if (style &&
          style.getPropertyValue("display") == "block" &&
          target.clientHeight < target.scrollHeight ||
          target.clientWidth < target.scrollWidth) {
        if (style.getPropertyValue("overflow-y") == "hidden") {
          target0 = target;
          target0ScrolllTop = target.scrollTop;
          target0ScrollLeft = target.scrollLeft;
        }
        break;
      }
      target = target.parentNode;
    }

    if (target0 != this.prevelement) {
      var target = this.prevelement;
      if (target) {
         target.scrollTop = this.prevelementScrollTop;
         target.scrollLeft = this.prevelementScrollLeft;
      }
      this.prevelement = target0;
      this.prevelementScrollTop = target0ScrollTop;
      this.prevelementScrollLeft = target0ScrollLeft;

    }

    aNode.scrollIntoView(false);
  },

  // 選択された場所を画面中央に表示する ブロック要素があると中心にならない
  _dispSelectionCenter : function(res){

    var frame = this._getSelectionFramePrefFocused( window.content );
    if (!frame) return;

    var selection = frame.getSelection();
    var elem = null;
    // Fx3.5以降において, 全て強調表示の時, 座標取得用DOM要素のインサートによって
    // 同じ親を持つrangeが崩れるのでSCROLL_PARENT_BLOCKを強制的にONにして回避する。
    this.SCROLL_PARENT_BLOCK2 = this.SCROLL_PARENT_BLOCK
                              || (this.getVer() == 3.5 &&
                              gFindBar.getElement("highlight").checked);


    if (!this.SCROLL_PARENT_BLOCK2) {
      if (this.getVer() <= 3.6) {
        var range = frame.document.createRange( );
        range.setStart( selection.focusNode, selection.focusOffset );
        range.setEnd  ( selection.focusNode, selection.focusOffset );
        elem = frame.document.createElement( "span" )
        range.insertNode( elem );
      } else {
        elem = frame.document.createRange( );
        elem.setStart( selection.anchorNode, selection.anchorOffset );
        elem.setEnd  ( selection.focusNode, selection.focusOffset );
      }
/*
      // xxxx なぜか elem.getBoundingClientRect().top等 を取得できないバグがあるので,
      // バグに引っかかった場合は this.SCROLL_PARENT_BLOCK2 trueにする
      if (!!elem && elem.getClientRects().length == 0) {
        this.SCROLL_PARENT_BLOCK2 = true;
        if (!(elem instanceof Range)) {
          // 一時的な要素を削除
          var p = elem.parentNode;
          p.removeChild( elem );
          range.deleteContents( );
          range.detach( );
          p.normalize();
          elem = null;
        }
      }
*/
    } else return;

    if (typeof res != 'undefined' && res != 0)
      this.prevFrame = null;

    this.doCenter( frame, elem, selection);

    // 一時的な要素を削除
    if (!!elem && !(elem instanceof Range)) {
      var p = elem.parentNode;
      p.removeChild( elem );
      range.deleteContents( );
      range.detach( );
      p.normalize();
    } else if (!!elem && (elem instanceof Range)) {
      elem.detach( );
    }

/*
    // mmm revert Selection
    selection = Components.lookupMethod(frame, 'getSelection').call(frame);
    range = frame.document.createRange( );
    range.setStart( selection.anchorNode, selection.anchorOffset );
    range.setEnd  ( selection.focusNode, selection.focusOffset );
    // もう一度セレクト
    selection.addRange(range);
    range.detach();
*/
    var selCon = this._getSelectionController(frame);
    if (selCon) {
      // いつでも見えるように
      selCon.scrollSelectionIntoView(selCon.SELECTION_NORMAL,
                                           selCon.SELECTION_ANCHOR_REGION,
                                           true);
    }

  },

  //-------------------------------------------------------------------
  // 選択された場所を画面中央に表示する ブロック要素があると中心にならない
  //This Code based on Piro's XUL/Migemo
  doCenter : function(aFrame, aElem, aSelection) {
    if (!aFrame) return;
    if (!aElem && !(aElem instanceof Range)) { //選択範囲の親ノードを中央にした(なぜなら同じ親の別の後のrangeが崩れるので)
      var range = aFrame.document.createRange( );
      range.setStart( aSelection.focusNode, aSelection.focusOffset );
      range.setEnd  ( aSelection.focusNode, aSelection.focusOffset );

      aElem = range.startContainer.parentNode;
      range.deleteContents( );
      range.detach( );
    }
    this.doCenter_sub(aFrame, aElem, aSelection);
    // ensureVisibleElementで無理とにブロック要素をスクロール出来るけど
    // 元に戻すタイミングをどうするか考えがまとまらないので
    // TabSelectとFindBarのhiddenでとしている Google Chromeは完璧なんだけどな
    this.ensureVisibleElement( aElem );

  },

  prevFrame: null,
  prevElem: null,
  prevScrollView: [],

  doCenter_sub: function(aFrame, aElem, aSelection) {
    // xxx 検索結果が一つのサブフレームにだけしかない場合の再検索時に,
    //     サブフレームを中央にスクロールさせたいなら, 次のコメントを外す
    if (/*true ||*/this.prevFrame != aFrame) {
      this.scrollFrameifAny(aFrame);
      this.prevFrame = aFrame;

    }

    var padding = findcenter.getPrefValue(findcenter.kSCROLL_PADDING,
                                          "int", findcenter.SCROLL_PADDING);
    var view = null,
        box,
        box2,
        targetX,
        targetY,
        targetW,
        targetH;

    box = window['piro.sakura.ne.jp.Alice0775'].boxObject.getBoxObjectFor(aElem);
    if (!box.x && !box.y) {
      if ((aElem instanceof Range))
        box = window['piro.sakura.ne.jp.Alice0775'].boxObject.getBoxObjectFor(aElem.startContainer);
      else
        box = window['piro.sakura.ne.jp.Alice0775'].boxObject.getBoxObjectFor(aElem.parentNode);
    }
    targetX = box.x;
    targetY = box.y;
    targetW = Math.max(box.width, 20);
    targetH = Math.max(box.height, 20);

    var scrollView;
    if (aElem instanceof Range) {
      if (aElem.startContainer.parentNode && this.prevElem == aElem.startContainer.parentNode) {
        scrollView = this.prevScrollView;
      } else {
        scrollView = this.getScrollView(aElem.startContainer);
        this.prevScrollView = scrollView;
        this.prevElem = aElem.startContainer.parentNode;
      }
    } else {
      if (aElem.parentNode && this.prevElem == aElem.parentNode) {
        scrollView = this.prevScrollView;
      } else {
        scrollView = this.getScrollView(aElem);
        this.prevScrollView = scrollView;
        this.prevElem = aElem.parentNode;
      }
    }

    var viewX, targetX_x, targetX_y, viewY, targetY_x, targetY_y;
    viewX = viewY = null;

    if (scrollView[1] && scrollView[1] instanceof Window) {
      view = scrollView[1];

      var viewW = view.innerWidth;
      var xUnit = Math.max(viewW * (padding / 100), targetW);

      var sx = view.scrollX;
      var sy = view.scrollY;
      var xa = targetX - sx;
      var xb = xa + targetW;
//this.debug(" " + (targetX <= viewW - xUnit) +   (xa <= viewW - xUnit)  +  (xb >= viewW - xUnit));
      var x = (targetX <= viewW - xUnit) ? 0 :
                      (xa <= viewW - xUnit) ? sx :
                             (xb >= viewW - xUnit) ? +targetX - viewW / 2:
                                                    sx;
      viewX = view;
      targetX_x = x;
      targetX_y = sy;
    } else if (scrollView[1]) {
      view = scrollView[1];

      var viewbox = window['piro.sakura.ne.jp.Alice0775'].boxObject.getBoxObjectFor(view);
      var style = this._getComputedStyle(aFrame);
      var overfllowx = style.getPropertyValue("overflow-x")
      var overfllowy = style.getPropertyValue("overflow-y")
      var xx = aFrame.scrollX;
      if (overfllowx != "visible" && overfllowx != "hidden")
        xx = (viewbox.x + viewbox.width / 2) - aFrame.innerWidth / 2;
      var yy = aFrame.scrollY;
      if (overfllowy != "visible" && overfllowy != "hidden")
        yy = (viewbox.y + viewbox.height / 2) - aFrame.innerHeight / 2;
      this._scrollTo(aFrame, xx ,yy);


      var viewW = view.clientWidth;
      var xUnit = Math.max(viewW * (padding / 100), targetW);

      var sx = view.scrollLeft;
      var sy = view.scrollTop;
      targetX =  targetX - viewbox.x;
      var xa = targetX;
      var xb = xa + targetW;
      var x = (targetX + sx <= viewW - xUnit) ? 0 :
                      (xa <= viewW - xUnit) ? sx :
                             (xb >= viewW - xUnit) ? +targetX + sx - viewW / 2 :
                                                    sx;
      viewX = view;
      targetX_x = x;
      targetX_y = sy;
    }

    if (scrollView[0] && scrollView[0] instanceof Window) {
      view = scrollView[0];

      var viewH = view.innerHeight;
      var yUnit = Math.max(viewH * (padding / 100), targetH);

      var sx = view.scrollX;
      var sy = view.scrollY;
      var ya = targetY - sy;
      var yb = ya + targetH;
      var pos = 0.5;
      if (this.SCROLL_PARENT_BLOCK2) {
        if (targetH < viewH)
          pos = (viewH - targetH) / viewH /2;
        else
          return
      }
      var y = (ya <= yUnit ) ? targetY - viewH * pos  :
                              (yb >= viewH - yUnit ) ? +targetY - viewH * pos  :
                                                      sy;
      viewY = view;
      targetY_x = x;//sx;
      targetY_y = y;
    } else if (scrollView[0]) {
      view = scrollView[0];

      var viewbox = window['piro.sakura.ne.jp.Alice0775'].boxObject.getBoxObjectFor(view);
      var style = this._getComputedStyle(aFrame);
      var overfllowx = style.getPropertyValue("overflow-x");
      var overfllowy = style.getPropertyValue("overflow-y");
      var xx = aFrame.scrollX;
      if (overfllowx != "visible" && overfllowx != "hidden")
        xx = (viewbox.x + viewbox.width / 2) - aFrame.innerWidth / 2;
      var yy = aFrame.scrollY;
      if (overfllowy != "visible" && overfllowy != "hidden")
        yy = (viewbox.y + viewbox.height / 2) - aFrame.innerHeight / 2;
      this._scrollTo(aFrame, xx ,yy);

      var viewH = view.clientHeight;
      var yUnit = Math.max(viewH * (padding / 100), targetH);
      var sx = view.scrollLeft;
      var sy = view.scrollTop;
      targetY =  targetY - viewbox.y;
      var ya = targetY;
      var yb = ya + targetH;
      var pos = 0.5;
      if (this.SCROLL_PARENT_BLOCK2) {
        if (targetH < viewH)
          pos = (viewH - targetH) / viewH /2;
        else
          return
      }
      var y = (ya <= yUnit ) ? targetY + sy - viewH * pos  :
                              (yb >= viewH - yUnit ) ? +targetY + sy - viewH * pos  :
                                                      sy;
      viewY = view;
      targetY_x = x;//sx;
      targetY_y = y;
    }

    if (viewX == viewY) {
      targetY_x = targetX_x;
      viewX = null;
    }
    this.smoothScrollTo(viewX, targetX_x, targetX_y, viewY, targetY_x, targetY_y);

    // hack for Google Reader
    if (/^http:\/\/www\.google\.[.a-z]+\/reader\/view/.test(content.location.href)) {
      this.viewY.style.visibility = "collapse";
      this.viewY.clientTop;
      this.viewY.style.visibility = "visible";
    }

  },


  timerid: null,
  timerSmoothScroll: null,
  stopSmoothScroll: false,

  smoothScrollTo: function(viewX, targetX_x, targetX_y, viewY, targetY_x, targetY_y) {
    if (this.timerid)
      clearInterval(this.timerid);
    var interval = 20;//加速インターバル
    var diffmin = 10; //最小スクロール差分

    this.n = this.getPrefValue(this.kSCROLL_SMOOTH_FIND, 'bool', this.SCROLL_SMOOTH)
               ? this.getPrefValue(this.kSCROLL_SMOOTH_STEPS, 'int', 6) : 1; //最大分割数
    this.limits = this.getPrefValue(this.kSCROLL_SMOOTH_LIMITS, 'int', 100);

    if (viewX){
      this.viewX = viewX;
      this.targetX_x = targetX_x;
      this.targetX_y = targetX_y;
      if (this.viewX instanceof Window) {
        this.currentX_x = viewX.scrollX;
        this.currentX_y = viewX.scrollY;
      } else {
        this.currentX_x = viewX.scrollLeft;
        this.currentX_y = viewX.scrollTop;
      }

      this.diffX_x = targetX_x - this.currentX_x;
      this.diffX_y = targetX_y - this.currentX_y;
    }
    if (viewY){
      this.viewY = viewY;
      this.targetY_x = targetY_x;
      this.targetY_y = targetY_y;
      if (this.viewY instanceof Window) {
        this.currentY_x = viewY.scrollX;
        this.currentY_y = viewY.scrollY;
      } else {
        this.currentY_x = viewY.scrollLeft;
        this.currentY_y = viewY.scrollTop;
      }

      this.diffY_x = targetY_x - this.currentY_x;
      this.diffY_y = targetY_y - this.currentY_y;
    }


    this.count = 1;

    //描画が遅いマシンやスタイルのため this.limits msで足きりする
    if (this.timerSmoothScroll)
      clearTimeout(this.timerSmoothScroll);
    this.stopSmoothScroll = false;

    this.timerSmoothScroll = setTimeout(function(self){self.stopSmoothScroll = true;}, this.limits, this);

    this.timerid = setInterval( function(self) {
      var dx,dy;
      if ( self.count >= self.n || self.stopSmoothScroll) {
        if (self.timerSmoothScroll)
          clearInterval(self.timerSmoothScroll);
        clearInterval(self.timerid);
        if (self.viewX)
          self._scrollTo(self.viewX, self.targetX_x, self.targetX_y);
        if (self.viewY)
          self._scrollTo(self.viewY, self.targetY_x, self.targetY_y);
        return;
      } else {
        if (self.viewX){
          if (self.viewX instanceof Window) {
            dx = (self.currentX_x + self.diffX_x / self.n * self.count) - self.viewX.scrollX;
            dy = (self.currentX_y + self.diffX_y / self.n * self.count) - self.viewX.scrollY;
          } else {
            dx = (self.currentX_x + self.diffX_x / self.n * self.count) - self.viewX.scrollLeft;
            dy = (self.currentX_y + self.diffX_y / self.n * self.count) - self.viewX.scrollTop;
          }
          self._scrollBy(self.viewX, dx, dy);
        }
        if (self.viewY){ return;
          if (self.viewY instanceof Window) {
            dx = (self.currentY_x + self.diffY_x / self.n * self.count) - self.viewY.scrollX;
            dy = (self.currentY_y + self.diffY_y / self.n * self.count) - self.viewY.scrollY;
          } else {
            dx = (self.currentY_x + self.diffY_x / self.n * self.count) - self.viewY.scrollLeft;
            dy = (self.currentY_y + self.diffY_y / self.n * self.count) - self.viewY.scrollTop;
          }
          self._scrollBy(self.viewY, dx, dy);
        }

        self.count++;
        if (2 < self.count && self.count < self.n - 2)
          self.count++;
        if (4 < self.count && self.count < self.n - 4)
          self.count++;
        if (6 < self.count && self.count < self.n - 6)
          self.count++;
        if (8 < self.count && self.count < self.n - 8)
          self.count++;
        if (10 < self.count && self.count < self.n -10)
          self.count++;
      }
    }, interval, this);
    return;
  },

  _scrollTo: function(aElem, x, y){
    var self = this;
    if (aElem instanceof Window) {
      aElem.scrollTo(x, y);
    } else {
      aElem.scrollLeft = x;
      aElem.scrollTop = y;
    }
  },

  _scrollBy: function(aElem, x, y){
    if (aElem instanceof Window) {
      aElem.scrollBy(x, y);
    } else {
      aElem.scrollLeft += x;
      aElem.scrollTop += y;
    }
  },

  _getSelectionController : function(aWindow) {
    // Yuck. See bug 138068.
    var Ci = Components.interfaces;
    var docShell = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                          .getInterface(Ci.nsIWebNavigation)
                          .QueryInterface(Ci.nsIDocShell);
    try{
      var controller = docShell.QueryInterface(Ci.nsIInterfaceRequestor)
                               .getInterface(Ci.nsISelectionDisplay)
                               .QueryInterface(Ci.nsISelectionController);
    }catch(e){
      return null;
    }
    return controller;
  },

  getScrollView: function (aTarget) {
    var NS, EW, NSEW;
    NS = EW = NSEW = null;
    var _scrollingView = null;
    for (_scrollingView = aTarget; _scrollingView; _scrollingView = _scrollingView.parentNode) {
      if (_scrollingView instanceof HTMLElement) {
        if (_scrollingView.localName.toLowerCase() == "select") {
          _scrollingView.parentNode.focus();
          return [NS, EW, NSEW];
        }
        var doc, style;
        var overflowx = "";
        var overflowy = "";
        try {
          doc = _scrollingView.ownerDocument;
          style = doc.defaultView.getComputedStyle(_scrollingView, "");
          overflowx = style.getPropertyValue("overflow-x");
          overflowy = style.getPropertyValue("overflow-y");
        } catch (ex) {
        }
        var borderTop    = 0;
        var borderBottom = 0;
        var borderLeft   = 0;
        var borderRight  = 0;
        if (/^(td|th)$/i.test(_scrollingView.localName)) {
          try {
            doc = _scrollingView.ownerDocument;
            style = doc.defaultView.getComputedStyle(_scrollingView, "");
            borderTop    = style.getPropertyValue("border-top-width").replace('px', '');
            borderBottom = style.getPropertyValue("border-bottom-width").replace('px', '');
            borderLeft   = style.getPropertyValue("border-left-width").replace('px', '');
            borderRight   = style.getPropertyValue("border-right-width").replace('px', '');
          } catch (ex) {
          }
        }
        var horz = _scrollingView.clientWidth !== 0 &&
                   _scrollingView.clientWidth + borderLeft + borderRight < _scrollingView.scrollWidth;
        var vert = _scrollingView.clientHeight !== 0 &&
                   _scrollingView.clientHeight + borderTop + borderBottom < _scrollingView.scrollHeight;
        if (horz &&
            overflowx != "hidden" &&
            overflowx != "visible" &&
            vert && overflowy != "hidden" && overflowy != "visible") {
          NSEW = !NSEW ? _scrollingView : NSEW;
        }
        if (horz && overflowx != "hidden" && overflowx != "visible") {
          EW = !EW ? _scrollingView : EW;
        }
        if (vert && overflowy != "hidden" && overflowy != "visible") {
          NS = !NS ? _scrollingView : NS;
        }
        if (_scrollingView.localName.toUpperCase() == "HTML" ||
            _scrollingView.localName.toUpperCase() == "BODY") {
          _scrollingView = _scrollingView.ownerDocument.defaultView;
          if (_scrollingView.scrollMaxX > 0 &&
              _scrollingView.scrollMaxY > 0) {
            NSEW = !NSEW ? _scrollingView : NSEW;
          }
          if (_scrollingView.scrollMaxX > 0) {
            EW = !EW ? _scrollingView : EW;
          }
          if (_scrollingView.scrollMaxY > 0) {
            NS = !NS ? _scrollingView : NS;
            break;
          }
        }
      }
    }
    return [NS, EW, NSEW];
  },

  getSelectionFrame : function(aFrame) {
    var selection = aFrame.getSelection();
    if (selection && selection.toString()) {
      return aFrame;
    }
    var frame;
    for (var i = 0, maxi = aFrame.frames.length; i < maxi; i++) {
      frame = arguments.callee(aFrame.frames[i]);
      if (frame)
        return frame;
    }
    return null;
  },

  _getComputedStyle : function(aNode) {
    if (aNode instanceof Window)
      return aNode.getComputedStyle(aNode.document.documentElement, null);
      if (!aNode.ownerDocument)
        return null;
    return aNode.ownerDocument.defaultView.getComputedStyle(aNode, null);
  },

  _getPropertyPixelValue : function(aStyle, aProperty) {
    return parseInt(aStyle.getPropertyValue(aProperty).replace('px', ''));
  },

  // TOP からの絶対座標を取得
  getPageOffsetTop : function(aNode) {
    if (!aNode) return 0;
    var top = aNode.offsetTop;
    while (aNode.offsetParent != null)
    {
      aNode = aNode.offsetParent;
      top += aNode.offsetTop;
    }
    return top;
  },

  //----------------------------------------------------------
  //iframeを真ん中に, 再帰処理できない とほほ
  scrollFrameifAny: function scrollFrameifAny(win) {
    var pelem = this.getIFrameByWindow(win);
    if (pelem) {
      var pwin = pelem.ownerDocument.defaultView; // 親ウィンドウを返す
      var PageOffsetTop;
      try {
        PageOffsetTop = pelem.ownerDocument.getBoxObjectFor(pelem).y;
      } catch(e) {
        PageOffsetTop = window['piro.sakura.ne.jp.Alice0775'].boxObject.getBoxObjectFor(pelem).y;
      }
      if (PageOffsetTop) {
        pwin.scroll( pwin.pageXOffset, PageOffsetTop - pwin.innerHeight / 2 + win.innerHeight / 2);
        //this.scrollFrameifAny(pwin);
      }
    }
  },

  //このフレームawinのウィンドウは親フレームで言うところのどれ？
  getIFrameByWindow: function getIFrameByWindow(awin,win) {
    if(!win) win = this.activeBrowser.contentDocument.defaultView; //トップレベルのフレーム
    for (var i=0; win.frames && i<win.frames.length; i++){
      var iframe = this.getIFrameByWindow(awin,win.frames[i]);
      if (iframe)
        return iframe;
    }
    var doc = win.document;
    if (!doc)
      return false;
    var iframes = doc.getElementsByTagName("iframe");
    for (var i=0; i<iframes.length; i++) {
      var w = null;
      if (iframes[i].contentWindow)
        w = iframes[i].contentWindow;
      if (w == awin )
        return iframes[i];
    }
    return false;
  },

  // 選択文字列を含む frame を返却（focused frame 優先）
  _getSelectionFramePrefFocused: function( parent_frame ) {

    //this.debug('選択文字列を含む frame を返却（focused frame 優先）');
    var focued_frame = document.commandDispatcher.focusedWindow;
    if ( focued_frame ){
      var selection = focued_frame.getSelection();
      if ( selection && selection.toString() ) {
        return focued_frame;
      }
    }

    return this.getSelectionFrame( parent_frame );
  },


  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case 'DOMAttrModified':
        this._DOMAttrModified(aEvent);
        break;
      case 'TabSelect':
        this._TabSelect(aEvent);
        break;
      case 'load':
        this.onload();
        break;
      case 'unload':
        this.onunload();
        break;
    }
  },

  _DOMAttrModified: function(aEvent) {
    var attrName = aEvent.attrName;
    //this.debug(attrName);
    //this.debug(aEvent.newValue);
    switch (attrName) {
      case "checked":
        var target = this.prevelement;
        if (target) {
          target.scrollTop = this.prevelementScrollTop;
          target.scrollLeft = this.prevelementScrollLeft;
          this.prevelement = null;
        }
        break;
      case "hidden":
        //Findbarの非表示に同期してスクロールリセット
        if (aEvent.newValue) {
          var target = this.prevelement;
          if (target) {
            target.scrollTop = this.prevelementScrollTop;
            target.scrollLeft = this.prevelementScrollLeft;
          }
        }
        this.prevelement = null;
        break;
    }
  },

  _TabSelect: function(aEvent) {
    try {
      var target = this.prevelement;
      if (target) {
        target.scrollTop = this.prevelementScrollTop;
        target.scrollLeft = this.prevelementScrollLeft;
        this.prevelement = null;
      }
    } catch(e) {}
  },

  delayedStartUpTimer: null,
  delayedStartUpTimer2: null,

  onload: function() {
    window.addEventListener('unload', this, false);
    window.removeEventListener('load', this, false);
    //delayed start up
    this.delayedStartUpTimer = setTimeout(function(self) {
      var nTab = 1;
      try {
        if(gBrowser && gBrowser.mTabs)
          nTab = gBrowser.mTabs.length;
      } catch(ex) {}
        self.delayedStartUpTimer2 = setTimeout(function(self) {
        self.init();
      }, nTab*100, self);
    }, 1000, this);
  },

  onunload: function() {
    window.removeEventListener('unload', this, false);
    window.unwatch('gFindBarInitialized');
    gFindBar.removeEventListener("DOMAttrModified", this, false);
    if ("gBrowser" in window && "tabContainer" in gBrowser)
      gBrowser.tabContainer.removeEventListener('TabSelect', this, false);

    if (this.delayedStartUpTimer)
      clearTimeout(this.delayedStartUpTimer);
    if (this.delayedStartUpTimer2)
      clearTimeout(this.delayedStartUpTimer2);
    if(this._timer)
      clearTimeout(this._timer);

    if(this.timerid)
      clearTimeout(this.timerid);
    if (this.timerSmoothScroll)
      clearTimeout(this.timerSmoothScroll);
  }
};
findcenter.onload();
var ucjsFind = findcenter;




/*
 "getBoxObjectFor()" compatibility library for Firefox 3.6 or later

 Usage:
   // use instead of HTMLDocument.getBoxObjectFor(HTMLElement)
   var boxObject = window['piro.sakura.ne.jp.Alice0775']
                         .boxObject
                         .getBoxObjectFor(HTMLElement);

 lisence: The MIT License, Copyright (c) 2009 SHIMODA "Piro" Hiroshi
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/license.txt
 original:
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/boxObject.js
*/
/*The MIT License

Copyright (c) 2008-2010 SHIMODA "Piro" Hiroshi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/
(function() {
  const currentRevision = 3.3;

  if (!('piro.sakura.ne.jp.Alice0775' in window)) window['piro.sakura.ne.jp.Alice0775'] = {};

  var loadedRevision = 'boxObject' in window['piro.sakura.ne.jp.Alice0775'] ?
      window['piro.sakura.ne.jp.Alice0775'].boxObject.revision :
      0 ;
  if (loadedRevision && loadedRevision > currentRevision) {
    return;
  }

  var Cc = Components.classes;
  var Ci = Components.interfaces;

  window['piro.sakura.ne.jp.Alice0775'].boxObject = {
    revision : currentRevision,

    getBoxObjectFor : function(aNode, aUnify)
    {
      if (aNode instanceof Range){
        return this.getBoxObjectFromClientRectFor(aNode, aUnify) ;
      }
      return (aNode.ownerDocument.body &&
              !('getBoundingClientRect' in aNode.ownerDocument.body)) ? /*aaaaaaaaaaaa*/
          this.getBoxObjectFromBoxObjectFor(aNode, aUnify) :
          this.getBoxObjectFromClientRectFor(aNode, aUnify) ;
    },

    getBoxObjectFromBoxObjectFor : function(aNode, aUnify)
    {
      var boxObject = aNode.ownerDocument.getBoxObjectFor(aNode);
      var box = {
          x       : boxObject.x,
          y       : boxObject.y,
          width   : boxObject.width,
          height  : boxObject.height,
          screenX : boxObject.screenX,
          screenY : boxObject.screenY
        };
      if (!aUnify) return box;

      var style = this._getComputedStyle(aNode);
      box.left = box.x - this._getPropertyPixelValue(style, 'border-left-width');
      box.top = box.y - this._getPropertyPixelValue(style, 'border-top-width');
      if (style.getPropertyValue('position') == 'fixed') {
        box.left -= frame.scrollX;
        box.top  -= frame.scrollY;
      }
      box.right  = box.left + box.width;
      box.bottom = box.top + box.height;

      return box;
    },

    getBoxObjectFromClientRectFor : function(aNode, aUnify)
    {
      var box = {
          x       : 0,
          y       : 0,
          width   : 0,
          height  : 0,
          screenX : 0,
          screenY : 0
        };
      try {
        if (aNode instanceof Range){
          var zoom = this.getZoom(aNode.startContainer.ownerDocument.defaultView);
        } else {
          var zoom = this.getZoom(aNode.ownerDocument.defaultView);
        }

        var rect = aNode.getBoundingClientRect();
        if (aUnify) {
          box.left   = rect.left;
          box.top    = rect.top;
          box.right  = rect.right;
          box.bottom = rect.bottom;
          return box;
        }

        if (aNode instanceof Range){
          var style = this._getComputedStyle(aNode.startContainer.parentNode);
          var frame = aNode.startContainer.parentNode.ownerDocument.defaultView;
        } else {
          var style = this._getComputedStyle(aNode);
          var frame = aNode.ownerDocument.defaultView;
        }

        // "x" and "y" are offset positions of the "padding-box" from the document top-left edge.
        box.x = rect.left + this._getPropertyPixelValue(style, 'border-left-width');
        box.y = rect.top + this._getPropertyPixelValue(style, 'border-top-width');
        if (style.getPropertyValue('position') != 'fixed') {
          box.x += frame.scrollX;
          box.y += frame.scrollY;
        }

        // "width" and "height" are sizes of the "border-box".
        box.width  = rect.right-rect.left;
        box.height = rect.bottom-rect.top;

        // "screenX" and "screenY" are absolute positions of the "border-box".
        box.screenX = rect.left * zoom;
        box.screenY = rect.top * zoom;

        if ('mozInnerScreenX' in frame && 'mozInnerScreenY' in frame) {
          box.screenX += frame.mozInnerScreenX * zoom;
          box.screenY += frame.mozInnerScreenY * zoom;
        }
        else {
          if (aNode instanceof Range){
            var owner = aNode.startContainer.parentNode;
          } else {
            var owner = aNode;
          }
          while (true)
          {
            owner = this._getFrameOwnerFromFrame(frame);
            frame = owner.ownerDocument.defaultView;
            zoom  = this.getZoom(frame);

            let style = this._getComputedStyle(owner);
            box.screenX += this._getPropertyPixelValue(style, 'border-left-width') * zoom;
            box.screenY += this._getPropertyPixelValue(style, 'border-top-width') * zoom;

            if (!owner) {
              box.screenX += frame.screenX;
              box.screenY += frame.screenY;
              break;
            }
            if (owner.ownerDocument instanceof Ci.nsIDOMXULDocument) {
              let ownerBox = owner.ownerDocument.getBoxObjectFor(owner);
              box.screenX += ownerBox.screenX;
              box.screenY += ownerBox.screenY;
              break;
            }

            let ownerRect = owner.getBoundingClientRect();
            box.screenX += ownerRect.left * zoom;
            box.screenY += ownerRect.top * zoom;
          }
        }
      }
      catch(e) {
        ucjsFind.debug(e);
      }

      for (let i in box)
      {
        box[i] = Math.round(box[i]);
      }

      return box;
    },

    _getComputedStyle : function(aNode)
    {
      return aNode.ownerDocument.defaultView.getComputedStyle(aNode, null);
    },

    _getPropertyPixelValue : function(aStyle, aProperty)
    {
      return parseInt(aStyle.getPropertyValue(aProperty).replace('px', ''));
    },

    _getFrameOwnerFromFrame : function(aFrame)
    {
      var parentItem = aFrame
          .QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIWebNavigation)
          .QueryInterface(Ci.nsIDocShell)
          .QueryInterface(Ci.nsIDocShellTreeNode)
          .QueryInterface(Ci.nsIDocShellTreeItem)
          .parent;
      var isChrome = parentItem.itemType == parentItem.typeChrome;
      var parentDocument = parentItem
          .QueryInterface(Ci.nsIWebNavigation)
          .document;
      var nodes = parentDocument.evaluate(
          '/descendant::*[contains(" frame FRAME iframe IFRAME browser tabbrowser ", concat(" ", local-name(), " "))]',
          parentDocument,
          null,
          Ci.nsIDOMXPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
      for (let i = 0, maxi = nodes.snapshotLength; i < maxi; i++)
      {
        let owner = nodes.snapshotItem(i);
        if (isChrome && owner.wrappedJSObject) owner = owner.wrappedJSObject;
        if (owner.localName == 'tabbrowser') {
          let tabs = owner.mTabContainer.childNodes;
          for (let i = 0, maxi = tabs.length; i < maxi; i++)
          {
            let browser = tabs[i].linkedBrowser;
            if (browser.contentWindow == aFrame)
              return browser;
          }
        }
        else if (owner.contentWindow == aFrame) {
          return owner;
        }
      }
      return null;
    },

    Prefs : Cc['@mozilla.org/preferences-service;1']
      .getService(Ci.nsIPrefBranch)
      .QueryInterface(Ci.nsIPrefBranch2),

    getZoom : function(aFrame)
    {
      try {
        if (!this.Prefs.getBoolPref('browser.zoom.full'))
          return 1;
      }
      catch(e) {
        return 1;
      }
			try {
	      var markupDocumentViewer = aFrame.top
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShell)
					.contentViewer
					.QueryInterface(Ci.nsIMarkupDocumentViewer);
      } catch(ee) { //Bug 1036694 - merge nsIMarkupDocumentViewer into nsIContentViewer
         markupDocumentViewer = aFrame.top
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShell)
					.contentViewer;
      }
      return markupDocumentViewer.fullZoom;
    }

  };
})();




