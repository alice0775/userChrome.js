// ==UserScript==
// @name           0-builtin_addon-SDK.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ビルトインaddon SDKのrequireをuserChrome.jsで使えるように
// @include        main
// @compatibility  Firefox 23
// @author         Alice0775
// @version        2015/01/01 0-builtin_addon-SDK.uc.js
// @version        2014/09/15 Bug 858278
// @version        2013/09/03 ビルトインaddon SDKをuserChrome.jsで使ってみるテスト
// @Note           http://www.oxymoronical.com/blog/2013/02/The-Add-on-SDK-is-now-in-Firefox
// @Note           and Bug 858278
// @Note           window.userChrome_js.require
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


  // init codes
  function init_require () {
    // Load `constructor` as global since tabs uses `traits`
    // that use this module
    let loader = makeLoader({ globals: constructor });
    let module = Module("./main", CURRENT_DIR /* "scratchpad://" */);
    let require = Require(loader, module);
    window.userChrome_js.require = require;
  }

  init_require ();

/*  
  function test () {
    //sample
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

	  // we need to make sure we have a hook into "things" we click on:
	  var self = require("sdk/self");
	  // and we'll be using the context menu, so let's make sure we can:
	  var contextMenu = require("sdk/context-menu");
	  // let's add a menu item!
	  var menuItem = contextMenu.Item({
	    // the label is pretty obvious...
	    label: "Delete Element",

	    // the context tells Firefox which things should have this in their context
	    // menu, as there are quite a few elements that get "their own" menu,
	    // like "the page" vs "an image" vs "a link". .. We pretty much want
	    // everything on a page, so we make that happen:
	    context: contextMenu.PredicateContext(function(data) { return true; }),

	    // and finally the script that runs when we select the option. Delete!
	    contentScript: 'self.on("click", function (node, data) { node.outerHTML = ""; });'
	  });
    // require("sdk/selection")
  }

  test ();
*/

})();
