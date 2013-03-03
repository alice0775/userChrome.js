// ==UserScript==
// @name           showCookiesGroup.uc.xul
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    クッキー関連が隠されいるのを表示
// @include        chrome://browser/content/preferences/preferences.xul
// @compatibility  Firefox 14+
// @author         Alice0775
// @version        2013/03/04 00:00 fix bug of check default value, Fx22
// @version        2013/02/25 12:00 Bug 818340 Block cookies from sites I haven't visited
// @version        2013/01/16 12:00 Bug 831008 Disable Mutation Events in chrome/XUL
// ==/UserScript==
// @version        2009/09/16 move Clear Recent History from Remember History pane
// @version        2009/08/29 各項目は常に表示するように
// @version        2009/06/26
// @note           Bug 500584 -  "Accept cookies from sites","Accept third-party cookies","Exceptions…", It is necessary to always display these options regardless of the option of the preservation of the history.
// @note           required ucjsResizeWindow.uc.js to resize the dialog


function moveCookiesGroup() {
  var cookiesBox = document.getElementById("cookiesBox");
  if (cookiesBox &&
      !document.getElementById("cookiesGroup")) {
      /**
     * Check whether all the preferences values are set to their default values
     *
     * @param aPrefs an array of pref names to check for
     * @returns boolean true if all of the prefs are set to their default values,
     *                  false otherwise
     */
    function _checkDefaultValues(aPrefs) {
      var val;
      for (let i = 0; i < aPrefs.length; ++i) {
        let pref = document.getElementById(aPrefs[i]);
        let id = gPrivacyPane.dependentControls[i];
        let cntrl = document.getElementById(id);

        switch(cntrl.localName) {
          case "checkbox":
            val = cntrl.checked;
            break;
          default:
            val = cntrl.value;
            break;
        }
        if (id == "keepUntil") {
          // >=Fx22
          var acceptThirdPartyMenu = document.getElementById("acceptThirdPartyMenu");
          if (acceptThirdPartyMenu) {
            var accept = document.getElementById("acceptCookies");
            if (accept.checked && acceptThirdPartyMenu.selectedIndex == 1)
              val = 3;
            else if (accept.checked && acceptThirdPartyMenu.selectedIndex == 0)
              val = 0;
            else if (accept.checked && acceptThirdPartyMenu.selectedIndex == 2)
              val = 1;
            else
              val = 2;
          }
          // <=Fx21
          var acceptThirdParty = document.getElementById("acceptThirdParty");
          if (acceptThirdParty) {
            var accept = document.getElementById("acceptCookies");
            if (accept.checked && acceptThirdParty.checked)
              val = 0;
            else if (accept.checked && !acceptThirdParty.checked)
              val = 1;
            else
              val = 2;
          }
        }
        if (val != pref.defaultValue)
          return false;
      }
      return true;
    }
    function initializeHistoryMode(){
      let mode;
      let getVal = function (aPref)
        document.getElementById(aPref).value;

      if (_checkDefaultValues(gPrivacyPane.prefsForDefault)) {
        if (getVal("browser.privatebrowsing.autostart")) {
          mode = "dontremember";
        } else {
          mode = "remember";
        }
      }
      else {
        mode = "custom";
      }

      document.getElementById("historyMode").value = mode;
    }


    var func = gPrivacyPane.updateHistoryModePane.toString();
    func = func.replace(
    'document.getElementById("historyPane").selectedIndex = selectedIndex;',
    ''
    );
    eval("gPrivacyPane.updateHistoryModePane = " + func);
    

    var acceptThirdParty = document.getElementById("acceptThirdParty") ||
                           document.getElementById("acceptThirdPartyRow");
    var keepRow = document.getElementById("keepRow");

    var locationBarGroup = document.getElementById("locationBarGroup");

    var CookiesGroup = document.createElement("groupbox");
    CookiesGroup.setAttribute("id", "cookiesGroup");

    var CookiesGroupcaption = document.createElement("caption");
    CookiesGroupcaption.setAttribute("label", "Cookies");

    CookiesGroup.appendChild(CookiesGroupcaption);
    CookiesGroup.appendChild(cookiesBox);
    CookiesGroup.appendChild(acceptThirdParty);
    CookiesGroup.appendChild(keepRow);
    locationBarGroup.parentNode.insertBefore(CookiesGroup,locationBarGroup);

    // move Clear Recent History
    var clearRecentHistory = document.getElementsByClassName("inline-link")[0];
    var clearRecentHistoryLabel = clearRecentHistory.textContent;

    var ref = document.getElementById("clearDataBox");

    var box1 = document.createElement("hbox");
    ref.parentNode.appendChild(box1);
    box2 = box1.cloneNode(false);
    box2.setAttribute('flex', '1');
    box1.appendChild(box2);

    var button = document.createElement("button");
    button.setAttribute('label', clearRecentHistoryLabel);
    button.setAttribute('onclick', "gPrivacyPane.clearPrivateDataNow(false); return false;");

    box1.appendChild(button);

    // select the target node
    var target1 = document.getElementById("historyCustomPane")
    // create an observer instance
    var observer1 = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        initializeHistoryMode();
      });
    });
    // configuration of the observer:
    var config1 = { attributes: true, childList: true, subtree: true };
    // pass in the target node, as well as the observer options
    observer1.observe(target1, config1);

    // select the target node
    var target2 = document.getElementById("cookiesGroup")
    // create an observer instance
    var observer2 = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        initializeHistoryMode();
      });
    });
    // configuration of the observer:
    var config2 = { attributes: true, childList: true, subtree: true };
    // pass in the target node, as well as the observer options
    observer2.observe(target2, config2);

    // later, you can stop observing
    window.addEventListener("unload", function preferencesUnload(event){
      window.removeEventListener("unload", preferencesUnload, false);
      observer1.disconnect();
      observer2.disconnect();
    }, false);

  }
  if (document.getElementById("historyPane"))
    document.getElementById("historyPane").selectedIndex = 2;
}
moveCookiesGroup();
document.getElementById("panePrivacy").addEventListener("paneload", moveCookiesGroup, false);
