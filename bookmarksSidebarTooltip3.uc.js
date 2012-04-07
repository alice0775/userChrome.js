// ==UserScript==
// @name           bookmarksSidebarTooltip3.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    サイドバーのブックマークにマウスオーバーするとすぐにタブタイトルをポップアップする。
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @compatibility  Firefox 3.0 12.0
// @author         Alice0775
// @Note
// @version        2012/04/07 20:00  Ez Sidebar 4.0.2012040701 対応
// @version        2012/01/04 00:00  Bug fix for 2011/12/22
// @version        2011/12/22 15:00  11.0 12.0 bhTooltip を hidden にしないとダメになった8Bug 703210 - tooltip is not shown if stopPropagation() of mousemove event is called)
// ==/UserScript==
// @version        2009/11/19 13:00  annotation取得で例外出るのでgetConcreteItemIdを使うようにした
// @version        2009/10/02 22:00  Bug 498130 -  Reduce places-views overhead.
// @version        2009/09/12 11:00  Bug 516088 -  blank tooltip displayed in empty area of bookmark sidebar
// @version        2009/03/05 11:00  Bug 452979 -  Invisible control characters in URL MUST NOT be decoded when showing its address
// @version        2009/02/27 16:00 ステータスバー表示が壊れていたのを修正
// @version        2009/01/04 16:00 bookmarksHistoryPanel.uc.xulに対応
// @version        2007/11/17 14:00 説明表示
// @version        2007/10/23 00:00 Placesに対応
var bookmarkSidebarTooltip = {
  // --- config ---
  NAME:true,        //名称表示
  URL:true,         //URL表示
  DESCRIPTION:true, //説明表示
  // --- config ---
  _lastTarget: null,

  get tooltip(){
    return document.getElementById('SidebarBookmark_bpTooltip');
  },

  get tooltipName(){
    return document.getElementById('SidebarBookmark_bpNameValue');
  },

  get tooltipURL(){
    return document.getElementById('SidebarBookmark_bpURLValue');
  },

  get tooltipDescription(){
    return document.getElementById('SidebarBookmark_bpDescriptionValue');
  },

  _tree: null,
  onLoad: function() {
    const kXULNS =
         "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var tooltip = document.createElementNS(kXULNS,"tooltip");
    tooltip.setAttribute('id',"SidebarBookmark_bpTooltip");
    tooltip.setAttribute('noautohide',"true");
    tooltip.setAttribute('orient',"vertical");
    var bookmarksPanel = document.getElementById("bookmarks-view").parentNode;
    bookmarksPanel.appendChild(tooltip);
    var vbox = document.createElementNS(kXULNS,"vbox");
    tooltip.appendChild(vbox);
    var label = document.createElementNS(kXULNS,"label");
    label.setAttribute('id',"SidebarBookmark_bpNameValue");
    vbox.appendChild(label);
    label = document.createElementNS(kXULNS,"description");
    label.setAttribute('id',"SidebarBookmark_bpURLValue");
    vbox.appendChild(label);
    label = document.createElementNS(kXULNS,"description");
    label.setAttribute('id',"SidebarBookmark_bpDescriptionValue");
    vbox.appendChild(label);

    // initialization code
    this._lastTarget = null;
    this._tree = document.getElementById("bookmarks-view");
    this._tree.addEventListener("mousemove", this, true);
    this._tree.addEventListener("DOMAttrModified", this, false);
    this._tree.addEventListener("mouseout", this, false);
    this._tree.addEventListener("mousedown", this, false);
    window.addEventListener("unload", this, false);
    if (window.location.href == "chrome://browser/content/bookmarks/bookmarksPanel.xul")
      document.getElementById("bhTooltip").hidden = true;
    //Ez Sidebar 4.0.2012040701 対応
    this.tooltip.addEventListener("popuphiding", this, true);
  },

  onUnload: function() {
    this._tree.removeEventListener("mousemove", this, true);
    this._tree.removeEventListener("DOMAttrModified", this, false);
    this._tree.removeEventListener("mouseout", this, false);
    this._tree.removeEventListener("mousedown", this, false);
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
    if(this.SidebarBookmark_fillInBPTooltip(e, aTooltip)){
      if (typeof SidebarUtils != 'undefined')
        SidebarUtils.handleTreeMouseMove(e);
      else if (typeof PanelSidebarUtils != 'undefined')
        PanelSidebarUtils.handleTreeMouseMove(e);
      aTooltip.hidePopup();

      this.show(e,'SidebarBookmark_bpTooltip','tooltip');
    }
  },

  show: function(event, eltid, type) {
    document.getElementById(eltid)
    .showPopup(event.target, event.screenX+20, event.screenY, type, 'bottomleft', 'topleft');
  },

  hide: function() {
    this._lastTarget = null;
    var tooltip = this.tooltip;
    try {
      tooltip.hidePopup();
    } catch(e){}
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
  SidebarBookmark_fillInBPTooltip: function(event, aTooltip) {
    var row = {}, col = {}, part = {};
    this._tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, part);
    if (row.value < 0 || !col.value) return false;
    var currentIndex = row.value;

    if(this._lastTarget  == currentIndex  ) return false;
    this._lastTarget = currentIndex;

    var node = this._tree.view.nodeForTreeIndex(currentIndex);
    //var node = this._tree.getResultView().nodeForTreeIndex(currentIndex);
    var url = null;
    var Name = null;
    var Description = null;
    if (node) {
      url = node.uri;
      Name = node.title;
      var info = {
        action: "edit",
        type: "bookmark",
        bookmarkId: PlacesUtils.getConcreteItemId(node)
      };
      const DESCRIPTION_ANNO = "bookmarkProperties/description";
      const annos = PlacesUtils.annotations;
      var itemId = info.bookmarkId;
      Description = PlacesUIUtils.getItemDescription(itemId);
    }
    //mmm....
    if(Description)
      Description = (Description.indexOf("error null")<0) ? Description : "";

    aTooltip.removeAttribute("height");
    aTooltip.removeAttribute("width");


    if (this._tree.treeBoxObject.view.isSeparator(currentIndex)) {
      var node = this.tooltipName;
      node.setAttribute('value','');
      node.setAttribute('hidden','true');
      node = document.getElementById("SidebarBookmark_bpURLValue");
      node.setAttribute('hidden','true');
      node = document.getElementById("SidebarBookmark_bpDescriptionValue");
      node.setAttribute('hidden','true');
      this.hide();
      return false;
    }

    /* bookmark name */
    if (this.NAME && Name) {
      this.tooltipName.setAttribute('value',Name);
      this.tooltipName.removeAttribute('hidden');

    }else{
      this.tooltipName.setAttribute('value','');
      this.tooltipName.setAttribute('hidden','true');
    }
    /* bookmark URL */
    if (this.URL && url && !this._tree.treeBoxObject.view.isContainer(currentIndex)) {
      var textNode = document.createTextNode(bookmarkSidebarTooltip.decode(url));
      var node = this.tooltipURL;
      while(node.lastChild)
        node.removeChild(node.lastChild);
      node.appendChild(textNode);
      node.removeAttribute('hidden');
    }else{
      var node = this.tooltipURL;
      node.setAttribute('hidden','true');
    }
    /* bookmark Description */
    if (this.DESCRIPTION && Description && !this._tree.treeBoxObject.view.isContainer(currentIndex)) {
      var textNode = document.createTextNode(Description);
      var node = this.tooltipDescription;
      while(node.lastChild)
        node.removeChild(node.lastChild);
      node.appendChild(textNode);
      node.removeAttribute('hidden');
    }else{
      var node = this.tooltipDescription;
      node.setAttribute('hidden','true');
    }

    /* correct the tootip's dimensions */
    //aTooltip.sizeTo(aTooltip.boxObject.width, aTooltip.boxObject.height);
    return true; // show tooltip
  },

  getVer:function (){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
    return ver;
  },

  debug: function(aMsg){
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    Cc["@mozilla.org/consoleservice;1"]
      .getService(Ci.nsIConsoleService)
      .logStringMessage(aMsg);
  }
};
if (location.href == 'chrome://browser/content/bookmarks/bookmarksPanel.xul')
  bookmarkSidebarTooltip.onLoad();


