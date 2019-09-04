// ==UserScript==
// @name          Toggle FindBar
// @description   Ctrl+Fで検索バーの表示切り替え
// @version       1.1
// @include       main
// @author        oflow
// @namespace     https://oflow.me/archives/256
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
    if (target.localName == 'toolbarspring' ||
        target.id == 'addonbar') {
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
	["key_find", "cmd_find"].forEach(id => {
		document.getElementById(id).setAttribute("oncommand", "ucjsToggleFindBar()");
	});
})();
