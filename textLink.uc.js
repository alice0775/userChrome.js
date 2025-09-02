// ==UserScript==
// @name           textLink.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TextLinkもどき
// @include        main
// @include        chrome://messenger/content/messenger.xul
// @include        chrome://messenger/content/messageWindow.xul
// @compatibility  Firefox 10, Thunderbird 10
// @author         Alice0775
// @note           Left DblClick        : open link on  new tab
// @note           ctrl + Left DblClick : open current tab
// @note           shift + Left DblClick: save as link
// @note           全角で書かれたURLを解釈するには,user.jsにおいて,user_pref("network.enableIDN", true);
// @version        2014/10/12 23:30 !
// @version        2014/06/18 13:30 working with autoCopyToClipboard.uc.js
// @version        2014/06/18 13:30 Fix Thunderbird
// @version        2014/06/18 12:30 remove experiments e10s
// @version        2014/06/18 07:10 experiments e10s event
// @version        2014/06/18 07:04 experiments e10s
// @version        2014/06/18 07:00 experiments e10s
// @version        2014/03/15 06:00 Fix Issue#21
// @version        2013/09/13 00:00 Bug 856437 Remove Components.lookupMethod
// @version        2013/05/15 06:00 should open like http://graphs.mozilla.org/graph.html#tests=[[205,63,8]]&sel=none&displayrange=90&datatype=running
// @version        2013/03/28 06:00 should not react by dblclick on yyy ,like <a href="http://xxx.xxx/?xxx">http://xxx.xxx/?xxx</a><br>yyy
// @version        2013/01/18 23:00 Bug 795065 Add privacy status to nsDownload
// @version        2013/01/08 02:00 Bug 827546
// ==/UserScript==
// @version        checkLoadURIStrWithPrincipal
// @version        2012/07/26 15:00 .hoge とか ..huga はスキップ
// @version        2011/11/28 09:00 update TLD リスト
// @version        2011/11/23 19:00 エラー修正
// @version        2011/11/05 11:00 textNodeの隣がnullで親の隣がbrなら探索を終わりにしてみる
// @version        2011/10/25 19:00 contextmenuは閉じる
// @version        2011/10/25 19:00 選してみる
// @version        2011/09/28 20:00 openLinkIn
// @version        2011/09/14 13:00 url ad hoc修正
// @version        2011/08/11 11:00 url regexp修正
// @version        2010/10/18 18:00 探索足切り
// @version        2010/09/29 22:00 aタグは無視するように
// @version        2010/09/15 18:00 input要素で誤動作していた
// @version        2010/03/22 19:00 tldcheck正規表現修正
// @version        2009/11/30 01:00 ブロックレベル要素としてblockquote忘れてた
// @version        2009/08/30 01:00 "|"も追加
// @version        2009/07/05 09:00 末尾の.,削除するようにした
// @version        2009/06/29 09:00 末尾の/の処理やんぺ (何で削除するようにしたか忘れた)
// @version        2009/06/07 22:00 末尾の]の処理
// @version        2009/05/06 22:00 mailto:
// @version        2009/05/02 19:00 readonlyなtextarea等に対応させた
// @version        2009/05/01 19:30 tldがorg等gTLDのとき動かなくなっていた2009/05/01 19:00のregression
// @version        2009/05/01 19:00 tldの最後が. のも通るように
// @version        2009/04/23 00:00 Thunderbirdでも, <pre>にも
// @version        2009/03/10 00:00 <br>は区切りと見なすようにした が壊れていた修正
// @version        2009/02/24 00:00 fixup後の末尾の/削除するようにした
// @version        2009/01/07 22:00 tldをcheck
// @version        2008/10/22 22:00 修正
// @version        2008/08/22 14:00 ちょっと修正してみた
// @version        2008/07/11 エンバグ(2008/03/01 17:00)修正
// @version        2008/04/15 loadURIの使用やめ
// @version        2008/03/10 12:00 例外
// @version        2008/03/01 17:00 <br>は区切りと見なすようにした
// @version        2008/02/24 01:00 ftp不具合修正
// @version        2007/12/26 18:00 カンマ除外
// @version        2007/11/07 22:00
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
* The Original Code is Alice0775
* http://space.geocities.yahoo.co.jp/gl/alice0775
*
*
* Contributor(s):
*
*
* ***** END LICENSE BLOCK ***** */

