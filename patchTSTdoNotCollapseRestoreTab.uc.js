// ==UserScript==
// @name           patchTSTdoNotCollapseRestoreTab.uc.js
// @namespace      http://pc11.2ch.net/test/read.cgi/software/1168635399/656
// @description    TST閉じたタブを戻すときツリーをたたまない
// @include        main
// @author         alice0775
// @compatibility  4.0b11
// @version        2011/02/03 11:00
// ==/UserScript==
var patchTSTdoNotCollapseRestoreTab = {
  handleEvent: function(event) {
    switch (event.type) {
      case 'SSTabRestored':
        this.SSTabRestored(event);
        break;
      case 'unload':
        this.uninit();
        break;
    }
  },

  init: function(){
    if (!('TreeStyleTabService' in window))
      return;
    window.addEventListener('unload', this, false);
    gBrowser.tabContainer.addEventListener('SSTabRestored', this, false);
  },

  uninit: function(){
    window.removeEventListener('unload', this, false);
    gBrowser.tabContainer.removeEventListener('SSTabRestored', this, false);
  },

  SSTabRestored: function(event) {
    var tab = event.target;
    setTimeout(function(self){self.expand(tab);}, 250, this);
  },

  expand: function(tab) {
    while (tab) {
      gBrowser.treeStyleTab.collapseExpandSubtree(tab, false);
      tab = TreeStyleTabService.getParentTab(tab);
    }
  }
}
patchTSTdoNotCollapseRestoreTab.init();
