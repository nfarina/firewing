import { useResettableState } from "crosswing/hooks/useResettableState";
import {
  AnyLatLng,
  getDistance,
  getGeohashQueryBounds,
} from "crosswing/shared/geo";
import Debug from "debug";
import firebase from "firebase/compat/app";
import { DependencyList, useEffect } from "react";
import { getFieldValue } from "../shared/shared";
import {
  Falsy,
  FirebaseAppAccessor,
  useFirebaseApp,
} from "./FirebaseAppContext";
import { snapshotToArray } from "./useFirestoreQuery";

const debug = Debug("fireplace:nearby");

export interface UseFirestoreNearbyQueryOptions {
  /** Center of the search circle. */
  location: AnyLatLng | null;
  /** Radius of the search circle. */
  radius: number;
  /**
   * String path in dot notation, like "place.location", that should lead to
   * an object with properties: {lat: number, lng: number, geohash: string}
   */
  fieldPath?: string;
}

/**
 * Loads a live query from Firestore using geohash to filter by nearby objects.
 * Radius is in meters.
 *
 * @param query Function that generates a `firestore.Query`.
 * @param deps Array of mixed values that the `query` argument "depends on", similar to useState().
 * @returns Either the loaded data, or undefined if the data is still loading.
 */
export function useFirestoreNearbyQuery<T extends { id?: string }>(
  query: (app: FirebaseAppAccessor) => firebase.firestore.Query<T> | Falsy,
  deps: DependencyList,
  { location, radius, fieldPath = "location" }: UseFirestoreNearbyQueryOptions,
): T[] | undefined {
  const app = useFirebaseApp();

  // Use resettable state so that if our deps change, our value gets cleared
  // out right away. Note that we don't reset state completely just for location
  // or radius changes.
  const [resultMap, setResultMap] = useResettableState<
    Map<string, T[] | undefined> | undefined
  >(undefined, deps);

  useEffect(() => {
    const q = query(app);

    if (location && q && !!q.onSnapshot) {
      // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
      // a separate query for each pair. There can be up to 9 pairs of bounds
      // depending on overlap, but in most cases there are 4.
      const bounds = getGeohashQueryBounds(location, radius);

      // If we have a resultMap already, we can reuse it so things don't
      // disappear and reappear for small location changes. But we do want
      // to remove bounds slots from the old map that are no longer present.
      if (resultMap) {
        const newMap = new Map(resultMap);

        for (const bound of newMap.keys()) {
          if (!bounds.some((b) => b.join("-") === bound)) {
            newMap.delete(bound);
          }
        }

        setResultMap(newMap);
      } else {
        // Pre-create an empty map with all the bounds slots we'll need, with
        // undefined values to indicate that we're waiting on results for each.
        const newMap = new Map<string, T[] | undefined>();

        for (const bound of bounds) {
          newMap.set(bound.join("-"), undefined);
        }

        setResultMap(newMap);
      }

      debug(`Subscribing to ${JSON.stringify(bounds)}`);

      // Track all unsubscribe calls we'll need to make later.
      const unsubscribes: (() => void)[] = [];

      // It's important that the second pass of calling onSnapshot() is done
      // after setting our initial map value, because MockFirestore will call
      // our snapshot function immediately (synchronously).
      for (const b of bounds) {
        const subQuery = q
          .orderBy(fieldPath + ".geohash")
          .startAt(b[0])
          .endAt(b[1]);

        const snapshotHandler = (
          snapshot: firebase.firestore.QuerySnapshot<T>,
        ) => {
          // Filter out results that are outside the radius.
          const results = snapshotToArray(snapshot).filter((result) => {
            // We expect this to be {lat: number, lng: number, geohash: string}.
            const resultLocation = getFieldValue(result, fieldPath);

            const distance = getDistance(location, resultLocation); // in meters
            return distance <= radius;
          });

          debug(`Bounds [${b}]: ${results.map((r) => r["name"] ?? r.id)}`);

          // Update the results in our result map. We're trapped in a closure
          // so we need to update the existing map in the set callback.
          setResultMap((oldMap) => {
            const updatedMap = new Map(oldMap ?? []);
            updatedMap.set(b.join("-"), results);
            return updatedMap;
          });
        };

        const unsubscribe = subQuery.onSnapshot(
          // Really important - we want to be called back for critical changes
          // like "this data is now from the server instead of from cache"
          // even if the data hasn't changed, so we can actually display it.
          { includeMetadataChanges: true },
          snapshotHandler,
        );

        unsubscribes.push(unsubscribe);
      }

      return () => {
        debug(`Unsubcribing from ${JSON.stringify(bounds)}`);
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    } else if (!q) {
      // You returned a falsy value. Check if you actually returned null,
      // because that would really mean "doesn't exist".
      setResultMap(q === null ? new Map() : undefined);
    }
  }, [...deps, location, radius, fieldPath]);

  if (!resultMap) {
    // Still loading.
    return undefined;
  }

  // Return the current set of results, deduplicating as we go (since the same
  // object can exist in multiple bounds).
  const results: T[] = [];

  for (const r of resultMap.values()) {
    if (r === undefined) {
      // Actually, we're still waiting on a query! We don't want to return the
      // results of only some queries.
      return undefined;
    }

    for (const result of r) {
      if (!results.some((r) => r.id === result.id)) {
        results.push(result);
      }
    }
  }

  return results;
}
