// ==UserScript==
// @name	Firefox_ToolBarButtons.uc.js
// @charset	UTF-8
// Date		2019‎/06/12 Firefox Nightly 69.0a1 document.createXULElement('toolbarbutton'); → aDocument.createXULElement('toolbarbutton'); 書き換えました。
// Date		2019‎/05/26 Firefox Nightly 69.0a1 createElement → createXULElement 書き換えました。
// Date		2019‎/02/25 ページ情報ボタンの2つあるidを同じidにするのを忘れていたので修正しました。
// Date		2019‎/02/20 タブ移動ボタンをホイールスクロールで左右のタブにフォーカスを移動(タブ切替え？)するようにしました。ズームコントロールボタンをホイールスクロールで拡大縮小するようにしました。開発ツールボタンとCookieとサイトデータを管理ボタンを追加しました。他いろいろ変更しました。
// Date		2019‎/02/04 クッキー表示 は 開発ツールを表示するようにしてみた
// Date		2019‎/02/02 idの重複修正 クッキー表示の修正
// Date		2018‎/07/10 ボタンを追加+いろいろ変更しました。
// Date		2018‎/05/03 アクティブタブを移動するボタンを追加しました。cssの多段タブでのタブ移動に便利？ ショートカットキー(Ctrl+Shift+PageUp/PageDown)でタブ移動出来たりするので使うかはお好みで。
// Date		2018‎/04/04 拡大縮小ボタンを追加しました。
// Date		2018‎/02/05 GitHubのEndor8さんの所でボタンを増やしてくれていたのでそのまま日本語化だけしました。
// Date		2018/01/16 2017/11/09版と同じようにボタンを一つにまとめ直しました。初期導入時、再起動するボタンのみツールバーに表示するようにしてみました。
// Date		2017/11/23 ブックマーク、履歴、同期タブのサイドバーを開閉するボタンを追加して、個別に導入できるようにバラバラにしてみました。
// Date		2017/11/09 RestartFirefoxButton_Movable.uc.js をベースに、再起動+ about:config、プロファイルフォルダ、クッキーマネージャのボタンをセットにしてみました。
// @note	
// @note	初期導入時、再起動するボタンのみツールバーに表示するようにしました。
// @note	その他のボタンは、ツールバーのカスタマイズ内に格納されていると思います。
// @note	カスタマイズから追加したいボタンを好きなところに出して使ってください。
// @note	
// @note	label と tooltiptext が環境によっては、文字化けするので、 Unicode に変換してます。
// @note	
// @note	再起動
// @note	about:config
// @note	新しいタブ
// @note	プロファイルフォルダ
// @note	クッキー (Firefox60ESR)
// @note	ブックマーク サイドバー
// @note	履歴 サイドバー
// @note	同期タブ サイドバー
// @note	ブラウジングライブラリー「ダウンロード」
// @note	タブを更新(保存されているキャッシュを無視して更新)
// @note	オプション
// @note	プラグインについて
// @note	ブラウジングライブラリー「ブックマーク」
// @note	Chromeフォルダ
// @note	ページ情報
// @note	証明書マネージャー
// @note	保存されたログイン情報
// @note	履歴を削除
// @note	拡大 (Ctrl++)
// @note	縮小 (Ctrl+-)
// @note	タブ移動（左：左にタブを移動｜右：右にタブを移動｜ホイール↑：左のタブに移動｜ホイール↓：右のタブに移動）
// @note	ズームコントロール (左 or ホイール↑： 拡大｜中： リセット｜右 or ホイール↓： 縮小)
// @note	開発ツール
// @note	Cookieとサイトデータを管理(一度Firefoxのオプションを開かないとCookieやサイトデータが表示されないようです。)
// @note	カスタムボタン (左 or ホイール↑↓：新しいタブ | 中：about:config | 右：Chromeフォルダ)
// @note	
// @note	Firefox Nightly 69.0a1で動作確認しました。
// @note	http://wiki.nothing.sh/page?userChrome.js%CD%D1%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8#m5c944e2
// @note	↑ここの「サンドボックスが有効になった62以降でもuserChrome.js用スクリプトを利用する方法」を導入して確認しています。
// @note	
// @note	Firefox60ESRなどでabout:系を使いたい場合 openTrustedLinkIn ⇒ openUILinkIn に変更してください。
// @note	
// @note	Firefox61以降クッキーマネージャ？がCookieとサイトデータに変わり廃止されたのでクッキーマネージャ？を開くボタンが使え無くなります。
// @note	
// @note	Firefox68以下でこのスクリプトを使いたい場合 aDocument.createXULElement ⇒ document.createElement に変更してください。
// ==/UserScript==

