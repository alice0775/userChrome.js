// ==UserScript==
// @name           go30-Fx37.uc.js
// @namespace
// @description
// @include        main
// @compatibility  Firefox 3.7 4.0 5.0
// @author
// @version
// @Note
// ==/UserScript==

(function(){
  var gopopup = document.getElementById("history-menu");
  gopopup.addEventListener('popupshown', popupshown, false);
  function popupshown(event) {
    gopopup.removeEventListener('popupshown', arguments.callee, false);
    gopopup._placesView.place = gopopup._placesView.place.replace(/maxResults=10/, 'maxResults=100').replace(/maxResults=15/, 'maxResults=100');

    gopopup._placesView.place = gopopup._placesView.place;
  }
})();