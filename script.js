// Zapamti hash odmah na početku
const initialHash = window.location.hash;

document.addEventListener("DOMContentLoaded", function () {
  const preloader = document.getElementById("preloader");
  preloader.style.display = "flex";

  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRE22xpo4wPw3Y4KbdidMkPb-u9x2qoC14SXcpNXHUz9U5dcZ4K48aC6nx_xmrtWXEqDjSxM6sBpQh1/pub?gid=122524153&single=true&output=csv";
const sidebar = document.getElementById("sidebar");

// ⬇️ fiksni Impressum container (dodaje se JEDNOM)
const impressum = document.createElement("div");
impressum.className = "sidebar-impressum";
impressum.innerHTML = `<a href="#" id='impresum'>Impresum</a>`;
sidebar.appendChild(impressum);
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

      // ukloni samo postojeću UL listu (ako postoji)
const oldList = sidebar.querySelector("ul");
if (oldList) oldList.remove();

// dodaj novu listu ISPOD impressuma
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


$(document).on("click", "#impresum", function (e) {
  e.preventDefault();


  Swal.fire({
    title: "Impresum",
    html:`
    <div><strong>O lenti: </strong></div>
    <p>Vremenska lenta povijesti glagoljaštva ima za cilj ukratko prikazati važne povijesne događaje povezane s uporabom glagoljaštva u Hrvatskoj.</p>
    <div><strong>Izvori korišteni pri izradi:</strong></div>
<div>
<ul id="literatura" class="literatura">
<li><span class="citati tooltip tooltipstered">Mihaljević, Ana; Mihaljević, Milan; Šimić, Ana. 2024. <em>Glagoljica za znatiželjne</em>. Staroslavenski institut. Zagreb.</span></li>
<li><span class="citati tooltip tooltipstered"><em>Povijest hrvatskoga jezika 1-6</em>. 2009. Ur. Bičanić Ante. CROATICA. Zagreb.</span></li>
<li><span class="citati tooltip tooltipstered">Gadžijeva, Sofija; Kovačević, Ana; Mihaljević, Milan; Požar, Sandra; Reinhart, Johannes; Šimić, Marinka; Vince, Jasna. 2014. <em>Hrvatski crkvenoslavenski jezik</em>. Ur. Mihaljević, Milan. Hrvatska sveučilišna naklada – Staroslavenski institut. Zagreb.</span></li>
<li><span class="citati tooltip tooltipstered"><em>Mrežna stranica Staroslavenskoga instituta</em>. Staroslavenski institut. <a href="https://stin.hr/" target="_blank">stin.hr</a> </span></li>
<li><span class="citati tooltip tooltipstered"><em>Hrvatska enciklopedija</em>. Leksikografski zavod Miroslav Krleža. <a href="https://stin.hr/" target="_blank">stin.hr</a> </span></li>
<li><em>Portal Hrvatska glagoljica</em>. Nacionalna i sveučilišna knjižnica u Zagrebu. <a href="https://glagoljica.hr/" target="_blank">glagoljica.hr</a>/</li>
</ul>
</div>
<div> </div>
<div><strong>Tvorac lente: </strong></div>
<ul>
<li>Josip Mihaljević</li>
</ul>
<p><strong>Suradnici:</strong></p>
<div>
<ul>
<li data-start="73" data-end="89">
<p data-start="76" data-end="89">Ivan Botica</p>
</li>
<li data-start="90" data-end="110">
<p data-start="93" data-end="110">Marko Brkljačić</p>
</li>
<li data-start="111" data-end="134">
<p data-start="114" data-end="134">Janja Dora Ivančić</p>
</li>
<li data-start="135" data-end="154">
<p data-start="138" data-end="154">Josip Galić</p>
</li>
<li data-start="135" data-end="154">
<p data-start="138" data-end="154">Ana Mihaljević</p>
</li>
<li data-start="155" data-end="176">
<p data-start="158" data-end="176">Milan Mihaljević</p>
</li>
<li data-start="177" data-end="191">
<p data-start="180" data-end="191">Ana Šimić</p>
</li>
</ul>
</div>
    `
    
    ,
    confirmButtonText: "zatvori",
     theme: 'dark'
  });
});