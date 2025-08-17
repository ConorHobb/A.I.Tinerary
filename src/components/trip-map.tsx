'use client';

import { TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Activity } from '@/lib/types';
import { LatLngExpression, LatLngBounds, divIcon } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { getCategoryIcon } from './icons';
import { useEffect, useState } from 'react';
import type { MapContainerProps } from 'react-leaflet';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });

// Custom hook to fit map bounds
const FitBounds = ({ activities }: { activities: Activity[] }) => {
  const map = useMap();
  useEffect(() => {
    if (activities.length > 0) {
      const bounds = new LatLngBounds(activities.map(a => [a.lat, a.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [activities, map]);
  return null;
};


// Custom icon rendering
const createCustomIcon = (category: string) => {
    const IconComponent = getCategoryIcon(category);
    const iconHTML = ReactDOMServer.renderToString(
        <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
            <IconComponent className="w-5 h-5" />
        </div>
    );
    return divIcon({
        html: iconHTML,
        className: 'bg-transparent border-0',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};


export default function TripMap({ activities }: { activities: Activity[] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (typeof window === 'undefined' || !isClient) {
    return null;
  }

  if (!activities || activities.length === 0) {
    return <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">No locations to display on map.</div>;
  }

  const center: LatLngExpression = activities.length > 0 ? [activities[0].lat, activities[0].lng] : [51.505, -0.09];

  const mapProps: MapContainerProps = {
    center: center,
    zoom: 12,
    style: { height: "100%", width: "100%" },
  };

  return (
    <MapContainer {...mapProps}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {activities.map((activity) => (
        <Marker 
            key={activity.name} 
            position={[activity.lat, activity.lng]}
            icon={createCustomIcon(activity.category)}
        >
          <Popup>
            <div className="font-bold">{activity.name}</div>
            <div>{activity.description}</div>
          </Popup>
        </Marker>
      ))}
      <FitBounds activities={activities} />
    </MapContainer>
  );
}
