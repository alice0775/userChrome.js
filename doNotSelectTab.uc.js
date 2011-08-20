// ==UserScript==
// @name           doNotSelectTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    TMPをインストールしていない場合, 非アクティブをドラッグ開始した際,そのタブが前面になるのを阻止する。
// @include        main
// @compatibility  Nightly8.0a1
// @author         Alice0775
// @version        2011/08/20 21:00 Nightly8.0a1
// @version        2008/06/28 16:00 focus ring でないようにした
// @version        2008/06/23 02:00
// @Note
// ==/UserScript==
var dontSelectTab = {
  init: function(){
    gBrowser.tabContainer.addEventListener("mousedown", this, true);
    gBrowser.tabContainer.addEventListener("click", this, true);
  },

  sx: null,
  sy: null,
  sspi: null,
  handleEvent: function(event) {
   switch (event.type) {
      case "mousedown":
        if (event.button != 0) return;
        var tab = this.getTab(event);
        if (!tab)
          return;
        tab.style.MozUserFocus = 'ignore'; //focus ring でないように
        tab.clientTop; // just using this to flush style updates //focus ring でないように
        this.sx = event.screenX;
        this.sy = event.screenY;
        if ("_getAdjustedCoords" in gBrowser.tabContainer) {
          var panel = tab.getAttribute("linkedpanel");
          var style = <><![CDATA[
            .tab-drag-preview {
            background-image: -moz-element(#panel) !important;
            }
            ]]></>.toString().replace("panel", panel).replace(/\s/g,"");;
          if (this.sspi)
            document.removeChild(this.sspi);
          this.sspi = document.createProcessingInstruction(
            'xml-stylesheet',
            'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
          );
          document.insertBefore(this.sspi, document.documentElement);
          this.sspi.getAttribute = function(name) {
          return document.documentElement.getAttribute(name);
          };
        }
        event.stopPropagation();
        break;
      case "click": 
        if (event.button != 0) return;
        var tab = this.getTab(event);
        if (tab){
          var sx = event.screenX;
          var sy = event.screenY;
          if (!(sx == this.sx && sy == this.sy))
            return;
          if ('MultipleTabService' in window && MultipleTabService.hasSelection())
            return;
          tab.style.MozUserFocus = 'ignore'; //focus ring でないように
          tab.clientTop; // just using this to flush style updates //focus ring でないように
          gBrowser.selectedTab = tab;
          tab.style.MozUserFocus = '';
        }
        break;
      case "unload":
        gBrowser.tabContainer.removeEventListener("mouseup", this, true);
        gBrowser.tabContainer.removeEventListener("mousedown", this, true);
        break;
    }
  },
  getTab: function(event){
    var aTarget = event.target;
    while (aTarget) {
      if (aTarget.className == 'tab-close-button' ||
         aTarget.className == 'toolbarbutton-icon')
        return null;
      if (aTarget.localName == 'tab')
        return aTarget;
      aTarget = aTarget.parentNode;
    }
    return null;
  }
}
if (!('TM_init' in window)) {
  dontSelectTab.init();
  window.addEventListener('unload', dontSelectTab, false);
}