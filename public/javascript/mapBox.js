
mapboxgl.accessToken = '<%-process.env.MAPBOX_TOKEN%>';
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [28.9662187,41.0091982], // starting position [lng, lat]
            zoom: 9, // starting zoom
        });