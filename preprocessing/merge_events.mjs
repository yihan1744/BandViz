// Run with: node merge_events.mjs
import fs from "fs";
import path from "path";

// Paths
const dataJsonPath = path.resolve("../band-map/data.json");
const albumEventsPath = path.resolve("./Deep_Purple_album_events.json");
try {
  // Read existing data.json
  const dataJsonRaw = fs.readFileSync(dataJsonPath, "utf-8");
  const data = JSON.parse(dataJsonRaw);

  // Read album events JSON
  const albumEventsRaw = fs.readFileSync(albumEventsPath, "utf-8");
  const albumEvents = JSON.parse(albumEventsRaw);

  // Ensure bandEvents array exists
  if (!Array.isArray(data.bandEvents)) {
    data.bandEvents = [];
  }

  // Merge album events into bandEvents
  data.bandEvents.push(...albumEvents);

  // Optionally, sort events by date (earliest first)
  data.bandEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // Write back the updated data.json
  fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2), "utf-8");

  console.log("Album events merged successfully!");
} catch (err) {
  console.error("Error merging events:", err);
}
