import { Functions, HttpsCallable, httpsCallable } from "firebase/functions";

export class WrappedFunctions {
  constructor(private readonly functions: Functions) {}

  public httpsCallable(name: string): HttpsCallable {
    return httpsCallable(this.functions, name);
  }
}
