
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [-73.935242, 40.730610], // starting position [lng, lat]
    zoom: 9, // starting zoom
});
