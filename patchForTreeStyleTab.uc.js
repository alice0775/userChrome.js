// ==UserScript==
// @name           patchForTreeStyleTab.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Tree Style Tabでcanvasが初期化されないバグを修正
// @include        main
// @compatibility  Firefox 3.0 3.1 tree style tab .6.2008050601
// @author         Alice0775
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// ==/UserScript==
// @version        2008/09/26 11:30
(function(){
  // -- config --
  const WINDOW_TOLERANCE = 15; //起動時に最大化に失敗したと見なすウインドウサイズの誤差
  // -- config --
  //
/*
  //なんかTree Style Tab入れてると, 起動時の最大化に失敗するっぽい
  //起動時にウインドウサイズが最大サイズに近いときは, 強制的に最大化してやる
  function toMaximize(){
    //Session Managerのダイアログが出ている場合はちょっと待って再度実行してみる
    if (window.outerWidth < 200){
      return false;
    } else {
      setTimeout(function(){
        if (window.outerWidth + WINDOW_TOLERANCE > screen.availWidth &&
            window.outerHeight + WINDOW_TOLERANCE >screen.availHeight) {
          window.maximize();
        }
      }, 200);
    }
    return true;
  }
  var timer, count = 0;
  timer = setInterval(function(){
    if (++count > 100 || toMaximize()){
      clearInterval(timer);
    }
  }, 1000);
*/
  function patchForTreeStyleTab(){
    if ('TreeStyleTabService' in window){
      if (!("fullScreenCanvas" in window)){
        return false;
      }
      var func;
/*
      //なんかTree Style Tabのcanvas要素が上手く初期化できてないっぽい
      //起動時にcanvasが出来ていないなら, 強制的に作ってやる
      var canvas = window.fullScreenCanvas.canvas;
      if (!canvas){
        window.fullScreenCanvas.init();
      }
      //失敗してるっぽいので, ここでもcanvasチェックしてみる, なければ作ってやる
      func = window.fullScreenCanvas.show.toString();
      func = func.replace(
          'var canvas = this.canvas;',
          <><![CDATA[
          var canvas = this.canvas;
          if (!canvas){
            fullScreenCanvas.init();
            setTimeout(function(){fullScreenCanvas.show();}, 500)
            return;
          }
          ]]></>
        );
      eval("window.fullScreenCanvas.show = "+func);

      func = window.fullScreenCanvas.hide.toString();
      func = func.replace(
          'var canvas = this.canvas;',
          <><![CDATA[
          var canvas = this.canvas;
          if (canvas){
          ]]></>
        );
      func = func.replace(
          'this.container.setAttribute("collapsed", true);',
          <><![CDATA[
          }
          this.container.setAttribute("collapsed", true);
          ]]></>
        );
      eval("window.fullScreenCanvas.hide = "+func);




      //なんかwindowによってはプロパテいが無いとおかしくなるっぽいので, チェックしてみる
      func = window.TreeStyleTabBrowser.prototype.handleEvent.toString();
      func = func.replace(
          /aEvent\.originalTarget\.parentNode\.getAttribute\("class"\)/g,
          <><![CDATA[
          "getAttribute" in aEvent.originalTarget.parentNode &&
          $&
          ]]></>
        );
      eval("window.TreeStyleTabBrowser.prototype.handleEvent = "+func);

*/
      func = window.TreeStyleTabService.handleEvent.toString();
      func = func.replace(
          /if \(aEvent\.currentTarget\.id ==/,
            'if (typeof aEvent.currentTarget.id != "undefined" && aEvent.currentTarget.id =='
          );
        eval("window.TreeStyleTabService.handleEvent = "+func);

    }
    return true;
  }

  //準備出来るまで待機して, おもむろに起動する
  var timer1, count1 = 0;
  timer1 = setInterval(function(){
    if (++count1 > 100 || patchForTreeStyleTab()){
      clearInterval(timer1);
    }
  }, 1000);
})();
