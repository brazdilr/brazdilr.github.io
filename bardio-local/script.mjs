// ===== Bardio local generator – script.mjs =====
import 'dotenv/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import chokidar from 'chokidar';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// --- boot logs & error traps ---
console.log('🚀 Startuji script.mjs…');
process.on('uncaughtException', (e) => console.error('💥 uncaughtException:', e));
process.on('unhandledRejection', (e) => console.error('💥 unhandledRejection:', e));

// --- paths (pevně relativní k umístění tohoto souboru) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IN_DIR = path.join(__dirname, 'in');
// Landings se generují do složky landings/ v rootu projektu (o úroveň výš)
const OUT_DIR = path.join(__dirname, '..', 'landings');
const TEMPLATE_FILE = path.join(__dirname, 'template.html');

// --- env ---
const {
  // Cloudflare R2 credentials
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME = 'songs',
  R2_ENDPOINT, // např. https://<account-id>.r2.cloudflarestorage.com (pro S3 API)
  R2_PUBLIC_DOMAIN, // např. https://media.bardio.cz (pro veřejný přístup, bez časového limitu)
  SIGNED_URL_TTL_SEC = '604800', // 7 dní výchozí (max pro S3 Signature v4, použije se jen pokud není PUBLIC_DOMAIN)
  BASE_URL = 'https://www.bardio.cz', // Základní URL pro CSS a obrázky (použije se v HTML nahrávaném na R2)
  UPLOAD_HTML_TO_R2 = 'false', // Pokud true, nahraje HTML soubor také na R2

  // Google Sheets Integration
  GOOGLE_SHEETS_ENABLED = 'false', // Pokud true, zapne integraci s Google Sheets
  GOOGLE_SHEETS_SPREADSHEET_ID, // ID Google Sheetu (z URL mezi /d/ a /edit)
  GOOGLE_SHEETS_SHEET_NAME = 'Sheet1', // Název záložky v Sheetu
  GOOGLE_SHEETS_ORDER_COLUMN = 'A', // Sloupec s čísly objednávek
  GOOGLE_SHEETS_URL_COLUMN = 'B', // Sloupec pro URL stránky
  GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH = './service-account-key.json', // Cesta k JSON klíči Service Account

  // fallback texty do šablony
  DEFAULT_PAGE_TITLE = 'Vaše písnička na přání - Bardio.cz',
  DEFAULT_META_DESCRIPTION = 'Vaše osobní píseň na míru je hotová! Poslechněte si ji a stáhněte.',
  DEFAULT_MAIN_HEADING = 'Vaše písnička na přání',
  DEFAULT_SUBTITLE = 'Vaše osobní píseň je hotová! Poslechněte si ji a užijte si tento jedinečný okamžik.'
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error('❌ Chybí R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY nebo R2_BUCKET_NAME v .env – upload a signed URL nepoběží.');
}

// --- Cloudflare R2 S3 client ---
// Pro S3 API volání použijeme standardní Cloudflare endpoint, ne custom domain
// Custom domain je pro public access, ne pro API
const r2ApiEndpoint = R2_ENDPOINT && R2_ENDPOINT.includes('r2.cloudflarestorage.com')
  ? R2_ENDPOINT 
  : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

console.log('🔧 R2 Konfigurace:', {
  accountId: R2_ACCOUNT_ID ? '✅' : '❌',
  accessKeyId: R2_ACCESS_KEY_ID ? '✅' : '❌',
  secretAccessKey: R2_SECRET_ACCESS_KEY ? '✅' : '❌',
  bucketName: R2_BUCKET_NAME,
  apiEndpoint: r2ApiEndpoint,
  publicDomain: R2_PUBLIC_DOMAIN || 'presigned URLs (max 7 dní)',
  urlType: R2_PUBLIC_DOMAIN ? 'public URLs (bez časového limitu)' : 'presigned URLs (max 7 dní)'
});

const s3Client = (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME)
  ? new S3Client({
      region: 'auto',
      endpoint: r2ApiEndpoint,
      forcePathStyle: true, // Použij path-style URLs (bucket v path, ne v subdoméně)
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

// --- utils ---
async function ensureDirs() {
  await fs.mkdir(IN_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });
}

function slug(len = 10) {
  return crypto.randomBytes(len).toString('base64url');
}

function sanitizeKeyPart(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9-_.\/]/g, '-');
}

