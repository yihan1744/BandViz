//Run with: NODE_TLS_REJECT_UNAUTHORIZED=0 node fetch_albums.mjs "Deep Purple"

import fs from "fs";
import fetch from "node-fetch"; 
import path from "path";
import { HttpsProxyAgent } from "https-proxy-agent";

const USER_AGENT = 'BandViz/1.0 ( your-email@example.com )';

// ClashVerge proxy
const proxy = 'http://127.0.0.1:7897';
const agent = new HttpsProxyAgent(proxy);

async function searchArtist(name) {
    const query = `artist:"${name}" AND type:group`;
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(query)}&fmt=json`;
    console.log("Fetching URL:", url);

    const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
    });
    const data = await res.json();

    if (!data.artists || data.artists.length === 0) return null;

    return data.artists[0]; // pick the first match
}

async function fetchAlbums(mbid) {
    const url = `https://musicbrainz.org/ws/2/release-group?artist=${mbid}&type=album&fmt=json`;
    const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
    });
    const data = await res.json();
    return data['release-groups'] || [];
}

async function fetchEarliestReleaseDate(releaseGroupId) {
    const url = `https://musicbrainz.org/ws/2/release?release-group=${releaseGroupId}&fmt=json&limit=100`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const data = await res.json();
    const releases = data.releases || [];

    // Filter out releases without a date
    const releasesWithDate = releases.filter(r => r.date);

    if (releasesWithDate.length === 0) return null;

    // Find the earliest date
    releasesWithDate.sort((a, b) => a.date.localeCompare(b.date));
    return releasesWithDate[0].date;
}

async function downloadCover(releaseGroupId, destPath, albumTitle, maxRetries = 3) {
    if (fs.existsSync(destPath)) return true; // Skip if already downloaded

    const metaUrl = `https://coverartarchive.org/release-group/${releaseGroupId}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const metaRes = await fetch(metaUrl, { headers: { 'User-Agent': USER_AGENT }, agent });
            if (!metaRes.ok) return false;
            const meta = await metaRes.json();
            if (!meta.images || meta.images.length === 0) return false;

            const imageUrl = meta.images.find(img => img.front)?.image;
            if (!imageUrl) return false;

            const imgRes = await fetch(imageUrl, { headers: { 'User-Agent': USER_AGENT }, agent });
            if (!imgRes.ok) return false;

            const buffer = await imgRes.arrayBuffer();
            fs.writeFileSync(destPath, Buffer.from(buffer));
            console.log(`Downloaded cover: ${destPath}`);
            return true;
        } catch (err) {
            console.warn(`Attempt ${attempt} failed for "${albumTitle}": ${err.message}`);
            if (attempt < maxRetries) await new Promise(res => setTimeout(res, 2000)); // wait 2s before retry
        }
    }

    console.error(`Failed to download cover for "${albumTitle}" after ${maxRetries} attempts`);
    return false;
}

async function main() {
    const bandName = process.argv[2];
    if (!bandName) {
        console.error("Usage: node fetch_albums.mjs \"Band Name\"");
        process.exit(1);
    }

    console.log("Searching artist:", bandName);
    const artist = await searchArtist(bandName);
    if (!artist) {
        console.error("Artist not found!");
        process.exit(1);
    }

    console.log("Artist:", artist.name, "MBID:", artist.id);

    const albums = await fetchAlbums(artist.id);
    const results = [];
    const failedCovers = []; // Keep track of failed downloads

    // Ensure covers folder exists
    const coverDir = path.join(process.cwd(), 'covers');
    if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir);

    for (const album of albums) {
        const date = await fetchEarliestReleaseDate(album.id);
        const output = {
            title: album.title,
            musicbrainz_id: album.id,
            date: date,
            cover: null
        };

        // Try to download cover
        const safeName = album.title.replace(/[\/\\?%*:|"<>]/g, '_');
        const dest = path.join(coverDir, safeName + '.jpg');
        const ok = await downloadCover(album.id, dest, safeName);
        if (ok) {
        output.cover = dest;
        } else {
            failedCovers.push({ title: album.title, id: album.id });
        }


        results.push(output);
    }

    const outputPath = `./${bandName.replace(" ", "_")}_raw_albums.json`;
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log("Saved:", outputPath);

    // Summary of failed downloads
    if (failedCovers.length > 0) {
        console.log("\n==== SUMMARY: Failed Cover Downloads ====");
        failedCovers.forEach(f => {
            console.log(`- "${f.title}" (${f.id})`);
        });
        console.log("========================================\n");
    } else {
        console.log("\nAll covers downloaded successfully!\n");
    }
}

main();
