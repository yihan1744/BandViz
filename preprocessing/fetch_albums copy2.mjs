// fetch_albums.mjs
import fs from "fs";
import path from "path";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

const USER_AGENT = 'BandViz/1.0 ( your-email@example.com )';
const maxRetries = 6;

// Optional proxy
const proxy = 'http://127.0.0.1:7897';
const agent = new HttpsProxyAgent(proxy);

// Helper for exponential backoff
const wait = ms => new Promise(r => setTimeout(r, ms));

async function searchArtist(name) {
    const query = `artist:"${name}" AND type:group`;
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(query)}&fmt=json`;
    console.log("Fetching URL:", url);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: 15000 });
            if (!res.data.artists || res.data.artists.length === 0) return null;
            return res.data.artists[0]; // pick the first match
        } catch (err) {
            console.warn(`Attempt ${attempt} failed for artist search: ${err.message}`);
            if (attempt < maxRetries) await wait(2000 * attempt);
        }
    }

    console.error("Failed to search artist after multiple attempts");
    return null;
}

async function fetchAlbums(mbid) {
    const url = `https://musicbrainz.org/ws/2/release-group?artist=${mbid}&type=album&fmt=json`;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: 15000 });
            return res.data['release-groups'] || [];
        } catch (err) {
            console.warn(`Attempt ${attempt} failed for album fetch: ${err.message}`);
            if (attempt < maxRetries) await wait(2000 * attempt);
        }
    }
    console.error("Failed to fetch albums after multiple attempts");
    return [];
}

async function fetchEarliestReleaseDate(releaseGroupId, albumTitle) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const url = `https://musicbrainz.org/ws/2/release?release-group=${releaseGroupId}&fmt=json&limit=100`;
            const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: 15000 });
            const releases = res.data.releases || [];
            const releasesWithDate = releases.filter(r => r.date);
            if (!releasesWithDate.length) return null;

            releasesWithDate.sort((a, b) => a.date.localeCompare(b.date));
            return releasesWithDate[0].date;

        } catch (err) {
            console.warn(`Attempt ${attempt} failed for date of "${albumTitle}": ${err.message}`);
            if (attempt < maxRetries) await wait(2000 * attempt);
        }
    }
    console.error(`Failed to fetch date for "${albumTitle}" after ${maxRetries} attempts`);
    return null;
}

async function downloadCover(releaseGroupId, destPath, albumTitle) {
    if (fs.existsSync(destPath)) return true;

    const metaUrl = `https://coverartarchive.org/release-group/${releaseGroupId}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Fetch metadata
            const metaRes = await axios.get(metaUrl, {
                headers: { 'User-Agent': USER_AGENT },
                timeout: 15000,
                httpsAgent: agent,
                validateStatus: s => s >= 200 && s < 500
            });
            const meta = metaRes.data;
            if (!meta.images || meta.images.length === 0) throw new Error("No images in metadata");

            const imageUrl = meta.images.find(img => img.front)?.image;
            if (!imageUrl) throw new Error("No front image URL");

            // Bypass proxy for archive.org
            const useProxy = !imageUrl.includes('archive.org');

            // Download image with streaming
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                headers: { 'User-Agent': USER_AGENT },
                timeout: 30000,
                httpsAgent: useProxy ? agent : undefined,
                validateStatus: s => s >= 200 && s < 500
            });

            const writer = fs.createWriteStream(destPath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            console.log(`Downloaded cover: ${destPath}`);
            return true;

        } catch (err) {
            const backoff = 2000 * attempt;
            console.warn(`Attempt ${attempt} failed for "${albumTitle}": ${err.message}. Retrying in ${backoff/1000}s...`);
            if (attempt < maxRetries) await wait(backoff);
        }
    }

    console.error(`Failed to download cover for "${albumTitle}" after ${maxRetries} attempts`);
    return false;
}

// --------------------- main ---------------------
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
    const failedDates = [];
    const failedCovers = [];

    const coverDir = path.join(process.cwd(), '../band-map/assets/albums');
    if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

    for (const album of albums) {
        const date = await fetchEarliestReleaseDate(album.id, album.title);
        if (!date) failedDates.push({ title: album.title, id: album.id });

        const output = {
            title: album.title,
            musicbrainz_id: album.id,
            date: date,
            cover: null
        };

        const safeName = album.title.replace(/[\/\\?%*:|"<>…!]/g, '_').replace(/\s+/g, '_');
        const dest = path.join(coverDir, safeName + '.jpg');
        const ok = await downloadCover(album.id, dest, album.title);
        if (ok) output.cover = dest;
        else failedCovers.push({ title: album.title, id: album.id });

        results.push(output);
    }

    const outputPath = `./${bandName.replace(/ /g,"_")}_raw_albums.json`;
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log("Saved:", outputPath);

    if (failedDates.length) {
        console.log("\n==== Failed Dates ====");
        failedDates.forEach(f => console.log(`- "${f.title}" (${f.id})`));
        console.log("=====================\n");
    }
    if (failedCovers.length) {
        console.log("\n==== Failed Covers ====");
        failedCovers.forEach(f => console.log(`- "${f.title}" (${f.id})`));
        console.log("=====================\n");
    } else {
        console.log("\nAll covers downloaded successfully!\n");
    }
}

main();