/**
 * Vytáhne metadata z názvu souboru.
 * "2025-10-19_Renata_order-12345.mp3" -> orderId: "12345", songTitle: "Renata"
 * fallback: orderId = baseName; songTitle = "baseName" bez datumů/underscores
 */
function inferMeta(filename) {
  const base = path.basename(filename, path.extname(filename));
  const orderMatch = base.match(/order[-_](\w+)/i);
  const orderId = orderMatch ? orderMatch[1] : base;
  const titleClean = base
    .replace(/order[-_]\w+/ig, '')
    .replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
    .replace(/[_-]+/g, ' ')
    .trim() || base;
  return { orderId, songTitle: titleClean };
}

async function uploadToR2(localPath, remotePath, contentType) {
  if (!s3Client) throw new Error('R2 client není inicializovaný (chybí .env).');
  try {
    const fileContent = await fs.readFile(localPath);
    console.log(`📤 Nahrávám do R2: bucket=${R2_BUCKET_NAME}, key=${remotePath}, endpoint=${r2ApiEndpoint}`);
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: remotePath,
      Body: fileContent,
      ContentType: contentType,
    });
    const result = await s3Client.send(command);
    console.log('✅ Upload úspěšný:', result.$metadata?.httpStatusCode || 'OK');
  } catch (error) {
    console.error('❌ Chyba při uploadu do R2:', {
      message: error.message,
      code: error.Code || error.code,
      statusCode: error.$metadata?.httpStatusCode,
      endpoint: r2ApiEndpoint,
      bucket: R2_BUCKET_NAME,
      key: remotePath
    });
    throw error;
  }
}

async function createSignedUrl(remotePath, ttlSec) {
  // Pokud máme public domain, použijeme public URL (bez časového limitu)
  if (R2_PUBLIC_DOMAIN) {
    // Odstraníme koncové lomítko z public domain
    const baseDomain = R2_PUBLIC_DOMAIN.replace(/\/$/, '');
    // Zakódujeme cesty v URL (pro správné zpracování mezer a speciálních znaků)
    const encodedPath = remotePath.split('/').map(part => encodeURIComponent(part)).join('/');
    // Vytvoříme public URL: https://media.bardio.cz/path/to/file.mp3 (bez bucket name)
    const publicUrl = `${baseDomain}/${encodedPath}`;
    console.log('✅ Public URL vytvořeno:', publicUrl);
    return publicUrl;
  }
  
  // Jinak použijeme presigned URL (max 7 dní)
  if (!s3Client) throw new Error('R2 client není inicializovaný (chybí .env).');
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: remotePath,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: parseInt(ttlSec, 10) });
    console.log('✅ Signed URL vytvořeno (expires in', ttlSec, 'seconds):', url.substring(0, 80) + '...');
    return url;
  } catch (error) {
    console.error('❌ Chyba při vytváření signed URL:', {
      message: error.message,
      code: error.Code || error.code,
      endpoint: r2ApiEndpoint,
      bucket: R2_BUCKET_NAME,
      key: remotePath
    });
    throw error;
  }
}

async function renderFromTemplate(placeholders) {
  console.log('🧩 Používám šablonu:', TEMPLATE_FILE);
  let html = await fs.readFile(TEMPLATE_FILE, 'utf8');
  if (!html || html.trim().length < 20) {
    console.error('❌ template.html je prázdný nebo se nenačetl správně:', TEMPLATE_FILE);
    throw new Error('TemplateEmpty');
  }
  for (const [key, value] of Object.entries(placeholders)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  }
  return html;
}

