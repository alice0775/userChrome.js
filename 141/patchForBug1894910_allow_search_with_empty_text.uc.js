// ==UserScript==
// @name           patchForBug1894910_allow_search_with_empty_text.uc.js
// @description    undoing Bug 1894910 - Remove function to open search page from search bar with an empty search
// @include        chrome://browser/content/browser.xhtml
// @async          true
// @compatibility  141
// @version        2025/06/16 Bug 1968479 - Only allow eval (with system principal / in the parent) when an explicit pref is set
// @version        2025/02/02  add @sandbox
// @version        2024/06/4
// ==/UserScript==
(function() {
  let sb = window.userChrome_js?.sb;
  if (!sb) {
    sb = Cu.Sandbox(window, {
        sandboxPrototype: window,
        sameZoneAs: window,
    });

    /* toSource() is not available in sandbox */
    Cu.evalInSandbox(`
        Function.prototype.toSource = window.Function.prototype.toSource;
        Object.defineProperty(Function.prototype, "toSource", {enumerable : false})
        Object.prototype.toSource = window.Object.prototype.toSource;
        Object.defineProperty(Object.prototype, "toSource", {enumerable : false})
        Array.prototype.toSource = window.Array.prototype.toSource;
        Object.defineProperty(Array.prototype, "toSource", {enumerable : false})
    `, sb);
    window.addEventListener("unload", () => {
        setTimeout(() => {
            Cu.nukeSandbox(sb);
        }, 0);
    }, {once: true});
  }

  let searchbar = document.getElementById('searchbar');
  let func = searchbar.textbox.handleEnter.toString();

  func = func.replace(
  'if (!this.textbox.value) {',
  'if (false) {'
  );
  func = func.replace(
  '!this.textbox.value &&',
  'false &&'
  );
/*
  searchbar.textbox.handleEnter = (new Function(
         'event',
         func.replace(/[^{]*\{/, '').replace(/}\s*$/, '')
  )).bind(searchbar);
*/
  func = func.replace(
  'event =>',
  '(event)'
  );
  Cu.evalInSandbox("searchbar.textbox.handleEnter = function " + func.replace(/^function/, '') + ".bind(searchbar)", sb);

})();
