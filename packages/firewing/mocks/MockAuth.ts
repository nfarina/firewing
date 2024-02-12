import { EventEmitter } from "crosswing/shared/events";

// Important that we only import types, or else we couldn't use this in Node.
import type { NextOrObserver, Unsubscribe, User } from "firebase/auth";

export class MockAuth extends EventEmitter<{
  authStateChange: NextOrObserver<User>;
}> {
  private mocked: MockedAuth;

  constructor(mocked?: MockedAuth) {
    super();
    this.mocked = mocked || {};
  }

  public onAuthStateChanged(listener: NextOrObserver<User>): Unsubscribe {
    this.on("authStateChange", listener);

    setTimeout(() => {
      const { uid, email } = this.mocked;
      const user = { uid, email } as User;
      this.emit("authStateChange", user);
    }, 0);

    return () => this.off("authStateChange", listener);
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
}

export interface MockedAuth {
  uid?: string;
  email?: string;
}