(function() {
    Components.utils.import("resource:///modules/CustomizableUI.jsm");

    try {

//      再起動 BrowserUtils.restartApplication(); 
        CustomizableUI.createWidget({
            id: 'restart-ToolBarButton',
            type: 'custom',
            defaultArea: CustomizableUI.AREA_NAVBAR,
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'restart-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u518d\u8d77\u52d5',
                    tooltiptext: '\u5de6\uff1a\u518d\u8d77\u52d5\u3059\u308b\uff5c\u4e2d\uff1a\u518d\u8d77\u52d5 + \u30b9\u30af\u30ea\u30d7\u30c8\u306e\u30ad\u30e3\u30c3\u30b7\u30e5\u3092\u30af\u30ea\u30a2\u3059\u308b',
                    style: 'list-style-image: url("data:image/png;base64,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")',
                    onclick: 'if (event.button == 0) { \
                                  Services.startup.quit(Ci.nsIAppStartup.eRestart | Ci.nsIAppStartup.eAttemptQuit); \
                              }; \
                              if (event.button == 1) { \
                                  Services.appinfo.invalidateCachesOnRestart(); \
                                  Services.startup.quit(Ci.nsIAppStartup.eRestart | Ci.nsIAppStartup.eAttemptQuit); \
                              };'
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      about:config
        CustomizableUI.createWidget({
            id: 'aboutconfig-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'aboutconfig-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: 'About:Config',
                    tooltiptext: 'About:Config\u3092\u8868\u793a\u3059\u308b',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABOVJREFUeNrElm1MW1UYx597b2/pgMh4aSkMeakNMBacU7MYcLwkZnMB3fiwGL/MRaPGxLghTmY3dUzajJh9UKNBWTAxIQMW4Is6/TA2YRCziXFKKbFlvPYNyltb+jJ6e33O3W0sCzCBu3iTJ5yW0/P7P+c8z/8eiud5oCgKJHzos+f0NTRNn+A4Ll2pVILT6QSCCHNcpz8Q+ODCpw1mnMeTyZTEAth6Q8NEujpNXVq+D5QpKRBZPxgMgtk8Ale7r4HVOpnf+NWXfxMRMgkzJ/DJvNzc1JKSZ+H2n4PQ1/cr4E4IoUpVQeGuAsjISIemi83DOF+BEZRKAP3+Kd2r6Wo1wouh+3oPcKEQsCwLbrebZAxDpiG41t1NNh0Yhia/iZVSQExcXHxdaXkJZm4U4DTNIIiBxcVFOHf244M4Zzlq/nxkIJUABZ51qipFKWw7AdM0BTKZDMTyGo2GimKWpBTAkmJzezxAiKToiAi5nI3OeHrVs5OqAokAGYMZ4/geXCbUAMD6HSaZAC501z46egdU2PcsK0MRGDIG+HB43d9JdQTc0pLPAhSdlp2dBWaLRTh/GRZiZlYm1JysdZJWFIwHj4eMzxvqY/DjXSkEMPW6U988V/HivrxcLfyB/U+OQ6FQCCI0Gg0U7NwpfGZZBuw2B3R0dd0R23BLAlhV3ZUpmudUIS0FTz1eADdvG8Hv92H4QRETA0nbtwtihAJFPzAND4PJZEI/uFoTWWSzVszmGH4e11eVpfVOeeHmuB0eXbbDu9owTDhd0NvXb01ISEhCs98WFxsLHtId+Ljdi/1NXzfW4nAcw0l2YDMC2CzDT2P1h0rTf3cGwOYNwHKYhoGRUahgLBA2Xp9pbLr4MqkLUuSpanW80+EgPR/CWBTBcwROmmcjAqiUtxs1yuw8i+75Z2DA6QebJwChMA/LPAUBFGEy/QZTH1UW49wpDL/YZZT45iOCguL3oY12AZX01heP5eQXmvUvFMEPlvl/4bgsh8sveOYgSMmJ4Vgx7FHWGxGwaR+gkt78PEdT8KT5k8oi+N5M4P4oOAUu9xxYJ8yumQ/3HxC3Odr3+a34AJ1c23p0b37ut++U74EfMXO7l8BhJXzS4rLVHT4kbv3SRgpqvRqgk0+2vFK+Z3fzifJd0DY4Bw4suBC/Em5zTIL1zMFi8YXjui/7Bz5r7QCd+F7L0bIndjcfR3irCOdWgc+3NxwR22rD8LUEyBJPd7W/UfJ0VUVhBmY+i/Dg6vC28y/5/vrl1mbhqwlgEnWd7dX7i6pKtCpoM86Ccy34Jf0Rn/HGrYihbNZOZSsy13Verj5QfJjALxP40urw4FC/HuEDIjz4oEr/LwIYpa6j6bWyvWvA8Ubhdd+DG28YXJf030kBj/aBbTFx8ccqC3fcB+eFv95AEOHjEBzs1YtwYjSBrcKjd0ChVSaC04cr45mjxwhGQ7adwMemzBCac/S4Wg0tONcm9npYiotERADt8HjxBgOCyRABK+Cz9h77hWPHcZ5DSnj0EfCzswtjI9MzoJDLcXUG3D4fjAuZ23sRXi26nEdKeLQTJuBYqz7d0UkpYjPxRi24Izc9ecX+2etn8H8T4s2WA4mfiAByfU3G2IHxiLgzyyKUFNxC9Cv0YQgQLhriPU0uvkLDYqX7H0bmK+7z/+fzjwADAKjckmpp+9qUAAAAAElFTkSuQmCC)',
                    onclick: 'if (event.button == 0) { \
                                  openTrustedLinkIn("about:config", "tab"); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      新しいタブ
        CustomizableUI.createWidget({
            id: 'newtab-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'newtab-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u65b0\u3057\u3044\u30bf\u30d6',
                    tooltiptext: '\u65b0\u3057\u3044\u30bf\u30d6\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABWFJREFUWIXtl79vHMcVxz/zdvfuluSRFEOGMgxRia3YMZTIMEADAtKkSZXCXYpUKfJHBBBUpEobQAD/CRdBilQpUgZIIxgqbEGUrViWTUrHI3l33B+zM++luOP5GN4psWIgQJAvMLd7s3PzPvN982MP/ldlRqZK2wx5WTv3rQb9jI5ttK6DfAexZVziUK1w8YTl5pkIRwsB9vb2bh8eHv4mTdMSIMY4n9i5WkTu3r179+lsvQ7ZxjpvI9l1kG0z6QLinJVOrWfSfEEMj2XNP7wEcOfOnWubm5t/3N3dfa8sS1QVVcXMUNVxgMlVRNjf3//k0aNH7+/t7Y0AbMCmufZ70HrHXOsGpK+DWwOXYJxBOHCueYKGTzD/YBYinYx2VJZlPhgMeP78OTFGYoxTkFkgM0NEtrIs+zHwVzOcDfI3cdlbRvtH0HoHS78HW0KSOuJAsWHPnOs6AdBCT31P1sbpSABu3bqV5nn+652dna2qqnDOTcvE9gslSZLO0dERt2/f9k8ev/a+qvzESHfFtW45t/Ym6bsdk5tts522pOuGhJxY5GCFGENEB7/9nR5OHUiSpGmahrquKYqCEAIxRkIIqOrUDTMbTzYz2d7e/tXS0tIvN7c2pI5XpPRfJCv6QiI3QG8i6Q+ckw5Rn7QSYYA73YRw1aTZRJN1s0acQwXg3r173ntPXdeUZUlVVZeu56Usy/O6tN/vL/V6X3bORv1WaIokSaKDrnNy1Ul6E0l3UdvJ4LsJyargWDZzOSIdM7KpA4Cpajwfdd1EysYRAsQIqufFpi6cq1sZpQcfDLOImWLmMR2BgFmNEZ01UWqftn1YyddXCnMOmwUgxtgkSUKWZXx8usGxrpEmAmKTji4Ghsl3d8CK7rPqUzaqyGrax8JTlATI0PiV1HVvNYTKPj18a+Xhl9feWE2fPfjgZ3/2FwBCCHVVVRRFQWmb/Pyn7zKowpydYGb9Au10h9fWOnS7KSqQuM8Rl4KdAoJzQxJ5mpzp6+RL30+H5RX395MsubAMAZqmaeq6pq5rjAQflP7QLwT4Wh1i3CCGLWIc4YOylvfIW58DKU0UhtU6R6Or9IttXpzmxf2Ptx9fAogx1uP1r0iSYt9gl+6NrpNKBYAPOcNqnXZWIM7woc2ZX6V/tsWwvsZnvWz07DjtXQIwMy8iWNIib7fQSzlfrKgZB4O3CdrhrFljpTihlRU4jCa2KXyXF8MNzL3B4YujSqU/nOtAWZaclQ3ZSkqM/z7AOcTh4Aan5TbLrWOytJwAZByfrTCornB1fRmvz4NP0ssAIYTae0/plU47I34DB2ZVNV2qpjvuU43ax/P1Qpo4Qoj6w142eDDHgSqEgI/QbbVowqsBAEQ1fFCi/lMfBg47+/DDX0yP2imAqlYigkvbJFmbEHVhADVDjcnhNOnbwLDxhrXAvSZEMDudrZtNQVWWJVVISSS9kIKoNi2qxqt60wTFxF14KZndByrvPd6WQKCJSt0oQZVXnA6X5JtAVOvN1s2moIwxoq5NiA4fFu+CdunmJW0mcg6KusFCPJwLEGMsRQRL21RBifPeJe2lMRnPgvkk4hxF3dBEXQzgvcdrSh0ud2VzxzUn1oImzhmDovZRQ38egFRVJSEEIkLVRES+dmBhWPsXz2cBgGLYVMOjZxeanwPkg8HgpLBlc1numqDA4mX4KnJA//ho2PvoD4+AHChnAcL9+/f/snzzg4dp62B71D9AdTwJZlMxtthYOHQ3/QDnJndSNUn+qSMOv/roT7/v7//tGGgu/GSiDrAOLAEBWPnPxnxB9QR3BJwA03N+3pnrAGFmgn4LCsD8fzr/139b/wA0wmcpTSnePAAAAABJRU5ErkJggg==)',
                    onclick: 'if (event.button == 0) { \
                                  openTrustedLinkIn("about:newtab", "tabshifted");/*BrowserOpenTab(event);*/ \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      プロファイルフォルダ
        CustomizableUI.createWidget({
            id: 'profilefolder-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'profilefolder-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30d7\u30ed\u30d5\u30a1\u30a4\u30eb\u30d5\u30a9\u30eb\u30c0',
                    tooltiptext: '\u30d7\u30ed\u30d5\u30a1\u30a4\u30eb\u30d5\u30a9\u30eb\u30c0\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    onclick: 'if (event.button == 0) { \
                                  Services.dirsvc.get("ProfD", Ci.nsIFile).launch(); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      クッキー (Firefox60ESR)
        CustomizableUI.createWidget({
            id: 'showCookies-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'showCookies-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30af\u30c3\u30ad\u30fc',
                    tooltiptext: '\u30af\u30c3\u30ad\u30fc\u3092\u8868\u793a\u3059\u308b',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAAB3RJTUUH2wUSFQEAhSsG8gAAC85JREFUWMN9l1mMZddVhr999j7jnWvq6jnd7u5qD2kbx20bYhLHQywLzBSCHIiCAMkgAhGy/AAhsSKhMEkmShwFCRmDDEEooSVQJNthiuXYjmM7drsnd1W7q4eq6qpbdavudOZ9ztk8lBCKE/E//g97fethr7V+wXv0yM9Mc/TIrTz6pW9z4R8e5tCtbS6dDjsN12qdv9Bdu+v4npS7n6J74pPHbGndf2WFmy5eLI9W+fDEzTdb/3z0kW+tjL7xcfPKWys88Pnj/OEjr/DsiTc4nRh+nOR7jduPXMcXn3mF8TcfphtXTScqf26ibv9Z4Nm/P9kJro/CzI3Pnri36asnRJb/ytlTw1uXL1zbM9Eo7zp2y+yDj/7C9ZODcbr5tb97eet4o22+9PRrPP4bx6n5GW9eiv5/gJ+9YScqcDh58WlO/uerhw5Ou0/YWJ91fWeOopi0lfyAY8uP2aJ60OR6CmVbWTime3WdgwcCe9+hmR2ua98T+O5DH7rzff7S6vDdz33zU+H8f5zjsY/dzOL6Fqcuhz8e4DMPHeOZl94lWPxXPvWJJ71ff/DQVzzXfzjOLVVv2kjHRlgWVVlZIIXRGl0Kdh2c5PBchz372tsPCUGWla1mq3Z3u+XddeWFhaXPfeWlSzcdmjSf/vJHeff7q5y+NPxhgF+77whPPX+OL9y7TBSVrV9+4PB9dUc+cvp01jp7ssvMrEe96QGGIi8xxqBcB0qNcmz8ZgBlSR7GGK1REoxBKNveU6+5H7339r3xv/zXhVOd1aj83afuZ/GFFU5d2YaQ99w4yb+9usQnJl/nue8uTd58oPnk7FTts8oSU++evSYG65vM3TSDbUuqXGO0xnYdhBAgLExVIYRA+S7SdcjDCJ0k5HFGkWmUreq1ZvChA7P14h+ff+eN6u3N4rHfOsz8OyPOXAuRjz5wnO9848s88++L9ifvf98fTU3Wf8f2HE+5tti9v8GhIxN0puqYoqDMcuzAw1ISy5bbxREMRyVXryTUGgq/4WMHPrbvUGYZeRgjjHHqrfqd+6aDwRef/sGb4WZR3bXXY300RuZo/uavPkKnMD959ND0n/uNoIFUlCXYtkQIgQCy0Rg78JCug1ASYW37m+sJ332xx7m3u3iOYXZ3A0sppGvjBD6WUiTDEWVpnHqrfvzo3vr5X/rqyfOu7dKemMD6+fdP8Aefea65o23/nqOsHZa0QAjKoqRIEpQtScKc5Z5LohU6LzEGDAIhFVF/xNrFJQara2ws90jGMfFgRDqM0GmO8hyoT/LWmZKTJ8Op2anmn/zTb87d+Ne/uo+z10bIZx+/jVFs7jh6cOKPg5rnS89FCKjSBBBUCOYXIs7Na9bXM2Z32ASBwgBaV3QmPVQR0QoqbrptD2jNaG2DIsspc01ZCb730joX57fYXOtzeK4948pSfv6ZM9+540BTW+Ljz9oNX93n+e5EgaKqDGWaUyYpQkqqomLl3TV6V5ZYWbhKNEoxxmAJcB2BdBz23bCP4/fegOdKNq+sEPVHCEsSdFrUmj4H9ypE1qemYnxPMj3V+MWP3DJ77PGHZlG/fefspC24ezQ2TNQE+TjCEoLKbP9pZVscu7lJzd1keraGEII0rfDrEgxUVYUlDAZDWRQUucYAduBhew5GSg4e20Njus7l81u4voMw5XSr7twjPv3662q65U6362pXEEgCX5FsjamEQDgem5uaul/SaAfccc8ElpIYIVGWodIFCItKF1hGY7BYG7iI5i5atQLbcwCDVBZSWuw5NENjsoFDSVlo0ampex/5wMTfWrYUzUS7/vzVgFMnhxhhYSqDtBW1QBANxiAEbs3HGKjKAlMWFElOmWSUmUYIwTiGM2dCfvBWRGYCHMfGkhJLgMlSqjSj1fZRjg0I6oF9cP9MsEeliQkWzg/tolrEVwm7J2apt2okwxCDIR6G1DpNLEdSxRVplFIVJVQl0rKohCBNcgQST6YImaEUFLpAYTDGUOUaLeDd+YRsNGTXdIlSVjOwrd1Wo2bV9kzntsxWOXzQQQqDYbvTYXcTS0qcwMNUEEcaneVIJfEaNVCSPCswQuC5guO3t7nt1jq20FQVlHmBkBJV89GZ5txri7z2wjxbGyGVMbYRtJQUpja7sy6P3LiXZttH2QqdZiRxShrGTO7fhe05pGFGlpYUhUSMCxpC4gY+llTkuabQJWtXx7QCC53lFEWJzDSWZxCVIajZ3HlnmzT28TzDZlQJY7BUmmqVpblwPIl0t2dAUZREm0OMAbfmU+iSJIrZ3Mp551xMGq6ye5fDB+85gKGiLEpczyHwDEIYdKZJohRlK6o8R9kW0rbYf2SGOExYu3SNojBFrMnUICri8TAu0nGE7fvYSjDaHBENQ5rTbfyGj04y8lSzcGqFpYsjTJlxcNcUw94WynMBgedDZ9JjsNYjC2PKotxeUrakyC2kUmRJTpakZElOlOh4Ky57qhuWKyur4/7UVKOdVAHNpkTnGuXaBJ0WaZiRpzlVWTI3V2e4vsXuPR32Hp5h61oPt+bTnGpjWRIhLMqiJI9TqrICS2B7PqfPxoy3hhy9vonrVIxHGav9rLs60qvq0kBfvjqQp64bhgdmpzoIYeHU6wjXB6kYDiLyMMaSgl0HZ/hpT9KZbiMdRToKiXoDylzjeg5VVWF7LpZS5EmGtBXrq0NWljTdKxv019b5idsmEGjWxsWZK8NqzboSlhuXhtVzK91ovLW8ymitR6YFRWEoy5I8ihn3NkkGQ5SS1Dt1cl1gjMFYAl0UJFFCnuXbngHLVpRFic5y4tGYPI6odI6ocpL+iNE4S9ZG+pVL/WIoH7xhqloeZFuiquam7WLOshC1doNSOHS3HCxRkPc3QQgak23SJMeyLIyBcHOITnOcwMepBVjSot/tk4QZQauG32nh1VxqrmaiDRNtSMOI+Q199uRq/uQD13euyRlfsNxPR0LIfk1UH5yuy040Tjl7Nmb5SkgWp8zs9KlNTWCERZlrLCWJRzGD1Q1s16G1cxosi6qq0JUkrxw6O5pYykHZknrLxXUNOk25sBL2X7umv7YWm2+Ps0LLvJ9x3b622Yz1alLgdBxu80XpLV8eMNgYUK9L9h2Z2V6tRYmQkpWlhP7yGqLUOI0At1Gjqgx5buiPFFsDga0qeusZ9bokCSP6GxFxnJffuxx//Vyv+IodOH2iCHls1qEoMnZO7tBrYbIYplW77Zobdk/ZTqMhuW6uTaFL1jdKfLdCKoXnK1pTdWrtBrbnIqTEGMPaasbCQkpvdUjgFkxNCLIwIh6OqYqCd1aThTNd/afPn986O9eSOL6DXApLDs8ExGnEy5fH40bgnt+MKrfhirn9u3xPmJIiyQjqNoKKqjLUGh6Ndh3bCwjqPpUxVGVFFiasXOySDEfUVILnGfK0IM9L5rvpxusr2Ve7cfmt9+9t5WsLm+Rhsn2WN3XO1I4mO2s2L14a9hu+/XY/qQpTlEc9QV1RYSsoco1OUuIwZfFyyYWFlDIZYVUJOtNIq6RRM0xPKeoBFJVhM6yqN67Gi2+u5k+uh9Xf2+2dAzNcR3kWL24U2wDdHORWwvTuBjtd2HfowHipOzi9EVdrvVBPK2EmHQrbsgTSlvQ2NIuLKeNBhCkSgqCizIvtASZBKsHyQGdvLGVLJ1fTZ+d7+olBUp6Y3Nvp5901bFfx/IXxDyejXgX19ZjGlMP66joz0+2kO0zO9TPx/fWw2lobFfVxmNXKolQIY/V7IVEY05qwcD1BrgsybRgl2pxbSTZeXc6fOb+h/6IXl18fhenbU+16Ou72sR2HratbLGXbYVW8NyzuAA7vrxGNU1qdBnv37Wdh8VLdkdZ1gRS3NH15Y+DIPWlUNnNdmVbHMU3fmlSW8LQhCrPqUj+p/jvMzfNfeOzh7l8+eYI8zej1ekxMNpm/OOJK8X/1fgTgf/VT0xYvr5d8eH8N13Xp1JqcWVmV9SDwlbSCQhu3qgyuK41UVkMIXCFIytJsFVoP9u3fofvdHlE4Zs/Oac4urHJm+KMR/X8Aci469m8wLoEAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTYtMDktMTdUMTU6MjI6MjgrMDg6MDDEU/HIAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDExLTA1LTE4VDIxOjAxOjAwKzA4OjAwwL0E/AAAAE10RVh0c29mdHdhcmUASW1hZ2VNYWdpY2sgNy4wLjEtNiBRMTYgeDg2XzY0IDIwMTYtMDktMTcgaHR0cDovL3d3dy5pbWFnZW1hZ2ljay5vcmfd2aVOAAAAGHRFWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzADGn/7svAAAAGHRFWHRUaHVtYjo6SW1hZ2U6OkhlaWdodAAxMjhDfEGAAAAAF3RFWHRUaHVtYjo6SW1hZ2U6OldpZHRoADEyONCNEd0AAAAZdEVYdFRodW1iOjpNaW1ldHlwZQBpbWFnZS9wbmc/slZOAAAAF3RFWHRUaHVtYjo6TVRpbWUAMTMwNTcyMzY2MD0HAokAAAAQdEVYdFRodW1iOjpTaXplADMyS0J0fr+rAAAAW3RFWHRUaHVtYjo6VVJJAGZpbGU6Ly8vaG9tZS93d3dyb290L3NpdGUvd3d3LmVhc3lpY29uLm5ldC9jZG4taW1nLmVhc3lpY29uLmNuL3NyYy8xNDEvMTQxNjMucG5nsVkHWwAAAABJRU5ErkJggg==)',
                    onclick: 'if (event.button == 0) { \
                                     window.open("chrome://browser/content/preferences/cookies.xul","cookie","chrome,dialog,centerscreen,dependent"); \
                                  }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      ブックマーク サイドバー
        CustomizableUI.createWidget({
            id: 'BookmarksSidebar-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'BookmarksSidebar-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30d6\u30c3\u30af\u30de\u30fc\u30af \u30b5\u30a4\u30c9\u30d0\u30fc',
                    tooltiptext: '\u30d6\u30c3\u30af\u30de\u30fc\u30af \u30b5\u30a4\u30c9\u30d0\u30fc \u958b\u304f/\u9589\u3058\u308b',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    onclick: 'if (event.button == 0) { \
                                  SidebarUI.toggle("viewBookmarksSidebar"); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      履歴 サイドバー
        CustomizableUI.createWidget({
            id: 'HistorySidebar-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'HistorySidebar-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u5c65\u6b74 \u30b5\u30a4\u30c9\u30d0\u30fc',
                    tooltiptext: '\u5c65\u6b74 \u30b5\u30a4\u30c9\u30d0\u30fc \u958b\u304f/\u9589\u3058\u308b',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    onclick: 'if (event.button == 0) { \
                                  SidebarUI.toggle("viewHistorySidebar"); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      同期タブ サイドバー
        CustomizableUI.createWidget({
            id: 'viewTabsSidebar-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'viewTabsSidebar-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u540c\u671f\u30bf\u30d6 \u30b5\u30a4\u30c9\u30d0\u30fc',
                    tooltiptext: '\u540c\u671f\u30bf\u30d6 \u30b5\u30a4\u30c9\u30d0\u30fc \u958b\u304f/\u9589\u3058\u308b',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB4UlEQVR4Xu2WP2sUQRjGn3f3bo+YvTMhIoaQpAhcokRCkCu2SBp7USyECAFtrERBEkggX0A02IhcY2Fhq3aCNqYICEoaAynTREi4kOSKXHI3M6/MMssycCgr3F0zD8y+7zMs7/549g9LzIxeykOP5QAcgANwADn8RS/Wq3nf966Fxf4AWgxT7IaZjTUyXkiJo+OT3bWVJ7XMAJvb21SpzHyr3JiJQARWCooZrJdiKFZpH1ftk55Nr3BwUGu8fFWdf/b00Y9MAF8/fbl0/96d6Py8GQ9KhzLYeBuo/X4Yhn1joyM3AWQDCHIFX0iBxtkZ2L5Q4qGUgbG8vfSe7/l+5luQDwI0WwI6gWQQoGuaBJjt2FNvgxAhM0BQyENogGbLSsD01oXAMM8E2iYA/A9AUIAQCq2WALeLlmF5e9kgIO/fAJ83Nuhw7/DWZHmi7HseZq9PFgGOU2AwYIYCZjiA5EC6EMWV44PZNeddHhqY29r6tQQAJ/X66eb3nx9Wlx//1p6Soc/Xqw/K5am3nf42eR6hVtvfebh496qVwPDw6HRYHEA3NKh46t37j7nFhdsiAdDv63GpdBFdUv3KUFFaCUipXgshJvou9I8TETolKWWTWb2JolnW3v0VOwAH4AAcwB+e16VmcXWe1QAAAABJRU5ErkJggg==)',
                    onclick: 'if (event.button == 0) { \
                                  SidebarUI.toggle("viewTabsSidebar"); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      その他のボタン
//      ブラウジングライブラリー「ダウンロード」
        CustomizableUI.createWidget({
            id: 'Download-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'Download-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30d6\u30e9\u30a6\u30b8\u30f3\u30b0\u30e9\u30a4\u30d6\u30e9\u30ea\u30fc\u300c\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u300d',
                    accesskey: 'D',
                    tooltiptext: '\u30d6\u30e9\u30a6\u30b8\u30f3\u30b0\u30e9\u30a4\u30d6\u30e9\u30ea\u30fc\u300c\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u300d\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAC7klEQVR42mJgAIL3K2X+AwQQy9VMzf+cIooMAAHE8H6i2n+QKEAAsbCrSjJ8vST4HyCAQByG13Mc/n+/D5EBCCAWsMByBQa2bz/BkgABxAAz5f1aYbAKgAACo6+XJP///OQFFgAIIJbvd23//z/NyPD/NQPDg8uS/wECiIlT+TDjr5/sDK9ZrjMo6D5nBAgguLYPC13/f7nN+v/bQ7H/P77awM0DCCAWGOPLp58MfE80GFiE+RiYOCXhGgECiAlE3PZI/i8iL8bAchMocV2C4d/+fwyPj2qBTQEIIBR02S7+/4N1AigSAAHECPcLyB9/OBkY/rMxMLxkYRDMvwWWAwggJpgCDidZBlazzwzsVg8ZGAXU4SYABBDckYy/2BmYvgsyMLLxMPz+g7AFIIAQCr6zA+0B+oCLn+HHV0Q4AgQQ48MTUv8FvwszsLwUhHhLlIeBkQ+oT+IXw8Pa3wwAAcQkb/GM8f2fbwwMr4CO+8ABDBABBua3wgzP8qQY1BbsZQQIILAj5V3vMj6Tv8Dw8/VbBqZ/nxjuT2BiUFw/D+wLgABCQXeX8v+/5pyAEg4AAYSh6v0il/+cMeIM/9+/YGBgZmNgZOSGKOSTYvi25A6DYOw2FD0AAcSCbsCfX38Y/n+4x/D37R0GZiY2hn/sQN//+8LAzGgClGPCcBVAAGEa8O8/A9MnVoZ/77gZ/gH5zHwCDP//czAwcnID5T5jGAAQQCx3o0L/s/znBXP+/fvD8E/sGgPjJ14GxrdCDAxszMBwBQYrAz8DAx8TA7P8d4anaXH/mf8yMfz/y87w6/9zBoAAYoSlJrbiAwzi7wwY/r38CNSIcCqTFB+E/wvonu//GVj4+Rie855k+NtjzaCwfjYjQAChBMhNt5T/7IV7GaTf6jD8fAZx7h9xXgZ2RmYGVjFBsMYfzZYMqjvmwvUBBBBWBIqqW2t5/n+eo/X/6zKj//d38v4HuRKbWoAAwouOher8Pxmtg1cjQIABAFbt8Z32Ai5RAAAAAElFTkSuQmCC)',
                    oncommand: "DownloadsPanel.showDownloadsHistory();"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      ブラウジングライブラリー「ブックマーク」
        CustomizableUI.createWidget({
            id: 'bookmarks-manager-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'bookmarks-manager-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30d6\u30e9\u30a6\u30b8\u30f3\u30b0\u30e9\u30a4\u30d6\u30e9\u30ea\u30fc\u300c\u30d6\u30c3\u30af\u30de\u30fc\u30af\u300d',
                    tooltiptext: '\u30d6\u30e9\u30a6\u30b8\u30f3\u30b0\u30e9\u30a4\u30d6\u30e9\u30ea\u30fc\u300c\u30d6\u30c3\u30af\u30de\u30fc\u30af\u300d\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnklEQVQ4y6XTPYgVVxTA8f/ce2fu7Mx7vuf6srsa425cxFWEiDwCgpXpErELIVYWVolYWGmdKoVdLGwUGwXFJggWwq42hpBmiUaW1f2I7Pfs+p6773Pm3jspXtwEIhLwNIdTnB/nHDjwgeGNXrhz2JfysPC8/9fgrLAmez7105lnAOpAZejxwYGBiud5QA78N3cyRymSLG6kHBmJ+G1ueX0KPgJQ8ytppbXZ/tt/N5Aax9gnEUndUm84Xm/aytuJVBxZzn3VT0lbjMkoFIskawmDQ4MALC8ts3vPx9STJcKoSK3r8/CP9vZKqhhJjh/sZyB2ZFlGuVxmYSFleLgHzBaa7N8/SDJxlXj3SZZ0lesT8h/Aw1Kr1dAGjDEYY+h2uyRJAkCapiTzk4TpS7orIbUdo3jYbUD4SqJ1gNaaMAzRWhMEvVprjQ588pVHxJ+eQDRnCESGr/41QeALCnFEHAustcRxTNZcIepOkdsO0eZLivYZQh2lsKtEafUmJ8p93LldOZ21my3lkdNoNChKhXMOYwx27QnmzXVk3y524qEKZTCzyD7H3uwpl6ot8u7wXVbnppX2JYU4Jo57QBAEtPZ9CYsvoPWAoOCBWAMrgBwVtbGdOp3X6+M27fyglPRQvsL3fZxz+L6PHxbRY5fJFg9g1r9DFTKgB+TOMvnnCMNbW9+7jHlVb6Zr1x5OC19CnoMQHtZZpFBIPlMXR2VZ7ehC6noGMN0eMtWz87MAaiZ583UcBkIJsX3ZABOkqLQa3j+mj7euEIBdpeEFKLGH8ItDv7fe+zA3btyr/vrkl32dcXHeJWxlk0y0fubzzgNOmSmemle02/c5AqDeBUgpyzNzy9+M7B3b6F94/qPd4FZ0mlmAdJwFUeJbIXu9fwFVCBajMWIWPQAAAABJRU5ErkJggg==)',
                    oncommand: "PlacesCommandHook.showPlacesOrganizer('AllBookmarks');"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      タブを更新(保存されているキャッシュを無視して更新)
        CustomizableUI.createWidget({
            id: 'reload-skip-cache-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'reload-skip-cache-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30bf\u30d6\u3092\u66f4\u65b0',
                    tooltiptext: '\u30bf\u30d6\u3092\u66f4\u65b0 (\u4fdd\u5b58\u3055\u308c\u3066\u3044\u308b\u30ad\u30e3\u30c3\u30b7\u30e5\u3092\u7121\u8996\u3057\u3066\u66f4\u65b0)',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC+klEQVQ4y2WSW2gcdRTGfzM7l51sdne6s2k36zYmdk1qxRVaiyA+NJAHpUILDYooluKlL4LvKoqivokUBUsRRArSB580lHqh1BDaFCoGNklLsk3bVIZku8lespeZnf/M+JKatH5w3s7345zzHYn/SwHMzVKAABBAE2gAzsPND+gipGUY7yXzqqwYhUB0ZIG3LmhPCTpnQb1wCC+4BM/JqO9J281/KIylxO6vd77+8l5JlaA3Tui5eNUmYr1Ce2ae+r25cwLvbA/WDw7t7n+Aiwpj2fzoL7tOvBatF4v4rTahLyFFQpBVZAUkXccp3aZ2eZL8p5/w40fvIm+OnUv6A9/3v308unZlGn+jiaypGCHENzrooQ9BiL/RRO3vp+/YK+j9ma0bCHjjkZPHc7VrM9Bogq7RvTDJr+7i0lSM2kutaObpPc9kjSf3IQmP0A3wq/UtgELqTdWXqBVvENF12n9d5v3U8k8TLqdoUbbTzviHN6c/T99cRiOG8cQI0r3WFiDak8h1Z0uEi3dQFJVzieXZiXU+AJYmouxzapw0SaLgEdDCvT5LODS0LUYnwLsyj0+NqtumkaYElE4nyCw1+BYYsFl7MO/zX20BVgI7GCROlzpNPPZKPPZdFu0tmwZwAohuPtR2yYAjAywnhB0AXUJkIFulUDY49U4eGVj4YpiV07spzO14qnDr8bHMP/uPapPmkPPZo5QjAHaSPYfD1LOKJ9GiTl9gkax6B+J+cORoksOmzfiwcXBYGszHa/HeRMOIGb+VLikfV7kbAVhtsZJKrr0wdvCI2bljI/AwSYpBNxdLt6wduYEDYFlOJyK5oax6C8U//TM9jVKlw+3I5j6VyTb1kUpxtDAyqutlH4ELRHwtaXZDK+5oVsoJVd25e+Nq8I1xa2GmzBTg3gcEwOLPHnZHXcwPBUrfLm2nlLYyqmaZRGKJYHV1QVy9ft79Ul+b/nuVCaAKID102V6gEFV48fksh6I+ppBxhETDbnNtvsLvwAxQuW/4F2IsPJT8fGTdAAAAAElFTkSuQmCC)',
                    oncommand: "BrowserReloadSkipCache();"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      オプション
        CustomizableUI.createWidget({
            id: 'Einstellungen-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'Einstellungen-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30aa\u30d7\u30b7\u30e7\u30f3',
                    tooltiptext: '\u30aa\u30d7\u30b7\u30e7\u30f3\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADy0lEQVR4nAXBa0wbBQAH8P/d9XG9lrtrGV17pa6VjIbXBgwG6DoX/cJcYmZIXIwa5wcyNEajkanRJX7SxSzxi36Z02mEKZosI0zY3DLcmgwQhG1uhayjQIE+dtCVlj7u1fP3Iz74KYqyKgO6hnhaprxOWptfK+1jTISTptSbLo4oUBQJkiCgazLUYg7JyD3w2jJu3LgGUlI0SLKCucX8ie4OIfpfJP92+27HD1/1No1ui7GXDEQZRqIMiiyDAGA0kGB5FmYrD5a1geg7G8F0eIPNKaR46Yt2kw4COoCSCvz9z1IsmtSX0o/Xput8Ff2qIoPQClAySdh0EUo+DcrV3ktLcvlM936h1lfNWX4PJbUzfzyUF0QYDjQLXKCm0rcQjlZvi9Hv7Q5eMeoyzIQEh5UCW2EBGYvnjnYf2tV3qKPaHknIGDzdf8S0+Gt1KjQw9vP4Y2RloMpKVh1t526t3x/fqyklQC0BugaKMoBEcU3+8tyk+NfdNCRQ2NV0QH+uhjh79dy7h3cSBWzmgarWZy3TG7tb5a34i7Hw7R2J5fAe6GUQBEAFj52cfxIrrO8P1vaYaRNoXjiy9Gi1OaPwRIn1QCJNWEip4LIr+PjE4RcCT1e/VxeoOf7n5cujPp8vRaqqgkzZ/ObDRBHj99IwVTodda+8T67wjdCYCiyvZhG98HWZydxEqSTB5XLRW1tbhnD4gaCqKihP+6vQMvm5f69esG1GHmwqzgY/Y2Mwez+FrKxD1Skkb51/zUBk45pS6vD7/QiFQqssx39k53mN8u47hh0ORWyse+oSmxiuXdNbD26sp9G/N4a704u5xSvfvvN8sHawsaVzdP7O5MttbW0uv99vVxXleCgUukJuZ7OQi3moigTXM2+dst35vPcN7ySaGgR80mM11Xu2y+lUjJ69fT3Q2NhYIcsycrkcrFarIIpi2fBkNQLSYYSNsEGHWd/Jk8Guzj0oFArgeIf5s5Mfnl9ZWfmOZVmz3W6nstksBgYGNmdmZiaam5uXDFx+DmbaCUZxwla2IilJ0sjICIrFItxuN4LBIARBYPL5PHK5HCwWC6ampn5kWfaU1+uVKdZKwVFhhJMzg2MAhmGuDQ788ogkydOiKB4MBAKVmUxGHxoaysiybEkkEvrw8PBvPT09E6qqghAEAS0tLRAEAQxjAU1bQNM0dF3H2NjYN52dnX2hUOg6z/Ovx+PxT41G42xDQ8NFj8ejyrIMwu12o76+HgzDwGg0wmq1guM4UBQFgiAwMTEhkCSpdXV1pXRdBwCUSiUoigJJkvA/ZkG9QWy1G6AAAAAASUVORK5CYII=)',
                    oncommand: "openPreferences();"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      プラグインについて
        CustomizableUI.createWidget({
            id: 'aboutplugins-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'aboutplugins-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30d7\u30e9\u30b0\u30a4\u30f3\u306b\u3064\u3044\u3066',
                    tooltiptext: '\u30d7\u30e9\u30b0\u30a4\u30f3\u306b\u3064\u3044\u3066\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC/0lEQVR4XnXPXWwUVRjG8f85M7N22e52+WitFZspha2IYjVbatVEK02xQiDaGExJxQjohdrAhd+FK0yM12gMkTTGKtoQlMQYNCGtGFBCRW5QkVYpxBbb7Rfbj9kzZ85oZC/WJv6SJ+/V8+Z9xe79Pye07x2dnxn/wp+dPyADC7IaAxGtgpXCMldzvsp6yiOX81BaUUjG4okH44lojZkzX3rX5jBTGt83dzuO3VW9uvxkCIeMMUv4H9KJOPFFsUg8EsitQogOE5rOmrtuObntuYa21vb6pY9srH1SStmjfV2OYCHEC6/2l6DnPy8vizdOj05SV1dJw8NVaAOeB2EIZ89c5dhnfWenpq63G4KLFJAD/f3TV34bPJX5a4Itj9/Bhs1VEILRQAg6gNr0bbTteKyuvGJZt/aDCgrI4liCIqso2dLkcl9DKb4HUoDIBwFaQ/WqpbTt3JR2q5cfM8a45EkhxPqm5pXPNz/q4uUACdICW4Al81OAp2G5G6Nl071ppYKtQSj5J8hksujlLU/UOOQ58kZRWCAlCAmhBcXXfyD1xys43uUwxM4WOzPE7FlkICglGsMYsCUI8d8XhAUlYoLUpWeJjnfhXtg1s3vthwNfNb3B0cZOpJdT3uUhGMnky9aNkm2BZcPiOLhVJfwylyYbJKlrScSfqjn/FoYVUTtAjo2Ov9nzUe/wtbGA6VmQ5C+REA9HKYmFfNA9yPaPW7uHf8y8RGZ8lnX3p4naJwhYI8Mw7Dv93bmNXQe/GRweUeQ0SBtiF99h8elmzh18kd7D77+74ebDu5KL1AF+/bOdod8zJBMuIWWiaf17KJ3DV8HqO9eu+KRjT0vt7ambsI7Uw5IZspmAyfNX9laWevtRQAgE1CMoQ/L1vwt8rQBQSlesSt3a/cyOhxq/P358Zltkz1Dl5nvWMDEGZy68DexFoCkgKRCJ2MMDl0Za973+6aEjvXaHmuMBTvT1ULwMUu5rGLazgM0CjiMngZ3SVwgbUDzNt6c8ovY6LH5igb8BucA1WORtKKUAAAAASUVORK5CYII=)',
                    onclick: 'if (event.button == 0) { \
                                  openTrustedLinkIn("about:plugins", "tab"); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      Chromeフォルダ
        CustomizableUI.createWidget({
            id: 'Open-Chrome-Folder-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'Open-Chrome-Folder-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: 'Chrome\u30d5\u30a9\u30eb\u30c0',
                    tooltiptext: 'Chrome\u30d5\u30a9\u30eb\u30c0\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABc0lEQVR42mNkoBAwUmxAw7LHC/nYfsWhS2zYfIDp0MLk/wQNKJtz639ptArDmSc/4IJ//vxluH31FU5NZy7dZV/W5PYLboCyujjDj5+sKIrEhRHs33+gBv9lYHj69CPD7eu3pBbW2D+3i5/Lylg6++Z/cRl+hm9f/jF8fPeOoJ+ZWVkZzp04nfjr58/HQO4toAE3/guKcDG8f/cdrKAmVo3h2MPvRAVge8tyP8aSWTf+MzH/ZPj7h5lBV1+B4c17guEGBh/fv//15OEjU6AB1////PmRQUtTieHLT3aGf8TpZ3jy4OHxyTl6VowlM6////jxBYOltRHDi9f/iNL888cPhqePHqXPKTOfxVg889p/GSkeht8MvMCYIM761y+evZqcoyMOjkaQAfr6UgzPXvxjYGVjIqj5/79/DLdv3Fs1s8QkHGyAd9rEWH0rjwUfP/0iyvY/v3//3bmgxPLB5X1nwQYAsQVxwYYBTsAMoAhQbAAAAjCiCL9JqqgAAAAASUVORK5CYII=)',
                    oncommand: 'Services.dirsvc.get("UChrm", Ci.nsIFile).launch();'
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      ページ情報
        CustomizableUI.createWidget({
            id: 'context-viewinfo-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'context-viewinfo-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u30da\u30fc\u30b8\u60c5\u5831',
                    accesskey: 'i',
                    tooltiptext: '\u30da\u30fc\u30b8\u60c5\u5831\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACp0lEQVQ4jV2TPW9cVRCGn3fOuffu9Xo3TnCEkANYQotB2WJpUqWwJSqIUuQPRKKlsAUFpeUmEpXXEv+ACClFitQowmUIMmxASowIkjuQk9jr/fDd7F3fQ7HWdcxI04zmfc47RzPif9G4cXdR0iqy5flL9VYRAoe9rCNpG9nW7v1be2/2qxR+/v0c0vp7C/NrV5euMCkijoYTXucnEALDYcaLwx7DLGsjbTy7d7NbAk7FP12/ttSq1uZ48vyYLA/UZhwg+qMCZ5A6GGVDesODDtLK0x8+69rUh9avX1tqWVzn0dMhWR4A8eDOxzy48xEyEWQcB4O0Tlq73JK5dQBr3Li7+P7C/NpsbY4nf2dTTxKYyhnNG/KGeQfeEVXrRJXqWvP2w0UvafXq0rv8+vz4TCwhJz795s/p62ZlHQkJ4uoFTnqvVj2y5UnwZOP8XNPj75rlTze/3MV5YU4IoQCJS5Bzy3b5rXrraDgBQQEMRgUH/QmNL/4oAXHiiSueJPUkM554JmK2FlGppC1fBBjnBeNJ4HAwQWZEicN7KwFRxeHjaU1mSDCbBIZ9jx0cHXfyyQkvD3NCAHPCnOEid85BUvEkMxGV6jQvzkVk45OOSdp+dTDAOZDpFCCcK3cMnziiiidJp+JaPcZZgZzfNmRbR4MBl2aENE0zIXc2go8cUeKJU0+lGvPhlYh/9kfI3Jbt3r+1N85ftykyUkcJ6Ww2SsCPX7+Nc4aPHY2FiH5vzL8vx+2dzeaeP93Ejfykv+zMtwKzAHzy1V8kaVTOXavFfDAP3f0BP+8cdGS2AWAAz+7d7CKtSL22D11U5MQBqha4GAfeqQYuKOP33/Z59PhFmxBWfvm2cXZMb0bz9sNFma3K+eUkSVs+dozyoiPnt2Vua2ezee6c/wN/E94boB6vcgAAAABJRU5ErkJggg==)',
                    command: "View:PageInfo"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      証明書マネージャー
        CustomizableUI.createWidget({
            id: 'context-viewcert-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'context-viewcert-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u8a3c\u660e\u66f8\u30de\u30cd\u30fc\u30b8\u30e3\u30fc',
                    tooltiptext: '\u8a3c\u660e\u66f8\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2lpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcFJpZ2h0czpNYXJrZWQ9IkZhbHNlIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ1REVFMjI3ODQzMjExRTA4QzZCQkNCQTk0MDlCMTEwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ1REVFMjI2ODQzMjExRTA4QzZCQkNCQTk0MDlCMTEwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzMgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ1dWlkOkFDMUYyRTgzMzI0QURGMTFBQUI4QzUzOTBEODVCNUIzIiBzdFJlZjpkb2N1bWVudElEPSJ1dWlkOkM5RDM0OTY2NEEzQ0REMTFCMDhBQkJCQ0ZGMTcyMTU2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+22TEXgAAAY1JREFUeNqkk79LQlEUx7/vvauVg/0QGpIKBCdFUHCwqaRoMqKhsVpb+wscWmoJWtqCnB2iaAo0GnIIGipoiFqCBlHUIrPevdfuuaY5OKQeuBzufefzPd97eNeo1+voJ4x+BVhyNZhQeaJH/pVJWfcmjy4OhLS7Ii3TgeT67CYTUpo2/8L9da4rgWA0BmKZENKSQoBm4Q+F/gU/3t6CGGIZF9LkgquNAOccN7kcRj0eXVgqFhGJxXCVyeCzWsWQy4WZeLxRqxhiScASCpRSaoFQNNrqNOnz6bNKuYKFpQTOT071nmqJ4Q0Hwmp30HFgzMJZOq0dUM2fA6EEuBJoc9CMucN3rIcHsBF2atvNaK8l1rTpCm0Ommt3nuH47g0vpW8spwqt3HRAjK2vwAWjA1It5fO6y13RxHb2A3uLTuxnP7EyLXV2mwYuHwqYgvxtKBh7r9aGTPXBFwi0bD48lZFaG8OEm2HH32kq4yCGWCPidWwND8LXy39cqeHZUNmp1gi9iy55mni579f4I8AAEIoGFNnyuUoAAAAASUVORK5CYII=)',
                    oncommand: "window.open('chrome://pippki/content/certManager.xul', 'mozilla:certmanager', 'chrome,resizable=yes,all,width=830,height=400');"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      保存されたログイン情報
        CustomizableUI.createWidget({
            id: 'context-viewpassword-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'context-viewpassword-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u4fdd\u5b58\u3055\u308c\u305f\u30ed\u30b0\u30a4\u30f3\u60c5\u5831',
                    tooltiptext: '\u4fdd\u5b58\u3055\u308c\u305f\u30ed\u30b0\u30a4\u30f3\u60c5\u5831\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAs5JREFUeNp0U11IU2EYfs5+canzF8ufICmvTJOTpWg/CrnIi6BQ+tUuFC/CupHqIokYRnnvhWIIRSQ6hX4RNOeFFUyXbS2GgXNh6tJtbPNvO+dsp+87U5mhHzzn/d7vvO/7ve/zfi8jiiKGHiqgkoORyZAPoJwgE9G1QDAeicDGhSFil6XYlIwQQXXS/ryawyU15aJam8ttrEAMehx/vg+V+FyOfmLzgUDcNUCIFwtSs45cOVbdct081mufnTYNhyMCMrMPZp88daluarRf7l10zpFkLf8HkNFPkENlQVWjzmrqdTjmhw3Q+uvlyWv1roDdYLO8dRwtO6+jNiGeXrYTUgbrHA4lJKanLXgm5hQa6MiRbuuGv6tOPxunyKU2e3KwHhJXQlwwqKtqLwoLAny+ZayteKBRCYhXi+A4Pkht9gwQ5PHl2+dhXdGJSjYUCMDrWkDAN4+UBAZxGemwTk3/pDYMsZ1JVUqQ6OTFbRJHjO8Nue6lpVBh8ek8tWZfWpygBQ/BPTZm+mW32noZBiOz6Sp0l2qjzoRRrEXA0Hfw5BoDIQwl2dI3cLvxvv6yZ9GBwRc9A0TvIM7jcxlKvrs8iTQcOwLIYsohnMJIoKSKXCkJ+jE6U4hzmZbqncR5UpKxbeSFaMBYXvqfd30kopU4o6c4gdQp0prZhnO3WColfSsAdY4BTRI3mu9VkP1TZ7KCptwJQZxEKAJ/2A8qJZ2cS7c9NgBXS4GcFCmo1K6uZ+3viGjjgyJ1YCsuVbL03C24UXHhrLQ3Do5uzwJefwUuFgIHtAhS/c6j1tq2Fn2I+yHUISdiNr4akezyawtZW5/FHJ0gmLeHiRL2xgL1TRZqOpYPmvR9v30YmJgh/fwUuEv+c9DHm7xhL7BBSlAyx6Fgom1kGIZyoSFILMrEmbxUNNiX8dLqwsRmSQGCVTSrOkjtLHE0EzQhS41/AgwAEXpPSomMNg0AAAAASUVORK5CYII=)',
                    onclick: 'if (event.button == 0) { \
                                  window.open("chrome://passwordmgr/content/passwordManager.xul","PasswordManager","chrome,dialog,centerscreen,dependent,resizable"); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      履歴を削除
        CustomizableUI.createWidget({
            id: 'context-deletehistory-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'context-deletehistory-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u5c65\u6b74\u3092\u524a\u9664',
                    tooltiptext: '\u5c65\u6b74\u3092\u524a\u9664\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC6klEQVQ4ja2TT0yTBxyGv5Vw13jxsIsmJh48OA9LlrhkEjk2WXBu08iyKCEENXFW29KNIASU6YisCQWZUAZosUOcUWmrBYEUBFdtWhQp9I+lyL+W+rWlLX7I9+y0OjOyk+/9efLml/cnCB86fdcv5A2by/ucdzTLLqtOct4tkxxdpxasV0/92dNU9tn/wkPmGoPHpn0T9o6yNO8nHo8hilFmX3rwOLqwXi1eMV0uLd8QHjBV/+pzNhKLhPCGYnT3BzHcfI7e/IwOi4+nUwsEvSP0/lZCS83Rs+/Blvbavc47Kim6GGTINUfPwyC+cJxoPEkkvoJ3Jk7HfR+3BgNMuix0VH2Taqwq+SQrsLepe6ddFl68XMbcFwAgJopMvZonA2SApAxNd3043CEedKpo+unbjqyg//cT83OhcTpt00yE46TWZJKpFA2tRhZFkcTqKjdt/QxNiVwyuRl/fINmXUHw3eXbjmdi0VkuXnOzmJaIra7zBig7V0lnz200FZXcHxljXJQ43TDGTHCMVt1X6azA2lyciS75qTS6mElKLKbXCYsJqn+pQ1NRyZDLQ2QNnFGJk/WPCPkHadEeeCforisM+Mct1JvdDE6LzGUgnJDoHRgmsBxn4S14/migv3An9rxc7Ae2YDqyU8wKjNWFxoEbWkbcU9SavURkiEmQWIeEDNO3DHjUn5O5V4c8YSXVdZq/SnfJtjzFSUEQBKG5pnR3e9XX6UlnO9csT/jZPIkr+JpkWiKZkrAf2k76Xh3olaDZDOe3Ebn4Bbb9ikC2xZVz32uv1x5kYtTAw8dOzhtHUeuHUdU7sOflIj/p4d95XbEV+74c+b1BNeiOlF/Rfpm83XiYp301BCY6CTxv40HBJlZajkHFVlbVAjG1QKgkB9t+xex/Jq3/8btP688UmPQ/KEMGlTJtUCnT3UV7xNFjO+Q5zTaWynLxF32EXZnz1pqv0G38VRvEcfBjrTVfEbTvy5Gt+YrwP/DfJyYwPd442XkAAAAASUVORK5CYII=)',
                    oncommand: "window.open('chrome://browser/content/sanitize.xul', 'Toolkit:SanitizeDialog', 'chrome,resizable=yes');"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      拡大 (Ctrl++)
        CustomizableUI.createWidget({
            id: 'zoom-in-ToolBarbutton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'zoom-in-ToolBarbutton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u62e1\u5927 (Ctrl++)',
                    tooltiptext: '\u62e1\u5927 (Ctrl++)',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    oncommand: "FullZoom.enlarge()"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      縮小 (Ctrl+-)
        CustomizableUI.createWidget({
            id: 'zoom-out-ToolBarbutton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'zoom-out-ToolBarbutton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u7e2e\u5c0f (Ctrl+-)',
                    tooltiptext: '\u7e2e\u5c0f (Ctrl+-)',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    oncommand: "FullZoom.reduce()"
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      タブ移動
        CustomizableUI.createWidget({
            id: 'moveTab-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'moveTab-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    oncontextmenu: 'return(false);',
                    label: '\u30bf\u30d6\u79fb\u52d5',
                    tooltiptext: '\u5de6\uff1a\u5de6\u306b\u30bf\u30d6\u3092\u79fb\u52d5\uff5c\u53f3\uff1a\u53f3\u306b\u30bf\u30d6\u3092\u79fb\u52d5\uff5c\u30db\u30a4\u30fc\u30eb\u2191\uff1a\u5de6\u306e\u30bf\u30d6\u306b\u79fb\u52d5\uff5c\u30db\u30a4\u30fc\u30eb\u2193\uff1a\u53f3\u306e\u30bf\u30d6\u306b\u79fb\u52d5',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD1UlEQVR42u2Wa0wUVxTH/7M7u8urgAiLopHWxUiq1FZiU2F94gLia+vaxrTGBympRLHaD2p8El8RP2nUkJj4oaloRIS1hQoYFNYC2uIj+KgGUwu1RlZZlzfC7I7nLrMEcYmYkdgPnORkds7emf/vnHvuvcPhPRs3BDAE8H8DUMzYkj0fGr8cDa9UhYUEQBRFmQIcbC3tsDe3d6GzZYll39f5FHZ6AlBM25i1yDswODfVGIsxI3zxpOndZDnCH6h70opMczna7c8WXz7w7Tk3RG8A75npBU1rlkznrYIPKmpbwXHy54jVjxUxJtwXWmUbjpy1CGXp8wgJ7X0BgqbvLGjYtzYJP1U1g2fikssCELtdIF8e/QF2HSvGhW0Jw+kvW18ALQHUb0hOQllNM5TvQJxmVZIQIThF6HW+MBf/gRPffxFKQatHgB9WzcW1uhb55eeUUHBqcAq+uwKOF/hslArmoqvISo3pB2BHfn3aykT8ZW1zsctQh0KhQqO9FFVXEzFy9Hx8HPUrIoLgAjiZ6qEC4fqvxusMyfdSlsXhkb1jgNnTIuMUPb97ohyLa2B/Xo4Ht6ZhHM14TZcRi2blIbfgGipOZkTW/X7mvvsp9Zw9RS+0If7QT4mEj58XWjuEAcw/E1FRpmqPYxXEZW24gb/vxGD9nNXIqjiIBpgQPTEHZZXXYWu0o3BTnIY9Omz27kJb2ncJ6OwU4HA436QsmQpdQgd+KRoJq60RffcrBsVCutAAbFmwHfVNlTh/8yyeOU1InJWDvIJqnEiZFMQAtIa9RfUCCTsdIkQMZOej9ERvulRjQvhWpJsOw9p6mlR5187nrpBTdELDj4ajMxJ/PtwMndaIwupTuHxXD07MROnOqFBXBcg/kq5vZWGfInzh+qDj6xJ+pKW77bWV05OKFPRTB0IXsgDFt37GpQr8VrofK1w9QO7rqunbmXKCEbGxC4edSYn/BlX/Hu1/6fYKevFqaAMicCj3Lgo3Yricpc5Hr0DC5Jn++csMcbj/NK/flSNKbcUAeZ7OhceApRylJbthkgOgmpKMpEkzfMxL4z/Bf81XXgNgjekkcYcgESuBfx4BF0tgsWQgjUIP5QDQ6xCWlIHbpOHv6dRm4iG0+cTHdd/X1gIlF1ziG+i2jtwuB8DdwB+SB8LD9LMmNazDcUM88KCGMj9P4gd6xJ+TO+QeN6xxWQOrPVUoygT950Zkj40Ais2wlGW8Ku7OYrCMn7oaXwaPQ3abDZUle7G2r/igA5AHk4dJgtT7rm8AR+9BgwnA3q0h95JE2ReQ4GnQe7UhgCGAl5SxTKaI7XnTAAAAAElFTkSuQmCC)',
                    onclick: 'if (event.button == 0) { \
                                  gBrowser.moveTabBackward(); \
                              }; \
                              if (event.button == 2) { \
                                  gBrowser.moveTabForward(); \
                              };',
                    onwheel: 'if (event.deltaY < 0) { \
                                  gBrowser.tabContainer.advanceSelectedTab(-1, true); \
                              } else { \
                                  gBrowser.tabContainer.advanceSelectedTab(1, true); \
                              };'
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      ズームコントロール
        CustomizableUI.createWidget({
            id: 'zoom-control-ToolBarbutton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'zoom-control-ToolBarbutton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    oncontextmenu: 'return(false);',
                    label: '\u30ba\u30fc\u30e0\u30b3\u30f3\u30c8\u30ed\u30fc\u30eb',
                    tooltiptext: '\u5de6or\u30db\u30a4\u30fc\u30eb\u2191\uff1a \u62e1\u5927\uff5c\u4e2d\uff1a \u30ea\u30bb\u30c3\u30c8\uff5c\u53f3or\u30db\u30a4\u30fc\u30eb\u2193\uff1a \u7e2e\u5c0f',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    onclick: 'if (event.button == 0) { \
                                  FullZoom.enlarge(); \
                              }; \
                              if (event.button == 1) { \
                                  FullZoom.reset(); \
                              }; \
                              if (event.button == 2) { \
                                  FullZoom.reduce(); \
                              };',
                    onwheel: 'if (event.deltaY < 0) { \
                                  FullZoom.enlarge(); \
                              } else { \
                                  FullZoom.reduce(); \
                              };'
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      Cookieとサイトデータを管理(一度Firefoxのオプションを開かないとCookieやサイトデータが表示されないようです。)
        CustomizableUI.createWidget({
            id: 'siteDataSettings-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'siteDataSettings-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: 'Cookie\u3068\u30b5\u30a4\u30c8\u30c7\u30fc\u30bf\u3092\u7ba1\u7406',
                    tooltiptext: 'Cookie\u3068\u30b5\u30a4\u30c8\u30c7\u30fc\u30bf\u3092\u7ba1\u7406\u3092\u8868\u793a\u3059\u308b(\u4e00\u5ea6Firefox\u306e\u30aa\u30d7\u30b7\u30e7\u30f3\u3092\u958b\u304f\u5fc5\u8981\u304c\u3042\u308b\u3088\u3046\u3067\u3059\u3002)',
                    style: 'list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFf0lEQVR42u2Xa2wUVRTH//Pc3dnddne73VLaroU+QN4IVOXhA3k0aBBtjJEgqcbEhChBPzSoMaIflE9q1BAhxhgjGBGwMT5QiR8QfBQUW21p7YOyfbjb3W633ffO7IxntoCk3baJQPADJ7k9d+bOvec35/7PnS0DgMF1NOYGwA2AywGqyk3F5HYxDMNne1jTtKaGjvjr1xJgNQU/NtHDBKBQk051JpSrDnBLqWEpBd/BsMzmySaoqraPXOJKgtJLfHSmO3k6A/Dxnt1c5bxFs3e/+sq2vr7+bdrVerVJ3nh6UeGe5194+d3h4WALc/KbI/cKgvh5SpbZeDx+jcOPmslkgigIalpNb2G+PLD3IY7j3pcVhQ1HohKl59pmgGFgNZtjgsCrFGoH8+Gbu+5nWHZfWknzI5GITVVVdrIF9FneXg+Cvh5wnIpUOApVtKKguATTitxgmcmrmmKpuRZLiOM5BRqeZV56sma9wWR632CU+JFozJFOq/xEk5OJOAZ627CkECgrsiEpS1i0shy//dSNn5vbMRAVUFA6BwajcYIVNAJkFaPIBeORsBKPRZ5iHls7bxWl5SCNsuFY0qYxrCgaDCBdgOcFcDwPluN06UIO9+ORu0vg6/Jh2e0V6DvbhWhSxqA/hny7FUJBHl77tA0VlZWZcGlFgaLIUGQZqVQSySQVj5pOOXKtIUqUnszHme01K5aQNL/Xt37A75cikdilDFyeTUHg8Mzmudh/oBll5W7ML4ziVEsE1WvL8F2jH02Nfahe4caho60Q7TmQ06NaGispi1lSXC5nTNcCJWQjU/fougrqtujP+f1+dmhoKKsGFruNeOA2J7z+JDijAef9aXi6o6haZoerZBo6uodwsy2KcEjG140BNPvUrJtgt9mQ73IpTGZDUMU8V7vBTjRBfXBwMEAQgdGhMbZ+JoeK4hyYKdVmEltHlx/es224c/18eJvPwWjikOsuwf76s5jlNqH+90g2CSI/34m8POcFRWhuZmftBk5Lp0foWhoeDsHnG9AHxk3dWmXFj21RbFxeBKdDwLnzI7BYOFgtIrydf8NqM8Oca8EPp3phkzh81q5mCc/AVeCCLdeWKSg6daXMUfx0zco/yZdHo1F2YMDPZzsLnqh2w+Gwg03GkAyF4PGG8cYXAbz4YAH2nhjBPbMkLK+U0NQbgc1qxCe/hscD0L7nu/IVi9ms03nfPnyiNANQu25BPfm7EokkHwwOSao2nn71XCfWLS6ARHN72oNQzDlo7Qxg1UInvjozBGlkGCVuC463JVDoEskPZwFgkeewxYxGo/4xO/3Bt01rMgA1t5bsJr9FlhVxOBJzUAbGCdEscqh7eCnERAicKOJ8UMacmWYwBNtxLgSHqKHfQ2OSGe819CMua1kAGDXHIgVFgU/R5ZHDv/RszwCsqTRvIUnUpVUYE4pWShLIehgtrCjC5jtmoau9Gw0BFTULjFDjKRw67UcqqWDTkhmob/GitSeI7KYpRoHt5lj9a8q8c+yv6L4MwIrpWEq8b1GT0qwwm1DFCVaA3e7E1g3LUGZVkBjxwe6woiduwh99KppaWtDp8WJC07QUp8qtFDRGbefJfhzPAFTlI4d0d1RjYNR4VgcwYgpzFxVixk0lmWLq6PKgz+ubaooOkGAUtZXRkCA9bmrwY+DSD5KFNhyi3myNw0zyUwL8RyMAdBGzpzGE+6CXIv2hgx48VVEdUdXSt7CYtkK8wkBZjYIprAoPZftgWwy76FbmRDRQcwqUVaeIaipAlw6QaaNi1Pv/+tF7LPXZMYvrtatSR19UL7MUMxogRfcu9WlSYFDG0ZSGbnomcDED+mL8BX+xYYp+NlMv82P7Y6+Vi1vw//m/4AbA9bB/ALmmOeVziUYzAAAAAElFTkSuQmCC)',
                    onclick: 'if (event.button == 0) { \
                                  window.open("chrome://browser/content/preferences/siteDataSettings.xul","cookie","chrome,dialog,centerscreen,dependent,resizable,width=700,height=560"); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      開発ツール
        CustomizableUI.createWidget({
            id: 'toggleToolbox-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'toggleToolbox-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    label: '\u958b\u767a\u30c4\u30fc\u30eb',
                    tooltiptext: '\u958b\u767a\u30c4\u30fc\u30eb\u3092\u958b\u304f',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    onclick: 'if (event.button == 0) { \
                                  let ev = new KeyboardEvent("keypress", {bubbles : true, cancelable : true, keyCode:  KeyboardEvent.DOM_VK_F9, shiftKey : true }); document.getElementById("main-window").dispatchEvent(ev); \
                              }; '
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });
//      カスタムボタン
        CustomizableUI.createWidget({
            id: 'three-ToolBarButton',
            type: 'custom',
            onBuild: function(aDocument) {
                let toolbaritem = aDocument.createXULElement('toolbarbutton');
                let props = {
                    id: 'three-ToolBarButton',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    oncontextmenu: 'return(false);',
                    label: '\u30ab\u30b9\u30bf\u30e0\u30dc\u30bf\u30f3',
                    tooltiptext: '\u5de6 or \u30db\u30a4\u30fc\u30eb\u2191\u2193\uff1a\u65b0\u3057\u3044\u30bf\u30d6\uff5c\u4e2d\uff1aabout:config\uff5c\u53f3\uff1aChrome\u30d5\u30a9\u30eb\u30c0',
                    style: 'list-style-image: url(data:image/png;base64,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)',
                    onclick: 'if (event.button == 0) { /* 左クリック */ \
                                  openTrustedLinkIn("about:newtab", "tabshifted"); \
                              }; \
                              if (event.button == 1) { /* ホイールクリック */ \
                                  openTrustedLinkIn("about:config", "tab"); \
                              }; \
                              if (event.button == 2) { /* 右クリック */ \
                                  Services.dirsvc.get("UChrm", Ci.nsIFile).launch(); \
                              };',
                    onwheel: 'if (event.deltaY < 0) { \
                                  openTrustedLinkIn("about:newtab", "tabshifted"); /* ホイールスクロール↑ */ \
                              } else { \
                                  openTrustedLinkIn("about:newtab", "tabshifted"); /* ホイールスクロール↓ */ \
                              };'
                };
                for (let p in props)
                    toolbaritem.setAttribute(p, props[p]);
                return toolbaritem;
            }
        });

    } catch(e){};

})();