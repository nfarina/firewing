import {
  Auth,
  AuthProvider,
  NextOrObserver,
  PopupRedirectResolver,
  Unsubscribe,
  User,
  UserCredential,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export class WrappedAuth {
  constructor(private readonly auth: Auth) {}

  public get currentUser(): User | null {
    return this.auth.currentUser;
  }

  public onAuthStateChanged(listener: NextOrObserver<User>): Unsubscribe {
    // We only support one overload of this method.
    return onAuthStateChanged(this.auth, listener);
  }

  public isSignInWithEmailLink(emailLink: string): boolean {
    return isSignInWithEmailLink(this.auth, emailLink);
  }

  public signInWithCustomToken(token: string): Promise<UserCredential> {
    return signInWithCustomToken(this.auth, token);
  }

  public signInWithPopup(
    provider: AuthProvider,
    resolver?: PopupRedirectResolver,
  ): Promise<UserCredential> {
    return signInWithPopup(this.auth, provider, resolver);
  }

  public signOut(): Promise<void> {
    return signOut(this.auth);
  }
}
