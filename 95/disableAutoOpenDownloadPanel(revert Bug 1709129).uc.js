// ==UserScript==
// @name           disableAutoOpenDownloadPanel(revert Bug 1709129).uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    disableAutoOpenDownloadPanel(revert Bug 1709129)
// @include        main
// @compatibility  95+
// @version        2021/10/28 00:00
// ==/UserScript==


DownloadsIndicatorView.onCommand = function(aEvent) {
  if (
    // On Mac, ctrl-click will send a context menu event from the widget, so
    // we don't want to bring up the panel when ctrl key is pressed.
    (aEvent.type == "mousedown" &&
      (aEvent.button != 0 ||
        (AppConstants.platform == "macosx" && aEvent.ctrlKey))) ||
    (aEvent.type == "keypress" && aEvent.key != " " && aEvent.key != "Enter")
  ) {
    return;
  }

  DownloadsPanel.showPanel_0();
  aEvent.stopPropagation();
}

DownloadsPanel.showPanel_0 = DownloadsPanel.showPanel;

DownloadsPanel.showPanel = function(){}

