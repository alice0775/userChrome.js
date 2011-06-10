// ==UserScript==
// @name           link_and_wrap.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ttp,h**p等リンク化,2chリダイレクト外し,半角文字列改行
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2008/08/18 02:00 なんか無くなっていたので再up
// ==/UserScript==

function ucjs_link_and_wrap(doc){
  var URIBREAK = false; //半角改行 (ayakawa版, musume版はスキップ)
  var CONVHTTP = false; //ttpなどhttpに変換
  var WIKIWIKI_JP_FIREFOX = true; //wikiwiki.jp/firefox内の2chへのリダイレクト
  var ASSIST2CH_RES = true; //>>100」等のリンクのクリックでの内容トグル表示
  var ASSIST2CH_IMG = false; //画像へのリンクのサムネイル表示
  var MAILTORES = true; //2chのmailtoのリンクをレスNoと解釈
  var MAILTOOFF = false; //2chのmailtoのリンクを削除


  if (!doc)
    try{doc = window.content.document;}catch(e){return;}
  if (doc.contentType != 'text/html')
    return;

  if (Components.lookupMethod(doc, 'designMode').call(doc) == 'on') return;

  var win = doc.defaultView;
  for (var wj=0,lenwj=win.frames.length;wj<lenwj;wj++){
    if (win.frames[wj])
      ucjs_link_and_wrap(win.frames[wj].document);
  }

  try{
    var html = doc.getElementsByTagName("html")[0];
    try{
      if (html.hasAttribute("__link_and_wrap_done"))
        return;
    }catch(e){
      return;
    }
    html.setAttribute("__link_and_wrap_done", "1");
  }catch(e){}


  var URIFixup = Components.classes['@mozilla.org/docshell/urifixup;1']
                         .getService(Components.interfaces.nsIURIFixup);
  var url = doc.location.href;
  if (!url||url==null||url.match(/about:blank/))
    return;
  //http,https,ttp,ttps,tp,tps,h**p,h**ps,ftpなどのテキストをリンクに変換
  if (CONVHTTP){
    var Start = new Date().getTime();
    // tags we will scan looking for un-hyperlinked urls
    var anc = doc.createElement("a");
    const allowedParents = [
      "abbr", "acronym", "address", "applet", "b", "bdo", "big", "body",
      "caption", "center", "cite", "code", "dd", "del", "div", "dfn", "dt", "em",
      "fieldset", "font", "form", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe",
      "ins", "kdb", "li", "object", "p", "q", "samp", "small", "span", "strike",
      "s", "strong", "sub", "sup", "td", "th", "tt", "u", "var"
      ];

    const urlRegex = /\b(((h?t)?tps?|h..ps?|ftp):\/\/[-_\.!~*'()a-zA-Z0-9;\/\?:@&=+$,%#\|]*[-_\.!~*a-zA-Z0-9;\/\?@&=+$,%#\|]+)/ig;
    const urlRx = /\b(ttp|tp|h..p)/i;
    var xpath = "//text()[(parent::" + allowedParents.join(" or parent::") + ")]";
    var candidates = doc.evaluate(xpath, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var cand = null, i = 0, len = candidates.snapshotLength; i < len; i++) {
      cand = candidates.snapshotItem(i)
      if (urlRegex.test(cand.nodeValue)){
        var span = doc.createElement("span");
        var source = cand.nodeValue;
        cand.parentNode.replaceChild(span, cand);
        urlRegex.lastIndex = 0;
        for (var match = null, lastLastIndex = 0; (match = urlRegex.exec(source)); ) {
          span.appendChild(doc.createTextNode(source.substring(lastLastIndex, match.index)));
          match[0] = match[0].replace(urlRx,'http');
          var a = anc.cloneNode(false);
          a.setAttribute("href", match[0]);
          a.appendChild(doc.createTextNode(match[0]));
          span.appendChild(a);
          lastLastIndex = urlRegex.lastIndex;
        }
        span.appendChild(doc.createTextNode(source.substring(lastLastIndex)));
        span.normalize();
      }
    }
    dump('Parsing http: '+((new Date()).getTime()-Start) +'msec ('+url+')\n');
  }


  if (WIKIWIKI_JP_FIREFOX && /wikiwiki\.jp\/firefox\//.test(url)) {
// wikiwikiから2ch のリダイレクト(NoscriptのJavascript禁止に対応)
    var argArr,id,software;
    var Start = (new Date()).getTime();
    var imenu = doc.links;
    var exp = new RegExp(/http:\/\/bbs\.phew\.homeip\.net\/go\.php\?/);
    for (var i=0,len = imenu.length;i<len;i++){
      if (exp.test(imenu[i].href)){
        argArr = imenu[i].href.replace(exp,'').split('&');
        imenu[i].href = 'http://pc11.2ch.net/test/read.cgi';    //ここはいずれ変える必要あり
        for (var j=0,lenj=argArr.length;j<lenj;j++){
          if (/id=/.test(argArr[j])){
            id = argArr[j].substr(3);
            imenu[i].href = imenu[i].href + '/' + id + '/l50';
          }else if (/dir=/.test(argArr[j])){
            software = argArr[j].substr(4);
            imenu[i].href = imenu[i].href + '/' + software;
          }
        }
      }
    }
    dump('Parsing wikiwiki : '+((new Date()).getTime()-Start) +'msec ('+url+')\n');
  }else if (/2ch\.net\//.test(url)) {
    if (MAILTORES) ucjs_2ch_mailtores(doc)
    if (MAILTOOFF) ucjs_2ch_mailtooff(doc);
// 2ch の外部リンクのあれ
    var Start = (new Date()).getTime();
    var imenu = doc.links;
    var exp = new RegExp("^http:\/\/(ime\.nu|(www\d\.|)ime\.st)\/","");
    for (var i=0,len = imenu.length;i<len;i++){
      if ( exp.test(imenu[i].href) )
      imenu[i].href = imenu[i].href.replace(exp,'http://');
      if (ASSIST2CH_IMG){
        if (imenu[i].childNodes[1]==null && /\.(gif|jpeg|jpg|png)$/i.test(imenu[i].href)) {
          var img = doc.createElement("img");
          img.width = "150";
          img.style.verticalAlign = "text-top";
          img.setAttribute('src',imenu[i].href);
          imenu[i].appendChild(img);
        }
      }
      if (ASSIST2CH_RES){
        if (/&gt;&gt;\d+/.test(imenu[i].innerHTML)) imenu[i].addEventListener('click',ucjs_showIframe,true);
      }
    }
    dump('Parsing 2ch : '+((new Date()).getTime()-Start) +'msec ('+url+')\n');

  }else if (url.match(/http:\/\/a\.hatena\.ne\.jp\/go\?/)){
// Hatena
    var Start = (new Date()).getTime();
    var imenu = doc.links;
    var exp = new RegExp("http:\/\/a\.hatena\.ne\.jp\/go\?","");
    for (var i=0,len = imenu.length;i<len;i++){
      imenu[i].href = imenu[i].href.replace(exp,'');
    }
    dump('Parsing Hatena : '+((new Date()).getTime()-Start) +'msec ('+url+')\n');

  }else if (/http:\/\/mixi.jp\//.test(url)){
// ミクシィ
    var Start = (new Date()).getTime();
    var newSS, styles=':visited, :visited * { color: #551A8B !important }';
    newSS=doc.createElement('link');
    newSS.rel='stylesheet';
    newSS.href='data:text/css,'+escape(styles);
    doc.documentElement.childNodes[0].appendChild(newSS);
    dump('Parsing : mixi '+((new Date()).getTime()-Start) +'msec ('+url+')\n');
  }

  //2ch用
  function ucjs_showIframe(e){
    e.preventDefault();
    e.stopPropagation();
    var a = e.target;
    //element の親ウィンドウを返す
    function getElementWindow(element){
      var doc=element.ownerDocument;
      return ( void(0)!=doc.defaultView )? doc.defaultView : doc.parentWindow;
    }

    //このフレームのウィンドウは親フレームで言うところのどれ？
    function getIFrameByWindow(frame, win){
      if (!win) win = window.content;
      for (var i=0; win.frames && i<win.frames.length; i++){
          iframe = getIFrameByWindow(frame,win.frames[i]);
          if (iframe) return iframe;
      }
      var doc = win.document;
      if (!doc)return false;

      var iframes = doc.getElementsByTagName("IFRAME");

      for (var i=0; i<iframes.length; i++) {
        var iframe = iframes.item(i);
        var w = null;
        if (iframe.contentWindow) w = iframe.contentWindow; // For IE
        else if ( window.frames && window.frames[iframe.id].window ) w = window.frames[iframe.id];
        if (w == frame ) return iframe;
      }
      return false;
    }
    if (a.childNodes.length == 1){
      var iframe = a.ownerDocument.createElement("iframe");
      var url = a.href;
      url = url.replace(/\/((l\d+)|(\d\d?\d?))?#res(\d+)$/,'/$4');

      iframe.src = url;
      iframe.width = "90%";
      iframe.height = "auto";
      iframe.style.verticalAlign = "top";
      iframe.style.border = "3px solid #cccccc";
      iframe.style.overflow = "auto";
      iframe.addEventListener('load',function(e) {
        var doc = this.contentWindow.document;
        var dl = doc.getElementsByTagName("dl");
        ucjs_isolateNode(dl[0]);
        var dt = doc.getElementsByTagName("dt");
        if (dt.length>1 && !/\/1\-/.test(doc.location.href)){
          dt[0].parentNode.removeChild(dt[0].nextSibling);
          dt[0].parentNode.removeChild(dt[0]);
        }
        ucjs_link_and_wrap(doc);
        if (MAILTORES) ucjs_2ch_mailtores(doc)
        if (MAILTOOFF) ucjs_2ch_mailtooff(doc)
        e.target.height = dl[0].offsetHeight+40 +'px';
        doc.body.scrollTop = parseInt(dl[0].offsetTop)+'px';

        setTimeout(function resizeIframe(aNode,h){
          var piFrame = getIFrameByWindow(getElementWindow(aNode));
          if (!piFrame)return;
          piFrame.height = parseInt(piFrame.height,10) + parseInt(h,10) + 40 + 'px';
          resizeIframe(piFrame,h);
        },100,e.target,e.target.height);
      },true);

      a.style.backgroundColor = "#cccccc";
      a.appendChild(a.ownerDocument.createElement("br"));
      a.appendChild(iframe);
      a.appendChild(a.ownerDocument.createElement("br"));
    }else{
      setTimeout(function resizeIframe(aNode,h){
        var piFrame = getIFrameByWindow(getElementWindow(aNode));
        if (!piFrame)return;
        piFrame.height = parseInt(piFrame.height,10) - parseInt(h,10) -40 + 'px';
        resizeIframe(piFrame,h);
      },0,a.childNodes[2],a.childNodes[2].height);
      a.style.backgroundColor = "";
      setTimeout(function(){
        a.removeChild(a.lastChild);
        a.removeChild(a.lastChild);
        a.removeChild(a.lastChild);
      },100);
    }
    return false;
  }
  function ucjs_2ch_mailtores(doc) {
    const ioService = Components.classes['@mozilla.org/network/io-service;1']
                          .getService(Components.interfaces.nsIIOService);
    if (!doc) doc = getBrowser().contentDocument;
    if (doc.contentType != 'text/html')
      return;
    var url = doc.location.href;
    if (!/2ch\.net\//.test(url))
      return;
    var Start = new Date().getTime();
    var xpath = "//a[contains(@href,'mailto:')]|//span[contains(@class,'resName')]";
    var aNodes = doc.evaluate(xpath, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i=0,len=aNodes.snapshotLength; i<len; i++) {
      var aNode = aNodes.snapshotItem(i);
      var texts = doc.evaluate('descendant::text()', aNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      if (texts.snapshotLength>0){
        if (!/^\d+$/.test(texts.snapshotItem(0).textContent))
          continue;
        var baseURI = ioService.newURI(url, null, null);
        var a = doc.createElement('a');
        a.href = ioService.newURI(texts.snapshotItem(0).textContent, null, baseURI).spec;
        a.appendChild(doc.createTextNode(texts.snapshotItem(0).textContent));
        a.setAttribute("target","_blank");
        aNode.parentNode.replaceChild(a,aNode);
        a.addEventListener('click',ucjs_showIframe,true);
      }
    }
    dump('Parsing 2ch_mailtores : '+((new Date()).getTime()-Start) +'msec\n');
  }

  //半角改行 ayakawa版, musume版はスキップ
  if (/2ch\.net\//.test(url) ||
      /\.yahoo\.co\.jp\//.test(url) ||
      /www\.e2sptv\.jp\/prog110\/NewProgram\?/.test(url) ||
      /images\.google\.co\.jp\/images/.test(url) )
    return;

  if (URIBREAK && (!ucjs_getPref("general.useragent.extra.vendorComment") ||
                   !/ayakawa|musume/i.test(ucjs_getPref("general.useragent.extra.vendorComment")) )){
    var Start = new Date().getTime();
    ucjs_url_breaker_execute(doc);
    dump('Parsing uribreak: '+((new Date()).getTime()-Start) +'msec ('+url+')\n');
  }
  return;


  function ucjs_url_breaker_execute(doc){
    const threshold = new RegExp(/[\x21-\xff]{10}/);
    const wrapChr   = new RegExp(/([\/?\)\]}\-｣!､,.:=>｡;_\uff0c])|([&%#$~'"|｢\({\[\uff0c])/g);
    const avoidElm  = new RegExp(/TITLE|STYLE|CODE|FORM|SCRIPT|INPUT|TEXTAREA|PRE|OPTION|XMP/);
    const dmyChr    = new RegExp(/<dummyWBR><dummyWBR>/g);
    const dmy       = '<dummyWBR>';
    var uribreak = false;
    var wbr= doc.createElement('WBR');
    var s1,s2,pNode,cNode,i;
    try{
      var walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, true);
      while ((cNode = walker.nextNode())){
        s1 = cNode.nodeValue;
        pNode = cNode.parentNode;
        if (avoidElm.test(pNode.nodeName))// || !threshold.test(s1))
      continue;
        uribreak = true;
        s2 = s1.replace(wrapChr,'$1<dummyWBR>$2').replace(dmyChr,dmy).split(dmy);
        cNode.nodeValue = s2.pop();
        for (var i=0,len=s2.length; i<len; i++){
          pNode.insertBefore(doc.createTextNode(s2[i]), cNode);
          pNode.insertBefore(wbr.cloneNode(false), cNode);
        }
      }
    }catch(e){}
    if (uribreak && doc.getElementsByTagName('table').length>0){
      var thisE = doc.body
      var p = thisE.parentNode;
      var n = thisE.nextSibling;
      p.removeChild(thisE);
      p.insertBefore(thisE, n);
      //doc.body.style.width = '100%';
    }
  }

  //aNodeまでの道は残して、道から外れている不要なノードを削除する
  function ucjs_isolateNode(aNode){
    try{
      if ( !aNode || !aNode.ownerDocument.body ) return;
      var fNode = aNode.ownerDocument.body;
    }catch(e){}
    try{
      if ( fNode.parentNode ) fNode = fNode.parentNode;
    }catch(e){}
    while ( aNode != fNode ){
      var parent = aNode.parentNode;
      var child = parent.lastChild;
      while ( child ){
        //dump((child == aNode ? "o" : "x") + " " + parent.nodeName + " " + child.nodeName + "\n");
        var prevChild = child.previousSibling;
        if ( child != aNode ) parent.removeChild(child);
        // 前のノードへ移動
        child = prevChild;
      }
      // 親ノードへ移動
      aNode = parent;
    }
  }

  function ucjs_getPref(prefstring){
    var PREF = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
    var type = PREF.getPrefType(prefstring);
    const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
    switch (type) {
      case nsIPrefBranch.PREF_STRING:
        return PREF.getCharPref(prefstring);
        break;
      case nsIPrefBranch.PREF_INT:
        return PREF.getIntPref(prefstring);
        break;
      case nsIPrefBranch.PREF_BOOL:
      default:
      try{
        return PREF.getBoolPref(prefstring);
        break;
      }catch(ex){
        break;
      }
    }
    return null;
  }
}
gBrowser.tabContainer.addEventListener('SSTabRestored',function(event){
   ucjs_link_and_wrap(event.originalTarget.linkedBrowser.contentWindow.document);
},false);
gBrowser.addEventListener('DOMContentLoaded', function(event) { if (event.originalTarget instanceof HTMLDocument)ucjs_link_and_wrap(); },true);
//ucjs_link_and_wrap();

var ucjs_2ch_mailtooff = function ucjs_2ch_mailtooff(doc) {
  if (!doc)
    try{doc = window.content.document;}catch(e){return;}
  if (doc.contentType != 'text/html')
    return;
  var url = doc.location.href;
  if (!/2ch\.net\//.test(url))
    return;
  var Start = new Date().getTime();
  var xpath = "//a[contains(@href,'mailto:')]";
  var aNodes = doc.evaluate(xpath, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  for (var i=0,len=aNodes.snapshotLength; i<len; i++) {
    var aNode = aNodes.snapshotItem(i);
      var range = document.createRange();
      range.selectNodeContents(aNode);
      var df = range.extractContents();
      range.setStartBefore(aNode);
      range.insertNode(df);
      range.selectNode(aNode);
      range.deleteContents();
  }
  dump('Parsing 2ch_mailto : '+((new Date()).getTime()-Start) +'msec\n');
}
