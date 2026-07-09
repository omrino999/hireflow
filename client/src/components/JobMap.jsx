import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '../context/ThemeContext';
import { formatLocation } from '../utils/location';

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

// Distinct green "you are here" marker for the user's own location
const userIcon = L.divIcon({
  className: '',
  html:
    '<div style="width:18px;height:18px;border-radius:50%;background:#10b981;' +
    'border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
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

export default function JobMap({ jobs, userLocation }) {
  const { theme } = useTheme();
  const [markers, setMarkers] = useState([]);
  const [userPoint, setUserPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const withLoc = jobs.map((j) => ({ ...j, loc: formatLocation(j) })).filter((j) => j.loc);

  // re-geocode when the set of (job → location) pairs, or the user's location, changes
  const sig = withLoc.map((j) => j.id + j.loc).join('|') + '::' + (userLocation || '');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (userLocation) {
        const uc = await geocode(userLocation);
        if (!cancelled) setUserPoint(uc);
      } else {
        setUserPoint(null);
      }
      const results = [];
      for (const j of withLoc) {
        const coord = await geocode(j.loc);
        if (cancelled) return;
        if (coord) { results.push({ ...j, ...coord }); setMarkers([...results]); }
      }
      if (!cancelled) { setMarkers(results); setLoading(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  if (withLoc.length === 0 && !userLocation) {
    return <p className="text-sm text-slate-400">Add a location to your jobs (or set your own on Profile) to see them on the map.</p>;
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
                <br /><span className="text-slate-500">{m.loc}</span>
              </Popup>
            </Marker>
          ))}
          {userPoint && (
            <Marker position={[userPoint.lat, userPoint.lng]} icon={userIcon}>
              <Popup>📍 You are here<br /><span className="text-slate-500">{userLocation}</span></Popup>
            </Marker>
          )}
          <FitBounds points={[...markers, ...(userPoint ? [userPoint] : [])]} />
        </MapContainer>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> You</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" /> Jobs</span>
      </div>
    </div>
  );
}