function ucjs_textlink(event){
  if(event.button != 0 && event.keyCode != 13) return;

  var Start = new Date().getTime();

  const RELATIVE = true; //相対urlを解決するかどうか
  const SELECTUTL = false; //urlらしき文字列を選択するかどうか

  const ioService = Components.classes['@mozilla.org/network/io-service;1']
                      .getService(Components.interfaces.nsIIOService);
/*
/(([\w-]+:\/\/?|[\w\d]+[.])?[^\s()<>]+[.](?:\([\w\d]+\)|([^`!()\[\]{};:'\".,<>?«»“”‘’\s]|\/)+))/
*/
  const urlRegex = /(((h?t)?tps?|h..ps?|ftp|((\uff48)?\uff54)?\uff54\uff50(\uff53)?|\uff48..\uff50(\uff53)?|\uff46\uff54\uff50)(:\/\/|\uff1a\/\/|:\uff0f\uff0f|\uff1a\uff0f\uff0f)[-_.~*'()|a-zA-Z0-9;:\/?,@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff08\uff09\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff1a\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]*[-_,.~*)\[\]|a-zA-Z0-9;!:\/?@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]+)/ig;
  const urlRegex1 = /([-_.~*'()|a-zA-Z0-9;:\/?,@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff08\uff09\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]*[.\uff0e]+[-_.~*'\[\]|a-zA-Z0-9;:\/?,@&!=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff08\uff09\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff1a\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c]+[.\uff0e/\uff0f]*[-_,.~*\[\]|a-zA-Z0-9;!:\/?@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff1a\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c]+)/ig;
  const urlRx = /^(ttp|tp|h..p|\uff54\uff54\uff50|\uff54\uff50|\uff48..\uff50)/i;
  const urlRx1 = /(:\/\/|\uff1a\/\/|:\uff0f\uff0f|\uff1a\uff0f\uff0f)/i;
  const mailRx = /(^(mailto:|\uff4d\uff41\uff49\uff4c\uff54\uff4f\uff1a)(?:(?:(?:(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:"(?:\\[^\r\n]|[^\\"])*")))\@(?:(?:(?:(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:\[(?:\\\S|[\x21-\x5a\x5e-\x7e])*\])))$)/;
  const mailRx1 = /(^(?:(?:(?:(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:"(?:\\[^\r\n]|[^\\"])*")))\@(?:(?:(?:(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:\[(?:\\\S|[\x21-\x5a\x5e-\x7e])*\])))$)/;

//ドキュメントとコンテントタイプ
  var doc = event.originalTarget.ownerDocument;
  if(doc.contentType != 'text/plain'
     && doc.contentType != 'text/html'
     && doc.contentType != 'application/xml'
     && doc.contentType != 'application/xhtml+xml') return;

  //designModeなら何もしない
  if (doc.designMode == 'on') return;

  var win = doc.defaultView;
  if(!win)return;

  var str1, text, str2;

  //textarea かどうか
  var node = isParentEditableNode(document.commandDispatcher.focusedElement);
  if (!node) {
  // このif ブロックは textarea等以外の処理
  //ダブルクリックで選択された選択文字列のレンジを得る
    var selection = win.getSelection();
    var selRange;
    try{
      selRange = selection.getRangeAt(0);
    }catch(e){
      selRange = selection;
    }
    if(!selRange)return;
  //レンジのノードなど
    text = selection.toString();
    if(text == '') return;
  //debug(text);
    var sNode = selRange.startContainer; //debug(sNode.localName);
    var soffset = selRange.startOffset;
    var eNode = selRange.endContainer; //debug(eNode.localName);
    var eoffset = selRange.endOffset;
    if (sNode != eNode){
      eNode = sNode;
      eoffset = soffset + text.length - 1;
    }
    var sOyaNode = oyaNode(sNode);
    var eOyaNode = oyaNode(eNode);
    var root;
    if(sOyaNode == eOyaNode)
      root = sOyaNode;
    else
      root = doc;
    if (!root)
      return;
//debug("sOyaNode " + sOyaNode.localName + " soffset " + soffset);
//debug("eOyaNode " + eOyaNode.localName + " eoffset " + eoffset);

  //親ブロック要素の文字列をすべて得る
    const allowedParents = [
        "a", "abbr", "acronym", "address", "applet", "b", "bdo", "big", "blockquote", "body",
        "caption", "center", "cite", "code", "dd", "del", "dir", "div", "dfn", "dl", "dt", "em",
        "fieldset", "font", "form", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe",
        "ins", "kdb", "li", "menu", "noframes", "noscript", "object", "ol", "p", "pre", "q", "samp", "small", "span", "strike",
        "s", "strong", "sub", "sup", "table", "td", "th", "thead", "tt", "u", "var"
        ];
    var xpath = ".//text()[(parent::" + allowedParents.join(" or parent::") + ")]";

    var candidates = doc.evaluate(xpath, root, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
//debug("candidates.snapshotLength " + candidates.snapshotLength);
  //レンジより前にある文字列
    var i1 = - 1;
    for (var i = i1 + 1, len = candidates.snapshotLength; i < len; i++) {
      if(candidates.snapshotItem(i) != sNode) continue;
      i1 = i - 1;
      break;
    }
    str1 ="";
    if (i >= 0) {
      for (var i = i1; i >= 0 ; i--){
        if(sOyaNode == oyaNode(candidates.snapshotItem(i))){
          if (candidates.snapshotItem(i).nextSibling &&
              /^br$/i.test(candidates.snapshotItem(i).nextSibling.localName)) {
            //debug(candidates.snapshotItem(i).nodeValue + "  " + candidates.snapshotItem(i).nextSibling.localName);
            break;
          }
//debug("candidates.snapshotItem(i).parentNode.localName "+candidates.snapshotItem(i).parentNode.localName);
          if (/^a$/i.test(candidates.snapshotItem(i).parentNode.localName) &&
              candidates.snapshotItem(i).parentNode.hasAttribute("href") )
            break;
          str1 = candidates.snapshotItem(i).nodeValue + str1;
//debug("str1 "+str1);
          if (/[ 　]/.test(str1))
            break;
        } else {
          break;
        }
      }
    }
    str2 = str1;
    if(sNode.nodeValue && soffset > 0) str1 = str1 + sNode.nodeValue.substr(0,soffset);

  //レンジより後ろにある文字列
    for(var i = i1 + 1, len = candidates.snapshotLength; i < len; i++) {
      if(sOyaNode == oyaNode(candidates.snapshotItem(i))) {
        str2 = str2 + candidates.snapshotItem(i).nodeValue;
//debug(candidates.snapshotItem(i).nodeValue);
        if (i > i1 + 1 && /[ 　]/.test(candidates.snapshotItem(i).nodeValue))
          break;
      } else {
        break;
      }

      if (candidates.snapshotItem(i).nextSibling &&
          /^br$/i.test(candidates.snapshotItem(i).nextSibling.localName)) {
        break;
      }
      if (!candidates.snapshotItem(i).nextSibling &&
          candidates.snapshotItem(i).parentNode &&
          candidates.snapshotItem(i).parentNode.nextSibling &&
          /^br$/i.test(candidates.snapshotItem(i).parentNode.nextSibling.localName)) {
        break;
      }
    }

    str2 = str2.substr(str1.length + text.length);
  } else {
    // この elseブロックは textarea等の処理
    // readonlyでないなら何もしない
   if (!node.hasAttribute("readonly"))
     return;
   if (node &&
      (node.type == "text" || node.type == "textarea") &&
      'selectionStart' in node &&
      node.selectionStart != node.selectionEnd) {
      var offsetStart = Math.min(node.selectionStart, node.selectionEnd);
      var offsetEnd   = Math.max(node.selectionStart, node.selectionEnd);
      str1 = node.value.substr(0, offsetStart);
      text = node.value.substr(offsetStart, offsetEnd-offsetStart);
      str2 = node.value.substr(offsetEnd);
    } else {
      return;
    }
  }
//すべての文字列の中でのレンジの位置を得る
  var allStr = str1 + text + str2;
  var si = str1.length
  var ei = si + text.length;
//全角括弧調整
  while(text.match(/^[\u3001\u3002\uff08\uff5b\uff3b\u300c\u3014\u3008\u300a\u300e\u3010\u2018\u201c\u201d\u2019\u226a\uff1c\uff09\uff5d\uff3d\u300d\u3015\u3009\u300b\u300f\u3011\u2018\u201c\u201d\u2019\u226b\uff1e]/)){
    si = si + 1;
    text = text.substr(1);
  }
  while(text.match(/[\s\u3001\u3002\uff08\uff5b\uff3b\u300c\u3014\u3008\u300a\u300e\u3010\u2018\u201c\u201d\u2019\u226a\uff1c\uff09\uff5d\uff3d\u300d\u3015\u3009\u300b\u300f\u3011\u2018\u201c\u201d\u2019\u226b\uff1e]$/)){
    ei = ei - 1;
    text = text.substr(0,text.length -1);
  }
  //文末の.は無いことに
  allStr = allStr.replace(/\.$/ ,'');

//debug("2 " + str2);
//debug("Str " + text);
//debug("1 " + str1);
//debug("all " + allStr);

//すべての文字列の中でURLと思しき文字列を配列として得る
  var i1, i2;
  var arrUrl = allStr.match(urlRegex);
  if (arrUrl) {
//見つかったURLと思しき文字列の中にレンジが含まれているかどうか
    i2 = 0;
    for (var i = 0, len = arrUrl.length; i < len; i++){
//debug(i + "] " + arrUrl[i]);
      i1 = allStr.indexOf(arrUrl[i],i2);
      i2 = i1 + arrUrl[i].length;
//debug(i1 <= si && ei <= i2);
      if(i1 <= si && ei <= i2){
//debug(arrUrl[i]);
        //このURLと思しき文字列の中にレンジが含まれていたので,これをURLとして新しいタブで開きましょう
        var url = arrUrl[i];
        url = additionalFixUpURL(url);
        if (SELECTUTL)
          var URLRange = getURLRange(selRange, url)

        // ttp等を http等に および  :// を 半角に
        url = /^(ftp|\uff46\uff54\uff50)/i.test(url)
                    ? url.replace(urlRx1,'://')
                    : url.replace(urlRx,'http').replace(urlRx1,'://');
        var URIFixup = Components.classes['@mozilla.org/docshell/urifixup;1']
                       .getService(Components.interfaces.nsIURIFixup);
        var uri = URIFixup.createFixupURI(
                  url,
                  URIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP );
        if(!uri) return;
        if (!isValidTld(uri))
          return;
        uri = ioService.newURI(uri.spec, null, null);
//debug('Parsing ucjs_textlink: '+((new Date()).getTime()-Start) +'msec\n');
        if (SELECTUTL)
          selectRange(URLRange);
        textlink(event, doc, uri);
        return;
      }
    }
  }
  if ( !RELATIVE ) return;
//すべての文字列の中で相対URLと思しき文字列を配列として得る
  arrUrl = allStr.match(urlRegex1);
  if (!arrUrl) return;
  i2 = 0;
  for (var i = 0, len = arrUrl.length; i < len; i++){
//debug("Relative " + arrUrl[i]);
    i1 = allStr.indexOf(arrUrl[i],i2);
    i2 = i1 + arrUrl[i].length;

//debug(i1 +" "+ si +" "+ ei +" "+ i2);
    if (i1 <= si && ei <= i2){
      // .hoge とか ..huga はスキップ
      if (/^\./.test(arrUrl[i]) && !/^[\.]+[/]/.test(arrUrl[i]))
        return;
//debug(arrUrl[i]);
      //このURLと思しき文字列の中にレンジが含まれていたので,これをURLとして新しいタブで開きましょう
      var url = arrUrl[i];
      url = additionalFixUpURL(url);
      if (SELECTUTL)
        var URLRange = getURLRange(selRange, url)

      // host名が ftp で始まるなら ftp://に
      if (/^ftp/.test(url)){
        url = "ftp://" + url;
      }
      // host名が irc で始まるなら irc:に
      if (/^irc/.test(url)){
        url = "irc://" + url;
      }
      //メール?
      if (mailRx1.test(url)) {
        url = "mailto:" + url;
      }
      //相対パスの処理
      if(url.match(/^\.{1,}/)){
        var baseURI = ioService.newURI(win.document.documentURI, null, null);
        url = ioService.newURI(url, null, baseURI).spec;
      }
//debug(url.indexOf(url.match(urlRegex)));
      if (!mailRx.test(url) && url.indexOf(url.match(urlRegex)) > 1) return;
      var URIFixup = Components.classes['@mozilla.org/docshell/urifixup;1']
                     .getService(Components.interfaces.nsIURIFixup);
      try{
//debug(url);
        var uri = URIFixup.createFixupURI(
            url,
            URIFixup.FIXUP_FLAG_NONE ); //FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP→FIXUP_FLAG_NONE
      }catch(e){return;}
      if(!uri) return;

      if (!isValidTld(uri)) {
        return;
      }
//debug('Parsing ucjs_textlink: ' + url);
      if (SELECTUTL)
        selectRange(URLRange);

      uri = ioService.newURI(uri.spec, null, null);
//debug('Parsing ucjs_textlink: '+((new Date()).getTime()-Start) +'msec\n'+uri.spec);
      textlink(event, doc, uri);
      return;
    }
  }

  function additionalFixUpURL(url) {
    // ad hoc fix up
    // ~等 を半角に
    url = url.replace(/\u301c/g,'\uff5e');
    url = url.replace(/\uffe3/g,'\uff5e');

    // 末尾の )や] の調整
    if (/^[:\uff1a;\uff1b,\uff0c]/.test(url)) {
      url = url.replace(/^[:\uff1a;\uff1b,\uff0c]/,'');
    }
    if (/[:\uff1a]$/.test(url)) {
      url = url.replace(/[:\uff1a]$/,'');
    }
    if (/[.,]$/.test(url)) {
      url = url.replace(/[.,]$/,'');
    }

    if (/\)$/.test(url)) {
      if (url.indexOf("(") == -1)
        url = url.replace(/\)$/,'');
    }
    /*
    if (/\]$/.test(url)) {
      if (url.indexOf("[") == -1)
        url = url.replace(/\]$/,'');
    }
    */
    return url;
  }

  function activeBrowser() {
    return ('SplitBrowser' in window ? SplitBrowser.activeBrowser : null )
            ||  gBrowser;
  }

  function _getFocusedWindow(){ //現在のウインドウを得る
    var focusedWindow = document.commandDispatcher.focusedWindow;
    if (!focusedWindow || focusedWindow == window)
        return window._content;
    else
        return focusedWindow;
  }

//レンジの要素が所属する親ブロック要素を得る
  function oyaNode(aNode){
    var pNode = aNode.parentNode;
    while(pNode && /^(a|abbr|acronym|b|bdo|big|body|code|dfn|em|font|i|kbd|label|pre|q|samp|small|span|strong|sub|sup|tt|var|wbr)$/i.test(pNode.localName) ){
      pNode = pNode.parentNode;
    }
    return pNode;
  }

  function isParentEditableNode(node){
    //if (node.ownerDocument.designMode == 'on')
    //  return node;
    while (node && node.parentNode) {
      try {
        if (!(node instanceof Ci.nsIDOMNSEditableElement))
          throw 0;
        node.QueryInterface(Ci.nsIDOMNSEditableElement);
        return node;
      }
      catch(e) {
      }
      if (/input|textarea/.test(node.localName))
        return node;
      if (node.isContentEditable || node.contentEditable=='true')
        return node;
      node = node.parentNode;
    }
    return null;
  }

  function isValidTld(aURI){
    const regexpTLD = new RegExp("\\.(arpa|asia|int|nato|cat|com|net|org|info|biz|name|pro|mobi|museum|coop|aero|edu|gov|jobs|mil|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bu|bv|bw|by|bz|ca|canon|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cp|cr|cs|sk|cu|cv|cx|cy|cz|dd|de|dg|dj|dk|dm|do|dz|ea|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|fx|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|ic|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|me|md|mg|mh|mk|ml|mm|mn|mo|moe|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nagoya|nc|ne|nf|ng|ni|nl|no|np|nr|nt|nu|nz|om|osaka|pa|pc|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sy|sz|ta|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tokyo|toyota|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|wg|ws|yd|ye|yokohama|yt|yu|za|zm|zr|zw|localhost)\\.?$","");
    const regexpIP = new RegExp("^[1-2]?[0-9]?[0-9]\\.[1-2]?[0-9]?[0-9]\\.[1-2]?[0-9]?[0-9]\\.[1-2]?[0-9]?[0-9]$","");
    const idnService = Components.classes["@mozilla.org/network/idn-service;1"]
                             .getService(Components.interfaces.nsIIDNService);
    var host, tlds;
    try {
      host = aURI.host.split('/')[0];
      host = idnService.convertUTF8toACE(host);
    } catch(e) {
      if (aURI.spec.match(/^(.+?\/\/(?:[^\/]+@)?)([^\/]+)(:\d+)?(?:.*)$/)) {
        host = RegExp.$2;
      } else if (aURI.spec.match(/^(mailto:(?:[^\/]+@)?)([^\/]+)(:\d+)?(?:.*)$/)){
        host = RegExp.$2;
      }
    }
//debug("host  " + host);
    if (!host)
      return false;
    if (getVer() < 3.0){
      if (regexpTLD.test(host))
        return true;
      else
        return (regexpIP.test(host));
    } else {
      var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"]
                    .getService(Components.interfaces.nsIEffectiveTLDService);
      try {
        var tld = eTLDService.getPublicSuffixFromHost(host);
        return regexpTLD.test('.'+tld);
      } catch(e) {
        return (regexpIP.test(host));
      }
    }
  }

  function textlink(event, doc, uri) {
    if ("autoCopy" in window) {
      autoCopy.forceDisable = true;
      setTimeout(function(){ autoCopy.forceDisable = false;}, 1500);
    }
    try{
      if(event.shiftKey)
        saveAsURL(uri, doc);
      else
        openNewTab(uri, doc);
    }catch(e){}
    closeContextMenu();
  }

  function saveAsURL(uri, doc){
    var linkText = uri.spec;
    var aReferrer = doc;
    if (aReferrer instanceof HTMLDocument) {
      aReferrer = aReferrer.documentURIObject;
    }
    //Thunderbird
    if (/^chrome:\/\/messenger\/content\//.test(window.location.href)) {
      // URL Loading Security Check
      const nsIScriptSecurityManager = Components.interfaces.nsIScriptSecurityManager;
      var secMan = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
                             .getService(nsIScriptSecurityManager);
      try {
        if (uri instanceof Components.interfaces.nsIURI)
         secMan.checkLoadURIWithPrincipal(doc.nodePrincipal, uri, nsIScriptSecurityManager.STANDARD);
        else
         secMan.checkLoadURIStrWithPrincipal(doc.nodePrincipal, uri, nsIScriptSecurityManager.STANDARD);
      } catch (e) {
        throw "Load denied.";
      }
      saveURL( uri.spec, linkText, null, true, false ,aReferrer , doc);
      return;
    }

    // urlSecurityCheck wanted a URL-as-string for Fx 2.0, but an nsIPrincipal on trunk
    if(activeBrowser().contentPrincipal)
      urlSecurityCheck(uri.spec, activeBrowser().contentPrincipal,Ci.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);
    else
      urlSecurityCheck(uri.spec, activeBrowser().currentURI.spec,Ci.nsIScriptSecurityManager.DISALLOW_SCRIPT);

    saveURL( uri.spec, linkText, null, true, false, aReferrer , doc );
  }

  function openNewTab(uri, doc){
    //Thunderbird
    if (/^chrome:\/\/messenger\/content\//.test(window.location.href)) {
      // Make sure we are allowed to open this URL
      // URL Loading Security Check
      const nsIScriptSecurityManager = Components.interfaces.nsIScriptSecurityManager;
      var secMan = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
                             .getService(nsIScriptSecurityManager);
      try {
        if (uri instanceof Components.interfaces.nsIURI)
         secMan.checkLoadURIWithPrincipal(doc.nodePrincipal, uri, nsIScriptSecurityManager.STANDARD);
        else
         secMan.checkLoadURIStrWithPrincipal(doc.nodePrincipal, uri, nsIScriptSecurityManager.STANDARD);
      } catch (e) {
        throw "Load denied.";
      }
      var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                        .getService(Components.interfaces.nsIExternalProtocolService);
      protocolSvc.loadUrl(uri);
      return;
    }

    // urlSecurityCheck wanted a URL-as-string for Fx 2.0, but an nsIPrincipal on trunk
    if(activeBrowser().contentPrincipal)
      urlSecurityCheck(uri.spec, activeBrowser().contentPrincipal,Ci.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);
    else
      urlSecurityCheck(uri.spec, activeBrowser().currentURI.spec,Ci.nsIScriptSecurityManager.DISALLOW_SCRIPT);
    if( (event.ctrlKey) ){
      openLinkIn(uri.spec, "current", {});
    }else{
      if ('TreeStyleTabService' in window)
        TreeStyleTabService.readyToOpenChildTab(activeBrowser().selectedTab);
      openLinkIn(uri.spec, "tab", {relatedToCurrent:true});
      //openNewTabWith(uri.spec, null,  null, null, false)
    }
  }

  function closeContextMenu() {
    var popup = document.getElementById("contentAreaContextMenu");
    if (popup)
      popup.hidePopup();
  }

  function getURLRange(selRange, url) {
    //レンジのノードなど
    var doc = selRange.startContainer.ownerDocument
    var bodyNode = getDocumentBody(doc);
    if(!bodyNode)return;

    //nsIFindげと
    var mFind = Components.classes["@mozilla.org/embedcomp/rangefind;1"]
                .createInstance(Components.interfaces.nsIFind);

    //Rangeげと
    var theRange = doc.createRange();
    var start = doc.createRange();
    var end = doc.createRange();

    try{
      var count = bodyNode.childNodes.length;
    }catch(e){
      var count = 0;
    }
    theRange.setStart(bodyNode, 0);
    theRange.setEnd(bodyNode, count);

    start.setStart(bodyNode, 0);
    start.setEnd(bodyNode, 0);
    end.setStart(bodyNode, count);
    end.setEnd(bodyNode, count);

    var selRangeBox = selRange.getBoundingClientRect();
    mFind.caseSensitive = false;
    while ((foundRange = mFind.Find(url, theRange, start, end))) {
      //検索range更新
      start = doc.createRange();
      start.setStart(foundRange.endContainer, foundRange.endOffset);
      start.collapse(true);

 //debug("loop 1");
      // selRange 始点が foundRange の始点よりも前
      if (selRange.compareBoundaryPoints(Range.START_TO_START, foundRange) == -1) 
        continue;
      // selRangeの終点がfoundRangeの終点より後ろにある場合
      //if (foundRange.compareBoundaryPoints(Range.END_TO_END, selRange) == -1)
      // xxx selRangeの次がbrの時endContainerが先祖の要素になるので...
      var foundRangeBox = foundRange.getBoundingClientRect();
      if (selRangeBox.right > foundRangeBox.right ||
          selRangeBox.top < foundRangeBox.top ||
          selRangeBox.bottom > foundRangeBox.bottom)
        continue;
      return foundRange;
    }
    return null;
  }

  function getDocumentBody(aDocument) {
    if (aDocument instanceof Components.interfaces.nsIDOMHTMLDocument)
      return aDocument.body;

    try {
      var xpathResult = aDocument.evaluate(
          'descendant::*[contains(" BODY body ", concat(" ", local-name(), " "))]',
          aDocument,
          null,
          Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
      return xpathResult.singleNodeValue;
    }
    catch(e) {
    }
    return null;
  }

  function selectRange(aRange) {
    if (!aRange)
      return;

    var doc = aRange.startContainer.ownerDocument;
    var elm = findParentEditable(aRange);

    var selCon = getSelectionController(elm);
    if(!selCon) selCon = getSelconForDoc(doc);
    var selection = selCon.getSelection(selCon.SELECTION_NORMAL);
    selection.removeAllRanges();  //既存の選択領域を取得し、全て破棄
    selection.addRange(aRange);
  }

  //レンジは編集可能ノードにある?
  function findParentEditable(aRange) {
    var node = aRange.commonAncestorContainer.parentNode;
    while (node && node.parentNode){
      try {
        if (!(node instanceof Components.interfaces.nsIDOMNSEditableElement))
          throw 0;
        node.QueryInterface(Components.interfaces.nsIDOMNSEditableElement);
        return node;
      }
      catch(e){}
      node = node.parentNode;
    }
    return null;
  }

  function getSelectionController(aTarget) {
    if (!aTarget) return null;

    const nsIDOMNSEditableElement = Components.interfaces.nsIDOMNSEditableElement;
    const nsIDOMWindow = Components.interfaces.nsIDOMWindow;
    try {
      return (aTarget instanceof nsIDOMNSEditableElement) ?
            aTarget.QueryInterface(nsIDOMNSEditableElement).editor.selectionController :
          (aTarget instanceof nsIDOMWindow) ?
            DocShellIterator.prototype.getDocShellFromFrame(aTarget)
              .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
              .getInterface(Components.interfaces.nsISelectionDisplay)
              .QueryInterface(Components.interfaces.nsISelectionController) :
          null;
    }
    catch(e) {
    }
    return null;
  }

  function getSelconForDoc(doc) {
    var docShell = getDocShellForFrame(doc.defaultView);
    var selCon = docShell
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsISelectionDisplay)
      .QueryInterface(Components.interfaces.nsISelectionController);
    return selCon;
  }

  function getDocShellForFrame(aFrame) {
    return aFrame
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIWebNavigation)
      .QueryInterface(Components.interfaces.nsIDocShell);
  }

  function getVer(){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    // このコードを実行しているアプリケーションの名前を取得する
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  }

  function getPref(aPrefString, aPrefType, aDefault){
    var xpPref = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefBranch2);
    try{
      switch (aPrefType){
        case "str":
          return xpPref.getCharPref(aPrefString).toString(); break;
        case "int":
          return xpPref.getIntPref(aPrefString); break;
        case "bool":
        default:
          return xpPref.getBoolPref(aPrefString); break;
      }
    }catch(e){
    }
    return aDefault;
  }

  function debug(aMsg){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    Cc["@mozilla.org/consoleservice;1"]
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aMsg);
  }
}
var textLinkForSidebar = {
  init: function(event){
    try{
      var doc = event.originalTarget;
      if (!doc.location) return;
      if(doc.location.href == "chrome://browser/content/web-panels.xul"){
        doc.addEventListener('dblclick',function(event){setTimeout(ucjs_textlink,100,event);},false);
        doc.addEventListener('keypress',function(event){ucjs_textlink(event);},false);
      }
    }catch(e){}
  },
  uninit: function(event){
    try{
      var doc = event.originalTarget;
      if (!doc.location) return;
      if(doc.location.href == "chrome://browser/content/web-panels.xul"){
        doc.removeEventListener('dblclick',function(event){setTimeout(ucjs_textlink,100,event);},false);
        doc.removeEventListener('keypress',function(event){ucjs_textlink(event);},false);

      }
    }catch(e){}
  }
}
//for contents area
if (/^chrome:\/\/messenger\/content\//.test(window.location.href)) {
  var target = document.getElementById("messagepane");
} else {
  var target = document.getElementById("appcontent");
}
target.addEventListener('dblclick',function(event){setTimeout(ucjs_textlink,100,event);},false);
target.addEventListener('keypress',function(event){ucjs_textlink(event);},false);
//for already loaded chrome://browser/content/web-panels.xul
if (!/^chrome:\/\/messenger\/content\//.test(window.location.href)) {
  setTimeout(function(){
    try{
      var doc = document.getElementById('sidebar').contentDocument;
      if(doc && doc.location && doc.location.href == "chrome://browser/content/web-panels.xul")
        doc.addEventListener('dblclick',function(event){setTimeout(ucjs_textlink,100,event);},false);
        doc.addEventListener('keypress',function(event){ucjs_textlink(event);},false);
    }catch(e){}
  },1000);
}
//for sidebar document onload event Listener
window.document.addEventListener('load', textLinkForSidebar.init, true);
window.document.addEventListener('unload', textLinkForSidebar.uninit, true);
