import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix default icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DistanceLabels({ segmentDistances }) {
  const map = useMap();

  useEffect(() => {
    segmentDistances.forEach(({ from, to, distance }) => {
      const midLat = (from[0] + to[0]) / 2;
      const midLng = (from[1] + to[1]) / 2;

      L.marker([midLat, midLng], {
        icon: L.divIcon({
          className: "distance-label",
          html: `${distance.toFixed(1)} m`,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        }),
        interactive: false,
      }).addTo(map);
    });

    return () => {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.options.icon?.options?.className === 'distance-label') {
          map.removeLayer(layer);
        }
      });
    };
  }, [segmentDistances, map]);

  return null;
}

export default function Map({ path, segmentDistances }) {
  const start = path[0];
  const end = path[path.length - 1];

  return (
    <MapContainer
      center={start || [29.6516, -82.3248]} // Gainesville default
      zoom={13}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      />
      {path.length > 1 && <Polyline
        positions={path}
        color="blue"
        weight={5}           // thickness
        opacity={0.6}        // transparency
        lineCap="round"      // rounded edges
        smoothFactor={10}   // smoother curves
/>
}
      {start && <Marker position={start} />}
      {end && path.length > 1 && <Marker position={end} />}
      {segmentDistances && <DistanceLabels segmentDistances={segmentDistances} />}
    </MapContainer>
  );
}
