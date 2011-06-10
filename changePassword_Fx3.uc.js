// ==UserScript==
// @name           changePassword_Fx3.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    changePassword
// @include        chrome://passwordmgr/content/passwordManager.xul
// @compatibility  Firefox 3.0, 3.1, 3.2a1pre でしか動きません
// @author         Alice0775
// @version        2008/12/08 18:10 チェックボックスで複数選択一括変更, その場合は*を半角一文字でインプットでその項目は変更しないようにできる
// @version        2008/12/07 18:00 変更後のスクロールを修正
// @version        2008/12/07 16:00 filter掛かっているときの処理修正,複数選択,一括変更できるようにするかどうか ALLOWMULTI で設定可能
// @version        2008/12/06 19:00 Firefox 3.0, 3.1, 3.2a1pre 用
// ==/UserScript==
// @version        2008/02/21 20:00
(function(){
  //-- config --
  var ALLOWMULTI = true; //複数選択,一括変更を  するtrue， しない[false]
  //-- config --

  window.changePassword = function () {
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    var passwordmanager = Cc["@mozilla.org/login-manager;1"].
                          getService(Ci.nsILoginManager);

    //変更すべきhost/userを格納するオブジェクト
    var seletedSignons = getSelectedItemFromTree(signonsTree, signonsTreeView,
                            signonsTreeView._filterSet.length ? signonsTreeView._filterSet : signons);
    //選択範囲が1行でないなら何もしない
    if (!ALLOWMULTI && seletedSignons.length != 1) return;

    //host/userをゲット
    var hostname = seletedSignons[0].hostname;
    var username = seletedSignons[0].username;
    var password = seletedSignons[0].password;

    //プロンプトを表示してパスワードを入力
    //alert(host + '\n' + rawuser);
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);
    var username = {value: username};         // default the username to user
    var password = {value: password};         // default the password to pass
    var check = {value: false};               // default the checkbox to true
    var result = prompts.promptUsernameAndPassword(null, "Change Password (The change is reflected immediately, The undo is not possible)",
                                               "NOTE: The change is reflected immediately, The undo is not possible.\nPassword for\nhost= " + hostname + ": "+seletedSignons[0].password,
                                               username, password,
                                               ALLOWMULTI?"All the chosen user/password change (input * , keep the original)":null, check);
    // キャンセルなら何もしない
    if (!result) return;
    //実行
    var nsLoginInfo, newItem;
    var new_username, new_password;
    for (var i = 0; i < check.value?seletedSignons.length:1; ++i) {
      nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                                            Components.interfaces.nsILoginInfo,
                                            "init");
      new_username = (username.value.replace(/\s/g,'') == "*") ? seletedSignons[i].username : username.value;
      new_password = (password.value.replace(/\s/g,'') == "*") ? seletedSignons[i].password : password.value;

      newItem = new nsLoginInfo(seletedSignons[i].hostname,
                                seletedSignons[i].formSubmitURL,
                                seletedSignons[i].httpRealm,
                                new_username,
                                new_password,
                                seletedSignons[i].usernameField,
                                seletedSignons[i].passwordField);
      passwordmanager.modifyLogin(seletedSignons[i], newItem);

      seletedSignons[i].username = new_username;
      seletedSignons[i].password = new_password;
    }

    //スクロール位置保存
    var box = signonsTree.treeBoxObject;
    var scrollPosision = box.getFirstVisibleRow();
    //リフレッシュのためスクロール
    box.scrollToRow(0);
    setTimeout(function(){
      box.scrollToRow(scrollPosision);
      box.ensureRowIsVisible(signonsTree.currentIndex);
    },0);
  };

  //ツリーの選択している行をゲット
  window.getSelectedItemFromTree = function
      (tree, view, table) {

    //ツリーゲット
    var box = tree.treeBoxObject;

    //ツリーの選択範囲をゲット
    var selection = box.view.selection;
    var oldSelectStart = table.length;

    var selCount = selection.getRangeCount();
    var min = new Object();
    var max = new Object();
    //選択オブジェクト
    var seletedSignons = [];

    for (var s = 0; s < selCount; ++s) {
      selection.getRangeAt(s, min, max);
      var minVal = min.value;
      var maxVal = max.value;

      for (var i = minVal; i <= maxVal; ++i) {
        //選択行を格納
        seletedSignons.push(table[i]);
      }
    }
    return seletedSignons;
  };

  //ボタンの作成
  var button = document.createElement("button");
  button.setAttribute("id","changePassword");
  button.setAttribute("label","Change Password");
  button.setAttribute("oncommand","changePassword();");
  //参照ボタン
  var aNode = document.getElementById("togglePasswords");
  //参照ボタンの前にボタンを追加
  aNode.parentNode.insertBefore(button, aNode);
})();