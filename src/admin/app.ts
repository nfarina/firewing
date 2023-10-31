import { isRunningUnderTest } from "cyber/shared/env";
import { App, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { Messaging, getMessaging } from "firebase-admin/messaging";
import { Storage, getStorage } from "firebase-admin/storage";

// Helper to access the cloud functions version of our Firebase services.
// We need to bundle up Firebase's services into our own single object so
// we can more easily cache and mock it.
export type FirebaseHelperServices = {
  app: () => App;
  // Optional overrides for the default Firebase services. If not defined,
  // we will call getAuth() etc. when needed. This is to help with tree-shaking
  // out services you don't use.
  auth?: () => Auth;
  firestore?: () => Firestore;
  storage?: () => Storage;
  messaging?: () => Messaging;
};

// Initialized on first use.
let cachedServices: FirebaseHelperServices | null = null;

// Manually set when you wish to use global mocks; will always be returned
// by our exported methods when defined.
let mockServices: FirebaseHelperServices | null = null;

export function setMockFirebaseServices(mock: FirebaseHelperServices | null) {
  mockServices = mock;
}

export function firebaseServices(): FirebaseHelperServices {
  if (mockServices) return mockServices;

  if (isRunningUnderTest()) {
    throw new Error(`Firebase was not mocked!`);
  }

  if (cachedServices === null) {
    // This automagically authenticates when hosted by Cloud Functions or
    // its emulation server. When run locally, it checks the
    // GOOGLE_APPLICATION_CREDENTIALS environment variable to see if there
    // is a local private key for a service account that can be used for
    // things like creating custom login tokens.
    const app = initializeApp();
    cachedServices = { app: () => app };
  }

  return cachedServices;
}

// A bunch of global functions that make it easier to access our Firebase
// services. These are all just wrappers around firebaseServices().

export function app(): App {
  return firebaseServices().app();
}

export function firestore(): Firestore {
  const { app, firestore } = firebaseServices();
  return firestore?.() ?? getFirestore(app());
}

export function auth(): Auth {
  const { app, auth } = firebaseServices();
  return auth?.() ?? getAuth(app());
}

export function storage(): Storage {
  const { app, storage } = firebaseServices();
  return storage?.() ?? getStorage(app());
}

export function messaging(): Messaging {
  const { app, messaging } = firebaseServices();
  return messaging?.() ?? getMessaging(app());
}
