import { FirebaseApp } from "firebase/app";

// Careful to import types only! See note in FirebaseAppProvider.tsx.
import { WrappedAuth } from "./WrappedAuth.js";
import type { WrappedFirestore } from "./WrappedFirestore.js";
import { WrappedFunctions } from "./WrappedFunctions.js";
import { WrappedStorage } from "./WrappedStorage.js";

export class WrappedFirebaseApp {
  private _auth: WrappedAuth | null = null;
  private _firestore: WrappedFirestore | null = null;
  private _functions: WrappedFunctions | null = null;
  private _storage: WrappedStorage | null = null;

  constructor(
    private readonly app: FirebaseApp,
    {
      auth = null,
      firestore = null,
      functions = null,
      storage = null,
    }: {
      auth?: WrappedAuth | null;
      firestore?: WrappedFirestore | null;
      functions?: WrappedFunctions | null;
      storage?: WrappedStorage | null;
    },
  ) {
    this.setAuth(auth);
    this.setFirestore(firestore);
    this.setFunctions(functions);
    this.setStorage(storage);
  }

  public setAuth(auth: WrappedAuth | null) {
    this._auth = auth;
  }

  public auth(): WrappedAuth {
    if (!this._auth) {
      throw new Error("Auth is not enabled for this app.");
    }

    return this._auth;
  }

  public setFirestore(firestore: WrappedFirestore | null) {
    this._firestore = firestore;
  }

  public firestore(): WrappedFirestore {
    if (!this._firestore) {
      throw new Error("Firestore is not enabled for this app.");
    }

    return this._firestore;
  }

  public setFunctions(functions: WrappedFunctions | null) {
    this._functions = functions;
  }

  public functions(): WrappedFunctions {
    if (!this._functions) {
      throw new Error("Functions are not enabled for this app.");
    }

    return this._functions;
  }

  public setStorage(storage: WrappedStorage | null) {
    this._storage = storage;
  }

  public storage(): WrappedStorage {
    if (!this._storage) {
      throw new Error("Storage is not enabled for this app.");
    }

    return this._storage;
  }
}
