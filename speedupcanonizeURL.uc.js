// ==UserScript==
// @name           speedupcanonizeURL.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    speed up Single-word location bar searches
// @author         Alice0775
// @include        main
// @compatibility  10-
// @version        2012/04/18 21:15 。
// @version        2012/03/08 21:15 error xxx.xxx.xxx
// @version        2012/03/08 20:50 error in about: ftp etc
// @version        2012/03/08
// ==/UserScript==
var func = window.gURLBar._canonizeURL.toString();
func = func.replace(
  'url = getShortcutOrURI(url, postData, mayInheritPrincipal);',
<><![CDATA[
  var linkURI = url;
  try {
    if (!/^[a-zA-Z-+.]+:/.test(linkURI)) {
      linkURI = "http://" + linkURI;
    }
    linkURI = makeURI(linkURI);
    if (!this.isValidTld(linkURI)) {
      if (!/^[a-zA-Z-+.]+:/.test(url))
        throw new Error();
    }
  } catch(ex) {
    var offset = url.indexOf(" ");
    if (offset < 0 && gPrefService.getBoolPref("keyword.enabled")) {
      var URIFixup = Components.classes['@mozilla.org/docshell/urifixup;1']
                     .getService(Components.interfaces.nsIURIFixup);
      url = URIFixup.createFixupURI(
                          "?"+url,
                          URIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP ).spec;

/*
      // I'm Feeling Lucky
      if (/\.google\..+[^/]/.test(url))
        url = url + "&btnI=1";
*/
    }
  }
  $&
]]></>
);
eval("window.gURLBar._canonizeURL = "+ func);

window.gURLBar.isValidTld = function isValidTld(aURI){
  const regexpTLD = new RegExp("\\.(arpa|asia|int|nato|cat|com|net|org|info|biz|name|pro|mobi|museum|coop|aero|edu|gov|jobs|mil|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bu|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cp|cr|cs|sk|cu|cv|cx|cy|cz|dd|de|dg|dj|dk|dm|do|dz|ea|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|fx|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|ic|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|me|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nt|nu|nz|om|pa|pc|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sy|sz|ta|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|wg|ws|yd|ye|yt|yu|za|zm|zr|zw|localhost)\\.?$","");
  const regexpIP = new RegExp("^[1-2]?[0-9]?[0-9]\\.[1-2]?[0-9]?[0-9]\\.[1-2]?[0-9]?[0-9]\\.[1-2]?[0-9]?[0-9]$","");
  var host, tlds;
  try {
    host = aURI.host.split('/')[0];
  } catch(e) {
    if (aURI.spec.match(/^(.+?\/\/(?:[^\/]+@)?)([^\/]+)(:\d+)?(?:.*)$/)) {
      host = RegExp.$2;
    } else if (aURI.spec.match(/^(mailto:(?:[^\/]+@)?)([^\/]+)(:\d+)?(?:.*)$/)){
      host = RegExp.$2;
    }
  }

  if (!host)
    return false;

  var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"]
                .getService(Components.interfaces.nsIEffectiveTLDService);
  try {
    var tld = eTLDService.getPublicSuffixFromHost(host);
    return regexpTLD.test('.'+tld);
  } catch(e) {
    return (regexpIP.test(host));
  }
};



