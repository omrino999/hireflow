import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '../context/ThemeContext';

// Leaflet's default marker icon breaks under bundlers — define an explicit icon instead
const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Geocode a location string via free Nominatim, cached in localStorage to respect rate limits
async function geocode(location) {
  const key = 'geo:' + location.trim().toLowerCase();
  const cached = localStorage.getItem(key);
  if (cached !== null) return cached === 'null' ? null : JSON.parse(cached);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`
    );
    const data = await res.json();
    if (!data[0]) { localStorage.setItem(key, 'null'); return null; }
    const coord = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    localStorage.setItem(key, JSON.stringify(coord));
    return coord;
  } catch {
    return null;
  }
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) {
      map.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 11 });
    }
  }, [points, map]);
  return null;
}

export default function JobMap({ jobs }) {
  const { theme } = useTheme();
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const withLoc = jobs.filter((j) => j.location);

  // re-geocode when the set of (job → location) pairs changes
  const sig = withLoc.map((j) => j.id + j.location).join('|');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = [];
      for (const j of withLoc) {
        const coord = await geocode(j.location);
        if (cancelled) return;
        if (coord) { results.push({ ...j, ...coord }); setMarkers([...results]); }
      }
      if (!cancelled) { setMarkers(results); setLoading(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  if (withLoc.length === 0) {
    return <p className="text-sm text-slate-400">Add a location to your jobs to see them on the map.</p>;
  }

  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div>
      {loading && <p className="mb-2 text-xs text-slate-400">Locating jobs on the map…</p>}
      <div className="h-96 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <MapContainer center={[32.0853, 34.7818]} zoom={7} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer key={theme} url={tileUrl} attribution='&copy; OpenStreetMap contributors' />
          {markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={defaultIcon}>
              <Popup>
                <Link to={`/jobs/${m.id}`} className="font-medium">{m.title}</Link>
                <br />{m.company}
                <br /><span className="text-slate-500">{m.location}</span>
              </Popup>
            </Marker>
          ))}
          <FitBounds points={markers} />
        </MapContainer>
      </div>
    </div>
  );
}
