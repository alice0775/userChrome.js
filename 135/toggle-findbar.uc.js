// ==UserScript==
// @name          Toggle FindBar
// @description   Ctrl+Fで検索バーの表示切り替え
// @version       1.1.1
// @include       main
// @async          true
// @author        oflow
// @namespace     https://oflow.me/archives/256
// @note          2024/07/14 128.0対応 Bug 1897477 - Remove inline event handlers from <command>
// @note          uc.jsに書き換え。61.0a1対応
// ==/UserScript==
var ucjsToggleFindBar = function() {
	if (gFindBar)
		gFindBar.hidden ? gFindBar.onFindCommand() : gFindBar.close();
	else
		gLazyFindCommand("onFindCommand");
};
var ucjsToggleFindBar_onClickAddonbar = function(event) {
  if (event.button != 2)
    return;
  let target = event.originalTarget;
  while(target) {
    if ((target.localName == 'toolbarspring' &&
        target.parentNode.id != "toolbar-menubar") ||
        target.id == 'addonbar' ||
        target.id == 'status-bar') {
      target.setAttribute("context", "");
      ucjsToggleFindBar();
      break;
    }
    if (target == XULBrowserWindow.statusTextField ||
      target == StatusPanel) {
      target.setAttribute("context", "");
      ucjsToggleFindBar();
      break;
    }
    target = target.parentNode;
  }
}

window.addEventListener("click", ucjsToggleFindBar_onClickAddonbar,false);

(function() {
  document.getElementById("mainCommandSet").addEventListener("command", event => {
    switch (event.target.id) {
      case "cmd_find":
        event.stopPropagation();
        event.preventDefault();
      	ucjsToggleFindBar();
    }
  }, true);
})();
