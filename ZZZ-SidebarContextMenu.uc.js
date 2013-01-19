// ==UserScript==
// @name           ZZZ-SidebarContextMenu.uc.js
// @namespace      http://forums.mozillazine.org/viewtopic.php?t=397735
// @description    サイドバーコンテキストメニューを追加
// @include        main
// @compatibility  Firefox 2.0 3.0 3.1 3.2
// @modified by    Alice0775
// @version        2013/01/16 12:00 Bug 831008 Disable Mutation Events in chrome/XUL
// @version        2009/02/06 sidebarbutton_2.0.6.uc.js 対応
// @version        LastMod 2007/08/31 17:30
// @Note
// ==/UserScript==
var ZZZ_SidebarContextMenu ={
  // -- config --
  //ホイール回転後に自動的にサイドバーを開くmsec
  DELAY:800,
  // -- config --

  sidebarMenu: null,
  sidebarMenuPopup: null,
  sidebarHeader: null,
  sidebarTitle: null,
  timer: null,
  contexttimer: null,

  init: function() {
    window.addEventListener("unload", this, false);

    this.sidebarMenuPopup = document.getElementById("viewSidebarMenu").cloneNode(true);
    if (this.sidebarMenuPopup.hasAttribute('id'))
      this.sidebarMenuPopup.removeAttribute('id');

    this.sidebarTitle = document.getElementById("sidebar-title");
    this.sidebarTitle.setAttribute("hidden", "true");

    this.sidebarHeader = this.sidebarTitle.parentNode;
    this.sidebarHeader.id = 'sidebar-header';

    this.createSidebarMenu();
    this.sidebarMenu.addEventListener("DOMMouseScroll", this, false);
    this.sidebarMenuPopup.addEventListener("DOMMouseScroll", this, true);
    this.sidebarMenuPopup.setAttribute('onpopupshowing', "ZZZ_SidebarContextMenu.handleEvent(event);")
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    this.sidebarMenu.removeEventListener("DOMMouseScroll", this, false);
    this.sidebarMenuPopup.removeEventListener("DOMMouseScroll", this, true);
    var label = document.getElementById("sidebarMenuButtonlabel");
    // later, you can stop observing
    this.observer.disconnect(); 
  },

  handleEvent: function(aEvent) {
    switch(aEvent.type) {
      case 'unload':
        this.uninit();
        break;
      case 'DOMMouseScroll':
        this.wheelOnSidebarMenu(aEvent);
        break;
      case 'popupshowing':
        if (aEvent.target == this.sidebarMenuPopup){
          while (this.sidebarMenuPopup.lastChild)
            this.sidebarMenuPopup.removeChild(this.sidebarMenuPopup.lastChild);
          var menuipopup = document.getElementById("viewSidebarMenu")
          for (var i = 0, len = menuipopup.childNodes.length; i < len; i++){
            var menuitem = menuipopup.childNodes[i].cloneNode(true);
            if (menuitem.hasAttribute('id'))
              menuitem.removeAttribute('id');
            this.sidebarMenuPopup.appendChild(menuitem);
          }
        }
        break;
    }
  },

  createSidebarMenu: function() {

    var menu = document.createElement("toolbarbutton");
    menu.setAttribute("type", "menu");
    menu.setAttribute("id", "sidebarMenuButton");
    menu.setAttribute("persist", "label");
    menu.setAttribute("flex", "1");
    menu.setAttribute("align", "left");
    menu.setAttribute("label", this.sidebarTitle.value);
  
    // select the target node
    var target = this.sidebarTitle;
    // create an observer instance
    this.observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName == 'value' && ZZZ_SidebarContextMenu.sidebarTitle.value != "")
          ZZZ_SidebarContextMenu.sidebarMenu.setAttribute("label", ZZZ_SidebarContextMenu.sidebarTitle.value);
      });   
    });
    // configuration of the observer:
    var config = { attributes: true };
    // pass in the target node, as well as the observer options
    this.observer.observe(target, config);

    this.sidebarHeader.insertBefore(menu, this.sidebarTitle);

    var spacer = document.createElement("spacer");
    spacer.setAttribute("flex", "100");
    this.sidebarHeader.insertBefore(spacer, this.sidebarTitle);

    this.sidebarMenuPopup = document.createElement("menupopup");
    menu.appendChild(this.sidebarMenuPopup);
    this.sidebarMenu = menu;
  },

  wheelOnSidebarMenu: function(aEvent) {
    var num = 0, prev = 0;
    this.sidebarMenuPopup.showPopup();

    for (var i = 0; i < this.sidebarMenuPopup.childNodes.length; i++) {
      if (this.sidebarMenuPopup.childNodes[i].getAttribute("checked")) {
        prev = i;
        num = ( aEvent.detail > 0) ? ++i : --i;
        while (num >= 0 && num < this.sidebarMenuPopup.childNodes.length &&
               this.sidebarMenuPopup.childNodes[num].localName == 'menuseparator')
          ( aEvent.detail > 0) ? ++num : --num;
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
    if (num >= this.sidebarMenuPopup.childNodes.length ||
        num < 0)
      return;

    this.sidebarMenuPopup.childNodes[num].setAttribute("checked", true)
    if (this.sidebarMenuPopup.childNodes[prev].hasAttribute("checked"))
      this.sidebarMenuPopup.childNodes[prev].removeAttribute("checked")
    this.sidebarMenu.firstChild.value = this.sidebarMenuPopup.childNodes[num].label;

    if (this.timer)
      clearTimeout(this.timer);
    if (this.DELAY >= 0)
      this.timer = setTimeout(function(self){
        toggleSidebar(self.sidebarMenuPopup.childNodes[num].getAttribute("observes"), true);
        if (self.contexttimer)
          clearTimeout(self.contexttimer);
        self.contexttimer = setTimeout(function(self){
          self.sidebarMenuPopup.hidePopup();
        }, 0, self);
      }, this.DELAY, this);
  }
};


ZZZ_SidebarContextMenu.init();