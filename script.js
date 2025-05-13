(function($) {
  $.fn.timeline = function() {
    var selectors = {
      id: $(this),
      item: $(this).find(".timeline-item"),
      activeClass: "timeline-item--active",
      img: ".timeline__img",
    };
    selectors.item.eq(0).addClass(selectors.activeClass);

    selectors.id.css(
      "background-image",
      "url(" +
        selectors.item
          .first()
          .find(selectors.img)
          .attr("src") +
        ")"
    );
    var itemLength = selectors.item.length;


    $(window).scroll(function() {
      var max, min;
      var pos = $(this).scrollTop();
      selectors.item.each(function(i) {
        min = $(this).offset().top;
        max = $(this).height() + $(this).offset().top;
        var that = $(this);
        if (i == itemLength - 2 && pos > min + $(this).height() / 2) {
          selectors.item.removeClass(selectors.activeClass);
          selectors.id.css(
            "background-image",
            "url(" +
              selectors.item
                .last()
                .find(selectors.img)
                .attr("src") +
              ")"
          );
          selectors.item.last().addClass(selectors.activeClass);
          window.location.hash = '#euro';
          
        } else if (pos <= max - 40 && pos >= min) {
          selectors.id.css(
            "background-image",
            "url(" +
              $(this)
                .find(selectors.img)
                .attr("src") +
              ")"
          );
          selectors.item.removeClass(selectors.activeClass);
          $(this).addClass(selectors.activeClass);
          window.location.hash = '#'+$(this).attr("id");

        }
      });
    });
  };
})(jQuery);

$("#timeline-1").timeline();

if (window.location.href.indexOf('#') == 0) {
  let hash = window.location.href.split('#')[1];
  let hashTop = document.querySelector(`#${hash}`).offsetTop;
  window.scrollTop = hashTop;
}



function activateTimelineItemFromHash() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const target = document.getElementById(hash);
  if (!target || !target.classList.contains("timeline-item")) return;

  $(".timeline-item").removeClass("timeline-item--active");
  target.classList.add("timeline-item--active");
}

// Aktiviraj kod učitavanja stranice
$(document).ready(function () {
  activateTimelineItemFromHash();
});

// Aktiviraj kod promjene hasha (klik, ručno, povijest)
$(window).on("hashchange", function () {
  activateTimelineItemFromHash();
});