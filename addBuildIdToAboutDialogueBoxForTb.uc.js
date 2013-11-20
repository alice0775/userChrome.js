// ==UserScript==
// @name           addBuildIdToAboutDialogueBoxForTb.uc.js
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
    return navigator.buildID;
    /*
    // after Fx1.5
    if ("@mozilla.org/xre/app-info;1" in Components.classes &&
        Components.classes["@mozilla.org/xre/app-info;1"]
          .getService(Components.interfaces.nsIXULAppInfo) &&
        Components.classes["@mozilla.org/xre/app-info;1"]
          .getService(Components.interfaces.nsIXULAppInfo).appBuildID)
     var buildid = Components.classes["@mozilla.org/xre/app-info;1"]
                         .getService(Components.interfaces.nsIXULAppInfo).appBuildID;
    return buildid;
    */
  },

  addBuildid: function () {
    var ua = this.convUA() + " ID:" + this.buildid();

    var userAgentField = document.getElementById("userAgent");
    if (!userAgentField) {
      userAgentField = document.getElementById("rightBox");
      var label = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 'textbox');
      userAgentField = userAgentField.appendChild(label);
      userAgentField.setAttribute("id", "agent");
      userAgentField.setAttribute("value", navigator.userAgent);
      userAgentField.setAttribute("multiline", true);
      userAgentField.setAttribute("rows", "5");
    }
    userAgentField.value = this.getPlatformBuildSource() + "\n" + this.getBuildSource() + "\n" + ua;
    userAgentField.setAttribute("value", this.getPlatformBuildSource() + "\n" + this.getBuildSource() + "\n" + ua);
    window.resizeBy(0, 100);
  },

  convUA: function(){
    var pref = Components.classes['@mozilla.org/preferences-service;1']
                         .getService(Components.interfaces.nsIPrefBranch);
    const kUA = "general.useragent.extra.firefox";
    const kUA2 = "general.useragent.override";
    var oldId = "";
    if (pref.prefHasUserValue(kUA)){
      oldId = pref.getCharPref(kUA);
      pref.clearUserPref(kUA);
    }
    var oldId2 = "";
    if (pref.prefHasUserValue(kUA2)){
      oldId2 = pref.getCharPref(kUA2);
      pref.clearUserPref(kUA2);
    }
    ua = navigator.userAgent;
    if (!!oldId)
      pref.setCharPref(kUA, oldId);
    if (!!oldId2)
      pref.setCharPref(kUA2, oldId2);
    return ua;
  },

  copyUA: function (){
    var userAgentField = document.getElementById("userAgent");
    if (!userAgentField)
      userAgentField = document.getElementById("agent");
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
      .getService(Components.interfaces.nsIClipboardHelper).copyString(userAgentField.value);
  },

  getPlatformBuildSource: function (){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
    const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
    var file = ds.get("CurProcD", Ci.nsIFile);
    file.append("platform.ini");
    var text = this.readFile(file);
    var SourceRepository = text.match(/SourceRepository=(.*)/)[1];
    var SourceStamp = text.match(/SourceStamp=(.*)/)[1];
    //alert(SourceRepository + "/rev/" + SourceStamp);
    return SourceRepository + "/rev/" + SourceStamp;
  },

  getBuildSource: function (){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
    const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
    var file = ds.get("CurProcD", Ci.nsIFile);
    file.append("application.ini");
    var text = this.readFile(file);
    var SourceRepository = text.match(/SourceRepository=(.*)/)[1];
    var SourceStamp = text.match(/SourceStamp=(.*)/)[1];
    //alert(SourceRepository + "/rev/" + SourceStamp);
    return SourceRepository + "/rev/" + SourceStamp;
  },

  readFile: function (aFile){
        var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                                createInstance(Components.interfaces.nsIFileInputStream);
        stream.init(aFile, 0x01, 0, 0);
        var cvstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                                  createInstance(Components.interfaces.nsIConverterInputStream);
        cvstream.init(stream, "UTF-8", 1024,
                      Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
        var content = "", data = {};
        while (cvstream.readString(4096, data)) {
          content += data.value;
        }
        cvstream.close();
        return content.replace(/\r\n?/g, "\n");
      }
}

addBuildid.addBuildid();
addBuildid.copyUA();
