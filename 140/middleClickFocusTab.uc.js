// ==UserScript==
// @name                middleClicFocusTab.uc.js
// @description         link/bookmarks/history/go button/context-searchを中ボタン長押しクリックでフォーカス反転
// @include             main
// @async               true
// @include             chrome://browser/content/places/places.xhtml
// @include             chrome://browser/content/places/bookmarksSidebar.xhtml
// @include             chrome://browser/content/places/bookmarksSidebar.xhtml?SM
// @include             chrome://browser/content/places/historySidebar.xhtml
// @include             chrome://browser/content/places/historySidebar.xhtml?SM
// @version             2025/09/27 fix working with  SidebarModoki
// @version             2021/10/27 fix adding class
// @version             2021/07/27 use auxclick event
// @version             2021/06/11
// @compatibility       115
// ==/UserScript==
if (location == 'chrome://browser/content/browser.xhtml') {
  function middleClickLinkFocusTab() {
    'use strict';
    
    let frameScript = function() {
      // WAIT = 長押しクリックと判定する時間 ms単位
    const WAIT = 500;

      const MCLICK_STATE_NONE = 0;
      const MCLICK_STATE_DOWN = 1;
      const MCLICK_STATE_HOLD = 2;
      const MCLICK_STATE_SKIP = 4;

      let _timer = null;
      let _state = 0;
      let _target = null;
      let _eventTarget = null;

      addEventListener('mousedown', onmousedown, true);

      function onmousedown(event) {
       if(!event.isTrusted) return;

        if (_timer) {
          content.clearTimeout(_timer);
          _timer = null;
        }
        _state = MCLICK_STATE_DOWN;

        if (event.button != 1) 
          return;
        _target = findLink(event.target);
        if (!_target)
          return;

        _timer = content.setTimeout(() => {
          if (_state == MCLICK_STATE_DOWN) {
              _state = MCLICK_STATE_HOLD;
              _eventTarget = event.target;
              _eventTarget.classList.add('middleClickLinkFocusTab');
              addEventListener('auxclick', onclick, true);
          }
        }, WAIT);
        addEventListener('mouseup', onmouseup, true);
      }

      function onmouseup(event) {
        if(!event.isTrusted) return;
        removeEventListener('mouseup', onmouseup, true);
        if (_timer) {
          content.clearTimeout(_timer);
          _timer = null;
        }
        content.setTimeout(() => {
            removeEventListener('auxclick', onclick, true);
            _state = MCLICK_STATE_NONE;
            if (_eventTarget)
              _eventTarget.classList.remove('middleClickLinkFocusTab');
            _target = null;
        }, 50);
      }

      function onclick(event) {
        if(!event.isTrusted) return;
        removeEventListener('auxclick', onclick, true);
        event.preventDefault();
        event.stopPropagation();
        if (_timer) {
          content.clearTimeout(_timer);
          _timer = null;
        }

        if (_state == MCLICK_STATE_HOLD && 
            event && event.button == 1 &&
            _target) {
          _state = MCLICK_STATE_NONE;
          if (_eventTarget)
            _eventTarget.classList.remove('middleClickLinkFocusTab');

          let mouseEventInit = {
            shiftKey: true,
            button: 1,
            relatedTarget: event.relatedTarget
          };
          let e = new content.MouseEvent('auxclick', mouseEventInit);
          _target.dispatchEvent(e);
          /*
          Services.console.logStringMessage('dispatchEvent ' + e.type);
          Services.console.logStringMessage(JSON.stringify(mouseEventInit));
          Services.console.logStringMessage(_target.tagName);
          */
        }

        _target = null;
      }

      function findLink(aNode) {
        try {
          return aNode.closest('a') || aNode.closest('area');
        } catch(e) {
          return null;
        }
      }
    };

    let frameScriptURI = 'data:application/javascript;charset=utf-8,' + encodeURIComponent('(' + frameScript.toString().replace(/\n[ ]+/g, "\n ") + ')();');
    window.messageManager.loadFrameScript(frameScriptURI, true);

    let css = `.middleClickLinkFocusTab {cursor: cell !important;}`;
    let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
    let uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(css));
    if(!sss.sheetRegistered(uri, sss.USER_SHEET))
      sss.loadAndRegisterSheet(uri, sss.USER_SHEET);

  }
  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    middleClickLinkFocusTab();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        middleClickLinkFocusTab();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }

}



