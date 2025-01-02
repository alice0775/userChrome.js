// ==UserScript==
// @name          addExceptionForSanitizer.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   Add exception for sanitizer(Clear Recent History... dialog)
// @include       chrome://browser/content/sanitize.xhtml
// @include       chrome://browser/content/sanitize_v2.xhtml
// @async         true
// @compatibility Firefox 123
// @author        alice0775
// @version       2024/01/16 Bug 1856412 - Make all clear history entrypoints point to the new clear history dialog
// @version       2023/12/19 Bug 1856415 - Update clear data dialog UI to match new designs
// @version       2023/06/04
// ==/UserScript==


var addExceptionForSanitizer = {
  init: function() {
    let func = gSanitizePromptDialog.sanitize.toString();
    func = func.replace(
      'this.updatePrefs();',
      `
      this.updatePrefs();
      addExceptionForSanitizer.saveChkbox();
      `
    );
    func = func.replace(
      'let options = {',
      'options = {'
    );
    func = func.replace(
      'let range = Sanitizer.getClearRange(this.selectedTimespan);',
      `
      let range = Sanitizer.getClearRange(this.selectedTimespan);
      let options = {};
      if (Services.prefs.getBoolPref('ucjs.exceptionForSanitizer', true)) {
        options = {
          ignoreTimespan: !range,
          range,
          progress: {
            clearHonoringExceptions: true
          }
        };
      } else {
      `
    );
    func = func.replace(
      'Sanitizer.sanitize(null, options)',
      `}
      Sanitizer.sanitize(null, options)
      `
    );
    func = func.replace(
      'Sanitizer.sanitize(itemsToClear, options)',
      ''
    );
    func = func.replace(
      'let itemsToClear = this.getItemsToClear();',
      `}
      let itemsToClear = this.getItemsToClear();
      Sanitizer.sanitize(itemsToClear, options)
      `
    );
    Services.console.logStringMessage(func);
    gSanitizePromptDialog.sanitize = new Function(
           func.match(/\(([^)]*)/)[1],
           func.replace(/[^)]+/, '').replace(/[^{]*\{/, '').replace(/}\s*$/, '')
    );

/*
  gSanitizePromptDialog.sanitize = function sanitize(event) {
    // Update pref values before handing off to the sanitizer (bug 453440)
    this.updatePrefs();
    addExceptionForSanitizer.saveChkbox();
    // As the sanitize is async, we disable the buttons, update the label on
    // the 'accept' button to indicate things are happening and return false -
    // once the async operation completes (either with or without errors)
    // we close the window.
    let acceptButton = this._dialog.getButton("accept");
    acceptButton.disabled = true;
    document.l10n.setAttributes(acceptButton, "sanitize-button-clearing");
    this._dialog.getButton("cancel").disabled = true;

    try {
      let range = Sanitizer.getClearRange(this.selectedTimespan);
      let options = {};
      if (Services.prefs.getBoolPref('ucjs.exceptionForSanitizer', true)) {
        options = {
          ignoreTimespan: !range,
          range,
          progress: {
            clearHonoringExceptions: true
          }
        };
      } else {
        options = {
          ignoreTimespan: !range,
          range,
        };
      }
      Sanitizer.sanitize(null, options)
        .catch(console.error)
        .then(() => window.close())
        .catch(console.error);
      event.preventDefault();
    } catch (er) {
      console.error("Exception during sanitize: ", er);
    }
  }
*/
    let chk = document.createXULElement("checkbox");
    chk.setAttribute("id", "chkException");
    chk.setAttribute("label", "Honor Cookie Exceptions");
    let ref = document.querySelector('checkbox[data-l10n-id="item-cookies"]');
    if (!ref) {
      ref = document.querySelectorAll('.checkboxWithDescription')[1];
      ref.appendChild(chk);
    } else {
      ref.parentElement.insertBefore(chk, ref.nextSibling);
    }
    chk.checked = Services.prefs.getBoolPref('ucjs.exceptionForSanitizer', true);
    chk.style.marginLeft = "16px";
  },

  saveChkbox: function (){
    let chk = document.getElementById("chkException");
    Services.prefs.setBoolPref('ucjs.exceptionForSanitizer', chk.checked);
  }
}
if (window.opener.location != "about:preferences#privacy") {
  addExceptionForSanitizer.init();
}