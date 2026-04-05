
var hamburger = document.getElementById("hamburger");
var navLinks = document.getElementById("nav-links");


hamburger.addEventListener("click", function () {
  navLinks.classList.toggle("open");
});


var links = navLinks.querySelectorAll("a");
links.forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("open");
  });
});