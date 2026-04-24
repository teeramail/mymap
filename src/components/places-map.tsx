"use client";

import {
  APIProvider,
  Map,
  Marker,
  Polyline,
  useMap
} from "@vis.gl/react-google-maps";
import { useEffect, useMemo } from "react";

import { clientEnv } from "@/env-client";
import type { PlaceRecord } from "@/components/dashboard-shell";

function FitBounds(props: { places: PlaceRecord[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || props.places.length === 0) {
      return;
    }

    if (props.places.length === 1) {
      const place = props.places[0]!;
      map.panTo({ lat: place.latitude, lng: place.longitude });
      map.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    props.places.forEach((place) => {
      bounds.extend({ lat: place.latitude, lng: place.longitude });
    });

    map.fitBounds(bounds, 120);
  }, [map, props.places]);

  return null;
}

export function PlacesMap(props: {
  places: PlaceRecord[];
  selectedIds: string[];
  onToggleSelect: (placeId: string) => void;
}) {
  const path = useMemo(
    () =>
      props.places.map((place) => ({
        lat: place.latitude,
        lng: place.longitude
      })),
    [props.places]
  );

  const defaultCenter = props.places[0]
    ? { lat: props.places[0].latitude, lng: props.places[0].longitude }
    : { lat: 13.7563, lng: 100.5018 };

  return (
    <APIProvider apiKey={clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["geometry"]}>
      <div className="h-[520px] overflow-hidden rounded-3xl border border-white/10">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={5}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId={clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
          style={{ width: "100%", height: "100%" }}
        >
          <FitBounds places={props.places} />

          {props.places.map((place) => (
            <Marker
              key={place.id}
              position={{ lat: place.latitude, lng: place.longitude }}
              onClick={() => props.onToggleSelect(place.id)}
              title={place.name}
              opacity={props.selectedIds.length === 0 || props.selectedIds.includes(place.id) ? 1 : 0.5}
            />
          ))}

          {path.length >= 2 ? (
            <Polyline
              path={path}
              strokeColor="#38bdf8"
              strokeOpacity={0.8}
              strokeWeight={3}
            />
          ) : null}
        </Map>
      </div>
    </APIProvider>
  );
}
