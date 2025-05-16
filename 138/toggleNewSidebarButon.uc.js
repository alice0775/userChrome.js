// ==UserScript==
// @name          toggleNewSidebarButon.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   toggle sidebar button for sidebar revamp
// @include       main
// @async         true
// @compatibility Firefox 138
// @author        alice0775
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
            type: 'custom',
            defaultArea: CustomizableUI.AREA_NAVBAR,
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'toggle-sidebar2',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: 'Toggle sidebar',
                    tooltiptext: 'Toggle sidebar',
                    context: "sidebarMenu2",
                    style: 'list-style-image: url("chrome://browser/skin/sidebars.svg");color:inherit;fill:var(--toolbarbutton-icon-fill);',
                };
                for (var p in props) {
                    toolbaritem.setAttribute(p, props[p]);
                }
                return toolbaritem;
            }
        });
    } catch(ex) {}

    let toolbaritem = document.getElementById('toggle-sidebar2');
    if (!toolbaritem) return;
    
    toolbaritem.addEventListener("command", (event) => {
      let commandID = event.target.ownerGlobal.SidebarController.lastOpenedId ||
        Services.prefs.getStringPref("userChrome.sidebar2", event.target.ownerGlobal.SidebarController.DEFAULT_SIDEBAR_ID);
      if (event.target.ownerGlobal.SidebarController.isOpen && typeof AutohideSidebar != "undefined") {
        if (event.target.ownerGlobal.AutohideSidebar.hidden) {
          event.target.ownerGlobal.AutohideSidebar.show();
        } else {
          event.target.ownerGlobal.AutohideSidebar.hide();
        }
      }  else if (event.target.ownerGlobal.SidebarController.isOpen && typeof ucjs_expand_sidebar != "undefined") {
        event.target.ownerGlobal.ucjs_expand_sidebar.toggleSidebar(commandID);
      }  else {
          event.target.ownerGlobal.SidebarController.toggle(commandID);
          toolbaritem.checked = event.target.ownerGlobal.SidebarController.isOpen;
      }
    });
    let menupopup = document.createXULElement("menupopup");
    menupopup.setAttribute("id", "sidebarMenu2");
    document.getElementById("mainPopupSet").appendChild(menupopup);
    menupopup.addEventListener("popupshowing", (event) => {sidebarMenu2_onpopup(event)});

    const WAIT = 500;
    const CLICK_STATE_NONE = 0;
    const CLICK_STATE_DOWN = 1;
    const CLICK_STATE_HOLD = 2;
    const CLICK_STATE_SKIP = 4;

    let _timer = null;
    let _state = 0;
    let _target = null;
    let _eventTarget = null;

    toolbaritem.addEventListener('mousedown', onmousedown, true);

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

        }
      }, WAIT, menupopup, event.screenX, event.screenY);

      toolbaritem.addEventListener('mouseup', onmouseup, true);
      toolbaritem.addEventListener('click', onclick, true);
    }

    function onmouseup(event) {
      toolbaritem.removeEventListener('mouseup', onmouseup, true);
      if (_timer) {
        clearTimeout(_timer);
        _timer = null;
      }
      _state = CLICK_STATE_NONE;
      _target = null;
    }

    function onclick(event) {
      toolbaritem.removeEventListener('click', onclick, true);
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
          menuitem.setAttribute("checked", (SidebarController.currentID == commandID));
          menupopup.appendChild(menuitem);
        }
      }

      for (const [commandID, sidebar] of SidebarController.sidebars.entries()) {
        if (sidebar.hasOwnProperty("extensionId") &&
          commandID !== "viewCustomizeSidebar") {
            // registerExtension() already creates menu items for extensions.
            const menuitem = SidebarController.createMenuItem(commandID, sidebar);
            menuitem.setAttribute("label", sidebar.title);
            menuitem.setAttribute("checked", (SidebarController.currentID == commandID));
            menupopup.appendChild(menuitem);
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
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    window.addEventListener("unload", () => {
      observer.disconnect();
      Services.prefs.setStringPref("userChrome.sidebar2", SidebarController.lastOpenedId);
    }, {once:true});

})();
