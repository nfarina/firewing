import { deg2rad, geohashForLocation, geohashQueryBounds, GeohashRange } from "./geohash.js";

// Google Maps.
interface LatLng {
  lat: number;
  lng: number;
}

// Mobile devices.
interface LatLon {
  lat: number;
  lon: number;
}

// Mapbox.
type LngLat = [number, number]; // lng, lat

export type AnyLatLng = LatLng | LatLon | LngLat;

/**
 * Returns distance in meters between the two lat/lng points.
 *
 * Uses the Haversine formula. Note that this is approximate due to the fact
 * that the Earth's radius varies between 6356.752 km and 6378.137 km.
 */
export function getDistance(location1: AnyLatLng, location2: AnyLatLng): number {
  const [lon1, lat1] = toLngLat(location1);
  const [lon2, lat2] = toLngLat(location2);

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c; // Distance in km
  return km * 1000; // …to meters
}

// Coerce our various representations of geo coordinates into the easiest to
// work with in getDistance.
export function toLngLat(location: AnyLatLng): LngLat {
  if (Array.isArray(location)) {
    return location as LngLat;
  } else if ("lng" in location && typeof location.lng === "number") {
    return [location.lng, location.lat];
  } else if ("lon" in location && typeof location.lon === "number") {
    return [location.lon, location.lat];
  } else throw new Error(`Unrecognized location: ${JSON.stringify(location)}`);
}

export function toLatLng(location: AnyLatLng): LatLng {
  const [lng, lat] = toLngLat(location);
  return { lat, lng };
}

// https://stackoverflow.com/a/2839560/66673
export function translateLocation(
  location: AnyLatLng,
  dx: number, // Meters
  dy: number, // Meters
): LngLat {
  const [lon, lat] = toLngLat(location);

  const newLat = lat + (180 / Math.PI) * (dy / 6378137);
  const newLon = lon + ((180 / Math.PI) * (dx / 6378137)) / Math.cos((Math.PI / 180.0) * lat);

  return [newLon, newLat];
}

export function getGeohash(location: AnyLatLng): string {
  const [lng, lat] = toLngLat(location);
  return geohashForLocation([lat, lng]);
}

/**
 * Calculates a set of query bounds to fully contain a given circle, each being
 * a [start, end] pair where any geohash is guaranteed to be lexicographically
 * larger than start and smaller than end.
 *
 * @param center center of the circle.
 * @param radius in meters.
 * @returns
 */
export function getGeohashQueryBounds(center: AnyLatLng, radius: number): GeohashRange[] {
  const [lng, lat] = toLngLat(center);
  return geohashQueryBounds([lat, lng], radius);
}