function middleClickUIFocusTab() {
  'use strict';

  // WAIT = 長押しクリックと判定する時間 ms単位
  const WAIT = 500;

  let css = 
    `.middleClickUIFocusTab,
     .mCUFT .sidebar-placesTreechildren::-moz-tree-cell-text(leaf, selected),
     .mCUFT .sidebar-placesTreechildren::-moz-tree-image(leaf, selected),
     .mCUFT treechildren::-moz-tree-row(selected)
      { cursor: cell !important; }`;
  let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  let uri = Services.io.newURI('data:text/css;charset=UTF=8,' + encodeURIComponent(css));
  if(!sss.sheetRegistered(uri, sss.USER_SHEET))
    sss.loadAndRegisterSheet(uri, sss.USER_SHEET);

  if (location == 'chrome://browser/content/places/bookmarksSidebar.xhtml' ||
      location == 'chrome://browser/content/places/historySidebar.xhtml') {
    return;
  }


  const MCLICK_STATE_NONE = 0;
  const MCLICK_STATE_DOWN = 1;
  const MCLICK_STATE_HOLD = 2;
  const MCLICK_STATE_SKIP = 4;
  const kPrefSearch = 'browser.search.context.loadInBackground';
  const kPrefLink = 'browser.tabs.loadInBackground';

  let _timer = null;
  let _state = 0;
  let _target = null;
  let _node = null;

  addEventListener('mousedown', onmousedown, true);

  function onmousedown(event) {
    if(!event.isTrusted) return;
    //Services.console.logStringMessage("mCUFT mousedown " + event.type);

    if (_timer) {
      window.clearTimeout(_timer);
      _timer = null;
    }
    _state = MCLICK_STATE_DOWN;

    if (event.button != 1) 
      return;

    _node = findLink(event);
    if (!_node)
      return;
    _target = event.target;

    _timer = window.setTimeout(() => {
      if (_state == MCLICK_STATE_DOWN) {
          _state = MCLICK_STATE_HOLD;
          _target.parentNode.classList.add('mCUFT');
           _target.classList.add('middleClickUIFocusTab');
          addEventListener('click', onclick, true);
      }
    }, WAIT);
    addEventListener('mouseup', onmouseup, true);
  }

  function onmouseup(event) {
    if(!event.isTrusted) return;
    //Services.console.logStringMessage("mCUFT onmouseup " + event.type);
    removeEventListener('mouseup', onmouseup, true);
    if (_timer) {
      window.clearTimeout(_timer);
      _timer = null;
    }
    window.setTimeout(() => {
        removeEventListener('click', onclick, true);
        _state = MCLICK_STATE_NONE;
        if (_target) {
          _target.parentNode.classList.remove('mCUFT');
          _target.classList.remove('middleClickUIFocusTab');
        }
        _target = null;
    }, 50);
  }

  function onclick(event) {
    if(!event.isTrusted) return;
    //Services.console.logStringMessage("mCUFT onclick " + event.type + " " + _target.classList);
    let kPref;
    removeEventListener('click', onclick, true);
    event.preventDefault();
    event.stopPropagation();
    if (_timer) {
      window.clearTimeout(_timer);
      _timer = null;
    }

    if (_state == MCLICK_STATE_HOLD && 
        event && event.button == 1 &&
        _target == event.target) {
      _state = MCLICK_STATE_NONE;
      _target.parentNode.classList.remove('mCUFT');
      _target.classList.remove('middleClickUIFocusTab');

      let loc = _target.ownerGlobal.location;
      /*Services.console.logStringMessage('location ' + location);*/
      // handle clicks on tree children.
      if (loc =='chrome://browser/content/places/places.xhtml' ||
          loc == 'chrome://browser/content/places/bookmarksSidebar.xhtml' ||
          loc == 'chrome://browser/content/places/historySidebar.xhtml') {
        PlacesUIUtils.openNodeWithEvent(
          _node, 
          {type:'click',
           target:_target,
           shiftKey:true,
           ctrlKey:true, 
           metaKey:false,
           altKey:false,
           button:0
          }
        );
      // handle clicks on bookmarks/history menu
      } else if(_target._placesNode) {
        _target.addEventListener('command', 
                function(event){
                  event.preventDefault();
                  event.stopPropagation();
                }, {capture:true, once: true});
        PlacesUIUtils.openNodeWithEvent(
          _target._placesNode, 
          {type:'click',
           target:_target,
           shiftKey:true,
           ctrlKey:true, 
           metaKey:false,
           altKey:false,
           button:0
          }
        );
      // handle clicks on context-openlinkintab
      // handle clicks on context-search.
      } else if(_target.closest('#context-searchselect') ||
                _target.closest('#context-openlinkintab')) {
        if(_target.closest('#context-searchselect'))
          kPref = kPrefSearch;
        
        if(_target.closest('#context-openlinkintab'))
          kPref = kPrefLink;
        
        let pref = Services.prefs.getBoolPref(kPref, false);
        Services.prefs.setBoolPref(kPref, !pref);
        setTimeout((_target, pref) => {
          let e = new window.MouseEvent('click');
          _target.dispatchEvent(e);
          setTimeout((pref) => {
            Services.prefs.setBoolPref(kPref, pref);
          }, 250, pref);
          /*Services.console.logStringMessage('dispatchEvent ' + e.type);*/
        }, 250, _target, pref);
      // handle clicks on go button.
      } else if(_target.closest('.search-go-container') ||
                _target.closest('#urlbar-go-button')) {
        let e = new window.MouseEvent('click', 
                {shiftKey:true,
                 ctrlKey:true, 
                 metaKey:false,
                 altKey:false,
                 button:0
                });
        _target.dispatchEvent(e);
        /*
        Services.console.logStringMessage('dispatchEvent ' + e.type);
        Services.console.logStringMessage('_target ' + _target);
        */
      } else if(event.originalTarget.classList.contains("searchbar-engine-one-off-item")) {
        let kpref = "browser.search.openintab";
        let flg = Services.prefs.getBoolPref(kpref, true);
        Services.prefs.setBoolPref(kpref, true);
        let e = new window.MouseEvent('click', 
                {shiftKey:false,
                 ctrlKey:false, 
                 metaKey:false,
                 altKey:false,
                 button:0,
                 bubbles: true,
                 cancelable: true,
                 view: window
                });
        event.originalTarget.dispatchEvent(e);
        setTimeout(() => {Services.prefs.setBoolPref(kpref, flg);}, 0);

        /*
        Services.console.logStringMessage('dispatchEvent ' + e.type);
        Services.console.logStringMessage('_target ' + _target);
        */
      }
    }
    _target = null;
  }

  function findLink(aEvent) {
    let node = aEvent.target;
    //Services.console.logStringMessage("mCUFT onclick " + aEvent.type + " " + aEvent.originalTarget.classList);
    // handle clicks on bookmarks/history menu
    if ('_placesNode' in node && !PlacesUtils.nodeIsContainer(node._placesNode))
      return node;
    // handle clicks on tree children.
    if (node.localName == 'treechildren') {
      node = getSelectedNode(aEvent);
      /*Services.console.logStringMessage('node ' + node);*/
      if (node) {
        if (node.type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI)
          return node;
      }
    }
    // handle clicks on go button and context-search.
    node = aEvent.originalTarget;
    if (node.classList.contains("searchbar-engine-one-off-item")) {
      return node;
    }
    node = 
       node.closest('#context-openlinkintab') ||
       node.closest('#context-searchselect') ||
       node.closest('.search-go-container') ||
       node.closest('#urlbar-go-button');
    if(node) {
      return node;
    }
    return null;
  }

    function getSelectedNode(aEvent) {
    if (!('PlacesUtils' in window))
      return null;
    let tree = PlacesUIUtils.getViewForNode(aEvent.target);
    let cell = tree.getCellAt(aEvent.clientX, aEvent.clientY);
    if (cell.row == -1)
      return null;
    try {
      return tree.view.nodeForTreeIndex(cell.row);
    } catch(ex) {}
    return null;
  }

}
if (location != 'chrome://browser/content/browser.xhtml') {
  middleClickUIFocusTab();
} else {
  // We should only start the redirection if the browser window has finished
  // starting up. Otherwise, we should wait until the startup is done.
  if (gBrowserInit.delayedStartupFinished) {
    middleClickUIFocusTab();
  } else {
    let delayedStartupFinished = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" &&
          subject == window) {
        Services.obs.removeObserver(delayedStartupFinished, topic);
        middleClickUIFocusTab();
      }
    };
    Services.obs.addObserver(delayedStartupFinished,
                             "browser-delayed-startup-finished");
  }
}
