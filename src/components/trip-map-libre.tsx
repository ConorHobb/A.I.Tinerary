"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Activity } from "@/lib/types";

export default function TripMapLibre({ activities }: { activities: Activity[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return; // Initialize map only once

    // Center map on first destination or fallback
    const center: [number, number] = activities.length > 0 ? [activities[0].lng, activities[0].lat] : [0, 0];

    // Initialize map (Carto light tiles)
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: center, // [lon, lat] for MapLibre
      zoom: 10,
    });

    // Add navigation controls
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add markers for each destination
    activities.forEach((place) => {
        if(place.lat && place.lng) {
            new maplibregl.Marker()
                .setLngLat([place.lng, place.lat])
                .setPopup(
                new maplibregl.Popup().setHTML(
                    `<strong>${place.name}</strong><br/>${place.description}`
                )
                )
                .addTo(mapRef.current!);
        }
    });

    // Adjust map to fit all markers
    if (activities.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        activities.forEach(place => {
            if (place.lat && place.lng) {
                bounds.extend([place.lng, place.lat]);
            }
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
    }


    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [activities]);

  return <div ref={mapContainer} className="h-96 w-full rounded-xl shadow-md" />;
}
