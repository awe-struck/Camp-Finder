// https://docs.maptiler.com/client-js/
// https://docs.maptiler.com/client-js/geocoding/#forward
// https://www.npmjs.com/package/@maptiler/leaflet-maptilersdk#from-cdn-with-the-umd-bundle
// https://documentation.maptiler.com/hc/en-us/articles/360020949538-How-to-create-a-map-with-the-Leaflet-JavaScript-library
// https://leafletjs.com/examples/quick-start/

//Latitude & Longitutde Switched
const { coordinates } = foundCampground.geometry;
[coordinates[0], coordinates[1]] = [coordinates[1], coordinates[0]];

// Map Creation
const map = L.map("map").setView(coordinates, 1).setZoom(4);
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

// Marker Icon and Marker
const myIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const marker = L.marker(coordinates, { icon: myIcon })
  .addTo(map)
  .bindPopup(
    `<h6>${foundCampground.title}</h6><p>${foundCampground.location}</p>`,
    { maxWidth: 200, keepInView: true }
  )
  .openPopup();
