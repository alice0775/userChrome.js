// ==UserScript==
// @name           using_builtin_addon-SDK.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ビルトインaddon SDKをuserChrome.jsで使ってみるテスト
// @include        main
// @compatibility  Firefox 23
// @author         Alice0775
// @version        2013/09/03 ビルトインaddon SDKをuserChrome.jsで使ってみるテスト
// @Note
// ==/UserScript==
(function(){
  // init
  var { Loader } = Components.utils.import("resource://gre/modules/commonjs/toolkit/loader.js", {});
  var loader = Loader.Loader({
    paths: {
      "sdk/": "resource://gre/modules/commonjs/sdk/",
      "": "globals:///"
    },
    resolve: function(id, base) {
      if (id == "chrome" || id.startsWith("@"))
        return id;
      return Loader.resolve(id, base);
    }
  });
  var module = Loader.Module("main", "scratchpad://");
  var require = Loader.Require(loader, module);

  // test notifications
  var { notify } = require("sdk/notifications");
  notify({
    text: "Hello from the SDK!"
  });

})()
