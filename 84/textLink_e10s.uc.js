// ==UserScript==
// @name           textLink.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TextLinkもどき
// @include        main
// @include        chrome://browser/content/web-panels.xul
// @include        chrome://messenger/content/messenger.xul
// @include        chrome://messenger/content/messageWindow.xul
// @compatibility  Firefox 84
// @author         Alice0775
// @note           Left DblClick         : open link on new tab
// @note           shift + Left DblClick : open current on new tab but focus oppsite
// @note           ctrl + Left DblClick  : open current tab
// @note           alt + Left DblClick   : save as link
// @version        2021/03/25 23:00 fix textlink failing on specific case #62. thanks, pintassilgo
// @version        2020/12/19 00:00 Bug 1641270 - Saving already-loaded images from a webpage yields "not an image".
// @version        2020/10/14 00:00 Bug 1626016 - Move postData inside URIFixupInfo
// @version        2020/10/05 01:00 new tld
// @version        2020/10/05 00:00 fix zenkaku
// @version        2020/05/22 00:00 Bug 1496578 - convert  nsDefaultURIFixup to js and rename it to make it clear it's the only one
// @version        2018/09/22 00:00 62+
// @version        2017/11/19 00:00 experiments e10s more releable
// @version        2017/11/18 07:00 experiments e10s
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

