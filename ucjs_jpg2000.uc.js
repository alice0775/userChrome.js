// ==UserScript==
// @name           ucjs_jpg2000
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    imgタグに埋め込まれたJPEG2000(.jp2)を表示する
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        2007/04/05
// @Note
// ==/UserScript==
var ucjs_jpg2000 = function ucjs_jpg2000(event) {
  if (event.originalTarget instanceof HTMLDocument) {
    var doc = event.originalTarget;
    var xpath = "//img[contains(@src,'.jp2')]";
    var img = doc.evaluate(xpath, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for(var i=0,len=img.snapshotLength; i<len; i++) {
      var imgNode = img.snapshotItem(i);
      var src = imgNode.src;
      var alt = '';
      if(imgNode.hasAttribute('alt')) alt = imgNode.getAttribute('alt');
      try{
        if(imgNode.naturalWidth  != 0){ w = imgNode.naturalWidth;}
        if(imgNode.naturalHeight != 0){ h = imgNode.naturalHeight;}
      }catch(e){}
      try{
        if(imgNode.width) { w = imgNode.width;}
        if(imgNode.height){ h = imgNode.height;}
      }catch(e){}
      try{
        if(imgNode.style.width  != ""){ w = imgNode.style.width.match(/([0-9]+)/);}
        if(imgNode.style.height != ""){ h = imgNode.style.height.match(/([0-9]+)/);}
        dump(w);dump(h);
      }catch(e){}
      var obj = doc.createElement("object");
      if(!w) w=150;
      if(!h) h=150;
      obj.setAttribute("width", w);
      obj.setAttribute("height", h);
      obj.setAttribute("type", "image/jp2");
      obj.setAttribute("data", src);
      obj.setAttribute("alt", alt);

      imgNode.parentNode.insertBefore(obj, imgNode.nextSibling);
      imgNode.parentNode.removeChild(imgNode);
    }
  }
}
gBrowser.addEventListener('load', function(event) { ucjs_jpg2000(event); }, true);
