// ==UserScript==
// @name           backforward-buttonToolTip.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    戻る進むボタンのツールチップに, 移動先のドキュメントタイトルとURlを瞬時に表示するようにする
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2008/01/31 12:20 Gecko/2008013004 3.0b3preに対応
// @version        2007/11/10 20:00
// @Note
// ==/UserScript==
var backforward_button = {
  // --- config ---
  _displayURL: false,    // ツールチップにURL表示するかどうか
  _enableCtrlKey: false, // true:default=normal  +ctrlKey=quick popup,   false: always quick popup.
  // --- config ---
  _delay: 50,
  _lastTarget: null,
  _showTimeout: null,
  _hideTimeout: null,
  //初期化
  init: function() {
    const kXULNS =
         "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    //ツールチップ要素作成
    var tooltip = document.createElementNS(kXULNS,"tooltip");
    tooltip.setAttribute('id',"backforward-button_tooltip");
    tooltip.setAttribute('noautohide',"true");
    tooltip.setAttribute('orient',"vertical");
    document.getElementById("main-window").appendChild(tooltip)
    //タイトル用要素作成
    var vbox = document.createElementNS(kXULNS,"vbox");
    tooltip.appendChild(vbox);
    var label = document.createElementNS(kXULNS,"label");
    label.setAttribute('id',"backforward-button_nameValue");
    vbox.appendChild(label);
    //url用要素作成
    label = document.createElementNS(kXULNS,"label");
    label.setAttribute('id',"backforward-button_URLValue");
    vbox.appendChild(label);
    //ボタンにイベントハンドラ登録
    var b = this.activeBrowser();
    var ref = document.getElementById('back-button');
    ref.setAttribute('backuptooltiptext',ref.getAttribute('tooltiptext'));
    ref.addEventListener("mousemove", this, false);
    ref.addEventListener("mouseout", this, true);
    ref.addEventListener("mousedown", this, true);

    var ref = document.getElementById('forward-button');
    ref.setAttribute('backuptooltiptext',ref.getAttribute('tooltiptext'));
    ref.addEventListener("mousemove", this, false);
    ref.addEventListener("mouseout", this, true);
    ref.addEventListener("mousedown", this, true);
  },
  //ブラウザウインドウを閉じたときの処理
  uninit: function() {
    if(this._hideTimeout) clearTimeout(this._hideTimeout);
    if(this._showTimeout) clearTimeout(this._showTimeout);
    var b = this.activeBrowser();
    var ref = document.getElementById('back-button');
    ref.removeEventListener("mousemove", this, false);
    ref.removeEventListener("mouseout", this, true);
    ref.removeEventListener("mousedown", this, true);

    var ref = document.getElementById('forward-button');
    ref.removeEventListener("mouseover", this, false);
    ref.removeEventListener("mouseout", this, true);
    ref.removeEventListener("mousedown", this, true);
  },
  //イベントハンドラ
  handleEvent: function(event) {
    switch (event.type) {
      case "mousemove":    this.mouseMove(event); break;
      case "mouseout":
      case "mousedown":    this.hide(event); break;
    }
  },
  //現在のブラウザをget
  activeBrowser: function() {
    return ('SplitBrowser' in window ? SplitBrowser.activeBrowser : null )
            || gBrowser;
  },

  //現在のウインドウをget
  _getWindow: function(){
    var focusedWindow = document.commandDispatcher.focusedWindow;
    if (!focusedWindow || focusedWindow == window)
      return window.content;
    else
      return focusedWindow;
  },

  debug: function(aMsg){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    Cc["@mozilla.org/consoleservice;1"]
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aMsg);
  },

  getVer: function(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  },


  mouseMove: function(event) {
    var aTarget = event.target;
    //ボタンの上でない(menupopup内またはdropmarker)
    if (this.getVer() < 3) {
      if (!aTarget || aTarget.localName !='toolbarbutton' || event.originalTarget.nodeName !='xul:toolbarbutton'  ) {
        this.hide(event);
        while( aTarget && aTarget instanceof XULElement && aTarget.localName !='toolbarbutton'){
          aTarget = aTarget.parentNode;
        }
        //menupopup内またはdropmarkerのはずなのでデフォルトのツールチップ表示
        event.target.setAttribute('tooltiptext', aTarget.getAttribute('backuptooltiptext'));
        return;
      }
    } else {
      if( !aTarget || aTarget.localName !='toolbarbutton' || event.originalTarget.nodeName =='xul:toolbarbutton'  ) {
        this.hide(event);
        while( aTarget && aTarget instanceof XULElement &&
               aTarget.localName !='toolbarbutton' ||
               aTarget.id == 'unified-back-forward-button'){
          aTarget = aTarget.parentNode;
        }
        //menupopup内またはdropmarkerのはずなのでデフォルトのツールチップ表示
        event.target.setAttribute('tooltiptext', aTarget.getAttribute('backuptooltiptext'));
        return;
      }
    }
    //if(this._lastTarget != aTarget){
      //履歴リストからurlとタイトルをget
      var title, url, entry = { URI : null, referrerURI : null, title : null };
      var targetId = aTarget.id;
      if(targetId=="back-button"){
        entry = this._GetEntry(this._getWindow(),-1)
      }else if(targetId=="forward-button"){
        entry = this._GetEntry(this._getWindow(), 1)
      }else{
        return;
      }
      //履歴タイトルがない---デフォルトのツールチップタイトルとする
      if(!entry.title){
        entry.title = aTarget.getAttribute('backuptooltiptext')
      }
      //ctrlキーにより瞬時に表示しない場合
      if( !(event.ctrlKey || !this._enableCtrlKey) ){
        this.dohide();
      }
      //ツールチップの準備
      aTarget.removeAttribute('tooltiptext', "");
      var tooltip = document.getElementById('backforward-button_tooltip');
      tooltip.firstChild.childNodes[0].setAttribute("value",entry.title);
      if(this._displayURL && entry.URI){
        tooltip.firstChild.childNodes[1].setAttribute("value",entry.URI.spec);
        tooltip.firstChild.childNodes[1].removeAttribute('hidden');
      }else{
        //urlが無いのでurl欄を非表示
        tooltip.firstChild.childNodes[1].setAttribute('hidden','true');
      }
      //ツールチップ表示タイマー初期化
      var self = this;
      clearTimeout(this._showTimeout);
      //ツールチップ表示 タイマーセット
      this._showTimeout = setTimeout(function(targetElm){
        clearTimeout(self._hideTimeout);
        self.show(targetElm);
        //ctrlキーにより瞬時に表示しない場合, ツールチップ非表示タイマーセット
        if( !(event.ctrlKey || !self._enableCtrlKey) ){
          self._hideTimeout = setTimeout(function(){
            clearTimeout(self._showTimeout);
            tooltip.hidePopup();
          }, 3000);
        }

      }, ( event.ctrlKey || !this._enableCtrlKey) ? this._delay : 400, aTarget);
    //}
    this._lastTarget = aTarget;
  },

  show: function(targetElm) {
    //ツールチップget
    var tooltip = document.getElementById('backforward-button_tooltip');
    try{
      //一端非表示にする(表示位置がずれる場合があるので仕方なく)
      tooltip.hidePopup();
      //ツールチップ表示
      tooltip.showPopup(targetElm, -1, -1, 'tooltip', "bottomleft", "topleft");
    }catch(ex){}
  },

  hide: function(event) {
    //var aTarget = event.relatedTarget;
    //while( aTarget && aTarget.localName !='toolbarbutton'){
    //  aTarget = aTarget.parentNode;
    //}
    //if( aTarget ) return;
    this.dohide();
  },

  dohide:  function() {
    //非表示,表示タイマーリセット
    clearTimeout(this._hideTimeout);
    clearTimeout(this._showTimeout);
    var self = this;
    //非表示タイマー=0としてタイマーセット
    setTimeout(function(){
      try{
        //ツールチップ非表示
        document.getElementById('backforward-button_tooltip').hidePopup();
      }catch(e){}
      self._lastTarget = null;
    }, 0);
  },
  //指定したウインドウの履歴から一つ前または後の情報をget
  _GetEntry: function(aWin,aHistoryDirection){
    var entry = { URI : null, referrerURI : null, title : null };
    //if( aWin == this.activeBrowser().contentWindow // フレーム未実装
    //  ){
      var SH    = this.activeBrowser().sessionHistory;
      var index = SH.index + (aHistoryDirection > 0 ? 1 : -1 );
      if (index > -1 && index < SH.count) {
        var entry = this._GetHistoryEntryAt(index);
        return entry;
     // }
    }
    return entry;
  },

  //履歴のインデックスで指定した情報をget
  _GetHistoryEntryAt: function(aIndex){
    try{
      var entry  = this.activeBrowser().sessionHistory.getEntryAtIndex(aIndex, false);
      var info = { URI : null, referrerURI : null, title : null };
      if (entry) {
        entry = entry.QueryInterface(Components.interfaces.nsIHistoryEntry)
              .QueryInterface(Components.interfaces.nsISHEntry);
        if (entry.URI)
          info.URI = entry.URI;
        if (entry.referrerURI)
          info.referrerURI = entry.referrerURI;
         if (entry.title)
          info.title = entry.title;
      }
      return info;
    }catch(e){return null;}
  }

}

backforward_button.init();
window.addEventListener("unload", function(){ backforward_button.uninit(); }, false);