// --- Google Sheets Integration ---
async function updateGoogleSheet(orderKey, htmlUrl) {
  const isEnabled = GOOGLE_SHEETS_ENABLED === 'true' || GOOGLE_SHEETS_ENABLED === true;
  if (!isEnabled || !GOOGLE_SHEETS_SPREADSHEET_ID) {
    return;
  }

  try {
    // Dynamický import googleapis (pouze pokud je integrace zapnutá)
    const { google } = await import('googleapis');
    
    // Načtení Service Account klíče
    const serviceAccountPath = path.resolve(__dirname, GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH);
    const serviceAccountKey = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));
    
    // Autentizace
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Najdeme řádek s orderKey
    const sheetName = GOOGLE_SHEETS_SHEET_NAME;
    const orderColumn = GOOGLE_SHEETS_ORDER_COLUMN;
    const urlColumn = GOOGLE_SHEETS_URL_COLUMN;
    
    // Získáme všechny hodnoty ve sloupci s čísly objednávek
    const range = `${sheetName}!${orderColumn}:${orderColumn}`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: range,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    // Najdeme řádek s orderKey (hledáme od druhé řádky, první může být hlavička)
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === orderKey.toLowerCase()) {
        rowIndex = i + 1; // Google Sheets API indexuje od 1
        break;
      }
    }

    if (rowIndex === -1) {
      console.log(`⚠️ Řádek s číslem objednávky "${orderKey}" nebyl nalezen v Google Sheets.`);
      return;
    }

    // Aktualizujeme URL v nalezeném řádku
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!${urlColumn}${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[htmlUrl]],
      },
    });

    console.log(`✅ Google Sheets aktualizován: Řádek ${rowIndex}, sloupec ${urlColumn} = ${htmlUrl}`);
  } catch (error) {
    // Pokud googleapis není nainstalován, zobrazí se chyba, ale nástroj pokračuje
    if (error.code === 'ERR_MODULE_NOT_FOUND' && error.message.includes('googleapis')) {
      console.warn('⚠️ Google Sheets integrace je zapnutá, ale googleapis není nainstalován.');
      console.warn('   → Spusť: npm install googleapis');
      console.warn('   → Nebo nastav GOOGLE_SHEETS_ENABLED=false v .env');
      return;
    }
    
    console.error('❌ Chyba při aktualizaci Google Sheets:', error.message);
    if (error.code === 'ENOENT') {
      console.error('   → Service Account JSON soubor nenalezen:', GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH);
    } else if (error.code === 403) {
      console.error('   → Service Account nemá přístup k Sheetu. Zkontroluj sdílení.');
    } else if (error.code === 404) {
      console.error('   → Spreadsheet ID nebo Sheet název je nesprávný.');
    }
  }
}

