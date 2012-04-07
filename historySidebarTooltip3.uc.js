// ==UserScript==
// @name           historySidebarTooltip3.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    サイドバーの履歴にマウスオーバーするとすぐにタブタイトルをポップアップする。
// @include        chrome://browser/content/history/history-panel.xul
// @compatibility  Firefox 3.0 12.0
// @author         Alice0775
// @version        2012/04/07 20:00  Ez Sidebar 4.0.2012040701 対応
// @version        2012/01/04 00:00  Bug fix for 2011/12/22
// @version        2011/12/22 15:00  11.0 12.0 bhTooltip を hidden にしないとダメになった8Bug 703210 - tooltip is not shown if stopPropagation() of mousemove event is called)
// ==/UserScript==
// @version        2009/10/02 22:00  Bug 498130 -  Reduce places-views overhead.
// @version        2009/09/12 11:00  Bug 516088 -  blank tooltip displayed in empty area of bookmark sidebar
// @version        2009/03/05 11:00  Bug 452979 -  Invisible control characters in URL MUST NOT be decoded when showing its address
// @version        2009/02/27 16:00 ステータスバー表示が壊れていたのを修正
// @version        2009/01/04 16:00 bookmarksHistoryPanel.uc.xulに対応
// @version        2007/10/23 00:00
// @Note
var historySidebarTooltip = {
  _lastTarget: null,

  get tooltip(){
    return document.getElementById('Sidebarhistory_bpTooltip');
  },

  get tooltipName(){
    return document.getElementById('Sidebarhistory_bpNameValue');
  },

  get tooltipURL(){
    return document.getElementById('Sidebarhistory_bpURLValue');
  },

  onLoad: function() {
    const kXULNS =
         "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var tooltip = document.createElementNS(kXULNS,"tooltip");
    tooltip.setAttribute('id',"Sidebarhistory_bpTooltip");
    tooltip.setAttribute('noautohide',"true");
    tooltip.setAttribute('orient',"vertical");
    var historypanel = document.getElementById("historyTree").parentNode;
    historypanel.appendChild(tooltip);

    var vbox = document.createElementNS(kXULNS,"vbox");
    tooltip.appendChild(vbox);

    var label = document.createElementNS(kXULNS,"label");
    label.setAttribute('id',"Sidebarhistory_bpNameValue");
    vbox.appendChild(label);

    label = document.createElementNS(kXULNS,"description");
    label.setAttribute('id',"Sidebarhistory_bpURLValue");
    vbox.appendChild(label);

    // initialization code
    this._lastTarget = null;
    var tree = this._tree = document.getElementById("historyTree");
    tree.addEventListener("mousemove", this, true);
    tree.addEventListener("DOMAttrModified", this, false);
    tree.addEventListener("mouseout", this, false);
    tree.addEventListener("mousedown", this, false);
    window.addEventListener("unload", this, false);
    if (window.location.href == "chrome://browser/content/history/history-panel.xul")
      document.getElementById("bhTooltip").hidden = true;
    //Ez Sidebar 4.0.2012040701 対応
    this.tooltip.addEventListener("popuphiding", this, true);
  },

  onUnload: function() {
    var tree = document.getElementById("historyTree");
    tree.addEventListener("mousemove", this, true);
    tree.addEventListener("DOMAttrModified", this, false);
    tree.addEventListener("mouseout", this, false);
    tree.addEventListener("mousedown", this, false);
    window.removeEventListener("unload", this, false);
    this.tooltip.removeEventListener("popuphiding", this, true);
  },

  handleEvent: function(event){
    switch(event.type){
      case 'unload':
        this.onUnload(event);
        break;
      case 'mousemove':
        this.mouseMove(event);
        break;
      case 'DOMAttrModified':
      case 'mouseout':
      case 'mousedown':
        this.hide(event);
        break;
      case 'popuphiding':
        event.stopPropagation();
        break;
    }
  },

  mouseMove: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var tbo = this._tree.treeBoxObject;
    var row = {}, col = {}, obj = {};
    tbo.getCellAt(e.clientX, e.clientY, row, col, obj);
    if (row.value == -1) {
      this.hide();
      return;
    }

    var aTooltip = this.tooltip;
    if(this.Sidebarhistory_fillInBPTooltip(e, aTooltip)){
      if (typeof SidebarUtils != 'undefined')
        SidebarUtils.handleTreeMouseMove(e);
      else if (typeof PanelSidebarUtils != 'undefined')
        PanelSidebarUtils.handleTreeMouseMove(e);
      aTooltip.hidePopup();
      this.show(e,'Sidebarhistory_bpTooltip','tooltip');
    }
  },

  show: function(event, eltid, type) {
    document.getElementById(eltid)
    .showPopup(event.target, event.screenX+20, event.screenY, type, 'bottomleft', 'topleft');
  },

  hide: function() {
    this._lastTarget = null;
    this.tooltip.hidePopup();
  },

  decode: function decode(value){
    var pref = Components.classes["@mozilla.org/preferences-service;1"]
                                 .getService(Components.interfaces.nsIPrefBranch);
    /*
    if (!pref.getBoolPref("network.standard-url.encode-utf8"))
      return value;
    */
    // Try to decode as UTF-8 if there's no encoding sequence that we would break.
    if (!/%25(?:3B|2F|3F|3A|40|26|3D|2B|24|2C|23)/i.test(value))
      try {
        value = decodeURI(value)
                  // 1. decodeURI decodes %25 to %, which creates unintended
                  //    encoding sequences. Re-encode it, unless it's part of
                  //    a sequence that survived decodeURI, i.e. one for:
                  //    ';', '/', '?', ':', '@', '&', '=', '+', '$', ',', '#'
                  //    (RFC 3987 section 3.2)
                  // 2. Re-encode whitespace so that it doesn't get eaten away
                  //    by the location bar (bug 410726).
                  .replace(/%(?!3B|2F|3F|3A|40|26|3D|2B|24|2C|23)|[\r\n\t]/ig,
                           encodeURIComponent);
      } catch (e) {}

    // Encode invisible characters (soft hyphen, zero-width space, BOM,
    // line and paragraph separator, word joiner, invisible times,
    // invisible separator, object replacement character) (bug 452979)
    value = value.replace(/[\v\x0c\x1c\x1d\x1e\x1f\u00ad\u200b\ufeff\u2028\u2029\u2060\u2062\u2063\ufffc]/g,
                          encodeURIComponent);

    // Encode bidirectional formatting characters.
    // (RFC 3987 sections 3.2 and 4.1 paragraph 6)
    value = value.replace(/[\u200e\u200f\u202a\u202b\u202c\u202d\u202e]/g,
                          encodeURIComponent);
    return value;
  },

  /* * * * * * * * * * rich tooltips * * * * * * * * * */
  Sidebarhistory_fillInBPTooltip: function(event, aTooltip) {
    gHistoryTree =  document.getElementById("historyTree");
    var row = {}, col = {}, part = {};
    gHistoryTree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, part);
    if (row.value < 0 || !col.value) return false;
    var currentIndex = row.value;

    if(this._lastTarget == currentIndex) return false;
    this._lastTarget = currentIndex;

    var node = gHistoryTree.view.nodeForTreeIndex(currentIndex);
    //var node = gHistoryTree.getResultView().nodeForTreeIndex(currentIndex);
    if (node) {
      var url = node.uri;
      var Name = node.title;
    }

    aTooltip.removeAttribute("height");
    aTooltip.removeAttribute("width");


    /* history name */
    if (Name) {
      this.tooltipName.setAttribute('value', Name);
      this.tooltipName.removeAttribute('hidden');
    }else{
      this.tooltipName.setAttribute('value','');
      this.tooltipName.setAttribute('hidden','true');
    }
    /* history URL */
    if (url && !gHistoryTree.treeBoxObject.view.isContainer(currentIndex)) {
     /*
      var len = jstrlen(Name)
      if(jstrlen(url) > len){
        if(len < 30) len = 30
         url = url.substr(0,len-3)+'...';
      }
      */
      var textNode = document.createTextNode(historySidebarTooltip.decode(url));
      var node = this.tooltipURL;
      while(node.lastChild)
        node.removeChild(node.lastChild);
      node.appendChild(textNode);
      node.removeAttribute('hidden');
    }else{
      var node = this.tooltipURL;
      node.setAttribute('hidden','true');
    }

    /* correct the tootip's dimensions */
    //aTooltip.sizeTo(aTooltip.boxObject.width, aTooltip.boxObject.height);

    function jstrlen(str) {
      var len = 0;
      str = escape(str);
      for (var i = 0; i < str.length; i++, len++) {
        if (str.charAt(i) != "%")
      continue;
        if (str.charAt(++i) == "u") {
          i += 3;
          len++;
        }
        i++;
      }
      return len;
    }

    function getVer(){
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
      // このコードを実行しているアプリケーションの名前を取得する
      // this.debug(info.name); // Firefox では "Firefox" が返る
      // this.debug(info.version.substr(0,3));// info.version:バージョン 2.0.0.1 では "2.0.0.1" が
      var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
      return ver;
    }

    return true; // show tooltip
  }

};
if (location.href == 'chrome://browser/content/history/history-panel.xul')
  historySidebarTooltip.onLoad();
//window.addEventListener("load", function(e) { historySidebarTooltip.onLoad(); }, false);
