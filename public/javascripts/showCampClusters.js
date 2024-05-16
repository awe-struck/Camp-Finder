// Map
const map = L.map("map").setView([0, 0], 1);
L.tileLayer(
  // mapTOken stores process.env.apiKey injected via toplevel script
  `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${mapToken}`,
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,

    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    crossOrigin: true,
  }
).addTo(map);

// Marker Icon
const myIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Cluster Layer with Markers
const markers = L.markerClusterGroup();
(async () => {
  for (let campground of campgrounds) {
    const { coordinates } = campground.geometry;
    [coordinates[0], coordinates[1]] = [coordinates[1], coordinates[0]];
    const marker = L.marker(coordinates, { icon: myIcon }).bindPopup(
      `<h6>${campground.title}</h6><p>${campground.location}</p>`,
      {
        maxWidth: 200,
        keepInView: true,
      }
    );
    markers.addLayer(marker);
  }
  map.addLayer(markers);
})();
