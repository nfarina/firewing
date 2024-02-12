import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useFirebaseApp } from "../FirebaseAppProvider.js";

export function useFirebaseUser(): User | null | undefined {
  const app = useFirebaseApp();

  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(
    undefined,
  );

  useEffect(() => {
    return app().auth().onAuthStateChanged(setFirebaseUser);
  }, []);

  return firebaseUser;
}
