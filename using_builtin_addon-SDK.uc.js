// ==UserScript==
// @name           using_builtin_addon-SDK.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ビルトインaddon SDKをuserChrome.jsで使ってみるテスト
// @include        main
// @compatibility  Firefox 23
// @author         Alice0775
// @version        2014/09/15 Bug 858278
// @version        2013/09/03 ビルトインaddon SDKをuserChrome.jsで使ってみるテスト
// @Note           http://www.oxymoronical.com/blog/2013/02/The-Add-on-SDK-is-now-in-Firefox
// @Note           and Bug 858278
// ==/UserScript==
(function(){
  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

  const { utils: Cu } = Components;
  const { Services } = Cu.import("resource://gre/modules/Services.jsm", {});
  const LoaderModule = Cu.import("resource://gre/modules/commonjs/toolkit/loader.js", {}).Loader;
  const { console } = Cu.import("resource://gre/modules/devtools/Console.jsm", {});
  let {
    Loader, main, Module, Require, unload
  } = LoaderModule;
 
  let CURRENT_DIR = getCURRENT_DIR(); //'scratchpad://';
  let loaders = [];

  function getCURRENT_DIR () {
    Error().stack.split('\n')[2].match(/^[^@]*@(.*?)[^/]+:\d+$/);
    let p0 = RegExp.$1;
    let p1 = Error().fileName.replace(/[^/]+$/,'').split(' -> ').pop();
    return (p0 == p1) ? [p0] : [p0,p1];
  }

  function makePaths (root) {
    return {
      './': CURRENT_DIR,
      '': 'resource://gre/modules/commonjs/'
    };
  }

  function makeLoader (options) {
    let { paths, globals } = options || {};

    // We have to have `console` as a global, otherwise
    // many SDK modules will fail
    // bug 961252
    let globalDefaults = {
      console: console
    };

    let loader = Loader({
      paths: paths || makePaths(),
      globals: extend({}, globalDefaults, globals) || null,
      modules: {
        // Needed because sdk/ modules reference utilities in
        // `toolkit/loader`, until Bug 961194 is completed
        'toolkit/loader': LoaderModule
      },
      // We need rootURI due to `sdk/self` (or are using native loader)
      // which overloads with pseudo modules
      // bug 961245
      rootURI: CURRENT_DIR,
      // We also need metadata dummy object
      // bug 961245
      metadata: {}
    });

    loaders.push(loader);
    return loader;
  }

  function extend (...objs) {
    if (objs.length === 0 || objs.length === 1)
      return objs[0] || {};

    for (let i = objs.length; i > 1; i--) {
      for (var prop in objs[i - 1])
        objs[0][prop] = objs[i - 1][prop];
    }
    return objs[0];
  }

  // clean up
  window.addEventListener("unload", function() {
      loaders.forEach(unload);
  }, false);


  // test codes
  function test () {
    // Load `constructor` as global since tabs uses `traits`
    // that use this module
    let loader = makeLoader({ globals: constructor });
    let module = Module("./main", getCURRENT_DIR()  /*"scratchpad://"*/);
    let require = Require(loader, module);

    // test notifications
    var { notify } = require("sdk/notifications");
    notify({
      text: "Hello from the SDK!"
    });

    let tabs = require("sdk/tabs");
    tabs.open({
      url: "about:blank",
      onReady: function (tab) {
        // do something
     }
    });

    // require("sdk/selection")
  }
  test ();

})();
