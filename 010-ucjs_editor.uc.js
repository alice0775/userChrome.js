
// ==UserScript==
// @name           010-ucjs_editor
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    テキストエリア等のコンテキストメニューに外部エディタ起動を追加
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Alice0775
// @version        LastMod 2007/10/21 03:00
// @Note           54行目 _editor,_ext,_encodeは,自分の環境に合わせ記入すること
// ==/UserScript==
 /* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* Alternatively, the contents of this file may be used under the
* terms of the GNU General Public License Version 2 or later (the
* "GPL"), in which case the provisions of the GPL are applicable
* instead of those above.
*
* The Original Code is the External Editor extension.
* The Initial Developer of the above Original Code is
* Philip Nilsson.
* Portions created by the Initial Developer are Copyright (C) 2005
* the Initial Developer. All Rights Reserved.
*
* Contributor(s):
* Kimitake
* Supported Japanese charaset and added ja-JP locale
*
* The Original Code is the MozEx extension.
* Copyright (C) 2003 Tomas Styblo <tripie@cpan.org>
*
*
* Contributor(s):
* External Edittor for textarea and input type='text', ignore input type='password'.
* Alice0775
* http://space.geocities.yahoo.co.jp/gl/alice0775
* (2007/02/21)
*
* ***** END LICENSE BLOCK ***** */


