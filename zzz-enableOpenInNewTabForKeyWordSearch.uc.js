// ==UserScript==
// @name           zzz- enableOpenInNewTabForKeyWordSearch.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    keyword search でAlt+Enterおよび中クリックで新しいタブを開くようにする
// @include        main
// @compatibility  Firefox 3.5 3.6a1pre
// @compatibility  Tree Style Tab 0.7.2009051501, NoScript 1.9.2.6
// @author         Alice0775
// @version        2009/05/16 0:00
// @note           tabLock.uc.js , ttp2http_drop_urlbar.uc.js より後で読み込むこと
// @note           Tab Mix Plus には非対応
// @note           BHNewTab*.uc.js には非対応
// @note           ブックマークレット非対応(新しいタブに開きたいならブックマークレットでそうすればいいだけ)
// ==/UserScript==
(function() {

  //Enter & go-button
  if (!('TM_init' in window || 'BHNewTab' in  window)) {
    if ('gURLBar' in window && 'handleCommand' in gURLBar) { //Fx 3.5 3.6a1pre
      var func = gURLBar.handleCommand.toString();
      func = func.replace(
        'var [url, postData] = this._canonizeURL(aTriggeringEvent);',
      <><![CDATA[
        // keyword search
        var url = this.value;
        if (!url)
          return;
        var postData = "";
        var offset = url.indexOf(" ");
        if (!/^(javascript:|data:)/.test(url) && offset > 0) {
          var postDataObj = {};
          url = getShortcutOrURI(url, postDataObj);
          postData = postDataObj.value;
          if (!url)
            [url, postData] = this._canonizeURL(aTriggeringEvent);
        } else {
          [url, postData] = this._canonizeURL(aTriggeringEvent);
        }
        //
      ]]></>
      );

      func = func.replace(
        'openUILink(url, aTriggeringEvent, false, false, true, postData);',
      <><![CDATA[
          // revert
          if (/^(tab|tabshifted|window|save)$/.test(whereToOpenLink(aTriggeringEvent, false, false))) {
            this.handleRevert();
            content.focus();
          }
          //
          $&
      ]]></>
      );

      eval("gURLBar.handleCommand = " + func);
    }
/*
    if ('handleURLBarCommand' in window) { //Fx3.0
      var func;

      func = BrowserLoadURL.toString();
      func = func.replace(
        'openUILink(url, aTriggeringEvent, false, false, true, aPostData);',
      <><![CDATA[
          // revert
          if (/^(tab|tabshifted|window|save)$/.test(whereToOpenLink(aTriggeringEvent, false, false))) {
            handleURLBarRevert();
            content.focus();
          }
          //
          $&
      ]]></>
      );

      eval("BrowserLoadURL = " + func);
    }
*/
  }
})();
