// ==UserScript==
// @name          doNotSelectTab_fx60.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   do not select tab when dragging it, 非アクティブをドラッグ開始した際,そのタブが前面になるのを阻止する。
// @include       main
// @async          true
// @compatibility Firefox 154
// @version        2026/09/09 delete
// @version        2026/09/09 do nothing if firefox view is open
// @version        2026/09/09 xxx workaround switch tabs in allTabsMenu does not work
// @version        2026/09/07 xxx workaround selectTabAtIndex does not work
// @version        2026/09/07 xxx workaround advanceSelectedTab does not work take 2
// @version        2026/09/07 xxx workaround advanceSelectedTab does not work
// @version        2026/08/18 Change due to Bug 2039847: Add events for tab interactions
// @version        2026/01/30 fix bug.
// @version        2026/01/30 fix non-selected tab.
// @version        2025/09/19 fix an issue where slightly dragging a loaded, non-selected tab would cause it to be discarded.
// @version        2025/06/30 fix advanceSelectedTab does not work
// @version        2025/03/07 fix bug of select tab
// @version        2025/03/05 fix under sidebar.verticalTabs=true
// @version        2020/09/20 workarround for Bug 1590573
// @version        2019/11/14 workarround for busy icon
// @version        2019/11/14 wait for init gBrowser
// @version        2019/02/22 00:00 fix 67 Bug 675539 - Make tab discard functionality work on tab object directly
// @version       2018/12/26 11:50 ignore close button 
// @version       2018/10/03 23:00 more aggressive pending tab 
// @version       2018/10/03 19:00 fix should not react on newtab button and other button, wip
// @version       2018/10/03 00:20 fix do not load tab when if it is pending background tab, wip
// @version       2018/10/02 23:10 fix do not select tab when right click, wip
// @version       2018/10/02 23:00 fix do not select tab when click on speeker icon, wip
// @version       2018/10/02 wip
// @todo          should investigate side effects due to event.stopPropagation when mousedown
// ==/UserScript==
