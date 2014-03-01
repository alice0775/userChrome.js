// ==UserScript==
// @name           stylish0.5_edit.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    External Edittor for Stylish-editor, For stylish 0.5～
// @include        main
// @compatibility  Firefox 2.0 3.0
// @author         Original Author: pile0nades
// @modifier       Alice0775
// @version        2014/02/25 textarea, orion Firefox24, codemirror Firefox27+,(orion,codemirrorの時はcolorpicker無し)
// @version        2009/04/30 version 1.0対応(tnks 音吉) でも0.59で不具合がないなら1.0にしない方がいいよ
// @version        2007/05/25
// @Note
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
* The Original Code is the important.uc.js .
* The Initial Developer of the above Original Code is
* pile0nades.
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
* External Edittor for Stylish-editor, For stylish 0.5～
* Alice0775
* http://space.geocities.yahoo.co.jp/gl/alice0775
*
* ***** END LICENSE BLOCK ***** */

WindowHook.register("chrome://stylish/content/edit.xul",
  function winhook(aWindow) {
    // get the checkbox
    var checkbox = aWindow.document.getElementById("wrap-lines");

    if (aWindow.document.getElementById("internal-code")) { //ver 1.0 のとき color picker と importantを入れる

 //Color picker///////////////////////////////////////////////////////////////////////////////////
      if('rainbowpickerToolbar' in window) {
        var menuitem = aWindow.document.createElement("menuitem");
        button.setAttribute("label", "Color Picker");
        checkbox.parentNode.insertBefore(button, checkbox);
        button.addEventListener("click", function() {
          aWindow.openColorPicker = function() {
            var open = rainbowpickerToolbar();
          }
          aWindow.openColorPicker();
        }, false);
      } else if (aWindow.prefs.getIntPref("editor") == 1) {
        var picker   = aWindow.document.createElement("colorpicker");

        var getColor = function(){
                if (arguments.callee.caller.name != 'onchange') return;  //why is this necessary?
                  var box    = aWindow.document.getElementById("internal-code").mInputField;
                  
                  var text   = box.value.toString()
                  var s      = box.selectionStart;
                  var e      = box.selectionEnd;
                  box.value  = text.substring(0,s)   +
                                     this.color.toString()  +
                                     text.substring(e,text.length);
                  box.setSelectionRange(s + 7, s + 7);  // 7 = "#AABBCC".length
                  box.focus();
        }
        picker.getColor = getColor;
        picker.setAttribute("label", "Color Picker");
        picker.setAttribute("type", 'button');
        picker.setAttribute("onchange", "this.getColor()");
        checkbox.parentNode.insertBefore(picker, checkbox);
      }

//!important////////////////////////////////////////////////////////////////////////////////////////
      // create a button and place it
      var button = aWindow.document.createElement("button");
      button.setAttribute("label", "!important");
      checkbox.parentNode.insertBefore(button, checkbox);

      // add click event to button
      button.addEventListener("click", function() {
        if (aWindow.sourceEditorType == "orion" || aWindow.sourceEditorType == "sourceeditor") {
          var codeElement = aWindow.document.getElementById("sourceeditor");
          var code = aWindow.sourceEditor.getText();
        } else {
          var codeElement = aWindow.document.getElementById("code");
          if (!codeElement)
            codeElement = aWindow.document.getElementById("internal-code");
          var box = codeElement.mInputField;
          var scroll = [box.scrollTop, box.scrollLeft];
          var code = codeElement.value;
        }
        
        code = code.replace(/\s*?!\s*?important/gi, "")    // remove existing !important's to simplify things
        //change ;base64 to __base64__ so we don't match it on the ; when we split declarations
        code = code.replace(/;base64/g, "__base64__");
        var declarationBlocks = code.match(/\{[^\{\}]*[\}]/g);
        var declarations = [];
        declarationBlocks.forEach(function (declarationBlock) {
        declarations = declarations.concat(declarationBlock.split(/;/));
        });
        //make sure everything is really a declaration, and make sure it's not already !important
        declarations = declarations.filter(function (declaration) {
        return /[A-Za-z0-9-]+\s*:\s*[^};]+/.test(declaration) && !/!important/.test(declaration);
        });
        //strip out any extra stuff like brackets and whitespace
        declarations = declarations.map(function (declaration) {
        return declaration.match(/[A-Za-z0-9-]+\s*:\s*[^};]+/)[0].replace(/\s+$/, "");
        });
        //replace them with "hashes" to avoid a problem with multiple identical name/value pairs
        var replacements = [];
        declarations.forEach(function (declaration) {
        var replacement = {hash: Math.random(), value: declaration};
        replacements.push(replacement);
        code = code.replace(replacement.value, replacement.hash);
        });
        replacements.forEach(function (replacement) {
        code = code.replace(replacement.hash, replacement.value + " !important");
        });
        //put ;base64 back
        code = code.replace(/__base64__/g, ";base64");
        if (aWindow.sourceEditorType == "orion" || aWindow.sourceEditorType == "sourceeditor") {
          aWindow.sourceEditor.setText(code);
        } else {
          codeElement.value = code;

          box.scrollTop = scroll[0];
          box.scrollLeft = scroll[1];
        }
     }, false);
   }