// --- core ---
async function handleMp3(fullPath) {
  try {
    if (path.extname(fullPath).toLowerCase() !== '.mp3') {
      console.log('⏭️ Přeskakuji (není .mp3):', fullPath);
      return;
    }

    const filename = path.basename(fullPath);
    const base = path.basename(fullPath, path.extname(fullPath));
    
    // Pokud je soubor s příponou _1 až _10, najdeme odpovídající základní verzi (bez suffixu) a zpracujeme ji znovu
    const versionMatch = base.match(/_(\d+)$/);
    if (versionMatch) {
      const versionNumber = parseInt(versionMatch[1], 10);
      if (versionNumber >= 1 && versionNumber <= 10) {
        console.log(`🔄 Detekována verze ${versionNumber}:`, fullPath);
        // Najdeme odpovídající základní verzi (odstraníme _X z názvu)
        const baseWithoutSuffix = base.replace(/_(\d+)$/, '');
        const baseVersionPath = path.join(path.dirname(fullPath), `${baseWithoutSuffix}.mp3`);
        
        try {
          // Kontrola, jestli základní verze existuje
          await fs.access(baseVersionPath);
          console.log('✅ Nalezena odpovídající základní verze, zpracovávám všechny verze společně:', baseVersionPath);
          // Zpracujeme základní verzi znovu (tentokrát najde všechny verze)
          await handleMp3(baseVersionPath);
        } catch {
          console.log(`⚠️ Základní verze nenalezena, přeskočím verzi ${versionNumber}. Nejdříve zpracuj základní verzi.`);
        }
        return;
      }
    }

    console.log('🎵 Zpracovávám:', fullPath);
    const { orderId, songTitle } = inferMeta(filename);
    const orderKey = sanitizeKeyPart(orderId);
    
    // Vytvoříme konzistentní složku (16 znaků) z orderKey pro stejnou objednávku
    // Díky tomu se HTML přepíše ve stejné složce při zpracování znovu a všechny verze budou v jedné složce
    const orderHash = crypto.createHash('md5').update(orderKey).digest('hex').substring(0, 16);
    const randomFolder = orderHash;
    // V složce použijeme původní název MP3 souboru
    const mp3Key = `${randomFolder}/${filename}`;

    if (!s3Client) {
      console.error('❌ Bez .env připojení k Cloudflare R2 nelze nahrát soubory ani vytvořit signed URL.');
      return;
    }

    // 1) Upload MP3
    await uploadToR2(fullPath, mp3Key, 'audio/mpeg');
    console.log('☁️ Nahráno MP3 do Cloudflare R2 jako:', mp3Key);

    // 2) Volitelné PDF (stejné jméno, jiná přípona)
    const pdfLocal = path.join(path.dirname(fullPath), `${base}.pdf`);
    let pdfSignedUrl = '';
    let audioPlayer2 = '';
    let downloadButton1 = ''; // Tlačítko pro verzi 1 (zobrazí se jen pokud existuje verze 2)
    let downloadButton2 = ''; // Tlačítko pro verzi 2 (zobrazí se jen pokud existuje verze 2)
    
    try {
      await fs.access(pdfLocal);
      const pdfFilename = path.basename(pdfLocal);
      const pdfKey = `${randomFolder}/${pdfFilename}`;
      await uploadToR2(pdfLocal, pdfKey, 'application/pdf');
      console.log('☁️ Nahráno PDF do Cloudflare R2 jako:', pdfKey);
      pdfSignedUrl = await createSignedUrl(pdfKey, SIGNED_URL_TTL_SEC);
      console.log('🔐 PDF signed URL vytvořeno.');
    } catch {
      console.log('ℹ️ PDF se stejným názvem nenalezeno – tlačítko ve stránce bude skryto.');
    }

    // 3) Signed URL pro MP3
    const mp3SignedUrl = await createSignedUrl(mp3Key, SIGNED_URL_TTL_SEC);
    console.log('🔐 MP3 signed URL vytvořeno. TTL (s):', SIGNED_URL_TTL_SEC);

    // 4) Detekce všech verzí MP3 (_2 až _10, základní soubor je verze 1)
    const detectedVersions = []; // Pole s čísly verzí, které existují a jsou postupně
    const versionData = {}; // Objekt s daty pro každou verzi: { versionNumber: { url, key, filename } }
    
    // Základní soubor je verze 1
    detectedVersions.push(1);
    versionData[1] = {
      url: mp3SignedUrl,
      key: mp3Key,
      filename: filename
    };
    
    // Kontrola postupně od verze 2 do 10
    for (let v = 2; v <= 10; v++) {
      const versionLocal = path.join(path.dirname(fullPath), `${base}_${v}.mp3`);
      try {
        await fs.access(versionLocal);
        
        // Kontrola, že všechny předchozí verze existují (postupnost)
        // Verze 1 (základní) už existuje, kontrolujeme od 2 do v-1
        let allPreviousExist = true;
        for (let prev = 2; prev < v; prev++) {
          const prevLocal = path.join(path.dirname(fullPath), `${base}_${prev}.mp3`);
          try {
            await fs.access(prevLocal);
          } catch {
            allPreviousExist = false;
            break;
          }
        }
        
        if (allPreviousExist) {
          const versionFilename = path.basename(versionLocal);
          const versionKey = `${randomFolder}/${versionFilename}`;
          await uploadToR2(versionLocal, versionKey, 'audio/mpeg');
          console.log(`☁️ Nahráno MP3 (verze ${v}) do Cloudflare R2 jako:`, versionKey);
          
          const versionSignedUrl = await createSignedUrl(versionKey, SIGNED_URL_TTL_SEC);
          console.log(`🔐 MP3 (verze ${v}) signed URL vytvořeno.`);
          
          detectedVersions.push(v);
          versionData[v] = {
            url: versionSignedUrl,
            key: versionKey,
            filename: versionFilename
          };
        } else {
          console.log(`⏭️ Přeskakuji verzi ${v} - chybí předchozí verze (${v - 1}).`);
        }
      } catch {
        // Verze neexistuje, pokračujeme
      }
    }
    
    // Seřadíme verze od nejvyššího po nejnižší (10, 9, 8, ..., 2, 1)
    detectedVersions.sort((a, b) => b - a);
    
    // Generování HTML pro přehrávače a tlačítka (všechny verze kromě verze 1, řazeno od nejvyššího po nejnižší)
    let audioPlayers = '';
    let downloadButtons = '';
    let audioLabel1 = ''; // Label pro verzi 1 (zobrazí se jen pokud existují jiné verze)
    
    if (detectedVersions.length > 1) {
      // Pokud existují jiné verze než základní (verze 1), přidáme label k verzi 1
      audioLabel1 = '<div class="audio-player-label">Verze 1</div>';
      
      // Generujeme přehrávače a tlačítka pro všechny verze kromě verze 1 (10, 9, ..., 3, 2)
      // Verze 1 se zobrazí v samostatném přehrávači
      for (const versionNum of detectedVersions) {
        if (versionNum === 1) continue; // Verzi 1 zpracujeme zvlášť
        
        const version = versionData[versionNum];
        audioPlayers += `
        <div class="audio-player-container">
            <div class="audio-player-label">Verze ${versionNum}</div>
            <audio controls>
                <source src="${version.url}" type="audio/mpeg">
                Váš prohlížeč nepodporuje přehrávání audia.
            </audio>
        </div>`;
        
        downloadButtons += `<a href="${version.url}" download class="download-btn">Stáhnout MP3 (verze ${versionNum})</a>`;
      }
      
      // Přidáme tlačítko pro verzi 1 na konec (jako poslední)
      downloadButtons += `<a href="${versionData[1].url}" download class="download-btn">Stáhnout MP3 (verze 1)</a>`;
    }
    

    // 5) Naplnění placeholderů a render
    const pageTitle = `${songTitle} – ${DEFAULT_PAGE_TITLE}`;
    
    // Debug: zkontrolujeme, že URL není prázdné
    if (!mp3SignedUrl || mp3SignedUrl.trim() === '') {
      console.error('❌ MP3 URL je prázdné! Nelze vytvořit přehrávač.');
    } else {
      console.log('🔍 MP3 URL pro přehrávač:', mp3SignedUrl.substring(0, 100) + '...');
    }
    
    // Pokud existují nějaké verze kromě základní, použijeme všechna tlačítka, jinak jen jedno
    const singleDownloadButton = (audioPlayers || downloadButtons) 
      ? '' 
      : `<a href="${mp3SignedUrl}" download class="download-btn">Stáhnout MP3</a>`;
    
    const placeholders = {
      PAGE_TITLE: pageTitle,
      META_DESCRIPTION: DEFAULT_META_DESCRIPTION,
      MAIN_HEADING: DEFAULT_MAIN_HEADING,
      SUBTITLE: DEFAULT_SUBTITLE,
      SONG_TITLE: songTitle,
      ORDER_ID: orderId,
      BASE_URL: BASE_URL,
      AUDIO_URL_1: mp3SignedUrl || '',
      AUDIO_LABEL_1: audioLabel1 || '',
      AUDIO_PLAYERS_ALL: audioPlayers || '', // Všechny přehrávače (verze 10, 9, ..., 2, 1)
      DOWNLOAD_BUTTONS_ALL: downloadButtons || '', // Všechna tlačítka (verze 10, 9, ..., 2, 1)
      SINGLE_DOWNLOAD_BUTTON: singleDownloadButton || '',
      PDF_SIGNED_URL: pdfSignedUrl || ''
    };

    const html = await renderFromTemplate(placeholders);
    
    // Debug: zkontrolujeme, že URL bylo správně nahrazeno v HTML
    if (html.includes('{{AUDIO_URL_1}}')) {
      console.error('⚠️ Placeholder {{AUDIO_URL_1}} nebyl nahrazen v HTML!');
    } else {
      const audioSrcMatch = html.match(/<source src="([^"]+)"/);
      if (audioSrcMatch) {
        console.log('✅ Audio src v HTML:', audioSrcMatch[1].substring(0, 100) + '...');
      }
    }

    // 6) Uložení finální stránky
    // Před vytvořením nového souboru najdeme a smažeme existující HTML soubory se stejným orderKey
    try {
      const existingFiles = await fs.readdir(OUT_DIR);
      const prefix = `${orderKey}-`;
      for (const file of existingFiles) {
        if (file.startsWith(prefix) && file.endsWith('.html')) {
          const oldFile = path.join(OUT_DIR, file);
          await fs.unlink(oldFile);
          console.log('🗑️ Smazán starý HTML soubor:', file);
        }
      }
    } catch (error) {
      // Pokud složka neexistuje nebo je prázdná, není co mazat
      if (error.code !== 'ENOENT') {
        console.warn('⚠️ Chyba při mazání starých souborů:', error.message);
      }
    }
    
    // Název souboru: orderKey + náhodný hash (např. dt34587-abc123def4.html)
    const randomHash = slug(10);
    const fileName = `${orderKey}-${randomHash}.html`;
    const outFile = path.join(OUT_DIR, fileName);
    await fs.writeFile(outFile, html, 'utf8');
    console.log('🧾 Landing vygenerován (lokálně):', outFile);
    console.log('👉 Otevři v prohlížeči:', `file://${outFile}`);
    
    // 7) Upload HTML na R2 (pokud je zapnuto)
    let htmlUrl = `file://${outFile}`; // Výchozí URL je lokální soubor
    const shouldUploadHtml = UPLOAD_HTML_TO_R2 === 'true' || UPLOAD_HTML_TO_R2 === true;
    if (shouldUploadHtml && s3Client) {
      try {
        // Použijeme konzistentní název pro HTML na R2 (orderKey.html), aby se vždy přepsal
        // HTML se ukládá do stejné složky jako MP3 soubory (randomFolder)
        const htmlFileNameOnR2 = `${orderKey}.html`;
        const htmlKey = `${randomFolder}/${htmlFileNameOnR2}`;
        
        // Před uploadem smažeme starý HTML soubor se stejným orderKey (pokud existuje)
        // Procházíme všechny možné složky - najdeme starý HTML podle orderKey
        // (V reálnosti bychom měli hledat podle orderKey, ale jelikož randomFolder je náhodný,
        // smažeme jen ten, který máme aktuálně)
        // Starý HTML se automaticky přepíše, protože má stejný klíč (htmlKey)
        
        await uploadToR2(outFile, htmlKey, 'text/html');
        console.log('☁️ HTML nahraný na Cloudflare R2 jako:', htmlKey);
        
        // Vytvoříme public URL pro HTML
        htmlUrl = await createSignedUrl(htmlKey, SIGNED_URL_TTL_SEC);
        console.log('🌐 HTML dostupný online:', htmlUrl);
        console.log('👉 Otevři v prohlížeči:', htmlUrl);
      } catch (error) {
        console.error('❌ Chyba při nahrávání HTML na R2:', error.message);
      }
    } else if (shouldUploadHtml) {
      console.log('⚠️ Upload HTML na R2 je zapnutý, ale R2 client není inicializovaný.');
    }
    
    // 8) Aktualizace Google Sheets (pokud je zapnuto)
    await updateGoogleSheet(orderKey, htmlUrl);
  } catch (e) {
    console.error('❌ Chyba při zpracování MP3:', e?.message || e);
  }
}

