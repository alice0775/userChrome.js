/* userChrome.js 0.8 - Copyleft © 2007  Simon Bünzli  <zeniko@gmail.com> */
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");


// Gecko 1.9.0/1.9.1 compatibility - add XPCOMUtils.defineLazyServiceGetter
if (!("defineLazyServiceGetter" in XPCOMUtils))
{
  XPCOMUtils.defineLazyServiceGetter = function XPCU_defineLazyServiceGetter(obj, prop, contract, iface)
  {
    obj.__defineGetter__(prop, function XPCU_serviceGetter()
    {
      delete obj[prop];
      return obj[prop] = Components.classes[contract].getService(Components.interfaces[iface]);
    });
  };
}


function UserChrome_js() {
}

UserChrome_js.prototype = {
  // properties required for XPCOM registration:
  classDescription: "userChrome.js Loading Component",
  classID         : Components.ID("{58d33e40-f0e8-11db-8314-0800200c9a66}"),
  contractID      : "@zeniko/userchrome_js;1",

  _xpcom_categories: [{
    category: "app-startup",
    service: true
  }],

  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsISupports,
                                         Components.interfaces.nsIObserver,
                                         Components.interfaces.nsIModule,
                                         Components.interfaces.nsIFactory,
                                         Components.interfaces.nsIDOMEventListener]),

/* nsIUserChrome_js implementation goes here */
/* ........ nsIObserver .............. */

  observe: function(aSubject, aTopic, aData)
  {
    let observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);

    switch (aTopic)
    {
      case "app-startup":
        observerService.addObserver(this, "final-ui-startup", false);
        break;
      case "profile-after-change":
        //break;
      case "final-ui-startup":
        var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("UChrm", Components.interfaces.nsILocalFile);
        file.append("userChrome.js");

        if (!file.exists())
        {
          file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0644);

          data = '// This file can be used to customize the functioning of Mozilla\'s user interface.\n// For example code see http://mozilla.zeniko.ch/userchrome.js.html#snippets .\n\n// Add code to apply to all windows above the following line\n// and code to only apply to the main browser window below:\nif (location != "chrome://browser/content/browser.xul") throw "stop";\n';

          var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                         .createInstance(Components.interfaces.nsIFileOutputStream);
          stream.init(file, 0x02, 0644, 0);
          stream.write(data, data.length);
          stream.flush();
          stream.close();
        }

        if (file.exists() && file.isFile() &&
            !Components.classes["@mozilla.org/xre/app-info;1"]
              .getService(Components.interfaces.nsIXULRuntime).inSafeMode)
        {
          this.mFileURL = Components.classes["@mozilla.org/network/io-service;1"]
                            .getService(Components.interfaces.nsIIOService)
                            .getProtocolHandler("file")
                            .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
                            .getURLSpecFromFile(file);
          this.mFileURL += "?" + this.getLastModifiedTime(file);

          observerService.addObserver(this, "domwindowopened", false);
        }
        break;
      case "domwindowopened":
        aSubject.addEventListener("load", this, true);
        break;
    }
  },

  getLastModifiedTime: function(aScriptFile) {
    try {
        var aLocalfile = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        aLocalfile.initWithPath(aScriptFile.path);
        return aLocalfile.lastModifiedTime;
    } catch(e) {}
    return "";
  },
/* ........ nsIDOMEventListener .............. */

  handleEvent: function(aEvent)
  {
    var document = aEvent.originalTarget;
    if (document.location && 
        (document.location.protocol == "chrome:" || document.location.protocol == "about:"))
    {

      try
      {
        Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .getService(Components.interfaces.mozIJSSubScriptLoader)
          .loadSubScript(this.mFileURL, document.defaultView);
      }
      catch (ex)
      {
        if (ex !== "stop") // script execution can be stopped with |throw "stop";|
        {
          Components.utils.reportError(ex);
        }
      }
    }
  }
};

// The following line is what XPCOM uses to create components. Each component prototype
// must have a .classID which is used to create it.
/**
* XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
* XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
*/
if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([UserChrome_js]);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule([UserChrome_js]);

