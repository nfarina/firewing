import { EventEmitter } from "crosswing/shared/events";
import firebase from "firebase/compat/app";

export type AuthStateChangeListener = (user: firebase.User | null) => any;
export type AuthUnsubscribe = () => void;

export class MockAuth extends EventEmitter<{
  authStateChange: AuthStateChangeListener;
}> {
  private mocked: MockedAuth;

  constructor(mocked?: MockedAuth) {
    super();
    this.mocked = mocked || {};
  }

  public onAuthStateChanged(
    listener: AuthStateChangeListener,
  ): AuthUnsubscribe {
    this.on("authStateChange", listener);

    setTimeout(() => {
      const { uid, email } = this.mocked;
      const user = { uid, email } as firebase.User;
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
