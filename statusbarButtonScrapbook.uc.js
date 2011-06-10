// ==UserScript==
// @name           statusbarButtonScrapbook.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    right click on statusbar Button for Scrapbook
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        LastMod 2007/08/13 10:00
// @Note           
// ==/UserScript== 
(function(){
  var statusbarBottun = document.getElementById('ScrapBookStatusPanel');
  if( !statusbarBottun ) return;
  statusbarBottun.removeAttribute('onclick');
  statusbarBottun.addEventListener('click',function(event){
    event.preventDefault();
    event.stopPropagation();
    if ( event.button == 2 )
      document.getElementById('ScrapBookStatusPopup').showPopup();
    else if ( event.button == 1 ) 
      toggleSidebar('viewScrapBookSidebar');
  },true);
})();