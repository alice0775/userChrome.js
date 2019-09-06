// ==UserScript==
// @name           IME-Colors.uc.js
// @namespace      http://d.hatena.ne.jp/Griever/
// @include        *
// @exclude        about:*
// @license        MIT License
// @version        0.0.12
// @note           0.0.12 findbar
// @note           0.0.11 63.0a1対応 (https://u6.getuploader.com/script/download/1736)
// @note           0.0.10 e10s対応等
// @note           0.0.9 変換中に IME を OFF にすると色が変わらないのを修正
// @note           0.0.7 CSS のリセットの処理を修正
// @note           0.0.6 IME_DISABLE_STYLE を空にすれば IME が OFF の時は色を変えないようにできるようにした
// @note           0.0.5 Firefox 5.0 で動くように微修正。 3.6 とかもう(ﾟ⊿ﾟ)ｼﾗﾈ
// ==/UserScript==
(() => {
"use strict";

const WindowUtils = window.windowUtils ||
                    window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
							      .getInterface(Components.interfaces.nsIDOMWindowUtils);
function IMEColorsService(isFrameScript) {
"use strict";

const IME_ENABLE_STYLE = {
	'background-image': 'linear-gradient(to right, #fed, #ffe)',
	'background-color': '#fed',
	'color': 'black',
};
const IME_DISABLE_STYLE = { // IME OFF の時に色を変えたくなければこの括弧を空にする
	'background-image': 'linear-gradient(to right, #def, #eff)',
	'background-color': '#def',
	'color': 'black',
};

const BackupPropertyNames = Array.from(new Set(Object.keys(IME_ENABLE_STYLE).concat(Object.keys(IME_DISABLE_STYLE))));
const Win = isFrameScript? content: window;

class IMEColorsClass {
	constructor(elem) {
		const doc = elem.ownerDocument;
		this.win = doc.defaultView;
		this.inputField = elem;
		this.textbox = elem;
		while(this.textbox) {
      if (this.textbox.localName == "textbox")
        break;
      this.textbox = this.textbox.parentNode;
    }

		this.elem = this.textbox || this.inputField;
		this.state = null;
		const s = this.elem.style;
		this.originalStyle = {};
		BackupPropertyNames.forEach(n => this.originalStyle[n] = s.getPropertyValue(n));
		this.inputFieldStyle = this.win.getComputedStyle(this.inputField, null);
		if (this.textbox) {
			this.originalStyle['border-width'] = s.getPropertyValue('border-width');
			this.originalStyle['-moz-appearance'] = s.getPropertyValue('-moz-appearance');
			const borderWidth = this.win.getComputedStyle(this.textbox, null).borderTopWidth;
			s.setProperty('-moz-appearance', 'none', 'important');
			s.setProperty('border-width', borderWidth, 'important');
		}
		this.setColor();
		if (isFrameScript || doc !== document)
			this.win.addEventListener('pagehide', this, false);
		this.elem.addEventListener('blur', this, false);
		this.elem.addEventListener('keyup', this, false);
		this.elem.addEventListener('compositionend', this, false);
	}

	get timer() {
		return this._timer;
	}
	set timer(t) {
		if (this._timer)
			this.win.clearTimeout(this._timer);
		return this._timer = t;
	}
	setColor() {
		if (this.inputFieldStyle.imeMode == 'disabled')
			return;
		const ime = isFrameScript? sendSyncMessage("IMEColors:IMEIsOpen")[0]: WindowUtils.IMEIsOpen;
		if (ime === null || this.state === ime)
			return;

		const obj  = ime? IME_ENABLE_STYLE : IME_DISABLE_STYLE;
		const obj2 = ime? IME_DISABLE_STYLE : IME_ENABLE_STYLE;
		const s = this.elem.style;
		Object.keys(obj2).forEach(n => obj[n] || s.removeProperty(n));
		Object.keys(obj).forEach(n => s.setProperty(n, obj[n], 'important'));
		this.state = ime;
	}
	resetColor() {
		const s = this.elem.style;
		Object.keys(this.originalStyle).forEach(n => {
			const val = this.originalStyle[n];
			val ? s.setProperty(n, val) : s.removeProperty(n);
		});
	}

	handleEvent(event) {
		switch(event.type) {
		case 'keyup':
			const key = event.keyCode;
			if (key === 16 || key === 17 || key === 18)
				return;
			if (key > 240 || key < 33) {
				this.timer = this.win.setTimeout(() => this.setColor(), 50);
			}
			break;
		case 'compositionend':
			this.setColor();
			break;
		case 'blur':
		case 'pagehide':
			this.timer = null;
			this.win.removeEventListener('pagehide', this, false);
			this.elem.removeEventListener('blur', this, false);
			this.elem.removeEventListener('keyup', this, false);
			this.elem.removeEventListener('compositionend', this, false);
			this.resetColor();
			break;
		}
	}
}

function IMEColors({ originalTarget: elem }) {
	if ((elem instanceof Win.HTMLTextAreaElement ||
	     elem instanceof Win.HTMLInputElement &&( /^(?:text|search)$/.test(elem.type) || !elem.type)) &&
	    !elem.readOnly) {
		if (isFrameScript && elem.hasAttribute('anonid'))
			return;
		new IMEColorsClass(elem);
	}
}

if (isFrameScript) {
	addEventListener('focus', IMEColors, true);
	addEventListener('unload', () => {
		removeEventListener('focus', IMEColors, true);
	}, false);
} else {
	document.documentElement.addEventListener('focus', IMEColors, true);
	window.addEventListener('unload', () => {
		document.documentElement.removeEventListener('focus', IMEColors, true);
	}, false);
}

}// function IMEColorsService(isFrameScript)

IMEColorsService(false);

const appinfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
if (appinfo.browserTabsRemoteAutostart) {
	window.messageManager.addMessageListener("IMEColors:IMEIsOpen", message => {
		try {
			return WindowUtils.IMEIsOpen
		} catch (e) {
			return null;
		}
	});
	window.messageManager.loadFrameScript("data:application/javascript;charset=UTF-8," + encodeURIComponent("("+IMEColorsService.toSource()+")(true);"), true);
}

})();