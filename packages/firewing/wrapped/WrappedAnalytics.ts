import {
  Analytics,
  logEvent,
  setUserId,
  setUserProperties,
} from "firebase/analytics";

export class WrappedAnalytics {
  constructor(private readonly analytics: Analytics | null) {}

  private log(message: string, ...args: any[]): void {
    if (this.analytics) {
      console.debug("[Analytics] " + message, ...args);
    } else {
      console.debug("[Analytics disabled] " + message, ...args);
    }
  }

  public logEvent(eventName: string, eventParams?: Record<string, any>): void {
    this.log("logEvent", eventName, eventParams);
    if (this.analytics) {
      logEvent(this.analytics, eventName, eventParams);
    }
  }

  public setUserId(id: string | null): void {
    this.log("setUserId", id);
    if (this.analytics) {
      setUserId(this.analytics, id);
    }
  }

  public setUserProperties(properties: Record<string, any>): void {
    this.log("setUserProperties", properties);
    if (this.analytics) {
      setUserProperties(this.analytics, properties);
    }
  }
}