// --- watcher / main ---
async function main() {
  await ensureDirs();
  console.log(`✅ Sleduji složku: ${IN_DIR}`);

  const watcher = chokidar.watch(IN_DIR, {
    ignoreInitial: true,
    ignored: /(^|[/\\])\../, // ignoruje .DS_Store a ostatní skryté soubory
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 50 },
  });

  watcher
    .on('ready', () => console.log('👀 Watcher připraven – vlož/zkopíruj MP3 do složky "in/".'))
    .on('add', (p) => {
      console.log('📥 Nový soubor:', p);
      if (p.toLowerCase().endsWith('.mp3')) handleMp3(p).catch(console.error);
    })
    .on('change', (p) => {
      console.log('✏️ Změněn soubor:', p);
      if (p.toLowerCase().endsWith('.mp3')) handleMp3(p).catch(console.error);
    });
}

// --- single-run režim (npm run make -- in/file.mp3) ---
async function singleRun() {
  const file = process.argv[3];
  if (!file) {
    console.log('Použití: npm run make -- in/soubor.mp3');
    process.exit(0);
  }
  await ensureDirs();
  await handleMp3(file);
}

// --- entrypoint ---
if (process.argv[2] === 'single') {
  singleRun().catch(e => {
    console.error('❌ Chyba v single-run:', e);
    process.exit(1);
  });
} else {
  main().catch(e => {
    console.error('❌ Chyba při startu main():', e);
    process.exit(1);
  });
}
