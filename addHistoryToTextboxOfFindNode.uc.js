// ==UserScript==
// @name           addHistoryToTextboxOfFindNode.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    add history dropdown on FindNode dialog of DOMi
// @include        chrome://inspector/content/viewers/dom/findDialog.xul
// @compatibility  Firefox 3.0 more
// @author         Alice0775
// @version        2009/09/26 13:00
// @version        2009/09/25 23:55
// @Note
// ==/UserScript==
var addHistoryToTextboxOfFindNode = {
  textbox: null,
  init: function(){
    var textbox = document.getElementById("tfText1");
    if (!textbox)
      return;

    var value = textbox.value;
    var height = textbox.boxObject.height;
    textbox.setAttribute("type", "autocomplete");
    textbox.setAttribute("autocompletesearch", "form-history");
    textbox.setAttribute("autocompletesearchparam", "findNode-history");
    textbox.setAttribute("enablehistory", "true");
    textbox.height = height;
    this.textbox = textbox;

    dialog.__doFind = dialog.doFind;
    dialog.doFind = function() {
      addHistoryToTextboxOfFindNode.addHindNodeHistory();
      dialog.__doFind();
    }

    setTimeout(function(textbox, value){
      textbox.value = value;
      textbox.select();
    },100, textbox, value);
  },

  addHindNodeHistory: function (){
    var textbox = this.textbox;
    var aSearchString = textbox.value;
    if(aSearchString.replace(/ /g,'')!==''){
      var formHistory;
      formHistory = Components.classes["@mozilla.org/satchel/form-history;1"]
            .getService(Components.interfaces.nsIFormHistory2);
      formHistory.addEntry("findNode-history", aSearchString);
    }
  }
}

addHistoryToTextboxOfFindNode.init();
