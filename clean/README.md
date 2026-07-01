# Bardio clean landing page

Experimentální čistá verze současné homepage. Je postavená jako statický landing bez historických CSS vrstev a bez závislosti na původních složkách assetů.

## Struktura

- `index.html` - markup landing page, sekce jsou řazené podle současné homepage.
- `assets/css/styles.css` - design tokeny, komponenty a sekce v jednom čistém souboru.
- `assets/js/app.js` - mobilní menu, ukázkový player, reference, FAQ a video modal.
- `assets/img/` - lokální grafické prvky použité na stránce.
- `assets/audio/renata.mp3` - lokální audio ukázka pro prototyp playeru.

## Poznámky pro rozšíření

- Ukázky písniček se doplňují v poli `sampleTracks` v `assets/js/app.js`.
- Video v hero CTA se připojí přes atribut `data-video-src` na tlačítku `data-video-open`.
- Objednávkový formulář je zatím nahrazen čistou CTA sekcí. Produkční integraci lze vložit do `#contact`.
