// ==UserScript==
// @name           canvassave.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        LastMod 2007/05/11 13:00
// @Note           
// ==/UserScript== 
var ToolCanvas = {

  
  init: function() {
    var optionsitem, menuitem;
    
    //var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
    //    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    //UI.charset = "UTF-8";
    var gPref = Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefBranch);

    menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "savecanvas");
    //menuitem.setAttribute("label", UI.ConvertToUnicode("スクリーンショット(Page)を保存..."));
    menuitem.setAttribute("label", "スクリーンショット(Page)を保存...");
    menuitem.setAttribute("oncommand", "ToolCanvas.canvassave(false);");
    optionsitem = document.getElementById("menu_sendLink");
    optionsitem.parentNode.insertBefore(menuitem, optionsitem);
    dump("Initialized addRestartButtons");
    //
    menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "savecanvas1");
    //menuitem.setAttribute("label", UI.ConvertToUnicode("スクリーンショット(View)を保存..."));
    menuitem.setAttribute("label", "スクリーンショット(View)を保存...");
    menuitem.setAttribute("oncommand", "ToolCanvas.canvassave(true);");
    optionsitem = document.getElementById("menu_sendLink");
    optionsitem.parentNode.insertBefore(menuitem, optionsitem);
    dump("Initialized CanvasSave"); 
  },
  canvassave: function(flg) {
    // flg true view portion
    //     false page
    //canvas要素によるWebページのスクリーンショット保存機能
    //var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
    //    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    //UI.charset = "UTF-8";
    //
    //対象となるWebページのWindowオブジェクト,サイズを取得
    //documentElement.clientHeightは,
    //  Quirks(後方互換)モードではWebページ全体の高さ
    //  Standards Compliant(標準準拠)モードでは実際に見えている部分のみの高さ
    var win = window.content;
    if(flg){
      var w = win.innerWidth;
      var h = win.innerHeight;
      if (win.documentElement && win.documentElement.clientWidth)
        w = win.documentElement.clientWidth;
      if (win.documentElement && win.documentElement.clientHeight)
        h = win.documentElement.clientHeight;
      //get the scrolled position
      var xScroll = win.scrollX;
      var yScroll = win.scrollY;
    }else{
      if(win.frames.length>0){
        var i,frm;
        var w = h = 0;
        /*for(i=0;i<win.frames.length;i++){
          dump("i=" + i + "\n");
          frm = win.frames[i];
          var frmw = frm.document.width;
          var frmh = frm.document.height;
          dump(frmw+", "+frmh + "\n");
          var frmL = frmT = 0;
          if(frm.offsetLeft) frmL = frm.offsetLeft;
          if(frm.offsetTop)  frmT = frm.offsetTop;
          dump(frmL+", "+frmT + "\n");
          if(w < frmL + frmw) w = frmL + frmw;
          if(h < frmT + frmh) h = frmT + frmh;
        }*/
      }else{
        var w = win.document.width;
        var h = win.document.height;
      }
      // set the preview initially for top left
      var xScroll = 0;
      var yScroll = 0;
    }
    if(w==0 || h==0){
      if(flg) return;
      //flg = confirm(UI.ConvertToUnicode("フレームを使用しているので,実際に見えている部分のみとします。"));
      flg = confirm("フレームを使用しているので,実際に見えている部分のみとします。");
      if(flg) ToolCanvas.canvassave(flg);
      return;
    }
    //dump(w+", "+h + "\n");

    //canvas要素を一時的に表示
    //サイズを取得したWebページのサイズと一致させる
    var canvas = document.getElementById("myCanvas");
    canvas.style.display = "inline";
    canvas.width = w;
    canvas.height = h;

    //canvas要素へWebページを描画
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(1.0, 1.0);    // 1.0なら原寸大
    ctx.drawWindow(win, xScroll, yScroll, w, h , "rgb(255,255,255)");
    ctx.restore();

    //PNG画像データをBASE64エンコードしたdata:URLを取得
    //取得した string型の data:URL から nsIURI オブジェクトを生成
    try {
        var url = canvas.toDataURL("image/png");
    } catch(ex) {
        alert("This feature requires Firefox 2.0.\n" + ex);
        return;
    }
    const IO_SERVICE = Components.classes['@mozilla.org/network/io-service;1']
                       .getService(Components.interfaces.nsIIOService);
    url = IO_SERVICE.newURI(url, null, null);

    //ファイルピッカーを使って保存先ファイルを決定
    var fp = Components.classes['@mozilla.org/filepicker;1']
              .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, "Save Screenshot As", fp.modeSave);
    fp.appendFilters(fp.filterImages);
    fp.defaultExtension = "png";
    fp.defaultString = "screenshot.png";
    if ( fp.show() == fp.returnCancel || !fp.file ) return;

    //nsIWebBrowserPersist を使って data:URL をファイルへ保存
    var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
              .createInstance(Components.interfaces.nsIWebBrowserPersist);
    wbp.saveURI(url, null, null, null, null, fp.file);

    //一時的に表示されたキャンバスを非表示にして後始末
    canvas.style.display = "none";
    canvas.width = 1;
    canvas.height = 1;
  }
}

ToolCanvas.init();

