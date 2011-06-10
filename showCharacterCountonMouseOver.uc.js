// ==UserScript==
// @name           Show Character Count onMouseOver
// @namespace      http://space.geocities.jp/alice0775/
// @description    Show Character Count onMouseOver
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        LastMod 2007/05/11 13:00
// @Note           
// ==/UserScript==
(function(){
  
  function PageLoad(event){
    if (event.originalTarget instanceof HTMLDocument) {
      var doc = event.originalTarget;
      var url = doc.URL;
      if(url.indexOf("http://space.geocities.yahoo.co.jp/gl/")<0
      && url.indexOf("http://pc11.2ch.net/")<0 ) return;
      if (event.originalTarget.defaultView.frameElement) {
        // タブにフレームが読み込まれました。doc はフレームセットのルート
        // ドキュメントになります。もし、このウェブページに frames/iframes が
        // 読み込まれたときに何もしないなら、次の行のコメントアウトを外してください
        return;
        // ルートドキュメントを探索する
        while (doc.defaultView.frameElement) {
          doc=doc.defaultView.frameElement.ownerDocument;
        }
      }
      ShowCharacterCountonMouseOver(doc);
    }
  }
  
  function ShowCharacterCountonMouseOver(doc){
    var inputs, input;
      inputs = doc.evaluate(
      '//textarea|//input[@type ="text"]',
      doc,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null);
    if(!inputs.snapshotLength) return;
    for(var i = 0; i < inputs.snapshotLength; i++) {
      input = inputs.snapshotItem(i);
      input.addEventListener('mouseover', function(event) {
        this.title = "字数:"+this.value.length+",全角:"+jstrlen(this.value)/2;
      }, false);
    }
  }
  
  function jstrlen(str) {
    var len = 0;
    str = escape(str);
    for (i = 0; i < str.length; i++, len++) {
      if (str.charAt(i) != "%")
    continue;
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
    return len;
  }
  gBrowser.addEventListener("load", PageLoad, true);
})();
