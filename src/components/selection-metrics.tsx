"use client";

import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useMemo } from "react";

import { clientEnv } from "@/env-client";
import type { PlaceRecord } from "@/components/dashboard-shell";
import { formatDistanceLabel } from "@/lib/utils";

function useGeometryDistances(places: PlaceRecord[]) {
  const geometryLib = useMapsLibrary("geometry");

  return useMemo(() => {
    if (!geometryLib || places.length < 2) {
      return {
        totalDistance: 0,
        segments: [] as Array<{ from: string; to: string; distance: number }>
      };
    }

    const segments = places.slice(1).map((place, index) => {
      const previousPlace = places[index]!;
      const distance = geometryLib.spherical.computeDistanceBetween(
        new google.maps.LatLng(previousPlace.latitude, previousPlace.longitude),
        new google.maps.LatLng(place.latitude, place.longitude)
      );

      return {
        from: previousPlace.name,
        to: place.name,
        distance
      };
    });

    return {
      totalDistance: segments.reduce((sum, segment) => sum + segment.distance, 0),
      segments
    };
  }, [geometryLib, places]);
}

function MetricsContent(props: { places: PlaceRecord[] }) {
  const { totalDistance, segments } = useGeometryDistances(props.places);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-sky-950/20 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">Distance metrics</h2>
      <p className="mt-2 text-sm text-slate-400">
        Select at least 2 places to see straight-line distances and the total path length.
      </p>

      {props.places.length < 2 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-400">
          Choose 2 or more places from the list to start measuring.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
            <p className="text-sm text-sky-100">Total selected path</p>
            <p className="mt-1 text-2xl font-semibold text-white">{formatDistanceLabel(totalDistance)}</p>
          </div>

          {segments.map((segment) => (
            <div key={`${segment.from}-${segment.to}`} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-sm font-medium text-white">
                {segment.from} → {segment.to}
              </p>
              <p className="mt-1 text-sm text-slate-300">{formatDistanceLabel(segment.distance)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SelectionMetrics(props: { places: PlaceRecord[] }) {
  return (
    <APIProvider apiKey={clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["geometry"]}>
      <MetricsContent places={props.places} />
    </APIProvider>
  );
}
