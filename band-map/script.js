console.log("script.js loaded");
console.log("bandEvents =", bandEvents);



mapboxgl.accessToken = MAPBOX_TOKEN; 
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [0, 20],
    zoom: 2
});

// Store both the marker DOM and the mapbox marker object (for managing popup)
let markerEls = [];
let markerObjs = [];

// Create all markers at once (hidden initially)
bandEvents.forEach((event, index) => {
    // const el = document.createElement("div");
    // el.className = "event-marker";

    // el.style.backgroundColor =
    //     event.type === "breakup" ? "red" : "blue";

    // // start fully transparent
    // el.style.opacity = 0; 
    // // smooth fade for opacity changes
    // el.style.transition = "opacity 1000ms ease"; 

    const el = document.createElement("img");
    el.src = bandLogo; 
    el.className = "event-marker";

    el.style.opacity = 0;          
    el.style.transition = "opacity 1s ease";
    el.style.cursor = "pointer";

    // create popup
    const popup = new mapboxgl.Popup().setHTML(
        `<strong>${event.date}</strong><br>
         <strong>${event.title || ""}</strong><br>
         ${event.description || ""}`
    );

    // create and add marker (with popup just created) to the map (we keep the element reference)
    marker = new mapboxgl.Marker(el)
        .setLngLat([event.location.lon, event.location.lat])
        .setPopup(popup)
        .addTo(map);

    markerEls.push(el);
    markerObjs.push(marker);
});

// Unified update function: fade previous out, fade new in
let lastIndex = null;
function renderMarkers(i) {
    // Fade out previous marker
    if (lastIndex !== null) {
        markerEls[lastIndex].style.opacity = 0;
        markerEls[lastIndex].style.pointerEvents = "none"; // disable clicks
        markerObjs[lastIndex].getPopup().remove();  // close popup
    }

    // Fade in current marker
    markerEls[i].style.opacity = 1;
    markerEls[i].style.pointerEvents = "auto"; // enable clicks
    markerObjs[i].togglePopup(); // auto open popup

    lastIndex = i;
}

// Timeline slider logic
const slider = document.getElementById('timeline');
slider.max = bandEvents.length - 1;
slider.addEventListener('input', () => {
    renderMarkers(parseInt(slider.value));
});
// Initialize first marker visible
if (bandEvents.length > 0) {
  renderMarkers(0);
  slider.value = 0;
}

// Auto-play animation
let current = 0;
const autoplayIntervalMs = 2000;
const autoplay = setInterval(() => {
  current = (current + 1) % bandEvents.length;
  slider.value = current;
  renderMarkers(current);
}, autoplayIntervalMs);
// stop autoplay when user interacts with slider
slider.addEventListener('mousedown', () => clearInterval(autoplay));
slider.addEventListener('touchstart', () => clearInterval(autoplay));