// ==UserScript==
// @name				Hide the bookmarks toolbar bookmarks and Unsorted
// @namespace	http://pc11.2ch.net/test/read.cgi/software/1213888990/
// @description	サイドバーのブックマークツールバーと未整理のブックマークを非表示
// @author			Alice0775
// @compatibility	Firefox 72+
// @date				2019.12/08 05:30
// @date				2018.08/30 22:30
// @date				2008.06/27 02:50
// @include			chrome://browser/content/places/bookmarksSidebar.xul
// ==/UserScript==
{
  let count = 3;
  let timer = setInterval(() => {
    // Services.console.logStringMessage("Hide the bookmarks toolbar bookmarks and Unsorted "+count);
    let = view = document.getElementById("bookmarks-view");
    if (view)
      view.place = "place:parent="+ PlacesUtils.bookmarks.menuGuid;
    if (view || --count < 0) {
      clearInterval(timer);
    }
  }, 1000);
}
