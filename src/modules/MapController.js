
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoicG9saXNoZHVkZTIwIiwiYSI6ImNrMnRodjhidTBsM2QzbnFjdWZ4MzE3aGoifQ.7SUuuzTY1ED9vtGhi_KbyQ';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: [-122.2547275, 45.632601], // starting position [lng, lat]
  pitch: 60, // pitch in degrees
  bearing: 0, // bearing in degrees
  zoom: 16, // starting zoom
});

const geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Marker',
    geometry: {
      type: 'Point',
      coordinates: [-122.2547275, 45.632601],
    },
    properties: {
      title: 'Marker',
      description: 'Car Location',
    },
  },
  ],
};

const getNewMarker = ((longitude, latitude) => {
  const markerObject = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    properties: {
      title: 'NA',
      description: 'NA',
    },
  };
  return markerObject;
});


const addLineOriginToMap = ((startLongitude, startLatitude) => {
  const line = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [startLongitude, startLatitude],
      ],
    },
  };
  geojson.features.push(line);
});

export const addLineCoordinates = ((longitude, latitude) => {
  geojson.features.forEach((feature) => {
    if (feature.geometry.type === 'LineString') {
      feature.geometry.coordinates.push([longitude, latitude]);
    }
  });

  map.getSource('line-animation').setData(geojson);
});

const el = document.createElement('div');
el.className = 'mapMarker';
const markerIcon = new mapboxgl.Marker(el)
markerIcon.setLngLat([-122.2547275, 45.632601])
  .addTo(map);

export const updateMapMarker = ((longitude, latitude) => {
  geojson.features.forEach((feature) => {
    if (feature.geometry.type === 'Point') {
      feature.geometry.coordinates = [longitude, latitude];
      markerIcon.setLngLat(feature.geometry.coordinates);

    }
  });
});

export const initializeMap = () => {
  map.on('style.load', () => {
    map.addLayer({
      'id': 'line-animation',
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': geojson
      },
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#ed6498',
        'line-width': 5,
        'line-opacity': .8
      }
    });

    addLineOriginToMap(-122.255090, 45.632770);
  });
};
