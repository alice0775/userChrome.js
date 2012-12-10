// ==UserScript==
// @name           moreTimeSpanClearRecentHistory.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Clear Recent Historyのtimespan選択肢を増やす, 今後ダイアログを表示しないチェックボックスを提供
// @include        main
// @compatibility  Firefox 3.5 3.6a1pre
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2009/08/03
// @Note           000-windowhook.uc.jsが必要
// @Note           再度ダイアログを表示したいときはprivacy.sanitize.doNotShowDialogをfalseにする
// ==/UserScript==
if (parseInt(Components.classes["@mozilla.org/xre/app-info;1"]
                   .getService(Components.interfaces.nsIXULAppInfo)
                   .version.substr(0,3) * 10, 10) / 10 > 3.0) {
  WindowHook.register("chrome://browser/content/sanitize.xul",
    function(aWindow) {
      var popup = aWindow.document.getElementById("sanitizeDurationPopup");

      var menuitem = popup.firstChild.cloneNode(true);
      menuitem.setAttribute("label", "7 days");
      menuitem.setAttribute("value", "5");
      popup.insertBefore(menuitem, popup.childNodes[4])

      menuitem = popup.firstChild.cloneNode(true);
      menuitem.setAttribute("label", "30 days");
      menuitem.setAttribute("value", "6");
      popup.insertBefore(menuitem, popup.childNodes[5])

      menuitem = popup.firstChild.cloneNode(true);
      menuitem.setAttribute("label", "90 days");
      menuitem.setAttribute("value", "7");
      popup.insertBefore(menuitem, popup.childNodes[6])

      menuitem = popup.firstChild.cloneNode(true);
      menuitem.setAttribute("label", "180 days");
      menuitem.setAttribute("value", "8");
      popup.insertBefore(menuitem, popup.childNodes[7])

      var timespan = aWindow.Sanitizer.prefs.getIntPref("timeSpan");
      aWindow.document.getElementById("sanitizeDurationChoice").value = timespan;

      var func = aWindow.Sanitizer.getClearRange.toString();
      func = func.replace(
        'default:',
        ' \
        case 5 : \
          startDate = endDate - 604800000000; /* 7*24*60*60*1000000 */ \
          break; \
        case 6 : \
          startDate = endDate - 2592000000000; /*  30*24*60*60*1000000 */ \
          break; \
        case 7 : \
          startDate = endDate - 7776000000000; /* 90*24*60*60*1000000 */ \
          break; \
        case 8 : \
          startDate = endDate - 23328000000000; /* 180*24*60*60*1000000 */ \
          break; \
        $&'
        );
      eval("Sanitizer.getClearRange = "+ func, aWindow);

      func = aWindow.gSanitizePromptDialog.sanitize.toString();
      func = func.replace(
        '{',
        ' \
        $& \
        Sanitizer.prefs.setBoolPref("doNotShowDialog", \
                            document.getElementById("doNotShow").checked);'
        );
      eval("gSanitizePromptDialog.sanitize = "+ func, aWindow);

      var doNotShow = false;
      try {
        doNotShow= aWindow.Sanitizer.prefs.getBoolPref("doNotShowDialog");
      } catch(e){}

      var ref = aWindow.document.getElementById("itemList");
      var checkbox = aWindow.document.createElement("checkbox");
      ref.parentNode.appendChild(checkbox);
      checkbox.setAttribute("label", "Do not show me this dialog box again.");
      checkbox.setAttribute("id", "doNotShow");
      checkbox.setAttribute("checked", doNotShow);

      if (doNotShow) {
        aWindow.gSanitizePromptDialog.sanitize();
        aWindow.setTimeout(function(aWindow){
          aWindow.close();
        }, 0, aWindow);
      }
    }
  );
}