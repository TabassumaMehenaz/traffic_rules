const trafficData = [
  { lat: 23.8103, lng: 90.4125, severity: 'heavy', description: 'Traffic jam at XYZ road' },
  { lat: 23.815, lng: 90.41, severity: 'moderate', description: 'Slow traffic near ABC intersection' },
];
trafficData.forEach((spot) => {
  const color = spot.severity === 'heavy' ? 'red' : 'orange';
  const marker = L.circleMarker([spot.lat, spot.lng], {
    radius: 8,
    color,
    fillColor: color,
    fillOpacity: 0.7,
  }).addTo(map);
  marker.bindPopup(`<b>${spot.description}</b>`);
});
