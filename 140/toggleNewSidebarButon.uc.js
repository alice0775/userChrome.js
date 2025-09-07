// ==UserScript==
// @name          toggleNewSidebarButon.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   toggle sidebar button for sidebar revamp
// @include       main
// @async         true
// @compatibility Firefox 140
// @author        alice0775
// @version       2025/09/06 autohideSidebar2
// @version       2025/08/03 fix duplicare id
// @version       2025/07/29 remove checked attribute if false
// @version       2025/06/17 Each window now remembers the last panel opened.
// @version       2025/06/09 Revert removeEventListener
// @version       2025/06/09 Fixed a bug in the overflow menu
// @version       2025/06/08 use onCreaded instead of onBuild
// @version       2025/05/28 Remember the last panel opened.
// @version       2025/05/26 Remember the last panel opened.
// @version       2025/05/16 fix undefined if AutohideSidebar2.uc.js is not enabled
// @version       2025/05/16 Working with AutohideSidebar2.uc.js(Rewrite const.AutohideSidebar = { to window.AutohideSidebar = { )
// @version       2025/05/14 add long click to open menu
// @version       2025/05/14 fix due to Bug 1921536
// @version       2025/05/01 fix command
// @version       2025/04/08
// ==/UserScript==
(function() {
    try {
        CustomizableUI.createWidget({
            id: 'toggle-sidebar2',
            type: 'button',
            defaultArea: CustomizableUI.AREA_NAVBAR,
            class: 'toolbarbutton-1 chromeclass-toolbar-additional',
            label: 'Toggle sidebar',
            tooltiptext: 'Toggle sidebar',
            context: "sidebarMenu2",
            onCommand(event) {
              let commandID = SessionStore.getCustomWindowValue(event.target.ownerGlobal, "userChrome.sidebar2");
                //Services.prefs.getStringPref("userChrome.sidebar2", event.target.ownerGlobal.SidebarController.DEFAULT_SIDEBAR_ID);
              commandID = event.target.ownerGlobal.SidebarController.lastOpenedId || commandID;
              if (event.target.ownerGlobal.SidebarController.isOpen && typeof AutohideSidebar != "undefined" && event.target.ownerGlobal.AutohideSidebar.enabled) {
                if (event.target.ownerGlobal.AutohideSidebar.hidden) {
                  event.target.ownerGlobal.AutohideSidebar.show();
                } else {
                  event.target.ownerGlobal.AutohideSidebar.hide();
                }
              }  else if (event.target.ownerGlobal.SidebarController.isOpen && typeof ucjs_expand_sidebar != "undefined") {
                event.target.ownerGlobal.ucjs_expand_sidebar.toggleSidebar(commandID);
              }  else {
                  event.target.ownerGlobal.SidebarController.toggle(commandID);
                  event.target.checked = event.target.ownerGlobal.SidebarController.isOpen;
              }
            },
            onCreated(toolbaritem) {
              toolbaritem.style.setProperty('list-style-image', 'url("chrome://browser/skin/sidebars.svg")',"");
              toolbaritem.style.setProperty('color', 'inherit',"");
              toolbaritem.style.setProperty('fill', 'var(--toolbarbutton-icon-fill)',"");
            },
        });
    } catch(ex) {}

    let menupopup = document.createXULElement("menupopup");
    menupopup.setAttribute("id", "sidebarMenu2");
    document.getElementById("mainPopupSet").appendChild(menupopup);
    menupopup.addEventListener("popupshowing", (event) => {sidebarMenu2_onpopup(event)});
    window.addEventListener('customizationstarting', customizationstarting, false);
    window.addEventListener('aftercustomization', aftercustomization, false);

    const WAIT = 500;
    const CLICK_STATE_NONE = 0;
    const CLICK_STATE_DOWN = 1;
    const CLICK_STATE_HOLD = 2;
    const CLICK_STATE_SKIP = 4;

    let _timer = null;
    let _state = 0;
    let _target = null;
    let _eventTarget = null;

    aftercustomization();

    function customizationstarting() {
        let toolbaritem = document.getElementById("toggle-sidebar2");
        toolbaritem?.removeEventListener('mousedown', onmousedown, true);
    }
    function aftercustomization() {
      setTimeout(function() {
        let toolbaritem = document.getElementById("toggle-sidebar2");
        toolbaritem?.addEventListener('mousedown', onmousedown, true);
      },800);
    }
    
    function onmousedown(event) {
      if (_timer) {
        clearTimeout(_timer);
        _timer = null;
      }
      _state = CLICK_STATE_DOWN;

      if (event.button != 0) 
        return;

      _timer = setTimeout((menupopup, x,y) => {
        if (_state == CLICK_STATE_DOWN) {
            _state = CLICK_STATE_HOLD;
        menupopup.openPopupAtScreen(x, y , true);
        _target = event.target;
        }
      }, WAIT, menupopup, event.screenX, event.screenY);
      event.target.addEventListener('mouseup', onmouseup, true);
      event.target.addEventListener('click', onclick, true);
    }

    function onmouseup(event) {
      event.target.removeEventListener('mouseup', onmouseup, true);
      if (_timer) {
        clearTimeout(_timer);
        _timer = null;
      }
      setTimeout(function() {
        _state = CLICK_STATE_NONE;
        _target = null;
      }, 0);
    }

    function onclick(event) {
      event.target.removeEventListener('click', onclick, true);
      if (_timer) {
        clearTimeout(_timer);
        _timer = null;
      }
      if (_state == CLICK_STATE_HOLD &&
          event && event.button == 0 &&
          _target) {
        event.preventDefault();
        event.stopPropagation();
        _state = CLICK_STATE_NONE;

      }

      _target = null;
    }



    function sidebarMenu2_onpopup(event) {
      let menupopup = event.target;
      while(menupopup.lastChild) {
        menupopup.removeChild(menupopup.lastChild);
      }

      for (const [commandID, sidebar] of SidebarController.sidebars.entries()) {
        if (
          !sidebar.hasOwnProperty("extensionId") &&
          commandID !== "viewCustomizeSidebar"
        ) {
          // registerExtension() already creates menu items for extensions.
          const menuitem = SidebarController.createMenuItem(commandID, sidebar);
          menuitem.id += "_2"
          menupopup.appendChild(menuitem);
          if (SidebarController.currentID == commandID)
            menuitem.setAttribute("checked", "true");
          else
            menuitem.removeAttribute("checked");
        }
      }

      for (const [commandID, sidebar] of SidebarController.sidebars.entries()) {
        if (sidebar.hasOwnProperty("extensionId") &&
          commandID !== "viewCustomizeSidebar") {
            // registerExtension() already creates menu items for extensions.
            const menuitem = SidebarController.createMenuItem(commandID, sidebar);
            menuitem.id += "_2"
            menupopup.appendChild(menuitem);
            menuitem.setAttribute("label", sidebar.title);
            if (SidebarController.currentID == commandID)
              menuitem.setAttribute("checked", "true");
            else
              menuitem.removeAttribute("checked");
        }
      }
    }
    
    // Select the node that will be observed for mutations
    const targetNode = document.getElementById("sidebar-box");

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: false, subtree: false };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
          let toolbaritem = document.getElementById("toggle-sidebar2");
          toolbaritem.checked = SidebarController.isOpen;
          if (toolbaritem.checked) {
            SessionStore.setCustomWindowValue(window, "userChrome.sidebar2", SidebarController.currentID);
            //Services.prefs.setStringPref("userChrome.sidebar2", SidebarController.currentID);
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    window.addEventListener("unload", () => {
      window.removeEventListener('aftercustomization', aftercustomization, false);
      observer.disconnect();
      if (SidebarController.lastOpenedId) {
        SessionStore.setCustomWindowValue(window, "userChrome.sidebar2", SidebarController.lastOpenedId);
        //Services.prefs.setStringPref("userChrome.sidebar2", SidebarController.lastOpenedId);
      }
    }, {once:true});

})();
