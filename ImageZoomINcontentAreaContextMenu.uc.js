// ==UserScript==
// @name           ImageZoomINcontentAreaContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    コンテンツエリアコンテキストメニューにImageZoomを追加する
// @include        main
// @compatibility  Firefox 3.0
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        LastMod 2009/02/18 14:00 スタイル幅高さが指定されていても実行できるように
// @Note           Sub-Script/Overlay Loader v3.0.20mod
// @Note           コンテンツエリアのコンテキストメニューにImageZoomを表示. ホイール回転でZoom
// @Note           マウスジェスチャ等から使う場合は, ImageZoomINcontentAreaContextMenu.showHotMenu(event.target, event.screenX, event.screenY);
// ==/UserScript==
// @version        LastMod 2009/01/10 18:20
var ImageZoomINcontentAreaContextMenu = {
  // -- config --
  ZOOMFACTOR_IN_MENU : [4.0, 2.0, 1.5, 1.25, 1.0, 0.75, 0.50, 0.25, 0.10],
  //ホイール回転後メニューを閉じる msec
  DELAY:2000,
  // -- config --

  ImageZoomMenu     : null,
  ImageZoomMenuPopup: null,
  ImageZoomHotMenuPopup: null,
  contexttimer: null,

  init: function() {
    var overlay = ' \
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
        <popup id="contentAreaContextMenu"> \
          <menu id="context-ImageZoomMenu" \
                label="Image Zoom" \
                accesskey="I" \
                insertbefore="context-sep-copyimage" \
                hidden="true"> \
            <menupopup id="context-ImageZoomMenupopup" \
                       onpopupshowing="event.stopPropagation();"> \
              <menuitem label="Zoom In" \
                        accesskey="I;" \
                        oncommand="ImageZoomUtil.zoomBy(1.25);"/> \
              <menuitem label="Zoom Out" \
                        accesskey="O" \
                        oncommand="ImageZoomUtil.zoomBy(0.80);"/> \
              <menuitem label="Reset" \
                        accesskey="R" \
                        oncommand="ImageZoomUtil.reset();"/> \
              <menuseparator/> \
            </menupopup> \
          </menu> \
        </popup> \
      </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, ImageZoomINcontentAreaContextMenu);
  },

  observe: function(){
    window.addEventListener("unload", this, false);
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this, false);
    this.ImageZoomMenu = document.getElementById("context-ImageZoomMenu");
    this.ImageZoomMenu.addEventListener("DOMMouseScroll", this, false);
    this.ImageZoomMenu.addEventListener("click", this, false);
    this.ImageZoomMenuPopup = document.getElementById("context-ImageZoomMenupopup");
    this.ImageZoomMenuPopup.addEventListener("DOMMouseScroll", this, true);
  },

  uninit: function() {
    if (this.contexttimer)
      clearTimeout(this.contexttimer);
    window.removeEventListener("unload", this, false);
    document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
    this.ImageZoomMenu.removeEventListener("DOMMouseScroll", this, false);
    this.ImageZoomMenu.removeEventListener("click", this, false);
    this.ImageZoomMenuPopup.removeEventListener("DOMMouseScroll", this, true);
    if (this.ImageZoomHotMenuPopup) {
      this.ImageZoomHotMenuPopup.removeEventListener("DOMMouseScroll", this, true);
      this.ImageZoomHotMenuPopup.removeEventListener("popuphidden", this, false);
    }
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case 'unload':
        this.uninit();
        break;
      case 'popupshowing':
        this.popupshowing();
        break;
      case 'popuphidden':
        this.popuphidden();
        break;
      case 'DOMMouseScroll':
        if (aEvent.originalTarget == this.ImageZoomMenu){
          var popup = this.ImageZoomMenu.firstChild;
          popup.showPopup();
        } else {
          var popup = aEvent.originalTarget.parentNode;
        }
        this.wheelOnImageZoomMenu(popup, aEvent);
        break;
      case 'click':
        this.clickMenu(aEvent);
        break;
    }
  },

  popupshowing: function(){
    if (this.contexttimer)
      clearTimeout(this.contexttimer);
    var popup = this.ImageZoomMenuPopup;
     if (gContextMenu && gContextMenu.onImage) {
      popup.parentNode.removeAttribute('hidden');
      this.createImageZoomMenu(popup);
    } else {
      popup.parentNode.setAttribute('hidden', true);
    }
  },

  popuphidden: function(){
    //Reset for hotmenu
    ImageZoomUtil._target = null;
    ImageZoomUtil._onImage = false;
  },

  clickMenu: function(event){
    if (event.button == 1){
    ImageZoomUtil.reset();
    if (this.contexttimer)
      clearTimeout(this.contexttimer);
      document.getElementById("contentAreaContextMenu").hidePopup();
    }
  },

  createImageZoomMenu: function(popup) {
    for (var i = popup.childNodes.length - 1; i >= 4; i--) {
      popup.removeChild(popup.lastChild);
    }

    var currentZoom = ImageZoomUtil.getZoomFactor();
    var arr =[], flg = false;
    for (var i = 0; i < this.ZOOMFACTOR_IN_MENU.length; i++) {
      if (currentZoom == this.ZOOMFACTOR_IN_MENU[i])
        flg = true;
      if (!flg && currentZoom > this.ZOOMFACTOR_IN_MENU[i]) {
        arr.push(currentZoom);
        flg = true;
      }
      arr.push(this.ZOOMFACTOR_IN_MENU[i]);
    }
    if (!flg)
      arr.push(currentZoom);

    var zoom;
    for (var i = 0; i < arr.length; i++) {
      zoom = arr[i];
      menuitem = document.createElement("menuitem");
      menuitem.setAttribute('type', 'checkbox');
      menuitem.setAttribute('label', zoom * 100 + '%');
      menuitem.setAttribute('class', 'menu-iconic');
      menuitem.setAttribute('oncommand', 'ImageZoomUtil.zoomTo(' + zoom + ');');
      if (currentZoom == zoom)
        menuitem.setAttribute('checked', true);

      popup.appendChild(menuitem);
    }
    return popup;
  },

  showHotMenu: function(node, x, y){
    if (!(node instanceof HTMLImageElement ||  node.nodeName.match(/img/i)))
      return;

    ImageZoomUtil._target = node;
    ImageZoomUtil._onImage = true;

    var popupset = document.getElementById("mainPopupSet");
    if (this.ImageZoomHotMenuPopup) {
      this.ImageZoomHotMenuPopup.removeEventListener("DOMMouseScroll", this, true);
      this.ImageZoomHotMenuPopup.removeEventListener("popuphidden", this, false);
      popupset.removeChild(this.ImageZoomHotMenuPopup);
    }

    var popup = this.createImageZoomMenu(this.ImageZoomMenuPopup);
    popup = popup.cloneNode(true);
    popup.removeAttribute("id");

    this.ImageZoomHotMenuPopup = popupset.appendChild(popup);
    this.ImageZoomHotMenuPopup.addEventListener("DOMMouseScroll", this, true);
    this.ImageZoomHotMenuPopup.addEventListener("popuphidden", this, false);
    this.ImageZoomHotMenuPopup.showPopup(getBrowser(), x, y, "context","bottomleft","topleft");
  },

  wheelOnImageZoomMenu: function(popup, aEvent) {

    var j =4;
    for (var i = 4; i < popup.childNodes.length; i++) {
      if (popup.childNodes[i].localName == 'menuseparator')
        continue;

      if (popup.childNodes[i].hasAttribute("checked") &&
          popup.childNodes[i].getAttribute("checked")) {
        var j = i;
      }
    }

    var num = ( aEvent.detail > 0) ? j + 1 : j - 1;

    /* ループする
    if (num >= popup.childNodes.length)
      num = 4;
    else if (num < 4)
      num = popup.childNodes.length - 1;
    */
    /* ループしない */

    if (num >= popup.childNodes.length ||
        num < 4)
      return;
    if (popup.childNodes[num].localName == 'menuseparator')
      num = ( aEvent.detail > 0) ? ++num : --num;

    popup.childNodes[j].removeAttribute("checked")
    popup.childNodes[num].setAttribute("checked", true)

    eval(popup.childNodes[num].getAttribute("oncommand"));
    if (this.contexttimer)
      clearTimeout(this.contexttimer);
    this.contexttimer = setTimeout(function(self){
      document.getElementById("contentAreaContextMenu").hidePopup();
    }, this.DELAY , this);
  }
};


