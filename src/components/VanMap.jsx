import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import VanMarkerPopup from './VanMarkerPopup';

// Flies to user position once it's available
function FlyToUser({ userPos }) {
  const map = useMap();
  const hasFlown = useRef(false);
  useEffect(() => {
    if (userPos && !hasFlown.current && !isNaN(userPos[0]) && !isNaN(userPos[1])) {
      hasFlown.current = true;
      map.flyTo(userPos, 14, { duration: 1.2 });
    }
  }, [userPos, map]);
  return null;
}

const vanIcon = new L.DivIcon({
  html: `<div style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));">🍦</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
  className: ''
});

const sightingIcon = new L.DivIcon({
  html: `<div style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));">🍦</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
  className: ''
});

const userIcon = new L.DivIcon({
  html: `<div style="position:relative;width:22px;height:22px;">
    <div style="position:absolute;inset:0;background:rgba(59,130,246,0.2);border-radius:50%;animation:pulse 2s ease-out infinite;transform-origin:center;"></div>
    <div style="position:absolute;inset:3px;background:#3b82f6;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>
  </div>
  <style>@keyframes pulse{0%{transform:scale(1);opacity:0.8}70%{transform:scale(2.4);opacity:0}100%{transform:scale(2.4);opacity:0}}</style>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  className: ''
});


function MyLocationButton({ userPos, onLocated }) {
  const map = useMap();
  const [locating, setLocating] = React.useState(false);

  const handleClick = () => {
    // If we already have position, fly there immediately
    if (userPos) {
      map.flyTo(userPos, 15, { duration: 1.2 });
      return;
    }
    // Otherwise request location fresh
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = [pos.coords.latitude, pos.coords.longitude];
        onLocated(latLng);
        map.flyTo(latLng, 15, { duration: 1.2 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ position: 'absolute', bottom: '16px', right: '10px', zIndex: 1000 }}>
      <button
        onClick={handleClick}
        title="Go to my location"
        style={{
          background: 'white',
          border: '2px solid rgba(0,0,0,0.2)',
          borderRadius: '8px',
          width: '34px',
          height: '34px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
        {locating
          ? <span style={{ fontSize: '14px' }}>⏳</span>
          : <span style={{ color: '#3b82f6', fontSize: '22px', lineHeight: 1 }}>➤</span>
        }
      </button>
    </div>
  );
}

export default function VanMap({ vans, className = "" }) {
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(true);
  const defaultCenter = [51.505, -0.09];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (!isNaN(lat) && !isNaN(lng)) setUserPos([lat, lng]);
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocating(false);
    }
  }, []);

  const center = userPos || defaultCenter;

  return (
    <div className="bg-slate-50 mb-6 rounded-2xl overflow-hidden shadow-lg border border-border h-[50vh]">
      <MapContainer center={center} zoom={userPos ? 14 : 5} className="w-full h-full" style={{ minHeight: '400px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20} />
        

        <FlyToUser userPos={userPos} />
        <MyLocationButton userPos={userPos} onLocated={setUserPos} />
        {userPos && <Marker position={userPos} icon={userIcon} />}
        {vans.filter((v) => v.is_active && v.latitude && v.longitude && !isNaN(v.latitude) && !isNaN(v.longitude)).map((van) =>
        <Marker key={van.id} position={[van.latitude, van.longitude]} icon={van.isSighting ? sightingIcon : vanIcon}>
            <Tooltip permanent direction="top" offset={[0, -38]} opacity={1} className="van-label">
              <span style={{ fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap', color: '#0ea5e9' }}>{van.name}</span>
            </Tooltip>
            <Popup>
              <VanMarkerPopup van={van} />
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>);

}