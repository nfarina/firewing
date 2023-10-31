/**
 * Encapsulates all data needed to populate a mock Firebase instance with enough
 * data to render a Storybook story, or run a Vitest test, or populate the
 * dev server with fixtures for local development.
 */
export interface MockFirebaseData {
  auth?: MockAuthData;
  firestore?: MockFirestoreData;
  storage?: MockStorageData;
  messages?: MockMessagesData;
}

// Auth

export type MockAuthData = Record<string, MockAuthUser>;

export interface MockAuthUser {
  phone?: string;
  email?: string;
}

// Firestore

export type MockFirestoreData = Record<
  string,
  MockFirestoreCollection | undefined
>;

export type MockFirestoreCollection = Record<string, MockFirestoreDocument>;
export type MockFirestoreDocument = any;

// Storage

export type MockStorageData = Record<string, MockStoragePrefix>;

export type MockStoragePrefix = Record<string, MockStorageFile>;

export interface MockStorageFile {
  /** Path on disk to this file. Must have a file extension. */
  path: string;
  contentType?: string;
}

// Messages

export type MockMessagesData = any[];
