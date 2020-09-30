// ==UserScript==
// @name           middleClickUndoCloseTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    undo close tab when middleclick on tabbar
// @include        main
// @compatibility  Firefox 78
// @author         Alice0775
// @version        2020/09/27 00:00
// ==/UserScript==

(function() {
    var ucjsUndoCloseTab = function(e) {
        // Only with middle click
        if (e.button != 1) {
            return;
        }
        // Click on Tab bar and the New Tab buttons
        if (e.target.localName != 'arrowscrollbox' && e.target.localName != 'toolbarbutton') {
            return;
        }
        undoCloseTab(0);
        e.preventDefault();
        e.stopPropagation();
    }
    // New Tab Button, all tabs-button
    document.getElementById('new-tab-button').onclick = ucjsUndoCloseTab;
    document.getElementById('alltabs-button').onclick = ucjsUndoCloseTab;
    // TabBar
    gBrowser.tabContainer.addEventListener('click', ucjsUndoCloseTab, true);
    window.addEventListener('unload', function uninit() {
        gBrowser.tabContainer.removeEventListener('click', ucjsUndoCloseTab, true);
        window.removeEventListener('unload', uninit, false);
    }, false);
})();