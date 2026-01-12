// ==UserScript==
// @name           ucjs_stayOpenViewZoomMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Keep the menu open when cliking middle mouse buttun on View>Zoom>Zoom In etc.
// @include        main
// @async          true
// @author         Alice0775
// @compatibility  Firefox 148
// @version        2026/01/07 Bug 2008041 - Make XUL disabled / checked attributes html-style boolean attributes.
// @version        2025/01/27 fix Bug
// @version        2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// @version        2024/10/10 add delete button 
// ==/UserScript==
const ucjs_stayOpenMenu = {
  init: function() {
    ["menu_zoomEnlarge",
    "menu_zoomReduce",
    "menu_zoomReset",
    "toggle_zoom"].forEach((id) => {
      document.getElementById(id)
        .addEventListener("mouseup", (event) => ucjs_stayOpenMenu.shouldPreventHide(event));
      /*document.getElementById(id)
        .setAttribute("onmouseup", "ucjs_stayOpenMenu.shouldPreventHide(event);");*/
    });
    document.getElementById("viewFullZoomMenu").addEventListener("popupshowing", this);
    document.getElementById("viewFullZoomMenu").addEventListener("popuphidden", this);
  },

  handleEvent: function(event) {
    switch(event.type) {
      case "popupshowing":
        addEventListener("FullZoomChange", this);
        addEventListener("TextZoomChange", this);
        break;
      case "popuphidden":
        removeEventListener("FullZoomChange", this);
        removeEventListener("TextZoomChange", this); 
        break;
      case "FullZoomChange":
      case "TextZoomChange":
        this.updateCommands();
     }
  },

  shouldPreventHide: function(aEvent) {
		const menuitem = aEvent.target;
		if (aEvent.button == 1) 
		{
			menuitem.setAttribute('closemenu', 'none');
			menuitem.parentNode.addEventListener('popuphidden', () => {
				menuitem.removeAttribute('closemenu');
			}, { once: true });
			if (aEvent.ctrlKey)
		  	menuitem.parentNode.hidePopup();
		}
  },

  updateCommands: async function _updateCommands(
    forceResetEnabled = false
  ) {
    let defaultZoomLevel = await ZoomUI.getGlobalValue();
    let zoomLevel = ZoomManager.zoom;
    let reduceCmd = document.getElementById("menu_zoomReduce");
    if (zoomLevel == ZoomManager.MIN) {
      reduceCmd.toggleAttribute("disabled", "true");
    } else {
      reduceCmd.removeAttribute("disabled");
    }

    let enlargeCmd = document.getElementById("menu_zoomEnlarge");
    if (zoomLevel == ZoomManager.MAX) {
      enlargeCmd.toggleAttribute("disabled", "true");
    } else {
      enlargeCmd.removeAttribute("disabled");
    }

    let resetCmd = document.getElementById("menu_zoomReset");
    if (zoomLevel == defaultZoomLevel && !forceResetEnabled) {
      resetCmd.toggleAttribute("disabled", "true");
    } else {
      resetCmd.removeAttribute("disabled");
    }
    
    let fullZoomCmd = document.getElementById("toggle_zoom");
    if (!ZoomManager.useFullZoom) {
      fullZoomCmd.toggleAttribute("checked", "true");
    } else {
      fullZoomCmd.removeAttribute("checked");
    }
  }
  
}

ucjs_stayOpenMenu.init();
