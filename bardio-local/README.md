# Bardio.cz - Automatizační nástroj pro generování osobních stránek

Automatizační nástroj pro generování HTML stránek pro zákazníky s jejich písničkami na přání. Nástroj automaticky nahrává MP3 soubory na Cloudflare R2, vytváří public URLs a generuje personalizované HTML stránky.

## 📋 Obsah

- [Instalace](#instalace)
- [Konfigurace](#konfigurace)
- [Použití](#použití)
- [Struktura verzí](#struktura-verzí)
- [Struktura souborů](#struktura-souborů)
- [Příklady](#příklady)
- [Integrace s Google Sheets](#integrace-s-google-sheets)
- [Časté problémy](#časté-problémy)

## 🚀 Instalace

1. **Přejdi do složky projektu:**
   ```bash
   cd bardio-local
   ```

2. **Nainstaluj závislosti:**
   ```bash
   npm install
   ```

## ⚙️ Konfigurace

1. **Vytvoř `.env` soubor** v složce `bardio-local/` s následujícím obsahem:

   ```env
   # Cloudflare R2 credentials
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=bardio-pisnicky
   R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
   R2_PUBLIC_DOMAIN=https://media.bardio.cz
   
   # Optional settings
   SIGNED_URL_TTL_SEC=604800
   BASE_URL=https://www.bardio.cz
   UPLOAD_HTML_TO_R2=true
   ```

   **Poznámky:**
   - `R2_ACCOUNT_ID` - Cloudflare Account ID
   - `R2_ACCESS_KEY_ID` - Access Key ID pro R2
   - `R2_SECRET_ACCESS_KEY` - Secret Access Key pro R2
   - `R2_BUCKET_NAME` - Název bucketu na R2
   - `R2_ENDPOINT` - S3 API endpoint (standardní: `https://{account_id}.r2.cloudflarestorage.com`)
   - `R2_PUBLIC_DOMAIN` - Custom domain pro veřejný přístup (bez časového limitu)
   - `UPLOAD_HTML_TO_R2` - Pokud `true`, nahraje HTML soubor také na R2

2. **Zajisti, že složka `in/` existuje** (vytvoří se automaticky při prvním spuštění)

## 📖 Použití

### Režim sledování (watch mode)

Nástroj automaticky sleduje složku `in/` a při přidání nového MP3 souboru ho zpracuje:

```bash
npm start
```

**Jak to funguje:**
1. Přidej MP3 soubor(y) do složky `in/`
2. Nástroj automaticky detekuje nový soubor
3. Nahraje MP3 na Cloudflare R2
4. Vytvoří HTML stránku v složce `landings/` (v rootu projektu)
5. Pokud je zapnuto, nahraje HTML také na R2
cd
### Single-run režim

Pro zpracování konkrétního souboru jednou:

```bash
npm run make -- in/nazev-souboru.mp3
```

## 🎵 Struktura verzí

Nástroj podporuje až **10 verzí** písničky:

- **Verze 1** = základní soubor (např. `dt34587.mp3`)
- **Verze 2** = soubor s suffixem `_2` (např. `dt34587_2.mp3`)
- **Verze 3** = soubor s suffixem `_3` (např. `dt34587_3.mp3`)
- ...
- **Verze 10** = soubor s suffixem `_10` (např. `dt34587_10.mp3`)

### Pravidla pro verze:

1. **Postupnost** - pokud existuje verze 3, musí existovat verze 1 a 2
2. **Řazení** - verze se zobrazí od nejvyššího po nejnižší (10, 9, ..., 3, 2, 1)
3. **Automatické zpracování** - pokud přidáš verzi `_3`, nástroj automaticky najde základní verzi a zpracuje všechny verze společně

### Příklady:

**✅ Správně:**
```
in/
  ├── dt34587.mp3       (verze 1)
  ├── dt34587_2.mp3     (verze 2)
  └── dt34587_3.mp3     (verze 3)
```
→ Všechny verze se zpracují

**❌ Špatně:**
```
in/
  ├── dt34587.mp3       (verze 1)
  └── dt34587_3.mp3     (verze 3 - chybí verze 2)
```
→ Verze 3 se přeskočí (chybí verze 2)

## 📁 Struktura souborů

### Vstupní soubory

```
bardio-local/
  └── in/
      ├── dt34587.mp3       (základní verze - verze 1)
      ├── dt34587_2.mp3     (verze 2, volitelné)
      ├── dt34587_3.mp3     (verze 3, volitelné)
      └── dt34587.pdf       (PDF dokument, volitelné)
```

### Výstupní soubory

**Lokálně:**
```
Bardio.cz/
  └── landings/
      └── dt34587-abc123def4.html
```

**Na Cloudflare R2:**
```
abc12/
  ├── dt34587.mp3       (verze 1)
  ├── dt34587_2.mp3     (verze 2, pokud existuje)
  ├── dt34587_3.mp3     (verze 3, pokud existuje)
  └── dt34587.html      (HTML stránka)
```

**Poznámky:**
- Složka na R2 (`abc12`) je generována z `orderKey` (konzistentní pro stejnou objednávku)
- HTML soubor se vždy přepíše, pokud existuje HTML pro stejný `orderKey`
- MP3 soubory se ukládají s původním názvem

## 💡 Příklady použití

### Příklad 1: Jedna verze

1. Přidej do `in/`: `dt34587.mp3`
2. Nástroj vytvoří:
   - HTML: `landings/dt34587-xyz.html`
   - Na R2: `abc12/dt34587.mp3` a `abc12/dt34587.html`
   - Zobrazí se: 1 přehrávač (bez labelu), 1 tlačítko "Stáhnout MP3"

### Příklad 2: Tři verze

1. Přidej do `in/`: `dt34587.mp3`, `dt34587_2.mp3`, `dt34587_3.mp3`
2. Nástroj vytvoří:
   - HTML: `landings/dt34587-xyz.html`
   - Na R2: `abc12/dt34587.mp3`, `abc12/dt34587_2.mp3`, `abc12/dt34587_3.mp3`, `abc12/dt34587.html`
   - Zobrazí se: 3 přehrávače (Verze 3, Verze 2, Verze 1), 3 tlačítka

### Příklad 3: Přidání verze po zpracování

1. Nejdřív přidej: `dt34587.mp3` → zpracuje se
2. Pak přidej: `dt34587_2.mp3` → nástroj najde základní verzi a zpracuje znovu
3. Starý HTML soubor se smaže, vytvoří se nový s oběma verzemi

### Příklad 4: Batch zpracování

1. Přidej všechny soubory najednou: `dt34587.mp3`, `dt34587_2.mp3`, `dt34587_3.mp3`
2. Nástroj zpracuje základní verzi (`dt34587.mp3`), najde všechny ostatní verze a zpracuje je společně

## 📊 Integrace s Google Sheets

Nástroj může automaticky doplňovat URL vygenerovaných HTML stránek do Google Sheets.

### Nastavení

1. **Postupuj podle návodu v `GOOGLE_SHEETS_INTEGRATION.md`**
   - Vytvoř Google Service Account
   - Sdílej Sheet s Service Account emailem
   - Stáhni JSON klíč a ulož jako `service-account-key.json`

2. **Přidej do `.env`:**
   ```env
   GOOGLE_SHEETS_ENABLED=true
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
   GOOGLE_SHEETS_SHEET_NAME=Sheet1
   GOOGLE_SHEETS_ORDER_COLUMN=A
   GOOGLE_SHEETS_URL_COLUMN=B
   GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH=./service-account-key.json
   ```

3. **Struktura Google Sheetu:**
   ```
   | Sloupec A (číslo objednávky) | Sloupec B (URL stránky) |
   |------------------------------|-------------------------|
   | dt34587                      | https://...             |
   | dt34588                      |                         |
   ```

### Jak to funguje

1. Nástroj vygeneruje HTML stránku
2. Získá URL (lokální nebo z R2, pokud je zapnuto)
3. Najde řádek v Google Sheets s číslem objednávky (`orderKey`)
4. Doplní URL do zadaného sloupce

**Poznámky:**
- Pokud řádek s číslem objednávky neexistuje, URL se nepřidá
- Pokud řádek už má URL, přepíše se
- URL se používá z R2 (pokud je zapnuto), jinak lokální `file://` URL

Pro detailní návod viz `GOOGLE_SHEETS_INTEGRATION.md`.

## 🔧 Časté problémy

### Problém: "Bez .env připojení k Cloudflare R2 nelze nahrát soubory"

**Řešení:**
- Zkontroluj, že `.env` soubor existuje v `bardio-local/`
- Zkontroluj, že všechny proměnné začínají bez mezer (ne `   R2_ACCOUNT_ID=...`)
- Zkontroluj, že hodnoty jsou správně nastavené

### Problém: "Signature version 4 presigned URLs must have an expiration date less than one week"

**Řešení:**
- Nastav `SIGNED_URL_TTL_SEC=604800` (7 dní = maximální hodnota)
- Nebo použij `R2_PUBLIC_DOMAIN` pro public URLs bez časového limitu

### Problém: Verze se přeskočí

**Možné příčiny:**
- Chybí předchozí verze (např. máš `_3` bez `_2`)
- Soubor neexistuje v lokální složce `in/`

**Řešení:**
- Přidej všechny verze postupně (1, 2, 3, ...)
- Zkontroluj názvy souborů (musí končit `_2`, `_3`, atd.)

### Problém: HTML soubor se nezobrazuje správně (chybí CSS/obrázky)

**Možné příčiny:**
- `BASE_URL` není správně nastavený
- CSS nebo obrázky neexistují na `www.bardio.cz`

**Řešení:**
- Zkontroluj, že `BASE_URL=https://www.bardio.cz` v `.env`
- Zkontroluj, že soubory `styles.css` a `images/bard_hero.png` existují na serveru

### Problém: HTML se nenahraje na R2

**Možné příčiny:**
- `UPLOAD_HTML_TO_R2=false` nebo není nastaveno
- R2 client není inicializovaný

**Řešení:**
- Nastav `UPLOAD_HTML_TO_R2=true` v `.env`
- Zkontroluj R2 credentials v `.env`

### Problém: Google Sheets se neaktualizuje

**Možné příčiny:**
- `GOOGLE_SHEETS_ENABLED=false` nebo není nastaveno
- Service Account JSON soubor neexistuje nebo je na špatné cestě
- Service Account nemá přístup k Sheetu
- Spreadsheet ID nebo Sheet název je nesprávný
- Řádek s číslem objednávky neexistuje

**Řešení:**
- Nastav `GOOGLE_SHEETS_ENABLED=true` v `.env`
- Zkontroluj, že `service-account-key.json` existuje v `bardio-local/`
- Sdílej Sheet s emailem z `client_email` v JSON klíči (s oprávněním "Editor")
- Zkontroluj Spreadsheet ID (z URL mezi `/d/` a `/edit`)
- Zkontroluj název záložky (`GOOGLE_SHEETS_SHEET_NAME`)
- Zkontroluj, že v Sheetu existuje řádek s číslem objednávky ve sloupci A

## 📝 Technické detaily

### Jak to funguje

1. **Detekce souborů:** Nástroj sleduje složku `in/` pomocí `chokidar`
2. **Validace verzí:** Kontroluje postupnost verzí (pokud existuje `_3`, musí existovat `_1` a `_2`)
3. **Upload na R2:** Používá AWS S3 SDK (R2 je S3-compatible)
4. **Generování URLs:** 
   - Pokud je `R2_PUBLIC_DOMAIN`, vytvoří public URL (bez limitu)
   - Jinak vytvoří presigned URL (max 7 dní)
5. **Generování HTML:** Nahradí placeholdery v `template.html` a vytvoří HTML soubor
6. **Upload HTML (volitelné):** Pokud je zapnuto, nahraje HTML také na R2

### Placeholdery v template

- `{{PAGE_TITLE}}` - Název stránky
- `{{BASE_URL}}` - Základní URL pro CSS a obrázky
- `{{AUDIO_URL_1}}` - URL pro verzi 1
- `{{AUDIO_PLAYERS_ALL}}` - HTML pro přehrávače (verze 2-10)
- `{{AUDIO_LABEL_1}}` - Label pro verzi 1 (pokud existují jiné verze)
- `{{DOWNLOAD_BUTTONS_ALL}}` - HTML pro tlačítka (všechny verze)
- `{{SINGLE_DOWNLOAD_BUTTON}}` - Tlačítko pro jedinou verzi

### Struktura na R2

```
{bucket}/
  {hash}/
    ├── {orderKey}.mp3       (verze 1)
    ├── {orderKey}_2.mp3     (verze 2)
    ├── {orderKey}_3.mp3     (verze 3)
    └── {orderKey}.html      (HTML)
```

- `hash` = MD5 hash z `orderKey` (5 znaků, konzistentní pro stejnou objednávku)
- `orderKey` = sanitizovaný název souboru bez přípony

## 📞 Podpora

Pokud máš problémy nebo otázky, zkontroluj:
1. Logy v terminálu (měl by zobrazovat podrobné informace)
2. `.env` konfiguraci
3. Strukturu souborů v `in/`
4. Existenci výstupních souborů v `landings/`

---

**Verze:** 1.0.0  
**Autor:** Radek Brázdil  
**Licence:** ISC

