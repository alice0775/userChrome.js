// ==UserScript==
// @name           seachbarOnDropUseTextContent.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    SearchbarやFindbarにドラッグ&ドロップする時, リンクテキストを優先する(ただし複数範囲選択には未対応)
// @include        main
// @compatibility  Firefox 3.0 3.1
// @author         Alice0775
// @version        2013/11/16 12:00 addHistoryFindbar_Fx25.uc.jsに対応
// @version        2013/01/16 12:00 Bug 831008 Disable Mutation Events in chrome/XUL
// ==/UserScript==
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2011/05/01 00:00 TAB_DROP_TYPE change in PlacesUIUtils
// @version        2010/03/25 00:00   Bug 545714 -  Consolidate browser and nsContentAreaDragDrop.cpp dropped link handlers
// @version        2009/06/22 00:00  Bug 456106 -  Switch to new drag and drop api in toolkit/browser
// @version        2009/06/16 16:00 タブをdropした場合はurlでなくラベルをドロップ
// @version        2009/05/12 20:00 addHistoryFindbarFx3.0.uc.jsに対応, Second Searchなんで変なの
// @version        2008/10/28 01:00
// @Note           SecondSearch や Tab Mox Plusには対応していないかも
var seachbarOnDropUseTextContent = {
  init: function(){
    window.addEventListener("aftercustomization", this, false);
    window.addEventListener("unload", this, false);
    this.patch();
    this.patchFindbar();
  },

  //パッチ
  patch: function() {
    //searchBar
    var searchbar = document.getElementById('searchbar');
    if (searchbar) {
      searchbar._textbox._onDrop = function (event) {
        var mDragService = Cc["@mozilla.org/widget/dragservice;1"]
                           .getService(Ci.nsIDragService);
        var aDragSession = mDragService.getCurrentSession();
        var dataTransfer = event.dataTransfer;
        var data = dataTransfer.getData("text/plain");
        if (!data)
          data = dataTransfer.getData("text/x-moz-text-internal");
        data = seachbarOnDropUseTextContent.getLinkText(event, dataTransfer, aDragSession, data);
        if (data) {
          event.stopPropagation();
          event.preventDefault();
          this.value = data;
          this.onTextEntered(event);
        }
      }
      searchbar._textbox.addEventListener("drop", searchbar._textbox._onDrop, true);
    }
  },

  patchFindbar: function() {
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      if (gBrowser.selectedTab._findBar)
        this.patchFindbar2(gBrowser.selectedTab._findBar);
    }
    //fx25 for newly created findbar
    var self = this;
    if ("gBrowser" in window && "getFindBar" in gBrowser) {
      gBrowser.tabContainer.addEventListener("TabFindInitialized", function(event){
        self.patchFindbar2(event.target._findBar);
      });
    }

    //addHistoryFindbarFx3.0.uc.jsに対応のため 遅延
    var timer, count = 100;
    timer = setInterval(function(self){
      if (--count > 0 || "historyFindbar" in window) {
        clearInterval(timer);
        if ("onDrop"  in window.historyFindbar) {
          var func = historyFindbar.onDrop.toString();
          func = func.replace(
            'if (data) {',
            'data = seachbarOnDropUseTextContent.getLinkText(aEvent, aXferData, aDragSession, data); \
            $&'
          );
          eval("historyFindbar.onDrop = " + func);

          var func = historyFindbar.getSupportedFlavours.toString();
          func = func.replace(
            'return flavourSet;',
            'flavourSet.appendFlavour("application/x-moz-tabbrowser-tab"); \
            $&'
          );
          eval("historyFindbar.getSupportedFlavours = " + func);
        }
      }
    }, 500, self);
  },

  patchFindbar2: function(aFindBar) {
    //Findbar
    aFindBar._findField.addEventListener("drop" , function(event){aFindBar._findField.findBarOnDropUseTextContent(event);}, true);
    aFindBar._findField.findBarOnDropUseTextContent = function(aEvent) {
      aEvent.preventDefault();
      aEvent.stopPropagation();
      var aXferData = aEvent.dataTransfer;
      var value = aXferData.getData("text/plain");
      var mDragService = Components.classes["@mozilla.org/widget/dragservice;1"]
                         .getService(Components.interfaces.nsIDragService);
      var aDragSession = mDragService.getCurrentSession();
      var value = seachbarOnDropUseTextContent.getLinkText(aEvent, aXferData, aDragSession, value);
      this.value = value;
      this.findbar._find(value);
    }
  },

  getLinkText: function(aEvent, aXferData, aDragSession, data){
    //リンクそのもの場合は, リンクテキストを(ただし複数範囲選択には未対応)
    //リンク上のテキストの一部が選択されている場合は, 選択文字列を (ただし複数範囲選択には未対応)
    var dt = aEvent.dataTransfer;
    // Disallow dropping multiple items
    //if (dt.mozItemCount > 1)
    //  return;

    var types = dt.mozTypesAt(0);
    var sourceNode = null;
    // tabs are always added as the first type
    var TAB_DROP_TYPE = "application/x-moz-tabbrowser-tab";
    if (types[0] == TAB_DROP_TYPE) {
      sourceNode = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
    } else {
      sourceNode = aDragSession.sourceNode;
    }
    if (sourceNode && sourceNode instanceof XULElement && sourceNode.localName.toLowerCase() == "tab") {
      data = sourceNode.getAttribute('label');
    } else if (sourceNode && sourceNode instanceof HTMLAnchorElement) {
      //Fx3.1 リンクをドロップしたので, リンクテキストをデータとする
      data = sourceNode.textContent;
    } else if (sourceNode && sourceNode.nodeName == "#text") {
      var win = sourceNode.ownerDocument.defaultView;
      var sel = win.getSelection();
      var sep ="";
      var pasteNewlines = 2;
      pasteNewlines = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch2)
                            .getIntPref("editor.singleLine.pasteNewlines");
      switch (pasteNewlines){
        case 0:
          sep ="\n";
          break;
        case 2:
          sep =" ";
          break;
        case 4:
          sep =",";
          break;
      }

      var text = '';
      if (/\n/.test(data)){
        text = (pasteNewlines == 1)? /(.*)\n/.match(data).$1 : data.replace(/\n/g, sep);
      } else {
        if (sel && sel.rangeCount > 0){
          text = sel.getRangeAt(0).toString().replace(/\n/g, sep);
          if (pasteNewlines != 1){
            for (var i = 1; i < sel.rangeCount; i++){
              text += sep;
              text += sel.getRangeAt(i).toString().replace(/\n/g, sep);
            }
          }
        }
      }
      text = text.replace(/\s$/, '');
      //ドロップデータの親リンク要素
      var dropNode = seachbarOnDropUseTextContent.getParentAnchorElement(sourceNode);
      if (dropNode){
        if (sel.rangeCount == 0) {
          //ノードがドロップされた, かつ選択テキストがない
          data = dropNode.textContent;
        } else {
          var selNode, flg = 0;
          for (var i = 0; i < sel.rangeCount; i++){
            selNode = seachbarOnDropUseTextContent.getParentAnchorElement(sel.getRangeAt(i).startContainer);
            if (selNode == dropNode){
              flg = 1;
            }
            selNode = seachbarOnDropUseTextContent.getParentAnchorElement(sel.getRangeAt(i).endContainer);
            if (selNode == dropNode){
              flg = 1;
            }
          }
          if (flg != 1){
            //ノードがドロップされた, かつ全ての選択テキストはそのドロップ親リンクに含まない
            data = dropNode.textContent;
          } else {
            //ノードがドロップされた, かつ何れか選択テキストがそのドロップ親リンクにあった
            data = text;
          }
        }
      }
    }
    return data;
  },

  //親アンカー
  getParentAnchorElement: function(node){
    while(node){
      if (node instanceof HTMLAnchorElement)
        break;
      node = node.parentNode;
    }
    return node;
  },


  handleEvent: function(event){
    switch(event.type){
      case "unload":
        window.removeEventListener("aftercustomization", this, false);
        break;
      case "aftercustomization":
        this.patch();
        break;
    }
  }
};
seachbarOnDropUseTextContent.init();
