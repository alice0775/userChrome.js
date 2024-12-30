// ==UserScript==
// @name           ucjs_stayOpenViewZoomMenu.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Keep the menu open when cliking middle mouse buttun on View>Zoom>Zoom In etc.
// @include        main
// @compatibility  Firefox 135
// @author         Alice0775
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
		const menuitem = event.target;
		if (event.button == 1) 
		{
			menuitem.setAttribute('closemenu', 'none');
			menuitem.parentNode.addEventListener('popuphidden', () => {
				menuitem.removeAttribute('closemenu');
			}, { once: true });
			if (event.ctrlKey)
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
      reduceCmd.setAttribute("disabled", "true");
    } else {
      reduceCmd.removeAttribute("disabled");
    }

    let enlargeCmd = document.getElementById("menu_zoomEnlarge");
    if (zoomLevel == ZoomManager.MAX) {
      enlargeCmd.setAttribute("disabled", "true");
    } else {
      enlargeCmd.removeAttribute("disabled");
    }

    let resetCmd = document.getElementById("menu_zoomReset");
    if (zoomLevel == defaultZoomLevel && !forceResetEnabled) {
      resetCmd.setAttribute("disabled", "true");
    } else {
      resetCmd.removeAttribute("disabled");
    }
    
    let fullZoomCmd = document.getElementById("toggle_zoom");
    if (!ZoomManager.useFullZoom) {
      fullZoomCmd.setAttribute("checked", "true");
    } else {
      fullZoomCmd.setAttribute("checked", "false");
    }
  }
  
}

ucjs_stayOpenMenu.init();
