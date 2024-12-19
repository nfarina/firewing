import { afterEach, beforeEach, expect, test } from "vitest";
import { MockFirebaseData } from "../mocks/types.js";
import { FirestoreHelper } from "./FirestoreHelper.js";
import { firestore } from "./app.js";
import {
  getFirebaseChanges,
  mockFirebase,
  restoreFirebase,
} from "./mockfirebase.js";

beforeEach(async () => {
  mockFirebase();
});

afterEach(async () => {
  restoreFirebase();
});

test("using memory-based firestore", async () => {
  // Set some data.
  await FirestoreHelper.create(null, firestore().collection("messages"), {
    text: "Hello, MockFirestore!",
  });

  // Ensure our data is in the shape we want.
  expect(await getFirebaseChanges<MockFirebaseData>()).toEqual({
    firestore: {
      messages: {
        message1: {
          text: "Hello, MockFirestore!",
        },
      },
      mutexLocks: {
        "getAutoId:messages": "<deleted>",
      },
    },
  });
});
