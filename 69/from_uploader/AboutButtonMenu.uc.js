// AboutButtonMenu.uc.js
// Fügt einen Menübutton für About-Seiten ein.
// version 1.2mod1 2019/09/08 uploaderからの拾いものを修正
// version 1.2 2017/11/21
// URL https://www.camp-firefox.de/forum/viewtopic.php?t=123078
// Firefox and the "about" protocol - Mozilla - https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/The_about_protocol
// 34行目 openUILinkIn →  openTrustedLinkIn に変更した その他
// マウス左クリック中クリックでアバウトページを開きます 必要に応じコメントアウト"//"を外してください

(function () {

	if (location != 'chrome://browser/content/browser.xhtml') return;

	const buttonId = 'about-button';
	const buttonLabel = 'About Button';
	const buttonTooltiptext = 'About Button';
	const buttonIcon = 'url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="context-fill" fill-opacity="context-fill-opacity" fill-rule="evenodd" d="M13.5 5A2.5 2.5 0 1 1 16 2.5 2.5 2.5 0 0 1 13.5 5zM8 6a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm1 5a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v3zM8 2a6.08 6.08 0 1 0 5.629 3.987 3.452 3.452 0 0 0 .984-.185A6.9 6.9 0 0 1 15 8a7 7 0 1 1-7-7 6.9 6.9 0 0 1 2.2.387 3.452 3.452 0 0 0-.185.984A5.951 5.951 0 0 0 8 2z"/></svg>\')';

  Components.utils.import("resource:///modules/CustomizableUI.jsm");

  //try {
    CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the  register function needs the button added first
      id: buttonId,
      type: 'custom',
      defaultArea: CustomizableUI.AREA_NAVBAR,
      onBuild: function(aDocument) {
        var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
        var props = {
          id: buttonId,
          class: "toolbarbutton-1 chromeclass-toolbar-additional",
          type: "menu",
          label: buttonLabel,
          tooltiptext: buttonTooltiptext,
          style: "list-style-image:" + buttonIcon,
          removable: "true",
        };
        for (var p in props) {
          toolbaritem.setAttribute(p, props[p]);
        }
      	var menupopup = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menupopup');
      	menupopup.id = 'aboutMenuPopup';

      	toolbaritem.appendChild(menupopup);

      	function appendMenuitem(aboutUrl) {
      		var menuitem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem');
      		menuitem.setAttribute('label', aboutUrl);
      		menuitem.setAttribute('onclick', 'openTrustedLinkIn("' + aboutUrl + '", "tab")');
      		menupopup.appendChild(menuitem);
      	};

      	appendMenuitem('about:config'); // Nummer 1
      	appendMenuitem('about:addons');
      	appendMenuitem('about:downloads');
      	appendMenuitem('about:profiles');
      	appendMenuitem('about:support'); // Fehlerbehebung
      	appendMenuitem('about:home'); 
      	appendMenuitem('about:about');

        //	Alle Abouts zum einfachen auswählen!
        //	appendMenuitem('about:'); // 
        //	appendMenuitem('about:about'); // About übersicht
        //	appendMenuitem('about:accounts'); // 
        //	appendMenuitem('about:addons'); // Erweiterungen
        //	appendMenuitem('about:buildconfig'); // 
        //	appendMenuitem('about:cache'); // 
        //	appendMenuitem('about:cache-entry'); // 
        //	appendMenuitem('about:checkerboard'); // 
        //	appendMenuitem('about:config'); // Nummer 1
        //	appendMenuitem('about:crashes'); // Absturzberichte
        //	appendMenuitem('about:credits'); // 
        //	appendMenuitem('about:debugging'); // 
        //	appendMenuitem('about:devtools'); // 
        //	appendMenuitem('about:downloads'); // downloadübersicht
        //	appendMenuitem('about:healthreport'); // Firefox-Statusbericht
        //	appendMenuitem('about:home'); // 
        //	appendMenuitem('about:license'); // Lizenzübersicht
        //	appendMenuitem('about:logo'); // 
        //	appendMenuitem('about:memory'); // 
        //	appendMenuitem('about:mozilla'); // The Book of Mozilla
        //	appendMenuitem('about:networking'); // 
        //	appendMenuitem('about:newtab'); // neuer Tab Seite
        //	appendMenuitem('about:performance'); // 
        //	appendMenuitem('about:plugins'); // Installierte Plugins
        //	appendMenuitem('about:policies'); // 
        	appendMenuitem('about:preferences'); // Einstellungen
        //	appendMenuitem('about:preferences#general'); // Einstellungen Allgemein
        //	appendMenuitem('about:preferences#home'); // 
        //	appendMenuitem('about:preferences#search'); // Einstellungen Suche
        //	appendMenuitem('about:preferences#privacy'); // Einstellungen Datenschutz und Sicherheit
        //	appendMenuitem('about:preferences#sync'); // Einstellungen Sync
        //	appendMenuitem('about:privatebrowsing'); // Privatmodus
        //	appendMenuitem('about:profiles'); // 
        //	appendMenuitem('about:restartrequired'); // 
        //	appendMenuitem('about:reader'); // 
        //	appendMenuitem('about:rights'); // Über Ihre Rechte
        //	appendMenuitem('about:robots'); // Welcome Humans!
        //	appendMenuitem('about:serviceworkers'); // 
        //	appendMenuitem('about:studies'); // 
        //	appendMenuitem('about:sessionrestore'); // 
        //	appendMenuitem('about:support'); // Information zur Fehlerbehebung
        //	appendMenuitem('about:sync-log'); // 
        //	appendMenuitem('about:telemetry'); // 
        //	appendMenuitem('about:url-classifier'); // 
        //	appendMenuitem('about:webrtc'); // 
        //	appendMenuitem('about:welcome'); // 
        //	appendMenuitem('about:welcomeback'); // Sitzungswiederherstellungnachricht
        return toolbaritem;
      }
    });
 // } catch(ee) {}
}) ();