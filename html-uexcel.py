from bs4 import BeautifulSoup
import pandas as pd

# Učitaj HTML datoteku
with open("timeline.html", "r", encoding="utf-8") as file:
    html_content = file.read()

# Parsiraj HTML
soup = BeautifulSoup(html_content, "html.parser")

# Pronađi sve timeline stavke
items = soup.select("div.timeline-item")

# Izvuci podatke
data = []
for item in items:
    title = item.select_one(".timeline__content-title")
    desc = item.select_one(".timeline__content-desc")
    caption = item.select_one("figcaption")
    img = item.select_one("img.timeline__img")

    data.append({
        "Godina/Doba": title.text.strip() if title else "",
        "Naslov": item.get("data-text", "").strip(),
        "Opis (HTML)": desc.decode_contents().strip() if desc else "",
        "Opis slike": caption.text.strip() if caption else "",
        "Putanja slike": img["src"] if img and img.has_attr("src") else "",
        "ID elementa": item.get("id", "")
    })

# Stvori DataFrame
df = pd.DataFrame(data)

# Spremi u Excel
df.to_excel("timeline_glagoljica.xlsx", index=False)

print("✅ Tablica je spremljena u 'timeline_glagoljica.xlsx' s HTML-om u opisu.")
