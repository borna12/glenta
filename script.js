// Zapamti hash odmah na početku
const initialHash = window.location.hash;

document.addEventListener("DOMContentLoaded", function () {
  const preloader = document.getElementById("preloader");
  preloader.style.display = "flex";

  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRE22xpo4wPw3Y4KbdidMkPb-u9x2qoC14SXcpNXHUz9U5dcZ4K48aC6nx_xmrtWXEqDjSxM6sBpQh1/pub?gid=122524153&single=true&output=csv";

  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function (results) {
      const timeline = document.querySelector(".timeline");

      // 🔧 Filtriraj prazne retke
      const cleanedData = results.data.filter(row => row["ID elementa"] && row["ID elementa"].trim() !== "");

      // 🔁 Dodaj sve iteme u timeline
      cleanedData.forEach(row => {
        const item = document.createElement("div");
        item.classList.add("timeline-item");
        item.id = row["ID elementa"].trim();
        item.setAttribute("data-text", row["Naslov"]);

        item.innerHTML = `
          <div class="timeline__content">
            <figure>
              <img class="timeline__img" src="${row["Putanja slike"]}" />
              ${row["Opis slike"] ? `<figcaption>${row["Opis slike"]}</figcaption>` : ""}
            </figure>
            <h2 class="timeline__content-title">${row["Godina/Doba"]}</h2>
            <p class="timeline__content-desc">${row["Opis (HTML)"]}</p>
          </div>
        `;

        timeline.appendChild(item);
      });

      // 🧭 Sidebar generacija
      const sidebarData = {};
      cleanedData.forEach(row => {
        const razdoblje = row["Razdoblje"];
        const id = row["ID elementa"];
        const naslov = row["Naslov"];
        const godina = row["Godina/Doba"];

        if (!razdoblje || !id || !naslov) return;

        if (!sidebarData[razdoblje]) {
          sidebarData[razdoblje] = [];
        }

        sidebarData[razdoblje].push({
          id: id.trim(),
          naslov: `${naslov.trim()}${godina ? ` (${godina.trim()})` : ""}`,
        });
      });

      const sidebar = document.getElementById("sidebar");
      const sidebarList = document.createElement("ul");

      for (const razdoblje in sidebarData) {
        const periodItem = document.createElement("li");

        const title = document.createElement("strong");
        title.textContent = razdoblje;
        periodItem.appendChild(title);

        const sublist = document.createElement("ul");
        sidebarData[razdoblje].forEach(entry => {
          const linkItem = document.createElement("li");
          linkItem.innerHTML = `<a href="#${entry.id}">${entry.naslov}</a>`;
          sublist.appendChild(linkItem);
        });

        periodItem.appendChild(sublist);
        sidebarList.appendChild(periodItem);
      }

      sidebar.innerHTML = "";
      sidebar.appendChild(sidebarList);

      // ➕ Dodaj footer na dno lente
      const footer = document.createElement("div");
      footer.classList.add("demo-footer");
      footer.innerHTML = `
        <div class="timeline__content">
          <a href="https://stin.hr/sadrzaj/digistin/" target="_blank">
            Lenta je izrađena u sklopu projekta DigiSTIN.
          </a>
        </div>
      `;
      timeline.appendChild(footer);

      // ✅ Inicijaliziraj timeline plugin
      $("#timeline-1").timeline();

      // ✅ Sakrij preloader
      preloader.style.display = "none";

      // 📍 Ako postoji hash – skrolaj i aktiviraj
      if (initialHash) {
        const target = document.querySelector(initialHash);
        if (target) {
          setTimeout(() => {
            const yOffset = 0; // po želji npr. -60
            const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });

            // Ukloni stare aktivne
            document.querySelectorAll(".timeline-item--active").forEach(el =>
              el.classList.remove("timeline-item--active")
            );

            target.classList.add("timeline-item--active");

            const img = target.querySelector(".timeline__img");
            if (img) {
              document.querySelector("#timeline-1").style.backgroundImage = `url(${img.src})`;
            }
          }, 600);
        }
      }
    }
  });
});

// 🧠 jQuery plugin za timeline
(function ($) {
  $.fn.timeline = function () {
    const selectors = {
      id: $(this),
      activeClass: "timeline-item--active",
      img: ".timeline__img",
    };

    let itemLength = 0;

    function updateItems() {
      selectors.item = selectors.id.find(".timeline-item");
      itemLength = selectors.item.length;
    }

    updateItems();

    const currentHash = window.location.hash;
    const firstItem = selectors.item.eq(0);

    if (!currentHash && firstItem.length) {
      firstItem.addClass(selectors.activeClass);
      selectors.id.css(
        "background-image",
        "url(" + firstItem.find(selectors.img).attr("src") + ")"
      );
    } else if (currentHash) {
      const target = document.querySelector(currentHash);
      if (target && target.querySelector(selectors.img)) {
        selectors.id.css(
          "background-image",
          "url(" + target.querySelector(selectors.img).getAttribute("src") + ")"
        );
      }
    }

    $(window).scroll(function () {
      updateItems();
      const pos = $(this).scrollTop();

      selectors.item.each(function () {
        const $this = $(this);
        const min = $this.offset().top;
        const max = min + $this.height();

        if (pos >= min && pos <= max - 40) {
          selectors.id.css(
            "background-image",
            "url(" + $this.find(selectors.img).attr("src") + ")"
          );
          selectors.item.removeClass(selectors.activeClass);
          $this.addClass(selectors.activeClass);

          if (window.location.hash !== "#" + $this.attr("id")) {
            window.history.replaceState(null, null, "#" + $this.attr("id"));
          }
        }
      });
    });
  };
})(jQuery);

// 📌 Aktivacija itema po hashu
function activateTimelineItemFromHash() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const target = document.getElementById(hash);
  if (!target || !target.classList.contains("timeline-item")) return;

  $(".timeline-item").removeClass("timeline-item--active");
  target.classList.add("timeline-item--active");
}

// 📎 Aktivacija na hash promjene
$(window).on("hashchange", function () {
  activateTimelineItemFromHash();
});
