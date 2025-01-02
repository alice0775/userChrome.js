// ==UserScript==
// @name           optionFont.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    optionFont
// @include        chrome://browser/content/preferences/dialogs/fonts.xhtml
// @include        about:preferences
// @async          true
// @compatibility  108+
// @version        2022/11/19 21:00 fix width due to Bug Bug 1800828
// @version        2022/11/16 01:00 fix Bug 1790307
// @version        2020/08/07 01:00 add resizer for Advanced font dialog
// @version        2020/08/06 23:00 add tooltip and sample text
// @version        2020/08/05 02:00 fix open with hash
// @version        2020/04/23 02:00 fix Bug 1201243
// @version        2020/03/02 20:00 fix
// @version        2020/03/02 00:00 fix
// @version        2020/02/29 00:00 
// ==/UserScript==
if (location.href == "chrome://browser/content/preferences/dialogs/fonts.xhtml")
  {
  window.optionFont = {
    init: function() {
      let vbox = window.opener.document.querySelector('.dialogBox[resizable="false"][role="dialog"]')
      vbox.setAttribute("resizable", "true");
      vbox.style.setProperty("width", "50vw", "");
      vbox = window.opener.document.querySelector('.dialogFrame');
      vbox.style.removeProperty("min-width");
      vbox.style.removeProperty("width");
      ["serif", "sans-serif", "monospace"].forEach(id => 
      {
        let menulist = document.getElementById(id);
        menulist.addEventListener("popupshowing", this, {capture:false});
      });
      document.getElementById('font-chooser-group').style.setProperty("grid-template-columns", "max-content 1fr max-content max-content", "");
      ["defaultFontType", "serif", "sans-serif", "monospace"].forEach(id => 
      {
        document.getElementById(id).style.setProperty("width", "unset", "");
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
      const MIHON = "Il1O0rnＩｌ１Ｏ０ｒｎ口ロプブｱﾍﾍあへヘ";
      let menuitems = menupopup.querySelectorAll("menuitem");
      menuitems.forEach(elm => 
      {
        let font = (elm.value||elm.getAttribute("label")).replace(/^\$/, "").replace("Default (", "").replace(/\)$/, "");
        if (font) {
          elm.style.setProperty("font-family", font, "");
          elm.setAttribute("tooltiptext", font)
          let label = elm.querySelector(".menu-iconic-highlightable-text");
          label.textContent = MIHON;
          elm.style.setProperty("display", "flex", "");
          elm.style.setProperty("padding-inline-end", "5px", "");
          label.style.setProperty("font-size", "0.9em", "");
          label.style.setProperty("display", "initial", "");
          label.style.setProperty("margin-left", "auto", "");
        }
      });
      delete menuitems;
    }
  }
  setTimeout(() => {optionFont.init();}, 250);
} else {
  window.optionFont = {
    init: function() {
      document.addEventListener("popupshowing", this, {capture:false});
    },

    handleEvent: function(event) {
      switch(event.type) {
        case "popupshowing":
          let menupopup = event.originalTarget;
          if (menupopup.parentNode.id != "defaultFont")
            return;
          document.removeEventListener("popupshowing", this, {capture:false});
          this.setMenuPopupFont(menupopup);
          break;
      }
    },

    setMenuPopupFont: async function(menupopup) {
      const MIHON = "Il1O0rn Ｉｌ１Ｏ０ｒｎ 口ロプブ ｱﾍﾍ あへヘ";
      let menuitems = menupopup.querySelectorAll("menuitem");
      menuitems.forEach(elm => 
      {
        let font = (elm.value||elm.getAttribute("label")).replace(/^\$/, "").replace("Default (", "").replace(/\)$/, "");
        if (font) {
          elm.style.setProperty("font-family", font, "important");
          elm.setAttribute("tooltiptext", font)
          let label = elm.querySelector(".menu-iconic-highlightable-text");
          label.textContent = MIHON;
          elm.style.setProperty("display", "flex", "");
          elm.style.setProperty("padding-inline-end", "5px", "");
          label.style.setProperty("font-size", "0.9em", "");
          label.style.setProperty("display", "initial", "");
          label.style.setProperty("margin-left", "auto", "");
        }
      });
    }
  }
  setTimeout(() => {optionFont.init();}, 250);
}