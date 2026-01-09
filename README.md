# 🎵 Bardio.cz - Osobní písně na míru

Jednoduchý a elegantní web pro službu tvorby osobních písní na míru.

## 📁 Struktura projektu

```
bardio.cz/
├── index.html      # Hlavní HTML soubor
├── styles.css      # Všechny styly
├── script.js       # JavaScript funkcionalita
├── MD.txt          # Projektová dokumentace
├── README.md       # Tento soubor
└── .gitignore      # Git ignore soubor
```

## 🚀 **Deploy je TRIVIÁLNÍ:**

### 1. **Nejjednodušší způsob:**
```bash
# Stačí nahrát 3 soubory na jakýkoli webhosting
# index.html, styles.css, script.js
```

### 2. **Možnosti hostingu:**
- **Free hosting:** GitHub Pages, Netlify, Vercel
- **Klasický hosting:** Cokoliv s podporou HTML
- **CDN:** Cloudflare, AWS S3
- **Lokální test:** Stačí otevřít index.html v prohlížeči

### 3. **GitHub Pages (zdarma):**
```bash
# 1. Vytvořte GitHub repo
# 2. Nahrajte soubory
# 3. Zapněte GitHub Pages v Settings
# 4. Hotovo! Web je dostupný na username.github.io/repo-name
```

## ✅ **Výhody HTML/CSS/JS verze:**

### **Simplicita:**
- ✅ **3 soubory** místo složitého frameworku
- ✅ **Žádné build procesy** - stačí otevřít v prohlížeči
- ✅ **Okamžité výsledky** - změna = refresh stránky
- ✅ **Žádné závislosti** - funguje všude

### **Deploy:**
- ✅ **5 minut** místo hodin konfigurace
- ✅ **Free hosting** všude dostupný
- ✅ **Žádné servery** - statické soubory
- ✅ **Automatický HTTPS** na většině hostingů

### **Performance:**
- ✅ **Rychlejší načítání** - menší soubory
- ✅ **Lepší SEO** - čistý HTML
- ✅ **Žádný JavaScript overhead** - minimální JS
- ✅ **Okamžitý rendering** - žádné kompilace

### **Údržba:**
- ✅ **Jednoduché úpravy** - otevřít, upravit, uložit
- ✅ **Žádné závislosti** - nezávislé na frameworkech
- ✅ **Dlouhodobá kompatibilita** - HTML nikdy nezmizí
- ✅ **Levné hostování** - i free hosting stačí

## 🎯 **Funkce které fungují:**

### ✅ **Implementované:**
- **Responzivní design** - Mobile, tablet, desktop
- **Audio player** - Funkční přehrávač s ukázkami
- **Smooth scrolling** - Plynulé přechody mezi sekcemi
- **Mobile menu** - Hamburger menu pro mobily
- **Hover efekty** - Animace a přechody
- **SEO optimalizace** - Meta tagy, Open Graph

### 🔄 **Snadno rozšiřitelné:**
- **Kontaktní formulář** - Přidat do script.js
- **Google Analytics** - Přidat tracking kód
- **Email služby** - Formspree, Netlify Forms
- **Audio soubory** - Nahrát do složky audio/

## 💰 **Cena hostingu:**

| Hosting | Cena | Složitost |
|---------|------|-----------|
| **GitHub Pages** | Zdarma | 🟢 Velmi snadné |
| **Netlify** | Zdarma | 🟢 Velmi snadné |
| **Vercel** | Zdarma | 🟢 Velmi snadné |
| **Klasický hosting** | €2-10/měsíc | 🟢 Snadné |
| **AWS S3** | €1-5/měsíc | 🟡 Střední |

## 🎨 **Customizace:**

### **Barvy:**
```css
:root {
    --primary: #9333ea;        /* Fialová */
    --secondary: #ec4899;      /* Růžová */
    /* Změňte tyto hodnoty pro jiné barvy */
}
```

### **Obsah:**
- **Texty:** Upravte přímo v index.html
- **Obrázky:** Přidejte do složky images/
- **Audio:** Přidejte do složky audio/

### **Styly:**
- **Fonty:** Změňte v styles.css
- **Velikosti:** Upravte CSS proměnné
- **Layout:** Modifikujte grid systémy

## 📢 **Promo lišta (informační banner)**

Na homepage je umístěna výrazná promo lišta pod horním menu a nad hero sekcí. Slouží k zobrazení důležitých informací (např. vánoční akce, časově omezené nabídky).

### **Umístění:**
- **HTML:** `index.html` - hned pod `</header>`, před hero sekcí
- **CSS:** `styles.css` - třídy `.promo-bar` a `.promo-bar-text`

### **Jak skrýt/zobrazit lištu:**

**Skrýt lištu:**
Přidej třídu `promo-bar-hidden` na `div` s lištou:
```html
<div class="promo-bar promo-bar-hidden">
```

**Zobrazit lištu:**
Odeber třídu `promo-bar-hidden`:
```html
<div class="promo-bar">
```

**Alternativa (inline style):**
- Skrýt: `<div class="promo-bar" style="display: none;">`
- Zobrazit: `<div class="promo-bar">` (bez `style`)

### **Úprava textu:**
Text lišty uprav v `index.html` uvnitř `<span class="promo-bar-text">`.

### **Úprava vzhledu:**
Styly lišty najdeš v `styles.css` u třídy `.promo-bar`:
- Barva pozadí: `background: linear-gradient(90deg, #dc2626, #b91c1c);`
- Barva textu: `color: #ffffff;`
- Velikost písma: `font-size: 1rem;`
- Padding: `padding: 0.7rem 1rem;`

## 🚀 **Deploy za 5 minut:**

### **GitHub Pages:**
1. Vytvořte GitHub repo
2. Nahrajte 3 soubory
3. Settings → Pages → Deploy
4. Hotovo!

### **Netlify:**
1. Drag & drop složku na netlify.com
2. Získejte URL
3. Připojte doménu
4. Hotovo!

### **Klasický hosting:**
1. Nahrajte soubory přes FTP
2. Nastavte doménu
3. Hotovo!

## 📊 **Srovnání:**

| Aspekt | HTML/CSS/JS | Next.js |
|--------|-------------|---------|
| **Složitost** | 🟢 Velmi jednoduché | 🔴 Komplexní |
| **Deploy** | 🟢 5 minut | 🔴 30+ minut |
| **Hosting** | 🟢 Všude | 🔴 Jen Node.js |
| **Performance** | 🟢 Rychlé | 🟡 Rychlé (po build) |
| **Údržba** | 🟢 Triviální | 🔴 Vyžaduje znalosti |
| **Rozšiřitelnost** | 🟡 Základní | 🟢 Pokročilá |

## 🎯 **Doporučení:**

**Pro Bardio.cz je HTML/CSS/JS ideální volba protože:**
- ✅ Web je statický (žádné databáze)
- ✅ Jednoduchá funkcionalita
- ✅ Rychlý deploy a údržba
- ✅ Levný hosting
- ✅ Okamžité výsledky

**Next.js by se hodil pouze pokud:**
- ❌ Potřebujete složité formuláře
- ❌ Chcete blog s CMS
- ❌ Potřebujete API
- ❌ Plánujete e-commerce

**Pro váš use case je HTML/CSS/JS perfektní volba!** 🎉

## 📞 **Kontakt**

- **Email:** info@bardio.cz
- **Telefon:** +420 XXX XXX XXX
- **Web:** bardio.cz

---

*Projekt vytvořen: 2024*  
*Technologie: HTML5, CSS3, Vanilla JavaScript*  
*Status: Připraveno k deployi*