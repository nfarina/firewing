import { afterEach, beforeEach, expect, test } from "bun:test";
import { FirestoreHelper } from "./FirestoreHelper";
import { firestore } from "./app";
import {
  getFirebaseChanges,
  mockFirebase,
  restoreFirebase,
} from "./mockfirebase";

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
  expect(await getFirebaseChanges()).toMatchObject({
    firestore: {
      messages: {
        message1: {
          text: "Hello, MockFirestore!",
        },
      },
    },
  });
});
