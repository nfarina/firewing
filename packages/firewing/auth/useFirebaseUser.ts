import { User } from "firebase/auth";
import { use, useEffect, useState } from "react";
import { FirebaseAppContext } from "../FirebaseAppProvider.js";

export function useFirebaseUser(): User | null | undefined {
  const app = use(FirebaseAppContext);

  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(
    undefined,
  );

  useEffect(() => {
    return app().auth().onAuthStateChanged(setFirebaseUser);
  }, []);

  return firebaseUser;
}
