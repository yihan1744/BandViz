import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';

// For ESM, get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Proxy (your Clash system proxy)
const proxy = 'http://127.0.0.1:7897';
const agent = new HttpsProxyAgent(proxy);

// URL of the release JSON
const releaseJsonUrl = 'https://coverartarchive.org/release/32a6976e-2535-4e78-95b9-bbb75c05286e';

// Folder to save covers
const coverDir = path.join(__dirname, 'covers');
if (!fs.existsSync(coverDir)) {
  fs.mkdirSync(coverDir);
}

async function main() {
  try {
    // Fetch JSON
    const res = await fetch(`${releaseJsonUrl}`, { agent });
    if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status}`);
    const data = await res.json();

    // Extract first image URL
    const firstImage = data.images[0]?.image;
    if (!firstImage) {
      console.log('No images found in JSON.');
      return;
    }
    console.log('First image URL:', firstImage);

    // Fetch image
    const imageRes = await fetch(firstImage, { agent });
    if (!imageRes.ok) throw new Error(`Failed to download image: ${imageRes.status}`);

    // Save to covers folder
    const fileName = path.basename(firstImage);
    const filePath = path.join(coverDir, fileName);
    const buffer = await imageRes.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log('Image saved to', filePath);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