var ucjs_ExternalEditor = {
//この_editor,_ext,_encodeは,自分の環境に合わせて修正のこと
  _editor: "C:\\progra~1\\hidemaru\\hidemaru.exe", /* windows */
  //_editor: "C:\\WINDOWS\\notepad.exe", /* windows */
  //_editor: "/bin/vi", /* unix */
  _ext: "txt",
  _encode: 'UTF-8',
//

  _tmpdir: null,
  _dir_separator: null,

  init: function(){
    var platform = window.navigator.platform.toLowerCase();
    if(platform.indexOf('win')>-1){
      this._dir_separator = '\\'; /* windows */
    }else{
      this._dir_separator = '/';  /* unix */
    }
    //コンテキストメニューに外部エディタにより編集を追加
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "ucjs_ExternalEditor_menu_edit");
    menuitem.setAttribute("label", "\u5916\u90e8\u30a8\u30c7\u30a3\u30bf\u306b\u3088\u308a\u7de8\u96c6");//外部エディタにより編集
    menuitem.setAttribute("hidden", true);
    menuitem.setAttribute("accesskey","E");
    menuitem.setAttribute("oncommand", "ucjs_ExternalEditor.runapp(event);");
    var optionsitem = document.getElementById("context-sep-undo");
    optionsitem.parentNode.insertBefore(menuitem, optionsitem);
    //コンテキストメニューポップアップイベント追加
    var menu = document.getElementById("contentAreaContextMenu");
    if (menu) menu.addEventListener("popupshowing", ucjs_ExternalEditor.popupContextMenu, true);
  },

  uninit: function(){
    //後始末
    //イベント削除
    var menu = document.getElementById("contentAreaContextMenu");
    if (menu) menu.removeEventListener("popupshowing", ucjs_ExternalEditor.popupContextMenu, true);
    document.removeEventListener("focus", ucjs_ExternalEditor.checkfocus_window, true);
    //もしメインウインドウがすべて閉じられたら不要となったテンポラリファイルを削除
    if (this._tmpdir == null)return;
    var windowType = "navigator:browser";
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
    var enumerator = windowManagerInterface.getEnumerator(windowType);
    if (enumerator.hasMoreElements()) return;
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(this._tmpdir);
    var entries = file.directoryEntries;
    while (entries.hasMoreElements()){
      var entry = entries.getNext().QueryInterface(Components.interfaces.nsIFile);
      if (/^ucjs.textarea\./i.test(entry.leafName)){
        try{
          entry.remove(false);
        }catch(e){}
      }
    }

    try{
      if( file.exists() == true ) file.remove(false);
    }catch(e){}
    this._tmpdir = null;
  },

  popupContextMenu: function(){
    //コンテキストメニューがポップアップするぞ, テキストインプットならucjs_ExternalEditor_menu_editを表示
    if (gContextMenu){
      try{
        var target = gContextMenu.target;
        gContextMenu.showItem("ucjs_ExternalEditor_menu_edit", gContextMenu.onTextInput);
        if(target.hasAttribute('type') && target.getAttribute('type') == 'password') {
          document.getElementById("ucjs_ExternalEditor_menu_edit").setAttribute("hidden", true);
          //パスワードが見えるので,セキュリテイ上スキップします
        }
      }catch(ex){}
    }
  },

  checkfocus_window: function(){
    //メインウインドウにフォーカスが戻った, たぶん編集終わったので,テンポラリファイルの中身を書き戻す
    var target = getBrowser().contentDocument;
    var html = target.getElementsByTagName("html")[0];
    try{
      if(!html.hasAttribute("__ucjs_editor_")) return;
    }catch(e){}

    var textareas, filename, timestamp, encode, file, inst, sstream, utf, textBoxText
    //すべてのtextareaとinputに関して, テンポラリファイルがあればその中身を書き戻す
    textareas = GetAllTextAreas(target);
    if (textareas.length<=0) return;
    file = Components.classes["@mozilla.org/file/local;1"].
                   createInstance(Components.interfaces.nsILocalFile);
    istr = Components.classes['@mozilla.org/network/file-input-stream;1'].
            createInstance(Components.interfaces.nsIFileInputStream);
    // FileInputStream's read is [noscript].
    sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].
            createInstance(Components.interfaces.nsIScriptableInputStream);
    utf = Components.classes['@mozilla.org/intl/utf8converterservice;1'].
          createInstance(Components.interfaces.nsIUTF8ConverterService);

    for(var i=0,len=textareas.length;i<len;i++){
      target = textareas[i];
      if(!target.hasAttribute("filename"))continue;
      filename = target.getAttribute("filename");
      timestamp = target.getAttribute("timestamp");
      file.initWithPath(filename);
      //タイムスタンプ古ければスキップ
      if(!file.exists() || !file.isReadable()) continue;
      if(file.lastModifiedTime <= timestamp) continue;
      target.setAttribute("timestamp", file.lastModifiedTime);

      istr.init(file, 1, 0x400, false);
      sstream.init(istr);
      textBoxText = sstream.read(sstream.available());
      encode = target.getAttribute("encode");

      if(textBoxText.length)
        target.value = utf.convertStringToUTF8(textBoxText, encode, true);
      else
        target.value = "";
      sstream.close();
      istr.close();
      try{file.remove(false);}catch(e){}
    }

    /*
       Function creates list of all textareas contained within document. It
       recursively descends to frames and iframes also.
    */
    function GetAllTextAreas(doc){
        var list_of_textareas=new Array();
        //すべてのtextarea
        var textareas=doc.getElementsByTagName('textarea');
        for (var i=0,len=textareas.length;i<len;i++){
            list_of_textareas.push(textareas.item(i));
        }
        //すべてのinput
        var textareas=doc.getElementsByTagName('input');
        for (var i=0,len=textareas.length;i<len;i++){
            list_of_textareas.push(textareas.item(i));
        }
        var frames=doc.getElementsByTagName('iframe');
        for (var i=0,len=frames.length;i<len;i++){
            list_of_textareas=list_of_textareas.concat(GetAllTextAreas(frames.item(i).contentDocument));
        }
        frames=doc.getElementsByTagName('frame');
        for (var i=0,len=frames.length;i<len;i++){
            list_of_textareas=list_of_textareas.concat(GetAllTextAreas(frames.item(i).contentDocument));
        }
        return list_of_textareas;
    }
  },

  runapp: function(e){
    //コンテキストメニューがポップアップしたノードで外部エディタランチ, edittargetのラッパー
    //var target = e.target;
    var target = gContextMenu.target;
    this.edittarget(target);
  },

  edittarget: function(target){
    //targetノードで外部エディタランチ,  (別のJSA外部スクリプト UtilTextarea.js からも呼び出している)
    var textBoxText = target.value;
    // 一意のテンポラリファイル名を得る

    var file = Components.classes["@mozilla.org/file/local;1"].
               createInstance(Components.interfaces.nsILocalFile);
    if(target.hasAttribute("filename")){
      var filename = target.getAttribute("filename");
      file.initWithPath(filename);
      try{
        if( file.exists() == true ) file.remove(false);
      }catch(e){}
    }else{
      var filename = this.TmpFilenameTextarea(target.ownerDocument.URL,target.getAttribute('name'));
    }
    file.initWithPath(filename);
    file.create(file.NORMAL_FILE_TYPE, parseInt(600,8));
    // Write the data to the file.

    var ostr = Components.classes['@mozilla.org/network/file-output-stream;1'].
          createInstance(Components.interfaces.nsIFileOutputStream);
    ostr.init(file, 2, 0x200, false);
    if(navigator.platform == "Win32"){
      // Convert Unix newlines to standard network newlines.
      textBoxText = textBoxText.replace(/\n/g, "\r\n");
    }

    var conv = Components.classes['@mozilla.org/intl/saveascharset;1'].
          createInstance(Components.interfaces.nsISaveAsCharset);
    try{
      conv.Init(this._encode, 0, 0);
      textBoxText = conv.Convert(textBoxText);
    }catch(e){
      textBoxText = "";
    }
    ostr.write(textBoxText, textBoxText.length);
    ostr.flush();
    ostr.close();

    // 外部エディタをランチ
    if(this.editfile(file.path, target) == false) return;
    var html = target.ownerDocument.getElementsByTagName("html")[0];
    try{
      html.setAttribute("__ucjs_editor_",true);
    }catch(e){return;}
    document.addEventListener("focus", ucjs_ExternalEditor.checkfocus_window, true);
  },

  editfile: function(filename, target){
    // 外部エディタを起動
    var editor = this._editor;
    var file = Components.classes["@mozilla.org/file/local;1"].
        createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(editor);
    if(!file.exists()){
      alert("Error_invalid_Editor_file");
      return false;
    }
    if(!file.isExecutable()){
      alert("Error_Editor_not_executable");
      return false;
    }

    // setup target info
    target.setAttribute("encode", this._encode);
    target.setAttribute("filename", filename);
    target.setAttribute("timestamp", file.lastModifiedTime);

    // Run the editor.
    var process = Components.classes["@mozilla.org/process/util;1"].
        createInstance(Components.interfaces.nsIProcess);
    process.init(file);
    var args = [filename];
    process.run(false, args, args.length);
    return true;
  },

  //Compose temporary filename
  TmpFilenameTextarea: function(strURL,strName){
    /**
     * Creates a mostly unique hash of a string
     * Most of this code is from:
     *    http://developer.mozilla.org/en/docs/nsICryptoHash
     * @param {String} some_string The string to hash.
     * @returns {String} a hashed string.
     */
    function hashString(some_string) {
      var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      converter.charset = "UTF-8";

      /* result is the result of the hashing.  It's not yet a string,
       * that'll be in retval.
       * result.value will contain the array length
       */
      var result = {};

      /* data is an array of bytes */
      var data = converter.convertToByteArray(some_string, result);
      var ch   = Components.classes["@mozilla.org/security/hash;1"].createInstance(Components.interfaces.nsICryptoHash);

      ch.init(ch.MD5);
      ch.update(data, data.length);
      var hash = ch.finish(true);

      // return the two-digit hexadecimal code for a byte
      var toHexString = function(charCode) {
        return ("0" + charCode.toString(36)).slice(-2);
      };
      // convert the binary hash data to a hex string.
      var retval = [];
      for(i in hash)
        retval[i] = toHexString(hash.charCodeAt(i));
      return(retval.join(""));
    }

    //乱数アルゴリズム参考:http://www.sm.rim.or.jp/~shishido/pie.html Math.random()の代わり
    /*メソッド一覧
    random()       :0以上1未満の実数の乱数を生成します。Math.random()と同様に使用できます。
    randomi(arg)   :0以上arg未満の整数の乱数を生成します。
    srand(arg)     :乱数の種を初期化します。引数を指定しない場合は現在時刻から種を生成します。
                    引数argを指定するとargが種になる。
    Randomize(arg) :Randomizeオブジェクトを生成するコンストラクタメソッド。
                    Randomizeオブジェクトを生成し、srandを呼び出して乱数の種を初期化します。
                    引数argを指定するとsrandに渡します。*/
    function Randomize(seed) {
      this.srand=function(seed) {
        tmpdt=new Date();
        this.seed=this.srand.arguments.length ? seed : tmpdt.getSeconds()*1000+tmpdt.getMilliseconds();
      }
      this.random=function() {
        this.seed=(this.seed*2061+7)%65536;
        return this.seed/65536;
      }
      this.randomi=function(range) {
        return Math.floor(this.random()*range*10)%range;
      }
      Randomize.arguments.length ? this.srand(seed) : this.srand();
    }

    // Randomizeオブジェクト生成
    var rnd=new Randomize(); // 引数なし→乱数の種は現在時刻から

    var TmpFilename;
    this._tmpdir = this.gettmpDir();
    do{
        TmpFilename = this._tmpdir + this._dir_separator + "ucjs.textarea." + hashString(strURL) + '_' +
                      strName + '_' + rnd.randomi(100000) + "." + this._ext;
    }while(!this.ExistsFile(TmpFilename))
    return TmpFilename;
  },

//Function returns true if given filename exists
  ExistsFile: function(filename){
    try{
      var file = Components.classes["@mozilla.org/file/local;1"].
                 createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(filename);
      return true;
    }catch(e){
      return false;
    }
  },
/**
* Returns the directory where we put files to edit.
* @returns nsILocalFile The location where we should write editable files.
*/
  gettmpDir: function() {
    /* Where is the directory that we use. */
    var fobj = Components.classes["@mozilla.org/file/directory_service;1"].
      getService(Components.interfaces.nsIProperties).
      get("ProfD", Components.interfaces.nsIFile);
    fobj.append('Temp_ExternalEditor');
    if (!fobj.exists()) {
      fobj.create(Components.interfaces.nsIFile.DIRECTORY_TYPE,
                  parseInt('0700',8));
    }
    if (!fobj.isDirectory()) {
      alert('Having a problem finding or creating directory: '+fobj.path);
    }
    return fobj.path;
  }

};

ucjs_ExternalEditor.init();
window.addEventListener("unload", function(){ ucjs_ExternalEditor.uninit(); }, false);
