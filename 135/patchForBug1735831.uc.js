// ==UserScript==
// @name          patchForBug1735831.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Workaround Bug 1735831 - "Save Page As" use .htm instead of .html
// @include       main
// @async          true
// @compatibility Firefox 102
// @author        alice0775
// @version       2021/10/16 00:00 
// ==/UserScript==

initFileInfo = function initFileInfo(
  aFI,
  aURL,
  aURLCharset,
  aDocument,
  aContentType,
  aContentDisposition
) {
  try {
    // Get an nsIURI object from aURL if possible:
    try {
      aFI.uri = makeURI(aURL, aURLCharset);
      // Assuming nsiUri is valid, calling QueryInterface(...) on it will
      // populate extra object fields (eg filename and file extension).
      var url = aFI.uri.QueryInterface(Ci.nsIURL);
      aFI.fileExt = url.fileExtension;
    } catch (e) {}

    // Get the default filename:
    aFI.fileName = getDefaultFileName(
      aFI.suggestedFileName || aFI.fileName,
      aFI.uri,
      aDocument,
      aContentDisposition
    );
    // If aFI.fileExt is still blank, consider: aFI.suggestedFileName is supplied
    // if saveURL(...) was the original caller (hence both aContentType and
    // aDocument are blank). If they were saving a link to a website then make
    // the extension .htm .
//Services.console.logStringMessage(aFI.fileExt+"\n"+aContentType+"\n"+aURL);
    if (
      !aFI.fileExt &&
      !aDocument &&
      !aContentType &&
      /^http(s?):\/\//i.test(aURL)
    ) {
      aFI.fileExt = "html";
      aFI.fileBaseName = aFI.fileName;
    } else {
      aFI.fileExt = getDefaultExtension(aFI.fileName, aFI.uri, aContentType);
//Services.console.logStringMessage(aFI.uri.fileExtension+" : "+aFI.fileExt);
      if (aFI.uri.fileExtension != "htm" && aFI.fileExt == "htm")
        aFI.fileExt = "html";
      aFI.fileBaseName = getFileBaseName(aFI.fileName);
    }
  } catch (e) {}
}
function getDefaultExtension(aFilename, aURI, aContentType) {
  if (
    aContentType == "text/plain" ||
    aContentType == "application/octet-stream" ||
    aURI.scheme == "ftp"
  ) {
    return "";
  } // temporary fix for bug 120327

  // First try the extension from the filename
  var url = Cc["@mozilla.org/network/standard-url-mutator;1"]
    .createInstance(Ci.nsIURIMutator)
    .setSpec("http://example.com") // construct the URL
    .setFilePath(aFilename)
    .finalize()
    .QueryInterface(Ci.nsIURL);

  var ext = url.fileExtension;

  // This mirrors some code in nsExternalHelperAppService::DoContent
  // Use the filename first and then the URI if that fails

  // For images, rely solely on the mime type if known.
  // All the extension is going to do is lie to us.
  var lookupExt = ext;
  if (aContentType?.startsWith("image/")) {
    lookupExt = "";
  }
  var mimeInfo = getMIMEInfoForType(aContentType, lookupExt);

  if (ext && mimeInfo && mimeInfo.extensionExists(ext)) {
    return ext;
  }

  // Well, that failed.  Now try the extension from the URI
  var urlext;
  try {
    url = aURI.QueryInterface(Ci.nsIURL);
    urlext = url.fileExtension;
  } catch (e) {}

  if (urlext && mimeInfo && mimeInfo.extensionExists(urlext)) {
    return urlext;
  }

  // That failed as well. If we could lookup the MIME use the primary
  // extension for that type.
  try {
    if (mimeInfo) {
      return mimeInfo.primaryExtension;
    }
  } catch (e) {}

  // Fall back on the extensions in the filename and URI for lack
  // of anything better.
  return ext || urlext;
}