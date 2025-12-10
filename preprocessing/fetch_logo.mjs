// fetch_band_logo_p154.mjs
// Run with: NODE_TLS_REJECT_UNAUTHORIZED=0 node fetch_logo.mjs "Deep Purple"
// Test connection with: curl -v -L "https://commons.wikimedia.org/wiki/Special:FilePath/Deep-Purple-logo.svg"

import fs from "fs";
import axios from 'axios';
import path from "path";
import { HttpsProxyAgent } from "https-proxy-agent";

const USER_AGENT = "BandViz/1.0 (yawencao186@gmail.com)";
const PROXY_URL = "http://127.0.0.1:7897";
const httpsAgent = new HttpsProxyAgent(PROXY_URL);


// Helper: GET JSON via proxy
async function getJson(url) {
  const resp = await axios.get(url, {
    httpsAgent,
    headers: { 'User-Agent': USER_AGENT }
  });
  return resp.data;
}

// Search Wikidata to get QID
async function searchWikidata(bandName) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(bandName)}&language=en&format=json&type=item`;
  const data = await getJson(url);
  if (!data.search || data.search.length === 0) return null;
  return data.search[0].id;
}

// Fetch P154 logo filename
async function fetchLogoFilename(qid) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  const data = await getJson(url);
  const entity = data.entities[qid];
  const claim = entity?.claims?.P154?.[0];
  if (!claim) return null;
  return claim.mainsnak.datavalue.value;
}

// Download file (follow redirects) via proxy
async function downloadUrlToFile(url, destPath, filename) {
    const writer = fs.createWriteStream(destPath);

  
    const resp = await axios.get(url, {
        httpsAgent,
        headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(filename),
        'Accept': 'image/svg+xml, */*;q=0.8'
        },
        responseType: 'stream',
        maxRedirects: 10,
        // validateStatus: status => status >= 200 && status < 400
        validateStatus: status => status >= 200 && status < 300
    });

    // If resp.data is missing, just resolve after closing writer
    if (!resp.data || typeof resp.data.pipe !== 'function') {
        throw new Error('Download failed: no data stream received');
    }

    resp.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', err => reject(new Error('Write error: ' + err.message)));
    });

}

// Path to band-map/data.json
const dataJsonPath = path.join(process.cwd(), '../band-map/data.json');

function updateDataJson(absoluteLogoPath) {
  let data;
  try {
    const raw = fs.readFileSync(dataJsonPath, 'utf-8');
    data = JSON.parse(raw);
  } catch {
    data = {}; // fallback if file is missing or empty
  }

  // Compute relative path from band-map folder
  const relativePath = path.relative(path.join(process.cwd(), '../band-map'), absoluteLogoPath).replace(/\\/g, '/');
  data.bandLogo = relativePath;

  fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('data.json updated successfully:', absoluteLogoPath);
}

async function main() {
  const bandName = process.argv[2];
  if (!bandName) {
    console.error('Usage: node fetch_band_logo_axios.mjs "Band Name"');
    process.exit(1);
  }

  console.log('Searching Wikidata for:', bandName);
  const qid = await searchWikidata(bandName);
  if (!qid) {
    console.error('No Wikidata item found for', bandName);
    process.exit(1);
  }
  console.log('Found QID:', qid);

  console.log('Fetching P154 (logo) filename...');
  const filename = await fetchLogoFilename(qid);
  if (!filename) {
    console.error('No P154 logo found for', bandName);
    process.exit(1);
  }
  console.log('Commons filename:', filename);

  const fileUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;

  const ext = path.extname(filename);
  const destDir = path.join(process.cwd(), '../band-map/assets/logos');
  fs.mkdirSync(destDir, { recursive: true });
  const safeName = bandName.replace(/\s+/g, '_') + ext;
  const destPath = path.join(destDir, safeName);

  console.log('Downloading logo to:', destPath);
  await downloadUrlToFile(fileUrl, destPath, filename);

  updateDataJson(destPath);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});