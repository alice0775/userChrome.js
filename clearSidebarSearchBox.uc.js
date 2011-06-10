// ==UserScript==
// @name           clearSidebarSearchBox.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Right click to Clear Search Box on Bookmark and History Sidebar Pannel
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include        chrome://browser/content/history/history-panel.xul
// @compatibility  Firefox 2.0 3.0a8pre
// @author         Alice0775
// @version        2007/08/31 20:00
// @Note
// ==/UserScript==
/* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* Alternatively, the contents of this file may be used under the
* terms of the GNU General Public License Version 2 or later (the
* "GPL"), in which case the provisions of the GPL are applicable
* instead of those above.
*
* The Original Code is Alice0775
* http://space.geocities.yahoo.co.jp/gl/alice0775
* (2007/04/28)
*
* Contributor(s):
*  ()
*
* ***** END LICENSE BLOCK ***** */
(function() {
  if (location.href == 'chrome://browser/content/bookmarks/bookmarksPanel.xul') {
    var bookmarksview = document.getElementById('bookmarks-view');
    var label = bookmarksview.previousSibling.firstChild;
    label.addEventListener('click',function(event) {
      var doc = event.target.ownerDocument;
      var searchbox = document.getElementById('search-box');
      if (event.button == 2) {
        event.preventDefault();
        searchbox.value = '';
        searchbox.doCommand();
      } else if (event.button == 0) {
        if (searchbox.value != '' )
          searchbox.doCommand();
      }
    },true);
  } else if (location.href == 'chrome://browser/content/history/history-panel.xul') {
    var viewButton = document.getElementById('viewButton');
    viewButton.addEventListener('click',function(event) {
      var doc = event.target.ownerDocument;
      var searchbox = document.getElementById('search-box');
      if (event.button == 2) {
        event.preventDefault();
        searchbox.value = '';
        searchbox.doCommand();
      }
    },true);
  }
})();