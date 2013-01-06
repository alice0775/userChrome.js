// ==UserScript==
// @name           contextTabContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    右クリックメニューにTab Context Menu
// @include        main
// @compatibility  Firefox 10.0 20.0a1
// @author         Alice0775
// @version        2013/01/05 16:00 Fix replave function
// ==/UserScript==
// @version        2012/12/22 11:00 Bug 593645
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2011/05/12 23:00
(function(){
    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <menupopup id="contentAreaContextMenu"> \
          <menuitem id="context-tabcontextmenu" \
                  insertbefore="context-openlink" \
                  label="Tab Context Menu" \
                  accesskey="T" \
                  oncommand="setTimeout(function(self){document.popupNode = gBrowser.selectedTab;document.getElementById(\'tabContextMenu\').openPopup(self,-2,-2,true, false);document.popupNode = null}, 0, this);"> \
          </menuitem> \
        </menupopup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, null);

    var func = TabContextMenu.updateContextMenu.toString();
    if (!/!aPopupMenu\.triggerNode\?gBrowser\.selectedTab:aPopupMenu\.triggerNode\./.test(func)) {
      func = func.replace(
        'aPopupMenu.triggerNode.',
        '!aPopupMenu.triggerNode?gBrowser.selectedTab:aPopupMenu.triggerNode.');
      TabContextMenu.updateContextMenu = new Function(
           func.match(/\(([^)]*)/)[1],
           func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
      );
    }
})();