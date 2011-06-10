// ==UserScript==
// @name           hack to fix bug 429166
// @namespace
// @description    Focus lock on cross-window drag-and-drop of text to search bar
// @include        main
// @compatibility  Firefox 3.0
// @author
// @version
// @Note
// ==/UserScript==

//Bug 429166 -  Focus lock on cross-window drag-and-drop of text to search bar
(function(){
  var searchBar = document.getElementById("searchbar");
  var func = searchBar.doSearch.toString();
  func = func.replace(
    'openUILinkIn(submission.uri.spec, aWhere, null, submission.postData);',
    <><![CDATA[
      focus();
      $&
    ]]></>
  );
  func = func.replace(
    'if (shortcutURL && shortcutURL != aData) {',
    <><![CDATA[
      focus();
      $&
    ]]></>
  );
  eval("searchBar.doSearch = " + func);
})();