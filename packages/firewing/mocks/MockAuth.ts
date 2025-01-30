import { EventEmitter } from "crosswing/shared/events";

// Important that we only import types, or else we couldn't use this in Node.
import type { NextOrObserver, Unsubscribe, User } from "firebase/auth";

export type MockAuthEvents = {
  authStateChange: (user: MockedAuth | null, initial?: boolean) => void;
};

export type MockedAuth = {
  uid: string;
  email: string;
};

export class MockAuth extends EventEmitter<MockAuthEvents> {
  public user: MockedAuth | null;

  constructor(user?: MockedAuth | null) {
    super();
    this.user = user ?? null;
  }

  public onAuthStateChanged(listener: NextOrObserver<User>): Unsubscribe {
    // Use our own event emitter to implement this firebase-expected method.
    function handler(user: MockedAuth | null) {
      if (typeof listener === "function") {
        listener(user as User);
      }
    }

    this.on("authStateChange", handler);

    setTimeout(() => {
      this.emit("authStateChange", this.user, true);
    }, 0);

    return () => this.off("authStateChange", handler);
  }

  public isSignInWithEmailLink(emailLink: string): boolean {
    return false;
  }

  public revokeRefreshTokens(userId: string) {
    // Not implemented.
  }

  public signInWithCustomToken(token: string) {
    // Not implemented.
  }

  public signIn(user: MockedAuth) {
    this.user = user;
    this.emit("authStateChange", user);
  }

  public signOut() {
    this.user = null;
    this.emit("authStateChange", null);
  }
}
