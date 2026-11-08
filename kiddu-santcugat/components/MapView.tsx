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
}

function icon(c: CardView, selected: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="pin${selected ? ' selected' : ''}" data-testid="pin" data-id="${c.id}" aria-label="${c.title.replace(/"/g, '&quot;')}">${c.icon}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export default function MapView({ center, me, cards, selected, onSelect }: Props) {
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
      {me && <CircleMarker center={me} radius={8} pathOptions={{ color: '#3d7bf5' }} />}
    </MapContainer>
  );
}
