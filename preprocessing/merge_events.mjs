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

  // Build a map for existing events by title for quick lookup
  const existingEventsMap = new Map();
  data.bandEvents.forEach((event, index) => {
    existingEventsMap.set(event.title, index);
  });

  // Merge album events
  for (const albumEvent of albumEvents) {
    if (existingEventsMap.has(albumEvent.title)) {
      // Replace existing event
      const index = existingEventsMap.get(albumEvent.title);
      data.bandEvents[index] = albumEvent;
    } else {
      // Append new event
      data.bandEvents.push(albumEvent);
    }
  }

  // Sort events by date (earliest first)
  data.bandEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Write back the updated data.json
  fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2), "utf-8");

  console.log("Album events merged successfully!");
} catch (err) {
  console.error("Error merging events:", err);
}
