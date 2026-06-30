# Integrace s Google Sheets

Tento dokument popisuje, jak integrovat automatizační nástroj s Google Sheets pro automatické doplnění URL vygenerovaných HTML stránek.

## 📋 Postup integrace

### Krok 1: Vytvoření Google Service Account

1. **Otevři [Google Cloud Console](https://console.cloud.google.com/)**
2. **Vytvoř nový projekt** (nebo použij existující)
3. **Povol Google Sheets API:**
   - Jdi do "APIs & Services" → "Library"
   - Vyhledej "Google Sheets API"
   - Klikni na "Enable"
4. **Vytvoř Service Account:**
   - Jdi do "APIs & Services" → "Credentials"
   - Klikni na "Create Credentials" → "Service Account"
   - Vyplň název (např. "bardio-sheets")
   - Klikni na "Create and Continue"
   - V "Role" vyber "Editor" (nebo vlastní roli)
   - Klikni na "Done"
5. **Vytvoř JSON klíč:**
   - Klikni na vytvořený Service Account
   - Přejdi na záložku "Keys"
   - Klikni na "Add Key" → "Create new key"
   - Vyber "JSON"
   - Stáhni JSON soubor a ulož ho jako `service-account-key.json` do složky `bardio-local/`

### Krok 2: Sdílení Google Sheetu s Service Account

1. **Otevři Google Sheet**, kam chceš zapisovat URL
2. **Získej email Service Accountu:**
   - V JSON klíči najdi `client_email` (např. `bardio-sheets@project-id.iam.gserviceaccount.com`)
3. **Sdílej Sheet s tímto emailem:**
   - Klikni na "Share" v Google Sheets
   - Vlož email z `client_email`
   - Nastav oprávnění na "Editor"
   - Klikni na "Send"

### Krok 3: Konfigurace v `.env`

Přidej do `.env` následující proměnné:

```env
# Google Sheets Integration
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_SHEET_NAME=Sheet1
GOOGLE_SHEETS_ORDER_COLUMN=A
GOOGLE_SHEETS_URL_COLUMN=B
GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH=./service-account-key.json
```

**Jak získat Spreadsheet ID:**
- Otevři Google Sheet
- Z URL zkopíruj ID mezi `/d/` a `/edit`
- Např. `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit#gid=0`
- ID je: `1a2b3c4d5e6f7g8h9i0j`

### Krok 4: Instalace závislostí

```bash
npm install googleapis
```

### Krok 5: Struktura Google Sheetu

Sheet by měl mít následující strukturu:

| Sloupec A (číslo objednávky) | Sloupec B (URL stránky) | ... |
|------------------------------|-------------------------|-----|
| dt34587                      |                         | ... |
| dt34588                      |                         | ... |
| dt34589                      | https://...             | ... |

**Poznámky:**
- Sloupec A obsahuje čísla objednávek (odpovídá `orderKey`)
- Sloupec B bude automaticky doplněn URL stránky
- Nástroj najde řádek podle hodnoty ve sloupci A a doplní URL do sloupce B

## 🔧 Implementace

Kód pro integraci je připraven v `script.mjs`. Funkce `updateGoogleSheet()` se volá automaticky po vytvoření HTML souboru.

**Co se děje:**
1. Nástroj vygeneruje HTML soubor
2. Získá URL HTML stránky (lokální nebo z R2)
3. Najde řádek v Google Sheets s číslem objednávky (`orderKey`)
4. Doplní URL do zadaného sloupce

## ⚙️ Konfigurační možnosti

- `GOOGLE_SHEETS_ENABLED` - `true/false` - zapne/vypne integraci
- `GOOGLE_SHEETS_SPREADSHEET_ID` - ID Google Sheetu
- `GOOGLE_SHEETS_SHEET_NAME` - Název záložky (např. "Sheet1", "Objednávky")
- `GOOGLE_SHEETS_ORDER_COLUMN` - Sloupec s čísly objednávek (např. "A")
- `GOOGLE_SHEETS_URL_COLUMN` - Sloupec pro URL (např. "B")
- `GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH` - Cesta k JSON klíči

## 🔍 Debugging

Pokud integrace nefunguje:
1. Zkontroluj logy v terminálu (zobrazují chyby z Google Sheets API)
2. Ověř, že Service Account má přístup k Sheetu
3. Zkontroluj, že Spreadsheet ID je správné
4. Zkontroluj názvy sloupců (musí být ve správném formátu: "A", "B", atd.)

## 📝 Poznámky

- Pokud řádek s číslem objednávky neexistuje, URL se nepřidá (lze doplnit automatické vytvoření řádku)
- Pokud řádek už má URL, přepíše se (lze změnit na append nebo skip)
- Funkce je volána asynchronně, takže neblokuje zpracování souborů





