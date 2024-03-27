// ==UserScript==
// @name           patchForBug1887284.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    workaround Bug 1887284 - IME input is truncated while tab-to-search and URL has been autofilled
// @include        main
// @compatibility  Firefox 124+
// @author         Alice0775
// @version        2024/03/27 00:00
// @version        2024/03/21 00:00
// ==/UserScript==
gURLBar._autofillValue = function _autofillValue({
    value,
    selectionStart,
    selectionEnd,
    type,
    adaptiveHistoryInput,
  }) {
    // The autofilled value may be a URL that includes a scheme at the
    // beginning.  Do not allow it to be trimmed.
    this._setValue(value, false);
    this.inputField.setSelectionRange(selectionStart, selectionEnd);
    if (this._searchModeIndicator.style.getProperty("display") != "none" &&
        Services.prefs.getBoolPref("browser.urlbar.suggest.engines", true)) {
      this._autofillPlaceholder = {
        value,
        type,
        adaptiveHistoryInput
      };
    } else {
      this._autofillPlaceholder = {
        value,
        type,
        adaptiveHistoryInput,
        selectionStart,
        selectionEnd,
      };
    }
  }
