// ==UserScript==
// @name           revertSidebarToggleButton.uc.js
// @namespace      http://blogs.yahoo.co.jp/alice0775 
// @description    Revert Sidebar Toggle Button
// @include        main
// @compatibility  Firefox 29+
// @author         Alice0775
// @version        2015/05/12 23:30 Remove unnecessary listener
// @version        2015/05/12 08:30 Working on Firefox29+
// ==/UserScript==
var revertSidebarToggleButton = {
  init: function() {
    Components.utils.import("resource:///modules/CustomizableUI.jsm");
    CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
      id: 'bookmarks-button',
      type: 'custom',
      defaultArea: CustomizableUI.AREA_NAVBAR,
      onBuild: function(aDocument) {
        var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
        var props = {
          id: "bookmarks-button",
          class: "toolbarbutton-1 chromeclass-toolbar-additional",
          observes: "viewBookmarksSidebar",
          tooltiptext: "Display your bookmarks",
          ondrop: "bookmarksButtonObserver.onDrop(event)",
          ondragover: "bookmarksButtonObserver.onDragOver(event)",
          ondragenter: "bookmarksButtonObserver.onDragOver(event)",
          ondragexit: "bookmarksButtonObserver.onDragExit(event)",
          oncommand: "toggleSidebar('viewBookmarksSidebar');",
          sidebarurl: "chrome://browser/content/bookmarks/bookmarksPanel.xul",
          group: "sidebar",
          type: "checkbox",
          label: "Bookmarks",
          autoCheck: "false",
          removable: "true"
        };
        for (var p in props) {
          toolbaritem.setAttribute(p, props[p]);
        }
        
        return toolbaritem;
      }
    });
    CustomizableUI.createWidget({ //must run createWidget before windowListener.register because the register function needs the button added first
      id: 'history-button',
      type: 'custom',
      defaultArea: CustomizableUI.AREA_NAVBAR,
      onBuild: function(aDocument) {
        var toolbaritem = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
        var props = {
          id: "history-button",
          class: "toolbarbutton-1 chromeclass-toolbar-additional",
          observes: "viewHistorySidebar",
          label: "History",
          tooltiptext: "Display pages you've viewed recently",
          oncommand: "toggleSidebar('viewHistorySidebar');",
          sidebarurl: "chrome://browser/content/history/history-panel.xul",
          group: "sidebar",
          type: "checkbox",
          sidebartitle: "History",
          autoCheck: "false",
          removable: "true"
        };
        for (var p in props) {
          toolbaritem.setAttribute(p, props[p]);
        }
        
        return toolbaritem;
      }
    });

    var style = ' \
      @namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); \
      #history-button { \
        list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADBUlEQVQ4jZ2TXWhTZxjH2xXr9GKw0YuZWTfsplatrYlxSZM03x+nyTlJ2pOYz9mYprW1rd2iVnFfMMs6mVbQFkXRsahjZQWZ0DuvpHjjHJatzs8rQx2csbKJF8r47eYo6aBE9sB78/L+f+/zf/g/FRVlCqgEKsu9W0y8HNAscpa+LETz+fBh7RqttbB6U/PvdY0m6hpN1DUYH9br7eOFwsRaYEU5CxqzO7xrrc76l94mYhGi2AIJbIE4Fl8ErdXPu5tb5jxSIgloFu1Eb/V/usnkxdIaJZEbnBo7fT5ffPRIunPnfvux8XNDbemeabMQYcP7LhxirOM57MUMgeU7B/fbmsy+p85gio8+GRkFtiqKsm6j0XNrs6X1CrAGMGYHDlxwBJM0GD3zR0+dawCWlII0ert03hlKE8n0XwU2AlUXf7i8botNRGsV/1YHvWR+fl4nJrtmbYE4Bnd4BFixAGRwtc/5IllOnr2YAl4DqiYuTa13BtM4pNTjEhs1Hw8fG/LKWZo98nX1g8oK4JUbs7Nv26QUXrnzGbBaFVRNXJpa727rwN2eeVIsFmtVG9XfXJhs8UWytATify4ATU9fr/PKOxCinf+ogkoVVivEcr945B0YnKGvn+foqyPjBmFbDldb5o8XIFWw0h/rngvEu0nmBsLA6+r9G4qiONK9+yYbza1PO7rzbqBGjGUGAvFupFTPzf+CNImu/GRoez/NvvZrpQkGlgG6M4WJPoeYGCkWi7VmITojpfvI9O8/DrxZCnr1x6krQjDd98QbyaK3i+OqxRqgGlgKvHP79oOtBnf4eyGWI/jBLmVm5pYRqFqwi8Cqz0ZODLdlBnGFt9NoEn52hxLpw6NjTfsOHjK4pGROZw/e80U7CWV2Pzt+prAbeGtBIEtg9cOjpw7JmQ8f+xM7MQnb0NpEdHYJiz9OINmD3JVXxs5+twd4r9zS1t+4+as8cPDLbxO9QzNyZ16JZPNzyd4DP+39YvTkb3cfSGUhJbBlQBNgBpyAAzABG4Dql4L83/oXzWAYtvzCGMUAAAAASUVORK5CYII="); \
      } \
 \
      #bookmarks-button { \
        list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADQklEQVQ4jZ2US28TVxiG3f+QDW5JlYrGG0pbVWAoJvcqdhw7TvAY23OJJ449t0ziyYydcRxfGAI4yCotUhdVxIIlQmxYwAI2CKSoYhEkJKRs0gXSGQuHCV0QKauXTWKXCqmCV3oW5xzpWZzv0+ty/SsAvvgUXP8NgC4A7s+k61DiDkbZqZ4TZ/76+vjpvZ7vzuwd+8GH/+ObE2fR8/3Pm6HY9HkAbhcA97c/9r/yjZ53RifZ1hQr7fQFEwjGZj5gjOIxRvHtcyCaQl+AguengVZbdGoo/E+MV5t0ViPp+aI9nsiCEfQ28dkclHytqeRrzfhsDoygg84uIsarOD0yibbIF7zgMKJOGFEnswslezwpgJUMsJIBRtQRpgW8eLl198XLrbthWgAj6u33gVCyI+ofTzicXCCcXCDCYtkOMxIYyUAio2EqNQdBL28DEAAIgl7enkrNIZHRwEgGhibojmggRDsptUhSapFIRtUOMzLEfO3tnXsPnmw8e/5o583uTQDnAJzbebN7c+PZ80d37j14IuZrbwcnmI5ocIJx0gslkl4oETlv2WFGhmxUt/b29wsAOABeAMcO8ALg9vb3C7JR3RoKswDwpQuAeyQy7WS0CsloFaKYq3aEUxFKCvD5qYfNZtMLoBvAVwd0N5tNr89PPQwlBQxPTgPAURcA9y/RlCMYFhEMi8yv1O1oWgMnL6EvGAfFiiUAvQdL2wWgl2LFUl8wDk5ewig10xH5qVlHNleJbK6Sxeo1O57NQypcQoRVsH7rtgWgu9VqeVqtlgdA9/qt21aEVSAVLmEsnumIAvGso5bqRC3ViXHxVzshmVBX1hBNa3j8dIO2rlw/23uyf7P3ZP9moXJ58PHTDTqa1qCurCGYFDt/NJbI7uYqDZKrNEhh9YbNzC0jV22AVkwEKP7+qZHIu1FqBv5YGt6RyXcBir9PKyZy1QbGabkztWBC/FstX7MXreukWP/D5ubL0K3fIJtXQEtL4OaWoRSvQileBacug5aXIJmXMV9uIMQoO4eiI2s31vMXpMI2r1VbvHbxdVq3kNYt8FoNqVwVvFbDx+6SkunUf//TBHDksAE8AIYB+D+RYQCej/XSZxfbe0aP+PckvphDAAAAAElFTkSuQmCC"); \
      } \
    ';
    style = style.replace(/\s+/g, " ");
    var sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };

    window.bookmarksButtonObserver = {
      onDrop: function (aEvent)
      {
        let name = { };
        let url = browserDragAndDrop.drop(aEvent, name);
        try {
          PlacesUIUtils.showBookmarkDialog({ action: "add"
                                           , type: "bookmark"
                                           , uri: makeURI(url)
                                           , title: name
                                           , hiddenRows: [ "description"
                                                         , "location"
                                                         , "loadInSidebar"
                                                         , "keyword" ]
                                           }, window);
        } catch(ex) { }
      },

      onDragOver: function (aEvent)
      {
        browserDragAndDrop.dragOver(aEvent);
        aEvent.dropEffect = "link";
      },

      onDragExit: function (aEvent)
      {
      }
    };
  }
};

revertSidebarToggleButton.init();