ImageZoomINcontentAreaContextMenu.init();

var ImageZoomUtil = {
  _target: null,
  _onImage: false,

  get target() {
    return (gContextMenu) ? gContextMenu.target : this._target;
  },

  get onImage() {
     return (gContextMenu) ? gContextMenu.onImage : this._onImage;
  },

  getZoomFactor: function() {
    var node = this.target;
    if (!(node instanceof HTMLImageElement ||  node.nodeName.match(/img/i)))
      return 1;
    if (!node.hasAttribute("originalWidth")) {
      node.setAttribute("originalWidth", node.width);
      node.setAttribute("originalHeight", node.height);
      node.style.removeProperty("width");
      node.style.removeProperty("height");
      //node.style.width = "";
      //node.style.height = "";
    }
    var w0 = node.getAttribute("originalWidth");
    var h0 = node.getAttribute("originalHeight");
    var w = node.width;
    var h = node.height;
    var zoomW = Math.ceil(((w0 > 0) ? w / w0 : 1) * 100) / 100;
    //var zoomH = Math.ceil(((h0 > 0) ? h / h0 : 1) * 100) / 100;
    return zoomW;
  },

  zoomTo: function(zoom, node) {
    node = node || this.target;
    if (!(node instanceof HTMLImageElement ||  node.nodeName.match(/img/i)))
      return;
    if (!node.hasAttribute("originalWidth")) {
      node.setAttribute("originalWidth", node.width);
      node.setAttribute("originalHeight", node.height);
    }
    var w = node.getAttribute("originalWidth");
    var h = node.getAttribute("originalHeight");
    node.width  = w * zoom;
    node.height = h * zoom;
  },

  zoomBy: function(zoom, node) {
    node = node || this.target;
    if (!(node instanceof HTMLImageElement ||  node.nodeName.match(/img/i)))
      return;
    if (!node.hasAttribute("originalWidth")) {
      node.setAttribute("originalWidth", node.width);
      node.setAttribute("originalHeight", node.height);
    }
    var w = node.width;
    var h = node.height;
    node.width  = w * zoom;
    node.height = h * zoom;
  },

  reset: function(node) {
    node = node || this.target;
    if (!(node instanceof HTMLImageElement ||  node.nodeName.match(/img/i)))
      return;
    if (node.hasAttribute("originalWidth")) {
      node.width  = node.getAttribute("originalWidth");
      node.height = node.getAttribute("originalHeight");
    }
  }
}
