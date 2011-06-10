// ==UserScript==
// @name           downloadSoundPlay.uc
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ダウンロードマネージャー用のダウンロードを監視し音を鳴らす
// @include        main
// @compatibility  Firefox 3.0 more
// @author         Alice0775
// @version        2009/11/28
// ==/UserScript==

var downloadPlaySound = {
  // -- config --
  DL_START : "",
  DL_DONE  : "file:///C:/WINDOWS/Media/chimes.wav",
  DL_CANCEL: "",
  DL_FAILED: "",
  // -- config --

  observerService: null,
  init: function sampleDownload_init() {
    //window.removeEventListener("load", this, false);
    window.addEventListener("unload", this, false);

    //**** ダウンロード監視の追加
    this.observerService = Components.classes["@mozilla.org/observer-service;1"]
                                    .getService(Components.interfaces.nsIObserverService);
    this.observerService.addObserver(this, "dl-start", false);
    this.observerService.addObserver(this, "dl-done", false);
    this.observerService.addObserver(this, "dl-cancel", false);
    this.observerService.addObserver(this, "dl-failed", false);
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    this.observerService.removeObserver(this, "dl-start");
    this.observerService.removeObserver(this, "dl-done");
    this.observerService.removeObserver(this, "dl-cancel");
    this.observerService.removeObserver(this, "dl-failed");
  },

  // ******************************
  // DownloadObserver
  // ******************************
  observe: function (subject, topic, state) {
    var oDownload = subject.QueryInterface(Components.interfaces.nsIDownload);
    //**** ダウンロードファイルを持つオブジェクトを取得
    var oFile = null;
    try{
      oFile = oDownload.targetFile;  // New firefox 0.9+
    } catch (e){
      oFile = oDownload.target;      // Old firefox 0.8
    }
    //**** ダウンロード開始イベント
    if (topic == "dl-start"){
      //alert('Start download to - '+oFile.path);
      if (this.DL_START)
        this.playSoundFile(this.DL_START);
    }
    //**** ダウンロードキャンセルイベント
    if(topic == "dl-cancel"){
      //alert('Canceled download to - '+oFile.path);
      if (this.DL_CANCEL)
        this.playSoundFile(this.DL_CANCEL);
    }
    //**** ダウンロード失敗
    else if(topic == "dl-failed"){
      //alert('Failed download to - '+oFile.path);
      if (this.DL_FAILED)
        this.playSoundFile(this.DL_FAILED);
    }
    //**** ダウンロード完了
    else if(topic == "dl-done"){
      //alert('Done download to - '+oFile.path);
      if (this.DL_DONE)
        this.playSoundFile(this.DL_DONE);
    }
  },

  playSoundFile: function(aFilePath) {
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
              .createInstance(Components.interfaces["nsIIOService"]);
    try {
      var uri = ios.newURI(aFilePath, "UTF-8", null);
    } catch(e) {
      return;
    }
    var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
    if (!file.exists())
      return;

    this.play(uri);
   },

  play: function(aUri) {
    var sound = Components.classes["@mozilla.org/sound;1"]
              .createInstance(Components.interfaces["nsISound"]);
    sound.play(aUri);
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "load":
        this.init();
        break;
      case "unload":
        this.uninit();
        break;
    }
  }
}
//window.addEventListener("load", downloadPlaySound.init, false);
downloadPlaySound.init();
