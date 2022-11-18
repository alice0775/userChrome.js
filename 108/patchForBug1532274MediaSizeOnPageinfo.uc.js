// ==UserScript==
// @name           patchForBug1532274MediaSizeOnPageinfo.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Media Size On Pageinfo(fix Bug 1532274 - Page Info Window shows size unknown for images that are not cached)
// @include        chrome://browser/content/pageinfo/pageInfo.xhtml
// @compatibility  Firefox 78
// @author         Alice0775
// @version        2021/01/29 Workaround for url data:image/*;base64,
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
    if (gImageView.data[row][COL_IMAGE_SIZE] != SIZE_UNKNOWN)
      return;
    let aRow = gImageView.data[row];
    if (cacheEntry) {
      let imageSize = cacheEntry.dataSize;
      var kbSize = Math.round((imageSize / 1024) * 100) / 100;
      document.l10n.setAttributes(
        document.getElementById("imagesizetext"),
        "properties-general-size",
        { kb: formatNumber(kbSize), bytes: formatNumber(imageSize) }
      );
      document.l10n
        .formatValue("media-file-size", { size: kbSize })
        .then(function(response) {
          aRow[2] = response;
          // Invalidate the row to trigger a repaint.
          gImageView.tree.invalidateRow(gImageView.data.indexOf(aRow));
        });
    } else {
      if (/^data:image.*;base64,/.test(cacheKey)) {
        var str = cacheKey.replace(/^data:image.*;base64,/, "");
        var imageSize = atob(str).length;
        var kbSize = Math.round((imageSize / 1024) * 100) / 100;
        document.l10n.setAttributes(
          document.getElementById("imagesizetext"),
          "properties-general-size",
          { kb: formatNumber(kbSize), bytes: formatNumber(imageSize) }
        );
        document.l10n
          .formatValue("media-file-size", { size: kbSize })
          .then(function(response) {
            aRow[2] = response;
            // Invalidate the row to trigger a repaint.
            gImageView.tree.invalidateRow(gImageView.data.indexOf(aRow));
          });
      }
    }
  });$&
  `);
  console.log(func.match(/\(([^)]*)/)[1]);
  console.log(func.replace(/[^{]*\{/, '').replace(/}\s*$/, ''));
  makePreview = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  );



gImageView.onPageMediaSort = async function(columnname) {
  var tree = document.getElementById(this.treeid);
  var treecol = tree.columns.getNamedColumn(columnname);

  var comparator;
  var index = treecol.index;
  if (index == COL_IMAGE_SIZE || index == COL_IMAGE_COUNT) {
    if (index == COL_IMAGE_SIZE)
      for (let row = 0; row < gImageView.data.length; row++) {
        await makePreview2(row);
      }
    comparator = function numComparator(a, b) {
      return  Number.parseFloat(a) - Number.parseFloat(b);
    };
  } else {
    comparator = function textComparator(a, b) {
      return (a || "").toLowerCase().localeCompare((b || "").toLowerCase());
    };
  }

  this.sortdir = gTreeUtils.sort(
    tree,
    this,
    this.data,
    index,
    comparator,
    this.sortcol,
    this.sortdir
  );

  for (let col of tree.columns) {
    col.element.removeAttribute("sortActive");
    col.element.removeAttribute("sortDirection");
  }
  treecol.element.setAttribute("sortActive", "true");
  treecol.element.setAttribute(
    "sortDirection",
    this.sortdir ? "ascending" : "descending"
  );

  this.sortcol = index;
};


async function makePreview2(row) {
  if (gImageView.data[row][COL_IMAGE_SIZE] != SIZE_UNKNOWN)
    return;

  var item = gImageView.data[row][COL_IMAGE_NODE];
  var url = gImageView.data[row][COL_IMAGE_ADDRESS];
  var isBG = gImageView.data[row][COL_IMAGE_BG];
  var isAudio = false;

  // get cache info
  var cacheKey = url.replace(/#.*$/, "");
  
    var mimeType = item.mimeType;
    var isProtocolAllowed = checkProtocol(gImageView.data[row]);
    var newImage = new Image();
    let triggeringPrinStr = E10SUtils.serializePrincipal(gDocInfo.principal);
    if (
      (item.HTMLLinkElement ||
        item.HTMLInputElement ||
        item.HTMLImageElement ||
        item.SVGImageElement ||
        (item.HTMLObjectElement && mimeType && mimeType.startsWith("image/")) ||
        isBG) &&
      isProtocolAllowed
    ) {
      function loadOrErrorListener2() {
        newImage.removeEventListener("load", loadOrErrorListener2);
        newImage.removeEventListener("error", loadOrErrorListener2);
        
        openCacheEntry(cacheKey, function(cacheEntry) {
          /* find out the file size*/
          if (gImageView.data[row][COL_IMAGE_SIZE] != SIZE_UNKNOWN)
            return;
          let aRow = gImageView.data[row];
          if (cacheEntry) {
            let imageSize = cacheEntry.dataSize;
            var kbSize = Math.round((imageSize / 1024) * 100) / 100;
            document.l10n
              .formatValue("media-file-size", { size: kbSize })
              .then(function(response) {
                aRow[2] = response;
                // Invalidate the row to trigger a repaint.
                gImageView.tree.invalidateRow(gImageView.data.indexOf(aRow));
              });
          } else {
            if (/^data:image.*;base64,/.test(cacheKey)) {
              var str = cacheKey.replace(/^data:image.*;base64,/, "");
              var imageSize = atob(str).length;
              var kbSize = Math.round((imageSize / 1024) * 100) / 100;
              document.l10n
                .formatValue("media-file-size", { size: kbSize })
                .then(function(response) {
                  aRow[2] = response;
                  // Invalidate the row to trigger a repaint.
                  gImageView.tree.invalidateRow(gImageView.data.indexOf(aRow));
                });
            }
          }
        });
        
      }

      // We need to wait for the image to finish loading before using width & height
      newImage.addEventListener("load", loadOrErrorListener2);
      newImage.addEventListener("error", loadOrErrorListener2);

      newImage.setAttribute("triggeringprincipal", triggeringPrinStr);
      newImage.setAttribute("src", url);
    }

  }

})();
