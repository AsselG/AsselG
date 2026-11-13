'use client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, CircleMarker } from 'react-leaflet';
import type { CardView } from '@/lib/view';

interface Props {
  center: [number, number];
  me: [number, number] | null;
  cards: CardView[];
  selected: string | null;
  onSelect: (id: string) => void;
  plans: { id: string; title: string; lat: number | null; lng: number | null }[];
  lang: string;
}

function icon(c: CardView, selected: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="pin t-${c.themes[0]}${selected ? ' selected' : ''}" data-testid="pin" data-id="${c.id}" aria-label="${c.title.replace(/"/g, '&quot;')}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function planIcon(title: string) {
  return L.divIcon({
    className: '',
    html: `<div class="plan-pin" data-testid="plan-pin" data-title="${title.replace(/"/g, '&quot;')}" aria-label="${title.replace(/"/g, '&quot;')}"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function MapView({ center, me, cards, selected, onSelect, plans, lang }: Props) {
  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cards.map((c) => (
        <Marker
          key={`${c.id}-${selected === c.id}`}
          position={[c.lat, c.lng]}
          icon={icon(c, selected === c.id)}
          zIndexOffset={selected === c.id ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(c.id) }}
        />
      ))}
      {plans.filter((p) => p.lat != null && p.lng != null).map((p) => (
        <Marker key={`plan-${p.id}`} position={[p.lat!, p.lng!]} icon={planIcon(p.title)} zIndexOffset={900}
          eventHandlers={{ click: () => { window.location.href = `/${lang}/p/${p.id}`; } }} />
      ))}
      {me && <CircleMarker center={me} radius={8} pathOptions={{ color: '#3d7bf5' }} />}
    </MapContainer>
  );
}
