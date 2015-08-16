// ==UserScript==
// @name           patchForBug1180126_Save_As_Filename.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Fixed Bug180126 Content-Disposition: inline; filename= doesn't work with Save As
// @include        main
// @compatibility  Firefox 39 only
// @author         Alice0775
// @version        2015/07/03
// ==/UserScript==
(function() {
  // Firefox version is 39 or not
  if (Services.vc.compare(Services.appinfo.version, "39") != 0) {
    return;
  }

  var getDefaultFileName_bug = getDefaultFileName;
  getDefaultFileName = function (aDefaultFileName, aURI, aDocument,
                              aContentDisposition) {
    if (!aContentDisposition) {
      try {
        var imageCache = Components.classes["@mozilla.org/image/tools;1"]
                                   .getService(Components.interfaces.imgITools)
                                   .getImgCacheForDocument(aDocument);
        var props = imageCache.findEntryProperties(aURI);
        if (props) {
          var contentType = props.get("type", Components.interfaces.nsISupportsCString);
          if (/image/.test(contentType)) {
            var request = new XMLHttpRequest();
            request.open('GET', aURI.spec, false);  // `false` makes the request synchronous xxxx
            request.setRequestHeader('Range', "bytes=0-511"); // length xxxx
            request.send(null);

            if (request.status === 200) {
              aContentDisposition = request.getResponseHeader("content-disposition");
            }
          }
        }
      } catch (e) {
         // Failure to get type and content-disposition off the image is non-fatal
      }
    }
    return getDefaultFileName_bug(aDefaultFileName, aURI, aDocument,
                              aContentDisposition);
  }
})();