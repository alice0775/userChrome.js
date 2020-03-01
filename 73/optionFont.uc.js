// ==UserScript==
// @name           optionFont.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    optionFont
// @include        chrome://browser/content/preferences/fonts.xhtml
// @include        about:preferences
// @compatibility  73
// @version        2020/02/29 00:00 
// ==/UserScript==
if (location.href == "chrome://browser/content/preferences/fonts.xhtml") {
  window.optionFont = {
    init: function() {
      ["serif", "sans-serif", "monospace"].forEach(id => 
      {
        let menulist = document.getElementById(id);
        menulist.addEventListener("popupshowing", this, {capture:false, once: true});
      });
    },

    handleEvent: function(event) {
      switch(event.type) {
        case "popupshowing":
          this.setMenuPopupFont(event.target);
         break;
      }
    },

    setMenuPopupFont: async function(menupopup) {
      let menuitems = menupopup.querySelectorAll("menuitem");
      menuitems.forEach(elm => 
      {
        let font = (elm.value||elm.getAttribute("label")).replace(/^\$/, "").replace("Default (", "").replace(/\)$/, "");
        if (font) {
          elm.style.setProperty("font-family", font, "")
        }
      });
    }
  }
  setTimeout(() => {optionFont.init();}, 250);
} else {
  window.optionFont = {
    init: function() {
      let menulist = document.getElementById("defaultFont");
      menulist.addEventListener("popupshowing", this, {capture:false, once: true});
    },

    handleEvent: function(event) {
      switch(event.type) {
        case "popupshowing":
          this.setMenuPopupFont(event.target);
         break;
      }
    },

    setMenuPopupFont: async function(menupopup) {
      let menuitems = menupopup.querySelectorAll("menuitem");
      menuitems.forEach(elm => 
      {
        let font = (elm.value||elm.getAttribute("label")).replace(/^\$/, "").replace("Default (", "").replace(/\)$/, "");
        if (font) {
          elm.style.setProperty("font-family", font, "")
        }
      });
    }
  }
  setTimeout(() => {optionFont.init();}, 250);
}