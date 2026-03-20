// ==UserScript==
// @name           remenberScrollPositionOfHistorySidebar.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Remenber Scroll Position Of History Sidebar
// @include        chrome://browser/content/sidebar/sidebar-history.html
// @compatibility  Firefox 149
// @author         Alice0775
// @version        2026/03/21 
// ==/UserScript==
(function () {
  const kPref = 'sidebar.history.sortOption';
  const kPref_scrollTop = 'sidebar.history.scrollTop_';
  const win = window.top;

  let sortOrder = Services.prefs.getStringPref(kPref, "date");
  let top = Services.prefs.getIntPref(kPref_scrollTop + sortOrder, 0);

  let view;
  setTimeout(() => {
    view = document.querySelector("sidebar-history").shadowRoot.querySelector(".sidebar-panel-scrollable-content");
    view.scrollTop = top / 100;
    view.addEventListener("scroll", onScroll, false);
  }, 0);

  function onScroll(e) {
    top = view.scrollTop;
    sortOrder = Services.prefs.getStringPref(kPref, "date");
    Services.prefs.setIntPref(kPref_scrollTop + sortOrder, top * 100);
  }


  function onPrefChange() {
    setTimeout(() => {
      let sortOrder = Services.prefs.getStringPref(kPref, "date");
      let top = Services.prefs.getIntPref(kPref_scrollTop + sortOrder, 0);
      view.scrollTop = top / 100;
    }, 0);
  }

  Services.prefs.addObserver(kPref, onPrefChange);


  function onUnload() {
      window.removeEventListener("unload", onUnload, false);
      Services.prefs.removeObserver(kPref, onPrefChange);
  }

  window.addEventListener("unload", onUnload, false);

})();