function ucjs_textlink(event) {
  if(event.button != 0 && event.keyCode != 13) return;

  ChromeUtils.defineModuleGetter(this, "E10SUtils",
                                 "resource://gre/modules/E10SUtils.jsm");
  var Start = new Date().getTime();

  const RELATIVE = true; //相対urlを解決するかどうか
  const ioService = Components.classes['@mozilla.org/network/io-service;1']
                      .getService(Components.interfaces.nsIIOService);
/*
/(([\w-]+:\/\/?|[\w\d]+[.])?[^\s()<>]+[.](?:\([\w\d]+\)|([^`!()\[\]{};:'\".,<>?«»“”‘’\s]|\/)+))/
*/
  const urlRegex = /(((h?t)?tps?|h..ps?|ftp|((\uff48)?\uff54)?\uff54\uff50(\uff53)?|\uff48..\uff50(\uff53)?|\uff46\uff54\uff50)(:\/\/|\uff1a\/\/|:\uff0f\uff0f|\uff1a\uff0f\uff0f)[-_.~*'()|a-zA-Z0-9;:\/?,@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff08\uff09\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff1a\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]*[-_,.~*)\[\]|a-zA-Z0-9;!:\/?@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]+)/ig;
/*
  const urlRegex1 = /([-_.~*'()|a-zA-Z0-9;:\/?,@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff08\uff09\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c\uff3b\uff3d]*[.\uff0e]+[-_.~*'\[\]|a-zA-Z0-9;:\/?,@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff08\uff09\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff1a\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c]+[.\uff0e/\uff0f]*[-_,.~*\[\]|a-zA-Z0-9;!:\/?@&=+$%#\uff0d\uff3f\u301c\uffe3\uff0e\uff01\uff5e\uff0a\u2019\uff5c\uff41-\uff5a\uff21-\uff3a\uff10-\uff19\uff1b\uff1a\uff0f\uff1f\uff1a\uff20\uff06\uff1d\uff0b\uff04\uff0c\uff05\uff03\uff5c]+)/ig;
*/
  const urlRegex1 = /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#](?:(?![\)\'\"\]]?(?:$|\s)).)*)?/ig;
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
  var node = isParentEditableNode(event.originalTarget);
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

    var sNode = selRange.startContainer;
    var soffset = selRange.startOffset;
    var eNode = selRange.endContainer;
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

  //親ブロック要素の文字列をすべて得る
    const allowedParents = [
        "a", "abbr", "acronym", "address", "applet", "b", "bdo", "big", "blockquote", "body",
        "caption", "center", "cite", "code", "dd", "del", "dir", "div", "dfn", "dl", "dt", "em",
        "fieldset", "font", "form", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe",
        "ins", "kdb", "li", "menu", "noframes", "noscript", "object", "ol", "p", "pre", "q", "samp", "small", "span", "strike",
        "s", "strong", "sub", "sup", "table", "td", "th", "thead", "tt", "u", "var"
        ];
    var xpath = ".//text()[(parent::" + allowedParents.join(" or parent::") + ")]";

    var candidates = doc.evaluate(xpath, root, null, 6 /*XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE */, null);

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
            break;
          }
          if (/^a$/i.test(candidates.snapshotItem(i).parentNode.localName) &&
              candidates.snapshotItem(i).parentNode.hasAttribute("href") )
            break;
          str1 = candidates.snapshotItem(i).nodeValue + str1;

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


//すべての文字列の中でURLと思しき文字列を配列として得る
  var i1, i2;
  var arrUrl = allStr.match(urlRegex);
  if (arrUrl) {
//見つかったURLと思しき文字列の中にレンジが含まれているかどうか
    i2 = 0;
    for (var i = 0, len = arrUrl.length; i < len; i++){
      i1 = allStr.indexOf(arrUrl[i],i2);
      i2 = i1 + arrUrl[i].length;
      if(i1 <= si && ei <= i2){
        //このURLと思しき文字列の中にレンジが含まれていたので,これをURLとして新しいタブで開きましょう
        var url = arrUrl[i];
        url = additionalFixUpURL(url);

        // ttp等を http等に および  :// を 半角に
        url = /^(ftp|\uff46\uff54\uff50)/i.test(url)
                    ? url.replace(urlRx1,'://')
                    : url.replace(urlRx,'http').replace(urlRx1,'://');
        var URIFixup = Services.uriFixup; /* Components.classes['@mozilla.org/docshell/urifixup;1']
                       .getService(Components.interfaces.nsIURIFixup);*/
        var uri = URIFixup.getFixupURIInfo(
                  url,
                  URIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP )?.fixedURI;
        if(!uri) return;
        if (!isValidTld(uri))
          return;
        uri = ioService.newURI(uri.spec, null, null);
        textlink(event, uri);
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
    i1 = allStr.indexOf(arrUrl[i],i2);
    i2 = i1 + arrUrl[i].length;

    if (i1 <= si && ei <= i2){
      // .hoge とか ..huga はスキップ
      if (/^\./.test(arrUrl[i]) && !/^[\.]+[/]/.test(arrUrl[i]))
        return;

      //このURLと思しき文字列の中にレンジが含まれていたので,これをURLとして新しいタブで開きましょう
      var url = arrUrl[i];
      url = additionalFixUpURL(url);

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

      if (!mailRx.test(url) && url.indexOf(url.match(urlRegex)) > 1) return;
      var URIFixup = Services.uriFixup; /*Components.classes['@mozilla.org/docshell/urifixup;1']
                     .getService(Components.interfaces.nsIURIFixup);*/
      try{
        var uri = URIFixup.getFixupURIInfo(
            url,
            URIFixup.FIXUP_FLAG_NONE )?.fixedURI; //FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP→FIXUP_FLAG_NONE
      }catch(e){return;}
      if(!uri) return;

      if (!isValidTld(uri)) {
        return;
      }
      uri = ioService.newURI(uri.spec, null, null);
      textlink(event, uri);
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
    return url.replace(/[\uff01-\uff5e]/g,
      function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      }
    );
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
    const regexpTLD = new RegExp("\\.(aaa|aarp|abarth|abb|abbott|abbvie|abc|able|abogado|abudhabi|ac|academy|accenture|accountant|accountants|aco|active|actor|ad|adac|ads|adult|ae|aeg|aero|aetna|af|afamilycompany|afl|africa|ag|agakhan|agency|ai|aig|aigo|airbus|airforce|airtel|akdn|al|alfaromeo|alibaba|alipay|allfinanz|allstate|ally|alsace|alstom|am|amazon|americanexpress|americanfamily|amex|amfam|amica|amsterdam|analytics|android|anquan|anz|ao|aol|apartments|app|apple|aq|aquarelle|ar|arab|aramco|archi|army|arpa|art|arte|as|asda|asia|associates|at|athleta|attorney|au|auction|audi|audible|audio|auspost|author|auto|autos|avianca|aw|aws|ax|axa|az|azure|ba|baby|baidu|banamex|bananarepublic|band|bank|bar|barcelona|barclaycard|barclays|barefoot|bargains|baseball|basketball|bauhaus|bayern|bb|bbc|bbt|bbva|bcg|bcn|bd|be|beats|beauty|beer|bentley|berlin|best|bestbuy|bet|bf|bg|bh|bharti|bi|bible|bid|bike|bing|bingo|bio|biz|bj|black|blackfriday|blanco|blockbuster|blog|bloomberg|blue|bm|bms|bmw|bn|bnl|bnpparibas|bo|boats|boehringer|bofa|bom|bond|boo|book|booking|boots|bosch|bostik|boston|bot|boutique|box|br|bradesco|bridgestone|broadway|broker|brother|brussels|bs|bt|budapest|bugatti|build|builders|business|buy|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|call|calvinklein|cam|camera|camp|cancerresearch|canon|capetown|capital|capitalone|car|caravan|cards|care|career|careers|cars|cartier|casa|case|caseih|cash|casino|cat|catering|catholic|cba|cbn|cbre|cbs|cc|cd|ceb|center|ceo|cern|cf|cfa|cfd|cg|ch|chanel|channel|charity|chase|chat|cheap|chintai|chloe|christmas|chrome|chrysler|church|ci|cipriani|circle|cisco|citadel|citi|citic|city|cityeats|ck|cl|claims|cleaning|click|clinic|clinique|clothing|cloud|club|clubmed|cm|cn|co|coach|codes|coffee|college|cologne|com|comcast|commbank|community|company|compare|computer|comsec|condos|construction|consulting|contact|contractors|cooking|cookingchannel|cool|coop|corsica|country|coupon|coupons|courses|cpa|cr|credit|creditcard|creditunion|cricket|crown|crs|cruise|cruises|csc|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|data|date|dating|datsun|day|dclk|dds|de|deal|dealer|deals|degree|delivery|dell|deloitte|delta|democrat|dental|dentist|desi|design|dev|dhl|diamonds|diet|digital|direct|directory|discount|discover|dish|diy|dj|dk|dm|dnp|do|docs|doctor|dodge|dog|doha|domains|dot|download|drive|dtv|dubai|duck|dunlop|duns|dupont|durban|dvag|dvr|dz|earth|eat|ec|eco|edeka|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|epost|epson|equipment|er|ericsson|erni|es|esq|estate|esurance|et|etisalat|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|extraspace|fage|fail|fairwinds|faith|family|fan|fans|farm|farmers|fashion|fast|fedex|feedback|ferrari|ferrero|fi|fiat|fidelity|fido|film|final|finance|financial|fire|firestone|firmdale|fish|fishing|fit|fitness|fj|fk|flickr|flights|flir|florist|flowers|fly|fm|fo|foo|food|foodnetwork|football|ford|forex|forsale|forum|foundation|fox|fr|free|fresenius|frl|frogans|frontdoor|frontier|ftr|fujitsu|fujixerox|fun|fund|furniture|futbol|fyi|ga|gal|gallery|gallo|gallup|game|games|gap|garden|gay|gb|gbiz|gd|gdn|ge|gea|gent|genting|george|gf|gg|ggee|gh|gi|gift|gifts|gives|giving|gl|glade|glass|gle|global|globo|gm|gmail|gmbh|gmo|gmx|gn|godaddy|gold|goldpoint|golf|goo|goodhands|goodyear|goog|google|gop|got|gov|gp|gq|gr|grainger|graphics|gratis|green|gripe|grocery|group|gs|gt|gu|guardian|gucci|guge|guide|guitars|guru|gw|gy|hair|hamburg|hangout|haus|hbo|hdfc|hdfcbank|health|healthcare|help|helsinki|here|hermes|hgtv|hiphop|hisamitsu|hitachi|hiv|hk|hkt|hm|hn|hockey|holdings|holiday|homedepot|homegoods|homes|homesense|honda|honeywell|horse|hospital|host|hosting|hot|hoteles|hotels|hotmail|house|how|hr|hsbc|ht|htc|hu|hughes|hyatt|hyundai|ibm|icbc|ice|icu|id|ie|ieee|ifm|ikano|il|im|imamat|imdb|immo|immobilien|in|inc|industries|infiniti|info|ing|ink|institute|insurance|insure|int|intel|international|intuit|investments|io|ipiranga|iq|ir|irish|is|iselect|ismaili|ist|istanbul|it|itau|itv|iveco|iwc|jaguar|java|jcb|jcp|je|jeep|jetzt|jewelry|jio|jlc|jll|jm|jmp|jnj|jo|jobs|joburg|jot|joy|jp|jpmorgan|jprs|juegos|juniper|kaufen|kddi|ke|kerryhotels|kerrylogistics|kerryproperties|kfh|kg|kh|ki|kia|kim|kinder|kindle|kitchen|kiwi|km|kn|koeln|komatsu|kosher|kp|kpmg|kpn|kr|krd|kred|kuokgroup|kw|ky|kyoto|kz|la|lacaixa|ladbrokes|lamborghini|lamer|lancaster|lancia|lancome|land|landrover|lanxess|lasalle|lat|latino|latrobe|law|lawyer|lb|lc|lds|lease|leclerc|lefrak|legal|lego|lexus|lgbt|li|liaison|lidl|life|lifeinsurance|lifestyle|lighting|like|lilly|limited|limo|lincoln|linde|link|lipsy|live|living|lixil|lk|llc|llp|loan|loans|locker|locus|loft|lol|london|lotte|lotto|love|lpl|lplfinancial|lr|ls|lt|ltd|ltda|lu|lundbeck|lupin|luxe|luxury|lv|ly|ma|macys|madrid|maif|maison|makeup|man|management|mango|map|market|marketing|markets|marriott|marshalls|maserati|mattel|mba|mc|mckinsey|md|me|med|media|meet|melbourne|meme|memorial|men|menu|meo|merckmsd|metlife|mg|mh|miami|microsoft|mil|mini|mint|mit|mitsubishi|mk|ml|mlb|mls|mm|mma|mn|mo|mobi|mobile|mobily|moda|moe|moi|mom|monash|money|monster|mopar|mormon|mortgage|moscow|moto|motorcycles|mov|movie|movistar|mp|mq|mr|ms|msd|mt|mtn|mtr|mu|museum|mutual|mv|mw|mx|my|mz|na|nab|nadex|nagoya|name|nationwide|natura|navy|nba|nc|ne|nec|net|netbank|netflix|network|neustar|new|newholland|news|next|nextdirect|nexus|nf|nfl|ng|ngo|nhk|ni|nico|nike|nikon|ninja|nissan|nissay|nl|no|nokia|northwesternmutual|norton|now|nowruz|nowtv|np|nr|nra|nrw|ntt|nu|nyc|nz|obi|observer|off|office|okinawa|olayan|olayangroup|oldnavy|ollo|om|omega|one|ong|onion|onl|online|onyourside|ooo|open|oracle|orange|org|organic|origins|osaka|otsuka|ott|ovh|pa|page|panasonic|panerai|paris|pars|partners|parts|party|passagens|pay|pccw|pe|pet|pf|pfizer|pg|ph|pharmacy|phd|philips|phone|photo|photography|photos|physio|piaget|pics|pictet|pictures|pid|pin|ping|pink|pioneer|pizza|pk|pl|place|play|playstation|plumbing|plus|pm|pn|pnc|pohl|poker|politie|porn|post|pr|pramerica|praxi|press|prime|pro|prod|productions|prof|progressive|promo|properties|property|protection|pru|prudential|ps|pt|pub|pw|pwc|py|qa|qpon|quebec|quest|qvc|racing|radio|raid|re|read|realestate|realtor|realty|recipes|red|redstone|redumbrella|rehab|reise|reisen|reit|reliance|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rexroth|rich|richardli|ricoh|rightathome|ril|rio|rip|rmit|ro|rocher|rocks|rodeo|rogers|room|rs|rsvp|ru|rugby|ruhr|run|rw|rwe|ryukyu|sa|saarland|safe|safety|sakura|sale|salon|samsclub|samsung|sandvik|sandvikcoromant|sanofi|sap|sapo|sarl|sas|save|saxo|sb|sbi|sbs|sc|sca|scb|schaeffler|schmidt|scholarships|school|schule|schwarz|science|scjohnson|scor|scot|sd|se|search|seat|secure|security|seek|select|sener|services|ses|seven|sew|sex|sexy|sfr|sg|sh|shangrila|sharp|shaw|shell|shia|shiksha|shoes|shop|shopping|shouji|show|showtime|shriram|si|silk|sina|singles|site|sj|sk|ski|skin|sky|skype|sl|sling|sm|smart|smile|sn|sncf|so|soccer|social|softbank|software|sohu|solar|solutions|song|sony|soy|spa|space|spiegel|sport|spot|spreadbetting|sr|srl|srt|ss|st|stada|staples|star|starhub|statebank|statefarm|statoil|stc|stcgroup|stockholm|storage|store|stream|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swatch|swiftcover|swiss|sx|sy|sydney|symantec|systems|sz|tab|taipei|talk|taobao|target|tatamotors|tatar|tattoo|tax|taxi|tc|tci|td|tdk|team|tech|technology|tel|telecity|telefonica|temasek|tennis|teva|tf|tg|th|thd|theater|theatre|tiaa|tickets|tienda|tiffany|tips|tires|tirol|tj|tjmaxx|tjx|tk|tkmaxx|tl|tm|tmall|tn|to|today|tokyo|tools|top|toray|toshiba|total|tours|town|toyota|toys|tr|trade|trading|training|travel|travelchannel|travelers|travelersinsurance|trust|trv|tt|tube|tui|tunes|tushu|tv|tvs|tw|tz|ua|ubank|ubs|uconnect|ug|uk|unicom|university|uno|uol|ups|us|uy|uz|va|vacations|vana|vanguard|vc|ve|vegas|ventures|verisign|versicherung|vet|vg|vi|viajes|video|vig|viking|villas|vin|vip|virgin|visa|vision|vista|vistaprint|viva|vivo|vlaanderen|vn|vodka|volkswagen|volvo|vote|voting|voto|voyage|vu|vuelos|wales|walmart|walter|wang|wanggou|warman|watch|watches|weather|weatherchannel|webcam|weber|website|wed|wedding|weibo|weir|wf|whoswho|wien|wiki|williamhill|win|windows|wine|winners|wme|wolterskluwer|woodside|work|works|world|wow|ws|wtc|wtf|xbox|xerox|xfinity|xihuan|xin|xn--11b4c3d|xn--1ck2e1b|xn--1qqw23a|xn--2scrj9c|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--3hcrj9c|xn--3oq18vl8pn36a|xn--3pxu8k|xn--42c2d9a|xn--45br5cyl|xn--45brj9c|xn--45q11c|xn--4gbrim|xn--54b7fta0cc|xn--55qw42g|xn--55qx5d|xn--5su34j936bgsg|xn--5tzm5g|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80aqecdr1a|xn--80asehdb|xn--80aswg|xn--8y0a063a|xn--90a3ac|xn--90ae|xn--90ais|xn--9dbq2a|xn--9et52u|xn--9krt00a|xn--b4w605ferd|xn--bck1b9a5dre4c|xn--c1avg|xn--c2br7g|xn--cck2b3b|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--e1a4c|xn--eckvdtc9d|xn--efvy88h|xn--estv75g|xn--fct429k|xn--fhbei|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--fzys8d69uvgm|xn--g2xx48c|xn--gckr3f0f|xn--gecrj9c|xn--gk3at1e|xn--h2breg3eve|xn--h2brj9c|xn--h2brj9c8c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1aef|xn--j1amh|xn--j6w193g|xn--jlq61u9w7b|xn--jvr189m|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kpu716f|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a3ejt|xn--mgba3a4f16a|xn--mgba7c0bbn0a|xn--mgbaakc7dvf|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbai9azgqp6j|xn--mgbayh7gpa|xn--mgbb9fbpob|xn--mgbbh1a|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgbca7dzdo|xn--mgberp4a5d4ar|xn--mgbgu82a|xn--mgbi4ecexp|xn--mgbpl2fh|xn--mgbt3dhd|xn--mgbtx2b|xn--mgbx4cd0ab|xn--mix891f|xn--mk1bu44c|xn--mxtq1m|xn--ngbc5azd|xn--ngbe9e0a|xn--ngbrx|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--p1acf|xn--p1ai|xn--pbt977c|xn--pgbs0dh|xn--pssy2u|xn--q9jyb4c|xn--qcka1pmc|xn--qxam|xn--rhqv96g|xn--rovu88b|xn--rvc1e0am3e|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--tckwe|xn--tiq49xqyj|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--w4r85el8fhu5dnra|xn--w4rs40l|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b|xperia|xxx|xyz|yachts|yahoo|yamaxun|yandex|ye|yodobashi|yoga|yokohama|you|youtube|yt|yun|za|zappos|zara|zero|zip|zippo|zm|zone|zuerich|zw)\\.?$","");
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

    if (!host)
      return false;
    if (false){
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

  function textlink(event, uri) {
    let originalTarget = event.originalTarget;
    let ownerDoc = originalTarget.ownerDocument;
    if (!ownerDoc) {
      return;
    }
    let principal = ownerDoc.nodePrincipal;
    let json = { button: event.button, shiftKey: event.shiftKey,
                 ctrlKey: event.ctrlKey, metaKey: event.metaKey,
                 altKey: event.altKey, href: uri.spec, title: null,
                 uri: uri,
                 noReferrer: true,
                 cookieJarSettings: E10SUtils.serializeCookieJarSettings(
                                      ownerDoc.cookieJarSettings
                                    ),
                 originPrincipal: principal,
                 triggeringPrincipal: principal};
    
    sendAsyncMessage("textlink_openNewTab",
      json
    );
  }
}


function ucjs_textlink_main() {
  window.messageManager.loadFrameScript(
     'data:application/javascript,'
      + encodeURIComponent(ucjs_textlink.toSource())
      + encodeURIComponent('addEventListener("dblclick", ucjs_textlink, false);')
      + encodeURIComponent('addEventListener("keypress", ucjs_textlink, false);')
    , true);


  window.messageManager.addMessageListener("textlink_saveAsURL", messageListener);
  window.messageManager.addMessageListener("textlink_openNewTab", messageListener);


  function messageListener(message) {
    switch(message.name) {
    case "textlink_openNewTab":
      openNewTab(message.data);
      break;
    }
  }


  function openNewTab(json){
    let url = json.uri.spec;
    let referrer = json.noReferrer ? null : gBrowser.selectedTab.linkedBrowser.currentURI;
    let referrerInfo = new ReferrerInfo(Ci.nsIReferrerInfo.EMPTY, true, referrer);
    let param = {
                 noReferrer: json.noReferrer,
                 referrer: referrer,
                 referrerInfo: referrerInfo,
                 relatedToCurrent: true,
                 originPrincipal:Services.scriptSecurityManager.createNullPrincipal({}),// json.originPrincipal,
                 cookieJarSettings: json.cookieJarSettings,
                 triggeringPrincipal:Services.scriptSecurityManager.createNullPrincipal({}),// json.triggeringPrincipal,
                 isContentWindowPrivate: PrivateBrowsingUtils.isWindowPrivate(window)
                };
    // Services.console.logStringMessage(JSON.stringify(param));
    if (json.ctrlKey) {
      openLinkIn(url, "current", param);
    }else if (json.shiftKey) {
      openLinkIn(url, "tabshifted", param);
    }else if (json.altKey) {
      //saveURL(aURL, aFileName, aFilePickerTitleKey, aShouldBypassCache,
      //        aSkipPrompt, aReferrerInfo, aCookieJarSettings,
      //        aSourceDocument,
      //        aIsContentWindowPrivate,
      //        aPrincipal)
    saveURL(
        url,
        null,
        null,
        true,
        false,
        referrerInfo,
        null,
        null,
        PrivateBrowsingUtils.isWindowPrivate(window),
        Services.scriptSecurityManager.createNullPrincipal({})
      );
    }else{
      openLinkIn(url, "tab", param);
    }
  }

}
ucjs_textlink_main();

