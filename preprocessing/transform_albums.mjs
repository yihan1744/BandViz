// transform_albums.mjs
// Run with: node transform_albums.mjs
import fs from "fs";

// hardcoded for now, later they should be placeholders here 
// and be filled in when merging in bandEvents list
const bandName = "Deep Purple";
const bandBirthplace = {
  name: "Hertford, England",
  lat: 51.7965,
  lon: -0.0773
};

const inputPath = `./${bandName.replace(" ", "_")}_raw_albums.json`;
const outputPath = `./${bandName.replace(" ", "_")}_album_events.json`;

const rawAlbums = JSON.parse(fs.readFileSync(inputPath));

function extractRelativeCoverPath(fullPath) {
  if (!fullPath) return null; // cover missing
  
  // Normalize and split
  const idx = fullPath.indexOf("assets/");
  if (idx === -1) {
    console.warn("WARNING: cover path does not contain 'assets/':", fullPath);
    return fullPath; // fallback
  }
  return fullPath.slice(idx); // return from "assets/..."
}

const transformed = rawAlbums.map(a => ({
  type: "album",
  date: a.date,
  precision: a.date.length === 4 ? "year" : (a.date.length === 7 ? "month" : "day"),
  title: a.title,
  description: `${a.title} album released.`,
  album: {
    title: a.title,
    cover: extractRelativeCoverPath(a.cover),
    musicbrainz_id: a.musicbrainz_id
  },
  location: {
    type: "birthplace",
    name: bandBirthplace.name,
    lat: bandBirthplace.lat,
    lon: bandBirthplace.lon
  }
}));

fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
console.log("Saved:", outputPath);
