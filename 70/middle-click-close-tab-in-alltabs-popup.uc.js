// ==UserScript==
// @name          Middle click close tab in alltabs-popup
// @description   タブ一覧表示のミドルクリックでタブを閉じる
// @version       1.1 2018/10/24 61+
// @include       main
// @compatibility Firefox 46, 63+
// @author        oflow
// @namespace     https://oflow.me/archives/1717
// ==/UserScript==

(function() {
    'use strict';
    var ucjsAllTabsPopupCloseTab = {
        init: function() {
            (document.getElementById('alltabs-popup')
              ? document.getElementById('alltabs-popup')
              : document.getElementById('allTabsMenu-allTabsView'))
              .addEventListener('click', this, false);
            window.addEventListener('unload', this, false);
        },
        uninit: function() {
            (document.getElementById('alltabs-popup')
              ? document.getElementById('alltabs-popup')
              : document.getElementById('allTabsMenu-allTabsView'))
              .removeEventListener('click', this, false);
            window.removeEventListener('unload', this, false);
        },
        handleEvent: function(event) {
            switch (event.type) {
                case 'click':
                    if (event.button !== 1) return;
                    let tab = event.target.tab;
                    if (tab) gBrowser.removeTab(tab, {animate: true});
                    break;
                case 'unload':
                    this.uninit();
                    break;
            }
        }
    }
    ucjsAllTabsPopupCloseTab.init();
})();