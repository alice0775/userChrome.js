// ==UserScript==
// @name           ZZZ_SidebarMenuINcontentAreaContextMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    コンテンツエリアコンテキストメニューにサイドバー・メニューを追加する
// @include        main
// @compatibility  Firefox 3.0 3.1b3pre 3.2a1pre
// @author         otokiti
// @contributor    Alice0775
// @version        2009/02/06 sidebarbutton_2.0.6.uc.js 対応
// @version        2009/01/09 18:30 fix bug
// @version        2009/01/09 14:00
// @Note           コンテンツエリアのコンテキストメニューにサイドバーメニューを表示. ホイールクリックでサイドバートグル, ホイール回転でサイドバー選択
// @Note           マウスジェスチャ等から使う場合は, ZZZ_SidebarMenuINcontentAreaContextMenu.showHotMenu(event.screenX, event.screenY);
// ==/UserScript==
var ZZZ_SidebarMenuINcontentAreaContextMenu = {
  // -- config --
  //コンテンツエリアコンテキストメニューに挿入する位置(このidを持つメニューアイテムの前に挿入される)
  INSERT_POINT : "context-back",
  //ホイール回転後に自動的にサイドバーを開くmsec
  DELAY:800,
  // -- config --

  sidebarTitle: null,
  sidebarMenu: null,
  sidebarMenuPopup: null,
  popupSidebarMenu: null,
  timer: null,
  contexttimer: null,
  contentAreaContextMenu: null,

  init: function() {
    window.addEventListener("unload", this, false);
    this.sidebarTitle = document.getElementById("sidebar-title");

    this.createSidebarMenu();
    this.contentAreaContextMenu = document.getElementById("contentAreaContextMenu");
    this.contentAreaContextMenu.addEventListener("popupshowing", this, false);
    this.sidebarMenu.addEventListener("DOMMouseScroll", this, false);
    this.sidebarMenu.addEventListener("click", this, false);
    this.sidebarMenuPopup.addEventListener("DOMMouseScroll", this, true);
    this.sidebarMenuPopup.setAttribute('onpopupshowing', "ZZZ_SidebarMenuINcontentAreaContextMenu.handleEvent(event);")
  },

  uninit: function() {
    if (this.timer)
      clearTimeout(this.timer);
    if (this.contexttimer)
      clearTimeout(this.contexttimer);
    window.removeEventListener("unload", this, false);
    document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
    this.sidebarMenu.removeEventListener("DOMMouseScroll", this, false);
    this.sidebarMenu.removeEventListener("click", this, false);
    this.sidebarMenuPopup.removeEventListener("DOMMouseScroll", this, true);
    if (this.popupSidebarMenu)
      this.popupSidebarMenu.removeEventListener("DOMMouseScroll", this, true);
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case 'unload':
        this.uninit();
        break;
      case 'popupshowing':
        if (aEvent.target == this.contentAreaContextMenu) {
          this.updateMenuLabel();
        } else if (aEvent.target == this.sidebarMenuPopup ||
                   aEvent.target == this.popupSidebarMenu){
          var targetpupup = aEvent.target;
          while (targetpupup.lastChild)
            targetpupup.removeChild(targetpupup.lastChild);
          var menuipopup = document.getElementById("viewSidebarMenu");
          for (var i = 0, len = menuipopup.childNodes.length; i < len; i++){
            var menuitem = menuipopup.childNodes[i].cloneNode(true);
            if (menuitem.hasAttribute('id'))
              menuitem.removeAttribute('id');
            targetpupup.appendChild(menuitem);
          }
        }
        break;
      case 'DOMMouseScroll':
        if (aEvent.originalTarget.firstChild == this.sidebarMenuPopup){
          var popup = this.sidebarMenuPopup;
          popup.showPopup();
        } else
          var popup = aEvent.originalTarget.parentNode;
        this.wheelOnSidebarMenu(popup, aEvent);
        break;
      case 'click':
        this.clickMenu(aEvent);
        break;
    }
  },

  updateMenuLabel: function(){
    if (this.contexttimer)
      clearTimeout(this.contexttimer);
    this.sidebarMenu.setAttribute('label', "Sidebar: " + this.getSidebarTitleFromMenuLabel());
  },

  clickMenu: function(event){
    if (event.button == 1){
      if (this.timer)
        clearTimeout(this.timer);
      toggleSidebar(this.getSidebarcommand());
    if (this.contexttimer)
      clearTimeout(this.contexttimer);
      document.getElementById("contentAreaContextMenu").hidePopup();
    }
  },

  createSidebarMenu: function() {
    this.sidebarMenu = document.createElement("menu");
    this.sidebarMenu.setAttribute('id','context-sidebarMenu');
    this.sidebarMenu.setAttribute('class', 'menu-iconic');
    this.sidebarMenu.setAttribute('accesskey',"S");
    this.sidebarMenu.setAttribute('label',"Sidebar:" + this.sidebarTitle.value);
    this.sidebarMenuPopup = document.createElement("menupopup");
    this.sidebarMenu.appendChild(this.sidebarMenuPopup);

    var popup = document.getElementById("contentAreaContextMenu");
    var refItem = document.getElementById(this.INSERT_POINT);
    popup.insertBefore(this.sidebarMenu, refItem);
  },


  showHotMenu: function(x, y){
    if (!this.popupSidebarMenu){
      this.popupSidebarMenu = this.sidebarMenuPopup.cloneNode(true);
      var popupset = document.getElementById("mainPopupSet");
      popupset.appendChild(this.popupSidebarMenu);
      this.popupSidebarMenu.addEventListener("DOMMouseScroll", this, true);
    }
    this.popupSidebarMenu.showPopup(getBrowser(), x, y, "context","bottomleft","topleft");
  },

  wheelOnSidebarMenu: function(popup, aEvent) {
    var num = 0, prev = 0;
    for (var i = 0; i < popup.childNodes.length; i++) {
      if (popup.childNodes[i].getAttribute("checked")) {
        prev = i;
        num = ( aEvent.detail > 0) ? ++i : --i;
        while (num >= 0 && num < popup.childNodes.length &&
               popup.childNodes[num].localName == 'menuseparator')
          num = ( aEvent.detail > 0) ? ++num : --num;
        break;
      }
    }

    /* ループする
    if (num >= this.sidebarMenuPopup.childNodes.length)
      num = 0;
    else if (num < 0)
      num = this.sidebarMenuPopup.childNodes.length - 1;
    */

    /* ループしない */
    if (num >= popup.childNodes.length ||
        num < 0)
      return;

    this.sidebarMenu.setAttribute('label', "Sidebar: " + popup.childNodes[num].label);
    if (popup.childNodes[prev].hasAttribute("checked"))
      popup.childNodes[prev].removeAttribute("checked")
    popup.childNodes[num].setAttribute("checked", true)

    if (this.timer)
      clearTimeout(this.timer);
    if (this.DELAY >= 0)
      this.timer = setTimeout(function(self){
        toggleSidebar(popup.childNodes[num].getAttribute("observes"), true);
        if (self.contexttimer)
          clearTimeout(self.contexttimer);
        self.contexttimer = setTimeout(function(self){
          popup.hidePopup();
          document.getElementById("contentAreaContextMenu").hidePopup();
        }, self.DELAY , self);
      }, this.DELAY, this);
  },

  getSidebarTitleFromMenuLabel: function() {
    var num = 0;
    var menupopup = document.getElementById("viewSidebarMenu");
    for (var i = 0; i < menupopup.childNodes.length; i++) {
      if (menupopup.childNodes[i].getAttribute("checked")) {
        num = i;
        break;
      }
    }
    var label = "default";
    if (typeof menupopup.childNodes[num].label != 'undefined')
      label = menupopup.childNodes[num].label
    return label;
  },

  getSidebarcommand: function() {
    for (var i = 0; i < this.sidebarMenuPopup.childNodes.length; i++) {
      if (this.sidebarMenuPopup.childNodes[i].getAttribute("checked")) {
        return this.sidebarMenuPopup.childNodes[i].observes;
      }
    }

    var sidebar_box = document.getElementById('sidebar-box');
    var _command = sidebar_box.getAttribute('sidebarcommand');
    if(_command)
      return _command;

    return this.sidebarMenuPopup.childNodes[0].observes;
  }
};


ZZZ_SidebarMenuINcontentAreaContextMenu.init();