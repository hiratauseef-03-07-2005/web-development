$(document).ready(function () {
   // COUNTER INIT - must be BEFORE slick initializes
  $("#menuSlider").on("init", function (event, slick) {
    $("#counter").text("Showing 1 of " + slick.slideCount);
  });

  
  $("#menuSlider").slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });


  $("#prevBtn").click(function () {
    $("#menuSlider").slick("slickPrev");
  });

  $("#nextBtn").click(function () {
    $("#menuSlider").slick("slickNext");
  });

  
  $("#menuSlider").on("afterChange", function (event, slick, currentSlide) {
    var current = currentSlide + 1;
    var total = slick.slideCount;
    $("#counter").text("Showing " + current + " of " + total);
  });

 
  $("#menuSlider").on("mouseenter", ".card", function () {
    $("#menuSlider").slick("slickPause");
  });

  $("#menuSlider").on("mouseleave", ".card", function () {
    $("#menuSlider").slick("slickPlay");
  });
    
  $("#menuSlider").on("touchstart", ".card", function () {
    $("#menuSlider").slick("slickPause");
  });

  $("#menuSlider").on("touchend", ".card", function () {
    $("#menuSlider").slick("slickPlay");
  });

});