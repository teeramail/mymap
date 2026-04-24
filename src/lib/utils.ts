export function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function formatDistanceLabel(distanceInMeters: number) {
  if (distanceInMeters >= 1000) {
    return `${(distanceInMeters / 1000).toFixed(2)} km`;
  }

  return `${distanceInMeters.toFixed(0)} m`;
}
