// ==UserScript==
// @name           patchForBug1532274MediaSizeOnPageinfo.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Media Size On Pageinfo(fix Bug 1532274 - Page Info Window shows size unknown for images that are not cached)
// @include        chrome://browser/content/pageinfo/pageInfo.xhtml
// @compatibility  Firefox 78
// @author         Alice0775
// @version        2021/01/27
// @Note
// ==/UserScript==
(function() {
  var func = makePreview.toString();
  func = func.replace(
    /\}\n\s*\},\n\s*\{ once: true \}/,
  `
  openCacheEntry(cacheKey, function(cacheEntry) {
    /* find out the file size*/
    if (cacheEntry) {
      let imageSize = cacheEntry.dataSize;
      var kbSize = Math.round((imageSize / 1024) * 100) / 100;
      document.l10n.setAttributes(
        document.getElementById("imagesizetext"),
        "properties-general-size",
        { kb: formatNumber(kbSize), bytes: formatNumber(imageSize) }
      );
    } else {
      document.l10n.setAttributes(
        document.getElementById("imagesizetext"),
        "media-unknown-not-cached"
      );
    }
  });$&
  `);
  makePreview = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );
})();