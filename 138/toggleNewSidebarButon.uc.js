// ==UserScript==
// @name          toggleNewSidebarButon.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   toggle sidebar button for sidebar revamp
// @include       main
// @async         true
// @compatibility Firefox 138
// @author        alice0775
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
                setTimeout(()=>{
                  toolbaritem.checked = SidebarController.isOpen;
                  if (SidebarController.currentID != "")
                    toolbaritem.last = SidebarController.currentID;
                },1000);
                toolbaritem.addEventListener("click", (event) => {
                    if (event.button == 0) {
                        event.target.ownerGlobal.SidebarController.toggle(toolbaritem.last);
                        toolbaritem.checked = SidebarController.isOpen;
                    }

                });
                return toolbaritem;
            }
        });
    } catch(ex) {}


    let menupopup = document.createXULElement("menupopup");
    menupopup.setAttribute("id", "sidebarMenu2");
    document.getElementById("mainPopupSet").appendChild(menupopup);
    menupopup.addEventListener("popupshowing", (event) => {sidebarMenu2_onpopup(event)});

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
          if (SidebarController.currentID != "")
            toolbaritem.last = SidebarController.currentID;
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    window.addEventListener("unload", () => {observer.disconnect();}, {once:true});

})();
