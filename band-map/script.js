console.log("script.js loaded");
console.log("bandEvents =", bandEvents);



mapboxgl.accessToken = MAPBOX_TOKEN; 
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [0, 20],
    zoom: 2
});

let markers = [];

// Function to render markers up to selected index
function renderMarkers(index) {
    // Remove previous markers
    markers.forEach(m => m.remove());
    markers = [];

    for (let i = 0; i <= index; i++) {
        const ev = bandEvents[i];
        const color = ev.type === 'breakup' ? 'red' : 'blue';

        const el = document.createElement('div');
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;

        const marker = new mapboxgl.Marker(el)
            .setLngLat([ev.lon, ev.lat])
            .setPopup(new mapboxgl.Popup().setText(`${ev.date}: ${ev.description}`))
            .addTo(map);

        markers.push(marker);
    }
}

// Initialize first marker
renderMarkers(0);

// Timeline slider logic
const slider = document.getElementById('timeline');
slider.max = bandEvents.length - 1;
slider.addEventListener('input', (e) => {
    renderMarkers(parseInt(e.target.value));
});

// Optional: auto-play animation
let current = 0;
setInterval(() => {
    current = (current + 1) % bandEvents.length;
    slider.value = current;
    renderMarkers(current);
}, 2000);
