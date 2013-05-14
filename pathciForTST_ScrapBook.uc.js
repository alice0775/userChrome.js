// ==UserScript==
// @name          pathciForTST_ScrapBook.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Adjust size of Tabbar accordingly ScrapBookToolbox hidden
// @compatibility Firefox 17+
// @include       main
// @author        alice0775
// @version       2013/05/06 09:50 fix when scrapbook toolbar popup at first time
// @version       2013/05/05 10:25
// @version       2013/03/22 04:25
// ==/UserScript==

var pathciForTST_ScrapBook = {
  observer: null,
  timer: true,
  init: function() {
    if (!("treeStyleTab" in gBrowser))
      return;
    
    // select the target node
    var target = document.querySelector('#ScrapBookToolbox');
    if (!target)
      return;

    // create an observer instance
    var that = this;
    this.observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName == "hidden") {
          gBrowser.treeStyleTab.updateFloatingTabbar(TreeStyleTabService.kTABBAR_UPDATE_BY_WINDOW_RESIZE);
          if (that.timer)
            clearTimeout(that.timer);
          that.timer = setTimeout(function(){
            gBrowser.treeStyleTab.updateFloatingTabbar(TreeStyleTabService.kTABBAR_UPDATE_BY_WINDOW_RESIZE);
          }, 250);
        }
      });
    });
      
    // configuration of the observer:
    var config = { attributes: true };
      
    // pass in the target node, as well as the observer options
    this.observer.observe(target, config);

    window.addEventListener("unload", this, false);
  },

  uninit: function() {
    // later, you can stop observing
    if (this.observer)
      this.observer.disconnect();
  },

  handleEvent: function(event) {
    window.removeEventListener("unload", this, false);
  }
}
pathciForTST_ScrapBook.init();