# Žalud a listy — lokální návrh landing page

Vstupní stránka: `zalud-a-listy.html`. Sdílí základní styly a existující
značku Bardia. Vlastní styly a chování jsou v `assets/css/zalud.css`
a `assets/js/zalud.js`; ostatní stránky se nemění.

## Doplnění podkladů

Objednávka zatím zůstává placeholderem.
Newsletter je napojený na Tally formulář `LZlZ12` přes dodaný embed kód.
Stránka zatím nic neprodává a obsahuje `noindex, nofollow`.

- **Video:** v sekci „Nejdřív se zaposlouchejte“ je zapojená ukázka
  `https://media.bardio.cz/preview-zalud.mp4` přes `data-video-src`.
  Spouští se kliknutím; používá nativní ovládání a přehrává přímo ve stránce.
  Před spuštěním se zobrazuje ilustrační poster.
- **Pracovní listy:** v hero jsou použité dva náhledy a v sekci „Malé ruce budou
  mít co dělat“ je všech devět stran jako nízké WebP mockupy překryté do vějíře.
  PDF samotné se na stránku neodkazuje a není součástí webového assetu.
  Mockupy mají omezené rozlišení a nejsou interaktivní ani určené ke stažení.
- **Objednávka:** je vložený produktový SimpleShop formulář `yXO6E`
  (formulář `#156854`) pro tuto konkrétní sadu. Ověřit v SimpleShopu cenu
  89 Kč, doručení MP3/MP4/PDF a vykreslení na mobilu; ID objednávky osobní
  písničky z ostatních stránek se nepoužívá.
- **Newsletter:** vložený Tally formulář `https://tally.so/embed/LZlZ12`
  používá průhledné pozadí, skrytý nadpis a dynamickou výšku. Loader
  `https://tally.so/widgets/embed.js` je vložený jednou. Formulář a jeho odesílání
  spravuje Tally; propojení na e-mailový nástroj se nastavuje v Tally.
  Pro prohlížeče bez JavaScriptu je připraven odkaz na samostatný formulář.
- Před zveřejněním ověřit všechny integrace a skutečné podklady, doplnit finální
  canonical/OG URL a odstranit `noindex`. Právní odkazy vedou na stávající stránky.

## Vizuální podklady

Skutečná fotografie Radka: `assets/img/about/radek-brazdil.webp`.
Logo, maskot a textury jsou převzaté z existujícího webu.

Nová ilustrační grafika: `assets/img/zalud/zalud-illustration.webp`.
Vygenerováno vestavěným nástrojem `image_gen` podle skillu `imagegen`;
PNG bylo převedeno do WebP pro web. Jde o ilustrační motiv, nikoliv skutečný
snímek videoklipu. Mockupy pracovních listů jsou vyrenderované skutečné stránky
z lokálního PDF a uloženy jako optimalizované WebP soubory.

Použitý prompt:

> Use case: illustration-story. Asset type: hero artwork for a warm Czech children's music and printable activities landing page. Generate a beautiful handmade watercolor and colored pencil children's book illustration, landscape 3:2. A charming smiling little acorn with an oversized textured brown acorn cap, tiny twig arms and feet, rosy cheeks, standing among large autumn oak leaves, one golden maple leaf, a soft rounded green oak tree in background. A few delicate floating musical notes and drifting leaves suggest a song and outdoor discovery. Warm cream paper background (#fff6e8), delicate watercolor grain, rich ochre and rust orange, muted sage green, tiny accents of teal blue, dark navy pencil outlines. Main character near center, lush but airy composition with ample paper around edges, organic edges fade softly into cream paper. Charming real picture book illustration, gentle expressive face, sophisticated tactile watercolor not vector clipart, not 3D. No text, no logos, no interface, no frames, no product sheets, no watermark. Save image for use in the local website project.
