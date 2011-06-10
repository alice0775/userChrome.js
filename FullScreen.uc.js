(function() {
  var mi = document.createElement("menuitem");
  mi.setAttribute("label", "Full Screen");
  mi.setAttribute("command", "View:FullScreen");

  document.getElementById("toolbar-context-menu").appendChild(mi);
})();
