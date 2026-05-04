// ==UserScript==
// @name                 youtube-dl button
// @description          A toolbar button that sends the current link to youtube-dl.
// @author               https://www.reddit.com/user/Luke-Baker/
// @license              https://creativecommons.org/licenses/by-sa/4.0/
// @credits1             Based on Sporif's restart button https://gist.github.com/Sporif/ad6e917d87787491538bac80d3c8918c
// @credits2             Icon by Zlatko Najdenovski https://www.iconfinder.com/icons/317714/video_youtube_icon
// @compatibility        Firefox 152
// @version              2026/05/04 00:00 Bug 2033243 - Rename ownerGlobal to relevantGlobal (documentGlobal)
// @version              2025/06/09 remove removal attribute
// @version              2025/06/08 use onCreaded instead of onBuild
// @version              2025/05/01 fix command
// @version              2025/04/14 fix register eventListener
// @version              2024/12/22 fix working within sandbox
// @version              2024/12/22 fix Bug 1936336 - Disallow inline event handlers
// ==/UserScript==

(function() {
	if(location != 'chrome://browser/content/browser.xhtml')
    return;
  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
      youtube_dl_button();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
          youtube_dl_button();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
  function youtube_dl_button() {
    //const exe = "C:\\Program Files (x86)\\youtube-dl\\youtube-dl.vbs";
    const exe = "D:\\ProgramFiles\\youtube-dl\\youtube\\yt-dlp.vbs";
    const exe_tver = "D:\\ProgramFiles\\youtube-dl\\tver\\yt-dlp.vbs";
    const txt = "youtube-dl";
    // Icon by Zlatko Najdenovski https://www.iconfinder.com/icons/317714/video_youtube_icon
    const ico = "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzEuNyA5LjJjMCAwLTAuMy0yLjQtMS4zLTMuNCAtMS4yLTEuNC0yLjYtMS40LTMuMi0xLjRDMjIuNyA0IDE2IDQgMTYgNGgwYzAgMC02LjcgMC0xMS4yIDAuM0M0LjIgNC40IDIuOCA0LjQgMS42IDUuOCAwLjYgNi44IDAuMyA5LjIgMC4zIDkuMlMwIDExLjkgMCAxNC43djIuNmMwIDIuOCAwLjMgNS41IDAuMyA1LjVzMC4zIDIuNCAxLjMgMy40YzEuMiAxLjQgMi44IDEuMyAzLjUgMS41QzcuNyAyNy45IDE2IDI4IDE2IDI4czYuNyAwIDExLjItMC40YzAuNi0wLjEgMi0wLjEgMy4yLTEuNCAxLTEgMS4zLTMuNCAxLjMtMy40czAuMy0yLjggMC4zLTUuNXYtMi42QzMyIDExLjkgMzEuNyA5LjIgMzEuNyA5LjJ6IiBmaWxsPSIjRTAyRjJGIi8+PHBvbHlnb24gcG9pbnRzPSIxMiAxMCAxMiAyMiAyMiAxNiAiIGZpbGw9IiNGRkYiLz48L3N2Zz4=')";  
    try {
      CustomizableUI.createWidget({
        id: 'youtubedl-button',
        type: 'button',
        defaultArea: CustomizableUI.AREA_NAVBAR,
        class: 'toolbarbutton-1 chromeclass-toolbar-additional',
        label: txt,
        tooltiptext: txt,
        style: ico,
        onClick(event) {
          launchApplication(event);
        },
        onCreated(toolbaritem) {
          toolbaritem.style.setProperty("list-style-image", ico, "");
        }
      });
    } catch(e) {
    };

    function launchApplication(event) {

      if(event.button !== 0)
        return;
      let app = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      let url = event.target.documentGlobal.gBrowser.currentURI.spec;
      if (/tver/.test(url)) {
		    //alert(exe_tver);
        app.initWithPath(exe_tver);
      } else {
	    	//alert(exe);
        app.initWithPath(exe);
      }

      if (!app.exists()) {
        console.error("[youtube-dl button userChrome script] Couldn't locate executable.");
        return;
      }

  		const process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
  		let args = [ url ];
  		process.init(app);
  		process.run(false, args, args.length, {});

    }
  }
})();