//External Editor///////////////////////////////////////////////////////////////////////////////////
    //if(typeof ItsAllText != 'undefined') return;
    // add External Editor button
    button = aWindow.document.createElement("button");
    button.setAttribute("label", "Editor");
    button.setAttribute("accesskey","T");
    checkbox.parentNode.insertBefore(button, checkbox);

    // add click event to button
    button.addEventListener("click", function() {
      if (aWindow.sourceEditorType == "orion" || aWindow.sourceEditorType == "sourceeditor") {
        var textarea = aWindow.document.getElementById("sourceeditor");
        editinit();
        edittarget(textarea);
      } else {
        var textarea = aWindow.document.getElementById("code");
        if (!textarea)
          textarea = aWindow.document.getElementById("internal-code");
        try{
          editinit();
          edittarget(textarea);
        }catch(e){}
      }
    }, false);

////Extarnal Edittor functions///////////////////////////////////////////////////////////////////////

    //Extarnal Edittor functions
    //
    var _editor,_tmpdir = null,_dir_separator,_os;
    var _ext,_encode,_target=[];

    function editinit(){
      if(window.navigator.platform.toLowerCase().indexOf("win") != -1){
        //_editor = "C:\\WINDOWS\\notepad.exe";             /* windows */
        _editor = "C:\\progra~1\\hidemaru\\hidemaru.exe"; /* windows */
        _dir_separator = '\\';                            /* windows */
        _os = 'win';                                      /* windows */
      }else{
        _editor = "/bin/vi";      /* unix */
        _dir_separator = '/';     /* unix */
        _os = 'unix';             /* unix */
      }
      _ext = "css";
      _encode = 'UTF-8';
      _target = [];

      window.addEventListener("unload", function(){ edituninit(); }, false);
      aWindow.addEventListener("unload", function(){
        aWindow.document.removeEventListener("focus", function(){ checkfocus_window(); }, true);
      }, false);
    }

    function edituninit(){
      if(_tmpdir == null) return;
      var windowType = "navigator:browser";
      var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
      var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
      var enumerator = windowManagerInterface.getEnumerator(windowType);
      if (enumerator.hasMoreElements()) {
        return;
      }
      var file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(_tmpdir);
      var entries = file.directoryEntries;
      while (entries.hasMoreElements()) {
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
      _tmpdir = null;
    }

    function checkfocus_window(){
      var target, filename, timestamp, encode, file, inst, sstream, utf, textBoxText
      if (_target.length<=0) return;
      file = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);
      istr = Components.classes['@mozilla.org/network/file-input-stream;1'].
              createInstance(Components.interfaces.nsIFileInputStream);
      // FileInputStream's read is [noscript].
      sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].
              createInstance(Components.interfaces.nsIScriptableInputStream);
      utf = Components.classes['@mozilla.org/intl/utf8converterservice;1'].
            createInstance(Components.interfaces.nsIUTF8ConverterService);

      for(var i=0,len=_target.length;i<len;i++){
        target = _target[i];
        if(!target.hasAttribute("filename")) continue;
        filename = target.getAttribute("filename");
        timestamp = target.getAttribute("timestamp");
        file.initWithPath(filename);
        if(!file.exists() || !file.isReadable()) continue;
        if(file.lastModifiedTime <= timestamp) continue;

        target.setAttribute("timestamp", file.lastModifiedTime);

        istr.init(file, 1, 0x400, false);
        sstream.init(istr);

        textBoxText = sstream.read(sstream.available());
        encode = target.getAttribute("encode");
        if (aWindow.sourceEditorType == "orion" || aWindow.sourceEditorType == "sourceeditor") {
          aWindow.sourceEditor.setText(textBoxText);
        } else {
          if(textBoxText.length)
            target.value = utf.convertStringToUTF8(textBoxText, encode, true);
          else
            target.value = "";
        }

        sstream.close();
        istr.close();
        try{file.remove(false);}catch(e){}
      }
    }


    function editfile(target,filename){
      // Figure out what editor to use.
      var editor = _editor;
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
      target.setAttribute("filename", filename);
      target.setAttribute("timestamp", file.lastModifiedTime);

      // Run the editor.
      var process = Components.classes["@mozilla.org/process/util;1"].
          createInstance(Components.interfaces.nsIProcess);
      process.init(file);
      var args = [filename];
      process.run(false, args, args.length);  // don't block
      aWindow.document.addEventListener("focus", function(){ checkfocus_window(); }, true);
      return true;
    }

    function edittarget(target){
  		if (aWindow.sourceEditorType == "orion" || aWindow.sourceEditorType == "sourceeditor") {
  			var textBoxText = aWindow.sourceEditor.getText();
  		} else {
        var textBoxText = target.value;
      }
      // Get filename.
      var file = Components.classes["@mozilla.org/file/local;1"].
                 createInstance(Components.interfaces.nsILocalFile);
      if(target.hasAttribute("filename")){
        var filename = target.getAttribute("filename");
        file.initWithPath(filename);
        try{
          if( file.exists() == true ) file.remove(false);
        }catch(e){}
      }else{
        var filename = TmpFilenameTextarea();
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
        conv.Init(_encode, 0, 0);
        textBoxText = conv.Convert(textBoxText);
      }catch(e){
        textBoxText = "";
      }
      ostr.write(textBoxText, textBoxText.length);

      ostr.flush();
      ostr.close();

      // setup target info
      target.setAttribute("encode", _encode);

      // Edit the file.
      if(editfile(target,file.path)){
        _target.push(target); // Editting target array
      }
    }

    //Compose temporary filename out of
    //    - tmpdir setting
    //    - document url
    //    - textarea name
    //    - ext suffix
    function TmpFilenameTextarea(){
      var TmpFilename;
      _tmpdir = gettmpDir();
      do{
        TmpFilename = _tmpdir + _dir_separator + "ucjs.textarea." +
                      Math.floor( Math.random() * 100000 ) + "." + _ext;
      }while(!ExistsFile(TmpFilename))
      return TmpFilename;
    }

  //Function returns true if given filename exists
    function ExistsFile(filename){
      try{
        var file = Components.classes["@mozilla.org/file/local;1"].
                   createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        return true;
      }catch(e){
        return false;
      }
    }
    /**
    * Returns the directory where we put files to edit.
    * @returns nsILocalFile The location where we should write editable files.
    */
    function gettmpDir() {
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
  }
);
