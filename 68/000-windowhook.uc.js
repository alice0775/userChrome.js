// ==UserScript==
// @name           WindowHook
// @namespace      http://forums.mozillazine.org/
// @description
// @include        main
// ==/UserScript==
/* :::::::: WindowHook ::::::::::::::: */

var WindowHook = {
  observe: function(aSubject, aTopic, aData)
  {
    if (!aSubject._WindowHook)
    {
      aSubject._WindowHook = this;
      aSubject.addEventListener("load", this.onLoad_window, false);
    }
  },

  onLoad_window: function()
  {
    this.removeEventListener("load", this._WindowHook.onLoad_window, false);
    var funcs = this._WindowHook.mFuncs[this.document.location.href] || null;
    if (funcs)
    {
      funcs.forEach(function(aFunc) { aFunc(this); }, this);
    }
    delete this._WindowHook;
  },

  register: function(aURL, aFunc)
  {
    if (!this.mFuncs)
    {
      this.mFuncs = {};
      Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService).addObserver(this, "domwindowopened", false);
    }
    if (!this.mFuncs[aURL])
    {
      this.mFuncs[aURL] = [];
    }
    this.mFuncs[aURL].push(aFunc);
  }

};
window.addEventListener("unload",function() {
  try{
    Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService).removeObserver(WindowHook, "domwindowopened");
  }catch(e){}
  try{
    delete WindowHook.register;
    delete WindowHook.onLoad_window;
    delete WindowHook.observe;
    delete WindowHook.mFuncs;
  }catch(e){}
},false);

