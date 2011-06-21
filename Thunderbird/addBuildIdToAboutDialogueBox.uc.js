// ==UserScript==
// @name           addBuildIdToAboutDialogueBox.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description
// @include        chrome://browser/content/aboutDialog.xul
// @include        chrome://messenger/content/aboutDialog.xul
// @compatibility  Firefox 3.0 3.1
// @author         Alice0775
// @version        2008/11/22 12:00
// @Note           Help > About画面に にBuilsIDを付加するとともにクリップボードにUA+IDをコピー
// ==/UserScript==
var addBuildid = {
  buildid: function (){
    var buildid = navigator.productSub;

    // if user overrides build id of useragent identifier, try to get original value.
    var pref = Components.classes['@mozilla.org/preferences;1']
                         .getService(Components.interfaces.nsIPrefBranch);
    const kProductSub = "general.useragent.productSub";
    if (pref.prefHasUserValue(kProductSub)){
      var oldId = pref.getCharPref(kProductSub);
      pref.clearUserPref(kProductSub);
      buildid = navigator.productSub;
      pref.setCharPref(kProductSub,oldId);
    }

    // after Fx1.5
    if ("@mozilla.org/xre/app-info;1" in Components.classes &&
        Components.classes["@mozilla.org/xre/app-info;1"]
          .getService(Components.interfaces.nsIXULAppInfo) &&
        Components.classes["@mozilla.org/xre/app-info;1"]
          .getService(Components.interfaces.nsIXULAppInfo).appBuildID)
     buildid = Components.classes["@mozilla.org/xre/app-info;1"]
                         .getService(Components.interfaces.nsIXULAppInfo).appBuildID;
    return buildid;
  },

  addBuildid: function () {
    var userAgentField = document.getElementById("userAgent");
    var ua = userAgentField.value;
    var label = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 'description');
    label.textContent = ua;
    userAgentField.parentNode.appendChild(label);
    var name = Components.classes["@mozilla.org/xre/app-info;1"]
             .getService(Components.interfaces.nsIXULAppInfo).name +
             "/" +
             Components.classes["@mozilla.org/xre/app-info;1"]
             .getService(Components.interfaces.nsIXULAppInfo).version;
    ua.match(/(.*Gecko\/\d+\b)/);
    userAgentField.value = RegExp.$1 + " " + this.convUA(name) + " ID:" + this.buildid();
    window.resizeBy(0, 80);
  },

  convUA: function(ua){
    if (/3\.7[ab]?\d?pre/.test(ua))
      ua = ua.replace(/Firefox/, 'Minefield');
    if (/3\.6[ab]?\d?pre/.test(ua))
      ua = ua.replace(/Firefox/, 'Namoroka');
    if (/3\.5[ab]?\d?pre/.test(ua))
      ua = ua.replace(/Firefox/, 'Shiretoko');
    if (/3\.1[ab]?\d?pre/.test(ua))
      ua = ua.replace(/Firefox/, 'Shiretoko');
    if (/3\.0\.\d[ab]?\d?pre/.test(ua))
      ua = ua.replace(/Firefox/, 'GranParadiso');
    return ua;
  },

  copyUA: function (){
    var userAgentField = document.getElementById("userAgent");
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
      .getService(Components.interfaces.nsIClipboardHelper).copyString(userAgentField.value);
  }
}

addBuildid.addBuildid();
addBuildid.copyUA();
