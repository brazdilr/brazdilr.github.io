# Bardio clean redesign

Aktuální čistá verze redesignu Bardio.cz. Složka `clean/` je cílová nová podoba webu, zatímco soubory v rootu projektu slouží jako původní verze a referenční zdroj obsahu nebo assetů.

Web je postavený jako statické HTML/CSS/JS bez buildu a bez runtime závislostí. Stačí otevřít HTML soubor v prohlížeči nebo složku nahrát na statický hosting.

## Struktura

- `index.html` - homepage s hero sekcí, benefity, audio ukázkou, procesem, ceníkem, referencemi, FAQ, CTA a video modalem.
- `jak-to-funguje.html` - stránka procesu tvorby písničky.
- `o-bardio.html` - stránka o Bardio, zakladateli a přístupu k AI.
- `kontakt.html` - kontaktní stránka s e-mailem, telefonem a fakturačními údaji.
- `objednavka.html` - objednávková stránka se SimpleShop formulářem.
- `obchodni-podminky-bardio.html` - obchodní podmínky.
- `zpracovani-osobnich-udaju.html` - informace o zpracování osobních údajů a Cookiebot deklarace.
- `assets/css/styles.css` - design tokeny, komponenty, layouty a responzivní styly v jednom souboru.
- `assets/js/app.js` - mobilní menu, audio player, reference carousel, FAQ akordeon a video modal.
- `assets/img/` - lokální grafické prvky, textury, vlny, brand assety, ilustrace, fotky a platební metody.
- `assets/audio/renata.mp3` - lokální audio ukázka pro player.

## Sdílené prvky

- Header a footer jsou ručně zkopírované ve všech HTML stránkách. Při změně navigace, kontaktu nebo footer odkazů je potřeba upravit všechny stránky.
- Vizuální systém používá paper texturu, modré sekce, vlny `wave-top`/`wave-bottom`, společná tlačítka `.button`, CTA boxy a karty.
- Favikony, manifest a brand mark jsou lokální ve složce `clean/`.
- Měření a consent bloky jsou vložené v `<head>` všech hlavních stránek: Cookiebot, Consent Mode, Google Tag Manager a Meta Pixel s Cookiebot consentem.

## Interakce

- Mobilní menu: `.menu-toggle` + `#nav-menu`.
- Ukázky písniček: pole `sampleTracks` v `assets/js/app.js`.
- FAQ: prvky `.faq-item`.
- Reference: prvky `data-review-card`, `data-review-dot`, `data-review-prev`, `data-review-next`.
- Video modal: tlačítko s `data-video-open` a URL v `data-video-src`.

## Objednávka

Stránka `objednavka.html` obsahuje produkční SimpleShop embed:

- identifikátor formuláře: `8oGeX`
- loader: `https://form.simpleshop.cz/prj/js/SimpleShopService.js`
- cílový kontejner: `#objednavka`

Styly pro shell objednávky jsou v `assets/css/styles.css` u tříd `.order-paper-spacer`, `.order-form-section`, `.order-form-title` a `.order-form-shell`.

## Lokální testování

Protože jde o statický web, stačí otevřít konkrétní HTML soubor v prohlížeči. Pro testování relativních cest a externích embedů je praktičtější spustit jednoduchý lokální server ze složky `clean/`:

```bash
python3 -m http.server 8000
```

Potom otevřít `http://localhost:8000/`.

## Deploy

Složka `clean/` je samostatně deployovatelná jako statický web. Při nasazení na doménu je potřeba zkontrolovat:

- relativní odkazy mezi stránkami,
- canonical a Open Graph URL,
- dostupnost externího videa v `data-video-src`,
- načtení SimpleShop formuláře,
- Cookiebot/GTM/Meta Pixel consent chování,
- platební a právní texty v patičce i dokumentech.
